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

import type { Nullable } from '@univerjs/core';
import type { EmbedContentSizeProvider } from '@univerjs/embed-ui';
import { DEFAULT_WORKSHEET_ROW_TITLE_WIDTH, UniverInstanceType } from '@univerjs/core';

const DEFAULT_COLUMN_HEADER_HEIGHT = 24;
const DEFAULT_COLUMN_WIDTH = 88;

export function createSheetsContentSizeProvider(): EmbedContentSizeProvider {
    return {
        childType: UniverInstanceType.UNIVER_SHEET,
        measureContentSize: (context) => {
            const height = resolveSheetsContentHeight(context.childUnit);
            const width = resolveSheetsContentWidth(context.childUnit);
            return height == null && width == null ? undefined : { height, width };
        },
    };
}

interface SheetLikeWorksheet {
    getColVisible?: (column: number) => boolean;
    getCellMatrix?: () => {
        getDataRange?: () => {
            endColumn?: number;
            endRow?: number;
        } | null | undefined;
    };
    getColumnCount?: () => number;
    getColumnWidth?: (column: number) => number;
    getConfig?: () => {
        columnHeader?: { height?: number; hidden?: number };
        rowHeader?: { hidden?: number; width?: number };
    };
    getRowCount?: () => number;
    getRowHeight?: (row: number) => number;
    getRowVisible?: (row: number) => boolean;
}

function resolveSheetsContentHeight(childUnit: unknown): number | undefined {
    const workbook = childUnit as Nullable<{
        getActiveSheet?: (allowNull?: true) => Nullable<SheetLikeWorksheet>;
    }>;
    const worksheet = workbook?.getActiveSheet?.(true);
    if (!worksheet) {
        return undefined;
    }

    const rowCount = resolveSheetsContentRowCount(worksheet);
    if (!Number.isFinite(rowCount) || rowCount == null || rowCount < 0) {
        return undefined;
    }

    const columnHeader = worksheet.getConfig?.()?.columnHeader;
    const headerHeight = columnHeader?.hidden
        ? 0
        : normalizePositiveNumber(columnHeader?.height, DEFAULT_COLUMN_HEADER_HEIGHT);
    let rowHeight = 0;

    for (let row = 0; row < rowCount; row++) {
        if (worksheet.getRowVisible?.(row) === false) {
            continue;
        }
        rowHeight += normalizeNonNegativeNumber(worksheet.getRowHeight?.(row), 0);
    }

    return headerHeight + rowHeight;
}

function resolveSheetsContentWidth(childUnit: unknown): number | undefined {
    const workbook = childUnit as Nullable<{
        getActiveSheet?: (allowNull?: true) => Nullable<SheetLikeWorksheet>;
    }>;
    const worksheet = workbook?.getActiveSheet?.(true);
    if (!worksheet) {
        return undefined;
    }

    const columnCount = resolveSheetsContentColumnCount(worksheet);
    if (!Number.isFinite(columnCount) || columnCount == null || columnCount < 0) {
        return undefined;
    }

    const rowHeader = worksheet.getConfig?.()?.rowHeader;
    const rowHeaderWidth = rowHeader?.hidden
        ? 0
        : normalizePositiveNumber(rowHeader?.width, DEFAULT_WORKSHEET_ROW_TITLE_WIDTH);
    let columnWidth = 0;

    for (let column = 0; column < columnCount; column++) {
        if (worksheet.getColVisible?.(column) === false) {
            continue;
        }
        columnWidth += normalizePositiveNumber(worksheet.getColumnWidth?.(column), DEFAULT_COLUMN_WIDTH);
    }

    return rowHeaderWidth + columnWidth;
}

function resolveSheetsContentRowCount(worksheet: SheetLikeWorksheet): number | undefined {
    return resolveBoundedContentCount(worksheet.getRowCount?.(), worksheet.getCellMatrix?.()?.getDataRange?.()?.endRow);
}

function resolveSheetsContentColumnCount(worksheet: SheetLikeWorksheet): number | undefined {
    return resolveBoundedContentCount(worksheet.getColumnCount?.(), worksheet.getCellMatrix?.()?.getDataRange?.()?.endColumn);
}

function resolveBoundedContentCount(totalCount: unknown, dataRangeEndIndex: unknown): number | undefined {
    const normalizedTotalCount = typeof totalCount === 'number' && Number.isFinite(totalCount) && totalCount >= 0
        ? totalCount
        : undefined;
    const dataCount = typeof dataRangeEndIndex === 'number' && Number.isFinite(dataRangeEndIndex) && dataRangeEndIndex >= 0
        ? dataRangeEndIndex + 1
        : undefined;

    if (normalizedTotalCount == null) {
        return dataCount;
    }

    if (dataCount == null) {
        return normalizedTotalCount;
    }

    return Math.min(normalizedTotalCount, dataCount);
}

function normalizePositiveNumber(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}

function normalizeNonNegativeNumber(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}
