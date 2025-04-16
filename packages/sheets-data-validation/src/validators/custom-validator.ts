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

import type { CellValue, DataValidationOperator, IDataValidationRule, IDataValidationRuleBase } from '@univerjs/core';
import type { IFormulaResult, IFormulaValidResult, IValidatorCellInfo } from '@univerjs/data-validation';
import { CellValueType, DataValidationType, isFormulaString, Tools } from '@univerjs/core';
import { BaseDataValidator } from '@univerjs/data-validation';
import { LexerTreeBuilder, operatorToken } from '@univerjs/engine-formula';
import { DataValidationCustomFormulaService } from '../services/dv-custom-formula.service';
import { isLegalFormulaResult } from '../utils/formula';

export class CustomFormulaValidator extends BaseDataValidator {
    override id: string = DataValidationType.CUSTOM;
    override title: string = 'dataValidation.custom.title';
    override operators: DataValidationOperator[] = [];
    override scopes: string | string[] = ['sheet'];
    order = 60;

    private readonly _customFormulaService = this.injector.get(DataValidationCustomFormulaService);
    private readonly _lexerTreeBuilder = this.injector.get(LexerTreeBuilder);

    override validatorFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): IFormulaValidResult {
        const success = isFormulaString(rule.formula1);
        const formulaText = rule.formula1 ?? '';
        const result = this._lexerTreeBuilder.checkIfAddBracket(formulaText);
        const valid = result === 0 && formulaText.startsWith(operatorToken.EQUALS);

        return {
            success: success && valid,
            formula1: success && valid ? '' : this.localeService.t('dataValidation.validFail.formula'),
        };
    }

    override async parseFormula(_rule: IDataValidationRule, _unitId: string, _subUnitId: string): Promise<IFormulaResult> {
        return {
            formula1: undefined,
            formula2: undefined,
            isFormulaValid: true,
        };
    }

    override async isValidType(cellInfo: IValidatorCellInfo<CellValue>, _formula: IFormulaResult, _rule: IDataValidationRule): Promise<boolean> {
        const { column, row, unitId, subUnitId } = cellInfo;
        const cellData = await this._customFormulaService.getCellFormulaValue(unitId, subUnitId, _rule.uid, row, column);
        const formulaResult = cellData?.v;

        if (!isLegalFormulaResult(String(formulaResult))) {
            return false;
        }

        if (Tools.isDefine(formulaResult) && formulaResult !== '') {
            if (cellData!.t === CellValueType.BOOLEAN) {
                return Boolean(formulaResult);
            }

            if (typeof formulaResult === 'boolean') {
                return formulaResult;
            }

            if (typeof formulaResult === 'number') {
                return Boolean(formulaResult);
            }

            if (typeof formulaResult === 'string') {
                return isLegalFormulaResult(formulaResult);
            }

            return Boolean(formulaResult);
        }

        return false;
    }

    override generateRuleErrorMessage(rule: IDataValidationRuleBase): string {
        return this.localeService.t('dataValidation.custom.error');
    }

    override generateRuleName(rule: IDataValidationRuleBase): string {
        return (this.localeService.t('dataValidation.custom.ruleName')).replace('{FORMULA1}', rule.formula1 ?? '');
    }
}
