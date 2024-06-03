/**
 * Copyright 2023-present DreamNum Inc.
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

import type { Nullable } from '../shared';
import { ObjectMatrix, Rectangle, Tools } from '../shared';
import { createRowColIter } from '../shared/row-col-iter';
import { type BooleanNumber, CellValueType } from '../types/enum';
import type { ICellData, ICellDataForSheetInterceptor, IFreeze, IRange, IWorksheetData } from '../types/interfaces';
import { ColumnManager } from './column-manager';
import { Range } from './range';
import { RowManager } from './row-manager';
import { mergeWorksheetSnapshotWithDefault } from './sheet-snapshot-utils';
import type { Styles } from './styles';
import { SheetViewModel } from './view-model';

/**
 * The model of a Worksheet.
 */
export class Worksheet {
    protected _sheetId: string;
    protected _snapshot: IWorksheetData;
    protected _cellData: ObjectMatrix<ICellData>;

    protected _rowManager: RowManager;
    protected _columnManager: ColumnManager;

    protected readonly _viewModel: SheetViewModel;

    constructor(
        public readonly unitId: string,
        snapshot: Partial<IWorksheetData>,
        private readonly _styles: Styles
    ) {
        this._snapshot = mergeWorksheetSnapshotWithDefault(snapshot);

        const { columnData, rowData, cellData } = this._snapshot;
        this._sheetId = this._snapshot.id ?? Tools.generateRandomId(6);
        this._cellData = new ObjectMatrix<ICellData>(cellData);

        // This view model will immediately injected with hooks from SheetViewModel service as Worksheet is constructed.
        this._viewModel = new SheetViewModel((row, col) => this.getCellRaw(row, col));
        this._rowManager = new RowManager(this._snapshot, this._viewModel, rowData);
        this._columnManager = new ColumnManager(this._snapshot, columnData);
    }

    /**
     * @internal
     * @param callback
     */
    __interceptViewModel(callback: (viewModel: SheetViewModel) => void) {
        callback(this._viewModel);
    }

    getSnapshot(): IWorksheetData {
        return this._snapshot;
    }

    /**
     * Returns WorkSheet Cell Data Matrix
     * @returns
     */
    getCellMatrix(): ObjectMatrix<Nullable<ICellData>> {
        return this._cellData;
    }

    /**
     * Get worksheet printable cell range.
     * @returns
     */
    getCellMatrixPrintRange() {
        const matrix = this.getCellMatrix();
        const mergedCells = this.getMergeData();

        let startRow = -1;
        let endRow = -1;
        let startColumn = -1;
        let endColumn = -1;

        let rowInitd = false;
        let columnInitd = false;
        matrix.forEach((rowIndex, row) => {
            Object.keys(row).forEach((colIndexStr) => {
                const colIndex = +colIndexStr;
                const cellValue = matrix.getValue(rowIndex, colIndex);
                const style = cellValue?.s ? this._styles.get(cellValue.s) : null;
                const isLegalBorder =
                    style?.bd &&
                    (
                        style.bd.b
                        || style.bd.l
                        || style.bd.r
                        || style.bd.t
                        || style.bd.bc_tr
                        || style.bd.bl_tr
                        || style.bd.ml_tr
                        || style.bd.tl_bc
                        || style.bd.tl_br
                        || style.bd.tl_mr
                    );
                if ((cellValue && (cellValue.v || cellValue.p)) || style?.bg || isLegalBorder) {
                    if (rowInitd) {
                        startRow = Math.min(startRow, rowIndex);
                    } else {
                        startRow = rowIndex;
                        rowInitd = true;
                    }
                    endRow = Math.max(endRow, rowIndex);

                    if (columnInitd) {
                        startColumn = Math.min(startColumn, colIndex);
                    } else {
                        columnInitd = true;
                        startColumn = colIndex;
                    }

                    endColumn = Math.max(endColumn, colIndex);
                }
            });
        });

        mergedCells.forEach((mergedCell) => {
            if (rowInitd) {
                startRow = Math.min(startRow, mergedCell.startRow);
            } else {
                startRow = mergedCell.startRow;
                rowInitd = true;
            }
            endRow = Math.max(endRow, mergedCell.endRow);

            if (columnInitd) {
                startColumn = Math.min(startColumn, mergedCell.startColumn);
            } else {
                startColumn = mergedCell.startColumn;
                rowInitd = true;
            }
            endColumn = Math.max(endColumn, mergedCell.endColumn);
        });

        if (!rowInitd || !columnInitd) {
            return null;
        }

        return {
            startColumn,
            startRow,
            endColumn,
            endRow,
        };
    }

    /**
     * Returns Row Manager
     * @returns Row Manager
     */
    getRowManager(): RowManager {
        return this._rowManager;
    }

    /**
     * Returns the ID of its parent unit.
     */
    getUnitId(): string {
        return this.unitId;
    }

    /**
     * Returns the ID of the sheet represented by this object.
     * @returns ID of the sheet
     */
    getSheetId(): string {
        return this._sheetId;
    }

    /**
     * Returns Column Manager
     * @returns Column Manager
     */
    getColumnManager(): ColumnManager {
        return this._columnManager;
    }

    /**
     * Returns the name of the sheet.
     * @returns name of the sheet
     */
    getName(): string {
        return this._snapshot.name;
    }

    /**
     * Returns WorkSheet Clone Object
     * @returns WorkSheet Clone Object
     * @deprecated
     */
    clone(): Worksheet {
        const { _snapshot: _config } = this;
        const copy = Tools.deepClone(_config);

        return new Worksheet(this.unitId, copy, this._styles);
    }

    getMergeData(): IRange[] {
        return this._snapshot.mergeData;
    }

    getMergedCell(row: number, col: number): Nullable<IRange> {
        const rectangleList = this._snapshot.mergeData;
        for (let i = 0; i < rectangleList.length; i++) {
            const range = rectangleList[i];
            if (
                Rectangle.intersects(
                    {
                        startRow: row,
                        startColumn: col,
                        endRow: row,
                        endColumn: col,
                    },
                    range
                )
            ) {
                return range;
            }
        }

        return null;
    }

    getCell(row: number, col: number): Nullable<ICellDataForSheetInterceptor> {
        if (row < 0 || col < 0) {
            return null;
        }

        return this._viewModel.getCell(row, col);
    }

    getCellRaw(row: number, col: number): Nullable<ICellData> {
        return this.getCellMatrix().getValue(row, col);
    }

    getRowFiltered(row: number): boolean {
        return this._viewModel.getRowFiltered(row);
    }

    /**
     * Get cell matrix from a given range and pick out non-first cells of merged cells.
     *
     * Notice that `ICellData` here is not after copying. In another word, the object matrix here should be
     * considered as a slice of the original worksheet data matrix.
     */
    getMatrixWithMergedCells(
        row: number,
        col: number,
        endRow: number,
        endCol: number,
        isRaw = false
    ): ObjectMatrix<ICellData & { rowSpan?: number; colSpan?: number }> {
        const matrix = this.getCellMatrix();

        // get all merged cells
        const mergedCellsInRange = this._snapshot.mergeData.filter((rect) =>
            Rectangle.intersects({ startRow: row, startColumn: col, endRow, endColumn: endCol }, rect)
        );

        // iterate all cells in the range
        const returnCellMatrix = new ObjectMatrix<ICellData & { rowSpan?: number; colSpan?: number }>();
        createRowColIter(row, endRow, col, endCol).forEach((row, col) => {
            const v = isRaw ? this.getCellRaw(row, col) : this.getCell(row, col);
            if (v) {
                returnCellMatrix.setValue(row, col, v);
            }
        });

        // iterate over all merged cells in the range and remove non-top-left positions
        // from the matrix we just created
        mergedCellsInRange.forEach((mergedCell) => {
            const { startColumn, startRow, endColumn, endRow } = mergedCell;
            createRowColIter(startRow, endRow, startColumn, endColumn).forEach((row, col) => {
                if (row === startRow && col === startColumn) {
                    returnCellMatrix.setValue(row, col, {
                        ...matrix.getValue(row, col),
                        rowSpan: endRow - startRow + 1,
                        colSpan: endColumn - startColumn + 1,
                    });
                }

                if (row !== startRow || col !== startColumn) {
                    returnCellMatrix.realDeleteValue(row, col);
                }
            });
        });

        return returnCellMatrix;
    }

    getRange(range: IRange): Range;
    getRange(startRow: number, startColumn: number): Range;
    getRange(startRow: number, startColumn: number, endRow: number, endColumn: number): Range;
    getRange(startRowOrRange: number | IRange, startColumn?: number, endRow?: number, endColumn?: number): Range {
        if (typeof startRowOrRange === 'object') {
            return new Range(this, startRowOrRange, {
                getStyles: () => this._styles,
            });
        }

        return new Range(
            this,
            {
                startRow: startRowOrRange,
                startColumn: startColumn!,
                endColumn: endColumn || startColumn!,
                endRow: endRow || startRowOrRange,
            },
            {
                getStyles: () => this._styles,
            }
        );
    }

    getScrollLeftTopFromSnapshot() {
        return {
            scrollLeft: this._snapshot.scrollLeft,
            scrollTop: this._snapshot.scrollTop,
        };
    }

    /**
     * Return WorkSheetZoomRatio
     * @return zoomRatio
     */
    getZoomRatio(): number {
        return this._snapshot.zoomRatio || 1;
    }

    /**
     * Returns WorkSheet Configures
     * @returns WorkSheet Configures
     */
    getConfig(): IWorksheetData {
        return this._snapshot;
    }

    /**
     * Returns  frozen.
     * @returns  frozen
     */
    getFreeze(): IFreeze {
        return this._snapshot.freeze;
    }

    /**
     * Returns the current number of columns in the sheet, regardless of content.
     * @returns the current number of columns in the sheet, regardless of content
     */
    getMaxColumns(): number {
        const { _snapshot: _config } = this;
        const { columnCount } = _config;

        return columnCount;
    }

    /**
     * Returns the current number of rows in the sheet, regardless of content.
     * @returns the current number of rows in the sheet, regardless of content
     */
    getMaxRows(): number {
        const { _snapshot: _config } = this;
        const { rowCount } = _config;

        return rowCount;
    }

    getRowCount(): number {
        return this._snapshot.rowCount;
    }

    setRowCount(count: number): void {
        this._snapshot.rowCount = count;
    }

    getColumnCount(): number {
        return this._snapshot.columnCount;
    }

    setColumnCount(count: number): void {
        this._snapshot.columnCount = count;
    }

    /**
     * isSheetHidden
     * @returns hidden status of sheet
     */
    isSheetHidden(): BooleanNumber {
        return this._snapshot.hidden;
    }

    /**
     * Returns true if the sheet's gridlines are hidden; otherwise returns false. Gridlines are visible by default.
     * @returns Gridlines Hidden Status
     */
    hasHiddenGridlines(): boolean {
        const { _snapshot: _config } = this;
        const { showGridlines } = _config;
        if (showGridlines === 0) {
            return true;
        }

        return false;
    }

    /**
     * Gets the sheet tab color, or null if the sheet tab has no color.
     * @returns the sheet tab color or null
     */
    getTabColor(): Nullable<string> {
        const { _snapshot: _config } = this;
        const { tabColor } = _config;

        return tabColor;
    }

    /**
     * Gets the width in pixels of the given column.
     * @param columnPosition column index
     * @returns Gets the width in pixels of the given column.
     */
    getColumnWidth(columnPosition: number): number {
        return this.getColumnManager().getColumnWidth(columnPosition);
    }

    /**
     * Gets the height in pixels of the given row.
     * @param row row index
     * @returns Gets the height in pixels of the given row.
     */
    getRowHeight(row: number): number {
        const filtered = this._viewModel.getRowFiltered(row);
        if (filtered) return 0;

        return this.getRowManager().getRowHeight(row);
    }

    /**
     * Get if the row in visible. It may be affected by features like filter and view.
     * @param row the row index
     * @returns if the row in visible to the user
     */
    getRowVisible(row: number): boolean {
        const filtered = this._viewModel.getRowFiltered(row);
        if (filtered) return false;

        return this.getRowRawVisible(row);
    }

    /**
     * Get if the row does not have `hidden` property.
     * @param row the row index
     * @returns if the row does not have `hidden` property
     */
    getRowRawVisible(row: number): boolean {
        return this.getRowManager().getRowRawVisible(row);
    }

    getHiddenRows(start?: number, end?: number): IRange[] {
        const lastColumn = this.getMaxColumns() - 1;
        const ranges = this._rowManager.getHiddenRows(start, end);
        ranges.forEach((range) => (range.endColumn = lastColumn));

        return ranges;
    }

    getColVisible(col: number): boolean {
        return this._columnManager.getColVisible(col);
    }

    getHiddenCols(start?: number, end?: number): IRange[] {
        const lastRow = this.getMaxRows() - 1;
        const ranges = this._columnManager.getHiddenCols(start, end);
        ranges.forEach((range) => (range.endRow = lastRow));

        return ranges;
    }

    /**
     * Get all visible rows in the sheet.
     * @returns Visible rows range list
     */
    getVisibleRows(): IRange[] {
        const rowCount = this.getRowCount();
        return this._rowManager.getVisibleRows(0, rowCount - 1);
    }

    /**
     * Get all visible columns in the sheet.
     * @returns Visible columns range list
     */
    getVisibleCols(): IRange[] {
        const columnCount = this.getColumnCount();
        return this._columnManager.getVisibleCols(0, columnCount - 1);
    }

    /**
     * Returns true if this sheet layout is right-to-left. Returns false if the sheet uses the default left-to-right layout.
     * @returns true if this sheet layout is right-to-left. Returns false if the sheet uses the default left-to-right layout.
     */
    isRightToLeft(): BooleanNumber {
        const { _snapshot: _config } = this;
        const { rightToLeft } = _config;

        return rightToLeft;
    }

    /**
     * Returns the position of the last row that has content.
     * @returns the position of the last row that has content.
     */
    getLastRowWithContent(): number {
        return this._cellData.getLength() - 1;
    }

    /**
     * Returns the position of the last column that has content.
     * @returns the position of the last column that has content.
     */
    getLastColumnWithContent(): number {
        return this._cellData.getRange().endColumn;
    }

    cellHasValue(value: ICellData) {
        return value && (value.v !== undefined || value.f !== undefined || value.p !== undefined);
    }

    // #region iterators

    // NOTE: performance intensive. Should keep an eye on methods in this region.

    /**
     * Iterate a range row by row.
     *
     * Performance intensive.
     *
     * @param range the iterate range
     * @param skipEmpty whether to skip empty cells, default to be `true`
     */
    iterateByRow(range: IRange, skipEmpty = true): Iterable<Readonly<ICell>> {
        const { startRow, startColumn, endRow, endColumn } = range;

        // eslint-disable-next-line ts/no-this-alias
        const worksheet = this;

        return {
            [Symbol.iterator]: () => {
                let rowIndex = startRow;
                let columnIndex = startColumn;

                return {
                    next(): IteratorResult<Readonly<ICell>> {
                        while (true) {
                            if (columnIndex > endColumn) {
                                rowIndex += 1;
                                columnIndex = startColumn;
                            }

                            if (rowIndex > endRow) {
                                return { done: true, value: undefined };
                            }

                            // search for the next cell that is not non-top-left cell of a merged cell
                            const cellValue = worksheet.getCell(rowIndex, columnIndex);
                            const isEmptyCell = !cellValue;
                            const mergedCell = worksheet.getMergedCell(rowIndex, columnIndex);

                            if (mergedCell) {
                                const isNotTopLeft = rowIndex !== mergedCell.startRow || columnIndex !== mergedCell.startColumn;
                                if (isNotTopLeft) {
                                    columnIndex = mergedCell.endColumn + 1;
                                    continue;
                                }

                                if (isEmptyCell && skipEmpty) {
                                    columnIndex = mergedCell.endColumn + 1;
                                    continue;
                                }

                                const value: ICell = { row: rowIndex, col: columnIndex, value: cellValue };
                                value.colSpan = mergedCell.endColumn - mergedCell.startColumn + 1;
                                value.rowSpan = mergedCell.endRow - mergedCell.startRow + 1;
                                columnIndex = mergedCell.endColumn + 1;
                                return { done: false, value };
                            }

                            if (isEmptyCell && skipEmpty) {
                                columnIndex += 1;
                            } else {
                                const value: ICell = { row: rowIndex, col: columnIndex, value: cellValue };
                                columnIndex += 1;
                                return { done: false, value };
                            }
                        }
                    },
                };
            },
        };
    }

    /**
     * Iterate a range column by column. This is pretty similar to `iterateByRow` but with different order.
     *
     * Performance intensive.
     *
     * @param range The iterate range.
     * @param skipEmpty Whether to skip empty cells, default to be `true`.
     * @param skipNonTopLeft Whether to skip non-top-left cells of merged cells, default to be `true`. If the
     * parameter is set to `false`, the iterator will return cells in the top row.
     */
    iterateByColumn(range: IRange, skipEmpty = true, skipNonTopLeft = true): Iterable<Readonly<ICell>> {
        const { startRow, startColumn, endRow, endColumn } = range;

        // eslint-disable-next-line ts/no-this-alias
        const worksheet = this;

        return {
            [Symbol.iterator]: () => {
                let rowIndex = startRow;
                let columnIndex = startColumn;

                return {
                    next(): IteratorResult<Readonly<ICell>> {
                        while (true) {
                            if (rowIndex > endRow) {
                                columnIndex += 1;
                                rowIndex = startRow;
                            }

                            if (columnIndex > endColumn) {
                                return { done: true, value: undefined };
                            }

                            // search for the next cell that is not non-top-left cell of a merged cell
                            const mergedCell = worksheet.getMergedCell(rowIndex, columnIndex);

                            if (mergedCell) {
                                const isNotTop = rowIndex !== mergedCell.startRow;
                                const isNotTopLeft = isNotTop || columnIndex !== mergedCell.startColumn;
                                if ((skipNonTopLeft && isNotTopLeft) || (!skipNonTopLeft && isNotTop)) {
                                    rowIndex = mergedCell.endRow + 1;
                                    continue;
                                }

                                const cellValue = worksheet.getCell(mergedCell.startRow, mergedCell.startColumn);
                                const isEmptyCell = !cellValue;
                                if (isEmptyCell && skipEmpty) {
                                    rowIndex = mergedCell.endRow + 1;
                                    continue;
                                }

                                const value: ICell = { row: rowIndex, col: mergedCell.startColumn, value: cellValue };
                                value.colSpan = mergedCell.endColumn - mergedCell.startColumn + 1;
                                value.rowSpan = mergedCell.endRow - mergedCell.startRow + 1;
                                rowIndex = mergedCell.endRow + 1;
                                return { done: false, value };
                            }

                            const cellValue = worksheet.getCell(rowIndex, columnIndex);
                            const isEmptyCell = !cellValue;
                            if (isEmptyCell && skipEmpty) {
                                rowIndex += 1;
                            } else {
                                const value: ICell = { row: rowIndex, col: columnIndex, value: cellValue };
                                rowIndex += 1;
                                return { done: false, value };
                            }
                        }
                    },
                };
            },
        };

        // #endregion
    }
}

/**
 * A cell info including its span (if it is the top-left cell of a merged cell).
 */
export interface ICell {
    row: number;
    col: number;
    rowSpan?: number;
    colSpan?: number;
    value: Nullable<ICellData>;
}

/**
 * Get pure text in a cell.
 * @param cell
 * @returns pure text in this cell
 */
export function extractPureTextFromCell(cell: Nullable<ICellData>): string {
    if (!cell) {
        return '';
    }

    const richTextValue = cell.p?.body?.dataStream;
    if (richTextValue) {
        return richTextValue;
    }

    const rawValue = cell.v;

    if (typeof rawValue === 'string') {
        if (cell.t === CellValueType.BOOLEAN) {
            return rawValue.toUpperCase();
        }
        return rawValue.replace(/[\r\n]/g, '');
    };

    if (typeof rawValue === 'number') {
        if (cell.t === CellValueType.BOOLEAN) return rawValue ? 'TRUE' : 'FALSE';
        return rawValue.toString();
    };

    if (typeof rawValue === 'boolean') return rawValue ? 'TRUE' : 'FALSE';

    return '';
}
