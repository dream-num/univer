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
import { serializeRange } from '@univerjs/engine-formula';
import { SetRangeValuesMutation } from '@univerjs/sheets';

export function getCalculatedColumnFillMutation(
    table: Table,
    unitId: string,
    subUnitId: string,
    startRow: number,
    endRow: number,
    getLexerTreeBuilder: () => LexerTreeBuilder
): IMutationInfo | undefined {
    const tableInfo = table.getTableInfo?.();
    if (!tableInfo) {
        return;
    }
    const firstDataRow = tableInfo.range.startRow + (tableInfo.showHeader ? 1 : 0);
    const cellValue: IObjectMatrixPrimitiveType<ICellData> = {};
    let lexerTreeBuilder: LexerTreeBuilder | undefined;

    tableInfo.columns.forEach((column, columnIndex) => {
        const formula = column.formula?.trim();
        if (!formula) {
            return;
        }

        const baseFormula = formula.startsWith('=') ? formula : `=${formula}`;
        const sheetColumn = tableInfo.range.startColumn + columnIndex;
        lexerTreeBuilder ??= getLexerTreeBuilder();
        for (let row = startRow; row <= endRow; row++) {
            cellValue[row] ??= {};
            const cell: ICellData = {
                f: lexerTreeBuilder.moveFormulaRefOffset(baseFormula, 0, row - firstDataRow),
            };
            if (column.formulaIsArray) {
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
