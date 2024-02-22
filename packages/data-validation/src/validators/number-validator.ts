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

import { DataValidationOperator, DataValidationType } from '@univerjs/core';
import type { CellValue, IDataValidationRule, Nullable } from '@univerjs/core';
import { BASE_FORMULA_INPUT_NAME } from '../views/formula-input';
import { BaseDataValidator } from './base-data-validator';

// TODO support formula
export class NumberValidator extends BaseDataValidator {
    id: string = DataValidationType.DECIMAL;
    title: string = 'dataValidation.type.number';

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

    async validatorIsEqual(cellValue: CellValue, rule: IDataValidationRule) {
        if (!rule.formula1) {
            return true;
        }
        return +cellValue === +rule.formula1;
    }

    async validatorIsNotEqual(cellValue: CellValue, rule: IDataValidationRule) {
        if (!rule.formula1) {
            return true;
        }
        return +cellValue !== +rule.formula1;
    }

    async validatorIsBetween(cellValue: CellValue, rule: IDataValidationRule) {
        if (!rule.formula1 || !rule.formula2) {
            return true;
        }
        const formula1 = +rule.formula1;
        const formula2 = +rule.formula2;
        const start = Math.min(formula1, formula2);
        const end = Math.max(formula1, formula2);
        const value = +cellValue;
        return value >= start && value <= end;
    }

    async validatorIsNotBetween(cellValue: CellValue, rule: IDataValidationRule) {
        if (!rule.formula1 || !rule.formula2) {
            return true;
        }
        const formula1 = +rule.formula1;
        const formula2 = +rule.formula2;
        const start = Math.min(formula1, formula2);
        const end = Math.max(formula1, formula2);
        const value = +cellValue;
        return value < start && value > end;
    }

    async validatorIsGreaterThan(cellValue: CellValue, rule: IDataValidationRule) {
        if (!rule.formula1) {
            return true;
        }
        return +cellValue > +rule.formula1;
    }

    async validatorIsGreaterThanOrEqual(cellValue: CellValue, rule: IDataValidationRule) {
        if (!rule.formula1) {
            return true;
        }
        return +cellValue >= +rule.formula1;
    }

    async validatorIsLessThan(cellValue: CellValue, rule: IDataValidationRule) {
        if (!rule.formula1) {
            return true;
        }
        return +cellValue < +rule.formula1;
    }

    async validatorIsLessThanOrEqual(cellValue: CellValue, rule: IDataValidationRule) {
        if (!rule.formula1) {
            return true;
        }
        return +cellValue <= +rule.formula1;
    }
}
