import { Inject } from '@wendellhu/redi';
import {
    IInsertColumnDataActionData,
    BorderStyleData,
    SetZoomRatioAction,
    InsertRowDataAction,
    InsertRowAction,
    InsertColumnDataAction,
    InsertColumnAction,
    ClearRangeAction,
    SetTabColorAction,
    SetBorderAction,
    IInsertColumnActionData,
    IRemoveColumnAction,
    RemoveColumnAction,
    RemoveColumnDataAction,
    RemoveRowAction,
    RemoveRowDataAction,
    SetColumnHideAction,
    SetColumnShowAction,
    SetHiddenGridlinesAction,
    SetRightToLeftAction,
    SetRowHideAction,
    SetRowShowAction,
    SetWorkSheetHideAction,
    IClearRangeActionData,
    IInsertRowActionData,
    IInsertRowDataActionData,
    IRemoveColumnDataAction,
    IRemoveRowActionData,
    IRemoveRowDataActionData,
    ISetColumnHideActionData,
    ISetColumnShowActionData,
    ISetRowHideActionData,
    ISetRowShowActionData,
    ISetTabColorActionData,
    ISetWorkSheetActivateActionData,
    ISetWorkSheetHideActionData,
    ISetWorkSheetStatusActionData,
    SetWorkSheetActivateAction,
    SetWorkSheetNameAction,
    SetWorkSheetStatusAction,
} from '../Action';
import { DEFAULT_WORKSHEET } from '../../Types/Const';
import { Direction, BooleanNumber, SheetTypes } from '../../Types/Enum';
import { IBorderStyleData, ICellData, IOptionData, IRangeData, IRangeStringData, IRangeType, ISelectionData, IStyleData, IWorksheetConfig } from '../../Types/Interfaces';
import { Nullable, ObjectMatrix, Tools, Tuples } from '../../Shared';
import { ColumnManager } from './ColumnManager';
import { Merges } from './Merges';
import { Range } from './Range';
import { RangeList } from './RangeList';
import { RowManager } from './RowManager';
import { Selection } from './Selection';
import { Command, CommandManager, ISheetActionData } from '../../Command';
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
        this._rowManager = new RowManager(this, rowData);
        this._columnManager = new ColumnManager(this, columnData);
        this._initialize();
    }

    /**
     * Returns WorkSheet Cell Data Matrix
     * @returns
     */
    getCellMatrix(): ObjectMatrix<ICellData> {
        return this._cellData;
    }

    /**
     * Activates this sheet. Does not alter the sheet itself, only the parent's notion of the active sheet.
     * @returns Sheet — The newly active sheet.
     */
    activate(): Worksheet {
        if (this._config.status === BooleanNumber.TRUE) {
            return this;
        }
        const _commandManager = this._commandManager;
        const before = this._observerManager.requiredObserver<{ sheet: Worksheet }>('onBeforeChangeActiveSheetObservable', 'core');
        const after = this._observerManager.requiredObserver<{ sheet: Worksheet }>('onAfterChangeActiveSheetObservable', 'core');
        const setActive: ISetWorkSheetActivateActionData = {
            sheetId: this._sheetId,
            actionName: SetWorkSheetActivateAction.NAME,
            status: BooleanNumber.TRUE,
        };

        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            setActive
        );
        before.notifyObservers({ sheet: this });
        _commandManager.invoke(command);
        after.notifyObservers({ sheet: this });
        return this;
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
     * Set the sheet name.
     *
     * @example
     * Set new name:
     * ```
     * worksheet.setName('NewSheet')
     * ```
     *
     * @param name - new sheet name
     * @returns current worksheet instance
     *
     * @alpha
     */
    setName(name: string): Worksheet {
        const { _sheetId } = this;
        const before = this._observerManager.getObserver('onBeforeChangeSheetNameObservable', 'core')!;
        const after = this._observerManager.getObserver<{ name: string; sheet: Worksheet }>('onAfterChangeSheetNameObservable', 'core')!;
        const configure = {
            actionName: SetWorkSheetNameAction.NAME,
            sheetName: name,
            sheetId: _sheetId,
        };

        const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const sheets = workbook.getSheets();
        for (let i = 0; i < sheets.length; i++) {
            const sheet = sheets[i];
            if (sheet !== this && sheet.getName() === name) {
                console.warn('Duplicate name');
                return this;
            }
        }

        before.notifyObservers();
        const command = new Command(
            {
                WorkBookUnit: workbook,
            },
            configure
        );
        this._commandManager.invoke(command);
        after.notifyObservers({ name, sheet: this });
        return this;
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
            return new Range(this, argument[0]);
        }
        if (Tools.hasLength(argument, 2)) {
            return new Range(this, {
                row: [argument[0], argument[0]],
                column: [argument[1], argument[1]],
            });
        }
        if (Tools.hasLength(argument, 3)) {
            return new Range(this, {
                row: [argument[0], argument[2]],
                column: [argument[1], argument[1]],
            });
        }
        if (Tools.hasLength(argument, 4)) {
            return new Range(this, {
                row: [argument[0], argument[2]],
                column: [argument[1], argument[3]],
            });
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
        return new RangeList(this, rangeList);
    }

    /**
     * Returns WorkSheet Status
     * @returns WorkSheet Status
     */
    getStatus() {
        const { _config } = this;
        return _config.status;
    }

    // /**
    //  * Returns Protection
    //  * @returns User Pretection
    //  */
    // getProtection(): Protection {
    //     return this._protection;
    // }

    /**
     * Sets WorkSheet Status
     * @param status type of sheet status
     * @returns WorkSheet Instance
     */
    setStatus(status: BooleanNumber): Worksheet {
        const { _sheetId } = this;
        const configure: ISetWorkSheetStatusActionData = {
            actionName: SetWorkSheetStatusAction.NAME,
            sheetId: _sheetId,
            sheetStatus: status,
        };

        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            configure
        );
        this._commandManager.invoke(command);
        return this;
    }

    /**
     * Return WorkSheetZoomRatio
     * @return zoomRatio
     */
    getZoomRatio(): number {
        return this._config.zoomRatio || 1;
    }

    /**
     * Sets WorkSheetZoomRatio
     * @param zoomRatio
     */
    setZoomRatio(zoomRatio: number): void {
        const { _sheetId } = this;
        const zoomRation = {
            actionName: SetZoomRatioAction.NAME,
            zoom: zoomRatio,
            sheetId: _sheetId,
        };

        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            zoomRation
        );

        // DEPT: notifyObservers should come before invoking command, and that is ambiguous
        const observer = this._observerManager.getObserver<{ zoomRatio: number }>('onZoomRatioSheetObservable', 'core')!;
        observer.notifyObservers({ zoomRatio });

        this._commandManager.invoke(command);
    }

    /**
     * Returns User Selection
     * @returns User Selection
     */
    getSelection(): Selection {
        return this._selection;
    }

    // /**
    //  * Returns Row StructGroup
    //  * @returns Row StructGroup
    //  */
    // getRowStructGroup(): StructGroup {
    //     return this._rowStatusGroup;
    // }

    // /**
    //  * Returns Column StructGroup
    //  * @returns Column StructGroup
    //  */
    // getColumnStructGroup(): StructGroup {
    //     return this._columnStatusGroup;
    // }

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
     * Returns WorkSheet Configures
     * @returns WorkSheet Configures
     */
    getConfig(): IWorksheetConfig {
        return this._config;
    }

    /**
     * Inserts a blank row in a sheet at the specified location.
     * @param rowPosition row index
     * @param numberRows numder of inserted rows
     * @returns WorkSheet Instance
     */
    insertRows(rowPosition: number, numberRows: number = 1): Worksheet {
        const { _sheetId } = this;

        // TODO: @wzhudev: the two parameters are pretty same, so really not necessary
        const insertRowData: IInsertRowDataActionData = {
            actionName: InsertRowDataAction.NAME,
            sheetId: _sheetId,
            rowIndex: rowPosition,
            rowData: ObjectMatrix.MakeObjectMatrixSize<ICellData>(numberRows).toJSON(),
        };
        const insertRow: IInsertRowActionData = {
            actionName: InsertRowAction.NAME,
            sheetId: _sheetId,
            rowIndex: rowPosition,
            rowCount: numberRows,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            insertRowData,
            insertRow
        );
        this._commandManager.invoke(command);
        return this;
    }

    /**
     * Inserts a number of rows after the given row position.
     * @param afterPosition row index
     * @returns WorkSheet Instance
     */
    insertRowAfter(afterPosition: number): Worksheet;
    /**
     * Inserts a number of rows after the given row position.
     * @param afterPosition row index
     * @param howMany row count
     * @returns WorkSheet Instance
     */
    insertRowAfter(afterPosition: number, howMany: number): Worksheet;
    insertRowAfter(...argument: any): Worksheet {
        let rowIndex: number = 0;
        let numRows: number = 1;

        if (Tools.hasLength(argument, 1)) {
            rowIndex = argument[0] + 1;
        }
        if (Tools.hasLength(argument, 2)) {
            rowIndex = argument[0] + 1;
            numRows = argument[1];
        }

        const { _sheetId } = this;
        const insertRowData = {
            actionName: InsertRowDataAction.NAME,
            sheetId: _sheetId,
            rowIndex,
            rowData: ObjectMatrix.MakeObjectMatrixSize<ICellData>(numRows).toJSON(),
        };
        const insertRow = {
            actionName: InsertRowAction.NAME,
            sheetId: _sheetId,
            rowIndex,
            rowCount: numRows,
        };

        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            insertRowData,
            insertRow
        );
        this._commandManager.invoke(command);
        return this;
    }

    /**
     * Inserts a number of rows before the given row position.
     * @param beforePosition row index
     * @returns WorkSheet Instance
     */
    insertRowBefore(beforePosition: number): Worksheet;
    /**
     * Inserts a number of rows before the given row position.
     * @param beforePosition row index
     * @param howMany row count
     * @returns WorkSheet Instance
     */
    insertRowBefore(beforePosition: number, howMany: number): Worksheet;
    insertRowBefore(...argument: any): Worksheet {
        let rowIndex: number = 0;
        let numRows: number = 1;

        if (Tools.hasLength(argument, 1)) {
            rowIndex = argument[0] - 1;
        }
        if (Tools.hasLength(argument, 2)) {
            rowIndex = argument[0] - 1;
            numRows = argument[1];
        }

        if (rowIndex < 0) {
            rowIndex = 0;
        }

        const { _sheetId } = this;
        const insertRowData = {
            actionName: InsertRowDataAction.NAME,
            sheetId: _sheetId,
            rowIndex,
            rowData: ObjectMatrix.MakeObjectMatrixSize<ICellData>(numRows).toJSON(),
        };
        const insertRow = {
            actionName: InsertRowAction.NAME,
            sheetId: _sheetId,
            rowIndex,
            rowCount: numRows,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            insertRowData,
            insertRow
        );
        this._commandManager.invoke(command);
        return this;
    }

    /**
     * Inserts a blank column in a sheet at the specified location.
     * @param columnIndex column index
     * @returns WorkSheet Instance
     */
    insertColumns(columnIndex: number): Worksheet;
    /**
     * Inserts a blank column in a sheet at the specified location.
     * @param columnIndex column index
     * @param numColumns column count
     * @returns WorkSheet Instance
     */
    insertColumns(columnIndex: number, numColumns: number): Worksheet;
    insertColumns(...argument: any): Worksheet {
        let columnIndex: number = 0;
        let numColumns: number = 1;

        if (Tools.hasLength(argument, 1)) {
            columnIndex = argument[0];
        }
        if (Tools.hasLength(argument, 2)) {
            columnIndex = argument[0];
            numColumns = argument[1];
        }

        const { _sheetId } = this;
        const columnData = new ObjectMatrix<ICellData>();
        this._cellData.forEach((index) => {
            for (let i = columnIndex; i < columnIndex + numColumns; i++) {
                columnData.setValue(index, i - columnIndex, {});
            }
        });
        const insertColumnData = {
            actionName: InsertColumnDataAction.NAME,
            sheetId: _sheetId,
            columnIndex,
            columnData: columnData.toJSON(),
        };
        const insertColumn = {
            actionName: InsertColumnAction.NAME,
            sheetId: _sheetId,
            columnIndex,
            columnCount: numColumns,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            insertColumn,
            insertColumnData
        );
        this._commandManager.invoke(command);

        return this;
    }

    /**
     * Inserts a number of columns before the given row position.
     * @param beforePosition column index
     * @returns WorkSheet Instance
     */
    insertColumnBefore(beforePosition: number): Worksheet;
    /**
     * Inserts a number of columns before the given row position.
     * @param beforePosition column index
     * @param howMany column count
     * @returns WorkSheet Instance
     */
    insertColumnBefore(beforePosition: number, howMany: number): Worksheet;
    insertColumnBefore(...argument: any): Worksheet {
        let columnIndex: number = 0;
        let numColumns: number = 1;

        if (Tools.hasLength(argument, 1)) {
            columnIndex = argument[0] - 1;
        }
        if (Tools.hasLength(argument, 2)) {
            columnIndex = argument[0] - 1;
            numColumns = argument[1];
        }

        if (columnIndex < 0) {
            columnIndex = 0;
        }

        const { _sheetId } = this;
        const columnData = new ObjectMatrix<ICellData>();
        if (this._cellData.getLength()) {
            this._cellData.forEach((index) => {
                for (let i = columnIndex; i < columnIndex + numColumns; i++) {
                    columnData.setValue(index, i - columnIndex, {});
                }
            });
        } else {
            for (let i = 0; i < this._config.rowCount; i++) {
                for (let j = columnIndex; j < columnIndex + numColumns; j++) {
                    columnData.setValue(i, j - columnIndex, {});
                }
            }
        }

        const insertColumnData: IInsertColumnDataActionData = {
            actionName: InsertColumnDataAction.NAME,
            sheetId: _sheetId,
            columnIndex,
            columnData: columnData.toJSON(),
        };
        const insertColumn: IInsertColumnActionData = {
            actionName: InsertColumnAction.NAME,
            sheetId: _sheetId,
            columnIndex,
            columnCount: numColumns,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            insertColumn,
            insertColumnData
        );
        this._commandManager.invoke(command);

        return this;
    }

    /**
     * Inserts a number of columns after the given row position.
     * @param afterPosition column index
     * @returns WorkSheet Instance
     */
    insertColumnAfter(afterPosition: number): Worksheet;
    /**
     * Inserts a number of columns after the given row position.
     * @param afterPosition column index
     * @param howMany column count
     * @returns WorkSheet Instance
     */
    insertColumnAfter(afterPosition: number, howMany: number): Worksheet;
    insertColumnAfter(...argument: any): Worksheet {
        let columnIndex: number = 0;
        let numColumns: number = 1;

        if (Tools.hasLength(argument, 1)) {
            columnIndex = argument[0] + 1;
        }
        if (Tools.hasLength(argument, 2)) {
            columnIndex = argument[0] + 1;
            numColumns = argument[1];
        }

        const { _sheetId } = this;
        const columnData = new ObjectMatrix<ICellData>();
        this._cellData.forEach((index) => {
            for (let i = columnIndex; i < columnIndex + numColumns; i++) {
                columnData.setValue(index, i - columnIndex, {});
            }
        });
        const insertColumnData: IInsertColumnDataActionData = {
            actionName: InsertColumnDataAction.NAME,
            sheetId: _sheetId,
            columnIndex,
            columnData: columnData.toJSON(),
        };
        const insertColumn: IInsertColumnActionData = {
            actionName: InsertColumnAction.NAME,
            sheetId: _sheetId,
            columnIndex,
            columnCount: numColumns,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            insertColumnData,
            insertColumn
        );
        this._commandManager.invoke(command);

        return this;
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
     * Sets the sheet tab color.
     * @param color A color code in CSS notation (like '#ffffff' or 'white'), or null to reset the tab color.
     * @returns WorkSheet This sheet, for chaining.
     */
    setTabColor(color: Nullable<string>): Worksheet {
        const setTabColor: ISetTabColorActionData = {
            sheetId: this._sheetId,
            actionName: SetTabColorAction.NAME,
            color,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            setTabColor
        );
        this._commandManager.invoke(command);

        const observer = this._observerManager.getObserver('onSheetTabColorChangeObservable', 'core');
        observer?.notifyObservers();

        return this;
    }

    /**
     * Hides this sheet. Has no effect if the sheet is already hidden. If this method is called on the only visible sheet, it throws an exception.
     * @returns Sheet — The current sheet.
     */
    hideSheet(): Worksheet {
        const _workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        if (!this._config.hidden) {
            const observer = this._observerManager.getObserver<{ sheet: Worksheet }>('onHideSheetObservable', 'core');
            const setHiddenAction: ISetWorkSheetHideActionData = {
                hidden: BooleanNumber.TRUE,
                sheetId: this._sheetId,
                actionName: SetWorkSheetHideAction.NAME,
            };
            const command = new Command(
                {
                    WorkBookUnit: _workbook,
                },
                setHiddenAction
            );
            this._commandManager.invoke(command);
            observer!.notifyObservers({ sheet: this });
            const index = _workbook.getSheetIndex(this);
            if (index != null) {
                _workbook.activateSheetByIndex(index);
            }
        }
        return this;
    }

    /**
     *  Makes the sheet visible. Has no effect if the sheet is already visible.
     * @returns WorkSheet Instance
     */
    showSheet(): Worksheet {
        if (!this._config.hidden) {
            return this;
        }
        const setHidden: ISetWorkSheetHideActionData = {
            hidden: BooleanNumber.FALSE,
            sheetId: this._sheetId,
            actionName: SetWorkSheetHideAction.NAME,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            setHidden
        );
        this._commandManager.invoke(command);
        this._observerManager.getObserver<{ sheet: Worksheet }>('onShowSheetObservable', 'core')?.notifyObservers({ sheet: this });
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
        const { _config } = this;
        const { rowCount, columnCount } = _config;
        this.getRange({
            startRow: 0,
            endRow: rowCount,
            startColumn: 0,
            endColumn: columnCount,
        }).clear({
            contentsOnly: true,
        });
        return this;
    }

    /**
     * Clears the sheet of formatting, while preserving contents.
     * @returns WorkSheet Instance
     */
    clearFormats(): Worksheet {
        const { _config } = this;
        const { rowCount, columnCount } = _config;
        this.getRange({
            startRow: 0,
            endRow: rowCount,
            startColumn: 0,
            endColumn: columnCount,
        }).clear({
            formatOnly: true,
        });
        return this;
    }

    /**
     * Deletes the column at the given column position.
     * @param columnPosition column index
     * @returns WorkSheet Instance
     */
    deleteColumn(columnPosition: number): Worksheet {
        const { _sheetId } = this;
        const deleteColumnData: IRemoveColumnDataAction = {
            actionName: RemoveColumnDataAction.NAME,
            sheetId: _sheetId,
            columnCount: 1,
            columnIndex: columnPosition,
        };
        const deleteColumn: IRemoveColumnAction = {
            actionName: RemoveColumnAction.NAME,
            sheetId: _sheetId,
            columnCount: 1,
            columnIndex: columnPosition,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            deleteColumnData,
            deleteColumn
        );
        this._commandManager.invoke(command);

        return this;
    }

    /**
     * Deletes a number of columns starting at the given column position.
     * @param columnPosition column index
     * @param howMany column count
     * @returns WorkSheet Instance
     */
    deleteColumns(columnPosition: number, howMany: number): Worksheet {
        const { _sheetId } = this;
        const deleteColumnData: IRemoveColumnDataAction = {
            actionName: RemoveColumnDataAction.NAME,
            sheetId: _sheetId,
            columnCount: howMany,
            columnIndex: columnPosition,
        };
        const deleteColumn: IRemoveColumnAction = {
            actionName: RemoveColumnAction.NAME,
            sheetId: _sheetId,
            columnCount: howMany,
            columnIndex: columnPosition,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            deleteColumnData,
            deleteColumn
        );
        this._commandManager.invoke(command);

        return this;
    }

    /**
     * Deletes the row at the given row position.
     * @param rowPosition row index
     * @returns WorkSheet Instance
     */
    deleteRow(rowPosition: number): Worksheet {
        const { _sheetId } = this;
        const dataRowDelete: IRemoveRowDataActionData = {
            actionName: RemoveRowDataAction.NAME,
            sheetId: _sheetId,
            rowCount: 1,
            rowIndex: rowPosition,
        };
        const rowDelete: IRemoveRowActionData = {
            actionName: RemoveRowAction.NAME,
            sheetId: _sheetId,
            rowCount: 1,
            rowIndex: rowPosition,
        };

        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            dataRowDelete,
            rowDelete
        );
        this._commandManager.invoke(command);

        return this;
    }

    /**
     * Deletes a number of rows starting at the given row position.
     * @param rowPosition row index
     * @param howMany row count
     * @returns WorkSheet Instance
     */
    deleteRows(rowPosition: number, howMany: number): Worksheet {
        const { _sheetId } = this;
        const dataRowDelete: IRemoveRowDataActionData = {
            actionName: RemoveRowDataAction.NAME,
            sheetId: _sheetId,
            rowCount: howMany,
            rowIndex: rowPosition,
        };
        const rowDelete: IRemoveRowActionData = {
            actionName: RemoveRowAction.NAME,
            sheetId: _sheetId,
            rowCount: howMany,
            rowIndex: rowPosition,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            dataRowDelete,
            rowDelete
        );
        this._commandManager.invoke(command);

        return this;
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
     * Returns Border Styles
     * @returns Border Styles
     */
    // getBorderStyles(): BorderStyles {
    //     return this._borderStyles;
    // }

    /**
     * Sets the BorderStyles
     * @param rangeData
     * @param style
     * @param directions
     */
    // TODO: fix
    // eslint-disable-next-line max-lines-per-function
    setBorderStyle(rangeData: IRangeData, style: IBorderStyleData, directions: Direction[]) {
        const { _sheetId } = this;

        const matrix = this.getCellMatrix();
        const workbook = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const styles = workbook.getStyles();

        const tr = this.getRange({
            startRow: rangeData.startRow - 1,
            startColumn: rangeData.startColumn,
            endRow: rangeData.startRow - 1,
            endColumn: rangeData.endColumn,
        });
        const lr = this.getRange({
            startRow: rangeData.startRow,
            startColumn: rangeData.startColumn - 1,
            endRow: rangeData.startRow,
            endColumn: rangeData.endColumn - 1,
        });
        const br = this.getRange({
            startRow: rangeData.endRow + 1,
            startColumn: rangeData.startColumn,
            endRow: rangeData.endRow + 1,
            endColumn: rangeData.endColumn,
        });
        const rr = this.getRange({
            startRow: rangeData.startRow,
            startColumn: rangeData.endColumn + 1,
            endRow: rangeData.startRow,
            endColumn: rangeData.endColumn + 1,
        });
        const cc = this.getRange(rangeData);

        const mtr = new ObjectMatrix<IStyleData>();
        const mlr = new ObjectMatrix<IStyleData>();
        const mbr = new ObjectMatrix<IStyleData>();
        const mrr = new ObjectMatrix<IStyleData>();
        const mcr = new ObjectMatrix<IStyleData>();

        tr.forEach((row, column) => {
            const cell = matrix.getValue(row, column);
            if (cell) {
                const cellStyle = styles.getStyleByCell(cell);
                if (cellStyle) {
                    const copy: IStyleData = Tools.deepClone(cellStyle);
                    if (copy.bd) {
                        delete copy.bd.b;
                    }
                    mtr.setValue(row, column, copy);
                }
            }
        });
        br.forEach((row, column) => {
            const cell = matrix.getValue(row, column);
            if (cell) {
                const cellStyle = styles.getStyleByCell(cell);
                if (cellStyle) {
                    const copy: IStyleData = Tools.deepClone(cellStyle);
                    if (copy.bd) {
                        delete copy.bd.t;
                    }
                    mbr.setValue(row, column, copy);
                }
            }
        });
        lr.forEach((row, column) => {
            const cell = matrix.getValue(row, column);
            if (cell) {
                const cellStyle = styles.getStyleByCell(cell);
                if (cellStyle) {
                    const copy: IStyleData = Tools.deepClone(cellStyle);
                    if (copy.bd) {
                        delete copy.bd.r;
                    }
                    mlr.setValue(row, column, copy);
                }
            }
        });
        rr.forEach((row, column) => {
            const cell = matrix.getValue(row, column);
            if (cell) {
                const cellStyle = styles.getStyleByCell(cell);
                if (cellStyle) {
                    const copy: IStyleData = Tools.deepClone(cellStyle);
                    if (copy.bd) {
                        delete copy.bd.l;
                    }
                    mrr.setValue(row, column, copy);
                }
            }
        });
        cc.forEach((row, column) => {
            mcr.setValue(row, column, style);
        });

        const actions: ISheetActionData[] = [];

        if (directions.includes(Direction.TOP)) {
            const setBottomData: BorderStyleData = {
                sheetId: _sheetId,
                actionName: SetBorderAction.NAME,
                styles: mbr.toJSON(),
            };
            actions.push(setBottomData);
        }
        if (directions.includes(Direction.BOTTOM)) {
            const setTopData: BorderStyleData = {
                sheetId: _sheetId,
                actionName: SetBorderAction.NAME,
                styles: mtr.toJSON(),
            };
            actions.push(setTopData);
        }
        if (directions.includes(Direction.LEFT)) {
            const setRightData: BorderStyleData = {
                sheetId: _sheetId,
                actionName: SetBorderAction.NAME,
                styles: mrr.toJSON(),
            };
            actions.push(setRightData);
        }
        if (directions.includes(Direction.RIGHT)) {
            const setLeftData: BorderStyleData = {
                sheetId: _sheetId,
                actionName: SetBorderAction.NAME,
                styles: mlr.toJSON(),
            };
            actions.push(setLeftData);
        }
        const setCCData: BorderStyleData = {
            sheetId: _sheetId,
            actionName: SetBorderAction.NAME,
            styles: mcr.toJSON(),
        };
        actions.push(setCCData);

        const commandCC = new Command(
            {
                WorkBookUnit: workbook,
            },
            ...actions
        );

        this._commandManager.invoke(commandCC);

        return this;
    }

    /**
     * Sets the specified cell as the current cell.
     * @param cell cell range
     * @returns Range Instance
     */
    setCurrentCell(cell: Range): Range {
        return cell.activateAsCurrentCell();
    }

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
     * Returns the list of active ranges in the active sheet
     * @returns the list of active ranges in the active sheet
     */
    getActiveRangeList(): RangeList {
        return this.getSelection().getActiveRangeList();
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
     * Sets the specified list of ranges as the active ranges in the active sheet. The last range in the list is set as the active range.
     * @param rangeList active range types array
     * @return Active Range List
     */
    setActiveRangeList(rangeList: ISelectionData): RangeList {
        const selection = this.getSelection();
        selection.setSelection(rangeList);
        return selection.getActiveRangeList();
    }

    /**
     * Hides the rows in the given range.
     * @param row row range
     * @returns WorkSheet Instance
     */
    hideRow(row: Range): Worksheet {
        const range = row.getRangeData();
        const index = range.startRow;
        const count = range.endRow - range.startRow + 1;
        const { _sheetId } = this;
        const hideRow: ISetRowHideActionData = {
            actionName: SetRowHideAction.NAME,
            sheetId: _sheetId,
            rowCount: count,
            rowIndex: index,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            hideRow
        );
        this._commandManager.invoke(command);
        return this;
    }

    // TODO: @Dushudir unnecessary function overload here

    /**
     * Hides one or more consecutive rows starting at the given index.
     * @param rowIndex row index
     * @returns WorkSheet Instance
     */
    hideRows(rowIndex: number): Worksheet;
    /**
     * Hides one or more consecutive rows starting at the given index.
     * @param rowIndex row index
     * @param numRows row count
     * @returns WorkSheet Instance
     */
    hideRows(rowIndex: number, numRows: number): Worksheet;
    hideRows(...argument: any): Worksheet {
        const index = --argument[0];
        let count = 1;
        if (argument[1]) {
            count = argument[1];
        }
        const { _sheetId } = this;
        const hideRow: ISetRowHideActionData = {
            actionName: SetRowHideAction.NAME,
            sheetId: _sheetId,
            rowCount: count,
            rowIndex: index,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            hideRow
        );
        this._commandManager.invoke(command);
        return this;
    }

    /**
     * Hides the columns in the given range.
     * @param column column range
     * @returns WorkSheet Instance
     */
    hideColumn(column: Range): Worksheet {
        const range = column.getRangeData();
        const index = range.startColumn;
        const count = range.endColumn - range.startColumn + 1;
        const { _sheetId } = this;
        const hideColumn: ISetColumnHideActionData = {
            actionName: SetColumnHideAction.NAME,
            sheetId: _sheetId,
            columnCount: count,
            columnIndex: index,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            hideColumn
        );
        this._commandManager.invoke(command);
        return this;
    }

    /**
     * Hides one or more consecutive columns starting at the given index.
     * @param columnIndex column index
     * @returns WorkSheet Instance
     */
    hideColumns(columnIndex: number): Worksheet;
    /**
     * Hides one or more consecutive columns starting at the given index.
     * @param columnIndex column index
     * @param numColumns column count
     * @returns WorkSheet Instance
     */
    hideColumns(columnIndex: number, numColumns: number): Worksheet;
    hideColumns(...argument: any): Worksheet {
        const index = argument[0];
        let count = 1;
        if (argument[1]) {
            count = argument[1];
        }
        const { _sheetId } = this;
        const hideColumn: ISetColumnHideActionData = {
            actionName: SetColumnHideAction.NAME,
            sheetId: _sheetId,
            columnCount: count,
            columnIndex: index,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            hideColumn
        );
        this._commandManager.invoke(command);
        return this;
    }

    /**
     * Unhides the row in the given range.
     * @param row row range
     * @return WorkSheet Instance
     */
    unhideRow(row: Range): Worksheet {
        const range = row.getRangeData();
        const index = range.startRow;
        const count = range.endRow - range.startRow + 1;
        const { _sheetId } = this;
        const unhideRow: ISetRowShowActionData = {
            actionName: SetRowShowAction.NAME,
            rowCount: count,
            rowIndex: index,
            sheetId: _sheetId,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            unhideRow
        );
        this._commandManager.invoke(command);
        return this;
    }

    /**
     * Unhides the column in the given range.
     * @param column column range
     * @return WorkSheet Instance
     */
    unhideColumn(column: Range): Worksheet {
        const range = column.getRangeData();
        const index = range.startColumn;
        const count = range.endColumn - range.startColumn + 1;
        const { _sheetId } = this;
        const unhideColumn: ISetColumnShowActionData = {
            actionName: SetColumnShowAction.NAME,
            sheetId: _sheetId,
            columnCount: count,
            columnIndex: index,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            unhideColumn
        );
        this._commandManager.invoke(command);
        return this;
    }

    /**
     * Unhides one or more consecutive columns starting at the given index.
     * @param columnIndex column index
     * @returns WorkSheet Instance
     */
    showColumns(columnIndex: number): Worksheet;
    /**
     * Unhides one or more consecutive columns starting at the given index.
     * @param columnIndex column index
     * @param numColumns column count
     * @returns WorkSheet Instance
     */
    showColumns(columnIndex: number, numColumns: number): Worksheet;
    showColumns(...argument: any): Worksheet {
        const index = argument[0];
        let count = 1;
        if (argument[1]) {
            count = argument[1];
        }
        const { _sheetId } = this;
        const showColumn: ISetColumnShowActionData = {
            actionName: SetColumnShowAction.NAME,
            sheetId: _sheetId,
            columnCount: count,
            columnIndex: index,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            showColumn
        );
        this._commandManager.invoke(command);
        return this;
    }

    /**
     * Unhides one or more consecutive rows starting at the given index.
     * @param rowIndex row index
     * @returns WorkSheet Instance
     */
    showRows(rowIndex: number): Worksheet;
    /**
     * Unhides one or more consecutive rows starting at the given index.
     * @param rowIndex row index
     * @param numRows row count
     * @returns WorkSheet Instance
     */
    showRows(rowIndex: number, numRows: number): Worksheet;
    showRows(...argument: any): Worksheet {
        const index = --argument[0];
        let count = 1;
        if (argument[1]) {
            count = argument[1];
        }
        const { _sheetId } = this;
        const showRow: ISetRowShowActionData = {
            actionName: SetRowShowAction.NAME,
            sheetId: _sheetId,
            rowCount: count,
            rowIndex: index,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            showRow
        );
        this._commandManager.invoke(command);
        return this;
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
     * Sets the width of the given columns in pixels.
     * @param columnPosition column index
     * @param width column width
     * @returns WorkSheet Instance
     */
    setColumnWidth(columnPosition: number, width: number): Worksheet;
    /**
     * Sets the width of the given columns in pixels.
     * @param startColumn column index
     * @param numColumns column count
     * @param width column width
     * @returns WorkSheet Instance
     */
    setColumnWidth(startColumn: number, numColumns: number, width: number): Worksheet;
    setColumnWidth(...argument: any): Worksheet {
        let columnIndex;
        let columnWidth: number[] = [];
        if (Tools.hasLength(argument, 2)) {
            columnIndex = argument[0];
            columnWidth = [argument[1]];
        }
        if (Tools.hasLength(argument, 3)) {
            columnIndex = argument[0];
            for (let i = 0; i < argument[1]; i++) {
                columnWidth.push(argument[2]);
            }
        }
        this.getColumnManager().setColumnWidth(columnIndex, columnWidth);
        return this;
    }

    /**
     * Sets the height of the given rows in pixels.
     * @param startRow row index
     * @param numRows row count
     * @param height row height
     * @returns WorkSheet Instance
     */
    setRowHeights(startRow: number, numRows: number, height: number): Worksheet {
        const rowHeight = [];
        for (let i = 0; i < numRows; i++) {
            rowHeight.push(height);
        }
        this.getRowManager().setRowHeight(startRow, rowHeight);
        return this;
    }

    /**
     * Sets the row height of the given row in pixels.
     * @param rowPosition row index
     * @param height row height
     * @returns WorkSheet Instance
     */
    setRowHeight(rowPosition: number, height: number): Worksheet {
        const rowHeight = [height];
        this.getRowManager().setRowHeight(rowPosition, rowHeight);
        return this;
    }

    /**
     * Hides or reveals the sheet gridlines.
     * @param hideGridlines hide gridlines status
     * @returns WorkSheet Instance
     */
    setHiddenGridlines(hideGridlines: boolean): Worksheet {
        const { _sheetId } = this;
        const configure = {
            actionName: SetHiddenGridlinesAction.NAME,
            hideGridlines,
            sheetId: _sheetId,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            configure
        );
        this._commandManager.invoke(command);
        return this;
    }

    // /**
    //  * Freezes the given number of columns. If zero, no columns are frozen.
    //  * @param columns freeze columns, 0 - columns
    //  * @returns WorkSheet Instance
    //  */
    // setFrozenColumns(columns: number): WorkSheet {
    //     const frozen = new Freeze(this);
    //     return frozen.setFrozenColumns(columns);
    // }

    // /**
    //  * Freezes the given number of rows. If zero, no rows are frozen.
    //  * @param rows freeze rows, 0 - rows
    //  * @returns WorkSheet Instance
    //  */
    // setFrozenRows(rows: number): WorkSheet {
    //     const frozen = new Freeze(this);
    //     return frozen.setFrozenRows(rows);
    // }

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
     * Sets or unsets the sheet layout to right-to-left.
     * @param rightToLeft rightToLeft status
     * @returns WorkSheet Instance
     */
    setRightToLeft(rightToLeft: BooleanNumber): Worksheet {
        const { _sheetId } = this;
        const configure = {
            actionName: SetRightToLeftAction.NAME,
            rightToLeft,
            sheetId: _sheetId,
        };
        const command = new Command(
            {
                WorkBookUnit: this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook(),
            },
            configure
        );
        this._commandManager.invoke(command);
        return this;
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
     * Copies the sheet to a given sheet,
     * @param sheetIndex sheet index
     * @returns WorkSheet Instance
     */
    copyTo(sheetIndex: number): Worksheet {
        const worksheet = this._currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getSheets()[sheetIndex];
        if (!worksheet) return this;

        const config = Tools.deepClone(this._config);
        config.sheetId = worksheet.getConfig().id;
        worksheet.setConfig(config);
        return worksheet;
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
        const range = new Range(this, {
            startRow,
            startColumn,
            endRow: startRow + numRows - 1,
            endColumn: startColumn + numColumns - 1,
        });
        return range.getValues();
    }

    /**
     * Returns a Range corresponding to the dimensions in which data is present.
     * @returns a Range corresponding to the dimensions in which data is present.
     */
    getDataRange(): Range {
        const range = new Range(this, this._cellData.getRange());
        return range;
    }

    /**
     * Moves the rows selected by the given range to the position indicated by the destinationIndex. The rowSpec itself does not have to exactly represent an entire row or group of rows to move—it selects all rows that the range spans.
     * @param rowSpec row range
     * @param destinationIndex row index
     * @returns WorkSheet Instance
     */
    moveRows(rowSpec: Range, destinationIndex: number): Worksheet {
        const { startRow } = rowSpec.getRangeData();
        const { endRow } = rowSpec.getRangeData();
        const data = this._cellData.spliceRows(startRow, endRow - startRow + 1);
        this._cellData.insertRows(destinationIndex, data);
        return this;
    }

    /**
     * Moves the columns selected by the given range to the position indicated by the destinationIndex. The columnSpec itself does not have to exactly represent an entire column or group of columns to move—it selects all columns that the range spans.
     * @param columnSpec column range
     * @param destinationIndex column index
     * @returns WorkSheet Instance
     */
    moveColumns(columnSpec: Range, destinationIndex: number): Worksheet {
        const startRow = columnSpec.getRangeData().startColumn;
        const endRow = columnSpec.getRangeData().endColumn;
        const data = this._cellData.spliceColumns(startRow, endRow - startRow + 1);
        this._cellData.insertColumns(destinationIndex, data);
        return this;
    }

    /**
     * @deprecated the method here is just to prevent ts errors
     */
    setCommandManager(_commandManager: CommandManager): void {
        throw new Error('This method is deprecated. The method is here to prevent ts errors!');
    }

    private _initialize(): void {
        // this._selection = new Selection(this);
        this._merges = new Merges(this, this._config.mergeData);
    }
}