/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export { getEditorObject } from './basics/editor/get-editor-object';
export { SHEET_VIEWPORT_KEY as VIEWPORT_KEY } from './common/keys';
export { SHEET_VIEW_KEY } from './common/keys';
export { FONT_FAMILY_COMPONENT, FONT_FAMILY_ITEM_COMPONENT } from './components/font-family/interface';
export { FONT_SIZE_COMPONENT } from './components/font-size/interface';
export { useActiveWorkbook, useActiveWorksheet, useWorkbooks } from './components/hook';
export { SHEET_UI_PLUGIN_NAME } from './consts/plugin-name';
export { SheetsUIPart } from './consts/ui-name';
export { AutoFillController } from './controllers/auto-fill.controller';
export { AFFECT_LAYOUT_STYLES, AutoHeightController } from './controllers/auto-height.controller';
export { CellCustomRenderController } from './controllers/cell-custom-render.controller';
export { DragRenderController } from './controllers/drag-render.controller';
export { FormulaEditorController } from './controllers/editor/formula-editor.controller';
export { HoverRenderController } from './controllers/hover-render.controller';
export { menuSchema } from './controllers/menu.schema';
export { PASTE_SPECIAL_MENU_ID } from './controllers/menu/menu';
export { SheetMenuPosition } from './controllers/menu/menu';
export { deriveStateFromActiveSheet$, getCurrentExclusiveRangeInterest$, getCurrentRangeDisable$, getObservableWithExclusiveRange$ } from './controllers/menu/menu-util';
export { SheetPermissionInitController } from './controllers/permission/sheet-permission-init.controller';
export { SheetPermissionInterceptorBaseController } from './controllers/permission/sheet-permission-interceptor-base.controller';
export { HeaderFreezeRenderController } from './controllers/render-controllers/freeze.render-controller';
export { HeaderMoveRenderController } from './controllers/render-controllers/header-move.render-controller';
export { HeaderResizeRenderController } from './controllers/render-controllers/header-resize.render-controller';
export { SheetsScrollRenderController } from './controllers/render-controllers/scroll.render-controller';
export { SheetRenderController } from './controllers/render-controllers/sheet.render-controller';
export { SheetUIController } from './controllers/sheet-ui.controller';
export { whenFormulaEditorActivated } from './controllers/shortcuts/utils';
export { whenSheetEditorFocused } from './controllers/shortcuts/utils';
export { StatusBarController } from './controllers/status-bar.controller';
export {
    getCoordByCell,
    getCoordByOffset,
    getSheetObject,
    getTransformCoord,
} from './controllers/utils/component-tools';
export type { IDiscreteRange } from './controllers/utils/range-tools';
export { rangeToDiscreteRange, virtualizeDiscreteRanges } from './controllers/utils/range-tools';
export { matchedSelectionByRowColIndex as checkInHeaderRanges } from './controllers/utils/selections-tools';
export { useHighlightRange } from './hooks/useHighlightRange';
export { UniverSheetsMobileUIPlugin } from './mobile-sheets-ui-plugin';
export { AutoFillService, IAutoFillService } from './services/auto-fill/auto-fill.service';
export { getAutoFillRepeatRange } from './services/auto-fill/tools';
export type { ICopyDataPiece, ISheetAutoFillHook } from './services/auto-fill/type';
export { APPLY_TYPE, DATA_TYPE, type IAutoFillRule } from './services/auto-fill/type';
export { type ICopyDataInTypeIndexInfo } from './services/auto-fill/type';

export type { IAutoFillLocation } from './services/auto-fill/type';
export { type ICanvasPopup, SheetCanvasPopManagerService } from './services/canvas-pop-manager.service';

export { CellAlertManagerService, CellAlertType, type ICellAlert } from './services/cell-alert-manager.service';

// #region - all commands

export {
    ISheetClipboardService,
    PREDEFINED_HOOK_NAME,
    SheetClipboardService,
} from './services/clipboard/clipboard.service';
export type { ICellDataWithSpanInfo, ICopyPastePayload, ISheetClipboardHook, ISheetDiscreteRangeLocation } from './services/clipboard/type';
export { COPY_TYPE } from './services/clipboard/type';
export { getRepeatRange } from './services/clipboard/utils';
export { mergeSetRangeValues } from './services/clipboard/utils';
export { DragManagerService } from './services/drag-manager.service';
export { type IDragCellPosition } from './services/drag-manager.service';
export { CellEditorManagerService, ICellEditorManagerService } from './services/editor/cell-editor-manager.service';
export { IFormulaEditorManagerService } from './services/editor/formula-editor-manager.service';
export type { IEditorBridgeServiceParam } from './services/editor-bridge.service';
export {
    EditorBridgeService,
    IEditorBridgeService,
    type IEditorBridgeServiceVisibleParam,
} from './services/editor-bridge.service';
export { FormatPainterStatus, IFormatPainterService } from './services/format-painter/format-painter.service';
export type { IFormatPainterBeforeApplyHookParams, IFormatPainterHook } from './services/format-painter/format-painter.service';
export { HoverManagerService } from './services/hover-manager.service';
export { type IHoverCellPosition } from './services/hover-manager.service';
export { MarkSelectionService } from './services/mark-selection/mark-selection.service';
export { IMarkSelectionService } from './services/mark-selection/mark-selection.service';
export { SheetPrintInterceptorService } from './services/print-interceptor.service';
export { getAllSelection, getTopLeftSelection } from './services/selection/base-selection-render.service';
export { BaseSelectionRenderService, ISheetSelectionRenderService } from './services/selection/base-selection-render.service';

export { SELECTION_SHAPE_DEPTH } from './services/selection/const';
export { SheetSelectionRenderService } from './services/selection/selection-render.service';
export { SelectionControl as SelectionShape } from './services/selection/selection-shape';
export { attachPrimaryWithCoord, attachSelectionWithCoord } from './services/selection/util';
export type { ISheetSkeletonManagerParam } from './services/sheet-skeleton-manager.service';
export { attachRangeWithCoord, SheetSkeletonManagerService } from './services/sheet-skeleton-manager.service';
export { SheetsRenderService } from './services/sheets-render.service';
export { calculateDocSkeletonRects, getCustomRangePosition, getEditingCustomRangePosition } from './services/utils/doc-skeleton-util';
export { UniverSheetsUIPlugin } from './sheets-ui-plugin';
export { MobileSheetBar } from './views/mobile/sheet-bar/MobileSheetBar';
export type { IRangeProtectionRenderCellData } from './views/permission/extensions/range-protection.render';
export { type IBaseSheetBarProps } from './views/sheet-bar/sheet-bar-tabs/SheetBarItem';
export { SheetBar } from './views/sheet-bar/SheetBar';
export { RenderSheetContent, RenderSheetFooter, RenderSheetHeader } from './views/sheet-container/SheetContainer';
// #endregion
