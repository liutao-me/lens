/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import catalogCatalogEntityInjectable from "./catalog-entities/general-catalog-entities/implementations/catalog-catalog-entity.injectable";
import { HotbarStore } from "./hotbar-store";

const hotbarStoreInjectable = getInjectable({
  id: "hotbar-store",

  instantiate: (di) => {
    HotbarStore.resetInstance();

    return HotbarStore.createInstance({
      catalogCatalogEntity: di.inject(catalogCatalogEntityInjectable),
    });
  },

  causesSideEffects: true,
});

export default hotbarStoreInjectable;
