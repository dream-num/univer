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
import type { CellValue, IDataValidationRule, IDataValidationRuleBase } from '@univerjs/core';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { BASE_FORMULA_INPUT_NAME } from '../views/formula-input';
import { TWO_FORMULA_OPERATOR_COUNT } from '../types/const/two-formula-operators';
import { BaseDataValidator } from './base-data-validator';

const isValidDateString = (date: string) => {
    return dayjs(date).isValid();
};

export class DateValidator extends BaseDataValidator<Dayjs> {
    id: string = DataValidationType.DATE;
    title: string = 'dataValidation.date.title';
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

    isValidType(cellValue: CellValue, _rule: IDataValidationRule): boolean {
        if (typeof cellValue === 'string') {
            return dayjs(cellValue).isValid();
        }

        return false;
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

    transform(cellValue: CellValue, _rule: IDataValidationRule): Dayjs {
        return dayjs(cellValue as string);
    }

    async validatorIsEqual(cellValue: Dayjs, rule: IDataValidationRule): Promise<boolean> {
        if (!rule.formula1) {
            return false;
        }

        return cellValue.isSame(rule.formula1);
    }

    async validatorIsNotEqual(cellValue: Dayjs, rule: IDataValidationRule): Promise<boolean> {
        if (!rule.formula1) {
            return false;
        }

        return !cellValue.isSame(rule.formula1);
    }

    async validatorIsBetween(cellValue: Dayjs, rule: IDataValidationRule): Promise<boolean> {
        if (!rule.formula1 || !rule.formula2) {
            return false;
        }

        const date1 = dayjs(rule.formula1);
        const date2 = dayjs(rule.formula2);
        const min = date1.isAfter(date2) ? date1 : date2;
        const max = min === date1 ? date2 : date1;
        return (cellValue.isAfter(min) || cellValue.isSame(min)) && (cellValue.isBefore(max) || cellValue.isSame(max));
    }

    async validatorIsNotBetween(cellValue: Dayjs, rule: IDataValidationRule): Promise<boolean> {
        if (!rule.formula1 || !rule.formula2) {
            return false;
        }

        const date1 = dayjs(rule.formula1);
        const date2 = dayjs(rule.formula2);
        const min = date1.isAfter(date2) ? date1 : date2;
        const max = min === date1 ? date2 : date1;
        return cellValue.isBefore(min) || cellValue.isAfter(max);
    }

    async validatorIsGreaterThan(cellValue: Dayjs, rule: IDataValidationRule): Promise<boolean> {
        if (!rule.formula1) {
            return false;
        }

        return cellValue.isAfter(rule.formula1);
    }

    async validatorIsGreaterThanOrEqual(cellValue: Dayjs, rule: IDataValidationRule): Promise<boolean> {
        if (!rule.formula1) {
            return false;
        }

        return cellValue.isAfter(rule.formula1) || cellValue.isSame(rule.formula1);
    }

    async validatorIsLessThan(cellValue: Dayjs, rule: IDataValidationRule): Promise<boolean> {
        if (!rule.formula1) {
            return false;
        }

        return cellValue.isBefore(rule.formula1);
    }

    async validatorIsLessThanOrEqual(cellValue: Dayjs, rule: IDataValidationRule): Promise<boolean> {
        if (!rule.formula1) {
            return false;
        }

        return cellValue.isBefore(rule.formula1) || cellValue.isSame(rule.formula1);
    }

    validatorFormulaValue(rule: IDataValidationRuleBase): string | undefined {
        if (!Tools.isDefine(rule.operator)) {
            return undefined;
        }

        const isTwoFormula = TWO_FORMULA_OPERATOR_COUNT.includes(rule.operator);

        if (isTwoFormula) {
            if (Tools.isBlank(rule.formula1) || Tools.isBlank(rule.formula2)) {
                return '';
            } else {
                if (!isValidDateString(rule.formula1!) || !isValidDateString(rule.formula2!)) {
                    return '';
                }
            }
        } else {
            if (Tools.isBlank(rule.formula1)) {
                return '';
            }
        }
    }
}
