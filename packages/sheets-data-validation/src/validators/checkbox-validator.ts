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
import type { CellValue, DataValidationOperator, IDataValidationRule, IDataValidationRuleBase, ISheetDataValidationRule, Nullable } from '@univerjs/core';
import { BaseDataValidator } from '@univerjs/data-validation';
import type { IFormulaResult, IFormulaValidResult, IValidatorCellInfo } from '@univerjs/data-validation';
import type { ISheetLocation } from '@univerjs/sheets';
import { CheckboxRender } from '../widgets/checkbox-widget';
import { DataValidationFormulaService } from '../services/dv-formula.service';
import { getFormulaResult } from '../utils/formula';
import { CHECKBOX_FORMULA_INPUT_NAME } from '../views/formula-input';

export const CHECKBOX_FORMULA_1 = 1;
export const CHECKBOX_FORMULA_2 = 0;

export class CheckboxValidator extends BaseDataValidator {
    override id: string = DataValidationType.CHECKBOX;
    override title: string = 'dataValidation.checkbox.title';
    override operators: DataValidationOperator[] = [];
    override scopes: string | string[] = ['sheet'];
    override formulaInput: string = CHECKBOX_FORMULA_INPUT_NAME;

    override canvasRender = this.injector.createInstance(CheckboxRender);

    private _formulaService = this.injector.get(DataValidationFormulaService);

    override skipDefaultFontRender(rule: ISheetDataValidationRule, cellValue: Nullable<CellValue>, pos: ISheetLocation) {
        const { formula1, formula2 } = this.parseFormulaSync(rule, pos.unitId, pos.subUnitId);

        const valueStr = `${cellValue ?? ''}`;
        return !valueStr || (valueStr === (`${formula1}`) || valueStr === `${formula2}`);
    }

    override validatorFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): IFormulaValidResult {
        const { formula1, formula2 } = rule;
        const formula1Success = !Tools.isBlank(formula1);
        const formula2Success = !Tools.isBlank(formula2);
        const isEqual = formula1 === formula2;

        return {
            success: (formula1Success && formula2Success && !isEqual) || (!formula1Success && !formula2Success),
            formula1: !formula1Success ?
                this.localeService.t('dataValidation.validFail.common')
                : isEqual ?
                    this.localeService.t('dataValidation.validFail.checkboxEqual')
                    : '',
            formula2: !formula2Success ?
                this.localeService.t('dataValidation.validFail.common')
                : isEqual ?
                    this.localeService.t('dataValidation.validFail.checkboxEqual')
                    : '',
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

        return Tools.isDefine(value) && (String(value) === String(formula1) || String(value) === String(formula2));
    }

    override generateRuleErrorMessage(rule: IDataValidationRuleBase): string {
        return this.localeService.t('dataValidation.checkbox.error');
    }
}
