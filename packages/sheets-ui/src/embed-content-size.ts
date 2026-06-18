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
import { UniverInstanceType } from '@univerjs/core';

const DEFAULT_COLUMN_HEADER_HEIGHT = 24;

export function createSheetsContentSizeProvider(): EmbedContentSizeProvider {
    return {
        childType: UniverInstanceType.UNIVER_SHEET,
        measureContentSize: (context) => {
            const height = resolveSheetsContentHeight(context.childUnit);
            return height == null ? undefined : { height };
        },
    };
}

function resolveSheetsContentHeight(childUnit: unknown): number | undefined {
    const workbook = childUnit as Nullable<{
        getActiveSheet?: (allowNull?: true) => Nullable<{
            getConfig?: () => { columnHeader?: { height?: number; hidden?: number } };
            getRowCount?: () => number;
            getRowHeight?: (row: number) => number;
            getRowVisible?: (row: number) => boolean;
        }>;
    }>;
    const worksheet = workbook?.getActiveSheet?.(true);
    if (!worksheet) {
        return undefined;
    }

    const rowCount = worksheet.getRowCount?.();
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

function normalizePositiveNumber(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}

function normalizeNonNegativeNumber(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}
