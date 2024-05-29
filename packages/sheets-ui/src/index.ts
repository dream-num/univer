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
export { AutoFillCommand } from './commands/commands/auto-fill.command';
export { SheetCopyCommand } from './commands/commands/clipboard.command';
export { expandToContinuousRange } from './commands/commands/utils/selection-utils';
export { ExpandSelectionCommand, JumpOver, MoveSelectionCommand } from './commands/commands/set-selection.command';
export { SetCellEditVisibleArrowOperation, SetCellEditVisibleOperation } from './commands/operations/cell-edit.operation';
export { SetScrollOperation } from './commands/operations/scroll.operation';
export { SheetsScrollRenderController } from './controllers/render-controllers/scroll.render-controller';
export { deriveStateFromActiveSheet$, getCurrentRangeDisable$, getCommentDisable$ } from './controllers/menu/menu-util';
export { SheetRenderController } from './controllers/sheet-render.controller';
export { SetZoomRatioOperation } from './commands/operations/set-zoom-ratio.operation';
export {
    ResetScrollCommand,
    ScrollCommand,
    ScrollToCellCommand,
    SetScrollRelativeCommand,
    type IScrollCommandParams,
    type IScrollToCellCommandParams,
    type ISetScrollRelativeCommandParams,
} from './commands/commands/set-scroll.command';
export { VIEWPORT_KEY } from './common/keys';
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
export type { ICellDataWithSpanInfo, ISheetClipboardHook, ISheetRangeLocation, ISheetDiscreteRangeLocation, ICopyPastePayload } from './services/clipboard/type';
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
export { ISelectionRenderService } from './services/selection/selection-render.service';
export { SelectionRenderService } from './services/selection/selection-render.service';
export { SelectionShape } from './services/selection/selection-shape';
export type { ISheetSkeletonManagerParam } from './services/sheet-skeleton-manager.service';
export { SheetSkeletonManagerService } from './services/sheet-skeleton-manager.service';
export { UniverSheetsUIPlugin } from './sheets-ui-plugin';
export { SheetCanvasView } from './views/sheet-canvas-view';
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
export type { ISheetPasteParams } from './commands/commands/clipboard.command';
export { SheetCutCommand, SheetPasteColWidthCommand, SheetPasteCommand, SheetPasteShortKeyCommand } from './commands/commands/clipboard.command';
export { SetRangeBoldCommand, SetRangeItalicCommand, SetRangeUnderlineCommand, SetRangeStrickThroughCommand } from './commands/commands/inline-format.command';
export { ApplyFormatPainterCommand } from './commands/commands/set-format-painter.command';
