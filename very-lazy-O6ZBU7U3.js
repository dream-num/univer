import {
  UniverActionRecorderPlugin
} from "./chunk-5KMQC3MD.js";
import {
  UniverSheetsFindReplacePlugin
} from "./chunk-A6JH6MFK.js";
import {
  UniverSheetsSortUIPlugin
} from "./chunk-HI54EUIE.js";
import {
  UniverUniscriptPlugin
} from "./chunk-XN7ND3AL.js";
import "./chunk-GCGI23F5.js";
import "./chunk-CQY74AWC.js";
import "./chunk-CLMLYKFF.js";
import {
  UniverSheetsCrosshairHighlightPlugin
} from "./chunk-PRZ2MIYX.js";
import {
  UniverSheetsHyperLinkUIPlugin
} from "./chunk-BBGQPEWJ.js";
import "./chunk-7OGYBNIL.js";
import {
  UniverDebuggerPlugin
} from "./chunk-ENSBVZ6N.js";
import {
  UniverWatermarkPlugin
} from "./chunk-FRWZDCQD.js";
import "./chunk-FXH7NPJ2.js";
import "./chunk-2WA7JL2E.js";
import "./chunk-ESCGSVMK.js";
import "./chunk-DMIB6PSO.js";
import "./chunk-BHQGV2VJ.js";
import "./chunk-VEBN3ADF.js";
import "./chunk-7ZOWWEOA.js";
import "./chunk-VNXQUZSG.js";
import "./chunk-YVPSS3XX.js";
import "./chunk-Q6Y4PHRI.js";
import "./chunk-XOCU2XR6.js";
import "./chunk-EJSPXROI.js";
import "./chunk-EQ2B2W73.js";
import "./chunk-24OICD5T.js";

// src/sheets-no-worker/very-lazy.ts
var IS_E2E = false;
function getVeryLazyPlugins() {
  const plugins = [
    [UniverActionRecorderPlugin],
    [UniverSheetsHyperLinkUIPlugin],
    [UniverSheetsSortUIPlugin],
    [UniverSheetsCrosshairHighlightPlugin],
    [UniverSheetsFindReplacePlugin],
    [UniverWatermarkPlugin]
  ];
  if (!IS_E2E) {
    plugins.push([UniverDebuggerPlugin]);
    plugins.push([UniverUniscriptPlugin, {
      getWorkerUrl(_, label) {
        if (label === "json") {
          return "/vs/language/json/json.worker.js";
        }
        if (label === "css" || label === "scss" || label === "less") {
          return "/vs/language/css/css.worker.js";
        }
        if (label === "html" || label === "handlebars" || label === "razor") {
          return "/vs/language/html/html.worker.js";
        }
        if (label === "typescript" || label === "javascript") {
          return "/vs/language/typescript/ts.worker.js";
        }
        return "/vs/editor/editor.worker.js";
      }
    }]);
  }
  return plugins;
}
export {
  getVeryLazyPlugins as default
};
