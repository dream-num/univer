import { forwardRef, Inject, Injector } from '@wendellhu/redi';

import { ObserverManager } from '../../Observer';
import { ICurrentUniverService } from '../../services/current.service';
import { GenName, Nullable, Tools } from '../../Shared';
import { DEFAULT_RANGE_ARRAY, DEFAULT_WORKBOOK, DEFAULT_WORKSHEET } from '../../Types/Const';
import { BooleanNumber } from '../../Types/Enum';
import {
    IColumnStartEndData,
    IGridRange,
    IRangeArrayData,
    IRangeStringData,
    IRangeType,
    IRowStartEndData,
    ISelectionRange,
    IWorkbookConfig,
} from '../../Types/Interfaces';
import { Styles } from './Styles';
import { Worksheet } from './Worksheet';

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

    constructor(
        workbookData: Partial<IWorkbookConfig> = {},
        @ICurrentUniverService private readonly _currentUniverService: ICurrentUniverService,
        @Inject(forwardRef(() => GenName)) private readonly _genName: GenName,
        @Inject(ObserverManager) private readonly _observerManager: ObserverManager,
        @Inject(Injector) readonly _injector: Injector
    ) {
        this._config = Tools.commonExtend(DEFAULT_WORKBOOK, workbookData);

        const { styles } = this._config;
        if (this._config.id == null || this._config.id.length === 0) {
            this._config.id = Tools.generateRandomId(6);
        }

        this._unitId = this._config.id;
        this._styles = new Styles(styles);
        this._worksheets = new Map<string, Worksheet>();

        this._getDefaultWorkSheet();
    }

    /**
     *
     * @param rangeData
     * @returns
     */
    static rangeDataToRangeStringData(rangeData: ISelectionRange) {
        const { startRow, endRow, startColumn, endColumn } = rangeData;

        return `${Tools.chatAtABC(startColumn) + (startRow + 1)}:${Tools.chatAtABC(endColumn)}${endRow + 1}`;
    }

    static isIRangeType(range: IRangeType | IRangeType[]): Boolean {
        return typeof range === 'string' || 'startRow' in range || 'row' in range;
    }

    getUnitId() {
        return this._unitId;
    }

    getWorksheets(): Map<string, Worksheet> {
        return this._worksheets;
    }

    getActiveSpreadsheet(): Workbook {
        return this;
    }

    getStyles(): Styles {
        return this._styles;
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
            return this._worksheets.get(sheetOrder[0]) as Worksheet;
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

    // getActiveRange(): Nullable<Range> {
    //     const workSheet = this.getActiveSheet();
    //     if (workSheet) {
    //         const selection = workSheet.getSelection();
    //         return selection.getActiveRange();
    //     }
    //     return null;
    // }

    // setActiveRange(range: Range): Nullable<Range> {
    //     const workSheet = this.getActiveSheet();
    //     if (workSheet) {
    //         return workSheet.setActiveSelection(range);
    //     }
    //     return null;
    // }

    setActiveRangeList(rangeList: IRangeType[]): Nullable<ISelectionRange[]> {
        const workSheet = this.getActiveSheet();
        if (workSheet) {
            const activeRangeList = workSheet.getRangeList(rangeList);
            activeRangeList.activate();
            return activeRangeList.getRangeList();
        }
        return null;
    }

    // getActiveRangeList(): Nullable<RangeList> {
    //     const workSheet = this.getActiveSheet();
    //     if (workSheet) {
    //         const selection = workSheet.getSelection();
    //         return selection.getActiveRangeList();
    //     }
    //     return null;
    // }

    // getSelection(): Nullable<Selection> {
    //     const workSheet = this.getActiveSheet();
    //     if (workSheet) {
    //         return workSheet.getSelection();
    //     }
    // }

    // getCurrentCell(): Nullable<Range> {
    //     const selection = this.getSelection();
    //     if (selection) {
    //         return selection.getCurrentCell();
    //     }
    // }

    getSheetSize(): number {
        return this._config.sheetOrder.length;
    }

    /**
     * Applies all pending Sheets changes.
     *
     * @returns void
     */
    flush(): void {
        //TDOO ..
    }

    getSheets(): Worksheet[] {
        const { sheetOrder } = this._config;
        return sheetOrder.map((sheetId) => this._worksheets.get(sheetId)) as Worksheet[];
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

    // getPluginMeta<T>(name: string): T {
    //     return this._config.pluginMeta[name];
    // }

    // setPluginMeta<T>(name: string, value: T) {
    //     if (!this._config.pluginMeta) {
    //         this._config.pluginMeta = {};
    //     }
    //     return (this._config.pluginMeta[name] = value);
    // }

    /**
     * Creates a builder for a conditional formatting rule.
     */
    // newConditionalFormatRule(): ConditionalFormatRuleBuilder {
    //     return new ConditionalFormatRuleBuilder();
    // }

    // newFilterCriteria(): FilterCriteriaBuilder {
    //     return new FilterCriteriaBuilder();
    // }

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
            const rangeArrayData = range as IRangeArrayData;
            return {
                sheetId: '',
                rangeData: {
                    startRow: rangeArrayData.row[0],
                    startColumn: rangeArrayData.column[0],
                    endRow: rangeArrayData.row[1],
                    endColumn: rangeArrayData.column[1],
                },
            };
            // ref : https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-the-in-operator
        }
        if (typeof range !== 'string' && 'startRow' in range) {
            return { sheetId: '', rangeData: range };
        }
        return DEFAULT_RANGE_ARRAY;
    }

    load(config: IWorkbookConfig) {
        // TODO: new Command
        this._config = config;
    }

    save(): IWorkbookConfig {
        // TODO
        return this._config;
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
            if (sheetTxt.substring(0, 1) === "'" && sheetTxt.substring(sheetTxt.length - 1, 1) === "'") {
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
        const maxRow = this.getSheetBySheetName(sheetTxt)?.getMaxRows() || this.getActiveSheet()?.getMaxRows();
        const maxCol = this.getSheetBySheetName(sheetTxt)?.getMaxColumns() || this.getActiveSheet()?.getMaxColumns();
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

    /**
     * Get Default Sheet
     * @private
     */
    private _getDefaultWorkSheet(): void {
        const { _config, _worksheets } = this;
        const { sheets, sheetOrder } = _config;

        // One worksheet by default
        if (Tools.isEmptyObject(sheets)) {
            sheets[DEFAULT_WORKSHEET.id] = Object.assign(DEFAULT_WORKSHEET, {
                status: BooleanNumber.TRUE,
            });
        }

        let firstWorksheet = null;

        for (const sheetId in sheets) {
            const config = sheets[sheetId];
            config.name = this._genName.sheetName(config.name);
            const worksheet = new Worksheet(config, this._observerManager, this._currentUniverService);
            _worksheets.set(sheetId, worksheet);
            if (!sheetOrder.includes(sheetId)) {
                sheetOrder.push(sheetId);
            }
            if (firstWorksheet == null) {
                firstWorksheet = worksheet;
            }
        }

        // if (firstWorksheet) {
        //     firstWorksheet.activate();
        // }
    }
}
