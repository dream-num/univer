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

import type { CellValue, IDataValidationRule, Nullable } from '@univerjs/core';
import type { IFormulaResult, IFormulaValidResult, IValidatorCellInfo } from '@univerjs/data-validation';
import { DataValidationOperator, DataValidationType, isFormulaString, Tools } from '@univerjs/core';
import { BaseDataValidator } from '@univerjs/data-validation';
import { DataValidationFormulaService } from '../services/dv-formula.service';
import { TWO_FORMULA_OPERATOR_COUNT } from '../types/const/two-formula-operators';

export function getCellValueNumber(cellValue: CellValue) {
    let str = cellValue;
    if (typeof cellValue === 'string') {
        if (cellValue.startsWith('¥') || cellValue.startsWith('$')) {
            str = cellValue.slice(1);
        }

        return +str;
    }

    return +cellValue;
}

export class DecimalValidator extends BaseDataValidator<number> {
    private _formulaService = this.injector.get(DataValidationFormulaService);

    id: string = DataValidationType.DECIMAL;
    title: string = 'dataValidation.decimal.title';

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

    private _isFormulaOrNumber(formula: string) {
        return !Tools.isBlank(formula) && (isFormulaString(formula) || !Number.isNaN(+formula));
    }

    override async isValidType(cellInfo: IValidatorCellInfo<CellValue>, formula: IFormulaResult, rule: IDataValidationRule) {
        const { value: cellValue } = cellInfo;

        return !Number.isNaN(getCellValueNumber(cellValue));
    }

    override transform(cellInfo: IValidatorCellInfo<CellValue>, formula: IFormulaResult, rule: IDataValidationRule) {
        const { value: cellValue } = cellInfo;

        return {
            ...cellInfo,
            value: getCellValueNumber(cellValue),
        };
    }

    private _parseNumber(formula: Nullable<string | number | boolean>) {
        if (formula === undefined || formula === null) {
            return Number.NaN;
        }

        return +formula;
    }

    async parseFormula(rule: IDataValidationRule, unitId: string, subUnitId: string) {
        const formulaInfo = await this._formulaService.getRuleFormulaResult(unitId, subUnitId, rule.uid);
        const { formula1, formula2 } = rule;

        const info = {
            formula1: this._parseNumber(isFormulaString(formula1) ? formulaInfo?.[0]?.result?.[0]?.[0]?.v : formula1),
            formula2: this._parseNumber(isFormulaString(formula2) ? formulaInfo?.[1]?.result?.[0]?.[0]?.v : formula2),
        };

        return info;
    }

    override validatorFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): IFormulaValidResult {
        const operator = rule.operator;
        if (!operator) {
            return {
                success: false,
            };
        }
        const formula1Success = Tools.isDefine(rule.formula1) && this._isFormulaOrNumber(rule.formula1);
        const formula2Success = Tools.isDefine(rule.formula2) && this._isFormulaOrNumber(rule.formula2);
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
            formula1: formula1Success ? '' : errorMsg,
        };
    }

    override async validatorIsEqual(cellInfo: IValidatorCellInfo<CellValue>, formula: IFormulaResult, rule: IDataValidationRule) {
        const { formula1 } = formula;
        const { value: cellValue } = cellInfo;
        if (Number.isNaN(formula1)) {
            return true;
        }

        return cellValue === formula1;
    }

    override async validatorIsNotEqual(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, _rule: IDataValidationRule) {
        const { formula1 } = formula;
        if (Number.isNaN(formula1)) {
            return true;
        }

        return cellInfo.value !== formula1;
    }

    override async validatorIsBetween(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, _rule: IDataValidationRule) {
        const { formula1, formula2 } = formula;
        if (Number.isNaN(formula1) || Number.isNaN(formula2)) {
            return true;
        }

        const start = Math.min(formula1, formula2);
        const end = Math.max(formula1, formula2);
        return cellInfo.value >= start && cellInfo.value <= end;
    }

    override async validatorIsNotBetween(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, _rule: IDataValidationRule) {
        const { formula1, formula2 } = formula;
        if (Number.isNaN(formula1) || Number.isNaN(formula2)) {
            return true;
        }
        const start = Math.min(formula1, formula2);
        const end = Math.max(formula1, formula2);
        return cellInfo.value < start || cellInfo.value > end;
    }

    override async validatorIsGreaterThan(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, _rule: IDataValidationRule) {
        const { formula1 } = formula;
        if (Number.isNaN(formula1)) {
            return true;
        }
        return cellInfo.value > formula1;
    }

    override async validatorIsGreaterThanOrEqual(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, _rule: IDataValidationRule) {
        const { formula1 } = formula;
        if (Number.isNaN(formula1)) {
            return true;
        }
        return cellInfo.value >= formula1;
    }

    override async validatorIsLessThan(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, _rule: IDataValidationRule) {
        const { formula1 } = formula;
        if (Number.isNaN(formula1)) {
            return true;
        }
        return cellInfo.value < formula1;
    }

    override async validatorIsLessThanOrEqual(cellInfo: IValidatorCellInfo<number>, formula: IFormulaResult, _rule: IDataValidationRule) {
        const { formula1 } = formula;
        if (Number.isNaN(formula1)) {
            return true;
        }

        return cellInfo.value <= formula1;
    }
}
