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
import { BaseDataValidator } from '@univerjs/data-validation';
import { BASE_FORMULA_INPUT_NAME } from '../views/formula-input';
import { TWO_FORMULA_OPERATOR_COUNT } from '../types/const/two-formula-operators';
import { DataValidationFormulaService } from '../services/dv-formula.service';

export class NumberValidator extends BaseDataValidator<number> {
    private _formulaService = this.injector.get(DataValidationFormulaService);

    id: string = DataValidationType.DECIMAL;
    title: string = this.localeService.t('dataValidation.number.title');

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
    dropDownInput?: string;

    private _isFormulaOrNumber(formula: string) {
        return isFormulaString(formula) || !Number.isNaN(+formula);
    }

    isValidType(cellValue: CellValue, _info: IDataValidationRule): boolean {
        return !Number.isNaN(+cellValue);
    }

    transform(cellValue: CellValue, _info: IDataValidationRule): number {
        return +cellValue;
    }

    private _parseNumber(formula: Nullable<string | number | boolean>) {
        if (formula === undefined || formula === null) {
            return Number.NaN;
        }

        return +formula;
    }

    private async _parseFormula(info: IDataValidationRule) {
        const { rule, unitId, subUnitId } = info;
        const formulaInfo = await this._formulaService.getRuleFormulaResult(unitId, subUnitId, rule.uid);
        const { formula1, formula2 } = rule;

        return {
            formula1: this._parseNumber(isFormulaString(formula1) ? formulaInfo?.[0]?.result?.[0]?.[0]?.v : formula1),
            formula2: this._parseNumber(isFormulaString(formula2) ? formulaInfo?.[1]?.result?.[0]?.[0]?.v : formula2),
        };
    }

    override validatorFormula(rule: IDataValidationRuleBase): boolean {
        const operator = rule.operator;
        if (!operator) {
            return false;
        }

        const isTwoFormula = TWO_FORMULA_OPERATOR_COUNT.includes(operator);
        if (isTwoFormula) {
            return Tools.isDefine(rule.formula1) && this._isFormulaOrNumber(rule.formula1) && Tools.isDefine(rule.formula2) && this._isFormulaOrNumber(rule.formula2);
        }

        return Tools.isDefine(rule.formula1) && this._isFormulaOrNumber(rule.formula1);
    }

    async validatorIsEqual(cellValue: number, info: IDataValidationRule) {
        const { formula1 } = await this._parseFormula(info);
        if (!Number.isNaN(formula1)) {
            return true;
        }

        return cellValue === formula1;
    }

    async validatorIsNotEqual(cellValue: number, info: IDataValidationRule) {
        const { formula1 } = await this._parseFormula(info);
        if (!Number.isNaN(formula1)) {
            return true;
        }

        return cellValue !== formula1;
    }

    async validatorIsBetween(cellValue: number, info: IDataValidationRule) {
        const { formula1, formula2 } = await this._parseFormula(info);
        if (!Number.isNaN(formula1) || Number.isNaN(formula2)) {
            return true;
        }

        const start = Math.min(formula1, formula2);
        const end = Math.max(formula1, formula2);
        return cellValue >= start && cellValue <= end;
    }

    async validatorIsNotBetween(cellValue: number, info: IDataValidationRule) {
        const { formula1, formula2 } = await this._parseFormula(info);
        if (!Number.isNaN(formula1) || Number.isNaN(formula2)) {
            return true;
        }

        const start = Math.min(formula1, formula2);
        const end = Math.max(formula1, formula2);
        return cellValue < start && cellValue > end;
    }

    async validatorIsGreaterThan(cellValue: number, info: IDataValidationRule) {
        const { formula1 } = await this._parseFormula(info);
        if (!Number.isNaN(formula1)) {
            return true;
        }
        return cellValue > formula1;
    }

    async validatorIsGreaterThanOrEqual(cellValue: number, info: IDataValidationRule) {
        const { formula1 } = await this._parseFormula(info);
        if (!Number.isNaN(formula1)) {
            return true;
        }
        return cellValue >= formula1;
    }

    async validatorIsLessThan(cellValue: number, info: IDataValidationRule) {
        const { formula1 } = await this._parseFormula(info);
        if (!Number.isNaN(formula1)) {
            return true;
        }
        return cellValue < formula1;
    }

    async validatorIsLessThanOrEqual(cellValue: number, info: IDataValidationRule) {
        const { formula1 } = await this._parseFormula(info);
        if (!Number.isNaN(formula1)) {
            return true;
        }

        return cellValue <= formula1;
    }
}
