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
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { IFormulaResult, IFormulaValidResult, IValidatorCellInfo } from '@univerjs/data-validation';
import { BaseDataValidator } from '@univerjs/data-validation';
import { BASE_FORMULA_INPUT_NAME } from '../views/formula-input';
import { TWO_FORMULA_OPERATOR_COUNT } from '../types/const/two-formula-operators';
import { serialTimeToTimestamp } from '../utils/date';
import { DataValidationFormulaService } from '../services/dv-formula.service';
import { getFormulaResult } from '../utils/formula';
import { DATE_DROPDOWN_KEY } from '../views';
import { DateOperatorErrorTitleMap, DateOperatorNameMap, DateOperatorTitleMap } from '../common/date-text-map';

const FORMULA1 = '{FORMULA1}';
const FORMULA2 = '{FORMULA2}';

const isValidDateString = (date: string) => {
    return dayjs(date).isValid();
};

const transformDate = (value: Nullable<CellValue>) => {
    if (value === undefined || value === null || typeof value === 'boolean') {
        return undefined;
    }

    if (typeof value === 'number' || !Number.isNaN(+value)) {
        return dayjs(serialTimeToTimestamp(+value));
    }

    return dayjs(value);
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
    override dropdown = DATE_DROPDOWN_KEY;

    private _formulaService = this.injector.get(DataValidationFormulaService);

    override async parseFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): Promise<IFormulaResult<Dayjs | undefined>> {
        const results = await this._formulaService.getRuleFormulaResult(unitId, subUnitId, rule.uid);
        const { formula1, formula2 } = rule;

        return {
            formula1: transformDate(isFormulaString(formula1) ? getFormulaResult(results?.[0]?.result) : formula1),
            formula2: transformDate(isFormulaString(formula2) ? getFormulaResult(results?.[1]?.result) : formula2),
        };
    }

    transformDate = transformDate;

    override async isValidType(info: IValidatorCellInfo): Promise<boolean> {
        const { value } = info;
        if (typeof value === 'string') {
            return dayjs(value).isValid();
        }

        if (typeof value === 'number') {
            return true;
        }

        return false;
    }

    private _validatorSingleFormula(formula: string | undefined) {
        return !Tools.isBlank(formula) && (isFormulaString(formula) || !Number.isNaN(+formula!) || (Boolean(formula) && dayjs(formula).isValid()));
    }

    override validatorFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): IFormulaValidResult {
        const operator = rule.operator;
        if (!operator) {
            return {
                success: false,
            };
        }

        const formula1Success = this._validatorSingleFormula(rule.formula1);
        const errorMsg = this.localeService.t('dataValidation.validFail.date');
        const isTwoFormula = TWO_FORMULA_OPERATOR_COUNT.includes(operator);
        if (isTwoFormula) {
            const formula2Success = this._validatorSingleFormula(rule.formula2);
            return {
                success: formula1Success && formula2Success,
                formula1: formula1Success ? undefined : errorMsg,
                formula2: formula2Success ? undefined : errorMsg,
            };
        }

        return {
            success: formula1Success,
            formula1: formula1Success ? undefined : errorMsg,
        };
    }

    override transform(cellInfo: IValidatorCellInfo<CellValue>, _formula: IFormulaResult, _rule: IDataValidationRule): IValidatorCellInfo<Dayjs> {
        const { value } = cellInfo;

        return {
            ...cellInfo,
            value: transformDate(value)!,
        };
    }

    override async validatorIsEqual(info: IValidatorCellInfo<Dayjs>, formula: IFormulaResult<Dayjs | undefined>, _rule: IDataValidationRule): Promise<boolean> {
        const { value } = info;
        const { formula1 } = formula;
        if (!formula1) {
            return true;
        }

        return value.isSame(formula1);
    }

    override async validatorIsNotEqual(info: IValidatorCellInfo<Dayjs>, formula: IFormulaResult<Dayjs | undefined>): Promise<boolean> {
        const { value } = info;
        const { formula1 } = formula;
        if (!formula1) {
            return true;
        }

        return !value.isSame(formula1);
    }

    override async validatorIsBetween(info: IValidatorCellInfo<Dayjs>, formula: IFormulaResult<Dayjs | undefined>): Promise<boolean> {
        const { value: cellValue } = info;
        const { formula1: date1, formula2: date2 } = formula;
        if (!date1 || !date2) {
            return false;
        }

        const min = date1.isAfter(date2) ? date2 : date1;
        const max = min === date1 ? date2 : date1;
        return (cellValue.isAfter(min) || cellValue.isSame(min)) && (cellValue.isBefore(max) || cellValue.isSame(max));
    }

    override async validatorIsNotBetween(info: IValidatorCellInfo<Dayjs>, formula: IFormulaResult<Dayjs | undefined>): Promise<boolean> {
        const { value: cellValue } = info;
        const { formula1: date1, formula2: date2 } = formula;
        if (!date1 || !date2) {
            return false;
        }
        const min = date1.isAfter(date2) ? date2 : date1;
        const max = min === date1 ? date2 : date1;
        return cellValue.isBefore(min) || cellValue.isAfter(max);
    }

    override async validatorIsGreaterThan(info: IValidatorCellInfo<Dayjs>, formula: IFormulaResult<Dayjs | undefined>): Promise<boolean> {
        const { value } = info;

        const { formula1 } = formula;
        if (!formula1) {
            return true;
        }
        return value.isAfter(formula1);
    }

    override async validatorIsGreaterThanOrEqual(info: IValidatorCellInfo<Dayjs>, formula: IFormulaResult<Dayjs | undefined>): Promise<boolean> {
        const { value: cellValue } = info;

        const { formula1 } = formula;
        if (!formula1) {
            return true;
        }

        return cellValue.isAfter(formula1) || cellValue.isSame(formula1);
    }

    override async validatorIsLessThan(info: IValidatorCellInfo<Dayjs>, formula: IFormulaResult<Dayjs | undefined>): Promise<boolean> {
        const { value: cellValue } = info;

        const { formula1 } = formula;
        if (!formula1) {
            return true;
        }

        return cellValue.isBefore(formula1) || cellValue.isSame(formula1);
    }

    override async validatorIsLessThanOrEqual(info: IValidatorCellInfo<Dayjs>, formula: IFormulaResult<Dayjs | undefined>): Promise<boolean> {
        const { value: cellValue } = info;

        const { formula1 } = formula;
        if (!formula1) {
            return true;
        }

        return cellValue.isBefore(formula1) || cellValue.isSame(formula1);
    }

    validatorFormulaValue(rule: IDataValidationRule): string | undefined {
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

    override get operatorNames() {
        return this.operators.map((operator) => this.localeService.t(DateOperatorNameMap[operator]));
    }

    override generateRuleName(rule: IDataValidationRuleBase): string {
        if (!rule.operator) {
            return this.titleStr;
        }

        const ruleName = this.localeService.t(DateOperatorTitleMap[rule.operator]).replace(FORMULA1, rule.formula1 ?? '').replace(FORMULA2, rule.formula2 ?? '');
        return `${this.titleStr} ${ruleName}`;
    }

    override generateRuleErrorMessage(rule: IDataValidationRuleBase) {
        if (!rule.operator) {
            return this.titleStr;
        }

        const errorMsg = this.localeService.t(DateOperatorErrorTitleMap[rule.operator]).replace(FORMULA1, rule.formula1 ?? '').replace(FORMULA2, rule.formula2 ?? '');
        return `${errorMsg}`;
    }
}
