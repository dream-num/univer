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

export { replaceSelectionFactory } from './basics/replace';
export { makeSelection, getSelectionText, getDeleteSelection, getInsertSelection, isSegmentIntersects } from './basics/selection';
export type { IDocObjectParam } from './basics/component-tools';
export { getDocObject, neoGetDocObject, getDocObjectById } from './basics/component-tools';
export * from './basics/docs-view-key';

export { type IUniverDocsConfig, UniverDocsPlugin } from './doc-plugin';
export { DocSkeletonManagerService } from './services/doc-skeleton-manager.service';
export { TextSelectionManagerService, serializeTextRange } from './services/text-selection-manager.service';
export { DocStateChangeManagerService, type IDocStateChangeParams } from './services/doc-state-change-manager.service';
export { IMEInputManagerService } from './services/ime-input-manager.service';
export { DocCustomRangeService, type ICustomRangeHook } from './services/doc-custom-range.service';

// #region - all commands

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
export { IMEInputCommand, type IIMEInputCommandParams } from './commands/commands/ime-input.command';
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
export { ListOperationCommand, BulletListCommand, OrderListCommand } from './commands/commands/list.command';
export {
    AlignOperationCommand,
    AlignLeftCommand,
    AlignCenterCommand,
    AlignRightCommand,
    AlignJustifyCommand,
} from './commands/commands/paragraph-align.command';
export { ReplaceContentCommand, CoverContentCommand } from './commands/commands/replace-content.command';
export { SetDocZoomRatioCommand } from './commands/commands/set-doc-zoom-ratio.command';
export { addCustomRangeFactory, addCustomRangeBySelectionFactory, deleteCustomRangeFactory } from './basics/custom-range-factory';
export { addCustomDecorationBySelectionFactory, addCustomDecorationFactory, deleteCustomDecorationFactory } from './basics/custom-decoration-factory';
export { DocInterceptorService } from './services/doc-interceptor/doc-interceptor.service';
export { DOC_INTERCEPTOR_POINT } from './services/doc-interceptor/interceptor-const';

export {
    RichTextEditingMutation,
    type IRichTextEditingMutationParams,
} from './commands/mutations/core-editing.mutation';

export { MoveCursorOperation, MoveSelectionOperation } from './commands/operations/cursor.operation';
export { SelectAllOperation } from './commands/operations/select-all.operation';
export { SetDocZoomRatioOperation, type ISetDocZoomRatioOperationParams } from './commands/operations/set-doc-zoom-ratio.operation';
export {
    SetTextSelectionsOperation,
    type ISetTextSelectionsOperationParams,
} from './commands/operations/text-selection.operation';

// #endregion

export { getRetainAndDeleteFromReplace } from './basics/retain-delete-params';
export { getRichTextEditPath } from './commands/util';
export { getPlainTextFormDocument } from './basics/plain-text';
