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

import './global.css';

export { SheetsUIPart } from './consts/ui-name';
export { SHEET_UI_PLUGIN_NAME } from './consts/plugin-name';
export { getEditorObject } from './basics/editor/get-editor-object';
export { SheetsScrollRenderController } from './controllers/render-controllers/scroll.render-controller';
export { SheetScrollManagerService } from './services/scroll-manager.service';
export { deriveStateFromActiveSheet$, getCurrentExclusiveRangeInterest$, getCurrentRangeDisable$, getObservableWithExclusiveRange$ } from './controllers/menu/menu-util';
export { SheetsRenderService } from './services/sheets-render.service';
export { calculateDocSkeletonRects, getCustomRangePosition, getEditingCustomRangePosition } from './services/utils/doc-skeleton-util';
export { SHEET_VIEWPORT_KEY as VIEWPORT_KEY } from './common/keys';
export { AutoFillController } from './controllers/auto-fill.controller';
export { CellCustomRenderController } from './controllers/cell-custom-render.controller';
export { SheetUIController } from './controllers/sheet-ui.controller';
export { PASTE_SPECIAL_MENU_ID } from './controllers/menu/menu';
export { whenFormulaEditorActivated } from './controllers/shortcuts/utils';
export {
    getCoordByCell,
    getCoordByOffset,
    getSheetObject,
    getTransformCoord,
} from './controllers/utils/component-tools';
export { matchedSelectionByRowColIndex as checkInHeaderRanges } from './controllers/utils/selections-tools';
export { useActiveWorkbook, useActiveWorksheet, useWorkbooks } from './components/hook';
export { whenSheetEditorFocused } from './controllers/shortcuts/utils';
export type { IEditorBridgeServiceParam } from './services/editor-bridge.service';
export { AutoFillService, IAutoFillService } from './services/auto-fill/auto-fill.service';
export { getAutoFillRepeatRange } from './services/auto-fill/tools';
export type { ICopyDataPiece, ISheetAutoFillHook } from './services/auto-fill/type';
export { APPLY_TYPE, DATA_TYPE, type IAutoFillRule } from './services/auto-fill/type';
export { type ICopyDataInTypeIndexInfo } from './services/auto-fill/type';
export {
    ISheetClipboardService,
    PREDEFINED_HOOK_NAME,
    SheetClipboardService,
} from './services/clipboard/clipboard.service';
export type { ICellDataWithSpanInfo, ICopyPastePayload, ISheetClipboardHook, ISheetDiscreteRangeLocation } from './services/clipboard/type';
export { COPY_TYPE } from './services/clipboard/type';
export { getRepeatRange } from './services/clipboard/utils';
export { EditingRenderController } from './controllers/editor/editing.render-controller';
export { CellEditorManagerService, ICellEditorManagerService } from './services/editor/cell-editor-manager.service';
export { IFormulaEditorManagerService } from './services/editor/formula-editor-manager.service';
export {
    EditorBridgeService,
    IEditorBridgeService,
    type IEditorBridgeServiceVisibleParam,
} from './services/editor-bridge.service';
export { MarkSelectionService } from './services/mark-selection/mark-selection.service';
export { IMarkSelectionService } from './services/mark-selection/mark-selection.service';
export { SheetSelectionRenderService } from './services/selection/selection-render.service';
export { genSelectionByRange, selectionDataForSelectAll as getAllSelection, getTopLeftSelectionOfCurrSheet } from './services/selection/base-selection-render.service';
export { BaseSelectionRenderService, ISheetSelectionRenderService } from './services/selection/base-selection-render.service';
export { SelectionControl, SelectionControl as SelectionShape } from './services/selection/selection-control';
export { SelectionShapeExtension } from './services/selection/selection-shape-extension';
export { genNormalSelectionStyle } from './services/selection/const';
export type { ISheetSkeletonManagerParam } from './services/sheet-skeleton-manager.service';
export { SheetSkeletonManagerService } from './services/sheet-skeleton-manager.service';
export { attachPrimaryWithCoord, attachRangeWithCoord, attachSelectionWithCoord } from './services/selection/util';
export { UniverSheetsUIPlugin } from './plugin';
export { SheetRenderController } from './controllers/render-controllers/sheet.render-controller';
export { HoverManagerService } from './services/hover-manager.service';
export { DragManagerService } from './services/drag-manager.service';
export { CellAlertManagerService, CellAlertType, type ICellAlert } from './services/cell-alert-manager.service';
export { HoverRenderController } from './controllers/hover-render.controller';
export { DragRenderController } from './controllers/drag-render.controller';
export { EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY, RANGE_SELECTOR_COMPONENT_KEY, SHEET_VIEW_KEY } from './common/keys';
export { type ICanvasPopup, SheetCanvasPopManagerService } from './services/canvas-pop-manager.service';
export { mergeSetRangeValues } from './services/clipboard/utils';
export type { IAutoFillLocation } from './services/auto-fill/type';
export type { IDiscreteRange } from './controllers/utils/range-tools';
export { rangeToDiscreteRange, virtualizeDiscreteRanges } from './controllers/utils/range-tools';
export { type IHoverCellPosition } from './services/hover-manager.service';
export { AFFECT_LAYOUT_STYLES, AutoHeightController } from './controllers/auto-height.controller';
export { AutoWidthController } from './controllers/auto-width.controller';
export { type IDragCellPosition } from './services/drag-manager.service';
export { SheetMenuPosition } from './controllers/menu/menu';
export { useHighlightRange } from './hooks/useHighlightRange';
export { HeaderMoveRenderController } from './controllers/render-controllers/header-move.render-controller';
export { HeaderResizeRenderController } from './controllers/render-controllers/header-resize.render-controller';
export { HeaderFreezeRenderController } from './controllers/render-controllers/freeze.render-controller';
export { FormulaEditorController } from './controllers/editor/formula-editor.controller';
export { StatusBarController } from './controllers/status-bar.controller';
export { SheetPermissionInterceptorBaseController } from './controllers/permission/sheet-permission-interceptor-base.controller';
export type { IRangeProtectionRenderCellData } from './views/permission/extensions/range-protection.render';
export { RenderSheetContent, RenderSheetFooter, RenderSheetHeader } from './views/sheet-container/SheetContainer';
export { SheetBar } from './views/sheet-bar/SheetBar';
export { SheetPrintInterceptorService } from './services/print-interceptor.service';
export { UniverSheetsMobileUIPlugin } from './mobile-plugin';
export { MobileSheetBar } from './views/mobile/sheet-bar/MobileSheetBar';
export { SheetPermissionInitController } from './controllers/permission/sheet-permission-init.controller';
export { type IUniverSheetsUIConfig } from './controllers/config.schema';

export { FormatPainterStatus, IFormatPainterService } from './services/format-painter/format-painter.service';
export type { IFormatPainterBeforeApplyHookParams, IFormatPainterHook } from './services/format-painter/format-painter.service';
export { type IBaseSheetBarProps } from './views/sheet-bar/sheet-bar-tabs/SheetBarItem';
export { FONT_FAMILY_COMPONENT, FONT_FAMILY_ITEM_COMPONENT } from './components/font-family/interface';
export { FONT_SIZE_COMPONENT } from './components/font-size/interface';
export { SELECTION_SHAPE_DEPTH } from './services/selection/const';
export { isRangeSelector, RANGE_SELECTOR_SYMBOLS } from './controllers/editor/utils/isRangeSelector';
export { EMBEDDING_FORMULA_EDITOR, isEmbeddingFormulaEditor } from './controllers/editor/utils/isEmbeddingFormulaEditor';
export { SheetCellEditorResizeService } from './services/editor/cell-editor-resize.service';
export { menuSchema as SheetsUIMenuSchema } from './controllers/menu.schema';
export { getCellRealRange } from './common/utils';

// #region - all commands
export { AddWorksheetMergeAllCommand, AddWorksheetMergeCommand, AddWorksheetMergeHorizontalCommand, AddWorksheetMergeVerticalCommand } from './commands/commands/add-worksheet-merge.command';
export { AutoClearContentCommand, AutoFillCommand } from './commands/commands/auto-fill.command';
export {
    type ISheetPasteParams,
    SheetCopyCommand,
    SheetCutCommand,
    SheetPasteBesidesBorderCommand,
    SheetPasteColWidthCommand,
    SheetPasteCommand,
    SheetPasteFormatCommand,
    SheetPasteShortKeyCommand,
    SheetPasteValueCommand,
} from './commands/commands/clipboard.command';
export { DeleteRangeMoveLeftConfirmCommand } from './commands/commands/delete-range-move-left-confirm.command';
export { DeleteRangeMoveUpConfirmCommand } from './commands/commands/delete-range-move-up-confirm.command';
export { HideColConfirmCommand, HideRowConfirmCommand } from './commands/commands/hide-row-col-confirm.command';
export {
    ResetRangeTextColorCommand,
    SetRangeBoldCommand,
    SetRangeFontFamilyCommand,
    SetRangeFontSizeCommand,
    SetRangeItalicCommand,
    SetRangeStrickThroughCommand,
    SetRangeSubscriptCommand,
    SetRangeSuperscriptCommand,
    SetRangeTextColorCommand,
    SetRangeUnderlineCommand,
} from './commands/commands/inline-format.command';
export { InsertRangeMoveDownConfirmCommand } from './commands/commands/insert-range-move-down-confirm.command';
export { InsertRangeMoveRightConfirmCommand } from './commands/commands/insert-range-move-right-confirm.command';
export {
    AddRangeProtectionFromContextMenuCommand,
    AddRangeProtectionFromSheetBarCommand,
    AddRangeProtectionFromToolbarCommand,
    DeleteRangeProtectionFromContextMenuCommand,
    SetRangeProtectionFromContextMenuCommand,
    ViewSheetPermissionFromContextMenuCommand,
    ViewSheetPermissionFromSheetBarCommand,
} from './commands/commands/range-protection.command';
export { RefillCommand } from './commands/commands/refill.command';
export { RemoveColConfirmCommand, RemoveRowConfirmCommand } from './commands/commands/remove-row-col-confirm.command';
export { RemoveSheetConfirmCommand } from './commands/commands/remove-sheet-confirm.command';
export { ApplyFormatPainterCommand, SetInfiniteFormatPainterCommand, SetOnceFormatPainterCommand } from './commands/commands/set-format-painter.command';
export { SetColumnFrozenCommand, SetRowFrozenCommand, SetSelectionFrozenCommand } from './commands/commands/set-frozen.command';
export {
    type IScrollCommandParams,
    type IScrollToCellCommandParams,
    type ISetScrollRelativeCommandParams,
    ResetScrollCommand,
    ScrollCommand,
    ScrollToCellCommand,
    SetScrollRelativeCommand,
} from './commands/commands/set-scroll.command';
export { ExpandSelectionCommand, JumpOver, MoveSelectionCommand, MoveSelectionEnterAndTabCommand, SelectAllCommand } from './commands/commands/set-selection.command';
export { ChangeZoomRatioCommand, SetZoomRatioCommand } from './commands/commands/set-zoom-ratio.command';
export { ShowMenuListCommand } from './commands/commands/unhide.command';
export {
    ChangeSheetProtectionFromSheetBarCommand,
    DeleteWorksheetProtectionFormSheetBarCommand,
} from './commands/commands/worksheet-protection.command';

export { SetActivateCellEditOperation } from './commands/operations/activate-cell-edit.operation';
export { SetCellEditVisibleArrowOperation, SetCellEditVisibleOperation, SetCellEditVisibleWithF2Operation } from './commands/operations/cell-edit.operation';
export { RenameSheetOperation } from './commands/operations/rename-sheet.operation';
export { ScrollToRangeOperation } from './commands/operations/scroll-to-range.operation';
export { SetScrollOperation } from './commands/operations/scroll.operation';
export { SetFormatPainterOperation } from './commands/operations/set-format-painter.operation';
export { SetZoomRatioOperation } from './commands/operations/set-zoom-ratio.operation';
export { SheetPermissionOpenDialogOperation } from './commands/operations/sheet-permission-open-dialog.operation';
export { SheetPermissionOpenPanelOperation } from './commands/operations/sheet-permission-open-panel.operation';
export { SidebarDefinedNameOperation } from './commands/operations/sidebar-defined-name.operation';
export { UNIVER_SHEET_PERMISSION_BACKGROUND, UNIVER_SHEET_PERMISSION_USER_PART } from './consts/permission';

// #endregion
