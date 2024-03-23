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
import type { IFormulaResult, IFormulaValidResult, IValidatorCellInfo } from '@univerjs/data-validation/validators/base-data-validator.js';
import { CheckboxRender } from '../widgets/checkbox-widget';
import { DataValidationFormulaService } from '../services/dv-formula.service';
import { getFormulaResult } from '../utils/formula';

export const CHECKBOX_FORMULA_1 = 1;
export const CHECKBOX_FORMULA_2 = 0;

export class CheckboxValidator extends BaseDataValidator {
    override id: string = DataValidationType.CHECKBOX;
    override title: string = 'dataValidation.checkbox.title';
    override operators: DataValidationOperator[] = [];
    override scopes: string | string[] = ['sheet'];
    override formulaInput: string;
    override skipDefaultFontRender = true;

    override canvasRender = this.injector.createInstance(CheckboxRender);

    private _formulaService = this.injector.get(DataValidationFormulaService);

    override validatorFormula(rule: IDataValidationRuleBase): IFormulaValidResult {
        const { formula1 = CHECKBOX_FORMULA_1, formula2 = CHECKBOX_FORMULA_2 } = rule;
        const formula1Success = typeof formula1 === 'string';
        const formula2Success = typeof formula2 === 'string';

        return {
            success: formula1Success && formula2Success,
            formula1: !formula1Success ? this.localeService.t('dataValidation.validFail.common') : '',
            formula2: !formula2Success ? this.localeService.t('dataValidation.validFail.common') : '',
        };
    }

    override async parseFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): Promise<IFormulaResult> {
        const { formula1 = CHECKBOX_FORMULA_1, formula2 = CHECKBOX_FORMULA_2 } = rule;
        const results = await this._formulaService.getRuleFormulaResult(unitId, subUnitId, rule.uid);
        return {
            formula1: isFormulaString(formula1) ? getFormulaResult(results?.[0]?.result) : formula1,
            formula2: isFormulaString(formula2) ? getFormulaResult(results?.[1]?.result) : formula2,
        };
    }

    parseFormulaSync(rule: IDataValidationRule, unitId: string, subUnitId: string) {
        const { formula1 = CHECKBOX_FORMULA_1, formula2 = CHECKBOX_FORMULA_2 } = rule;
        const results = this._formulaService.getRuleFormulaResultSync(unitId, subUnitId, rule.uid);
        return {
            formula1: isFormulaString(formula1) ? getFormulaResult(results?.[0]?.result) : formula1,
            formula2: isFormulaString(formula2) ? getFormulaResult(results?.[1]?.result) : formula2,
        };
    }

    override async isValidType(cellInfo: IValidatorCellInfo<CellValue>, formula: IFormulaResult, rule: IDataValidationRule): Promise<boolean> {
        const { value, unitId, subUnitId } = cellInfo;
        const { formula1, formula2 } = await this.parseFormula(rule, unitId, subUnitId);
        if (!Tools.isDefine(formula1) || !Tools.isDefine(formula2)) {
            return true;
        }

        return Tools.isDefine(value) && (value === formula1 || value === formula2);
    }

    override generateRuleErrorMessage(rule: IDataValidationRuleBase): string {
        return this.localeService.t('dataValidation.checkbox.error');
    }
}
