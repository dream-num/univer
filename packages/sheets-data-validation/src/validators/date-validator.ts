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

import type { CellValue, IDataValidationRule, IDataValidationRuleBase, ISheetDataValidationRule, Nullable } from '@univerjs/core';
import type { IFormulaResult, IFormulaValidResult, IValidatorCellInfo } from '@univerjs/data-validation';
import type { ISheetLocationBase } from '@univerjs/sheets';
import { DataValidationOperator, DataValidationType, dayjs, isFormulaString, numfmt, Tools } from '@univerjs/core';
import { BaseDataValidator } from '@univerjs/data-validation';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { DateOperatorErrorTitleMap, DateOperatorNameMap, DateOperatorTitleMap } from '../common/date-text-map';
import { DataValidationCustomFormulaService } from '../services/dv-custom-formula.service';
import { TWO_FORMULA_OPERATOR_COUNT } from '../types/const/two-formula-operators';
import { isLegalFormulaResult } from '../utils/formula';
import { FORMULA1, FORMULA2 } from './const';
import { getTransformedFormula } from './util';

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

export class DateValidator extends BaseDataValidator {
    id: string = DataValidationType.DATE;
    title: string = 'dataValidation.date.title';
    order = 40;
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
    private readonly _customFormulaService = this.injector.get(DataValidationCustomFormulaService);
    private readonly _lexerTreeBuilder = this.injector.get(LexerTreeBuilder);

    override async parseFormula(rule: IDataValidationRule, unitId: string, subUnitId: string, row: number, column: number): Promise<IFormulaResult<number | undefined>> {
        const formulaResult1 = await this._customFormulaService.getCellFormulaValue(unitId, subUnitId, rule.uid, row, column);
        const formulaResult2 = await this._customFormulaService.getCellFormula2Value(unitId, subUnitId, rule.uid, row, column);

        const { formula1, formula2 } = rule;
        const isFormulaValid = isLegalFormulaResult(String(formulaResult1?.v)) && isLegalFormulaResult(String(formulaResult2?.v));

        return {
            formula1: transformDate2SerialNumber(isFormulaString(formula1) ? formulaResult1?.v : formula1),
            formula2: transformDate2SerialNumber(isFormulaString(formula2) ? formulaResult2?.v : formula2),
            isFormulaValid,
        };
    }

    override async isValidType(info: IValidatorCellInfo): Promise<boolean> {
        const { interceptValue, value } = info;

        if (typeof value === 'number' && typeof interceptValue === 'string') {
            return Boolean(numfmt.parseDate(interceptValue));
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
                success: true,
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

    override normalizeFormula(rule: IDataValidationRule, _unitId: string, _subUnitId: string): { formula1: string | undefined; formula2: string | undefined } {
        const { formula1, formula2, bizInfo } = rule;
        const normlizeSingleFormula = (formula: string | undefined) => {
            if (!formula) {
                return formula;
            }
            let date;
            if (!Number.isNaN(+formula)) {
                date = numfmt.dateFromSerial(+formula);
            } else {
                const res = numfmt.parseDate(formula)?.v as number;
                if (res === undefined || res === null) {
                    return '';
                }
                date = numfmt.dateFromSerial(res);
            }

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

    override get operatorNames() {
        return this.operators.map((operator) => this.localeService.t(DateOperatorNameMap[operator]));
    }

    override generateRuleName(rule: IDataValidationRuleBase): string {
        if (!rule.operator) {
            return this.localeService.t(DateOperatorTitleMap.NONE);
        }

        const ruleName = this.localeService.t(DateOperatorTitleMap[rule.operator]).replace(FORMULA1, rule.formula1 ?? '').replace(FORMULA2, rule.formula2 ?? '');
        return `${this.titleStr} ${ruleName}`;
    }

    override generateRuleErrorMessage(rule: IDataValidationRuleBase, pos: ISheetLocationBase) {
        if (!rule.operator) {
            return this.titleStr;
        }
        const { transformedFormula1, transformedFormula2 } = getTransformedFormula(this._lexerTreeBuilder, rule as ISheetDataValidationRule, pos);

        const errorMsg = this.localeService.t(DateOperatorErrorTitleMap[rule.operator]).replace(FORMULA1, transformedFormula1 ?? '').replace(FORMULA2, transformedFormula2 ?? '');
        return `${errorMsg}`;
    }
}
