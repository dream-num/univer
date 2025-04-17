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

import type { CellValue, IDataValidationRule, IDataValidationRuleBase, IStyleData, Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { CellValueType } from '@univerjs/protocol';
import type { ISheetLocationBase } from '@univerjs/sheets';
import type { IBaseDataValidationWidget } from './base-widget';
import { DataValidationOperator, Inject, Injector, LocaleService } from '@univerjs/core';
import { OperatorErrorTitleMap, OperatorTitleMap } from '../types/const/operator-text-map';

export const FORMULA1 = '{FORMULA1}';
export const FORMULA2 = '{FORMULA2}';
export const TYPE = '{TYPE}';

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

export interface IValidatorCellInfo<DataType = Nullable<CellValue>> {
    value: DataType;
    interceptValue: Nullable<CellValue>;
    row: number;
    column: number;
    unitId: string;
    subUnitId: string;
    worksheet: Worksheet;
    workbook: Workbook;
    t: Nullable<CellValueType>;
}

export interface IFormulaResult<T = any> {
    formula1: T;
    formula2: T;
    isFormulaValid: boolean;
}

export interface IFormulaValidResult {
    success: boolean;
    formula1?: string;
    formula2?: string;
}

export enum DataValidatorDropdownType {
    DATE = 'date',
    TIME = 'time',
    DATETIME = 'datetime',
    LIST = 'list',
    MULTIPLE_LIST = 'multipleList',
    COLOR = 'color',
    CASCADE = 'cascade',
}

export abstract class BaseDataValidator {
    abstract id: string;
    abstract title: string;
    abstract operators: DataValidationOperator[];
    abstract scopes: string[] | string;
    abstract order: number;

    offsetFormulaByRange = true;

    // #region UI related

    formulaInput: string | undefined = undefined;
    canvasRender: Nullable<IBaseDataValidationWidget> = null;
    dropdownType: DataValidatorDropdownType | undefined = undefined;
    optionsInput: string | undefined = undefined;

    // #endregion

    constructor(
        @Inject(LocaleService) readonly localeService: LocaleService,
        @Inject(Injector) readonly injector: Injector
    ) {
        // empty
    }

    get operatorNames() {
        return this.operators.map((operator) => this.localeService.t(operatorNameMap[operator]));
    }

    get titleStr() {
        return this.localeService.t(this.title);
    }

    skipDefaultFontRender: ((rule: IDataValidationRule, cellValue: Nullable<CellValue>, pos: any) => boolean) | undefined;

    generateRuleName(rule: IDataValidationRuleBase): string {
        if (!rule.operator) {
            return this.localeService.t(OperatorTitleMap.NONE).replace(TYPE, this.titleStr);
        }

        const ruleName = this.localeService.t(OperatorTitleMap[rule.operator]).replace(FORMULA1, rule.formula1 ?? '').replace(FORMULA2, rule.formula2 ?? '');
        return `${this.titleStr} ${ruleName}`;
    }

    generateRuleErrorMessage(rule: IDataValidationRuleBase, position: ISheetLocationBase) {
        if (!rule.operator) {
            return this.localeService.t(OperatorErrorTitleMap.NONE).replace(TYPE, this.titleStr); ;
        }

        const errorMsg = this.localeService.t(OperatorErrorTitleMap[rule.operator]).replace(FORMULA1, rule.formula1 ?? '').replace(FORMULA2, rule.formula2 ?? '');
        return `${errorMsg}`;
    }

    getExtraStyle(rule: IDataValidationRuleBase, value: Nullable<CellValue>, ctx: { style: IStyleData }, row: number, column: number): Nullable<IStyleData> {}

    getRuleFinalError(rule: IDataValidationRule, position: ISheetLocationBase) {
        if (rule.showErrorMessage && rule.error) {
            return rule.error;
        }

        return this.generateRuleErrorMessage(rule, position);
    }

    isEmptyCellValue(cellValue: Nullable<CellValue>): cellValue is null | undefined | void {
        if (cellValue === '' || cellValue === undefined || cellValue === null) {
            return true;
        }

        return false;
    }

    abstract parseFormula(rule: IDataValidationRule, unitId: string, subUnitId: string, row: number, column: number): Promise<IFormulaResult<number | undefined>>;

    abstract validatorFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): IFormulaValidResult;

    normalizeFormula(rule: IDataValidationRule, unitId: string, subUnitId: string) {
        return {
            formula1: rule.formula1,
            formula2: rule.formula2,
        };
    }

    async isValidType(cellInfo: IValidatorCellInfo, formula: IFormulaResult, rule: IDataValidationRule): Promise<boolean> {
        return true;
    };

    transform(cellInfo: IValidatorCellInfo, formula: IFormulaResult, rule: IDataValidationRule): IValidatorCellInfo<number> {
        return cellInfo as IValidatorCellInfo<number>;
    };

    async validatorIsEqual(cellInfo: IValidatorCellInfo<CellValue>, formula: IFormulaResult, rule: IDataValidationRule) {
        const { formula1 } = formula;
        const { value: cellValue } = cellInfo;
        if (Number.isNaN(formula1)) {
            return true;
        }

        return cellValue === formula1;
    }

    async validatorIsNotEqual(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, _rule: IDataValidationRule) {
        const { formula1 } = formula;
        if (Number.isNaN(formula1)) {
            return true;
        }

        return cellInfo.value !== formula1;
    }

    async validatorIsBetween(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, _rule: IDataValidationRule) {
        const { formula1, formula2 } = formula;
        if (Number.isNaN(formula1) || Number.isNaN(formula2)) {
            return true;
        }

        const start = Math.min(formula1, formula2);
        const end = Math.max(formula1, formula2);
        return cellInfo.value >= start && cellInfo.value <= end;
    }

    async validatorIsNotBetween(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, _rule: IDataValidationRule) {
        const { formula1, formula2 } = formula;
        if (Number.isNaN(formula1) || Number.isNaN(formula2)) {
            return true;
        }
        const start = Math.min(formula1, formula2);
        const end = Math.max(formula1, formula2);
        return cellInfo.value < start || cellInfo.value > end;
    }

    async validatorIsGreaterThan(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, _rule: IDataValidationRule) {
        const { formula1 } = formula;
        if (Number.isNaN(formula1)) {
            return true;
        }
        return cellInfo.value > formula1;
    }

    async validatorIsGreaterThanOrEqual(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, _rule: IDataValidationRule) {
        const { formula1 } = formula;
        if (Number.isNaN(formula1)) {
            return true;
        }
        return cellInfo.value >= formula1;
    }

    async validatorIsLessThan(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, _rule: IDataValidationRule) {
        const { formula1 } = formula;
        if (Number.isNaN(formula1)) {
            return true;
        }
        return cellInfo.value < formula1;
    }

    async validatorIsLessThanOrEqual(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, _rule: IDataValidationRule) {
        const { formula1 } = formula;
        if (Number.isNaN(formula1)) {
            return true;
        }

        return cellInfo.value <= formula1;
    }

    async validator(cellInfo: IValidatorCellInfo, rule: IDataValidationRule): Promise<boolean> {
        const { value: cellValue, unitId, subUnitId } = cellInfo;
        const isEmpty = this.isEmptyCellValue(cellValue);
        const { allowBlank = true, operator } = rule;
        if (isEmpty) {
            return allowBlank;
        }

        const formulaInfo = await this.parseFormula(rule, unitId, subUnitId, cellInfo.row, cellInfo.column);

        if (!formulaInfo.isFormulaValid) {
            return false;
        }

        if (!(await this.isValidType(cellInfo, formulaInfo, rule))) {
            return false;
        }

        if (!operator) {
            return true;
        }

        const transformedCell = this.transform(cellInfo, formulaInfo, rule);

        switch (operator) {
            case DataValidationOperator.BETWEEN:
                return this.validatorIsBetween(transformedCell, formulaInfo, rule);
            case DataValidationOperator.EQUAL:
                return this.validatorIsEqual(transformedCell, formulaInfo, rule);
            case DataValidationOperator.GREATER_THAN:
                return this.validatorIsGreaterThan(transformedCell, formulaInfo, rule);
            case DataValidationOperator.GREATER_THAN_OR_EQUAL:
                return this.validatorIsGreaterThanOrEqual(transformedCell, formulaInfo, rule);
            case DataValidationOperator.LESS_THAN:
                return this.validatorIsLessThan(transformedCell, formulaInfo, rule);
            case DataValidationOperator.LESS_THAN_OR_EQUAL:
                return this.validatorIsLessThanOrEqual(transformedCell, formulaInfo, rule);
            case DataValidationOperator.NOT_BETWEEN:
                return this.validatorIsNotBetween(transformedCell, formulaInfo, rule);
            case DataValidationOperator.NOT_EQUAL:
                return this.validatorIsNotEqual(transformedCell, formulaInfo, rule);
            default:
                throw new Error('Unknown operator.');
        }
    }
}
