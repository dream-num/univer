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
import { DataValidationOperator, DataValidationType, isFormulaString, Tools } from '@univerjs/core';
import { BaseDataValidator, TextLengthErrorTitleMap } from '@univerjs/data-validation';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { DataValidationCustomFormulaService } from '../services/dv-custom-formula.service';
import { TWO_FORMULA_OPERATOR_COUNT } from '../types/const/two-formula-operators';
import { isLegalFormulaResult } from '../utils/formula';
import { FORMULA1, FORMULA2 } from './const';
import { getTransformedFormula } from './util';

export class TextLengthValidator extends BaseDataValidator {
    id: string = DataValidationType.TEXT_LENGTH;
    title: string = 'dataValidation.textLength.title';
    private readonly _lexerTreeBuilder = this.injector.get(LexerTreeBuilder);
    order = 30;

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

    private _isFormulaOrInt(formula: string) {
        return !Tools.isBlank(formula) && (isFormulaString(formula) || (!Number.isNaN(+formula) && Number.isInteger(+formula)));
    }

    override validatorFormula(rule: IDataValidationRule, _unitId: string, _subUnitId: string): IFormulaValidResult {
        const operator = rule.operator;
        if (!operator) {
            return {
                success: false,
            };
        }
        const formula1Success = Tools.isDefine(rule.formula1) && this._isFormulaOrInt(rule.formula1);
        const formula2Success = Tools.isDefine(rule.formula2) && this._isFormulaOrInt(rule.formula2);
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
            formula1: errorMsg,
        };
    }

    private _parseNumber(formula: Nullable<string | number | boolean>) {
        if (formula === undefined || formula === null) {
            return Number.NaN;
        }

        return +formula;
    }

    override async parseFormula(rule: IDataValidationRule, unitId: string, subUnitId: string, row: number, column: number): Promise<IFormulaResult<number | undefined>> {
        const formulaResult1 = await this._customFormulaService.getCellFormulaValue(unitId, subUnitId, rule.uid, row, column);
        const formulaResult2 = await this._customFormulaService.getCellFormula2Value(unitId, subUnitId, rule.uid, row, column);
        const { formula1, formula2 } = rule;

        const isFormulaValid = isLegalFormulaResult(String(formulaResult1?.v)) && isLegalFormulaResult(String(formulaResult2?.v));

        return {
            formula1: this._parseNumber(isFormulaString(formula1) ? formulaResult1?.v : formula1),
            formula2: this._parseNumber(isFormulaString(formula2) ? formulaResult2?.v : formula2),
            isFormulaValid,
        };
    }

    override transform(cellInfo: IValidatorCellInfo<CellValue>, _formula: IFormulaResult, _rule: IDataValidationRule) {
        return {
            ...cellInfo,
            value: cellInfo.value.toString().length,
        };
    }

    override async isValidType(cellInfo: IValidatorCellInfo<number>, _formula: IFormulaResult, _rule: IDataValidationRule) {
        const { value: cellValue } = cellInfo;
        return typeof cellValue === 'string' || typeof cellValue === 'number';
    }

    override generateRuleErrorMessage(rule: IDataValidationRuleBase, pos: ISheetLocationBase) {
        if (!rule.operator) {
            return this.titleStr;
        }

        const { transformedFormula1, transformedFormula2 } = getTransformedFormula(this._lexerTreeBuilder, rule as ISheetDataValidationRule, pos);
        const errorMsg = this.localeService.t(TextLengthErrorTitleMap[rule.operator]).replace(FORMULA1, transformedFormula1 ?? '').replace(FORMULA2, transformedFormula2 ?? '');
        return `${errorMsg}`;
    }
}
