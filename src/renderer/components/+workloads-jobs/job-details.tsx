/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./job-details.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import { PodDetailsStatuses } from "../+workloads-pods/pod-details-statuses";
import { Link } from "react-router-dom";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import { podsStore } from "../+workloads-pods/pods.store";
import { jobStore } from "./job.store";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { getMetricsForJobs, type IPodMetrics, Job } from "../../../common/k8s-api/endpoints";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { KubeObjectMeta } from "../kube-object-meta";
import { makeObservable, observable, reaction } from "mobx";
import { podMetricTabs, PodCharts } from "../+workloads-pods/pod-charts";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import { getActiveClusterEntity } from "../../api/catalog-entity-registry";
import { ResourceMetrics } from "../resource-metrics";
import { getDetailsUrl } from "../kube-detail-params";
import { apiManager } from "../../../common/k8s-api/api-manager";
import logger from "../../../common/logger";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import type { Disposer } from "../../../common/utils";
import { withInjectables } from "@ogre-tools/injectable-react";
import kubeWatchApiInjectable
  from "../../kube-watch-api/kube-watch-api.injectable";

export interface JobDetailsProps extends KubeObjectDetailsProps<Job> {
}

interface Dependencies {
  subscribeStores: (stores: KubeObjectStore<KubeObject>[]) => Disposer;
}

@observer
class NonInjectedJobDetails extends React.Component<JobDetailsProps & Dependencies> {
  @observable metrics: IPodMetrics = null;

  constructor(props: JobDetailsProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.object, () => {
        this.metrics = null;
      }),
      this.props.subscribeStores([
        podsStore,
      ]),
    ]);
  }

  loadMetrics = async () => {
    const { object: job } = this.props;

    this.metrics = await getMetricsForJobs([job], job.getNs(), "");
  };

  render() {
    const { object: job } = this.props;

    if (!job) {
      return null;
    }

    if (!(job instanceof Job)) {
      logger.error("[JobDetails]: passed object that is not an instanceof Job", job);

      return null;
    }

    const selectors = job.getSelectors();
    const nodeSelector = job.getNodeSelectors();
    const images = job.getImages();
    const childPods = jobStore.getChildPods(job);
    const ownerRefs = job.getOwnerRefs();
    const condition = job.getCondition();
    const isMetricHidden = getActiveClusterEntity()?.isMetricHidden(ClusterMetricsResourceType.Job);

    return (
      <div className="JobDetails">
        {!isMetricHidden && (
          <ResourceMetrics
            loader={this.loadMetrics}
            tabs={podMetricTabs} object={job} params={{ metrics: this.metrics }}
          >
            <PodCharts />
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={job}/>
        <DrawerItem name="Selector" labelsOnly>
          {
            Object.keys(selectors).map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
        {nodeSelector.length > 0 &&
        <DrawerItem name="Node Selector" labelsOnly>
          {
            nodeSelector.map(label => (
              <Badge key={label} label={label}/>
            ))
          }
        </DrawerItem>
        }
        {images.length > 0 &&
        <DrawerItem name="Images">
          {
            images.map(image => <p key={image}>{image}</p>)
          }
        </DrawerItem>
        }
        {ownerRefs.length > 0 &&
        <DrawerItem name="Controlled by">
          {
            ownerRefs.map(ref => {
              const { name, kind } = ref;
              const detailsUrl = getDetailsUrl(apiManager.lookupApiLink(ref, job));

              return (
                <p key={name}>
                  {kind} <Link to={detailsUrl}>{name}</Link>
                </p>
              );
            })
          }
        </DrawerItem>
        }
        <DrawerItem name="Conditions" className="conditions" labelsOnly>
          {condition && (
            <Badge
              className={kebabCase(condition.type)}
              label={condition.type}
              tooltip={condition.message}
            />
          )}
        </DrawerItem>
        <DrawerItem name="Completions">
          {job.getDesiredCompletions()}
        </DrawerItem>
        <DrawerItem name="Parallelism">
          {job.getParallelism()}
        </DrawerItem>
        <PodDetailsTolerations workload={job}/>
        <PodDetailsAffinities workload={job}/>
        <DrawerItem name="Pod Status" className="pod-status">
          <PodDetailsStatuses pods={childPods}/>
        </DrawerItem>
        <PodDetailsList pods={childPods} owner={job}/>
      </div>
    );
  }
}

export const JobDetails = withInjectables<Dependencies, JobDetailsProps>(
  NonInjectedJobDetails,

  {
    getProps: (di, props) => ({
      subscribeStores: di.inject(kubeWatchApiInjectable).subscribeStores,
      ...props,
    }),
  },
);

