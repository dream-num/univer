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

export * from './document-data-model';
export { getEmptySnapshot as getDocsEmptySnapshot } from './empty-snapshot';
export { JSON1, JSONX } from './json-x/json-x';
export type { JSONXActions, JSONXPath } from './json-x/json-x';
export { resolveDocumentParagraphStyle } from './paragraph-style';
export type { IResolveDocumentParagraphStyleOptions } from './paragraph-style';
export * from './preset-list-type';
export { replaceInDocumentBody } from './replacement';
export {
    ParagraphStyleBuilder,
    ParagraphStyleValue,
    RichTextBuilder,
    RichTextParagraphBuilder,
    RichTextRunBuilder,
    RichTextValue,
    TextDecorationBuilder,
    TextStyleBuilder,
    TextStyleValue,
} from './rich-text-builder';
export type { IRichTextColumnsOptions, IRichTextRange } from './rich-text-builder';
export { DEFAULT_DOCUMENT_SUB_COMPONENT_ID } from './subdocument';
export { ActionIterator } from './text-x/action-iterator';
export { PRESERVE_INSERTED_PARAGRAPH_IDS, TextXActionType } from './text-x/action-types';
export type { IDeleteAction, IInsertAction, IRetainAction, TextXAction } from './text-x/action-types';
export { normalizeInsertedSectionIdsForDocument, normalizeTextRuns, RESTORE_INSERTED_PARAGRAPH_IDS } from './text-x/apply-utils/common';
export { updateAttributeByDelete } from './text-x/apply-utils/delete-apply';
export { updateAttributeByInsert } from './text-x/apply-utils/insert-apply';
export * from './text-x/build-utils';
export { getPlainText } from './text-x/build-utils/parse';
export { validateDocBodyStructure, validateDocumentStructure } from './text-x/structure-validator';
export type { DocStructureIssueCode, IDocStructureIssue } from './text-x/structure-validator';
export { TextX } from './text-x/text-x';
export type { TPriority } from './text-x/text-x';
export {
    composeBody,
    getBodySlice,
    getBodySliceForSplitTextXAction,
    getBodySliceForTextXAction,
    getCustomBlockSlice,
    getCustomDecorationSlice,
    getCustomRangeSlice,
    getParagraphsSlice,
    getRichTextEditPath,
    getSectionBreakSlice,
    getTableSlice,
    getTextRunSlice,
    normalizeBody,
    SliceBodyType,
} from './text-x/utils';
export * from './types';
