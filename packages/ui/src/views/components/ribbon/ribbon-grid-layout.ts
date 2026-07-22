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

import type { IMenuSchema } from '../../../services/menu/menu-manager.service';

const RIBBON_GRID_ROWS = 2;

export interface IRibbonGridPlacement {
    item: IMenuSchema;
    row: number;
    column: number;
    rowSpan: number;
    columnSpan: number;
    showLabel: boolean;
    width?: number;
    iconSize?: number;
}

export function placeRibbonGridItems(items: IMenuSchema[]): IRibbonGridPlacement[] {
    const occupied = new Set<string>();
    const placements = new Map<IMenuSchema, IRibbonGridPlacement>();
    const fallbackItems: IMenuSchema[] = [];
    let maxExplicitColumn = 0;

    for (const item of items) {
        const layout = item.gridLayout;
        if (!layout) {
            fallbackItems.push(item);
            continue;
        }

        const rowSpan = layout.rowSpan ?? 1;
        const columnSpan = layout.columnSpan ?? 1;
        const cells = getCells(layout.row, layout.column, rowSpan, columnSpan);
        const valid = cells.length > 0
            && layout.row + rowSpan - 1 <= RIBBON_GRID_ROWS
            && (layout.width === undefined || (Number.isFinite(layout.width) && layout.width > 0))
            && (layout.iconSize === undefined || (Number.isFinite(layout.iconSize) && layout.iconSize > 0))
            && cells.every((cell) => !occupied.has(cell));

        if (!valid) {
            // eslint-disable-next-line node/prefer-global/process
            if (process.env.NODE_ENV !== 'production') {
                globalThis.console.warn(`[RibbonGrid] Invalid gridLayout for "${item.key}"; using fallback placement.`);
            }
            fallbackItems.push(item);
            continue;
        }

        cells.forEach((cell) => occupied.add(cell));
        maxExplicitColumn = Math.max(maxExplicitColumn, layout.column + columnSpan - 1);
        placements.set(item, {
            item,
            row: layout.row,
            column: layout.column,
            rowSpan,
            columnSpan,
            showLabel: layout.showLabel ?? false,
            width: layout.width,
            iconSize: layout.iconSize,
        });
    }

    let fallbackRow = 1;
    let fallbackColumn = maxExplicitColumn + 1;
    for (const item of fallbackItems) {
        placements.set(item, {
            item,
            row: fallbackRow,
            column: fallbackColumn,
            rowSpan: 1,
            columnSpan: 1,
            showLabel: false,
        });
        fallbackRow += 1;
        if (fallbackRow > RIBBON_GRID_ROWS) {
            fallbackRow = 1;
            fallbackColumn += 1;
        }
    }

    return items.map((item) => placements.get(item)!);
}

function getCells(row: number, column: number, rowSpan: number, columnSpan: number): string[] {
    if (![row, column, rowSpan, columnSpan].every(Number.isInteger) || Math.min(row, column, rowSpan, columnSpan) < 1) {
        return [];
    }

    const cells: string[] = [];
    for (let currentRow = row; currentRow < row + rowSpan; currentRow++) {
        for (let currentColumn = column; currentColumn < column + columnSpan; currentColumn++) {
            cells.push(`${currentRow}:${currentColumn}`);
        }
    }
    return cells;
}
