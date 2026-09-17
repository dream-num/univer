import {
  UniverUniscriptPlugin
} from "../chunk-XN7ND3AL.js";
import "../chunk-GCGI23F5.js";
import "../chunk-CQY74AWC.js";
import "../chunk-CLMLYKFF.js";
import "../chunk-2WA7JL2E.js";
import {
  UniverSheetsUIPlugin
} from "../chunk-BHQGV2VJ.js";
import {
  DEFAULT_DOCUMENT_DATA_CN
} from "../chunk-VEBN3ADF.js";
import {
  UniverDocsPlugin,
  UniverDocsUIPlugin
} from "../chunk-7ZOWWEOA.js";
import "../chunk-LI6UXASZ.js";
import {
  UniverUIPlugin
} from "../chunk-VNXQUZSG.js";
import {
  zh_CN_default
} from "../chunk-QRLMZA6Y.js";
import "../chunk-YVPSS3XX.js";
import {
  UniverFormulaEnginePlugin,
  UniverSheetsPlugin
} from "../chunk-Q6Y4PHRI.js";
import {
  UniverRenderEnginePlugin
} from "../chunk-XOCU2XR6.js";
import {
  Univer
} from "../chunk-EJSPXROI.js";
import "../chunk-EQ2B2W73.js";
import "../chunk-24OICD5T.js";

// src/docs-uniscript/main.ts
var univer = new Univer({
  locale: "zhCN" /* ZH_CN */,
  locales: {
    ["zhCN" /* ZH_CN */]: zh_CN_default
  },
  logLevel: 4 /* VERBOSE */
});
univer.registerPlugin(UniverRenderEnginePlugin);
univer.registerPlugin(UniverFormulaEnginePlugin);
univer.registerPlugin(UniverUIPlugin, {
  container: "app",
  ribbonType: "classic",
  footer: false
});
univer.registerPlugin(UniverDocsPlugin);
univer.registerPlugin(UniverDocsUIPlugin);
univer.registerPlugin(UniverSheetsPlugin);
univer.registerPlugin(UniverSheetsUIPlugin);
univer.registerPlugin(UniverUniscriptPlugin, {
  getWorkerUrl(moduleID, label) {
    if (label === "typescript" || label === "javascript") {
      return "/vs/language/typescript/ts.worker.js";
    }
    return "/vs/editor/editor.worker.js";
  }
});
univer.createUnit(1 /* UNIVER_DOC */, DEFAULT_DOCUMENT_DATA_CN);
window.univer = univer;
