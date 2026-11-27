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

import type { IDocumentData, INumberUnit, ITable, ITableCellBorder, ITableRow } from '@univerjs/core';
import { DocStyleType, NumberUnitType } from '@univerjs/core';

export function resolveTableCellSpacing(
    source: ITable,
    document?: Partial<Pick<IDocumentData, 'styles' | 'documentStyle'>>
): ITable {
    let styleId = source.styleId ?? document?.documentStyle?.defaultTableStyleId;
    const visited = new Set<string>();
    let tableSpacing: INumberUnit | undefined;
    let rowSpacing: INumberUnit | undefined;
    while (styleId && !visited.has(styleId)) {
        visited.add(styleId);
        const style = document?.styles?.[styleId];
        if (style?.type !== DocStyleType.table) {
            break;
        }
        tableSpacing ??= style.tableProperties?.cellSpacing;
        rowSpacing ??= style.rowProperties?.cellSpacing;
        styleId = style.basedOn;
    }
    tableSpacing = source.cellSpacing ?? tableSpacing;
    let changed = tableSpacing !== source.cellSpacing;
    const tableRows = source.tableRows.map((row) => {
        const cellSpacing = row.cellSpacing ?? rowSpacing ?? row.defaultCellSpacing ?? tableSpacing;
        if (cellSpacing == null || cellSpacing === row.cellSpacing) {
            return row;
        }
        changed = true;
        return { ...row, cellSpacing };
    });
    return changed ? { ...source, ...(tableSpacing == null ? {} : { cellSpacing: tableSpacing }), tableRows } : source;
}

export function getTableCellSpacing(table: ITable, row: number | ITableRow): number | undefined {
    const source = typeof row === 'number' ? table.tableRows?.[row] : row;
    const unit = source?.cellSpacing ?? source?.defaultCellSpacing ?? table.cellSpacing;
    if (unit == null) {
        return;
    }
    const value = unit.u === NumberUnitType.PERCENT ? 0 : unit.v ?? 0;
    return Number.isFinite(value) && value >= 0 ? value : undefined;
}

export function getCellBorderWidth(border: ITableCellBorder | undefined): number {
    return border == null || border.color?.rgb === 'transparent' ? 0 : Math.max(0, border.width?.v ?? 1);
}

export function hasTableCellSpacing(table: ITable): boolean {
    return table.tableRows?.some((_, row) => getTableCellSpacing(table, row) != null) ?? false;
}

export function getTableOuterBorder(table: ITable, edge: 'top' | 'bottom' | 'left' | 'right'): ITableCellBorder | undefined {
    let rows = table.tableRows;
    if (edge === 'top') {
        rows = rows.slice(0, 1);
    } else if (edge === 'bottom') {
        rows = rows.slice(-1);
    }
    let result: ITableCellBorder | undefined;
    for (const row of rows) {
        const defaults = row.borderDefaults?.[edge] ?? table.borderDefaults?.[edge];
        let cells = row.tableCells;
        if (edge === 'left') {
            cells = cells.slice(0, 1);
        } else if (edge === 'right') {
            cells = cells.slice(-1);
        }
        for (const cell of cells) {
            let border: ITableCellBorder | undefined;
            if (edge === 'top') {
                border = cell.borderTop?.tableTopBorder ?? defaults ?? cell.borderTop;
            } else if (edge === 'bottom') {
                border = cell.borderBottom?.tableBottomBorder ?? defaults ?? cell.borderBottom;
            } else if (edge === 'left') {
                border = defaults ?? cell.borderLeft;
            } else {
                border = defaults ?? cell.borderRight;
            }
            if (getCellBorderWidth(border) > getCellBorderWidth(result)) {
                result = border;
            }
        }
    }
    return result;
}

export function getTableCellSpacingInsets(table: ITable, row: number, column: number): { left: number; right: number; top: number; bottom: number } {
    const spacing = getTableCellSpacing(table, row);
    if (spacing == null) {
        return { left: 0, right: 0, top: 0, bottom: 0 };
    }
    const rowSource = table.tableRows[row];
    const cell = rowSource.tableCells[column];
    const lastRow = Math.min(table.tableRows.length - 1, row + Math.max(1, cell.rowSpan ?? 1) - 1);
    const leading = column === 0 && !rowSource.gridBefore;
    const trailing = !rowSource.gridAfter && rowSource.tableCells.slice(column + 1).every((after) => after.columnSpan === 0 && after.rowSpan !== 0);
    const topMargin = cell.margin?.top ?? table.cellMargin?.top;
    const paddingTop = topMargin == null ? 5 : topMargin.v ?? 0;
    const rowPaddingTop = rowSource.tableCells.reduce((padding, source) => {
        const margin = source.margin?.top ?? table.cellMargin?.top;
        return Math.max(padding, margin == null ? 5 : margin.v ?? 0);
    }, 0);
    return {
        left: spacing * (leading ? 2 : 1) + getCellBorderWidth(cell.borderLeft) / 2,
        right: spacing * (trailing ? 2 : 1) + getCellBorderWidth(cell.borderRight) / 2,
        top: spacing + getCellBorderWidth(cell.borderTop) / 2 + rowPaddingTop - paddingTop,
        bottom: (getTableCellSpacing(table, lastRow) ?? 0) + getCellBorderWidth(cell.borderBottom) / 2,
    };
}
