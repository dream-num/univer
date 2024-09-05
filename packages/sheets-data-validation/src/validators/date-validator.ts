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

import { DataValidationOperator, DataValidationType, isFormulaString, numfmt, Tools } from '@univerjs/core';
import type { CellValue, IDataValidationRule, IDataValidationRuleBase, Nullable } from '@univerjs/core';
import dayjs from 'dayjs';
import type { IFormulaResult, IFormulaValidResult, IValidatorCellInfo } from '@univerjs/data-validation';
import { BaseDataValidator } from '@univerjs/data-validation';
import { BASE_FORMULA_INPUT_NAME } from '../views/formula-input';
import { TWO_FORMULA_OPERATOR_COUNT } from '../types/const/two-formula-operators';
import { DataValidationFormulaService } from '../services/dv-formula.service';
import { getFormulaResult } from '../utils/formula';
import { DATE_DROPDOWN_KEY } from '../views';
import { DateOperatorErrorTitleMap, DateOperatorNameMap, DateOperatorTitleMap } from '../common/date-text-map';
import { DateShowTimeOption } from '../views/show-time';

const FORMULA1 = '{FORMULA1}';
const FORMULA2 = '{FORMULA2}';

const transformDate2SerialNumber = (value: Nullable<CellValue>) => {
    if (value === undefined || value === null || typeof value === 'boolean') {
        return undefined;
    }

    if (typeof value === 'number' || !Number.isNaN(+value)) {
        return +value;
    }

    // transform date string to serial number
    const v = numfmt.parseDate(value)?.v as number | undefined;
    if (Tools.isDefine(v)) {
        return v;
    }

    // support like 2020年11月11日 locale date
    return numfmt.parseDate(dayjs(value).format('YYYY-MM-DD HH:mm:ss'))?.v as number | undefined;
};

export class DateValidator extends BaseDataValidator<number> {
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
    override optionsInput = DateShowTimeOption.componentKey;
    override dropdown = DATE_DROPDOWN_KEY;

    private _formulaService = this.injector.get(DataValidationFormulaService);

    override async parseFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): Promise<IFormulaResult<number | undefined>> {
        const results = await this._formulaService.getRuleFormulaResult(unitId, subUnitId, rule.uid);
        const { formula1, formula2 } = rule;

        return {
            formula1: transformDate2SerialNumber(isFormulaString(formula1) ? getFormulaResult(results?.[0]?.result) : formula1),
            formula2: transformDate2SerialNumber(isFormulaString(formula2) ? getFormulaResult(results?.[1]?.result) : formula2),
        };
    }

    parseFormulaSync(rule: IDataValidationRule, unitId: string, subUnitId: string) {
        const results = this._formulaService.getRuleFormulaResultSync(unitId, subUnitId, rule.uid);
        const { formula1, formula2 } = rule;

        return {
            formula1: transformDate2SerialNumber(isFormulaString(formula1) ? getFormulaResult(results?.[0]?.result) : formula1),
            formula2: transformDate2SerialNumber(isFormulaString(formula2) ? getFormulaResult(results?.[1]?.result) : formula2),
        };
    }

    override async isValidType(info: IValidatorCellInfo): Promise<boolean> {
        const { interceptValue, value } = info;
        if (typeof value === 'number' && typeof interceptValue === 'string') {
            return true;
        }

        if (typeof interceptValue === 'string') {
            return Boolean(numfmt.parseDate(interceptValue));
        }

        return false;
    }

    private _validatorSingleFormula(formula: string | undefined) {
        return !Tools.isBlank(formula) && (isFormulaString(formula) || !Number.isNaN(+formula!) || Boolean(formula && numfmt.parseDate(formula)));
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

    override normlizeFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): { formula1: string | undefined; formula2: string | undefined } {
        const { formula1, formula2, bizInfo } = rule;
        const normlizeSingleFormula = (formula: string | undefined) => {
            if (!formula) {
                return formula;
            }
            const res = numfmt.parseDate(formula)?.v as number;
            if (res === undefined || res === null) {
                return '';
            }
            const date = numfmt.dateFromSerial(res) as unknown as [number, number, number, number, number, number];
            return dayjs(`${date[0]}/${date[1]}/${date[2]} ${date[3]}:${date[4]}:${date[5]}`).format(bizInfo?.showTime ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD');
        };

        return {
            formula1: isFormulaString(formula1) ? formula1 : normlizeSingleFormula(`${formula1}`),
            formula2: isFormulaString(formula2) ? formula2 : normlizeSingleFormula(`${formula2}`),
        };
    }

    override transform(cellInfo: IValidatorCellInfo<CellValue>, _formula: IFormulaResult, _rule: IDataValidationRule): IValidatorCellInfo<number> {
        const { value } = cellInfo;

        return {
            ...cellInfo,
            value: transformDate2SerialNumber(value)!,
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
