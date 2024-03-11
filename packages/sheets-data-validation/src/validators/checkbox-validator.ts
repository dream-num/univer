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

import { DataValidationType, isFormulaString, Tools } from '@univerjs/core';
import type { CellValue, DataValidationOperator, IDataValidationRule, IDataValidationRuleBase, IStyleData, Nullable } from '@univerjs/core';
import { BaseDataValidator } from '@univerjs/data-validation';
import type { IFormulaResult, IValidatorCellInfo } from '@univerjs/data-validation/validators/base-data-validator.js';
import { CheckboxRender } from '../widgets/checkbox-widget';
import { DataValidationFormulaService } from '../services/dv-formula.service';

export const CHECKBOX_FORMULA_1 = 'TRUE';
export const CHECKBOX_FORMULA_2 = 'FALSE';

export class CheckboxValidator extends BaseDataValidator {
    override id: string = DataValidationType.CHECKBOX;
    override title: string = 'dataValidation.checkbox.title';
    override operators: DataValidationOperator[] = [];
    override scopes: string | string[] = ['sheet'];
    override formulaInput: string;
    override skipDefaultFontRender = true;

    override canvasRender = this.injector.createInstance(CheckboxRender);

    private _formulaService = this.injector.get(DataValidationFormulaService);

    override validatorFormula(rule: IDataValidationRuleBase): boolean {
        const { formula1 = CHECKBOX_FORMULA_1, formula2 = CHECKBOX_FORMULA_2 } = rule;
        return typeof formula1 === 'string' && formula2 === 'string';
    }

    override async parseFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): Promise<IFormulaResult> {
        const { formula1 = CHECKBOX_FORMULA_1, formula2 = CHECKBOX_FORMULA_2 } = rule;
        const results = await this._formulaService.getRuleFormulaResult(unitId, subUnitId, rule.uid);
        return {
            formula1: isFormulaString(formula1) ? results?.[0]?.result?.[0]?.[0] : formula1,
            formula2: isFormulaString(formula2) ? results?.[1]?.result?.[0]?.[0] : formula2,
        };
    }

    override async isValidType(cellInfo: IValidatorCellInfo<CellValue>, formula: IFormulaResult, rule: IDataValidationRule): Promise<boolean> {
        const { value, unitId, subUnitId } = cellInfo;
        const { formula1, formula2 } = await this.parseFormula(rule, unitId, subUnitId);
        if (!formula1 || !formula2) {
            return true;
        }

        return !Tools.isDefine(value) && (value === formula1 || value === formula2);
    }
}
