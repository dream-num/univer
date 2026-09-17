import {
  UniverSheetsFilterPlugin
} from "../chunk-ESCGSVMK.js";
import {
  zh_CN_default
} from "../chunk-QRLMZA6Y.js";
import {
  UniverRemoteSheetsFormulaPlugin
} from "../chunk-YVPSS3XX.js";
import {
  UniverFormulaEnginePlugin,
  UniverRPCWorkerThreadPlugin,
  UniverSheetsPlugin
} from "../chunk-Q6Y4PHRI.js";
import "../chunk-XOCU2XR6.js";
import {
  Univer
} from "../chunk-EJSPXROI.js";
import "../chunk-EQ2B2W73.js";
import "../chunk-24OICD5T.js";

// src/sheets/worker.ts
var univer = new Univer({
  locale: "zhCN" /* ZH_CN */,
  logLevel: 4 /* VERBOSE */,
  locales: {
    ["zhCN" /* ZH_CN */]: zh_CN_default
  }
});
univer.registerPlugins([
  [UniverSheetsPlugin, { onlyRegisterFormulaRelatedMutations: true }],
  [UniverFormulaEnginePlugin],
  [UniverRPCWorkerThreadPlugin],
  [UniverRemoteSheetsFormulaPlugin],
  [UniverSheetsFilterPlugin]
]);
self.univer = univer;
