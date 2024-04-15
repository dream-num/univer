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

import { DataValidationRenderMode, DataValidationType, isFormulaString, IUniverInstanceService, Tools } from '@univerjs/core';
import type { CellValue, DataValidationOperator, ICellData, IDataValidationRule, IDataValidationRuleBase, ISheetDataValidationRule, Nullable } from '@univerjs/core';
import type { IBaseDataValidationWidget, IFormulaResult, IFormulaValidResult, IValidatorCellInfo } from '@univerjs/data-validation';
import { BaseDataValidator } from '@univerjs/data-validation';
import { LIST_FORMULA_INPUT_NAME } from '../views/formula-input';
import { LIST_DROPDOWN_KEY } from '../views';
import { DropdownWidget } from '../widgets/dropdown-widget';
import { ListRenderModeInput } from '../views/render-mode';
import { DataValidationFormulaService } from '../services/dv-formula.service';
import { getCellValueOrigin } from '../utils/get-cell-data-origin';
import { deserializeListOptions } from './util';

export function getRuleFormulaResultSet(result: Nullable<Nullable<ICellData>[][]>) {
    if (!result) {
        return [];
    }
    const resultSet = new Set<string>();
    result.forEach(
        (row) => {
            row.forEach((cell) => {
                const value = getCellValueOrigin(cell);
                if (value !== null && value !== undefined) {
                    resultSet.add(value.toString());
                }
            });
        }
    );

    return [...resultSet];
}

export class ListValidator extends BaseDataValidator {
    protected formulaService = this.injector.get(DataValidationFormulaService);

    id: string = DataValidationType.LIST;
    title: string = 'dataValidation.list.title';
    operators: DataValidationOperator[] = [];
    scopes: string | string[] = ['sheet'];
    formulaInput: string = LIST_FORMULA_INPUT_NAME;

    override canvasRender: Nullable<IBaseDataValidationWidget> = this.injector.createInstance(DropdownWidget);

    override dropdown: string | undefined = LIST_DROPDOWN_KEY;

    override optionsInput: string | undefined = ListRenderModeInput.componentKey;

    override skipDefaultFontRender(rule: ISheetDataValidationRule) {
        return rule.renderMode !== DataValidationRenderMode.TEXT;
    }

    override validatorFormula(rule: IDataValidationRuleBase): IFormulaValidResult {
        const success = !Tools.isBlank(rule.formula1);

        return {
            success,
            formula1: success ? undefined : this.localeService.t('dataValidation.validFail.list'),
        };
    }

    parseCellValue(cellValue: CellValue) {
        const cellString = cellValue.toString();
        return deserializeListOptions(cellString);
    }

    override async parseFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): Promise<IFormulaResult<string[] | undefined>> {
        const { formula1 = '' } = rule;
        const results = await this.formulaService.getRuleFormulaResult(unitId, subUnitId, rule.uid);

        return {
            formula1: isFormulaString(formula1) ? getRuleFormulaResultSet(results?.[0]?.result) : deserializeListOptions(formula1),
            formula2: undefined,
        };
    }

    override async isValidType(cellInfo: IValidatorCellInfo<Nullable<CellValue>>, formula: IFormulaResult<string[] | undefined>, rule: IDataValidationRule): Promise<boolean> {
        const { value } = cellInfo;
        const { formula1 = [] } = formula;
        const selected = this.parseCellValue(value!);
        return selected.every((i) => formula1.includes(i));
    }

    override generateRuleName() {
        return this.localeService.t('dataValidation.list.name');
    }

    override generateRuleErrorMessage(): string {
        return this.localeService.t('dataValidation.list.error');
    }

    getList(rule: IDataValidationRule, currentUnitId?: string, currentSubUnitId?: string) {
        const { formula1 = '' } = rule;
        const univerInstanceService = this.injector.get(IUniverInstanceService);
        const workbook = (currentUnitId ? univerInstanceService.getUniverSheetInstance(currentUnitId) : undefined) ?? univerInstanceService.getCurrentUniverSheetInstance();
        if (!workbook) return [];

        const worksheet = (currentSubUnitId ? workbook.getSheetBySheetId(currentSubUnitId) : undefined) ?? workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const results = this.formulaService.getRuleFormulaResultSync(unitId, subUnitId, rule.uid);
        return isFormulaString(formula1) ? getRuleFormulaResultSet(results?.[0]?.result) : deserializeListOptions(formula1);
    }

    async getListAsync(rule: IDataValidationRule, currentUnitId?: string, currentSubUnitId?: string) {
        const { formula1 = '' } = rule;
        const univerInstanceService = this.injector.get(IUniverInstanceService);
        const workbook = (currentUnitId ? univerInstanceService.getUniverSheetInstance(currentUnitId) : undefined) ?? univerInstanceService.getCurrentUniverSheetInstance();
        if (!workbook) {
            return [];
        }
        const worksheet = (currentSubUnitId ? workbook.getSheetBySheetId(currentSubUnitId) : undefined) ?? workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const results = await this.formulaService.getRuleFormulaResult(unitId, subUnitId, rule.uid);
        return isFormulaString(formula1) ? getRuleFormulaResultSet(results?.[0]?.result) : deserializeListOptions(formula1);
    }

    getListWithColor(rule: IDataValidationRule, currentUnitId?: string, currentSubUnitId?: string) {
        const list = this.getList(rule, currentUnitId, currentSubUnitId);
        const colorList = (rule.formula2 || '').split(',');

        return list.map((label, i) => ({ label, color: colorList[i] }));
    }

    getListWithColorMap(rule: IDataValidationRule, currentUnitId?: string, currentSubUnitId?: string) {
        const list = this.getListWithColor(rule, currentUnitId, currentSubUnitId);
        const map: Record<string, string> = {};

        list.forEach((item) => {
            if (item.color) {
                map[item.label] = item.color;
            }
        });
        return map;
    }
}
