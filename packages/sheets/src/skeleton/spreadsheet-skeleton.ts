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

import {
    BooleanNumber,
    type ICellWithCoord,
    type IColumnData,
    type IObjectArrayPrimitiveType,
    type IPosition,
    type IRowData,
    searchArray,
    Tools,
    type Worksheet,
} from '@univerjs/core';
import { SheetSkeleton } from './sheet-skeleton';

export interface IGridCellOffset {
    row: number;
    rowOffset: number;
    column: number;
    columnOffset: number;
}

/**
 * Model-level spreadsheet grid layout.
 *
 * Coordinates are logical pixels with the top-left of A1 as the origin. Sheet
 * headers, render gaps, scene margins, zoom, scroll and viewport transforms are
 * intentionally excluded.
 */
export class SpreadsheetSkeleton extends SheetSkeleton {
    private _rowTotalHeight = 0;
    private _columnTotalWidth = 0;
    private _rowHeightAccumulation: number[] = [];
    private _columnWidthAccumulation: number[] = [];

    constructor(worksheet: Worksheet) {
        super(worksheet);
    }

    get rowHeightAccumulation(): number[] {
        return this._rowHeightAccumulation;
    }

    get rowTotalHeight(): number {
        return this._rowTotalHeight;
    }

    get columnWidthAccumulation(): number[] {
        return this._columnWidthAccumulation;
    }

    get columnTotalWidth(): number {
        return this._columnTotalWidth;
    }

    getRowCount(): number {
        return this._rowHeightAccumulation.length;
    }

    getColumnCount(): number {
        return this._columnWidthAccumulation.length;
    }

    calculate(): SpreadsheetSkeleton {
        if (!this.dirty) {
            return this;
        }

        this._refreshWorksheetData();
        const {
            rowCount,
            columnCount,
            rowData,
            columnData,
            defaultRowHeight,
            defaultColumnWidth,
        } = this._worksheetData;

        const rows = this._calculateRows(rowCount, rowData, defaultRowHeight);
        const columns = this._calculateColumns(columnCount, columnData, defaultColumnWidth);
        this._rowTotalHeight = rows.total;
        this._rowHeightAccumulation = rows.accumulation;
        this._columnTotalWidth = columns.total;
        this._columnWidthAccumulation = columns.accumulation;
        this.makeDirty(false);

        return this;
    }

    getNoMergeCellWithCoordByIndex(row: number, column: number): IPosition {
        const boundedRow = Tools.clamp(row, 0, this._rowHeightAccumulation.length - 1);
        const boundedColumn = Tools.clamp(column, 0, this._columnWidthAccumulation.length - 1);

        return {
            startY: this._rowHeightAccumulation[boundedRow - 1] ?? 0,
            endY: this._rowHeightAccumulation[boundedRow] ?? this._rowTotalHeight,
            startX: this._columnWidthAccumulation[boundedColumn - 1] ?? 0,
            endX: this._columnWidthAccumulation[boundedColumn] ?? this._columnTotalWidth,
        };
    }

    getCellWithCoordByIndex(row: number, column: number): ICellWithCoord {
        const boundedRow = Tools.clamp(row, 0, this._rowHeightAccumulation.length - 1);
        const boundedColumn = Tools.clamp(column, 0, this._columnWidthAccumulation.length - 1);
        const position = this.getNoMergeCellWithCoordByIndex(boundedRow, boundedColumn);
        const merge = this.worksheet.getCellInfoInMergeData(boundedRow, boundedColumn);
        const mergeStart = this.getNoMergeCellWithCoordByIndex(merge.startRow, merge.startColumn);
        const mergeEnd = this.getNoMergeCellWithCoordByIndex(merge.endRow, merge.endColumn);

        return {
            actualRow: boundedRow,
            actualColumn: boundedColumn,
            ...position,
            isMerged: merge.isMerged,
            isMergedMainCell: merge.isMergedMainCell,
            mergeInfo: {
                startRow: merge.startRow,
                startColumn: merge.startColumn,
                endRow: merge.endRow,
                endColumn: merge.endColumn,
                startY: mergeStart.startY,
                endY: mergeEnd.endY,
                startX: mergeStart.startX,
                endX: mergeEnd.endX,
            },
        };
    }

    getCellIndexAndOffsetByPosition(offsetX: number, offsetY: number): IGridCellOffset {
        const row = searchArray(this._rowHeightAccumulation, offsetY);
        const column = searchArray(this._columnWidthAccumulation, offsetX);
        const start = this.getNoMergeCellWithCoordByIndex(row, column);

        return {
            row,
            rowOffset: offsetY - start.startY,
            column,
            columnOffset: offsetX - start.startX,
        };
    }

    getOffsetRelativeToRowCol(offsetX: number, offsetY: number): IGridCellOffset {
        return this.getCellIndexAndOffsetByPosition(offsetX, offsetY);
    }

    getOffsetByColumn(column: number): number {
        if (column < 0) {
            return 0;
        }

        return this._columnWidthAccumulation[column] ?? this._columnTotalWidth;
    }

    getOffsetByRow(row: number): number {
        if (row < 0) {
            return 0;
        }

        return this._rowHeightAccumulation[row] ?? this._rowTotalHeight;
    }

    override dispose(): void {
        super.dispose();
        this._rowHeightAccumulation = [];
        this._columnWidthAccumulation = [];
        this._rowTotalHeight = 0;
        this._columnTotalWidth = 0;
    }

    private _calculateRows(
        rowCount: number,
        rowData: IObjectArrayPrimitiveType<Partial<IRowData>>,
        defaultRowHeight: number
    ): { total: number; accumulation: number[] } {
        let total = 0;
        const accumulation: number[] = [];

        for (let row = 0; row < rowCount; row++) {
            const rowItem = rowData[row];
            let height = defaultRowHeight;

            if (this.worksheet.getRowFiltered(row) || rowItem?.hd === BooleanNumber.TRUE) {
                height = 0;
            } else if (rowItem) {
                const { h = defaultRowHeight, ah, ia } = rowItem;
                height = (ia == null || ia === BooleanNumber.TRUE) && typeof ah === 'number' && ah > 0 ? ah : h;
            }

            total += height;
            accumulation.push(total);
        }

        return { total, accumulation };
    }

    private _calculateColumns(
        columnCount: number,
        columnData: IObjectArrayPrimitiveType<Partial<IColumnData>>,
        defaultColumnWidth: number
    ): { total: number; accumulation: number[] } {
        let total = 0;
        const accumulation: number[] = [];

        for (let column = 0; column < columnCount; column++) {
            const columnItem = columnData[column];
            const width = columnItem?.hd === BooleanNumber.TRUE ? 0 : columnItem?.w ?? defaultColumnWidth;
            total += width;
            accumulation.push(total);
        }

        return { total, accumulation };
    }
}
