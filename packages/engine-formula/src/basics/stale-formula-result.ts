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

import type { ICellData, IObjectMatrixPrimitiveType, IRange, Nullable } from '@univerjs/core';
import { ObjectMatrix } from '@univerjs/core';
import type { IArrayFormulaEmbeddedMap, IArrayFormulaRangeType, IFormulaData, IFormulaDataItem, IRuntimeUnitDataType } from './common';

export type FormulaSourceIdentity = Pick<IFormulaDataItem, 'f' | 'si'>;

type ArrayFormulaCellSheet = ObjectMatrix<Nullable<ICellData>> | IObjectMatrixPrimitiveType<Nullable<ICellData>>;

type ArrayFormulaCellData = IRuntimeUnitDataType | {
    [unitId: string]: Nullable<{ [sheetId: string]: ArrayFormulaCellSheet }>;
};

/** Same comparison SetRangeValuesMutation uses before applying a delayed formula result. */
export function formulaSourceMatchesCell(source: FormulaSourceIdentity, cell: Nullable<Pick<ICellData, 'f' | 'si'>>): boolean {
    return source.f === (cell?.f ?? '') && source.si === (cell?.si ?? undefined);
}

/**
 * Remove array anchors whose captured formula no longer matches the live cell.
 * Scalar results are ignored: they have no array range and are filtered later.
 */
export function omitMismatchedArrayFormulaResults(
    arrayFormulaRange: IArrayFormulaRangeType | undefined,
    arrayFormulaCellData: ArrayFormulaCellData | undefined,
    arrayFormulaEmbedded: IArrayFormulaEmbeddedMap | undefined,
    sourceFormulaData: IFormulaData | undefined,
    matches: (unitId: string, sheetId: string, row: number, column: number, source: FormulaSourceIdentity) => boolean
): void {
    if (!sourceFormulaData || !arrayFormulaRange) {
        return;
    }

    for (const unitId of Object.keys(sourceFormulaData)) {
        const sourceSheets = sourceFormulaData[unitId];
        const rangeSheets = arrayFormulaRange[unitId];
        if (!sourceSheets || !rangeSheets) {
            continue;
        }

        for (const sheetId of Object.keys(sourceSheets)) {
            const sources = sourceSheets[sheetId];
            const ranges = rangeSheets[sheetId];
            if (!sources || !ranges) {
                continue;
            }

            const rangeMatrix = matrixOf(ranges);
            const cellMatrix = matrixOf(arrayFormulaCellData?.[unitId]?.[sheetId]);
            const embeddedMatrix = matrixOf(arrayFormulaEmbedded?.[unitId]?.[sheetId]);
            const staleAnchors: Array<{ row: number; column: number; range: IRange }> = [];

            new ObjectMatrix(sources).forValue((row, column, source) => {
                if (source == null) {
                    return;
                }
                const range = rangeMatrix?.getValue(row, column);
                if (range == null || matches(unitId, sheetId, row, column, source)) {
                    return;
                }
                staleAnchors.push({ row, column, range });
            });

            for (const anchor of staleAnchors) {
                rangeMatrix?.realDeleteValue(anchor.row, anchor.column);
                embeddedMatrix?.realDeleteValue(anchor.row, anchor.column);
                const { startRow, startColumn, endRow, endColumn } = anchor.range;
                for (let row = startRow; row <= endRow; row++) {
                    for (let column = startColumn; column <= endColumn; column++) {
                        cellMatrix?.realDeleteValue(row, column);
                    }
                }
            }
        }
    }
}

function matrixOf<T>(value: ObjectMatrix<T> | IObjectMatrixPrimitiveType<T> | null | undefined): ObjectMatrix<T> | undefined {
    if (value == null) {
        return undefined;
    }
    return value instanceof ObjectMatrix ? value : new ObjectMatrix(value);
}
