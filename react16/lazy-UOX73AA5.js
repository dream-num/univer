import {
  UniverSheetsDrawingUIPlugin
} from "./chunk-FXH7NPJ2.js";
import {
  UniverSheetsConditionalFormattingUIPlugin,
  UniverSheetsDataValidationUIPlugin,
  UniverSheetsFilterUIPlugin
} from "./chunk-QZPOCNAB.js";
import "./chunk-VEA4DFFB.js";
import "./chunk-ESCGSVMK.js";
import "./chunk-DMIB6PSO.js";
import "./chunk-LZWJIT7W.js";
import "./chunk-BHQGV2VJ.js";
import "./chunk-7ZOWWEOA.js";
import "./chunk-VNXQUZSG.js";
import "./chunk-YVPSS3XX.js";
import "./chunk-Q6Y4PHRI.js";
import "./chunk-XOCU2XR6.js";
import "./chunk-EJSPXROI.js";
import "./chunk-EQ2B2W73.js";
import "./chunk-24OICD5T.js";

// src/sheets-multi-units/lazy.ts
function getLazyPlugins() {
  return [
    [UniverSheetsDataValidationUIPlugin],
    [UniverSheetsConditionalFormattingUIPlugin],
    [UniverSheetsFilterUIPlugin, { useRemoteFilterValuesGenerator: false }],
    [UniverSheetsDrawingUIPlugin]
  ];
}
export {
  getLazyPlugins as default
};
