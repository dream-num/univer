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

import type { CellValue, IDataValidationRuleBase, IDataValidationRuleInfo, Nullable } from '@univerjs/core';
import { DataValidationOperator, LocaleService, Tools } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';
import { OperatorErrorTitleMap, OperatorTitleMap } from '../types/const/operator-text-map';
import type { IDataValidationRender } from '../types/interfaces';

const FORMULA1 = '{FORMULA1}';
const FORMULA2 = '{FORMULA2}';

const operatorNameMap: Record<DataValidationOperator, string> = {
    [DataValidationOperator.BETWEEN]: 'dataValidation.operators.between',
    [DataValidationOperator.EQUAL]: 'dataValidation.operators.equal',
    [DataValidationOperator.GREATER_THAN]: 'dataValidation.operators.greaterThan',
    [DataValidationOperator.GREATER_THAN_OR_EQUAL]: 'dataValidation.operators.greaterThanOrEqual',
    [DataValidationOperator.LESS_THAN]: 'dataValidation.operators.lessThan',
    [DataValidationOperator.LESS_THAN_OR_EQUAL]: 'dataValidation.operators.lessThanOrEqual',
    [DataValidationOperator.NOT_BETWEEN]: 'dataValidation.operators.notBetween',
    [DataValidationOperator.NOT_EQUAL]: 'dataValidation.operators.notEqual',
};

export abstract class BaseDataValidator<DataType = CellValue> {
    abstract id: string;

    abstract title: string;

    abstract operators: DataValidationOperator[];

    abstract scopes: string[] | string;

    abstract formulaInput: string;

    skipDefaultFontRender = false;

    canvasRender: Nullable<IDataValidationRender> = null;

    dropdown: string | undefined = undefined;

    constructor(
        @Inject(LocaleService) readonly localeService: LocaleService,
        @Inject(Injector) readonly injector: Injector
    ) { }

    get operatorNames() {
        return this.operators.map((operator) => this.localeService.t(operatorNameMap[operator]));
    }

    generateRuleName(rule: IDataValidationRuleBase): string {
        if (!rule.operator) {
            return this.title;
        }

        const ruleName = this.localeService.t(OperatorTitleMap[rule.operator]).replace(FORMULA1, rule.formula1 ?? '').replace(FORMULA2, rule.formula2 ?? '');
        return `${this.title} ${ruleName}`;
    }

    generateRuleErrorMessage(rule: IDataValidationRuleBase) {
        if (!rule.operator) {
            return this.title;
        }

        const errorMsg = this.localeService.t(OperatorErrorTitleMap[rule.operator]).replace(FORMULA1, rule.formula1 ?? '').replace(FORMULA2, rule.formula2 ?? '');
        return `${errorMsg}`;
    }

    isEmptyCellValue(cellValue: Nullable<CellValue>): cellValue is null | undefined | void {
        if (cellValue === '' || cellValue === undefined || cellValue === null) {
            return true;
        }

        return false;
    }

    abstract validatorFormula(rule: IDataValidationRuleBase): boolean;

    abstract isValidType(cellValue: CellValue, rule: IDataValidationRuleInfo): boolean | Promise<boolean>;

    abstract transform(cellValue: CellValue, rule: IDataValidationRuleInfo): DataType;

    abstract validatorIsEqual(cellValue: DataType, rule: IDataValidationRuleInfo): Promise<boolean>;

    abstract validatorIsNotEqual(cellValue: DataType, rule: IDataValidationRuleInfo): Promise<boolean>;

    abstract validatorIsBetween(cellValue: DataType, rule: IDataValidationRuleInfo): Promise<boolean>;

    abstract validatorIsNotBetween(cellValue: DataType, rule: IDataValidationRuleInfo): Promise<boolean>;

    abstract validatorIsGreaterThan(cellValue: DataType, rule: IDataValidationRuleInfo): Promise<boolean>;

    abstract validatorIsGreaterThanOrEqual(cellValue: DataType, rule: IDataValidationRuleInfo): Promise<boolean>;

    abstract validatorIsLessThan(cellValue: DataType, rule: IDataValidationRuleInfo): Promise<boolean>;

    abstract validatorIsLessThanOrEqual(cellValue: DataType, rule: IDataValidationRuleInfo): Promise<boolean>;

    async validator(cellValue: Nullable<CellValue>, info: IDataValidationRuleInfo): Promise<boolean> {
        const { rule } = info;
        const isEmpty = this.isEmptyCellValue(cellValue);
        const { allowBlank = true } = rule;
        if (isEmpty) {
            return allowBlank;
        }

        if (await !this.isValidType(cellValue, info)) {
            return false;
        }

        if (!Tools.isDefine(rule.operator)) {
            return true;
        }

        const transformedCell = this.transform(cellValue, info);

        switch (rule.operator) {
            case DataValidationOperator.BETWEEN:
                return this.validatorIsBetween(transformedCell, info);
            case DataValidationOperator.EQUAL:
                return this.validatorIsEqual(transformedCell, info);
            case DataValidationOperator.GREATER_THAN:
                return this.validatorIsGreaterThan(transformedCell, info);
            case DataValidationOperator.GREATER_THAN_OR_EQUAL:
                return this.validatorIsGreaterThanOrEqual(transformedCell, info);
            case DataValidationOperator.LESS_THAN:
                return this.validatorIsLessThan(transformedCell, info);
            case DataValidationOperator.LESS_THAN_OR_EQUAL:
                return this.validatorIsLessThanOrEqual(transformedCell, info);
            case DataValidationOperator.NOT_BETWEEN:
                return this.validatorIsNotBetween(transformedCell, info);
            case DataValidationOperator.NOT_EQUAL:
                return this.validatorIsNotEqual(transformedCell, info);
            default:
                throw new Error('Unknown operator.');
        }
    }
}
