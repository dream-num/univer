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

import { DataValidationOperator, DataValidationType, isFormulaString, Tools } from '@univerjs/core';
import type { CellValue, IDataValidationRule, IDataValidationRuleBase, Nullable } from '@univerjs/core';
import type { IFormulaResult, IFormulaValidResult, IValidatorCellInfo } from '@univerjs/data-validation';
import { BaseDataValidator, TextLengthErrorTitleMap } from '@univerjs/data-validation';
import { BASE_FORMULA_INPUT_NAME } from '../views/formula-input';
import { TWO_FORMULA_OPERATOR_COUNT } from '../types/const/two-formula-operators';
import { DataValidationFormulaService } from '../services/dv-formula.service';

const FORMULA1 = '{FORMULA1}';
const FORMULA2 = '{FORMULA2}';

export class TextLengthValidator extends BaseDataValidator<number> {
    id: string = DataValidationType.TEXT_LENGTH;
    title: string = 'dataValidation.textLength.title';

    operators: DataValidationOperator[] = [
        DataValidationOperator.BETWEEN,
        DataValidationOperator.EQUAL,
        DataValidationOperator.GREATER_THAN,
        DataValidationOperator.GREATER_THAN_OR_EQUAL,
        DataValidationOperator.LESS_THAN,
        DataValidationOperator.LESS_THAN_OR_EQUAL,
        DataValidationOperator.NOT_BETWEEN,
        DataValidationOperator.NOT_EQUAL,
    ];

    scopes: string | string[] = ['sheet'];
    formulaInput: string = BASE_FORMULA_INPUT_NAME;

    private _formulaService = this.injector.get(DataValidationFormulaService);

    private _isFormulaOrInt(formula: string) {
        return !Tools.isBlank(formula) && (isFormulaString(formula) || (!Number.isNaN(+formula) && Number.isInteger(+formula)));
    }

    override validatorFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): IFormulaValidResult {
        const operator = rule.operator;
        if (!operator) {
            return {
                success: false,
            };
        }
        const formula1Success = Tools.isDefine(rule.formula1) && this._isFormulaOrInt(rule.formula1);
        const formula2Success = Tools.isDefine(rule.formula2) && this._isFormulaOrInt(rule.formula2);
        const isTwoFormula = TWO_FORMULA_OPERATOR_COUNT.includes(operator);
        const errorMsg = this.localeService.t('dataValidation.validFail.number');
        if (isTwoFormula) {
            return {
                success: formula1Success && formula2Success,
                formula1: formula1Success ? undefined : errorMsg,
                formula2: formula2Success ? undefined : errorMsg,
            };
        }

        return {
            success: formula1Success,
            formula1: errorMsg,
        };
    }

    private _parseNumber(formula: Nullable<string | number | boolean>) {
        if (formula === undefined || formula === null) {
            return Number.NaN;
        }

        return +formula;
    }

    private _isValidFormula(formula: number) {
        return !Number.isNaN(formula);
    }

    override async parseFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): Promise<IFormulaResult<any>> {
        const formulaInfo = await this._formulaService.getRuleFormulaResult(unitId, subUnitId, rule.uid);
        const { formula1, formula2 } = rule;

        return {
            formula1: this._parseNumber(isFormulaString(formula1) ? formulaInfo?.[0]?.result?.[0]?.[0]?.v : formula1),
            formula2: this._parseNumber(isFormulaString(formula2) ? formulaInfo?.[1]?.result?.[0]?.[0]?.v : formula2),
        };
    }

    override transform(cellInfo: IValidatorCellInfo<CellValue>, _formula: IFormulaResult, _rule: IDataValidationRule) {
        return {
            ...cellInfo,
            value: cellInfo.value.toString().length,
        };
    }

    override async isValidType(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, rule: IDataValidationRule) {
        const { value: cellValue } = cellInfo;
        return typeof cellValue === 'string' || typeof cellValue === 'number';
    }

    override async validatorIsEqual(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, rule: IDataValidationRule): Promise<boolean> {
        const { formula1 } = formula;
        if (!Tools.isDefine(formula1)) {
            return false;
        }

        return cellInfo.value === formula1;
    }

    override async validatorIsNotEqual(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, rule: IDataValidationRule): Promise<boolean> {
        const { formula1 } = formula;
        if (!Tools.isDefine(formula1)) {
            return false;
        }

        return cellInfo.value !== formula1;
    }

    override async validatorIsBetween(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, rule: IDataValidationRule): Promise<boolean> {
        const { formula1, formula2 } = formula;
        const { value: cellValue } = cellInfo;
        if (!this._isValidFormula(formula1) || !this._isValidFormula(formula2)) {
            return false;
        }

        const max = Math.max(formula1, formula2);
        const min = Math.min(formula1, formula2);

        return cellValue >= min && cellValue <= max;
    }

    override async validatorIsNotBetween(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, rule: IDataValidationRule): Promise<boolean> {
        const { formula1, formula2 } = formula;
        const { value: cellValue } = cellInfo;
        if (!this._isValidFormula(formula1) || !this._isValidFormula(formula2)) {
            return false;
        }

        const max = Math.max(formula1, formula2);
        const min = Math.min(formula1, formula2);

        return cellValue < min || cellValue > max;
    }

    override async validatorIsGreaterThan(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, rule: IDataValidationRule): Promise<boolean> {
        const { formula1 } = formula;
        const { value: cellValue } = cellInfo;
        if (!this._isValidFormula(formula1)) {
            return false;
        }

        return cellValue > formula1;
    }

    override async validatorIsGreaterThanOrEqual(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, rule: IDataValidationRule): Promise<boolean> {
        const { formula1 } = formula;
        const { value: cellValue } = cellInfo;
        if (!this._isValidFormula(formula1)) {
            return false;
        }

        return cellValue >= formula1;
    }

    override async validatorIsLessThan(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, rule: IDataValidationRule): Promise<boolean> {
        const { formula1 } = formula;
        const { value: cellValue } = cellInfo;
        if (!this._isValidFormula(formula1)) {
            return false;
        }

        return cellValue < formula1;
    }

    override async validatorIsLessThanOrEqual(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, rule: IDataValidationRule): Promise<boolean> {
        const { formula1 } = formula;
        const { value: cellValue } = cellInfo;
        if (!this._isValidFormula(formula1)) {
            return false;
        }

        return cellValue <= formula1;
    }

    override generateRuleErrorMessage(rule: IDataValidationRuleBase) {
        if (!rule.operator) {
            return this.titleStr;
        }

        const errorMsg = this.localeService.t(TextLengthErrorTitleMap[rule.operator]).replace(FORMULA1, rule.formula1 ?? '').replace(FORMULA2, rule.formula2 ?? '');
        return `${errorMsg}`;
    }
}
