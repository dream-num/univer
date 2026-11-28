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

import type { IAccessor, ICellData, IMutationInfo, IObjectMatrixPrimitiveType, IRange, Nullable, Workbook } from '@univerjs/core';
import type { IDiscreteRange, ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { getNumfmtLocaleTag, LocaleService, ObjectMatrix, RegionService } from '@univerjs/core';
import { SetRangeValuesMutation } from '@univerjs/sheets';

export function getPasteNumberOptions(workbook: Nullable<Workbook>, accessor: IAccessor) {
    if (!workbook) return undefined;
    return {
        region: accessor.get(RegionService).getCurrentRegion(),
        locale: getNumfmtLocaleTag(workbook.getSnapshot().locale),
        uiLocale: accessor.get(LocaleService).getCurrentLocale(),
        dateSystem: workbook.getDateSystem(),
    };
}

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
    && m1.params.subUnitId === m2.params.subUnitId
    && Boolean(m1.params.isOverrideStyle) === Boolean(m2.params.isOverrideStyle);
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

// eslint-disable-next-line max-lines-per-function
export function spilitLargeSetRangeValuesMutations(
    mutation: IMutationInfo<ISetRangeValuesMutationParams>,
    options: { maxCellsPerChunk?: number; threshold?: number; maxChunks?: number } = {}
): IMutationInfo<ISetRangeValuesMutationParams>[] {
    const { maxCellsPerChunk = 2500, threshold = 6000, maxChunks = 10 } = options;

    if (mutation.id !== SetRangeValuesMutation.id) {
        return [mutation];
    }
    const { cellValue } = mutation.params;
    if (!cellValue) {
        return [mutation];
    }

    const matrix = new ObjectMatrix(cellValue);

    // Calculate cell count and boundaries
    let cellCount = 0;
    let minRow = Infinity;
    let maxRow = -Infinity;
    let minCol = Infinity;
    let maxCol = -Infinity;

    matrix.forValue((row, col) => {
        cellCount++;
        minRow = Math.min(minRow, row);
        maxRow = Math.max(maxRow, row);
        minCol = Math.min(minCol, col);
        maxCol = Math.max(maxCol, col);
    });

    // If no data or cell count is less than threshold, do not split
    if (minRow === Infinity || cellCount <= threshold) {
        return [mutation];
    }

    const chunks: IMutationInfo<ISetRangeValuesMutationParams>[] = [];

    // Calculate rows per chunk based on column count
    const colCount = maxCol - minCol + 1;
    let rowsPerChunk = Math.max(1, Math.floor(maxCellsPerChunk / colCount));

    // Ensure it does not split into more than maxChunks chunks
    const totalRows = maxRow - minRow + 1;
    const estimatedChunks = Math.ceil(totalRows / rowsPerChunk);
    if (estimatedChunks > maxChunks) {
        // Recalculate rowsPerChunk so that the number of chunks does not exceed maxChunks
        rowsPerChunk = Math.ceil(totalRows / maxChunks);
    }

    // Split by the calculated number of rows
    for (let rowStart = minRow; rowStart <= maxRow; rowStart += rowsPerChunk) {
        const rowEnd = Math.min(rowStart + rowsPerChunk - 1, maxRow);

        const chunkMatrix = new ObjectMatrix<Nullable<ICellData>>();
        let hasData = false;

        // Extract data for the current chunk
        for (let row = rowStart; row <= rowEnd; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                const value = matrix.getValue(row, col);
                if (value !== undefined) {
                    chunkMatrix.setValue(row, col, value);
                    hasData = true;
                }
            }
        }

        // Only create mutation when the chunk has data
        if (hasData) {
            chunks.push({
                ...mutation,
                params: {
                    ...mutation.params,
                    cellValue: chunkMatrix.getMatrix(),
                    __splitChunk__: true,
                },
            });
        }
    }

    return chunks.length > 0 ? chunks : [mutation];
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

function findClosingTsvQuote(text: string, fieldStart: number): number {
    let quote = text.indexOf('"', fieldStart + 1);
    while (quote !== -1 && text[quote + 1] === '"') {
        quote = text.indexOf('"', quote + 2);
    }
    if (quote === -1 || (quote + 1 < text.length && !/[\t\r\n]/.test(text[quote + 1]))) {
        return -1;
    }
    return quote;
}

function parseTsvTextRows(text: string): string[][] {
    const normalized = text.replace(/(?:\r\n|\r|\n)$/, '');
    const rows: string[][] = [[]];
    let fieldStart = 0;
    let quotedValue: string | undefined;

    for (let i = 0; i < normalized.length; i++) {
        const char = normalized[i];

        if (i === fieldStart && char === '"') {
            const closingQuote = findClosingTsvQuote(normalized, fieldStart);
            if (closingQuote !== -1) {
                quotedValue = normalized.slice(fieldStart + 1, closingQuote).replace(/""/g, '"');
                i = closingQuote;
                continue;
            }
        }

        if (char !== '\t' && char !== '\r' && char !== '\n') {
            continue;
        }

        rows[rows.length - 1].push(quotedValue ?? normalized.slice(fieldStart, i));
        quotedValue = undefined;
        if (char === '\r' && normalized[i + 1] === '\n') {
            i++;
        }
        if (char !== '\t') {
            rows.push([]);
        }
        fieldStart = i + 1;
    }

    rows[rows.length - 1].push(quotedValue ?? normalized.slice(fieldStart));
    return rows;
}

export function convertTextToTable(text: string): string {
    const rows = parseTsvTextRows(text);

    let html = '<table>';

    rows.forEach((columns) => {
        html += '<tr>';
        columns.forEach((column) => {
            const escaped = column
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\r\n|\r|\n/g, '<br>');
            html += `<td>${escaped}</td>`;
        });
        html += '</tr>';
    });

    html += '</table>';

    return html;
}
