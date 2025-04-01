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

import type { IInterceptor } from '../common/interceptor';
import type { IObjectMatrixPrimitiveType, Nullable } from '../shared';
import type { BooleanNumber, HorizontalAlign, TextDirection, VerticalAlign, WrapStrategy } from '../types/enum';
import type { IDocumentData, IDocumentRenderConfig, IPaddingData, IStyleData, ITextRotation } from '../types/interfaces';
import type { Styles } from './styles';
import type { CustomData, ICellData, ICellDataForSheetInterceptor, ICellDataWithSpanAndDisplay, IFreeze, IRange, ISelectionCell, IWorksheetData } from './typedef';
import { BuildTextUtils, DocumentDataModel } from '../docs';
import { convertTextRotation, getFontStyleString } from '../docs/data-model/utils';
import { composeStyles, ObjectMatrix, Tools } from '../shared';
import { createRowColIter } from '../shared/row-col-iter';
import { DEFAULT_STYLES } from '../types/const';
import { CellValueType } from '../types/enum';
import { ColumnManager } from './column-manager';
import { Range } from './range';
import { RowManager } from './row-manager';
import { mergeWorksheetSnapshotWithDefault } from './sheet-snapshot-utils';
import { SpanModel } from './span-model';
import { CellModeEnum } from './typedef';
import { addLinkToDocumentModel, createDocumentModelWithStyle, DEFAULT_PADDING_DATA, extractOtherStyle, getFontFormat, isNotNullOrUndefined } from './util';
import { SheetViewModel } from './view-model';

export interface IDocumentLayoutObject {
    documentModel: Nullable<DocumentDataModel>;
    fontString: string;
    textRotation: ITextRotation;
    wrapStrategy: WrapStrategy;
    verticalAlign: VerticalAlign;
    horizontalAlign: HorizontalAlign;
    paddingData: IPaddingData;
    fill?: Nullable<string>;
}
export interface ICellOtherConfig {
    textRotation?: ITextRotation;
    textDirection?: Nullable<TextDirection>;
    horizontalAlign?: HorizontalAlign;
    verticalAlign?: VerticalAlign;
    wrapStrategy?: WrapStrategy;
    paddingData?: IPaddingData;
    cellValueType?: CellValueType;
}

export interface ICellDocumentModelOption {
    isDeepClone?: boolean;
    displayRawFormula?: boolean;
    ignoreTextRotation?: boolean;
}

const DEFAULT_CELL_DOCUMENT_MODEL_OPTION = {
    isDeepClone: false,
    displayRawFormula: false,
    ignoreTextRotation: false,
};
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

    protected _spanModel: SpanModel;

    constructor(
        public readonly unitId: string,
        snapshot: Partial<IWorksheetData>,
        private readonly _styles: Styles
    ) {
        this._snapshot = mergeWorksheetSnapshotWithDefault(snapshot);

        const { columnData, rowData, cellData } = this._snapshot;
        this._sheetId = this._snapshot.id ?? Tools.generateRandomId(6);
        this._cellData = new ObjectMatrix<ICellData>(cellData as IObjectMatrixPrimitiveType<ICellData>);

        // This view model will immediately injected with hooks from SheetViewModel service as Worksheet is constructed.
        this._viewModel = new SheetViewModel((row, col) => this.getCellRaw(row, col));
        this._rowManager = new RowManager(this._snapshot, this._viewModel, rowData);
        this._columnManager = new ColumnManager(this._snapshot, columnData);
        this._spanModel = new SpanModel(this._snapshot.mergeData);
    }

    /**
     * @internal
     * @param callback
     */
    __interceptViewModel(callback: (viewModel: SheetViewModel) => void): void {
        callback(this._viewModel);
    }

    getSnapshot(): IWorksheetData {
        return this._snapshot;
    }

    /**
     * Set the merge data of the sheet, all the merged cells will be rebuilt.
     * @param mergeData
     */
    setMergeData(mergeData: IRange[]): void {
        this._snapshot.mergeData = mergeData;
        this.getSpanModel().rebuild(mergeData);
    }

    getSpanModel(): SpanModel {
        return this._spanModel;
    }

    getStyleDataByHash(hash: string): Nullable<IStyleData> {
        const data = this._styles.get(hash);
        return { ...data };
    }

    setStyleData(style: IStyleData): Nullable<string> {
        return this._styles.setValue(style);
    }

    /**
     * Get the style of the column.
     * @param {number} column The column index
     * @param {boolean} [keepRaw] If true, return the raw style data, otherwise return the style data object
     * @returns {Nullable<IStyleData>|string} The style of the column
     */
    getColumnStyle(column: number, keepRaw: true): string | Nullable<IStyleData>;
    getColumnStyle(column: number): Nullable<IStyleData>;
    getColumnStyle(column: number, keepRaw = false): string | Nullable<IStyleData> {
        if (keepRaw) {
            return this._columnManager.getColumnStyle(column);
        }
        return this._styles.get(this._columnManager.getColumnStyle(column));
    }

    /**
     * Set the style of the column.
     * @param {number} column The column index
     * @param {string|Nullable<IStyleData>} style The style to be set
     */
    setColumnStyle(column: number, style: string | Nullable<IStyleData>): void {
        this._columnManager.setColumnStyle(column, style);
    }

    /**
     * Get the style of the row.
     * @param {number} row The row index
     * @param {boolean} [keepRaw] If true, return the raw style data, otherwise return the style data object
     * @returns {Nullable<IStyleData>} The style of the row
     */
    getRowStyle(row: number, keepRaw: true): string | Nullable<IStyleData>;
    getRowStyle(row: number): Nullable<IStyleData>;
    getRowStyle(row: number, keepRaw = false): string | Nullable<IStyleData> {
        if (keepRaw) {
            return this._rowManager.getRowStyle(row);
        }
        return this._styles.get(this._rowManager.getRowStyle(row));
    }

    /**
     * Set the style of the row.
     * @param {number} row
     * @param {string|Nullable<IStyleData>} style The style to be set
     */
    setRowStyle(row: number, style: string | Nullable<IStyleData>): void {
        this._rowManager.setRowStyle(row, style);
    }

    /**
     * Get the default style of the worksheet.
     * @returns {Nullable<IStyleData>} Default Style
     */
    getDefaultCellStyle(): Nullable<IStyleData> | string {
        return this._snapshot.defaultStyle;
    }

    getDefaultCellStyleInternal(): Nullable<IStyleData> {
        const style = this._snapshot.defaultStyle;
        return this._styles.get(style);
    }

    /**
     * Set Default Style, if the style has been set, all cells style will be base on this style.
     * @param {Nullable<IStyleData>} style The style to be set as default style
     */
    setDefaultCellStyle(style: Nullable<IStyleData> | string): void {
        this._snapshot.defaultStyle = style;
    }

    getCellStyle(row: number, col: number): Nullable<IStyleData> {
        const cell = this.getCell(row, col);
        if (cell) {
            const style = cell.s;
            if (typeof style === 'string') {
                return this._styles.get(style);
            }
            return style;
        }

        return null;
    }

    /**
     * Get the composed style of the cell. If you want to get the style of the cell without merging row style,
     * col style and default style, please use {@link getCellStyle} instead.
     *
     * @param {number} row The row index of the cell
     * @param {number} col The column index of the cell
     * @returns {IStyleData} The composed style of the cell
     */
    getComposedCellStyle(row: number, col: number, rowPriority = true): IStyleData {
        const cell = this.getCellStyle(row, col);
        const defaultStyle = this.getDefaultCellStyleInternal();
        const rowStyle = this.getRowStyle(row);
        const colStyle = this.getColumnStyle(col);
        return rowPriority
            ? composeStyles(defaultStyle, rowStyle, colStyle, cell)
            : composeStyles(defaultStyle, colStyle, rowStyle, cell);
    }

    /**
     * Returns WorkSheet Cell Data Matrix
     * @returns WorkSheet Cell Data Matrix
     */
    getCellMatrix(): ObjectMatrix<Nullable<ICellData>> {
        return this._cellData;
    }

    /**
     * Get worksheet printable cell range.
     * @returns
     */
    // eslint-disable-next-line max-lines-per-function
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
            // eslint-disable-next-line complexity
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

    /**
     * Get the merged cell list of the sheet.
     * @returns {IRange[]} merged cell list
     */
    getMergeData(): IRange[] {
        return this._spanModel.getMergeDataSnapshot();
    }

    /**
     * Get the merged cell Range of the sheet cell.
     * If (row, col) is not in a merged cell, return null
     *
     * @param {number} row The row index of test cell
     * @param {number} col The column index of test cell
     * @returns {Nullable<IRange>} The merged cell range of the cell, if the cell is not in a merged cell, return null
     */
    getMergedCell(row: number, col: number): Nullable<IRange> {
        return this._spanModel.getMergedCell(row, col);
    }

    /**
     * Get the merged cell info list which has intersection with the given range.
     * @param {number} startRow The start row index of the range
     * @param {number} startColumn The start column index of the range
     * @param {number} endRow The end row index of the range
     * @param {number} endColumn The end column index of the range
     * @returns {IRange} The merged cell info list which has intersection with the given range or empty array if no merged cell in the range
     */
    getMergedCellRange(startRow: number, startColumn: number, endRow: number, endColumn: number): IRange[] {
        return this._spanModel.getMergedCellRange(startRow, startColumn, endRow, endColumn);
    }

    /**
     * Get if the row contains merged cell
     * @param {number} row The row index
     * @returns {boolean} Is merge cell across row
     */
    isRowContainsMergedCell(row: number): boolean {
        return this._spanModel.isRowContainsMergedCell(row);
    }

    /**
     * Get if the column contains merged cell
     * @param {number} column The column index
     * @returns {boolean} Is merge cell across column
     */
    isColumnContainsMergedCell(column: number): boolean {
        return this._spanModel.isColumnContainsMergedCell(column);
    }

    /**
     * Get cell info with merge data
     * @param {number} row - The row index of the cell.
     * @param {number} column - The column index of the cell.
     * @type {selectionCell}
     * @property {number} actualRow - The actual row index of the cell
     * @property {number} actualColumn - The actual column index of the cell
     * @property {boolean} isMergedMainCell - Whether the cell is the main cell of the merged cell, only the upper left cell in the merged cell returns true here
     * @property {boolean} isMerged - Whether the cell is in a merged cell, the upper left cell in the merged cell returns false here
     * @property {number} endRow - The end row index of the merged cell
     * @property {number} endColumn - The end column index of the merged cell
     * @property {number} startRow - The start row index of the merged cell
     * @property {number} startColumn - The start column index of the merged cell
     * @returns  {selectionCell} - The cell info with merge data
     */
    getCellInfoInMergeData(row: number, column: number): ISelectionCell {
        const mergeRange = this.getMergedCell(row, column);
        let isMerged = false; // The upper left cell only renders the content
        let isMergedMainCell = false;
        let mergeEndRow = row;
        let mergeEndColumn = column;
        let mergeStartRow = row;
        let mergeStartColumn = column;
        if (mergeRange) {
            const {
                startRow: startRowMerge,
                endRow: endRowMerge,
                startColumn: startColumnMerge,
                endColumn: endColumnMerge,
            } = mergeRange;
            if (row === startRowMerge && column === startColumnMerge) {
                mergeEndRow = endRowMerge;
                mergeEndColumn = endColumnMerge;
                mergeStartRow = startRowMerge;
                mergeStartColumn = startColumnMerge;

                isMergedMainCell = true;
            } else if (row >= startRowMerge && row <= endRowMerge && column >= startColumnMerge && column <= endColumnMerge) {
                mergeEndRow = endRowMerge;
                mergeEndColumn = endColumnMerge;
                mergeStartRow = startRowMerge;
                mergeStartColumn = startColumnMerge;

                isMerged = true;
            }
        }

        return {
            actualRow: row,
            actualColumn: column,
            isMergedMainCell,
            isMerged,
            endRow: mergeEndRow,
            endColumn: mergeEndColumn,
            startRow: mergeStartRow,
            startColumn: mergeStartColumn,
        };
    }

    /**
     * Get cellData, includes cellData, customRender, markers, dataValidate, etc.
     *
     * WARNING: All sheet CELL_CONTENT interceptors will be called in this method, cause performance issue.
     * example: this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT);
     *
     * @param row
     * @param col
     * @returns ICellDataForSheetInterceptor
     */
    getCell(row: number, col: number): Nullable<ICellDataForSheetInterceptor> {
        if (row < 0 || col < 0) {
            return null;
        }

        return this._viewModel.getCell(row, col);
    }

    /**
     * Get cellData only use effect on value interceptor
     * @param {number} number row The row index of the cell.
     * @param {number} number col The column index of the cell.
     * @returns {Nullable<ICellDataForSheetInterceptor>} The cell data only use effect on value interceptor
     */
    getCellValueOnly(row: number, col: number): Nullable<ICellDataForSheetInterceptor> {
        if (row < 0 || col < 0) {
            return null;
        }

        return this._viewModel.getCellValueOnly(row, col);
    }

    /**
     * Get cellData only use effect on style interceptor
     * @param {number} row The row index of the cell.
     * @param {number} col The column index of the cell.
     * @returns {Nullable<ICellDataForSheetInterceptor>} The cell data only use effect on style interceptor
     */
    getCellStyleOnly(row: number, col: number): Nullable<ICellDataForSheetInterceptor> {
        if (row < 0 || col < 0) {
            return null;
        }

        return this._viewModel.getCellStyleOnly(row, col);
    }

    getCellRaw(row: number, col: number): Nullable<ICellData> {
        return this.getCellMatrix().getValue(row, col);
    }

    // eslint-disable-next-line ts/no-explicit-any
    getCellWithFilteredInterceptors(row: number, col: number, key: string, filter: (interceptor: IInterceptor<any, any>) => boolean): Nullable<ICellDataForSheetInterceptor> {
        return this._viewModel.getCell(row, col, key, filter);
    }

    getRowFiltered(row: number): boolean {
        return this._viewModel.getRowFiltered(row);
    }

    /**
     * Get cell matrix from a given range and pick out non-first cells of merged cells.
     *
     * Notice that `ICellData` here is not after copying. In another word, the object matrix here should be
     * considered as a slice of the original worksheet data matrix.
     *
     * Control the v attribute in the return cellData.v through dataMode
     */

    getMatrixWithMergedCells(
        row: number,
        col: number,
        endRow: number,
        endCol: number
    ): ObjectMatrix<ICellDataWithSpanAndDisplay>;

    getMatrixWithMergedCells(
        row: number,
        col: number,
        endRow: number,
        endCol: number,
        dataMode: CellModeEnum
    ): ObjectMatrix<ICellDataWithSpanAndDisplay>;

    getMatrixWithMergedCells(
        row: number,
        col: number,
        endRow: number,
        endCol: number,
        dataMode: CellModeEnum = CellModeEnum.Raw
    ): ObjectMatrix<ICellDataWithSpanAndDisplay> {
        const matrix = this.getCellMatrix();

        // get all merged cells
        const mergedCellsInRange = this._spanModel.getMergedCellRange(row, col, endRow, endCol);

        // iterate all cells in the range
        const returnCellMatrix = new ObjectMatrix<ICellDataWithSpanAndDisplay>();
        createRowColIter(row, endRow, col, endCol).forEach((row, col) => {
            let cellData: Nullable<ICellDataWithSpanAndDisplay>;
            if (dataMode === CellModeEnum.Raw) {
                cellData = this.getCellRaw(row, col);
            } else if (dataMode === CellModeEnum.Intercepted) {
                cellData = this.getCell(row, col);
            } else if (dataMode === CellModeEnum.Both) {
                const cellDataRaw = this.getCellRaw(row, col);
                if (cellDataRaw) {
                    cellData = { ...cellDataRaw };
                    const displayV = this.getCell(row, col)?.v;
                    if (isNotNullOrUndefined(displayV) && cellData) {
                        cellData.displayV = String(displayV);
                    }
                }
            }

            if (cellData) {
                returnCellMatrix.setValue(row, col, cellData);
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
     * @returns {boolean} Gridlines Hidden Status.
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
     * Returns the color of the gridlines, or undefined if the gridlines are not colored.
     * @returns {string | undefined} returns the color of the gridlines, or undefined if the gridlines are default.
     */
    getGridlinesColor(): string | undefined {
        return this.getConfig().gridlinesColor;
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
     * Row is filtered out, that means this row is invisible.
     * @param row
     * @returns {boolean} is row hidden by filter
     */
    isRowFiltered(row: number): boolean {
        return this._viewModel.getRowFiltered(row);
    }

    /**
     * Get if the row is visible. It may be affected by features like filter and view.
     * @param row the row index
     * @returns {boolean} if the row in visible to the user
     */
    getRowVisible(row: number): boolean {
        return !this.isRowFiltered(row) && this.getRowRawVisible(row);
    }

    /**
     * Get if the row does not have `hidden` property. This value won't affected by features like filter and view.
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
     * Get all visible rows in the sheet.(not include filter & view, like getRawVisibleRows)
     * @returns Visible rows range list
     */
    getVisibleRows(): IRange[] {
        const rowCount = this.getRowCount();
        return this._rowManager.getVisibleRows(0, rowCount - 1);
    }

    /**
     * Get all visible columns in the sheet.(not include filter & view)
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

    getDataRangeScope(): IRange {
        return this._cellData.getStartEndScope();
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

    /**
     * This method generates a document model based on the cell's properties and handles the associated styles and configurations.
     * If the cell does not exist, it will return null.
     * PS: This method has significant impact on performance.
     * @param cell
     * @param options
     */
    // eslint-disable-next-line complexity, max-lines-per-function
    private _getCellDocumentModel(
        cell: Nullable<ICellDataForSheetInterceptor>,
        options: ICellDocumentModelOption = DEFAULT_CELL_DOCUMENT_MODEL_OPTION
    ): Nullable<IDocumentLayoutObject> {
        const { isDeepClone, displayRawFormula, ignoreTextRotation } = {
            ...DEFAULT_CELL_DOCUMENT_MODEL_OPTION,
            ...options,
        };

        const style = this._styles.getStyleByCell(cell);

        if (!cell) {
            return;
        }

        let documentModel: Nullable<DocumentDataModel>;
        let fontString = 'document';
        const cellOtherConfig = extractOtherStyle(style);

        const textRotation: ITextRotation = ignoreTextRotation
            ? DEFAULT_STYLES.tr
            : cellOtherConfig.textRotation || DEFAULT_STYLES.tr;
        let horizontalAlign: HorizontalAlign = cellOtherConfig.horizontalAlign || DEFAULT_STYLES.ht;
        const verticalAlign: VerticalAlign = cellOtherConfig.verticalAlign || DEFAULT_STYLES.vt;
        const wrapStrategy: WrapStrategy = cellOtherConfig.wrapStrategy || DEFAULT_STYLES.tb;
        const paddingData: IPaddingData = cellOtherConfig.paddingData || DEFAULT_PADDING_DATA;

        if (cell.f && displayRawFormula) {
            // The formula does not detect horizontal alignment and rotation.
            documentModel = createDocumentModelWithStyle(cell.f.toString(), {}, { verticalAlign });
            horizontalAlign = DEFAULT_STYLES.ht;
        } else if (cell.p) {
            const { centerAngle, vertexAngle } = convertTextRotation(textRotation);
            documentModel = this._updateConfigAndGetDocumentModel(
                isDeepClone ? Tools.deepClone(cell.p) : cell.p,
                horizontalAlign,
                paddingData,
                {
                    horizontalAlign,
                    verticalAlign,
                    centerAngle,
                    vertexAngle,
                    wrapStrategy,
                    zeroWidthParagraphBreak: 1,
                }
            );
        } else if (cell.v != null) {
            const textStyle = getFontFormat(style);
            fontString = getFontStyleString(textStyle).fontCache;

            let cellText = extractPureTextFromCell(cell);

            // Add a single quotation mark to the force string type. Don't add single quotation mark in extractPureTextFromCell, because copy and paste will be affected.
            // edit mode when displayRawFormula is true
            if (cell.t === CellValueType.FORCE_STRING && displayRawFormula) {
                cellText = `'${cellText}`;
            }

            documentModel = createDocumentModelWithStyle(cellText, textStyle, {
                ...cellOtherConfig,
                textRotation,
                cellValueType: cell.t!,
            });
        }

        // This is a compatible code. cc @weird94
        if (documentModel && cell.linkUrl && cell.linkId) {
            addLinkToDocumentModel(documentModel, cell.linkUrl, cell.linkId);
        }

        /**
         * the alignment mode is returned with respect to the offset of the sheet cell,
         * because the document needs to render the layout for cells and
         * support alignment across multiple cells (e.g., horizontal alignment of long text in overflow mode).
         * The alignment mode of the document itself cannot meet this requirement,
         * so an additional renderConfig needs to be added during the rendering of the document component.
         * This means that there are two coexisting alignment modes.
         * In certain cases, such as in an editor, conflicts may arise,
         * requiring only one alignment mode to be retained.
         * By removing the relevant configurations in renderConfig,
         * the alignment mode of the sheet cell can be modified.
         * The alternative alignment mode is applied to paragraphs within the document.
         */
        return {
            documentModel,
            fontString,
            textRotation,
            wrapStrategy,
            verticalAlign,
            horizontalAlign,
            paddingData,
            fill: style?.bg?.rgb,
        };
    }

    private _updateConfigAndGetDocumentModel(
        documentData: IDocumentData,
        horizontalAlign: HorizontalAlign,
        paddingData: IPaddingData,
        renderConfig?: IDocumentRenderConfig
    ): Nullable<DocumentDataModel> {
        if (!renderConfig) {
            return;
        }

        if (!documentData.body?.dataStream) {
            return;
        }

        if (!documentData.documentStyle) {
            documentData.documentStyle = {};
        }

        documentData.documentStyle.marginTop = paddingData.t ?? 0;
        documentData.documentStyle.marginBottom = paddingData.b ?? 2;
        documentData.documentStyle.marginLeft = paddingData.l ?? 2;
        documentData.documentStyle.marginRight = paddingData.r ?? 2;

        // Fix https://github.com/dream-num/univer/issues/1586
        documentData.documentStyle.pageSize = {
            width: Number.POSITIVE_INFINITY,
            height: Number.POSITIVE_INFINITY,
        };

        documentData.documentStyle.renderConfig = {
            ...documentData.documentStyle.renderConfig,
            ...renderConfig,
        };

        const paragraphs = documentData.body.paragraphs || [];

        for (const paragraph of paragraphs) {
            if (!paragraph.paragraphStyle) {
                paragraph.paragraphStyle = {};
            }

            paragraph.paragraphStyle.horizontalAlign = horizontalAlign;
        }

        return new DocumentDataModel(documentData);
    }

    /**
     * Only used for cell edit, and no need to rotate text when edit cell content!
     */
    getBlankCellDocumentModel(cell: Nullable<ICellData>): IDocumentLayoutObject {
        const documentModelObject = this._getCellDocumentModel(cell, { ignoreTextRotation: true });

        const style = this._styles.getStyleByCell(cell);
        const textStyle = getFontFormat(style);

        if (documentModelObject != null) {
            if (documentModelObject.documentModel == null) {
                documentModelObject.documentModel = createDocumentModelWithStyle('', textStyle);
            }
            return documentModelObject;
        }

        const content = '';

        let fontString = 'document';

        const textRotation: ITextRotation = DEFAULT_STYLES.tr;
        const horizontalAlign: HorizontalAlign = DEFAULT_STYLES.ht;
        const verticalAlign: VerticalAlign = DEFAULT_STYLES.vt;
        const wrapStrategy: WrapStrategy = DEFAULT_STYLES.tb;
        const paddingData: IPaddingData = DEFAULT_PADDING_DATA;

        fontString = getFontStyleString({}).fontCache;

        const documentModel = createDocumentModelWithStyle(content, textStyle);

        return {
            documentModel,
            fontString,
            textRotation,
            wrapStrategy,
            verticalAlign,
            horizontalAlign,
            paddingData,
        };
    }

    // Only used for cell edit, and no need to rotate text when edit cell content!
    getCellDocumentModelWithFormula(cell: ICellData): Nullable<IDocumentLayoutObject> {
        return this._getCellDocumentModel(cell, {
            isDeepClone: true,
            displayRawFormula: true,
            ignoreTextRotation: true,
        });
    }

    /**
     * Get custom metadata of worksheet
     * @returns {CustomData | undefined} custom metadata
     */
    getCustomMetadata(): CustomData | undefined {
        return this._snapshot.custom;
    }

    /**
     * Set custom metadata of workbook
     * @param {CustomData | undefined} custom custom metadata
     */
    setCustomMetadata(custom: CustomData | undefined) {
        this._snapshot.custom = custom;
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
        return BuildTextUtils.transform.getPlainText(richTextValue);
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

export function getOriginCellValue(cell: Nullable<ICellData>) {
    if (cell === null) {
        return '';
    }

    if (cell?.p) {
        const body = cell?.p.body;

        if (body == null) {
            return '';
        }

        const data = body.dataStream;
        const newDataStream = BuildTextUtils.transform.getPlainText(data);
        return newDataStream;
    }

    return cell?.v;
}
