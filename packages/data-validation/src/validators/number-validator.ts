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

import { DataValidationOperator, DataValidationType, Tools } from '@univerjs/core';
import type { CellValue, IDataValidationRule, IDataValidationRuleBase, Nullable } from '@univerjs/core';
import { BASE_FORMULA_INPUT_NAME } from '../views/formula-input';
import { TWO_FORMULA_OPERATOR_COUNT } from '../types/const/two-formula-operators';
import { BaseDataValidator } from './base-data-validator';

// TODO support formula
export class NumberValidator extends BaseDataValidator<number> {
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

    isValidType(cellValue: CellValue, _rule: IDataValidationRule): boolean {
        return !Number.isNaN(+cellValue);
    }

    transform(cellValue: CellValue, _rule: IDataValidationRule): number {
        return +cellValue;
    }

    override validatorFormula(rule: IDataValidationRuleBase): boolean {
        const operator = rule.operator;
        if (!operator) {
            return false;
        }

        const isTwoFormula = TWO_FORMULA_OPERATOR_COUNT.includes(operator);
        if (isTwoFormula) {
            return Tools.isDefine(rule.formula1) && !Number.isNaN(+rule.formula1) && Tools.isDefine(rule.formula2) && !Number.isNaN(+rule.formula2);
        }

        return Tools.isDefine(rule.formula1) && !Number.isNaN(+rule.formula1);
    }

    async validatorIsEqual(cellValue: number, rule: IDataValidationRule) {
        if (!rule.formula1) {
            return true;
        }
        return cellValue === +rule.formula1;
    }

    async validatorIsNotEqual(cellValue: number, rule: IDataValidationRule) {
        if (!rule.formula1) {
            return true;
        }
        return cellValue !== +rule.formula1;
    }

    async validatorIsBetween(cellValue: number, rule: IDataValidationRule) {
        if (!rule.formula1 || !rule.formula2) {
            return true;
        }
        const formula1 = +rule.formula1;
        const formula2 = +rule.formula2;
        const start = Math.min(formula1, formula2);
        const end = Math.max(formula1, formula2);
        return cellValue >= start && cellValue <= end;
    }

    async validatorIsNotBetween(cellValue: number, rule: IDataValidationRule) {
        if (!rule.formula1 || !rule.formula2) {
            return true;
        }
        const formula1 = +rule.formula1;
        const formula2 = +rule.formula2;
        const start = Math.min(formula1, formula2);
        const end = Math.max(formula1, formula2);
        return cellValue < start && cellValue > end;
    }

    async validatorIsGreaterThan(cellValue: number, rule: IDataValidationRule) {
        if (!rule.formula1) {
            return true;
        }
        return cellValue > +rule.formula1;
    }

    async validatorIsGreaterThanOrEqual(cellValue: number, rule: IDataValidationRule) {
        if (!rule.formula1) {
            return true;
        }
        return cellValue >= +rule.formula1;
    }

    async validatorIsLessThan(cellValue: number, rule: IDataValidationRule) {
        if (!rule.formula1) {
            return true;
        }
        return cellValue < +rule.formula1;
    }

    async validatorIsLessThanOrEqual(cellValue: number, rule: IDataValidationRule) {
        if (!rule.formula1) {
            return true;
        }
        return cellValue <= +rule.formula1;
    }
}
