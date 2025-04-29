/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

export { getEditorObject } from './basics/editor/get-editor-object';
export { useActiveWorkbook, useActiveWorksheet, useWorkbooks } from './components/hook';
export { SHEET_UI_PLUGIN_NAME } from './consts/plugin-name';
export { SheetsUIPart } from './consts/ui-name';
export { AutoFillController } from './controllers/auto-fill.controller';
export { CellCustomRenderController } from './controllers/cell-custom-render.controller';
export { EditingRenderController } from './controllers/editor/editing.render-controller';
export { PASTE_SPECIAL_MENU_ID, SheetMenuPosition } from './controllers/menu/menu';
export { deriveStateFromActiveSheet$, getCurrentExclusiveRangeInterest$, getCurrentRangeDisable$, getObservableWithExclusiveRange$ } from './controllers/menu/menu-util';
export { HeaderFreezeRenderController } from './controllers/render-controllers/freeze.render-controller';
export { HeaderMoveRenderController } from './controllers/render-controllers/header-move.render-controller';
export { HeaderResizeRenderController } from './controllers/render-controllers/header-resize.render-controller';
export { SheetsScrollRenderController } from './controllers/render-controllers/scroll.render-controller';
export { type ITelemetryData, SheetRenderController } from './controllers/render-controllers/sheet.render-controller';
export { SheetUIController } from './controllers/sheet-ui.controller';
export { whenFormulaEditorActivated, whenSheetEditorFocused } from './controllers/shortcuts/utils';
export { getCoordByCell, getCoordByOffset, getSheetObject, getTransformCoord } from './controllers/utils/component-tools';
export { matchedSelectionByRowColIndex as checkInHeaderRanges } from './controllers/utils/selections-tools';
export { useHighlightRange } from './hooks/use-highlight-range';
export { UniverSheetsMobileUIPlugin } from './mobile-plugin';
export { UniverSheetsUIPlugin } from './plugin';
export { AutoFillService, IAutoFillService } from './services/auto-fill/auto-fill.service';
export { getAutoFillRepeatRange } from './services/auto-fill/tools';
export { APPLY_TYPE, DATA_TYPE, type IAutoFillRule, type ICopyDataInTypeIndexInfo } from './services/auto-fill/type';
export type { IAutoFillLocation, ICopyDataPiece, ISheetAutoFillHook } from './services/auto-fill/type';
export { type ICanvasPopup, SheetCanvasPopManagerService } from './services/canvas-pop-manager.service';
export { CellAlertManagerService, CellAlertType, type ICellAlert } from './services/cell-alert-manager.service';
export { getMatrixPlainText, ISheetClipboardService, PREDEFINED_HOOK_NAME, SheetClipboardService } from './services/clipboard/clipboard.service';
export { COPY_TYPE } from './services/clipboard/type';
export type { ICellDataWithSpanInfo, ICopyPastePayload, IPasteHookValueType, ISheetClipboardHook, ISheetDiscreteRangeLocation } from './services/clipboard/type';
export { getRepeatRange, mergeSetRangeValues } from './services/clipboard/utils';
export { DragManagerService, type IDragCellPosition } from './services/drag-manager.service';
export { EditorBridgeService, IEditorBridgeService, type IEditorBridgeServiceVisibleParam } from './services/editor-bridge.service';
export type { IEditorBridgeServiceParam } from './services/editor-bridge.service';
export { CellEditorManagerService, ICellEditorManagerService } from './services/editor/cell-editor-manager.service';
export { IFormulaEditorManagerService } from './services/editor/formula-editor-manager.service';
export { HoverManagerService } from './services/hover-manager.service';
export type { ICellPosWithEvent, IHoverCellPosition, IHoverRichTextInfo, IHoverRichTextPosition } from './services/hover-manager.service';
export { IMarkSelectionService, MarkSelectionService } from './services/mark-selection/mark-selection.service';
export { HoverRenderController } from './controllers/hover-render.controller';
export { DragRenderController } from './controllers/drag-render.controller';
export { EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY, RANGE_SELECTOR_COMPONENT_KEY, SHEET_VIEW_KEY } from './common/keys';
export type { IDiscreteRange } from './controllers/utils/range-tools';
export { discreteRangeToRange, virtualizeDiscreteRanges } from './controllers/utils/range-tools';
export { AFFECT_LAYOUT_STYLES, AutoHeightController } from './controllers/auto-height.controller';
export { AutoWidthController } from './controllers/auto-width.controller';
export { FormulaEditorController } from './controllers/editor/formula-editor.controller';
export { StatusBarController } from './controllers/status-bar.controller';
export { SheetPermissionCheckUIController } from './controllers/permission/sheet-permission-check-ui.controller';
export { SheetPermissionUserManagerService } from './services/permission/sheet-permission-user-list.service';
export { SheetPrintInterceptorService } from './services/print-interceptor.service';
export { SheetScrollManagerService } from './services/scroll-manager.service';
export { BaseSelectionRenderService, genSelectionByRange, selectionDataForSelectAll as getAllSelection, getTopLeftSelectionOfCurrSheet, ISheetSelectionRenderService } from './services/selection/base-selection-render.service';
export { genNormalSelectionStyle } from './services/selection/const';
export { SelectionControl, SelectionControl as SelectionShape } from './services/selection/selection-control';
export { SheetSelectionRenderService } from './services/selection/selection-render.service';
export { SelectionShapeExtension } from './services/selection/selection-shape-extension';
export { attachPrimaryWithCoord, attachRangeWithCoord, attachSelectionWithCoord } from './services/selection/util';
export { SheetSkeletonManagerService } from './services/sheet-skeleton-manager.service';
export type { ISheetSkeletonManagerParam } from './services/sheet-skeleton-manager.service';
export { SheetsRenderService } from './services/sheets-render.service';
export { calculateDocSkeletonRects, getCustomRangePosition, getEditingCustomRangePosition } from './services/utils/doc-skeleton-util';
export { MobileSheetBar } from './views/mobile/sheet-bar/MobileSheetBar';
export type { IRangeProtectionRenderCellData } from './views/permission/extensions/range-protection.render';
export { SheetBar } from './views/sheet-bar/SheetBar';
export { RenderSheetContent, RenderSheetFooter, RenderSheetHeader } from './views/sheet-container/SheetContainer';
export { type IUniverSheetsUIConfig } from './controllers/config.schema';

export { getCellRealRange } from './common/utils';
export { FONT_FAMILY_COMPONENT, FONT_FAMILY_ITEM_COMPONENT } from './components/font-family/interface';
export { FONT_SIZE_COMPONENT } from './components/font-size/interface';
export { EMBEDDING_FORMULA_EDITOR, isEmbeddingFormulaEditor } from './controllers/editor/utils/is-embedding-formula-editor';
export { isRangeSelector, RANGE_SELECTOR_SYMBOLS } from './controllers/editor/utils/is-range-selector';
export { menuSchema as SheetsUIMenuSchema } from './controllers/menu.schema';
export { SheetCellEditorResizeService } from './services/editor/cell-editor-resize.service';
export { FormatPainterStatus, IFormatPainterService } from './services/format-painter/format-painter.service';
export type { IFormatPainterBeforeApplyHookParams, IFormatPainterHook } from './services/format-painter/format-painter.service';
export { SELECTION_SHAPE_DEPTH } from './services/selection/const';
export { type IBaseSheetBarProps } from './views/sheet-bar/sheet-bar-tabs/SheetBarItem';
export { useKeyEventConfig } from './views/editor-container';
export { type IDropdownParam, ISheetCellDropdownManagerService, SheetCellDropdownManagerService } from './services/cell-dropdown-manager.service';
export { FormulaBar } from './views/formula-bar/FormulaBar';
export { type IPermissionDetailUserPartProps } from './views/permission/panel-detail/PermissionDetailUserPart';
export { CellPopupManagerService } from './services/cell-popup-manager.service';
// #region - all commands
export { SetWorksheetColAutoWidthCommand } from './commands/commands/set-worksheet-auto-col-width.command';
export { AutoClearContentCommand, AutoFillCommand } from './commands/commands/auto-fill.command';
export {
    type ISheetPasteByShortKeyParams,
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
export { ChangeZoomRatioCommand, type ISetZoomRatioCommandParams, SetZoomRatioCommand } from './commands/commands/set-zoom-ratio.command';
export { ShowMenuListCommand } from './commands/commands/unhide.command';
export {
    ChangeSheetProtectionFromSheetBarCommand,
    DeleteWorksheetProtectionFormSheetBarCommand,
} from './commands/commands/worksheet-protection.command';
export { SetColumnHeaderHeightCommand, SetRowHeaderWidthCommand } from './commands/commands/headersize-changed.command';

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
export { convertPositionCellToSheetOverGrid, convertPositionSheetOverGridToAbsolute } from './services/utils/drawing-position-util';
export type { IScrollState, IViewportScrollState } from './services/scroll-manager.service';

export { IStatusBarService, StatusBarService } from './services/status-bar.service';

export { type IStatisticItem } from './views/status-bar/CopyableStatisticItem';

export { functionDisplayNames } from './views/status-bar/CopyableStatisticItem';
// #endregion
