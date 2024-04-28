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

export { UniverDataValidationPlugin } from './plugin';
export { DataValidatorRegistryService, DataValidatorRegistryScope } from './services/data-validator-registry.service';
export { DataValidationModel } from './models/data-validation-model';

export {
    AddDataValidationCommand,
    RemoveDataValidationCommand,
    RemoveAllDataValidationCommand,
    UpdateDataValidationOptionsCommand,
    UpdateDataValidationSettingCommand,
} from './commands/commands/data-validation.command';

export type {
    IRemoveDataValidationCommandParams,
    IAddDataValidationCommandParams,
    IUpdateDataValidationOptionsCommandParams,
    IUpdateDataValidationSettingCommandParams,
    IRemoveAllDataValidationCommandParams,
} from './commands/commands/data-validation.command';

export {
    AddDataValidationMutation,
    RemoveDataValidationMutation,
    UpdateDataValidationMutation,

} from './commands/mutations/data-validation.mutation';

export type {
    IAddDataValidationMutationParams,
    IRemoveDataValidationMutationParams,
    IUpdateDataValidationMutationParams,
} from './commands/mutations/data-validation.mutation';

export {
    createDefaultNewRule,
    getRuleOptions,
    getRuleSetting,
} from './common/util';

export { UpdateRuleType } from './types/enum/update-rule-type';
export type { IDataValidatorOperatorConfig } from './types/interfaces/i-data-validator-operator-config';
export type { IFormulaInputProps, IFormulaValue, FormulaInputType } from './types/interfaces/i-formula-input';
export type { IUpdateRuleOptionsPayload, IUpdateRulePayload, IUpdateRuleRangePayload, IUpdateRuleSettingPayload } from './types/interfaces/i-update-rule-payload';
export type { IDataValidationDropdownProps } from './types/interfaces/i-data-validation-drop-down';
export { BaseDataValidator } from './validators/base-data-validator';
export type { IFormulaResult, IValidatorCellInfo } from './validators/base-data-validator';
export type { IBaseDataValidationWidget } from './validators/base-widget';
export { DataValidationManager } from './models/data-validation-manager';
export type { IFormulaValidResult } from './validators/base-data-validator';
export { removeDataValidationUndoFactory } from './commands/commands/data-validation.command';
export { TWO_FORMULA_OPERATOR_COUNT } from './types/const/two-formula-operators';
export { DataValidationResourceController } from './controllers/dv-resource.controller';
export { DataValidationSheetController } from './controllers/dv-sheet.controller';
export { TextLengthErrorTitleMap } from './types/const/operator-text-map';
