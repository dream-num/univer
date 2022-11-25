import { nanoid } from 'nanoid';
import {
    ACTION_NAMES,
    DEFAULT_RANGE_ARRAY,
    DEFAULT_WORKBOOK,
    DEFAULT_WORKSHEET,
} from '../../Const';
import { BooleanNumber } from '../../Enum';
import { SheetContext } from '../../Basics';
import { Command, CommandManager, ISetSheetOrderActionData } from '../../Command';

import {
    IColumnStartEndData,
    IGridRange,
    IRangeData,
    IRangeStringData,
    IRangeType,
    IRowStartEndData,
    IWorkbookConfig,
    IWorksheetConfig,
} from '../../Interfaces';

import { NameGen, Nullable, Tools } from '../../Shared';
import { Tuples } from '../../Shared/Tuples';
import { Range } from './Range';
import { RangeList } from './RangeList';
import { Selection } from './Selection';
import { Styles } from './Styles';
import { Worksheet } from './Worksheet';
import { IInsertSheetActionData, IRemoveSheetActionData } from '../Action';

/**
 * Access and create Univer Sheets files
 */
export class Workbook {
    /**
     * sheets list
     * @private
     */
    private _worksheets: Map<string, Worksheet>;

    /**
     * Common style
     * @private
     */
    private _styles: Styles;

    /**
     * number format
     * @private
     */
    // private _formatManage: FormatManager;

    private _config: IWorkbookConfig;

    private _unitId: string;

    private _context: SheetContext;

    private _commandManager: CommandManager;

    constructor(workbookData: Partial<IWorkbookConfig> = {}, context: SheetContext) {
        this._config = Tools.commonExtend(DEFAULT_WORKBOOK, workbookData);
        this._context = context;

        const { styles } = this._config;
        this._unitId = this._config.id ?? nanoid(6);
        this._styles = new Styles(styles);
        this._worksheets = new Map<string, Worksheet>();
        this._commandManager = context.getCommandManager();
        // this._formatManage = new FormatManager();
        this._getDefaultWorkSheet();
    }

    /**
     * Get Default Sheet
     * @private
     */
    private _getDefaultWorkSheet(): void {
        const { _context, _config, _worksheets } = this;
        const { sheets, sheetOrder } = _config;

        // One worksheet by default
        if (Tools.isEmptyObject(sheets)) {
            sheets[DEFAULT_WORKSHEET.id] = DEFAULT_WORKSHEET;
        }

        let firstWorksheet = null;

        for (let sheetId in sheets) {
            let config = sheets[sheetId];
            config.name = NameGen.getSheetName(config.name);
            const worksheet = new Worksheet(_context, config);
            _worksheets.set(worksheet.getSheetId(), worksheet);
            sheetOrder.push(worksheet.getSheetId());
            if (firstWorksheet == null) {
                firstWorksheet = worksheet;
            }
        }

        if (firstWorksheet) {
            firstWorksheet.activate();
        }
    }

    /**
     * Get Default Active Sheet
     * @private
     */
    private _setDefaultActiveSheet(): void {
        if (this._worksheets.size > 0) {
            this._worksheets.forEach((sheet) => {
                sheet.setStatus(BooleanNumber.FALSE);
            });
            this._worksheets[0].setStatus(BooleanNumber.TRUE);
        }
    }

    /**
     * Get the range array based on the range string and sheet id
     *
     * @privateRemarks
     * zh: 根据范围字符串和sheet id取得范围数组
     *
     * @param txt - range string
     * @returns
     *
     * @internal
     */
    private _getCellRange(txt: IRangeStringData): IGridRange {
        let sheetTxt: string = '';
        let rangeTxt: string | string[] = '';
        if (txt.indexOf('!') > -1) {
            const val = txt.split('!');
            sheetTxt = val[0];
            rangeTxt = val[1];
            sheetTxt = sheetTxt.replace(/\\'/g, "'").replace(/''/g, "'");
            if (
                sheetTxt.substring(0, 1) === "'" &&
                sheetTxt.substring(sheetTxt.length - 1, 1) === "'"
            ) {
                sheetTxt = sheetTxt.substring(1, sheetTxt.length - 1);
            }
        } else {
            rangeTxt = txt;
        }
        if (rangeTxt.indexOf(':') === -1) {
            const row = parseInt(rangeTxt.replace(/[^0-9]/g, ''), 10) - 1;
            const col = Tools.ABCatNum(rangeTxt.replace(/[^A-Za-z]/g, ''));

            if (!Number.isNaN(row) && !Number.isNaN(col)) {
                const item = {
                    sheetId: sheetTxt,
                    rangeData: {
                        startRow: row,
                        endRow: row,
                        startColumn: col,
                        endColumn: col,
                    },
                };
                return item;
            }
            return DEFAULT_RANGE_ARRAY;
        }
        rangeTxt = rangeTxt.split(':');

        const row: IRowStartEndData = [0, 0];
        const col: IColumnStartEndData = [0, 0];
        const maxRow =
            this.getSheetBySheetName(sheetTxt)?.getMaxRows() ||
            this.getActiveSheet()?.getMaxRows();
        const maxCol =
            this.getSheetBySheetName(sheetTxt)?.getMaxColumns() ||
            this.getActiveSheet()?.getMaxColumns();
        row[0] = parseInt(rangeTxt[0].replace(/[^0-9]/g, ''), 10) - 1;
        row[1] = parseInt(rangeTxt[1].replace(/[^0-9]/g, ''), 10) - 1;

        if (Number.isNaN(row[0])) {
            row[0] = 0;
        }

        if (Number.isNaN(row[1])) {
            row[1] = maxRow!;
        }

        if (row[0] > row[1]) {
            return DEFAULT_RANGE_ARRAY;
        }
        col[0] = Tools.ABCatNum(rangeTxt[0].replace(/[^A-Za-z]/g, ''));
        col[1] = Tools.ABCatNum(rangeTxt[1].replace(/[^A-Za-z]/g, ''));
        if (Number.isNaN(col[0])) {
            col[0] = 0;
        }
        if (Number.isNaN(col[1])) {
            col[1] = maxCol!;
        }
        if (col[0] > col[1]) {
            return DEFAULT_RANGE_ARRAY;
        }

        const item = {
            sheetId: this.getSheetBySheetName(sheetTxt)?.getSheetId() || '',
            rangeData: {
                startRow: row[0],
                endRow: row[1],
                startColumn: col[0],
                endColumn: col[1],
            },
        };
        return item;
    }

    getUnitId() {
        return this._unitId;
    }

    getWorksheets(): Map<string, Worksheet> {
        return this._worksheets;
    }

    nextSheet(start: number): Nullable<Worksheet> {
        if (start >= 0) {
            const { sheetOrder } = this._config;
            for (let i = start; i < sheetOrder.length; i++) {
                const worksheet = this._worksheets.get(sheetOrder[i]);
                if (worksheet && !worksheet.isSheetHidden()) {
                    return worksheet;
                }
            }
            if (start < sheetOrder.length) {
                for (let i = start - 1; i >= 0; i--) {
                    const worksheet = this._worksheets.get(sheetOrder[i]);
                    if (worksheet && !worksheet.isSheetHidden()) {
                        return worksheet;
                    }
                }
            }
            return this._worksheets.get(sheetOrder[sheetOrder.length - 1]);
        }
    }

    setContext(context: SheetContext): void {
        this._context = context;
    }

    setCommandManager(commandManager: CommandManager): void {
        this._commandManager = commandManager;
    }

    insertSheet(): Nullable<string>;
    insertSheet(index: number): Nullable<string>;
    insertSheet(name: string): Nullable<string>;
    insertSheet(data: Partial<IWorksheetConfig>): Nullable<string>;
    insertSheet(sheet: Worksheet): Nullable<string>;
    insertSheet(name: string, index: number): Nullable<string>;
    insertSheet(index: number, data: Partial<IWorksheetConfig>): Nullable<string>;
    insertSheet(index: number, sheet: Worksheet): Nullable<string>;
    insertSheet(...argument: any[]): Nullable<string> {
        const { _context, _commandManager } = this;

        const before = _context.getContextObserver('onBeforeInsertSheetObservable');
        const after = _context.getContextObserver('onAfterInsertSheetObservable');

        // insert empty sheet
        if (Tools.hasLength(argument, 0)) {
            const worksheetConfig = {
                name: NameGen.getSheetName(),
                status: 0,
                id: nanoid(6),
            };
            const index = this.getSheetSize();
            before.notifyObservers({
                index,
                sheetId: worksheetConfig.id,
            });
            _commandManager.invoke(
                new Command(
                    {
                        WorkBookUnit: _context.getWorkBook(),
                    },
                    {
                        actionName: ACTION_NAMES.INSERT_SHEET_ACTION,
                        sheetId: worksheetConfig.id,
                        index,
                        sheet: worksheetConfig as IWorksheetConfig,
                    } as IInsertSheetActionData
                )
            );
            after.notifyObservers({
                index,
                sheetId: worksheetConfig.id,
            });
            return worksheetConfig.id;
        }

        if (Tools.hasLength(argument, 1)) {
            // insert clone worksheet instance
            if (Tools.isAssignableFrom(argument[0], Worksheet)) {
                const sheet = argument[0];
                const index = this.getSheetSize();
                const worksheetConfig = sheet.getConfig();
                worksheetConfig.id = nanoid(6);
                before.notifyObservers({
                    index,
                    sheetId: worksheetConfig.id,
                });
                _commandManager.invoke(
                    new Command(
                        {
                            WorkBookUnit: _context.getWorkBook(),
                        },
                        {
                            actionName: ACTION_NAMES.INSERT_SHEET_ACTION,
                            sheetId: worksheetConfig.id,
                            index,
                            sheet: worksheetConfig as IWorksheetConfig,
                        } as IInsertSheetActionData
                    )
                );
                after.notifyObservers({
                    index,
                    sheetId: worksheetConfig.id,
                });
                return worksheetConfig.id;
            }

            // insert sheet to index
            if (Tools.isNumber(argument[0])) {
                const index = argument[0];
                const worksheetConfig = {
                    name: NameGen.getSheetName(),
                    status: 0,
                    id: nanoid(6),
                };
                before.notifyObservers({
                    index,
                    sheetId: worksheetConfig.id,
                });
                _commandManager.invoke(
                    new Command(
                        {
                            WorkBookUnit: _context.getWorkBook(),
                        },
                        {
                            actionName: ACTION_NAMES.INSERT_SHEET_ACTION,
                            sheetId: worksheetConfig.id,
                            index,
                            sheet: worksheetConfig as IWorksheetConfig,
                        } as IInsertSheetActionData
                    )
                );
                after.notifyObservers({
                    index,
                    sheetId: worksheetConfig.id,
                });
                return worksheetConfig.id;
            }

            // insert sheet by sheet name
            if (Tools.isString(argument[0])) {
                const name = argument[0];
                const index = this.getSheetSize();
                const worksheetConfig = {
                    status: 0,
                    name,
                    id: nanoid(6),
                };
                before.notifyObservers({
                    index,
                    sheetId: worksheetConfig.id,
                });
                _commandManager.invoke(
                    new Command(
                        {
                            WorkBookUnit: _context.getWorkBook(),
                        },
                        {
                            actionName: ACTION_NAMES.INSERT_SHEET_ACTION,
                            sheetId: worksheetConfig.id,
                            index,
                            sheet: worksheetConfig as IWorksheetConfig,
                        } as IInsertSheetActionData
                    )
                );
                after.notifyObservers({
                    index,
                    sheetId: worksheetConfig.id,
                });
                return worksheetConfig.id;
            }

            // insert sheet by sheet config
            if (Tools.isPlainObject(argument[0])) {
                const worksheetConfig = argument[0] as IWorksheetConfig;
                const index = this.getSheetSize();
                before.notifyObservers({
                    index,
                    sheetId: worksheetConfig.id,
                });
                _commandManager.invoke(
                    new Command(
                        {
                            WorkBookUnit: _context.getWorkBook(),
                        },
                        {
                            actionName: ACTION_NAMES.INSERT_SHEET_ACTION,
                            sheetId: worksheetConfig.id,
                            index,
                            sheet: worksheetConfig as IWorksheetConfig,
                        } as IInsertSheetActionData
                    )
                );
                after.notifyObservers({
                    index,
                    sheetId: worksheetConfig.id,
                });
                return worksheetConfig.id;
            }
        }

        if (Tools.hasLength(argument, 2)) {
            // insert sheet name to index
            if (Tools.isString(argument[0])) {
                const name = argument[0];
                const index = argument[1];
                const worksheetConfig = {
                    status: 0,
                    name,
                    id: nanoid(6),
                };
                before.notifyObservers({
                    index,
                    sheetId: worksheetConfig.id,
                });
                _commandManager.invoke(
                    new Command(
                        {
                            WorkBookUnit: _context.getWorkBook(),
                        },
                        {
                            actionName: ACTION_NAMES.INSERT_SHEET_ACTION,
                            sheetId: worksheetConfig.id,
                            index,
                            sheet: worksheetConfig as IWorksheetConfig,
                        } as IInsertSheetActionData
                    )
                );
                after.notifyObservers({
                    index,
                    sheetId: worksheetConfig.id,
                });
                return worksheetConfig.id;
            }

            if (Tools.isNumber(argument[0])) {
                // insert clone worksheet instance to index
                if (Tools.isAssignableFrom(argument[1], Worksheet)) {
                    const index = argument[0];
                    const sheet = argument[1];
                    const worksheetConfig = sheet.getConfig();
                    worksheetConfig.id = nanoid(6);
                    before.notifyObservers({
                        index,
                        sheetId: worksheetConfig.id,
                    });
                    _commandManager.invoke(
                        new Command(
                            {
                                WorkBookUnit: _context.getWorkBook(),
                            },
                            {
                                actionName: ACTION_NAMES.INSERT_SHEET_ACTION,
                                sheetId: worksheetConfig.id,
                                index,
                                sheet: worksheetConfig as IWorksheetConfig,
                            } as IInsertSheetActionData
                        )
                    );
                    after.notifyObservers({
                        index,
                        sheetId: worksheetConfig.id,
                    });
                    return worksheetConfig.id;
                }
                if (Tools.isPlainObject(argument[1])) {
                    const index = argument[0];
                    const worksheetConfig = argument[1] as IWorksheetConfig;
                    before.notifyObservers({
                        index,
                        sheetId: worksheetConfig.id,
                    });
                    _commandManager.invoke(
                        new Command(
                            {
                                WorkBookUnit: _context.getWorkBook(),
                            },
                            {
                                actionName: ACTION_NAMES.INSERT_SHEET_ACTION,
                                sheetId: worksheetConfig.id,
                                index,
                                sheet: worksheetConfig as IWorksheetConfig,
                            } as IInsertSheetActionData
                        )
                    );
                    after.notifyObservers({
                        index,
                        sheetId: worksheetConfig.id,
                    });
                    return worksheetConfig.id;
                }
            }
        }
    }

    getActiveSpreadsheet(): Workbook {
        return this;
    }

    getStyles(): Styles {
        return this._styles;
    }

    getContext(): SheetContext {
        return this._context;
    }

    getConfig(): IWorkbookConfig {
        // const { _config } = this;
        // const sheets = {};
        // config中的sheets数据传递到WorkSheet后就交由WorkSheet管理，此处的config不再更新
        // sheetOrder.forEach((sheetId) => {
        //     const sheet = this._worksheets.get(sheetId) as WorkSheet;
        //     const config = sheet.getConfig();
        //     sheets[config.id] = config;
        // });
        // this._config.sheets = sheets;
        // this._config.styles = this._styles.toJSON();
        return this._config;
    }

    create(name: string, row: number, column: number): Worksheet;
    create(name: string): Worksheet;
    create(...argument: unknown[]): unknown {
        if (Tools.hasLength(argument, 1)) {
            const { _context } = this;
            const name = argument[0];
            const conf = { ...DEFAULT_WORKSHEET, name };
            const worksheet = new Worksheet(
                _context,
                conf as Partial<IWorksheetConfig>
            );
            this.insertSheet(worksheet);
            return worksheet;
        }
        if (Tools.hasLength(argument, 3)) {
            const { _context } = this;
            const name = argument[0];
            const rowCount = argument[1];
            const columnCount = argument[2];
            const conf = { ...DEFAULT_WORKSHEET, name, rowCount, columnCount };
            const worksheet = new Worksheet(
                _context,
                conf as Partial<IWorksheetConfig>
            );
            this.insertSheet(worksheet);
            return worksheet;
        }
    }

    setDefaultActiveSheet(): void {
        this._setDefaultActiveSheet();
    }

    getIndexBySheetId(sheetId: string): number {
        const { sheetOrder } = this._config;
        return sheetOrder.findIndex((id) => id === sheetId);
    }

    getActiveSheet(): Worksheet {
        const { sheetOrder } = this._config;
        const activeSheetId = sheetOrder.find((sheetId) => {
            const worksheet = this._worksheets.get(sheetId) as Worksheet;
            return worksheet.getStatus() === BooleanNumber.TRUE;
        });
        if (!activeSheetId) {
            console.warn('No active sheet, get first sheet');
            return this._worksheets[0];
        }
        return this._worksheets.get(activeSheetId) as Worksheet;
    }

    getActiveSheetIndex(): number {
        const { sheetOrder } = this._config;
        return sheetOrder.findIndex((sheetId) => {
            const worksheet = this._worksheets.get(sheetId) as Worksheet;
            if (worksheet.getStatus() === 1) {
                return true;
            }
            return false;
        });
    }

    getActiveRange(): Nullable<Range> {
        const workSheet = this.getActiveSheet();
        if (workSheet) {
            const selection = workSheet.getSelection();
            return selection.getActiveRange();
        }
        return null;
    }

    setActiveRange(range: Range): Nullable<Range> {
        const workSheet = this.getActiveSheet();
        if (workSheet) {
            return workSheet.setActiveSelection(range);
        }
        return null;
    }

    setActiveRangeList(rangeList: IRangeType[]): Nullable<IRangeData[]> {
        const workSheet = this.getActiveSheet();
        if (workSheet) {
            const activeRangeList = workSheet.getRangeList(rangeList);
            activeRangeList.activate();
            return activeRangeList.getRangeList();
        }
        return null;
    }

    getActiveRangeList(): Nullable<RangeList> {
        const workSheet = this.getActiveSheet();
        if (workSheet) {
            const selection = workSheet.getSelection();
            return selection.getActiveRangeList();
        }
        return null;
    }

    getSelection(): Nullable<Selection> {
        const workSheet = this.getActiveSheet();
        if (workSheet) {
            return workSheet.getSelection();
        }
    }

    getCurrentCell(): Nullable<Range> {
        const selection = this.getSelection();
        if (selection) {
            return selection.getCurrentCell();
        }
    }

    getSheetSize(): number {
        return this._config.sheetOrder.length;
    }

    /**
     * Sets the specified cell as the current cell.
     * @param cell
     */
    setCurrentCell(cell: Range): Range {
        return cell.activateAsCurrentCell();
    }

    /**
     * Applies all pending Sheets changes.
     *
     * @returns void
     */
    flush(): void {}

    setSheetOrder(sheetId: string, order: number): void {
        // const { _sheetOrder } = this;
        // const exclude = _sheetOrder.filter((currentId) => currentId !== sheetId);
        // exclude.splice(order, 0, sheetId);
        // this._sheetOrder = exclude;
        const { _context, _commandManager } = this;
        const observer = _context.getContextObserver('onSheetOrderObservable');
        const config: ISetSheetOrderActionData = {
            actionName: ACTION_NAMES.SET_SHEET_ORDER_ACTION,
            sheetId,
            order,
        };
        const command = new Command(
            {
                WorkBookUnit: _context.getWorkBook(),
            },
            config
        );
        _commandManager.invoke(command);
        observer.notifyObservers();
    }

    getSheets(): Worksheet[] {
        const { sheetOrder } = this._config;
        return sheetOrder.map((sheetId) =>
            this._worksheets.get(sheetId)
        ) as Worksheet[];
    }

    getSheetIndex(sheet: Worksheet): number {
        const { sheetOrder } = this._config;
        return sheetOrder.findIndex((sheetId) => {
            if (sheet.getSheetId() === sheetId) {
                return true;
            }
            return false;
        });
    }

    removeSheetBySheetId(sheetId: string): void {
        const { _commandManager, _config } = this;
        const { sheetOrder } = _config;
        const sheet = this.getSheetBySheetId(sheetId);

        if (sheetOrder.length > 1 && sheet != null) {
            const index = this.getSheetIndex(sheet);
            const before = this.getContext().getContextObserver(
                'onBeforeRemoveSheetObservable'
            );
            const after = this.getContext().getContextObserver(
                'onAfterRemoveSheetObservable'
            );

            before.notifyObservers({
                index,
            });

            _commandManager.invoke(
                new Command(
                    {
                        WorkBookUnit: this,
                    },
                    {
                        actionName: ACTION_NAMES.REMOVE_SHEET_ACTION,
                        sheetId,
                    } as IRemoveSheetActionData
                )
            );

            const needSwitch = sheet.getStatus() === BooleanNumber.TRUE;
            if (needSwitch) {
                const nextSheet = this.nextSheet(index);
                if (nextSheet) {
                    nextSheet.activate();
                }
            }
            after.notifyObservers({ index, sheetId });
        }
    }

    getSheetBySheetName(name: string): Nullable<Worksheet> {
        const { sheetOrder } = this._config;
        const sheetId = sheetOrder.find((sheetId) => {
            const worksheet = this._worksheets.get(sheetId) as Worksheet;
            return worksheet.getName() === name;
        }) as string;
        return this._worksheets.get(sheetId);
    }

    getSheetBySheetId(sheetId: string): Nullable<Worksheet> {
        return this._worksheets.get(sheetId);
    }

    /**
     * Sets the active sheet in a spreadsheet. The Google Sheets UI displays the chosen sheet unless the sheet belongs to a different spreadsheet.
     *
     * @param sheet - The new active sheet.
     * @returns {@link WorkSheet } the sheet that has been made the new active sheet
     */
    setActiveSheet(sheet: Worksheet): Worksheet;
    /**
     * Sets the active sheet in a spreadsheet, with the option to restore the most recent selection within that sheet. The Google Sheets UI displays the chosen sheet unless the sheet belongs to a different spreadsheet.
     * @param sheet - The new active sheet.
     * @param restoreSelection - If true, the most recent selection of the new active sheet becomes selected again as the new sheet becomes active; if false, the new sheet becomes active without changing the current selection.
     * @returns {@link WorkSheet} - the new active sheet
     */
    setActiveSheet(sheet: Worksheet, restoreSelection: boolean): Worksheet;
    setActiveSheet(...argument: any): Worksheet {
        let restoreSelection = false;
        const worksheet: Worksheet = argument[0];
        if (Tuples.checkup(argument, Worksheet, Tuples.BOOLEAN_TYPE)) {
            restoreSelection = argument[1];
        }

        worksheet.activate();

        // restore selection
        if (restoreSelection) {
            worksheet.setActiveSelection();
        }

        return worksheet;
    }

    // getFormatManager(): FormatManager {
    //     return this._formatManage;
    // }

    getCommandManager(): CommandManager {
        return this._commandManager;
    }

    getPluginMeta<T>(name: string): T {
        return this._config.pluginMeta[name];
    }

    setPluginMeta<T>(name: string, value: T) {
        if (!this._config.pluginMeta) {
            this._config.pluginMeta = {};
        }
        return (this._config.pluginMeta[name] = value);
    }

    /**
     * Creates a builder for a conditional formatting rule.
     */
    // newConditionalFormatRule(): ConditionalFormatRuleBuilder {
    //     return new ConditionalFormatRuleBuilder();
    // }

    // newFilterCriteria(): FilterCriteriaBuilder {
    //     return new FilterCriteriaBuilder();
    // }

    static isIRangeType(range: IRangeType | IRangeType[]): Boolean {
        return typeof range === 'string' || 'startRow' in range || 'row' in range;
    }

    /**
     * transform any range type to range data
     *
     * @remarks
     * e.g.,
     * "A1:B1", "Sheet2!A1:B1"
     *
     * or
     *
     * {
     *  row:[0,1],
     *  column:[0,1]
     * }
     *
     * or
     *
     * {
     *    startRow:0 ,
     *    startColumn:0,
     *    endRow:1,
     *    endColumn:1,
     * }
     *
     * to
     *
     * {
     *    startRow:0 ,
     *    startColumn:0,
     *    endRow:1,
     *    endColumn:1,
     * }
     *
     *   IRangeType[] is to prevent type detection
     *
     * @param range support all range types
     *
     * @returns range data
     */
    transformRangeType(range: IRangeType | IRangeType[]): IGridRange {
        if (typeof range === 'string') {
            const gridRange = this._getCellRange(range);
            return gridRange;
        }
        if (typeof range !== 'string' && 'row' in range) {
            return {
                sheetId: '',
                rangeData: {
                    startRow: range.row[0],
                    startColumn: range.column[0],
                    endRow: range.row[1],
                    endColumn: range.column[1],
                },
            };
            // ref : https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-the-in-operator
        }
        if (typeof range !== 'string' && 'startRow' in range) {
            return { sheetId: '', rangeData: range };
        }

        return DEFAULT_RANGE_ARRAY;
    }

    /**
     *
     * @param rangeData
     * @returns
     */
    static rangeDataToRangeStringData(rangeData: IRangeData) {
        const { startRow, endRow, startColumn, endColumn } = rangeData;

        return `${Tools.chatAtABC(startColumn) + (startRow + 1)}:${Tools.chatAtABC(
            endColumn
        )}${endRow + 1}`;
    }

    load(config: IWorkbookConfig) {
        // TODO: new Command
        this._config = config;
    }

    save(): IWorkbookConfig {
        // TODO
        return this._config;
    }
}
