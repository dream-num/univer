import { Inject } from '@wendellhu/redi';

import { ObserverManager } from '../../Observer';
import { ICurrentUniverService } from '../../services/current.service';
import { Nullable, ObjectMatrix, Tools } from '../../Shared';
import { DEFAULT_WORKSHEET } from '../../Types/Const';
import { BooleanNumber, SheetTypes } from '../../Types/Enum';
import { ICellData, IRangeStringData, IRangeType, ISelectionRange, IWorksheetConfig } from '../../Types/Interfaces';
import { ColumnManager } from './ColumnManager';
import { Merges } from './Merges';
import { Range } from './Range';
import { RangeList } from './RangeList';
import { RowManager } from './RowManager';

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
    protected _config: IWorksheetConfig;

    protected _initialized: boolean;

    protected _merges: Merges;

    protected _sheetId: string;

    protected _cellData: ObjectMatrix<ICellData>;

    protected _rowManager: RowManager;

    protected _columnManager: ColumnManager;

    constructor(
        customConfig: Partial<IWorksheetConfig>,
        @Inject(ObserverManager) private readonly _observerManager: ObserverManager,
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService
    ) {
        const config: IWorksheetConfig = {
            ...DEFAULT_WORKSHEET,
            mergeData: [],
            hideRow: [],
            hideColumn: [],
            cellData: {},
            rowData: {},
            columnData: {},
            rowTitle: {
                width: 46,
                hidden: BooleanNumber.FALSE,
            },
            columnTitle: {
                height: 20,
                hidden: BooleanNumber.FALSE,
            },
            selections: ['A1'],
            rightToLeft: BooleanNumber.FALSE,
            pluginMeta: {},
            ...customConfig,
        };

        this._config = config;

        const { columnData, rowData, cellData } = this._config;
        this._sheetId = this._config.id ?? Tools.generateRandomId(6);
        this._initialized = false;
        this._cellData = new ObjectMatrix<ICellData>(cellData);
        this._rowManager = new RowManager(this, rowData);
        this._columnManager = new ColumnManager(this, columnData);
        this._initialize();
    }

    /**
     * Returns WorkSheet Cell Data Matrix
     * @returns
     */
    // TODO: change its name to getWorksheetMatrix?
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
        return this._config.name;
    }

    /**
     * Returns WorkSheet Clone Object
     * @returns WorkSheet Clone Object
     * @deprecated
     */
    clone(): Worksheet {
        const { _config } = this;
        const copy = Tools.deepClone(_config);
        return new Worksheet(copy, this._observerManager, this._currentUniverService);
    }

    /**
     * Returns WorkSheet Merges Manage
     *
     * @returns merge instance
     */
    getMerges(): Merges {
        return this._merges;
    }

    /**
     * Returns Sheet Data To Array
     * @remarks {@link ICellData}  data type of cell.
     * @returns Sheet Data To Array
     */
    getSheetData(): ICellData[][] {
        // TODO: Whether to support multiple types, the length attribute will be used in other methods
        // TODO:
        // return this._cellData.toArray();
        return [];
    }

    /**
     * Returns User Selection Range
     * @param range range types
     * @returns range instance
     */
    getRange(range: IRangeType): Range;
    /**
     * Returns User Selection Range
     * @param row row index
     * @param column column index
     * @returns range instance
     */
    getRange(row: number, column: number): Range;
    /**
     * Returns User Selection Range
     * @param row row index
     * @param column column index
     * @param numRows row count
     * @returns range instance
     */
    getRange(row: number, column: number, numRows: number): Range;
    /**
     * Returns User Selection Range
     * @param row row index
     * @param column column index
     * @param numRows row count
     * @param numColumns column count
     * @returns range instance
     */
    getRange(row: number, column: number, numRows: number, numColumns: number): Range;
    /**
     * Returns User Selection Range
     * @param a1Notation One of the range types
     * @remarks {@link IRangeStringData} e.g.,"A1:B2","sheet1!A1:B2","A1","1:1","A:A","AA1:BB2"
     * @returns range instance
     */
    getRange(a1Notation: IRangeStringData): Range;
    getRange(...argument: any): Nullable<Range> {
        if (Tools.hasLength(argument, 1)) {
            return new Range(this, argument[0], this._currentUniverService);
        }
        if (Tools.hasLength(argument, 2)) {
            return new Range(
                this,
                {
                    row: [argument[0], argument[0]],
                    column: [argument[1], argument[1]],
                },
                this._currentUniverService
            );
        }
        if (Tools.hasLength(argument, 3)) {
            return new Range(
                this,
                {
                    row: [argument[0], argument[2]],
                    column: [argument[1], argument[1]],
                },
                this._currentUniverService
            );
        }
        if (Tools.hasLength(argument, 4)) {
            return new Range(
                this,
                {
                    row: [argument[0], argument[2]],
                    column: [argument[1], argument[3]],
                },
                this._currentUniverService
            );
        }
    }

    /**
     * Returns User Multiple Selection Range List
     * @param rangeList range types array
     * @returns RangeList Instance
     */
    getRangeList(rangeList: IRangeType[]): RangeList {
        /**
         * get range instance from range string or array
         * const range = universheet.getRange('A1:B2')
         * range.activate() // Activate the current range as the current selection
         */
        return new RangeList(this, rangeList, this._currentUniverService);
    }

    /**
     * Returns WorkSheet Status
     * @returns WorkSheet Status
     */
    getStatus() {
        const { _config } = this;
        return _config.status;
    }

    /**
     * Return WorkSheetZoomRatio
     * @return zoomRatio
     */
    getZoomRatio(): number {
        return this._config.zoomRatio || 1;
    }

    getMergeData(): ISelectionRange[] {
        return this._config.mergeData;
    }

    /**
     * Returns WorkSheet Configures
     * @returns WorkSheet Configures
     */
    getConfig(): IWorksheetConfig {
        return this._config;
    }

    /**
     * Returns the number of frozen rows.
     * @returns the number of frozen rows
     */
    getFrozenRows(): number {
        return this._config.freezeRow;
    }

    /**
     * Sets the width of the given column to fit its contents.
     * @param columnPosition
     */
    // todo  调用columnManage的API
    // autoResizeColumn(columnPosition: number): WorkSheet {
    //     return this;
    // }

    /**
     * Returns the number of frozen columns.
     * @returns the number of frozen columns
     */
    getFrozenColumns(): number {
        return this._config.freezeColumn;
    }

    /**
     * Returns the current number of columns in the sheet, regardless of content.
     * @returns the current number of columns in the sheet, regardless of content
     */
    getMaxColumns(): number {
        const { _config } = this;
        const { columnCount } = _config;
        return columnCount;
    }

    /**
     * Returns the current number of rows in the sheet, regardless of content.
     * @returns the current number of rows in the sheet, regardless of content
     */
    getMaxRows(): number {
        const { _config } = this;
        const { rowCount } = _config;
        return rowCount;
    }

    /**
     * Returns the type of the sheet.
     * @returns the type of the sheet
     */
    getType(): SheetTypes {
        const { _config } = this;
        const { type } = _config;
        return type;
    }

    /**
     * Returns Row Count
     * @returns Row Count
     */
    getRowCount(): number {
        return this._config.rowCount;
    }

    /**
     * Returns Column Count
     * @returns Column Count
     */
    getColumnCount(): number {
        return this._config.columnCount;
    }

    /**
     * Gets the position of the sheet in its parent spreadsheet. Starts at 1.
     * @returns Gets the position of the sheet in its parent spreadsheet. Starts at 1.
     */
    getIndex(): Nullable<number> {
        const worksheets = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getSheets();
        const index = worksheets.findIndex((sheet) => sheet && sheet.getSheetId() === this._sheetId);

        if (index > -1) {
            return index + 1;
        }

        return null;
    }

    /**
     * isSheetHidden
     * @returns hidden status of sheet
     */
    isSheetHidden(): BooleanNumber {
        return this._config.hidden;
    }

    /**
     * Returns true if the sheet's gridlines are hidden; otherwise returns false. Gridlines are visible by default.
     * @returns Gridlines Hidden Status
     */
    hasHiddenGridlines(): Boolean {
        const { _config } = this;
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
        const { _config } = this;
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
        const { _config } = this;
        const { rightToLeft } = _config;
        return rightToLeft;
    }

    /**
     * @typeParam T - plugin data structure
     * @param name - plugin name
     * @returns information stored by the plugin
     */
    getPluginMeta<T>(name: string): T {
        return this._config.pluginMeta[name];
    }

    /**
     * @typeParam T - plugin data structure
     * @param name - plugin name
     * @param value - plugin value
     * @returns
     */
    setPluginMeta<T>(name: string, value: T) {
        this._config.pluginMeta[name] = value;
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

    /**
     * Returns the rectangular grid of values for this range starting at the given coordinates. A -1 value given as the row or column position is equivalent to getting the very last row or column that has data in the sheet.
     * @param startRow row start index
     * @param startColumn column start index
     * @param numRows row count
     * @param numColumns column count
     * @returns the rectangular grid of values for this range starting at the given coordinates. A -1 value given as the row or column position is equivalent to getting the very last row or column that has data in the sheet.
     */
    getSheetValues(startRow: number, startColumn: number, numRows: number, numColumns: number): Array<Array<Nullable<ICellData>>> {
        const range = new Range(
            this,
            {
                startRow,
                startColumn,
                endRow: startRow + numRows - 1,
                endColumn: startColumn + numColumns - 1,
            },
            this._currentUniverService
        );
        return range.getValues();
    }

    /**
     * Returns a Range corresponding to the dimensions in which data is present.
     * @returns a Range corresponding to the dimensions in which data is present.
     */
    getDataRange(): Range {
        const range = new Range(this, this._cellData.getRange(), this._currentUniverService);
        return range;
    }

    private _initialize(): void {
        // this._selection = new Selection(this);
        this._merges = new Merges(this, this._config.mergeData);
    }
}
