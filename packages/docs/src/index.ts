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

export type { IDocObjectParam } from './basics/component-tools';
export { getDocObject, getDocObjectById } from './basics/component-tools';
export * from './basics/docs-view-key';
export { BreakLineCommand } from './commands/commands/break-line.command';
export {
    DeleteCommand,
    type ICoverCommandParams,
    type IDeleteCommandParams,
    type IInsertCommandParams,
    InsertCommand,
    type IUpdateCommandParams,
    UpdateCommand,
    EditorInsertTextCommandId,
} from './commands/commands/core-editing.command';
export { DeleteLeftCommand, DeleteRightCommand } from './commands/commands/delete.command';
export { type IIMEInputCommandParams, IMEInputCommand } from './commands/commands/ime-input.command';
export {
    SetInlineFormatBoldCommand,
    SetInlineFormatCommand,
    SetInlineFormatFontFamilyCommand,
    SetInlineFormatFontSizeCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatSubscriptCommand,
    SetInlineFormatSuperscriptCommand,
    SetInlineFormatTextColorCommand,
    SetInlineFormatUnderlineCommand,
    ResetInlineFormatTextBackgroundColorCommand,
    SetInlineFormatTextBackgroundColorCommand,
} from './commands/commands/inline-format.command';
export {
    AlignOperationCommand,
    AlignLeftCommand,
    AlignCenterCommand,
    AlignRightCommand,
    AlignJustifyCommand,
} from './commands/commands/paragraph-align.command';
export { BulletListCommand, OrderListCommand } from './commands/commands/list.command';
export { CoverContentCommand, ReplaceContentCommand } from './commands/commands/replace-content.command';
export {
    type IRichTextEditingMutationParams,
    RichTextEditingMutation,
} from './commands/mutations/core-editing.mutation';
export { MoveCursorOperation, MoveSelectionOperation } from './commands/operations/cursor.operation';
export {
    type ISetTextSelectionsOperationParams,
    SetTextSelectionsOperation,
} from './commands/operations/text-selection.operation';
export { type IUniverDocsConfig, UniverDocsPlugin } from './doc-plugin';
export { DocSkeletonManagerService, type IDocSkeletonManagerParam } from './services/doc-skeleton-manager.service';
export { DocViewModelManagerService } from './services/doc-view-model-manager.service';
export { TextSelectionManagerService, serializeTextRange } from './services/text-selection-manager.service';
export { DocStateChangeManagerService, type IDocStateChangeParams } from './services/doc-state-change-manager.service';
export { IMEInputManagerService } from './services/ime-input-manager.service';
export { SelectAllOperation } from './commands/operations/select-all.operation';
export { CutContentCommand, InnerPasteCommand } from './commands/commands/clipboard.inner.command';
export { SetDocZoomRatioOperation, type ISetDocZoomRatioOperationParams } from './commands/operations/set-doc-zoom-ratio.operation';
export { SetDocZoomRatioCommand } from './commands/commands/set-doc-zoom-ratio.command';
