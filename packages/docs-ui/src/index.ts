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

export { hasParagraphInTable } from './basics/paragraph';
export { replaceSelectionFactory } from './basics/replace';
export type { IDocObjectParam } from './basics/component-tools';
export { getDocObject, neoGetDocObject, getDocObjectById } from './basics/component-tools';
export { getRichTextEditPath, getCommandSkeleton } from './commands/util';
export { addCustomRangeFactory, addCustomRangeBySelectionFactory, deleteCustomRangeFactory } from './basics/custom-range-factory';
export { addCustomDecorationBySelectionFactory, addCustomDecorationFactory, deleteCustomDecorationFactory } from './basics/custom-decoration-factory';
export { getSelectionText, getPlainTextFormDocument, getPlainTextFormBody, getPlainText } from './basics/plain-text';
export * from './basics/docs-view-key';
export { whenDocAndEditorFocused } from './shortcuts/utils';
export { IDocClipboardService } from './services/clipboard/clipboard.service';
export { DocBackScrollRenderController } from './controllers/render-controllers/back-scroll.render-controller';
export * from './basics';
export * from './docs-ui-plugin';
export { DocRenderController } from './controllers/render-controllers/doc.render-controller';
export * from './services';
export { DocsRenderService } from './services/docs-render.service';
export { DocCanvasPopManagerService } from './services/doc-popup-manager.service';
export { docDrawingPositionToTransform, transformToDocDrawingPosition } from './basics/transform-position';
export { DocEventManagerService } from './services/doc-event-manager.service';
export { DocUIController } from './controllers/doc-ui.controller';
export { DOC_VERTICAL_PADDING } from './types/const/padding';
// #region - all commands

export { menuSchema } from './controllers/menu.schema';

// #region - all commands
export { RectRange, convertPositionsToRectRanges } from './services/selection/rect-range';
export { getCanvasOffsetByEngine } from './services/selection/selection-utils';
export type { IEditorInputConfig } from './services/selection/doc-selection-render.service';
export { getAnchorBounding, TEXT_RANGE_LAYER_INDEX, TextRange, getLineBounding } from './services/selection/text-range';
export { NodePositionConvertToCursor } from './services/selection/convert-text-range';
export { getOneTextSelectionRange } from './services/selection/convert-text-range';
export type { IDocRange } from './services/selection/range-interface';
export { isInSameTableCell, isValidRectRange, NodePositionConvertToRectRange } from './services/selection/convert-rect-range';

export { DocSelectionRenderService } from './services/selection/doc-selection-render.service';
export { DocStateChangeManagerService } from './services/doc-state-change-manager.service';
export { DocIMEInputManagerService } from './services/doc-ime-input-manager.service';

export { getParagraphsInRange, getParagraphsInRanges } from './commands/commands/list.command';
export { BreakLineCommand } from './commands/commands/break-line.command';
export { CutContentCommand, InnerPasteCommand } from './commands/commands/clipboard.inner.command';
export {
    InsertCommand,
    DeleteCommand,
    UpdateCommand,
    EditorInsertTextCommandId,
    type ICoverCommandParams,
    type IDeleteCommandParams,
    type IInsertCommandParams,
    type IUpdateCommandParams,
} from './commands/commands/core-editing.command';
export { DeleteLeftCommand, DeleteRightCommand, DeleteCustomBlockCommand, MergeTwoParagraphCommand, type IDeleteCustomBlockParams } from './commands/commands/delete.command';
export {
    SetInlineFormatBoldCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatUnderlineCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatSubscriptCommand,
    SetInlineFormatSuperscriptCommand,
    SetInlineFormatFontSizeCommand,
    SetInlineFormatFontFamilyCommand,
    SetInlineFormatTextColorCommand,
    SetInlineFormatTextBackgroundColorCommand,
    ResetInlineFormatTextBackgroundColorCommand,
    SetInlineFormatCommand,
} from './commands/commands/inline-format.command';
export {
    ListOperationCommand,
    BulletListCommand,
    OrderListCommand,
    ChangeListNestingLevelCommand,
    ChangeListTypeCommand,
    CheckListCommand,
    ToggleCheckListCommand,
    QuickListCommand,
} from './commands/commands/list.command';
export {
    AlignOperationCommand,
    AlignLeftCommand,
    AlignCenterCommand,
    AlignRightCommand,
    AlignJustifyCommand,
} from './commands/commands/paragraph-align.command';
export { IMEInputCommand } from './commands/commands/ime-input.command';
export { ReplaceContentCommand, CoverContentCommand } from './commands/commands/replace-content.command';
export { SetDocZoomRatioCommand } from './commands/commands/set-doc-zoom-ratio.command';
export { AfterSpaceCommand, TabCommand, EnterCommand, type ITabCommandParams } from './commands/commands/auto-format.command';
export { SetDocZoomRatioOperation, type ISetDocZoomRatioOperationParams } from './commands/operations/set-doc-zoom-ratio.operation';
export { MoveSelectionOperation } from './commands/operations/doc-cursor.operation';

// #endregion
export { DocAutoFormatService } from '../../docs-ui/src/services/doc-auto-format.service';
export { ChangeListNestingLevelType } from './commands/commands/list.command';
export { generateParagraphs } from './commands/commands/break-line.command';
export type { IInnerCutCommandParams } from './commands/commands/clipboard.inner.command';
export { getCutActionsFromDocRanges, getCustomBlockIdsInSelections } from './commands/commands/clipboard.inner.command';
export { CreateDocTableCommand, type ICreateDocTableCommandParams } from './commands/commands/table/doc-table-create.command';
export { DocTableDeleteRowsCommand, DocTableDeleteColumnsCommand, DocTableDeleteTableCommand } from './commands/commands/table/doc-table-delete.command';
export type { IDocTableDeleteRowsCommandParams, IDocTableDeleteColumnsCommandParams, IDocTableDeleteTableCommandParams } from './commands/commands/table/doc-table-delete.command';
export type { IDocTableInsertColumnCommandParams, IDocTableInsertRowCommandParams, IDocTableInsertColumnRightCommandParams, IDocTableInsertRowAboveCommandParams, IDocTableInsertRowBellowCommandParams, IDocTableInsertColumnLeftCommandParams } from './commands/commands/table/doc-table-insert.command';
export { DocTableInsertColumnCommand, DocTableInsertRowCommand, DocTableInsertColumnRightCommand, DocTableInsertRowAboveCommand, DocTableInsertRowBellowCommand, DocTableInsertColumnLeftCommand } from './commands/commands/table/doc-table-insert.command';
export type { IDocTableTabCommandParams } from './commands/commands/table/doc-table-tab.command';
export { DocTableTabCommand } from './commands/commands/table/doc-table-tab.command';

export { genTableSource, getEmptyTableRow, getEmptyTableCell, getTableColumn } from './commands/commands/table/table';
export { getCursorWhenDelete } from './commands/commands/delete.command';
export { DocCopyCommand, DocCutCommand, DocPasteCommand } from './commands/commands/clipboard.command';
export { DocCreateTableOperation } from './commands/operations/doc-create-table.operation';
export { SelectAllOperation } from './commands/operations/select-all.operation';
export { MoveCursorOperation } from './commands/operations/doc-cursor.operation';
// #endregion
