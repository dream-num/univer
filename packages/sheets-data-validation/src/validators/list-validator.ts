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

import { DataValidationType, isFormulaString, Tools } from '@univerjs/core';
import type { CellValue, DataValidationOperator, ICellData, IDataValidationRule, IDataValidationRuleBase, Nullable } from '@univerjs/core';
import type { IFormulaResult, IValidatorCellInfo } from '@univerjs/data-validation';
import { BaseDataValidator } from '@univerjs/data-validation';
import { LIST_FORMULA_INPUT_NAME } from '../views/formula-input';
import { LIST_DROPDOWN_KEY } from '../views';
import { DataValidationFormulaService } from '../services/dv-formula.service';

export const LIST_MULTIPLE_FORMULA = 'TRUE';

export const getListFormulaResult = (result: Nullable<Nullable<ICellData>[][]>) => {
    const valueSet = new Set<string>();

    result?.forEach((sub) => {
        sub.forEach((cell) => {
            if (cell?.v) {
                valueSet.add(`${cell.v}`);
            }
        });
    });

    return Array.from(valueSet.values());
};

// TODO: cache
export class ListValidator extends BaseDataValidator {
    id: string = DataValidationType.LIST;
    title: string = 'dataValidation.list.title';
    operators: DataValidationOperator[] = [];
    scopes: string | string[] = ['sheet'];
    formulaInput: string = LIST_FORMULA_INPUT_NAME;

    private _formulaService = this.injector.get(DataValidationFormulaService);

    override dropdown: string | undefined = LIST_DROPDOWN_KEY;

    override validatorFormula(rule: IDataValidationRuleBase): boolean {
        return !Tools.isBlank(rule.formula1);
    }

    private _isMultiple(rule: IDataValidationRule) {
        return rule.formula2 === LIST_MULTIPLE_FORMULA;
    }

    // TODO cache
    private _parseCellValue(cellValue: CellValue, rule: IDataValidationRule) {
        const cellString = cellValue.toString();
        if (this._isMultiple(rule)) {
            // TODO. full
            return cellString.split(',');
        } else {
            return [cellString];
        }
    }

    override async parseFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): Promise<IFormulaResult<string[] | undefined>> {
        const { formula1 } = rule;
        const results = await this._formulaService.getRuleFormulaResult(unitId, subUnitId, rule.uid);
        return {
            formula1: isFormulaString(formula1) ? getListFormulaResult(results?.[0]?.result) : formula1?.split(','),
            formula2: undefined,
        };
    }

    override async isValidType(cellInfo: IValidatorCellInfo<Nullable<CellValue>>, formula: IFormulaResult<any>, rule: IDataValidationRule): Promise<boolean> {
        const { value } = cellInfo;
        const { formula1 } = formula;
        const selected = this._parseCellValue(value!, rule);
        return selected.every((i) => formula1.includes(i));
    }

    override generateRuleName() {
        return this.localeService.t('dataValidation.list.name');
    }

    override generateRuleErrorMessage(): string {
        return this.localeService.t('dataValidation.list.error');
    }
}
