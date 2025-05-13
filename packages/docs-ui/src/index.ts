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

export { DocAutoFormatService } from '../../docs-ui/src/services/doc-auto-format.service';
export * from './basics';
export type { IDocObjectParam } from './basics/component-tools';
export { getDocObject, getDocObjectById, neoGetDocObject } from './basics/component-tools';
export { addCustomDecorationBySelectionFactory, addCustomDecorationFactory, deleteCustomDecorationFactory } from './basics/custom-decoration-factory';
export * from './basics/docs-view-key';
export { hasParagraphInTable } from './basics/paragraph';
export { docDrawingPositionToTransform, transformToDocDrawingPosition } from './basics/transform-position';
export { type IKeyboardEventConfig, useKeyboardEvent, useResize } from './views/rich-text-editor/hooks';
export { type IRichTextEditorProps, RichTextEditor } from './views/rich-text-editor';
export { getCommandSkeleton, getRichTextEditPath } from './commands/util';
// export { TextEditor } from './components/editor/TextEditor';
// export { RangeSelector as DocRangeSelector } from './components/range-selector/RangeSelector';
export { DocUIController } from './controllers/doc-ui.controller';
export { menuSchema as DocsUIMenuSchema } from './controllers/menu.schema';
export { DocBackScrollRenderController } from './controllers/render-controllers/back-scroll.render-controller';
export { DocRenderController } from './controllers/render-controllers/doc.render-controller';
export type { IUniverDocsUIConfig } from './controllers/config.schema';
export { UniverDocsUIPlugin } from './plugin';
export * from './services';
export { IDocClipboardService } from './services/clipboard/clipboard.service';
export { DocEventManagerService } from './services/doc-event-manager.service';
export { DocIMEInputManagerService } from './services/doc-ime-input-manager.service';
export { calcDocRangePositions, DocCanvasPopManagerService } from './services/doc-popup-manager.service';
export { DocStateChangeManagerService } from './services/doc-state-change-manager.service';
export { DocsRenderService } from './services/docs-render.service';
export { Editor } from './services/editor/editor';
export { EditorService, IEditorService } from './services/editor/editor-manager.service';
export { isInSameTableCell, isValidRectRange, NodePositionConvertToRectRange } from './services/selection/convert-rect-range';
export { DocPrintInterceptorService, type IDocPrintComponentContext, type IDocPrintContext } from './services/doc-print-interceptor-service';
export { NodePositionConvertToCursor } from './services/selection/convert-text-range';
export { getOneTextSelectionRange } from './services/selection/convert-text-range';
export type { IEditorInputConfig } from './services/selection/doc-selection-render.service';
export { DocSelectionRenderService } from './services/selection/doc-selection-render.service';

export type { IDocRange } from './services/selection/range-interface';
export { convertPositionsToRectRanges, RectRange } from './services/selection/rect-range';
export { getCanvasOffsetByEngine } from './services/selection/selection-utils';
export { getAnchorBounding, getLineBounding, TEXT_RANGE_LAYER_INDEX, TextRange } from './services/selection/text-range';
export { whenDocAndEditorFocused } from './shortcuts/utils';
export { DOC_VERTICAL_PADDING } from './types/const/padding';

// #region - all commands
export { SwitchDocModeCommand } from './commands/commands/switch-doc-mode.command';
export { HorizontalLineCommand } from './commands/commands/doc-horizontal-line.command';
export { AfterSpaceCommand, EnterCommand, type ITabCommandParams, TabCommand } from './commands/commands/auto-format.command';
export { BreakLineCommand } from './commands/commands/break-line.command';
export { generateParagraphs } from './commands/commands/break-line.command';
export { DocCopyCommand, DocCutCommand, DocPasteCommand } from './commands/commands/clipboard.command';
export { CutContentCommand, type IInnerPasteCommandParams, InnerPasteCommand } from './commands/commands/clipboard.inner.command';
export type { IInnerCutCommandParams } from './commands/commands/clipboard.inner.command';
export { getCustomBlockIdsInSelections, getCutActionsFromDocRanges } from './commands/commands/clipboard.inner.command';
export {
    DeleteCommand,
    EditorInsertTextCommandId,
    type ICoverCommandParams,
    type IDeleteCommandParams,
    type IInsertCommandParams,
    InsertCommand,
    type IUpdateCommandParams,
    UpdateCommand,
} from './commands/commands/core-editing.command';
export { DeleteCustomBlockCommand, DeleteLeftCommand, DeleteRightCommand, type IDeleteCustomBlockParams, MergeTwoParagraphCommand } from './commands/commands/doc-delete.command';
export { getCursorWhenDelete } from './commands/commands/doc-delete.command';

export { type IIMEInputCommandParams, IMEInputCommand } from './commands/commands/ime-input.command';
export {
    ResetInlineFormatTextBackgroundColorCommand,
    SetInlineFormatBoldCommand,
    SetInlineFormatCommand,
    SetInlineFormatFontFamilyCommand,
    SetInlineFormatFontSizeCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatSubscriptCommand,
    SetInlineFormatSuperscriptCommand,
    SetInlineFormatTextBackgroundColorCommand,
    SetInlineFormatTextColorCommand,
    SetInlineFormatUnderlineCommand,
} from './commands/commands/inline-format.command';
export {
    BulletListCommand,
    ChangeListNestingLevelCommand,
    ChangeListTypeCommand,
    CheckListCommand,
    ListOperationCommand,
    OrderListCommand,
    QuickListCommand,
    ToggleCheckListCommand,
} from './commands/commands/list.command';
export { ChangeListNestingLevelType } from './commands/commands/list.command';
export {
    AlignCenterCommand,
    AlignJustifyCommand,
    AlignLeftCommand,
    AlignOperationCommand,
    AlignRightCommand,
} from './commands/commands/paragraph-align.command';
export { ReplaceTextRunsCommand } from './commands/commands/replace-content.command';
export { CoverContentCommand, type IReplaceSelectionCommandParams, type IReplaceSnapshotCommandParams, ReplaceContentCommand, ReplaceSelectionCommand, ReplaceSnapshotCommand } from './commands/commands/replace-content.command';
export { SetDocZoomRatioCommand } from './commands/commands/set-doc-zoom-ratio.command';
export { CreateDocTableCommand, type ICreateDocTableCommandParams } from './commands/commands/table/doc-table-create.command';
export { DocTableDeleteColumnsCommand, DocTableDeleteRowsCommand, DocTableDeleteTableCommand } from './commands/commands/table/doc-table-delete.command';
export { type IInsertCustomRangeCommandParams, InsertCustomRangeCommand } from './commands/commands/insert-custom-range.command';
export type {
    IDocTableDeleteColumnsCommandParams,
    IDocTableDeleteRowsCommandParams,
    IDocTableDeleteTableCommandParams,
} from './commands/commands/table/doc-table-delete.command';
export type {
    IDocTableInsertColumnCommandParams,
    IDocTableInsertColumnLeftCommandParams,
    IDocTableInsertColumnRightCommandParams,
    IDocTableInsertRowAboveCommandParams,
    IDocTableInsertRowBellowCommandParams,
    IDocTableInsertRowCommandParams,
} from './commands/commands/table/doc-table-insert.command';
export {
    DocTableInsertColumnCommand,
    DocTableInsertColumnLeftCommand,
    DocTableInsertColumnRightCommand,
    DocTableInsertRowAboveCommand,
    DocTableInsertRowBellowCommand,
    DocTableInsertRowCommand,
} from './commands/commands/table/doc-table-insert.command';

export type { IDocTableTabCommandParams } from './commands/commands/table/doc-table-tab.command';
export { DocTableTabCommand } from './commands/commands/table/doc-table-tab.command';
export { genTableSource, getEmptyTableCell, getEmptyTableRow, getTableColumn } from './commands/commands/table/table';
export { DocCreateTableOperation } from './commands/operations/doc-create-table.operation';
export { type IMoveCursorOperationParams, MoveSelectionOperation } from './commands/operations/doc-cursor.operation';
export { MoveCursorOperation } from './commands/operations/doc-cursor.operation';
export { DocSelectAllCommand } from './commands/commands/doc-select-all.command';
export { type ISetDocZoomRatioOperationParams, SetDocZoomRatioOperation } from './commands/operations/set-doc-zoom-ratio.operation';
export { SetParagraphNamedStyleCommand } from './commands/commands/set-heading.command';
export { convertBodyToHtml } from './services/clipboard/udm-to-html/convertor';
// #endregion
