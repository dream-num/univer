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

import type { CellValue, DataValidationOperator, IDataValidationRule, IDataValidationRuleBase, ISheetDataValidationRule, LocaleService, Nullable } from '@univerjs/core';
import type { IFormulaResult, IFormulaValidResult, IValidatorCellInfo } from '@univerjs/data-validation';
import { DataValidationType, isFormulaString, Tools, WrapStrategy } from '@univerjs/core';
import { BaseDataValidator } from '@univerjs/data-validation';
import { DataValidationFormulaService } from '../services/dv-formula.service';
import { getFormulaResult, isLegalFormulaResult } from '../utils/formula';

export const CHECKBOX_FORMULA_1 = 1;
export const CHECKBOX_FORMULA_2 = 0;

interface ICheckboxFormulaResult extends IFormulaResult {
    originFormula1: Nullable<CellValue>;
    originFormula2: Nullable<CellValue>;
}

function getFailMessage(formula: string | undefined, localeService: LocaleService) {
    if (Tools.isBlank(formula)) {
        return localeService.t('dataValidation.validFail.value');
    }

    if (isFormulaString(formula)) {
        return localeService.t('dataValidation.validFail.primitive');
    }

    return '';
}

export const transformCheckboxValue = (value: Nullable<CellValue>) =>
    Tools.isDefine(value) && String(value).toLowerCase() === 'true'
        ? '1'
        : String(value).toLowerCase() === 'false'
            ? '0'
            : value;

export class CheckboxValidator extends BaseDataValidator {
    override id: string = DataValidationType.CHECKBOX;
    override title: string = 'dataValidation.checkbox.title';
    override operators: DataValidationOperator[] = [];
    override scopes: string | string[] = ['sheet'];
    order = 41;
    override readonly offsetFormulaByRange = false;

    private _formulaService = this.injector.get(DataValidationFormulaService);

    override skipDefaultFontRender = (rule: ISheetDataValidationRule, cellValue: Nullable<CellValue>, pos: { unitId: string; subUnitId: string; row: number; column: number }) => {
        const { unitId, subUnitId } = pos;
        const { formula1, formula2 } = this.parseFormulaSync(rule, unitId, subUnitId);

        const valueStr = `${cellValue ?? ''}`;

        const res = !valueStr || (valueStr === (`${formula1}`) || valueStr === `${formula2}`);
        return res;
    };

    override validatorFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): IFormulaValidResult {
        const { formula1, formula2 } = rule;
        const isEqual = formula1 === formula2;

        if (Tools.isBlank(formula1) && Tools.isBlank(formula2)) {
            return {
                success: true,
            };
        }

        if (isEqual) {
            return {
                success: false,
                formula1: this.localeService.t('dataValidation.validFail.checkboxEqual'),
                formula2: this.localeService.t('dataValidation.validFail.checkboxEqual'),
            };
        }

        const error1 = getFailMessage(formula1, this.localeService);
        const error2 = getFailMessage(formula2, this.localeService);

        return {
            success: (!error1 && !error2),
            formula1: error1,
            formula2: error2,
        };
    }

    override async parseFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): Promise<ICheckboxFormulaResult> {
        const { formula1 = CHECKBOX_FORMULA_1, formula2 = CHECKBOX_FORMULA_2 } = rule;
        const results = await this._formulaService.getRuleFormulaResult(unitId, subUnitId, rule.uid);

        const originFormula1 = isFormulaString(formula1) ? getFormulaResult(results?.[0]?.result?.[0][0]) : formula1;
        const originFormula2 = isFormulaString(formula2) ? getFormulaResult(results?.[1]?.result?.[0][0]) : formula2;
        const isFormulaValid = isLegalFormulaResult(String(originFormula1)) && isLegalFormulaResult(String(originFormula2));

        return {
            formula1: transformCheckboxValue(originFormula1),
            formula2: transformCheckboxValue(originFormula2),
            originFormula1,
            originFormula2,
            isFormulaValid,
        };
    }

    override getExtraStyle(rule: IDataValidationRule, value: Nullable<CellValue>) {
        return {
            tb: WrapStrategy.CLIP,
        };
    }

    parseFormulaSync(rule: IDataValidationRule, unitId: string, subUnitId: string): ICheckboxFormulaResult {
        const { formula1 = CHECKBOX_FORMULA_1, formula2 = CHECKBOX_FORMULA_2 } = rule;
        const results = this._formulaService.getRuleFormulaResultSync(unitId, subUnitId, rule.uid);
        const originFormula1 = isFormulaString(formula1) ? getFormulaResult(results?.[0]?.result?.[0][0]) : formula1;
        const originFormula2 = isFormulaString(formula2) ? getFormulaResult(results?.[1]?.result?.[0][0]) : formula2;
        const isFormulaValid = isLegalFormulaResult(String(originFormula1)) && isLegalFormulaResult(String(originFormula2)); // TODO@Dushusir Handling return type errors, not sure if this is correct

        return {
            formula1: transformCheckboxValue(originFormula1),
            formula2: transformCheckboxValue(originFormula2),
            originFormula1,
            originFormula2,
            isFormulaValid,
        };
    }

    override async isValidType(cellInfo: IValidatorCellInfo<CellValue>, formula: IFormulaResult, rule: IDataValidationRule): Promise<boolean> {
        const { value, unitId, subUnitId } = cellInfo;
        const { formula1, formula2, originFormula1, originFormula2 } = await this.parseFormula(rule, unitId, subUnitId);
        if (!Tools.isDefine(formula1) || !Tools.isDefine(formula2)) {
            return true;
        }

        return Tools.isDefine(value) && (
            String(value) === String(formula1)
            || String(value) === String(formula2)
            || String(value) === String(originFormula1 ?? '')
            || String(value) === String(originFormula2 ?? '')
        );
    }

    override generateRuleErrorMessage(rule: IDataValidationRuleBase): string {
        return this.localeService.t('dataValidation.checkbox.error');
    }

    override generateRuleName(rule: IDataValidationRuleBase): string {
        return this.titleStr;
    }
}
