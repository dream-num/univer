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

import { type CellValue, DataValidationOperator, DataValidationType, type IDataValidationRule, Tools } from '@univerjs/core';
import { BASE_FORMULA_INPUT_NAME } from '../views/formula-input';
import { BaseDataValidator } from './base-data-validator';

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

    isValidType(cellValue: CellValue, _rule: IDataValidationRule): boolean {
        return typeof cellValue === 'string' || typeof cellValue === 'number';
    }

    transform(cellValue: CellValue, _rule: IDataValidationRule): number {
        return cellValue.toString().length;
    }

    async validatorIsEqual(cellValue: number, rule: IDataValidationRule): Promise<boolean> {
        if (!Tools.isDefine(rule.formula1)) {
            return false;
        }

        return cellValue === +rule.formula1;
    }

    async validatorIsNotEqual(cellValue: number, rule: IDataValidationRule): Promise<boolean> {
        if (!Tools.isDefine(rule.formula1)) {
            return false;
        }

        return cellValue !== +rule.formula1;
    }

    async validatorIsBetween(cellValue: number, rule: IDataValidationRule): Promise<boolean> {
        if (!Tools.isDefine(rule.formula1) || !Tools.isDefine(rule.formula2)) {
            return false;
        }

        const max = Math.max(+rule.formula1, +rule.formula2);
        const min = Math.min(+rule.formula1, +rule.formula2);

        return cellValue >= min && cellValue <= max;
    }

    async validatorIsNotBetween(cellValue: number, rule: IDataValidationRule): Promise<boolean> {
        if (!Tools.isDefine(rule.formula1) || !Tools.isDefine(rule.formula2)) {
            return false;
        }

        const max = Math.max(+rule.formula1, +rule.formula2);
        const min = Math.min(+rule.formula1, +rule.formula2);

        return cellValue >= min && cellValue <= max;
    }

    async validatorIsGreaterThan(cellValue: number, rule: IDataValidationRule): Promise<boolean> {
        if (!Tools.isDefine(rule.formula1)) {
            return false;
        }

        return cellValue > +rule.formula1;
    }

    async validatorIsGreaterThanOrEqual(cellValue: number, rule: IDataValidationRule): Promise<boolean> {
        if (!Tools.isDefine(rule.formula1)) {
            return false;
        }

        return cellValue >= +rule.formula1;
    }

    async validatorIsLessThan(cellValue: number, rule: IDataValidationRule): Promise<boolean> {
        if (!Tools.isDefine(rule.formula1)) {
            return false;
        }

        return cellValue < +rule.formula1;
    }

    async validatorIsLessThanOrEqual(cellValue: number, rule: IDataValidationRule): Promise<boolean> {
        if (!Tools.isDefine(rule.formula1)) {
            return false;
        }

        return cellValue <= +rule.formula1;
    }
}
