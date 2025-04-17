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

export { DATA_VALIDATION_PLUGIN_NAME } from './common/const';
export { type IValidStatusChange, SheetDataValidationModel } from './models/sheet-data-validation-model';
export { UniverSheetsDataValidationPlugin } from './plugin';
export { DataValidationCacheService } from './services/dv-cache.service';
export { DataValidationCustomFormulaService } from './services/dv-custom-formula.service';
export { DataValidationFormulaService } from './services/dv-formula.service';
export { SheetsDataValidationValidatorService } from './services/dv-validator-service';
export { createDefaultNewRule } from './utils/create';
export { DataValidationFormulaController } from './controllers/dv-formula.controller';
export { getFormulaCellData, getFormulaResult } from './utils/formula';
export { getCellValueOrigin } from './utils/get-cell-data-origin';
export { ListValidator } from './validators/list-validator';
export { DateValidator } from './validators/date-validator';
export { CHECKBOX_FORMULA_1, CHECKBOX_FORMULA_2, CheckboxValidator, transformCheckboxValue } from './validators/checkbox-validator';
export { ListMultipleValidator } from './validators/list-multiple-validator';
export { deserializeListOptions, getDataValidationCellValue, serializeListOptions } from './validators/util';
export { isLegalFormulaResult } from './utils/formula';
export { getCellValueNumber } from './validators/decimal-validator';
export { getTransformedFormula } from './validators/util';
// #region - all commands

export {
    AddSheetDataValidationCommand,
    ClearRangeDataValidationCommand,
    getDataValidationDiffMutations,
    type IAddSheetDataValidationCommandParams,
    type IClearRangeDataValidationCommandParams,
    type IRemoveSheetAllDataValidationCommandParams,
    type IRemoveSheetDataValidationCommandParams,
    type IUpdateSheetDataValidationOptionsCommandParams,
    type IUpdateSheetDataValidationRangeCommandParams,
    type IUpdateSheetDataValidationSettingCommandParams,
    RemoveSheetAllDataValidationCommand,
    RemoveSheetDataValidationCommand,
    UpdateSheetDataValidationOptionsCommand,
    UpdateSheetDataValidationRangeCommand,
    UpdateSheetDataValidationSettingCommand,
} from './commands/commands/data-validation.command';

// #endregion

export const CUSTOM_FORMULA_INPUT_NAME = 'data-validation.custom-formula-input';
export const BASE_FORMULA_INPUT_NAME = 'data-validation.formula-input';
export const LIST_FORMULA_INPUT_NAME = 'data-validation.list-formula-input';
export const CHECKBOX_FORMULA_INPUT_NAME = 'data-validation.checkbox-formula-input';
