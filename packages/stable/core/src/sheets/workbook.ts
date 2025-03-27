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

import type { Observable } from 'rxjs';
import type { Nullable } from '../shared';

import type { CustomData, IRangeType, IWorkbookData, IWorksheetData } from './typedef';
import { BehaviorSubject, Subject } from 'rxjs';
import { UnitModel, UniverInstanceType } from '../common/unit';
import { ILogService } from '../services/log/log.service';
import { Tools } from '../shared';
import { BooleanNumber } from '../types/enum';
import { getEmptySnapshot } from './empty-snapshot';
import { Styles } from './styles';
import { Worksheet } from './worksheet';

export function getWorksheetUID(workbook: Workbook, worksheet: Worksheet): string {
    return `${workbook.getUnitId()}|${worksheet.getSheetId()}`;
}

/**
 * Access and create Univer Sheets files
 */
export class Workbook extends UnitModel<IWorkbookData, UniverInstanceType.UNIVER_SHEET> {
    override type: UniverInstanceType.UNIVER_SHEET = UniverInstanceType.UNIVER_SHEET;

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

    private readonly _name$: BehaviorSubject<string>;
    readonly name$: Observable<string>;
    get name(): string {
        return this._name$.getValue();
    }

    static isIRangeType(range: IRangeType | IRangeType[]): boolean {
        return typeof range === 'string' || 'startRow' in range || 'row' in range;
    }

    constructor(
        workbookData: Partial<IWorkbookData> = {},
        @ILogService private readonly _logService: ILogService
    ) {
        super();

        const DEFAULT_WORKBOOK = getEmptySnapshot();
        if (Tools.isEmptyObject(workbookData)) {
            this._snapshot = DEFAULT_WORKBOOK;
        } else {
            this._snapshot = Tools.commonExtend(DEFAULT_WORKBOOK, workbookData);
        }

        const { styles } = this._snapshot;
        if (this._snapshot.id == null || this._snapshot.id.length === 0) {
            this._snapshot.id = Tools.generateRandomId(6);
        }

        this._unitId = this._snapshot.id;
        this._styles = new Styles(styles);
        this._count = 1;
        this._worksheets = new Map<string, Worksheet>();

        this._name$ = new BehaviorSubject(workbookData.name || '');
        this.name$ = this._name$.asObservable();

        this._parseWorksheetSnapshots();
    }

    override dispose(): void {
        super.dispose();

        this._sheetCreated$.complete();
        this._sheetDisposed$.complete();
        this._activeSheet$.complete();
        this._name$.complete();
    }

    /**
     * Create a clone of the current snapshot.
     * Call resourceLoaderService.saveWorkbook to save the data associated with the current plugin if needed.
     * @memberof Workbook
     */
    save(): IWorkbookData {
        return Tools.deepClone(this._snapshot);
    }

    /**
     * Get current snapshot reference.
     * Call resourceLoaderService.saveWorkbook to save the data associated with the current plugin if needed.
     * @return {*}  {IWorkbookData}
     * @memberof Workbook
     */
    getSnapshot(): IWorkbookData {
        return this._snapshot;
    }

    /** @deprecated use use name property instead */
    getName(): string {
        return this._snapshot.name;
    }

    setName(name: string): void {
        this._name$.next(name);
        this._snapshot.name = name;
    }

    getUnitId() {
        return this._unitId;
    }

    override getRev(): number {
        return this._snapshot.rev ?? 1; // the revision number should start with one
    }

    override incrementRev(): void {
        this._snapshot.rev = this.getRev() + 1;
    }

    override setRev(rev: number): void {
        this._snapshot.rev = rev;
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
     * Get the active sheet.
     */
    getActiveSheet(): Worksheet;
    getActiveSheet(allowNull: true): Nullable<Worksheet>;
    getActiveSheet(allowNull?: true): Nullable<Worksheet> {
        if (!this._activeSheet && typeof allowNull === 'undefined') {
            throw new Error(`[Workbook]: no active Worksheet on Workbook ${this._unitId}!`);
        }

        return this._activeSheet;
    }

    /**
     * If there is no active sheet, the first sheet would
     * be set active.
     * @returns
     */
    ensureActiveSheet() {
        const currentActive = this._activeSheet;
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

    /**
     * ActiveSheet should not be null!
     * There is at least one sheet in a workbook. You can not delete all sheets in a workbook.
     * @param worksheet
     */
    setActiveSheet(worksheet: Worksheet): void {
        this._activeSheet$.next(worksheet);
    }

    removeSheet(sheetId: string): boolean {
        const sheetToRemove = this._worksheets.get(sheetId);
        if (!sheetToRemove) {
            return false;
        }

        this._worksheets.delete(sheetId);
        this._snapshot.sheetOrder.splice(this._snapshot.sheetOrder.indexOf(sheetId), 1);
        delete this._snapshot.sheets[sheetId];
        this._sheetDisposed$.next(sheetToRemove);

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

    getUnhiddenWorksheets(): string[] {
        return this.getSheets()
            .filter((s) => s.getConfig().hidden !== BooleanNumber.TRUE)
            .map((s) => s.getConfig().id);
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

    // FIXME: now we always create worksheet from DEFAULT_WORKSHEET?

    /**
     * Get Default Sheet
     */
    private _parseWorksheetSnapshots(): void {
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

        // Active the first sheet.
        this.ensureActiveSheet();
    }

    /**
     * Get custom metadata of workbook
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
