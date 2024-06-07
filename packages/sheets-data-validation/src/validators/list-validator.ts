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

import { DataValidationRenderMode, DataValidationType, isFormulaString, IUniverInstanceService, Rectangle, Tools, UniverInstanceType } from '@univerjs/core';
import type { CellValue, DataValidationOperator, ICellData, IDataValidationRule, IRange, ISheetDataValidationRule, Nullable, Workbook } from '@univerjs/core';
import type { IBaseDataValidationWidget, IFormulaResult, IFormulaValidResult, IValidatorCellInfo } from '@univerjs/data-validation';
import { BaseDataValidator } from '@univerjs/data-validation';
import { deserializeRangeWithSheet, isReferenceString, LexerTreeBuilder, sequenceNodeType } from '@univerjs/engine-formula';
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

const supportedFormula = [
    'if',
    'indirect',
    'choose',
    'offset',
];

// 1. must have REFERENCE or DEFINED_NAME node.
// 2. only support some formula
export function isValidListFormula(formula: string, lexer: LexerTreeBuilder) {
    if (!isFormulaString(formula)) {
        return true;
    }

    const isRefString = isReferenceString(formula.slice(1));
    if (isRefString) {
        return true;
    }

    const nodes = lexer.sequenceNodesBuilder(formula);

    return (nodes) && nodes.some((node) => typeof node === 'object' && node.nodeType === sequenceNodeType.FUNCTION && supportedFormula.indexOf(node.token.toLowerCase()) > -1);
}

function isRuleIntersects(rule: IDataValidationRule, sheetName: string) {
    const { formula1 = '', ranges } = rule;
    const isRefString = isReferenceString(formula1.slice(1));

    if (isRefString) {
        const refRange = deserializeRangeWithSheet(formula1.slice(1));
        if ((!refRange.sheetName || refRange.sheetName === sheetName) && ranges.some((range: IRange) => Rectangle.intersects(range, refRange.range))) {
            return true;
        }
    }

    return false;
}

export class ListValidator extends BaseDataValidator {
    protected formulaService = this.injector.get(DataValidationFormulaService);
    private _lexer = this.injector.get(LexerTreeBuilder);
    private _univerInstanceService = this.injector.get(IUniverInstanceService);

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

    override validatorFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): IFormulaValidResult {
        const success = !Tools.isBlank(rule.formula1);
        const valid = isValidListFormula(rule.formula1 ?? '', this._lexer);
        const sheetName = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET)?.getSheetBySheetId(subUnitId)?.getName();
        const isIntersects = isRuleIntersects(rule, sheetName ?? '');

        return {
            success: Boolean(success && valid && !isIntersects),
            formula1: success
                ? valid
                    ? !isIntersects ?
                        undefined :
                        this.localeService.t('dataValidation.validFail.listIntersects') :
                    this.localeService.t('dataValidation.validFail.listInvalid')
                : this.localeService.t('dataValidation.validFail.list'),
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
        const workbook = (currentUnitId ? univerInstanceService.getUniverSheetInstance(currentUnitId) : undefined) ?? univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
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
        const workbook = (currentUnitId ? univerInstanceService.getUniverSheetInstance(currentUnitId) : undefined) ?? univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
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
