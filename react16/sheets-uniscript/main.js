import {
  UniverUniscriptPlugin
} from "../chunk-XN7ND3AL.js";
import "../chunk-GCGI23F5.js";
import "../chunk-CQY74AWC.js";
import "../chunk-CLMLYKFF.js";
import {
  UniverDebuggerPlugin
} from "../chunk-3ZF3VDGH.js";
import "../chunk-FRWZDCQD.js";
import "../chunk-FXH7NPJ2.js";
import "../chunk-2WA7JL2E.js";
import {
  UniverSheetsNumfmtUIPlugin
} from "../chunk-UFFVGXSC.js";
import {
  UniverSheetsNumfmtPlugin
} from "../chunk-LZWJIT7W.js";
import {
  UniverSheetsUIPlugin
} from "../chunk-BHQGV2VJ.js";
import {
  UNISCRIT_WORKBOOK_DATA_DEMO
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
import {
  UniverSheetsFormulaPlugin
} from "../chunk-YVPSS3XX.js";
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

// src/sheets-uniscript/main.ts
var IS_E2E = false;
var univer = new Univer({
  locale: "zhCN" /* ZH_CN */,
  locales: {
    ["zhCN" /* ZH_CN */]: zh_CN_default
  },
  logLevel: 4 /* VERBOSE */
});
univer.registerPlugin(UniverRenderEnginePlugin);
univer.registerPlugin(UniverUIPlugin, {
  container: "app",
  ribbonType: "classic"
});
univer.registerPlugin(UniverDocsPlugin);
univer.registerPlugin(UniverDocsUIPlugin);
univer.registerPlugin(UniverSheetsPlugin);
univer.registerPlugin(UniverSheetsUIPlugin);
univer.registerPlugin(UniverSheetsNumfmtPlugin);
univer.registerPlugin(UniverSheetsNumfmtUIPlugin);
univer.registerPlugin(UniverFormulaEnginePlugin);
univer.registerPlugin(UniverSheetsFormulaPlugin);
univer.registerPlugin(UniverUniscriptPlugin, {
  getWorkerUrl(_, label) {
    if (label === "typescript" || label === "javascript") {
      return "/vs/language/typescript/ts.worker.js";
    }
    return "/vs/editor/editor.worker.js";
  }
});
if (IS_E2E) {
  univer.registerPlugin(UniverDebuggerPlugin, {
    fab: false,
    performanceMonitor: {
      enabled: false
    }
  });
}
univer.createUnit(2 /* UNIVER_SHEET */, UNISCRIT_WORKBOOK_DATA_DEMO);
window.univer = univer;
