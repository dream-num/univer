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

import type { CellValue, IDataValidationRule, IDataValidationRuleBase, LocaleService, Nullable } from '@univerjs/core';
import { DataValidationOperator } from '@univerjs/core';
import { OperatorTextMap } from '../types/const/operator-text-map';

const FORMULA1 = 'FORMULA1';
const FORMULA2 = 'FORMULA2';

export abstract class BaseDataValidator {
    abstract id: string;
    abstract title: string;
    abstract operators: DataValidationOperator[];

    abstract scopes: string[] | string;

    abstract formulaInput: string;

    constructor(
        private _localeService: LocaleService
    ) { }

    generateOperatorText(rule: IDataValidationRuleBase) {
        const operatorTextTemp = OperatorTextMap[rule.operator];
        const operatorText = this._localeService.t(operatorTextTemp).replace(FORMULA1, rule.formula1 ?? '').replace(FORMULA2, rule.formula2 ?? '');
        return operatorText;
    }

    generateRuleName(rule: IDataValidationRuleBase): string {
        const operatorText = this.generateOperatorText(rule);
        return `${this.title} ${operatorText}`;
    }

    generateRuleWarningMessage(rule: IDataValidationRuleBase) {
        const operatorText = this.generateOperatorText(rule);
        return `${this.title} ${operatorText}`;
    }

    isEmptyCellValue(cellValue: Nullable<CellValue>): cellValue is null | undefined | void {
        if (cellValue === '' || cellValue === undefined || cellValue === null) {
            return true;
        }

        return false;
    }

    abstract validatorIsEqual(cellValue: CellValue, rule: IDataValidationRule): Promise<boolean>;

    abstract validatorIsNotEqual(cellValue: CellValue, rule: IDataValidationRule): Promise<boolean>;

    abstract validatorIsBetween(cellValue: CellValue, rule: IDataValidationRule): Promise<boolean>;

    abstract validatorIsNotBetween(cellValue: CellValue, rule: IDataValidationRule): Promise<boolean>;

    abstract validatorIsGreaterThan(cellValue: CellValue, rule: IDataValidationRule): Promise<boolean>;

    abstract validatorIsGreaterThanOrEqual(cellValue: CellValue, rule: IDataValidationRule): Promise<boolean>;

    abstract validatorIsLessThan(cellValue: CellValue, rule: IDataValidationRule): Promise<boolean>;

    abstract validatorIsLessThanOrEqual(cellValue: CellValue, rule: IDataValidationRule): Promise<boolean>;

    validator(cellValue: Nullable<CellValue>, rule: IDataValidationRule): Promise<boolean> {
        const isEmpty = this.isEmptyCellValue(cellValue);
        const { allowBlank = true } = rule;
        if (isEmpty) {
            return Promise.resolve(allowBlank);
        }

        switch (rule.operator) {
            case DataValidationOperator.BETWEEN:
                return this.validatorIsBetween(cellValue, rule);
            case DataValidationOperator.EQUAL:
                return this.validatorIsEqual(cellValue, rule);
            case DataValidationOperator.GREATER_THAN:
                return this.validatorIsGreaterThan(cellValue, rule);
            case DataValidationOperator.GREATER_THAN_OR_EQUAL:
                return this.validatorIsGreaterThanOrEqual(cellValue, rule);
            case DataValidationOperator.LESS_THAN:
                return this.validatorIsLessThan(cellValue, rule);
            case DataValidationOperator.LESS_THAN_OR_EQUAL:
                return this.validatorIsLessThanOrEqual(cellValue, rule);
            case DataValidationOperator.NOT_BETWEEN:
                return this.validatorIsNotBetween(cellValue, rule);
            case DataValidationOperator.NOT_EQUAL:
                return this.validatorIsNotEqual(cellValue, rule);
            default:
                throw new Error('Unknown operator.');
        }
    }
}
