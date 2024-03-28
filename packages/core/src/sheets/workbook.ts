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

import { BehaviorSubject, Subject } from 'rxjs';

import { ILogService } from '../services/log/log.service';
import type { Nullable } from '../shared';
import { Tools } from '../shared';
import { Disposable } from '../shared/lifecycle';
import { DEFAULT_RANGE_ARRAY, DEFAULT_WORKBOOK } from '../types/const';
import { BooleanNumber } from '../types/enum';
import type {
    IColumnStartEndData,
    IGridRange,
    IRangeArrayData,
    IRangeStringData,
    IRangeType,
    IRowStartEndData,
    IWorkbookData,
    IWorksheetData,
} from '../types/interfaces';
import { Styles } from './styles';
import { Worksheet } from './worksheet';

export function getWorksheetUID(workbook: Workbook, worksheet: Worksheet): string {
    return `${workbook.getUnitId()}|${worksheet.getSheetId()}`;
}

/**
 * Access and create Univer Sheets files
 */
export class Workbook extends Disposable {
    private readonly _sheetCreated$ = new Subject<Worksheet>();
    readonly sheetCreated$ = this._sheetCreated$.asObservable();

    private readonly _sheetDisposed$ = new Subject<Worksheet>();
    readonly sheetDisposed$ = this._sheetDisposed$.asObservable();

    private readonly _activeSheet$ = new BehaviorSubject<Nullable<Worksheet>>(null);
    private get _activeSheet(): Nullable<Worksheet> { return this._activeSheet$.getValue(); }
    readonly activeSheet$ = this._activeSheet$.asObservable();

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

    private _snapshot: IWorkbookData;

    private _unitId: string;

    private _count: number;

    get name(): string {
        return this._snapshot.name;
    }

    constructor(
        workbookData: Partial<IWorkbookData> = {},
        @ILogService private readonly _logService: ILogService
    ) {
        super();

        this._snapshot = Tools.commonExtend(DEFAULT_WORKBOOK, workbookData);

        const { styles } = this._snapshot;
        if (this._snapshot.id == null || this._snapshot.id.length === 0) {
            this._snapshot.id = Tools.generateRandomId(6);
        }

        this._unitId = this._snapshot.id;
        this._styles = new Styles(styles);
        this._count = 1;
        this._worksheets = new Map<string, Worksheet>();

        this._passWorksheetSnapshots();
    }

    override dispose(): void {
        super.dispose();

        this._sheetCreated$.complete();
        this._sheetDisposed$.complete();
        this._activeSheet$.complete();
    }

    save(): IWorkbookData {
        return Tools.deepClone(this._snapshot);
    }

    static isIRangeType(range: IRangeType | IRangeType[]): boolean {
        return typeof range === 'string' || 'startRow' in range || 'row' in range;
    }

    getSnapshot(): IWorkbookData {
        return this._snapshot;
    }

    getName(): string {
        return this._snapshot.name;
    }

    getUnitId() {
        return this._unitId;
    }

    getRev(): number {
        return this._snapshot.rev ?? 1; // the revision number should start with one
    }

    incrementRev(): void {
        this._snapshot.rev = this.getRev() + 1;
    }

    getShouldRenderLoopImmediately() {
        const should = this._snapshot.shouldStartRenderingImmediately;
        return should !== false;
    }

    getContainer() {
        return this._snapshot.container;
    }

    /**
     * Add a Worksheet into Workbook.
     */
    addWorksheet(id: string, index: number, worksheetSnapshot: Partial<IWorksheetData>): boolean {
        const { sheets, sheetOrder } = this._snapshot;
        if (sheets[id]) {
            return false;
        }

        sheets[id] = worksheetSnapshot;
        sheetOrder.splice(index, 0, id);
        const worksheet = new Worksheet(this._unitId, worksheetSnapshot, this._styles);
        this._worksheets.set(id, worksheet);
        this._sheetCreated$.next(worksheet);

        return true;
    }

    getParentRenderUnitId() {
        return this._snapshot.parentRenderUnitId;
    }

    getSheetOrders(): Readonly<string[]> {
        return this._snapshot.sheetOrder;
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

    getConfig(): IWorkbookData {
        return this._snapshot;
    }

    getIndexBySheetId(sheetId: string): number {
        const { sheetOrder } = this._snapshot;
        return sheetOrder.findIndex((id) => id === sheetId);
    }

    /**
     *
     * @returns
     */
    getRawActiveSheet(): Nullable<Worksheet> {
        return this._activeSheet;
    }

    /**
     * Get the active sheet. If there is no active sheet, the first sheet would
     * be set active.
     */
    getActiveSheet(): Worksheet {
        const currentActive = this.getRawActiveSheet();
        if (currentActive) {
            return currentActive;
        }

        /**
         * If the first sheet is hidden, we should set the first unhidden sheet to be active.
         */
        const sheetOrder = this._snapshot.sheetOrder;
        for (let i = 0, len = sheetOrder.length; i < len; i++) {
            const worksheet = this._worksheets.get(sheetOrder[i]);
            if (worksheet && worksheet.isSheetHidden() !== BooleanNumber.TRUE) {
                this.setActiveSheet(worksheet);
                return worksheet;
            }
        }

        const worksheet = this._worksheets.get(sheetOrder[0])!;
        this.setActiveSheet(worksheet);
        return worksheet;
    }

    setActiveSheet(worksheet: Nullable<Worksheet>): void {
        this._activeSheet$.next(worksheet);
    }

    removeSheet(sheetId: string): boolean {
        const sheetToRemove = this._worksheets.get(sheetId);
        if (!sheetToRemove) {
            return false;
        }

        if (this._activeSheet?.getSheetId() === sheetId) {
            this.setActiveSheet(null);
        }

        this._worksheets.delete(sheetId);
        this._snapshot.sheetOrder.splice(this._snapshot.sheetOrder.indexOf(sheetId), 1);
        delete this._snapshot.sheets[sheetId];

        return true;
    }

    getActiveSheetIndex(): number {
        const { sheetOrder } = this._snapshot;
        return sheetOrder.findIndex((sheetId) => {
            const worksheet = this._worksheets.get(sheetId)!;
            return worksheet === this._activeSheet;
        });
    }

    getSheetSize(): number {
        return this._snapshot.sheetOrder.length;
    }

    getSheets(): Worksheet[] {
        const { sheetOrder } = this._snapshot;

        return sheetOrder.map((sheetId) => this._worksheets.get(sheetId)) as Worksheet[];
    }

    getSheetsName(): string[] {
        const { sheetOrder } = this._snapshot;

        const names: string[] = [];

        sheetOrder.forEach((sheetId) => {
            const worksheet = this._worksheets.get(sheetId);
            if (worksheet) {
                names.push(worksheet.getName());
            }
        });

        return names;
    }

    getSheetIndex(sheet: Worksheet): number {
        const { sheetOrder } = this._snapshot;

        return sheetOrder.findIndex((sheetId) => {
            if (sheet.getSheetId() === sheetId) {
                return true;
            }
            return false;
        });
    }

    getSheetBySheetName(name: string): Nullable<Worksheet> {
        const { sheetOrder } = this._snapshot;
        const sheetId = sheetOrder.find((sheetId) => {
            const worksheet = this._worksheets.get(sheetId) as Worksheet;
            return worksheet.getName() === name;
        }) as string;
        return this._worksheets.get(sheetId);
    }

    getSheetBySheetId(sheetId: string): Nullable<Worksheet> {
        return this._worksheets.get(sheetId);
    }

    getSheetByIndex(index: number): Nullable<Worksheet> {
        const { sheetOrder } = this._snapshot;
        return this._worksheets.get(sheetOrder[index]);
    }

    getHiddenWorksheets(): string[] {
        return this.getSheets()
            .filter((s) => s.getConfig().hidden === BooleanNumber.TRUE)
            .map((s) => s.getConfig().id);
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
            const rangeArrayData = range as IRangeArrayData;
            return {
                sheetId: '',
                range: {
                    startRow: rangeArrayData.row[0],
                    startColumn: rangeArrayData.column[0],
                    endRow: rangeArrayData.row[1],
                    endColumn: rangeArrayData.column[1],
                },
            };
            // ref : https://www.typescriptlang.org/docs/handbook/advanced-types.html#using-the-in-operator
        }
        if (typeof range !== 'string' && 'startRow' in range) {
            return { sheetId: '', range };
        }
        return DEFAULT_RANGE_ARRAY;
    }

    load(config: IWorkbookData) {
        // TODO: new Command
        this._snapshot = config;
    }

    /**
     * Check if sheet name is unique
     * @param name sheet name
     * @returns True if sheet name is unique
     */
    checkSheetName(name: string): boolean {
        const sheetsName = this.getSheetsName();
        return sheetsName.includes(name);
    }

    /**
     *  Check whether the sheet name is unique and generate a new unique sheet name
     * @param name sheet name
     * @returns Unique sheet name
     */
    uniqueSheetName(name: string = 'Sheet1'): string {
        let output = name;
        while (this.checkSheetName(output)) {
            output = name + this._count;
            this._count++;
        }
        return output;
    }

    /**
     * Automatically generate new sheet name
     * @param name sheet name
     * @returns New sheet name
     */
    generateNewSheetName(name: string) {
        let output = name + this._count;
        while (this.checkSheetName(output)) {
            output = name + this._count;
            this._count++;
        }
        return output;
    }

    /**
     * Get the range array based on the range string and sheet id
     *
     * @param txt - range string
     * @returns
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
            const row = Number.parseInt(rangeTxt.replace(/[^0-9]/g, ''), 10) - 1;
            const col = Tools.ABCatNum(rangeTxt.replace(/[^A-Za-z]/g, ''));

            if (!Number.isNaN(row) && !Number.isNaN(col)) {
                const item = {
                    sheetId: sheetTxt,
                    range: {
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
        row[0] = Number.parseInt(rangeTxt[0].replace(/[^0-9]/g, ''), 10) - 1;
        row[1] = Number.parseInt(rangeTxt[1].replace(/[^0-9]/g, ''), 10) - 1;

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
            range: {
                startRow: row[0],
                endRow: row[1],
                startColumn: col[0],
                endColumn: col[1],
            },
        };
        return item;
    }

    // FIXME: now we always create worksheet from DEFAULT_WORKSHEET?

    /**
     * Get Default Sheet
     */
    private _passWorksheetSnapshots(): void {
        const { _snapshot, _worksheets } = this;
        const { sheets, sheetOrder } = _snapshot;

        // If there's no sheets in the snapshot, we should create one.
        if (Tools.isEmptyObject(sheets)) {
            const firstSheetId = Tools.generateRandomId();
            sheets[firstSheetId] = { id: firstSheetId };
        }

        // Pass all existing sheets.
        for (const sheetId in sheets) {
            const worksheetSnapshot = sheets[sheetId];
            const { name } = worksheetSnapshot;

            worksheetSnapshot.name = this.uniqueSheetName(name);
            if (worksheetSnapshot.name !== name) {
                this._logService.debug('[Workbook]', `The worksheet name ${name} is duplicated, we changed it to ${worksheetSnapshot.name}. Please fix the problem in your snapshot.`);
            }

            const worksheet = new Worksheet(this._unitId, worksheetSnapshot, this._styles);
            _worksheets.set(sheetId, worksheet);

            if (!sheetOrder.includes(sheetId)) {
                sheetOrder.push(sheetId);
            }
        }
    }
}
