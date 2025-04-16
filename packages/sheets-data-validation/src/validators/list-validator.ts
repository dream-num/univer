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

import type { CellValue, DataValidationOperator, ICellData, IDataValidationRule, IRange, ISheetDataValidationRule, IStyleData, Nullable, Workbook } from '@univerjs/core';
import type { IFormulaResult, IFormulaValidResult, IValidatorCellInfo } from '@univerjs/data-validation';
import { DataValidationRenderMode, DataValidationType, isFormulaString, IUniverInstanceService, numfmt, Rectangle, Tools, UniverInstanceType, WrapStrategy } from '@univerjs/core';
import { BaseDataValidator } from '@univerjs/data-validation';
import { deserializeRangeWithSheet, isReferenceString, LexerTreeBuilder, sequenceNodeType } from '@univerjs/engine-formula';
import { DataValidationFormulaService } from '../services/dv-formula.service';
import { getFormulaResult, isLegalFormulaResult } from '../utils/formula';
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
                    if (typeof value !== 'string' && typeof cell?.s === 'object' && cell.s?.n?.pattern) {
                        resultSet.add(numfmt.format(cell.s.n.pattern, value, { throws: false }));
                        return;
                    }

                    if (isLegalFormulaResult(value.toString())) {
                        resultSet.add(value.toString());
                    }
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
    order = 50;
    override readonly offsetFormulaByRange = false;

    id: string = DataValidationType.LIST;
    title: string = 'dataValidation.list.title';
    operators: DataValidationOperator[] = [];
    scopes: string | string[] = ['sheet'];

    override skipDefaultFontRender = (rule: ISheetDataValidationRule) => {
        return rule.renderMode !== DataValidationRenderMode.TEXT;
    };

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

    override getExtraStyle(rule: IDataValidationRule, value: Nullable<CellValue>, { style: defaultStyle }: { style: IStyleData }): Nullable<IStyleData> {
        const tb = (defaultStyle.tb !== WrapStrategy.OVERFLOW ? defaultStyle.tb : WrapStrategy.CLIP) ?? WrapStrategy.WRAP;
        if (rule.type === DataValidationType.LIST && (rule.renderMode === DataValidationRenderMode.ARROW || rule.renderMode === DataValidationRenderMode.TEXT)) {
            const colorMap = this.getListWithColorMap(rule);
            const valueStr = `${value ?? ''}`;
            const color = colorMap[valueStr];
            if (color) {
                return {
                    bg: {
                        rgb: color,
                    },
                    tb,
                };
            }
        }

        return {
            tb,
        };
    }

    parseCellValue(cellValue: CellValue) {
        const cellString = cellValue.toString();
        return deserializeListOptions(cellString);
    }

    override async parseFormula(rule: IDataValidationRule, unitId: string, subUnitId: string): Promise<IFormulaResult<number | undefined>> {
        const results = await this.formulaService.getRuleFormulaResult(unitId, subUnitId, rule.uid);
        const formulaResult1 = getFormulaResult(results?.[0]?.result?.[0][0]);
        const isFormulaValid = isLegalFormulaResult(String(formulaResult1));

        return {
            formula1: undefined,
            formula2: undefined,
            isFormulaValid,
        };
    }

    override async isValidType(cellInfo: IValidatorCellInfo<Nullable<CellValue>>, formula: IFormulaResult<string[] | undefined>, rule: IDataValidationRule): Promise<boolean> {
        const { value, unitId, subUnitId } = cellInfo;
        const { formula1 = '' } = rule;
        const results = await this.formulaService.getRuleFormulaResult(unitId, subUnitId, rule.uid);
        const formula1Result = isFormulaString(formula1) ? getRuleFormulaResultSet(results?.[0]?.result?.[0][0]) : deserializeListOptions(formula1);
        const selected = this.parseCellValue(value!);
        return selected.every((i) => formula1Result.includes(i));
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
        if (!worksheet) return [];

        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const results = this.formulaService.getRuleFormulaResultSync(unitId, subUnitId, rule.uid);
        return isFormulaString(formula1) ? getRuleFormulaResultSet(results?.[0]?.result?.[0][0]) : deserializeListOptions(formula1);
    }

    async getListAsync(rule: IDataValidationRule, currentUnitId?: string, currentSubUnitId?: string) {
        const { formula1 = '' } = rule;
        const univerInstanceService = this.injector.get(IUniverInstanceService);
        const workbook = (currentUnitId ? univerInstanceService.getUniverSheetInstance(currentUnitId) : undefined) ?? univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return [];

        const worksheet = (currentSubUnitId ? workbook.getSheetBySheetId(currentSubUnitId) : undefined) ?? workbook.getActiveSheet();
        if (!worksheet) return [];

        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const results = await this.formulaService.getRuleFormulaResult(unitId, subUnitId, rule.uid);
        return isFormulaString(formula1) ? getRuleFormulaResultSet(results?.[0]?.result?.[0][0]) : deserializeListOptions(formula1);
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
