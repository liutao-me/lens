/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ClusterFrameContext } from "./cluster-frame-context";
import namespaceStoreInjectable from "../components/+namespaces/namespace-store/namespace-store.injectable";
import hostedClusterInjectable from "../../common/cluster-store/hosted-cluster.injectable";

const clusterFrameContextInjectable = getInjectable({
  id: "cluster-frame-context",

  instantiate: (di) => {
    const cluster = di.inject(hostedClusterInjectable);

    return new ClusterFrameContext(
      cluster,

      {
        namespaceStore: di.inject(namespaceStoreInjectable),
      },
    );
  },
});

export default clusterFrameContextInjectable;
