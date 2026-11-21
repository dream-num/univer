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

import type { ICellData, IMutationInfo, IObjectMatrixPrimitiveType, Worksheet } from '@univerjs/core';
import type { LexerTreeBuilder } from '@univerjs/engine-formula';
import type { ISheetValueChangeContext } from '@univerjs/sheets';
import { BooleanNumber, FormulaType } from '@univerjs/core';
import { serializeRange } from '@univerjs/engine-formula';
import { SetRangeValuesMutation } from '@univerjs/sheets';
import type { Table } from '../../models/table';
import type { ITableAutoExpandCandidate } from '../../types/auto-expand';
import { normalizeCalculatedColumnFormula } from './calculated-column';

export function getTableAutoExpandFormulaEffects(
    context: ISheetValueChangeContext,
    candidate: ITableAutoExpandCandidate,
    table: Table,
    worksheet: Worksheet,
    getLexer: () => LexerTreeBuilder,
    formulaSheetNames: Record<string, string> = { [context.subUnitId]: worksheet.getName() }
): { redos: IMutationInfo[]; undos: IMutationInfo[] } {
    if (candidate.direction !== 'row') {
        return { redos: [], undos: [] };
    }
    const info = table.getTableInfo();
    const firstRow = info.range.startRow + (info.showHeader ? 1 : 0);
    const cellValue: IObjectMatrixPrimitiveType<ICellData> = {};
    const undoValue: IObjectMatrixPrimitiveType<ICellData> = {};
    const read = (row: number, col: number) => Object.prototype.hasOwnProperty.call(context.beforeCells[row] ?? {}, col)
        ? context.beforeCells[row][col]
        : worksheet.getCellRaw(row, col);
    let anchors: Map<string, { row: number; col: number; formula: string }> | undefined;
    const formulaAt = (row: number, col: number): string | undefined => {
        const cell = read(row, col);
        if (cell?.f) {
            return cell.f;
        }
        if (!cell?.si) {
            return;
        }
        if (!anchors) {
            anchors = new Map();
            worksheet.getCellMatrix().forValue((r, c) => {
                const source = read(r, c);
                if (source?.si && source.f) {
                    anchors!.set(source.si, { row: r, col: c, formula: source.f });
                }
            });
        }
        const anchor = anchors.get(cell.si);
        return anchor && getLexer().moveFormulaRefOffset(anchor.formula, col - anchor.col, row - anchor.row);
    };
    info.columns.forEach((column, index) => {
        const col = info.range.startColumn + index;
        let formula = column.formula?.trim();
        if (formula) {
            formula = normalizeCalculatedColumnFormula(formula.startsWith('=') ? formula : `=${formula}`, info.name);
        } else {
            for (let row = firstRow; row <= info.range.endRow; row++) {
                const current = formulaAt(row, col);
                if (!current) {
                    return;
                }
                const normalized = getLexer().moveFormulaRefOffset(current, 0, firstRow - row);
                if (formula && formula !== normalized) {
                    return;
                }
                formula = normalized;
            }
        }
        if (!formula) {
            return;
        }
        for (let row = info.range.endRow + 1; row <= candidate.newRange.endRow; row++) {
            if (Object.prototype.hasOwnProperty.call(context.contentWrites[row] ?? {}, col)) {
                continue;
            }
            const array = !!column.formula && column.formulaIsArray;
            const cell: ICellData = {
                f: getLexer().moveFormulaRefOffset(formula, 0, row - firstRow),
                si: null,
                v: null,
                p: null,
                t: null,
                ft: array ? FormulaType.ARRAY : null,
                fd: array ? BooleanNumber.FALSE : null,
                ref: array ? serializeRange({ startRow: row, endRow: row, startColumn: col, endColumn: col }) : null,
            };
            cellValue[row] ??= {};
            undoValue[row] ??= {};
            cellValue[row][col] = cell;
            const before = read(row, col);
            undoValue[row][col] = Object.fromEntries(Object.keys(cell).map((key) => [key, before?.[key as keyof ICellData] ?? null]));
        }
    });
    const params = { unitId: context.unitId, subUnitId: context.subUnitId, formulaSheetNames };
    return Object.keys(cellValue).length
        ? { redos: [{ id: SetRangeValuesMutation.id, params: { ...params, cellValue } }], undos: [{ id: SetRangeValuesMutation.id, params: { ...params, cellValue: undoValue } }] }
        : { redos: [], undos: [] };
}
