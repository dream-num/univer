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

export {
    getRuleOptions,
    getRuleSetting,
} from './common/util';
export { DataValidationResourceController } from './controllers/dv-resource.controller';

export { type DataValidationChangeSource, type DataValidationChangeType, DataValidationModel, type IRuleChange } from './models/data-validation-model';
export { UniverDataValidationPlugin } from './plugin';
export { DataValidatorRegistryScope, DataValidatorRegistryService } from './services/data-validator-registry.service';
export { TextLengthErrorTitleMap } from './types/const/operator-text-map';
export { TWO_FORMULA_OPERATOR_COUNT } from './types/const/two-formula-operators';
export { UpdateRuleType } from './types/enum/update-rule-type';
export type { IDataValidationDropdownProps } from './types/interfaces/i-data-validation-drop-down';
export type { IDataValidatorOperatorConfig } from './types/interfaces/i-data-validator-operator-config';
export type { FormulaInputType, IFormulaInputProps, IFormulaValue } from './types/interfaces/i-formula-input';
export type { IUpdateRuleOptionsPayload, IUpdateRulePayload, IUpdateRuleRangePayload, IUpdateRuleSettingPayload } from './types/interfaces/i-update-rule-payload';
export { BaseDataValidator } from './validators/base-data-validator';
export type { IFormulaResult, IValidatorCellInfo } from './validators/base-data-validator';
export type { IFormulaValidResult } from './validators/base-data-validator';
export type { IBaseDataValidationWidget } from './validators/base-widget';
export { DataValidatorDropdownType } from './validators/base-data-validator';
export { FORMULA1, FORMULA2, TYPE } from './validators/base-data-validator';

// #region - all commands
export {
    AddDataValidationMutation,
    type IAddDataValidationMutationParams,
    type IRemoveDataValidationMutationParams,
    type IUpdateDataValidationMutationParams,
    RemoveDataValidationMutation,
    UpdateDataValidationMutation,
} from './commands/mutations/data-validation.mutation';

// #endregion
