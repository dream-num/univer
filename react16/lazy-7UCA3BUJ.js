import {
  UniverSheetsThreadCommentUIPlugin
} from "./chunk-RS7WUHOJ.js";
import {
  UniverSheetsNoteUIPlugin,
  UniverSheetsTableUIPlugin
} from "./chunk-IMLGZZ4M.js";
import {
  UniverDocsMentionUIPlugin
} from "./chunk-YCGC2XFC.js";
import {
  UniverThreadCommentUIPlugin
} from "./chunk-3WOCRIC2.js";
import "./chunk-NJGSTZSU.js";
import "./chunk-SPJ3J4VO.js";
import "./chunk-7OGYBNIL.js";
import "./chunk-CER5CEC6.js";
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
import {
  UniverSheetsNumfmtUIPlugin
} from "./chunk-UFFVGXSC.js";
import {
  UniverSheetsFormulaUIPlugin
} from "./chunk-DMIB6PSO.js";
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

// src/sheets/lazy.ts
function getLazyPlugins() {
  return [
    [UniverDocsMentionUIPlugin],
    [UniverSheetsNumfmtUIPlugin],
    [UniverThreadCommentUIPlugin],
    [UniverSheetsThreadCommentUIPlugin],
    [UniverSheetsNoteUIPlugin],
    [UniverSheetsTableUIPlugin],
    [UniverSheetsFormulaUIPlugin],
    [UniverSheetsDataValidationUIPlugin],
    [UniverSheetsConditionalFormattingUIPlugin],
    [UniverSheetsFilterUIPlugin, { useRemoteFilterValuesGenerator: false }],
    [UniverSheetsDrawingUIPlugin]
  ];
}
export {
  getLazyPlugins as default
};
