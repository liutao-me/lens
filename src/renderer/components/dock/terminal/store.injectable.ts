/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { TerminalStore } from "./store";
import createTerminalInjectable from "./create-terminal.injectable";

const terminalStoreInjectable = getInjectable({
  id: "terminal-store",

  instantiate: (di) => new TerminalStore({
    createTerminal: di.inject(createTerminalInjectable),
  }),
});

export default terminalStoreInjectable;
