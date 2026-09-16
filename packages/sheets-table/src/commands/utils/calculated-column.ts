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

import type { ICellData, IMutationInfo, IObjectMatrixPrimitiveType } from '@univerjs/core';
import type { LexerTreeBuilder } from '@univerjs/engine-formula';
import type { Table } from '../../models/table';
import type { ITableCalculatedColumnConfig } from '../../types/type';
import { BooleanNumber, FormulaType } from '@univerjs/core';
import { serializeRange } from '@univerjs/engine-formula';
import { SetRangeValuesMutation } from '@univerjs/sheets';

export function getCalculatedColumnFillMutation(
    table: Table,
    unitId: string,
    subUnitId: string,
    startRow: number,
    endRow: number,
    getLexerTreeBuilder: () => LexerTreeBuilder,
    config?: ITableCalculatedColumnConfig
): IMutationInfo | undefined {
    const tableInfo = table.getTableInfo?.();
    if (!tableInfo) {
        return;
    }
    const firstDataRow = tableInfo.range.startRow + (tableInfo.showHeader ? 1 : 0);
    const cellValue: IObjectMatrixPrimitiveType<ICellData> = {};
    let lexerTreeBuilder: LexerTreeBuilder | undefined;

    tableInfo.columns.forEach((column, columnIndex) => {
        if (config && column.id !== config.columnId) {
            return;
        }
        const formula = (config?.formula ?? column.formula)?.trim();
        const formulaIsArray = config?.formulaIsArray ?? column.formulaIsArray;
        if (!formula) {
            return;
        }

        const baseFormula = normalizeCalculatedColumnFormula(formula.startsWith('=') ? formula : `=${formula}`, tableInfo.name);
        const sheetColumn = tableInfo.range.startColumn + columnIndex;
        lexerTreeBuilder ??= getLexerTreeBuilder();
        for (let row = startRow; row <= endRow; row++) {
            cellValue[row] ??= {};
            const cell: ICellData = {
                f: lexerTreeBuilder.moveFormulaRefOffset(baseFormula, 0, row - firstDataRow),
                si: null,
                ref: null,
                ft: formulaIsArray ? FormulaType.ARRAY : null,
                fd: formulaIsArray ? BooleanNumber.FALSE : null,
                v: null,
                p: null,
                t: null,
            };
            if (formulaIsArray) {
                cell.ref = serializeRange({
                    startRow: row,
                    endRow: row,
                    startColumn: sheetColumn,
                    endColumn: sheetColumn,
                });
            }
            cellValue[row][sheetColumn] = cell;
        }
    });

    if (!Object.keys(cellValue).length) {
        return;
    }

    return {
        id: SetRangeValuesMutation.id,
        params: { unitId, subUnitId, cellValue },
    };
}

function normalizeCalculatedColumnFormula(formula: string, tableName: string): string {
    let result = '';
    for (let index = 0; index < formula.length; index++) {
        const start = index;
        const char = formula[index];
        if (char === '"' || char === "'") {
            while (++index < formula.length) {
                if (formula[index] === char) {
                    if (formula[index + 1] !== char) break;
                    index++;
                }
            }
        } else if (char === '[') {
            let depth = 1;
            while (++index < formula.length && depth > 0) {
                if (formula[index] === "'") {
                    index++;
                } else if (formula[index] === '[') {
                    depth++;
                } else if (formula[index] === ']') {
                    depth--;
                }
                if (depth === 0) break;
            }
            if (depth === 0) {
                const body = formula.slice(start + 1, index);
                const previous = formula.slice(0, start).trimEnd().slice(-1);
                const unqualified = !previous || /[=+\-*/^&(<>,;:{]/.test(previous);
                // External workbook qualifiers are followed by a table/sheet name or '!'.
                const next = formula.slice(index + 1).trimStart();
                const qualifier = /^[^+\-*/^&=<>%),;}:\s]/.test(next);
                if (!qualifier) {
                    const prefix = unqualified ? tableName : '';
                    // The formula engine consumes the explicit OOXML current-row form.
                    const columns = body.slice(1);
                    result += body.startsWith('@')
                        ? `${prefix}[[#This Row],${columns.startsWith('[') ? columns : `[${columns}]`}]`
                        : `${prefix}[${body}]`;
                    continue;
                }
            }
        }
        result += formula.slice(start, index + 1);
    }
    return result;
}
