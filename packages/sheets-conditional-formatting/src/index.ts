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

export * from './base/const';
export * from './models/conditional-formatting-rule-model';
export * from './models/conditional-formatting-view-model';
export * from './models/icon-map';
export * from './models/type';
export { UniverSheetsConditionalFormattingPlugin } from './plugin';
export * from './render/data-bar.render';
export * from './render/icon.render';
export * from './render/type';
export * from './services/conditional-formatting.service';
export * from './services/conditional-formatting-formula.service';
export * from './models/calculate-unit-v2/utils';
export * from './utils/anchor';
export * from './utils/create-cf-id';
export * from './utils/is-ranges-equal';
export * from './utils/remove-undefined-attr';
export * from './utils/type';

// #region - all commands

export {
    AddCfCommand,
    type IAddCfCommandParams,
} from './commands/commands/add-cf.command';
export {
    ClearRangeCfCommand,
    type IClearRangeCfParams,
} from './commands/commands/clear-range-cf.command';
export {
    ClearWorksheetCfCommand,
    type IClearWorksheetCfParams,
} from './commands/commands/clear-worksheet-cf.command';
export {
    DeleteCfCommand,
    type IDeleteCfCommandParams,
} from './commands/commands/delete-cf.command';
export {
    type IMoveCfCommandParams,
    MoveCfCommand,
} from './commands/commands/move-cf.command';
export {
    type ISetCfCommandParams,
    SetCfCommand,
} from './commands/commands/set-cf.command';

export {
    AddConditionalRuleMutation,
    AddConditionalRuleMutationUndoFactory,
    type IAddConditionalRuleMutationParams,
} from './commands/mutations/add-conditional-rule.mutation';
export {
    DeleteConditionalRuleMutation,
    DeleteConditionalRuleMutationUndoFactory,
    type IDeleteConditionalRuleMutationParams,
} from './commands/mutations/delete-conditional-rule.mutation';
export { ConditionalFormattingFormulaMarkDirty } from './commands/mutations/formula-mark-dirty.mutation';
export {
    type IMoveConditionalRuleMutationParams,
    MoveConditionalRuleMutation,
    MoveConditionalRuleMutationUndoFactory,
} from './commands/mutations/move-conditional-rule.mutation';
export {
    type ISetConditionalRuleMutationParams,
    SetConditionalRuleMutation,
    setConditionalRuleMutationUndoFactory,
} from './commands/mutations/set-conditional-rule.mutation';

// #endregion
