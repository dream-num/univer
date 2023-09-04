import { Inject } from '@wendellhu/redi';
import { ClearRangeAction, IClearRangeActionData } from '../Action';
import { DEFAULT_WORKSHEET } from '../../Types/Const';
import { BooleanNumber, SheetTypes } from '../../Types/Enum';
import { ICellData, IOptionData, IRangeStringData, ISelectionData, IWorksheetConfig } from '../../Types/Interfaces';
import { Nullable, ObjectMatrix, Tools, Tuples } from '../../Shared';
import { ColumnManager } from './ColumnManager';
import { Merges } from './Merges';
import { RowManager } from './RowManager';
import { Selection } from './Selection';
import { Command, CommandManager } from '../../Command';
import { ObserverManager } from '../../Observer';
import { ICurrentUniverService } from '../../Service/Current.service';

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
    protected _selection: Selection;

    protected _config: IWorksheetConfig;

    protected _initialized: boolean;

    protected _merges: Merges;

    protected _sheetId: string;

    protected _cellData: ObjectMatrix<ICellData>;

    protected _rowManager: RowManager;

    protected _columnManager: ColumnManager;

    constructor(
        customConfig: Partial<IWorksheetConfig>,
        @Inject(CommandManager) private readonly _commandManager: CommandManager,
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
        this._rowManager = new RowManager(this, rowData, this._currentUniverService, this._commandManager);
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
     */
    clone(): Worksheet {
        const { _config } = this;
        const copy = Tools.deepClone(_config);
        return new Worksheet(copy, this._commandManager, this._observerManager, this._currentUniverService);
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

    /**
     * Returns User Selection
     * @returns User Selection
     */
    getSelection(): Selection {
        return this._selection;
    }

    /**
     * Returns Copy WorkSheet
     * @param name sheet name
     * @returns Copy WorkSheet
     */
    copy(name: string): Worksheet {
        const duplicatedConfig = Tools.deepClone(this._config);
        duplicatedConfig.name = name;
        duplicatedConfig.status = BooleanNumber.FALSE;
        duplicatedConfig.id = Tools.generateRandomId();
        return new Worksheet(duplicatedConfig, this._commandManager, this._observerManager, this._currentUniverService);
    }

    /**
     * Sets Update WorkSheet Configure
     * @param config config of worksheet
     * @returns current worksheet instance
     */
    setConfig(config: Partial<IWorksheetConfig>): Worksheet {
        this._config = Tools.commonExtend(DEFAULT_WORKSHEET, config);
        // this._config = Tools.deepMerge(DEFAULT_WORKSHEET, config);
        return this;
    }

    /**
     * Returns WorkSheet Configures
     * @returns WorkSheet Configures
     */
    getConfig(): IWorksheetConfig {
        return this._config;
    }

    /**
     * Clears the sheet of content and formatting information.
     * @returns WorkSheet Instance
     */
    clear(): Worksheet;
    /**
     * Clears the sheet of content and formatting information.
     * @param options clear option
     * @returns WorkSheet Instance
     */
    clear(options: IOptionData): Worksheet;
    clear(...argument: any): Worksheet {
        // collect all cell as a Range
        const _range = {
            startRow: 0,
            endRow: this.getConfig().rowCount - 1,
            startColumn: 0,
            endColumn: this.getConfig().columnCount - 1,
        };

        // default options
        let options = {
            formatOnly: true,
            contentsOnly: true,
        };

        if (Tuples.checkup(argument, Tuples.OBJECT_TYPE)) {
            options = argument[0];
        }

        const setValue: IClearRangeActionData = {
            sheetId: this._sheetId,
            actionName: ClearRangeAction.NAME,
            options,
            rangeData: _range,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            setValue
        );
        this._commandManager.invoke(command);
        return this;
    }

    /**
     * restore the active selection region for this sheet.
     * @returns Range — the newly active range
     */
    setActiveSelection(): Range;
    /**
     * restore the active selection region for this sheet.
     * @param range Range Instance of Selection
     * @returns Range — the newly active range
     */
    setActiveSelection(range: Range): Range;
    /**
     * restore the active selection region for this sheet.
     * @param a1Notation One of the range types, the range to set as active, as specified in A1 notation or R1C1 notation
     * @returns Range — the newly active range
     */
    setActiveSelection(a1Notation: IRangeStringData): Range;
    setActiveSelection(...argument: any): Range {
        const range = argument[0];

        // just send range, we will handle Range instance or range string in Selection class
        return range ? this._selection.setSelection({ selection: range }) : this._selection.setSelection();
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
     * Clears the sheet of contents, while preserving formatting information.
     * @returns WorkSheet Instance
     */
    clearContents(): Worksheet {
        // const { _config } = this;
        // const { rowCount, columnCount } = _config;
        // this.getRange({
        //     startRow: 0,
        //     endRow: rowCount,
        //     startColumn: 0,
        //     endColumn: columnCount,
        // }).clear({
        //     contentsOnly: true,
        // });
        // return this;
    }

    /**
     * Clears the sheet of formatting, while preserving contents.
     * @returns WorkSheet Instance
     */
    // clearFormats(): Worksheet {
    // const { _config } = this;
    // const { rowCount, columnCount } = _config;
    // this.getRange({
    //     startRow: 0,
    //     endRow: rowCount,
    //     startColumn: 0,
    //     endColumn: columnCount,
    // }).clear({
    //     formatOnly: true,
    // });
    // return this;
    // }

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
     * Sets the specified cell as the current cell.
     * @param cell cell range
     * @returns Range Instance
     */
    // setCurrentCell(cell: Range): Range {
    //     return cell.activateAsCurrentCell();
    // }

    /**
     * Returns the active cell in this sheet.
     * @returns the active cell in this sheet
     */
    getActiveCell(): Range {
        return this.getSelection().getCurrentCell();
    }

    /**
     * Returns the selected range in the active sheet
     * @returns the selected range in the active sheet
     */
    getActiveRange(): Range {
        return this.getSelection().getActiveRange();
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
     * Sets the specified range as the active range in the active sheet, with the top left cell in the range as the current cell.
     * @param range active range types
     * @return Active Range
     */
    setActiveRange(range: ISelectionData): Range {
        return this.getSelection().setSelection(range);
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
     * @deprecated the method here is just to prevent ts errors
     */
    setCommandManager(_commandManager: CommandManager): void {
        throw new Error('This method is deprecated. The method is here to prevent ts errors!');
    }

    private _initialize(): void {
        // this._selection = new Selection(this);
        this._merges = new Merges(this, this._config.mergeData, this._commandManager, this._currentUniverService);
    }
}
