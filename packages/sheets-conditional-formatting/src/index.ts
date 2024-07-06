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

export { UniverSheetsConditionalFormattingPlugin } from './plugin';
export * from './base/const';
export * from './models/type';
export * from './models/conditional-formatting-rule-model';
export * from './models/conditional-formatting-view-model';
export * from './utils/get-string-from-data-stream';
export * from './utils/is-ranges-equal';
export * from './utils/remove-undefined-attr';
export * from './utils/type';
export * from './services/conditional-formatting.service';
export * from './services/calculate-unit/utils';
export * from './services/calculate-unit/type';
export * from './render/data-bar.render';
export * from './render/icon.render';
export * from './render/type';
export * from './models/icon-map';
export * from './services/conditional-formatting-formula.service';
export * from './utils/anchor';
export * from './utils/create-cf-id';

// #region - all commands

export { AddConditionalRuleMutationUndoFactory, AddConditionalRuleMutation, type IAddConditionalRuleMutationParams } from './commands/mutations/add-conditional-rule.mutation';
export { DeleteConditionalRuleMutation, DeleteConditionalRuleMutationUndoFactory, type IDeleteConditionalRuleMutationParams } from './commands/mutations/delete-conditional-rule.mutation';
export { ConditionalFormattingFormulaMarkDirty } from './commands/mutations/formula-mark-dirty.mutation';
export { MoveConditionalRuleMutation, MoveConditionalRuleMutationUndoFactory, type IMoveConditionalRuleMutationParams } from './commands/mutations/move-conditional-rule.mutation';
export { SetConditionalRuleMutation, setConditionalRuleMutationUndoFactory, type ISetConditionalRuleMutationParams } from './commands/mutations/set-conditional-rule.mutation';

// #endregion

