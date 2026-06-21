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
import type { IEmbedContentSizeProvider } from '@univerjs/embed-ui';
import { DEFAULT_WORKSHEET_COLUMN_WIDTH, DEFAULT_WORKSHEET_ROW_HEIGHT, DEFAULT_WORKSHEET_ROW_TITLE_WIDTH, UniverInstanceType } from '@univerjs/core';

const DEFAULT_COLUMN_HEADER_HEIGHT = 24;

export function createSheetsContentSizeProvider(): IEmbedContentSizeProvider {
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
        getDataRange?: () => SheetLikeDataRange | null | undefined;
    };
    getColumnCount?: () => number;
    getColumnWidth?: (column: number) => number;
    getConfig?: () => {
        columnHeader?: { height?: number; hidden?: number };
        defaultColumnWidth?: number;
        defaultRowHeight?: number;
        rowHeader?: { hidden?: number; width?: number };
    };
    getRowCount?: () => number;
    getRowHeight?: (row: number) => number;
    getRowVisible?: (row: number) => boolean;
}

interface SheetLikeDataRange {
    endColumn?: number;
    endRow?: number;
    startColumn?: number;
    startRow?: number;
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
    const defaultRowHeight = normalizePositiveNumber(worksheet.getConfig?.()?.defaultRowHeight, DEFAULT_WORKSHEET_ROW_HEIGHT);
    const headerHeight = columnHeader?.hidden
        ? 0
        : normalizePositiveNumber(columnHeader?.height, DEFAULT_COLUMN_HEADER_HEIGHT);
    let rowHeight = 0;

    for (let row = 0; row < rowCount; row++) {
        if (worksheet.getRowVisible?.(row) === false) {
            continue;
        }
        rowHeight += normalizeNonNegativeNumber(worksheet.getRowHeight?.(row), defaultRowHeight);
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
    const defaultColumnWidth = normalizePositiveNumber(worksheet.getConfig?.()?.defaultColumnWidth, DEFAULT_WORKSHEET_COLUMN_WIDTH);
    const rowHeaderWidth = rowHeader?.hidden
        ? 0
        : normalizePositiveNumber(rowHeader?.width, DEFAULT_WORKSHEET_ROW_TITLE_WIDTH);
    let columnWidth = 0;

    for (let column = 0; column < columnCount; column++) {
        if (worksheet.getColVisible?.(column) === false) {
            continue;
        }
        columnWidth += normalizePositiveNumber(worksheet.getColumnWidth?.(column), defaultColumnWidth);
    }

    return rowHeaderWidth + columnWidth;
}

function resolveSheetsContentRowCount(worksheet: SheetLikeWorksheet): number | undefined {
    return normalizeContentCount(worksheet.getRowCount?.());
}

function resolveSheetsContentColumnCount(worksheet: SheetLikeWorksheet): number | undefined {
    const cellMatrix = worksheet.getCellMatrix?.();
    const dataRange = cellMatrix?.getDataRange?.();

    return resolveEffectiveContentCount(cellMatrix, dataRange, dataRange?.endColumn, worksheet.getColumnCount?.());
}

function resolveEffectiveContentCount(cellMatrix: unknown, dataRange: SheetLikeDataRange | null | undefined, endIndex: unknown, totalCount: unknown): number | undefined {
    if (cellMatrix == null) {
        return normalizeContentCount(totalCount);
    }

    if (!isValidDataRange(dataRange)) {
        return undefined;
    }

    if (typeof endIndex !== 'number' || !Number.isFinite(endIndex) || endIndex < 0) {
        return undefined;
    }

    const contentCount = Math.floor(endIndex) + 1;
    const normalizedTotal = normalizeContentCount(totalCount);

    return normalizedTotal == null ? contentCount : Math.min(contentCount, normalizedTotal);
}

function normalizeContentCount(value: unknown): number | undefined {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0
        ? Math.floor(value)
        : undefined;
}

function isValidDataRange(dataRange: SheetLikeDataRange | null | undefined): dataRange is SheetLikeDataRange {
    return typeof dataRange?.endRow === 'number' &&
        Number.isFinite(dataRange.endRow) &&
        dataRange.endRow >= 0 &&
        typeof dataRange.endColumn === 'number' &&
        Number.isFinite(dataRange.endColumn) &&
        dataRange.endColumn >= 0;
}

function normalizePositiveNumber(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}

function normalizeNonNegativeNumber(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}
