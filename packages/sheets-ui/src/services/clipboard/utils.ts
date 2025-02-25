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

import type { ICellData, IMutationInfo, IObjectMatrixPrimitiveType, IRange, Nullable } from '@univerjs/core';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import type { IDiscreteRange } from '../../controllers/utils/range-tools';
import { ObjectMatrix } from '@univerjs/core';
import { SetRangeValuesMutation } from '@univerjs/sheets';

/**
 *
 *
 * @param {IRange} sourceRange
 * @param {IRange} targetRange
 * @param {boolean} [isStrictMode] if is true,the remainder of the row and column must all be 0 to be repeated
 * @return {*}
 */
export const getRepeatRange = (sourceRange: IRange, targetRange: IRange, isStrictMode = false) => {
    const getRowLength = (range: IRange) => range.endRow - range.startRow + 1;
    const getColLength = (range: IRange) => range.endColumn - range.startColumn + 1;
    const rowMod = getRowLength(targetRange) % getRowLength(sourceRange);
    const colMod = getColLength(targetRange) % getColLength(sourceRange);
    const repeatRelativeRange: IRange = {
        startRow: 0,
        endRow: getRowLength(sourceRange) - 1,
        startColumn: 0,
        endColumn: getColLength(sourceRange) - 1,
    };
    const repeatRow = Math.floor(getRowLength(targetRange) / getRowLength(sourceRange));
    const repeatCol = Math.floor(getColLength(targetRange) / getColLength(sourceRange));
    const repeatList: Array<{ startRange: IRange; repeatRelativeRange: IRange }> = [];
    if (!rowMod && !colMod) {
        for (let countRow = 1; countRow <= repeatRow; countRow++) {
            for (let countCol = 1; countCol <= repeatCol; countCol++) {
                const row = getRowLength(sourceRange) * (countRow - 1);
                const col = getColLength(sourceRange) * (countCol - 1);
                const startRange: IRange = {
                    startRow: row + targetRange.startRow,
                    endRow: row + targetRange.startRow,
                    startColumn: col + targetRange.startColumn,
                    endColumn: col + targetRange.startColumn,
                };

                repeatList.push({ repeatRelativeRange, startRange });
            }
        }
    } else if (!rowMod && colMod && !isStrictMode) {
        for (let countRow = 1; countRow <= repeatRow; countRow++) {
            const row = getRowLength(sourceRange) * (countRow - 1);
            const col = 0;
            const startRange: IRange = {
                startRow: row + targetRange.startRow,
                endRow: row + targetRange.startRow,
                startColumn: col + targetRange.startColumn,
                endColumn: col + targetRange.startColumn,
            };

            repeatList.push({ repeatRelativeRange, startRange });
        }
    } else if (rowMod && !colMod && !isStrictMode) {
        for (let countCol = 1; countCol <= repeatCol; countCol++) {
            const row = 0;
            const col = getColLength(sourceRange) * (countCol - 1);
            const startRange: IRange = {
                startRow: row + targetRange.startRow,
                endRow: row + targetRange.startRow,
                startColumn: col + targetRange.startColumn,
                endColumn: col + targetRange.startColumn,
            };

            repeatList.push({ repeatRelativeRange, startRange });
        }
    } else {
        const startRange: IRange = {
            startRow: targetRange.startRow,
            endRow: targetRange.startRow,
            startColumn: targetRange.startColumn,
            endColumn: targetRange.startColumn,
        };
        repeatList.push({ startRange, repeatRelativeRange });
    }
    return repeatList;
};

export function htmlIsFromExcel(html: string): boolean {
    if (!html) {
        return false;
    }

    const excelMarkers = [
        // Excel class names
        /<td[^>]*class=".*?xl.*?"[^>]*>/i,
        // Excel namespace
        /xmlns:x="urn:schemas-microsoft-com:office:excel"/i,
        // Excel ProgID
        /ProgId="Excel.Sheet"/i,
        // Office specific namespace
        /xmlns:o="urn:schemas-microsoft-com:office:office"/i,
        // Excel specific style markers
        /@mso-|mso-excel/i,
        // Excel workbook metadata
        /<x:ExcelWorkbook>/i,
    ];

    return excelMarkers.some((marker) => marker.test(html));
}

export function htmlContainsImage(html: string): boolean {
    if (!html) {
        return false;
    }

    // test the image tag is base64 image
    const base64ImageRegex = /<img[^>]*src\s*=\s*["']data:image\/[^;]+;base64,[^"']*["'][^>]*>/i; ;

    const images = (html.match(base64ImageRegex) || []);

    return images.length > 0;
}

export function mergeCellValues(...cellValues: IObjectMatrixPrimitiveType<Nullable<ICellData>>[]) {
    if (cellValues.length === 1) {
        return cellValues[0];
    }
    const newMatrix = new ObjectMatrix<IObjectMatrixPrimitiveType<Nullable<ICellData>>>();
    cellValues.forEach((cellValue) => {
        if (cellValue) {
            const matrix = new ObjectMatrix(cellValue);
            matrix.forValue((row, col, value) => {
                newMatrix.setValue(row, col, { ...newMatrix.getValue(row, col), ...value });
            });
        }
    });
    return newMatrix.getMatrix();
}

export function getRangeValuesMergeable(m1: IMutationInfo<ISetRangeValuesMutationParams>, m2: IMutationInfo<ISetRangeValuesMutationParams>) {
    return m1.id === m2.id
    && m1.params.unitId === m2.params.unitId
    && m1.params.subUnitId === m2.params.subUnitId;
}

export function mergeSetRangeValues(mutations: IMutationInfo[]) {
    const newMutations: IMutationInfo[] = [];
    for (let i = 0; i < mutations.length;) {
        let cursor = 1;
        if (mutations[i].id === SetRangeValuesMutation.id) {
            const current = mutations[i] as IMutationInfo<ISetRangeValuesMutationParams>;
            const toMerge = [current];
            while (i + cursor < mutations.length && getRangeValuesMergeable(current, mutations[i + cursor] as IMutationInfo<ISetRangeValuesMutationParams>)) {
                toMerge.push(mutations[i + cursor] as IMutationInfo<ISetRangeValuesMutationParams>);
                cursor += 1;
            }
            const merged = mergeCellValues(...toMerge.map((m: IMutationInfo<ISetRangeValuesMutationParams>) => m.params.cellValue || {}));
            newMutations.push({
                ...current,
                params: {
                    ...current.params,
                    cellValue: merged,
                },
            });
        } else {
            newMutations.push(mutations[i]);
        }
        i += cursor;
    }
    return newMutations;
}

export function rangeIntersectWithDiscreteRange(range: IRange, discrete: IDiscreteRange) {
    const { startRow, endRow, startColumn, endColumn } = range;
    for (let i = startRow; i <= endRow; i++) {
        for (let j = startColumn; j <= endColumn; j++) {
            if (discrete.rows.includes(i) && discrete.cols.includes(j)) {
                return true;
            }
        }
    }
}

export function discreteRangeContainsRange(discrete: IDiscreteRange, range: IRange) {
    const { startRow, endRow, startColumn, endColumn } = range;
    for (let i = startRow; i <= endRow; i++) {
        if (!discrete.rows.includes(i)) {
            return false;
        }
    }
    for (let j = startColumn; j <= endColumn; j++) {
        if (!discrete.cols.includes(j)) {
            return false;
        }
    }
    return true;
}

export function convertTextToTable(text: string): string {
    const rows = text.trim().split('\n');

    let html = '<table>';

    rows.forEach((row) => {
        const columns = row.split('\t');
        html += '<tr>';
        columns.forEach((column) => {
            html += `<td>${column}</td>`;
        });
        html += '</tr>';
    });

    html += '</table>';

    return html;
}
