/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observable } from "mobx";
import { daemonSetStore } from "../+workloads-daemonsets/daemonsets.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { DaemonSet, Pod } from "../../../common/k8s-api/endpoints";

const runningDaemonSet = new DaemonSet({
  apiVersion: "foo",
  kind: "DaemonSet",
  metadata: {
    name: "runningDaemonSet",
    resourceVersion: "runningDaemonSet",
    uid: "runningDaemonSet",
    namespace: "default",
  },
});

const failedDaemonSet = new DaemonSet({
  apiVersion: "foo",
  kind: "DaemonSet",
  metadata: {
    name: "failedDaemonSet",
    resourceVersion: "failedDaemonSet",
    uid: "failedDaemonSet",
    namespace: "default",
  },
});

const pendingDaemonSet = new DaemonSet({
  apiVersion: "foo",
  kind: "DaemonSet",
  metadata: {
    name: "pendingDaemonSet",
    resourceVersion: "pendingDaemonSet",
    uid: "pendingDaemonSet",
    namespace: "default",
  },
});

const runningPod = new Pod({
  apiVersion: "foo",
  kind: "Pod",
  metadata: {
    name: "foobar",
    resourceVersion: "foobar",
    uid: "foobar",
    ownerReferences: [{
      uid: "runningDaemonSet",
    }],
    namespace: "default",
  },
});

runningPod.status = {
  phase: "Running",
  conditions: [
    {
      type: "Initialized",
      status: "True",
      lastProbeTime: 1,
      lastTransitionTime: "1",
    },
    {
      type: "Ready",
      status: "True",
      lastProbeTime: 1,
      lastTransitionTime: "1",
    },
  ],
  hostIP: "10.0.0.1",
  podIP: "10.0.0.1",
  startTime: "now",
  containerStatuses: [],
  initContainerStatuses: [],
};

const pendingPod = new Pod({
  apiVersion: "foo",
  kind: "Pod",
  metadata: {
    name: "foobar-pending",
    resourceVersion: "foobar",
    uid: "foobar-pending",
    ownerReferences: [{
      uid: "pendingDaemonSet",
    }],
    namespace: "default",
  },
});

const failedPod = new Pod({
  apiVersion: "foo",
  kind: "Pod",
  metadata: {
    name: "foobar-failed",
    resourceVersion: "foobar",
    uid: "foobar-failed",
    ownerReferences: [{
      uid: "failedDaemonSet",
    }],
    namespace: "default",
  },
});

failedPod.status = {
  phase: "Failed",
  conditions: [],
  hostIP: "10.0.0.1",
  podIP: "10.0.0.1",
  startTime: "now",
};

describe("DaemonSet Store tests", () => {
  beforeAll(() => {
    podsStore.items = observable.array([
      runningPod,
      failedPod,
      pendingPod,
    ]);
  });

  it("gets DaemonSet statuses in proper sorting order", () => {
    const statuses = Object.entries(daemonSetStore.getStatuses([
      failedDaemonSet,
      runningDaemonSet,
      pendingDaemonSet,
    ]));

    expect(statuses).toEqual([
      ["running", 1],
      ["failed", 1],
      ["pending", 1],
    ]);
  });

  it("returns 0 for other statuses", () => {
    let statuses = Object.entries(daemonSetStore.getStatuses([runningDaemonSet]));

    expect(statuses).toEqual([
      ["running", 1],
      ["failed", 0],
      ["pending", 0],
    ]);

    statuses = Object.entries(daemonSetStore.getStatuses([failedDaemonSet]));

    expect(statuses).toEqual([
      ["running", 0],
      ["failed", 1],
      ["pending", 0],
    ]);

    statuses = Object.entries(daemonSetStore.getStatuses([pendingDaemonSet]));

    expect(statuses).toEqual([
      ["running", 0],
      ["failed", 0],
      ["pending", 1],
    ]);
  });
});
