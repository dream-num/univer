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

export { DeleteTextCommand, InsertTextCommand, UpdateTextCommand } from './commands/commands/core-editing.command';
export type {
    IDeleteTextCommandParams,
    IInsertTextCommandParams,
    IUpdateTextCommandParams,
} from './commands/commands/core-editing.command';
export { CreateHeaderFooterCommand, HeaderFooterType } from './commands/commands/create-header-footer.command';
export type {
    HeaderFooterCreateMode,
    ICreateHeaderFooterCommandParams,
    IHeaderFooterProps,
} from './commands/commands/create-header-footer.command';
export { SetDocumentDefaultParagraphStyleCommand } from './commands/commands/set-document-default-paragraph-style.command';
export type {
    IDocumentDefaultParagraphStylePatch,
    ISetDocumentDefaultParagraphStyleCommandParams,
} from './commands/commands/set-document-default-paragraph-style.command';
export { SetSectionHeaderFooterLinkCommand } from './commands/commands/set-section-header-footer-link.command';
export type { ISetSectionHeaderFooterLinkCommandParams } from './commands/commands/set-section-header-footer-link.command';
export { DeleteDocumentSectionBreakCommand, InsertDocumentSectionBreakCommand, UpdateDocumentSectionCommand } from './commands/commands/update-document-section.command';
export type { IDeleteDocumentSectionBreakCommandParams, IDocumentSectionConfig, IDocumentSectionUpdate, IInsertDocumentSectionBreakCommandParams, IUpdateDocumentSectionCommandParams } from './commands/commands/update-document-section.command';
export { RichTextEditingMutation } from './commands/mutations/core-editing.mutation';
export type { IRichTextEditingMutationParams } from './commands/mutations/core-editing.mutation';
export { SetTextSelectionsOperation } from './commands/operations/text-selection.operation';
export type { ISetTextSelectionsOperationParams } from './commands/operations/text-selection.operation';
export type { IUniverDocsConfig } from './config/config';
export {
    createDocsCustomBlockDrawing,
    createDocsCustomBlockInsertMutation,
    createDocsCustomBlockRemoveMutation,
    createEmbedDocsCustomBlockData,
    createInsertCustomBlockActions,
    createRemoveCustomBlockActions,
    EMBED_DOCS_CUSTOM_BLOCK_DEFAULT_COMPONENT_KEY,
    isEmbedDocsCustomBlockData,
    isSheetLikeDocsCustomBlockChildType,
    resolveDocsCustomBlockSize,
    shouldUseInlineTextSelectionForDocsCustomBlockDrawing,
} from './embed-host-anchor';
export type {
    EmbedDocsCustomBlockInteractionMode,
    IDocsCustomBlockMutationParams,
    IEmbedDocsCustomBlockData,
} from './embed-host-anchor';
export { UniverDocsPlugin } from './plugin';
export { DocBlockMoveValidatorService } from './services/doc-block-move-validator.service';
export type {
    DocBlockMoveTransformer,
    DocBlockMoveValidator,
    IDocBlockMoveResult,
    IDocBlockMoveTransformContext,
    IDocBlockMoveValidationContext,
} from './services/doc-block-move-validator.service';
export { DocContentInsertService } from './services/doc-content-insert.service';
export type { IDocContentInsertRange } from './services/doc-content-insert.service';
export { DocInterceptorService } from './services/doc-interceptor/doc-interceptor.service';
export { DOC_INTERCEPTOR_POINT } from './services/doc-interceptor/interceptor-const';
export { DocSelectionManagerService } from './services/doc-selection-manager.service';
export { DocSkeletonManagerService } from './services/doc-skeleton-manager.service';
export {
    DocStateChangeManagerService,
    IDocStateChangeInterceptorService,
} from './services/doc-state-change-manager.service';
export type { IDocStateChangeInfo, IDocStateChangeParams } from './services/doc-state-emit.service';
export { DocStateEmitService } from './services/doc-state-emit.service';
export {
    addCustomRangeBySelectionFactory,
    addCustomRangeFactory,
    deleteCustomRangeFactory,
} from './utils/custom-range-factory';
export { generateParagraphs } from './utils/paragraphs';
export { replaceSelectionFactory } from './utils/replace-selection-factory';
export { createSectionColumnProperties } from './utils/section-columns';
export { getTopLevelSectionBreaks } from './utils/sections';
export { buildDocTransform, docDrawingPositionToTransform, transformToDocDrawingPosition } from './utils/transform-position';
export { consumeContentInsertRange, getContentInsertRange, isHeaderFooterSelection, normalizeTextRange } from './utils/util';
