/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const electronVersionInjectable = getInjectable({
  id: "electron-version",
  instantiate: () => process.versions.electron,
  causesSideEffects: true,
});

export default electronVersionInjectable;
