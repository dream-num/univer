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

export type { IUniverDocsConfig } from './controllers/config.schema';
export { UniverDocsPlugin } from './plugin';
export { DocInterceptorService } from './services/doc-interceptor/doc-interceptor.service';
export { DOC_INTERCEPTOR_POINT } from './services/doc-interceptor/interceptor-const';
export { DocSelectionManagerService } from './services/doc-selection-manager.service';
export { DocSkeletonManagerService } from './services/doc-skeleton-manager.service';
export { addCustomRangeBySelectionFactory, addCustomRangeFactory, deleteCustomRangeFactory } from './utils/custom-range-factory';
export { replaceSelectionFactory } from './utils/replace-selection-factory';
export type { IDocStateChangeInfo, IDocStateChangeParams } from './services/doc-state-emit.service';
export { DocStateEmitService } from './services/doc-state-emit.service';

// #region - all commands

export {
    type IRichTextEditingMutationParams,
    RichTextEditingMutation,
} from './commands/mutations/core-editing.mutation';

export {
    type ISetTextSelectionsOperationParams,
    SetTextSelectionsOperation,
} from './commands/operations/text-selection.operation';

// #endregion
