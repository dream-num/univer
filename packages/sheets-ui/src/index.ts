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

export * from './basics';
export { getEditorObject } from './basics/editor/get-editor-object';
export { SheetsScrollRenderController } from './controllers/render-controllers/scroll.render-controller';
export { deriveStateFromActiveSheet$, getCurrentRangeDisable$ } from './controllers/menu/menu-util';
export { SheetsRenderService } from './services/sheets-render.service';

export { SHEET_VIEWPORT_KEY as VIEWPORT_KEY } from './common/keys';
export { AutoFillController } from './controllers/auto-fill.controller';
export { CellCustomRenderController } from './controllers/cell-custom-render.controller';
export { PASTE_SPECIAL_MENU_ID } from './controllers/menu/menu';
export { whenFormulaEditorActivated } from './controllers/shortcuts/utils';
export {
    getCoordByCell,
    getCoordByOffset,
    getSheetObject,
    getTransformCoord,
} from './controllers/utils/component-tools';
export { checkInHeaderRanges } from './controllers/utils/selections-tools';
export { useActiveWorkbook, useActiveWorksheet } from './components/hook';
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
export type { ICellDataWithSpanInfo, ISheetClipboardHook, ISheetDiscreteRangeLocation, ICopyPastePayload } from './services/clipboard/type';
export { COPY_TYPE } from './services/clipboard/type';
export { getRepeatRange } from './services/clipboard/utils';
export { CellEditorManagerService, ICellEditorManagerService } from './services/editor/cell-editor-manager.service';
export { IFormulaEditorManagerService } from './services/editor/formula-editor-manager.service';
export {
    EditorBridgeService,
    IEditorBridgeService,
    type IEditorBridgeServiceVisibleParam,
} from './services/editor-bridge.service';
export { MarkSelectionService } from './services/mark-selection/mark-selection.service';
export { IMarkSelectionService } from './services/mark-selection/mark-selection.service';
export { SheetSelectionRenderService, getAllSelection, getTopLeftSelection } from './services/selection/selection-render.service';
export { BaseSelectionRenderService, ISheetSelectionRenderService } from './services/selection/base-selection-render.service';
export { SelectionControl as SelectionShape } from './services/selection/selection-shape';
export type { ISheetSkeletonManagerParam } from './services/sheet-skeleton-manager.service';
export { SheetSkeletonManagerService, attachRangeWithCoord } from './services/sheet-skeleton-manager.service';
export { UniverSheetsUIPlugin } from './sheets-ui-plugin';
export { SheetRenderController } from './controllers/render-controllers/sheet.render-controller';
export { HoverManagerService } from './services/hover-manager.service';
export { DragManagerService } from './services/drag-manager.service';
export { CellAlertManagerService, CellAlertType, type ICellAlert } from './services/cell-alert-manager.service';
export { HoverRenderController } from './controllers/hover-render.controller';
export { DragRenderController } from './controllers/drag-render.controller';
export { SHEET_VIEW_KEY } from './common/keys';
export { SheetCanvasPopManagerService, type ICanvasPopup } from './services/canvas-pop-manager.service';
export { mergeSetRangeValues } from './services/clipboard/utils';
export type { IAutoFillLocation } from './services/auto-fill/type';
export type { IDiscreteRange } from './controllers/utils/range-tools';
export { virtualizeDiscreteRanges, rangeToDiscreteRange } from './controllers/utils/range-tools';
export { type IHoverCellPosition } from './services/hover-manager.service';
export { AutoHeightController } from './controllers/auto-height.controller';
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
export { SheetPrintInterceptorService } from './services/print-interceptor.service';
export { UniverSheetsMobileUIPlugin } from './mobile-sheets-ui-plugin';
export { MobileSheetBar } from './views/mobile/sheet-bar/MobileSheetBar';
export { expandToContinuousRange } from './commands/commands/utils/selection-utils';

// #region - all commands

export { AddWorksheetMergeCommand, AddWorksheetMergeAllCommand, AddWorksheetMergeVerticalCommand, AddWorksheetMergeHorizontalCommand } from './commands/commands/add-worksheet-merge.command';
export { AutoFillCommand, AutoClearContentCommand } from './commands/commands/auto-fill.command';
export {
    SheetCopyCommand,
    SheetCutCommand,
    SheetPasteCommand,
    SheetPasteValueCommand,
    SheetPasteShortKeyCommand,
    SheetPasteColWidthCommand,
    SheetPasteFormatCommand,
    SheetPasteBesidesBorderCommand,
    type ISheetPasteParams,
} from './commands/commands/clipboard.command';
export { DeleteRangeMoveLeftConfirmCommand } from './commands/commands/delete-range-move-left-confirm.command';
export { DeleteRangeMoveUpConfirmCommand } from './commands/commands/delete-range-move-up-confirm.command';
export { HideRowConfirmCommand, HideColConfirmCommand } from './commands/commands/hide-row-col-confirm.command';
export { SetRangeBoldCommand,
    SetRangeItalicCommand,
    SetRangeUnderlineCommand,
    SetRangeStrickThroughCommand,
    SetRangeSubscriptCommand,
    SetRangeSuperscriptCommand,
    SetRangeFontSizeCommand,
    SetRangeFontFamilyCommand,
    SetRangeTextColorCommand,
} from './commands/commands/inline-format.command';
export { InsertRangeMoveDownConfirmCommand } from './commands/commands/insert-range-move-down-confirm.command';
export { InsertRangeMoveRightConfirmCommand } from './commands/commands/insert-range-move-right-confirm.command';
export {
    AddRangeProtectionFromToolbarCommand,
    AddRangeProtectionFromContextMenuCommand,
    ViewSheetPermissionFromContextMenuCommand,
    AddRangeProtectionFromSheetBarCommand,
    ViewSheetPermissionFromSheetBarCommand,
    AddRangeProtectionCommand,
    DeleteRangeSelectionCommand,
    SetRangeProtectionCommand,
    DeleteRangeProtectionFromContextMenuCommand,
    SetRangeProtectionFromContextMenuCommand,
    SetProtectionCommand,
} from './commands/commands/range-protection.command';
export { RefillCommand } from './commands/commands/refill.command';
export { RemoveRowConfirmCommand, RemoveColConfirmCommand } from './commands/commands/remove-row-col-confirm.command';
export { RemoveSheetConfirmCommand } from './commands/commands/remove-sheet-confirm.command';
export { SetInfiniteFormatPainterCommand, SetOnceFormatPainterCommand, ApplyFormatPainterCommand } from './commands/commands/set-format-painter.command';
export { SetSelectionFrozenCommand, SetRowFrozenCommand, SetColumnFrozenCommand, CancelFrozenCommand } from './commands/commands/set-frozen.command';
export {
    ResetScrollCommand,
    ScrollCommand,
    ScrollToCellCommand,
    SetScrollRelativeCommand,
    type IScrollCommandParams,
    type IScrollToCellCommandParams,
    type ISetScrollRelativeCommandParams,
} from './commands/commands/set-scroll.command';
export { JumpOver, MoveSelectionCommand, MoveSelectionEnterAndTabCommand, ExpandSelectionCommand, SelectAllCommand } from './commands/commands/set-selection.command';
export { ChangeZoomRatioCommand, SetZoomRatioCommand } from './commands/commands/set-zoom-ratio.command';
export { ShowMenuListCommand } from './commands/commands/unhide.command';
export { AddWorksheetProtectionCommand, DeleteWorksheetProtectionCommand, SetWorksheetProtectionCommand, DeleteWorksheetProtectionFormSheetBarCommand, ChangeSheetProtectionFromSheetBarCommand } from './commands/commands/worksheet-protection.command';

export { SetActivateCellEditOperation } from './commands/operations/activate-cell-edit.operation';
export { SetCellEditVisibleOperation, SetCellEditVisibleWithF2Operation, SetCellEditVisibleArrowOperation } from './commands/operations/cell-edit.operation';
export { RenameSheetOperation } from './commands/operations/rename-sheet.operation';
export { ScrollToRangeOperation } from './commands/operations/scroll-to-range.operation';
export { SetScrollOperation } from './commands/operations/scroll.operation';
export { SetFormatPainterOperation } from './commands/operations/set-format-painter.operation';
export { SetZoomRatioOperation } from './commands/operations/set-zoom-ratio.operation';
export { SheetPermissionOpenDialogOperation } from './commands/operations/sheet-permission-open-dialog.operation';
export { SheetPermissionOpenPanelOperation } from './commands/operations/sheet-permission-open-panel.operation';
export { SidebarDefinedNameOperation } from './commands/operations/sidebar-defined-name.operation';

// #endregion
