import { ObserverManager } from '../../Observer';
import { Nullable, ObjectMatrix, Rectangle, Tools } from '../../Shared';
import { createRowColIter } from '../../Shared/RowColIter';
import { DEFAULT_WORKSHEET } from '../../Types/Const';
import { BooleanNumber, SheetTypes } from '../../Types/Enum';
import { ICellData, IRange, IWorksheetConfig } from '../../Types/Interfaces';
import { ColumnManager } from './ColumnManager';
import { Range } from './Range';
import { RowManager } from './RowManager';
import { Styles } from './Styles';

/**
 * Access and modify spreadsheet sheets.
 *
 * @remarks
 * Common operations are renaming a sheet and accessing range objects from the sheet.
 *
 * Reference from: https://developers.google.com/apps-script/reference/spreadsheet/sheet
 *
 * @beta
 */
export class Worksheet {
    protected _snapshot: IWorksheetConfig;

    protected _initialized: boolean;

    protected _sheetId: string;

    protected _cellData: ObjectMatrix<ICellData>;

    protected _rowManager: RowManager;

    protected _columnManager: ColumnManager;

    constructor(
        snapshot: Partial<IWorksheetConfig>,
        private readonly _observerManager: ObserverManager,
        private readonly _styles: Styles
    ) {
        const mergedSnapshot: IWorksheetConfig = {
            ...DEFAULT_WORKSHEET,
            mergeData: [],
            hideRow: [],
            hideColumn: [],
            cellData: {},
            rowData: {},
            columnData: {},
            rowHeader: {
                width: 46,
                hidden: BooleanNumber.FALSE,
            },
            columnHeader: {
                height: 20,
                hidden: BooleanNumber.FALSE,
            },
            selections: ['A1'],
            rightToLeft: BooleanNumber.FALSE,
            pluginMeta: {},
            ...snapshot,
        };

        this._snapshot = mergedSnapshot;

        const { columnData, rowData, cellData } = this._snapshot;
        this._sheetId = this._snapshot.id ?? Tools.generateRandomId(6);
        this._initialized = false;
        this._cellData = new ObjectMatrix<ICellData>(cellData);
        this._rowManager = new RowManager(this, rowData);
        this._columnManager = new ColumnManager(this, columnData);
    }

    /**
     * Returns WorkSheet Cell Data Matrix
     * @returns
     */
    getCellMatrix(): ObjectMatrix<ICellData> {
        return this._cellData;
    }

    /**
     * Returns Row Manager
     * @returns Row Manager
     */
    getRowManager(): RowManager {
        return this._rowManager;
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
        return new Worksheet(copy, this._observerManager, this._styles);
    }

    getMergeData(): IRange[] {
        return this._snapshot.mergeData;
    }

    getMergedCells(row: number, col: number): Nullable<IRange[]> {
        const _rectangleList = this._snapshot.mergeData;
        const rectList = [];
        for (let i = 0; i < _rectangleList.length; i++) {
            const range = _rectangleList[i];
            if (Rectangle.intersects({ startRow: row, startColumn: col, endRow: row, endColumn: col }, range)) {
                rectList.push(range);
            }
        }

        return rectList.length ? rectList : null;
    }

    /**
     * Get cell matrix from a given range and pick out non-first cells of merged cells.
     */
    // PERF: we could not skip indexes with merged cells, because we have already known the merged cells' range
    getMatrixWithMergedCells(
        row: number,
        col: number,
        endRow: number,
        endCol: number
    ): ObjectMatrix<ICellData & { rowSpan?: number; colSpan?: number }> {
        const matrix = this.getCellMatrix();

        // get all merged cells
        const mergedCellsInRange = this._snapshot.mergeData.filter((rect) =>
            Rectangle.intersects({ startRow: row, startColumn: col, endRow, endColumn: endCol }, rect)
        );

        const ret = new ObjectMatrix<ICellData & { rowSpan?: number; colSpan?: number }>();

        // iterate all cells in the range
        createRowColIter(row, endRow, col, endCol).forEach((row, col) => {
            const v = matrix.getValue(row, col);
            if (v) {
                // ICellData should combine merge info
                ret.setValue(row, col, v);
            }
        });

        mergedCellsInRange.forEach((mergedCell) => {
            const { startColumn, startRow, endColumn, endRow } = mergedCell;
            createRowColIter(startRow, endRow, startColumn, endColumn).forEach((row, col) => {
                if (row === startRow && col === startColumn) {
                    ret.setValue(row, col, {
                        ...matrix.getValue(row, col),
                        rowSpan: endRow - startRow + 1,
                        colSpan: endColumn - startColumn + 1,
                    });
                }

                if (row !== startRow || col !== startColumn) {
                    ret.realDeleteValue(row, col);
                }
            });
        });

        return ret;
    }

    getRange(startRow: number, startColumn: number): Range;
    getRange(startRow: number, startColumn: number, endRow: number, endColumn: number): Range;
    getRange(startRow: number, startColumn: number, endRow?: number, endColumn?: number): Range {
        return new Range(
            this,
            {
                startRow,
                startColumn,
                endColumn: endColumn || startColumn,
                endRow: endRow || startRow,
            },
            {
                getStyles: () => this._styles,
            }
        );
    }

    /**
     * Returns WorkSheet Status
     * @returns WorkSheet Status
     */
    getStatus() {
        const { _snapshot: _config } = this;
        return _config.status;
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
    getConfig(): IWorksheetConfig {
        return this._snapshot;
    }

    /**
     * Returns the number of frozen rows.
     * @returns the number of frozen rows
     */
    getFrozenRows(): number {
        return this._snapshot.freezeRow;
    }

    /**
     * Returns the number of frozen columns.
     * @returns the number of frozen columns
     */
    getFrozenColumns(): number {
        return this._snapshot.freezeColumn;
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

    /**
     * Returns the type of the sheet.
     * @returns the type of the sheet
     */
    getType(): SheetTypes {
        const { _snapshot: _config } = this;
        const { type } = _config;
        return type;
    }

    /**
     * Returns Row Count
     * @returns Row Count
     */
    getRowCount(): number {
        return this._snapshot.rowCount;
    }

    /**
     * Returns Column Count
     * @returns Column Count
     */
    getColumnCount(): number {
        return this._snapshot.columnCount;
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
    hasHiddenGridlines(): Boolean {
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
     * @param rowPosition row index
     * @returns Gets the height in pixels of the given row.
     */
    getRowHeight(rowPosition: number): number {
        return this.getRowManager().getRowHeight(rowPosition);
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
     * @typeParam T - plugin data structure
     * @param name - plugin name
     * @returns information stored by the plugin
     */
    getPluginMeta<T>(name: string): T {
        return this._snapshot.pluginMeta[name];
    }

    /**
     * @typeParam T - plugin data structure
     * @param name - plugin name
     * @param value - plugin value
     * @returns
     */
    setPluginMeta<T>(name: string, value: T) {
        this._snapshot.pluginMeta[name] = value;
    }

    /**
     * Returns the position of the last row that has content.
     * @returns the position of the last row that has content.
     */
    getLastRow(): number {
        return this._cellData.getLength();
    }

    /**
     * Returns the position of the last column that has content.
     * @returns the position of the last column that has content.
     */
    getLastColumn(): number {
        return this._cellData.getRange().endColumn;
    }
}
