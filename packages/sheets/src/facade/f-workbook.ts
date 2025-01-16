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

import type { CommandListener, CustomData, ICommandInfo, IDisposable, IRange, IWorkbookData, LocaleType, Workbook } from '@univerjs/core';
import type { ISetDefinedNameMutationParam } from '@univerjs/engine-formula';
import type { ISetSelectionsOperationParams, ISheetCommandSharedParams, RangeThemeStyle } from '@univerjs/sheets';
import type { FontLine as _FontLine } from './f-range';
import { FBaseInitialable, ICommandService, ILogService, Inject, Injector, IPermissionService, IResourceLoaderService, IUniverInstanceService, LocaleService, mergeWorksheetSnapshotWithDefault, RedoCommand, toDisposable, UndoCommand, UniverInstanceType } from '@univerjs/core';
import { IDefinedNamesService } from '@univerjs/engine-formula';
import { CopySheetCommand, getPrimaryForRange, InsertSheetCommand, RegisterWorksheetRangeThemeStyleCommand, RemoveSheetCommand, SCOPE_WORKBOOK_VALUE_DEFINED_NAME, SetDefinedNameCommand, SetSelectionsOperation, SetWorksheetActiveOperation, SetWorksheetOrderCommand, SheetRangeThemeService, SheetsSelectionsService, UnregisterWorksheetRangeThemeStyleCommand, WorkbookEditablePermission } from '@univerjs/sheets';
import { FDefinedName, FDefinedNameBuilder } from './f-defined-name';
import { FPermission } from './f-permission';
import { FRange } from './f-range';
import { FWorksheet } from './f-worksheet';

export class FWorkbook extends FBaseInitialable {
    readonly id: string;

    constructor(
        protected readonly _workbook: Workbook,
        @Inject(Injector) protected override readonly _injector: Injector,
        @Inject(IResourceLoaderService) protected readonly _resourceLoaderService: IResourceLoaderService,
        @Inject(SheetsSelectionsService) protected readonly _selectionManagerService: SheetsSelectionsService,
        @IUniverInstanceService protected readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService protected readonly _commandService: ICommandService,
        @IPermissionService protected readonly _permissionService: IPermissionService,
        @ILogService protected readonly _logService: ILogService,
        @Inject(LocaleService) protected readonly _localeService: LocaleService,
        @IDefinedNamesService protected readonly _definedNamesService: IDefinedNamesService
    ) {
        super(_injector);

        this.id = this._workbook.getUnitId();
    }

    /**
     * Get the Workbook instance.
     * @returns {Workbook} The Workbook instance.
     * @example
     * ```ts
     * // The code below gets the Workbook instance
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const workbook = activeSpreadsheet.getWorkbook();
     * ```
     */
    getWorkbook(): Workbook {
        return this._workbook;
    }

    /**
     * Get the id of the workbook.
     * @returns {string} The id of the workbook.
     * @example
     * ```ts
     * // The code below gets the id of the workbook
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const id = activeSpreadsheet.getId();
     * ```
     */
    getId(): string {
        return this.id;
    }

    /**
     * Get the name of the workbook.
     * @returns {string} The name of the workbook.
     * @example
     * ```ts
     * // The code below gets the name of the workbook
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const name = activeSpreadsheet.getName();
     * ```
     */
    getName(): string {
        return this._workbook.name;
    }

    /**
     * Set the name of the workbook.
     * @param {string} name The new name of the workbook.
     * @returns {void}
     * @example
     * ```ts
     * // The code below sets the name of the workbook
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * activeSpreadsheet.setName('MyWorkbook');
     * ```
     */
    setName(name: string): void {
        this._workbook.setName(name);
    }

    /**
     * Save workbook snapshot data, including conditional formatting, data validation, and other plugin data.
     * @returns {IWorkbookData} Workbook snapshot data
     * @example
     * ```ts
     * // The code below saves the workbook snapshot data
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const snapshot = activeSpreadsheet.save();
     * ```
     */
    save(): IWorkbookData {
        const snapshot = this._resourceLoaderService.saveUnit<IWorkbookData>(this._workbook.getUnitId())!;
        return snapshot;
    }

    /**
     * @deprecated use 'save' instead.
     * @returns {IWorkbookData} Workbook snapshot data
     * @memberof FWorkbook
     * @example
     * ```ts
     * // The code below saves the workbook snapshot data
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const snapshot = activeSpreadsheet.getSnapshot();
     * ```
     */
    getSnapshot(): IWorkbookData {
        this._logService.warn('use \'save\' instead of \'getSnapshot\'');
        return this.save();
    }

    /**
     * Get the active sheet of the workbook.
     * @returns {FWorksheet} The active sheet of the workbook
     * @example
     * ```ts
     * // The code below gets the active sheet of the workbook
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * ```
     */
    getActiveSheet(): FWorksheet {
        const activeSheet = this._workbook.getActiveSheet();
        return this._injector.createInstance(FWorksheet, this, this._workbook, activeSheet);
    }

    /**
     * Gets all the worksheets in this workbook
     * @returns {FWorksheet[]} An array of all the worksheets in the workbook
     * @example
     * ```ts
     * // The code below gets all the worksheets in the workbook
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const sheets = activeSpreadsheet.getSheets();
     * ```
     */
    getSheets(): FWorksheet[] {
        return this._workbook.getSheets().map((sheet) => {
            return this._injector.createInstance(FWorksheet, this, this._workbook, sheet);
        });
    }

    /**
     * Create a new worksheet and returns a handle to it.
     * @param {string} name Name of the new sheet
     * @param {number} rows How many rows would the new sheet have
     * @param {number} column How many columns would the new sheet have
     * @returns {FWorksheet} The new created sheet
     * @example
     * ```ts
     * // The code below creates a new sheet
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const newSheet = activeSpreadsheet.create('MyNewSheet', 10, 10);
     * ```
     */
    create(name: string, rows: number, column: number): FWorksheet {
        const newSheet = mergeWorksheetSnapshotWithDefault({});
        newSheet.rowCount = rows;
        newSheet.columnCount = column;
        newSheet.name = name;
        newSheet.id = name.toLowerCase().replace(/ /g, '-');

        this._commandService.syncExecuteCommand(InsertSheetCommand.id, {
            unitId: this.id,
            index: this._workbook.getSheets().length,
            sheet: newSheet,
        });

        this._commandService.syncExecuteCommand(SetWorksheetActiveOperation.id, {
            unitId: this.id,
            subUnitId: this._workbook.getSheets()[this._workbook.getSheets().length - 1].getSheetId(),
        });

        const worksheet = this._workbook.getActiveSheet();
        if (!worksheet) {
            throw new Error('No active sheet found');
        }

        return this._injector.createInstance(FWorksheet, this, this._workbook, worksheet);
    }

    /**
     * Get a worksheet by sheet id.
     * @param {string} sheetId The id of the sheet to get.
     * @returns {FWorksheet | null} The worksheet with given sheet id
     * @example
     * ```ts
     * // The code below gets a worksheet by sheet id
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const sheet = activeSpreadsheet.getSheetBySheetId('sheetId');
     * ```
     */
    getSheetBySheetId(sheetId: string): FWorksheet | null {
        const worksheet = this._workbook.getSheetBySheetId(sheetId);
        if (!worksheet) {
            return null;
        }

        return this._injector.createInstance(FWorksheet, this, this._workbook, worksheet);
    }

    /**
     * Get a worksheet by sheet name.
     * @param {string} name The name of the sheet to get.
     * @returns {FWorksheet | null} The worksheet with given sheet name
     * @example
     * ```ts
     * // The code below gets a worksheet by sheet name
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const sheet = activeSpreadsheet.getSheetByName('Sheet1');
     * ```
     */
    getSheetByName(name: string): FWorksheet | null {
        const worksheet = this._workbook.getSheetBySheetName(name);
        if (!worksheet) {
            return null;
        }

        return this._injector.createInstance(FWorksheet, this, this._workbook, worksheet);
    }

    /**
     * Sets the given worksheet to be the active worksheet in the workbook.
     * @param {FWorksheet | string} sheet The worksheet to set as the active worksheet.
     * @returns {FWorksheet} The active worksheet
     * @example
     * ```ts
     * // The code below sets the given worksheet to be the active worksheet
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const sheet = activeSpreadsheet.getSheetByName('Sheet1');
     * activeSpreadsheet.setActiveSheet(sheet);
     * ```
     */
    setActiveSheet(sheet: FWorksheet | string): FWorksheet {
        this._commandService.syncExecuteCommand(SetWorksheetActiveOperation.id, {
            unitId: this.id,
            subUnitId: typeof sheet === 'string' ? sheet : sheet.getSheetId(),
        });

        return typeof sheet === 'string' ? this.getSheetBySheetId(sheet)! : sheet;
    }

    /**
     * Inserts a new worksheet into the workbook.
     * Using a default sheet name. The new sheet becomes the active sheet
     * @param {string} [sheetName] The name of the new sheet
     * @returns {FWorksheet} The new sheet
     * @example
     * ```ts
     * // The code below inserts a new sheet into the workbook
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * activeSpreadsheet.insertSheet();
     *
     * // The code below inserts a new sheet into the workbook, using a custom name
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * activeSpreadsheet.insertSheet('MyNewSheet');
     * ```
     */
    insertSheet(sheetName?: string): FWorksheet {
        if (sheetName != null) {
            this._commandService.syncExecuteCommand(InsertSheetCommand.id, { sheet: { name: sheetName } });
        } else {
            this._commandService.syncExecuteCommand(InsertSheetCommand.id);
        }

        const unitId = this.id;
        const subUnitId = this._workbook.getSheets()[this._workbook.getSheets().length - 1].getSheetId();

        this._commandService.syncExecuteCommand(SetWorksheetActiveOperation.id, {
            unitId,
            subUnitId,
        });
        const worksheet = this._workbook.getActiveSheet();
        if (!worksheet) {
            throw new Error('No active sheet found');
        }

        return this._injector.createInstance(FWorksheet, this, this._workbook, worksheet);
    }

    /**
     * Deletes the specified worksheet.
     * @param {FWorksheet | string} sheet The worksheet to delete.
     * @returns {boolean} True if the worksheet was deleted, false otherwise.
     * @example
     * ```ts
     * // The code below deletes the specified worksheet
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const sheet = activeSpreadsheet.getSheetByName('Sheet1');
     * activeSpreadsheet.deleteSheet(sheet);
     * ```
     */
    deleteSheet(sheet: FWorksheet | string): boolean {
        const unitId = this.id;
        const subUnitId = typeof sheet === 'string' ? sheet : sheet.getSheetId();
        return this._commandService.syncExecuteCommand(RemoveSheetCommand.id, {
            unitId,
            subUnitId,
        });
    }

    // #region editing
    /**
     * Undo the last action.
     * @returns {FWorkbook} A promise that resolves to true if the undo was successful, false otherwise.
     * @example
     * ```ts
     * // The code below undoes the last action
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * activeSpreadsheet.undo();
     * ```
     */
    undo(): FWorkbook {
        this._univerInstanceService.focusUnit(this.id);
        this._commandService.syncExecuteCommand(UndoCommand.id);
        return this;
    }

    /**
     * Redo the last undone action.
     * @returns {FWorkbook} A promise that resolves to true if the redo was successful, false otherwise.
     * @example
     * ```ts
     * // The code below redoes the last undone action
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * activeSpreadsheet.redo();
     * ```
     */
    redo(): FWorkbook {
        this._univerInstanceService.focusUnit(this.id);
        this._commandService.syncExecuteCommand(RedoCommand.id);
        return this;
    }

    /**
     * Callback for command execution.
     * @callback onBeforeCommandExecuteCallback
     * @param {ICommandInfo<ISheetCommandSharedParams>} command The command that was executed.
     */

    /**
     * Register a callback that will be triggered before invoking a command targeting the Univer sheet.
     * @param {onBeforeCommandExecuteCallback} callback the callback.
     * @returns {IDisposable} A function to dispose the listening.
     * @example
     * ```ts
     * // The code below registers a callback that will be triggered before invoking a command targeting the Univer sheet
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * activeSpreadsheet.onBeforeCommandExecute((command) => {
     *    console.log('Command executed:', command);
     * });
     * ```
     */
    onBeforeCommandExecute(callback: CommandListener): IDisposable {
        return this._commandService.beforeCommandExecuted((command) => {
            if ((command as ICommandInfo<ISheetCommandSharedParams>).params?.unitId !== this.id) {
                return;
            }

            callback(command);
        });
    }

    /**
     * Callback for command execution.
     * @callback onCommandExecutedCallback
     * @param {ICommandInfo<ISheetCommandSharedParams>} command The command that was executed
     */

    /**
     * Register a callback that will be triggered when a command is invoked targeting the Univer sheet.
     * @param {onCommandExecutedCallback} callback the callback.
     * @returns {IDisposable} A function to dispose the listening.
     * @example
     * ```ts
     * // The code below registers a callback that will be triggered when a command is invoked targeting the Univer sheet
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * activeSpreadsheet.onCommandExecuted((command) => {
     *   console.log('Command executed:', command);
     * });
     * ```
     */
    onCommandExecuted(callback: CommandListener): IDisposable {
        return this._commandService.onCommandExecuted((command) => {
            if ((command as ICommandInfo<ISheetCommandSharedParams>).params?.unitId !== this.id) {
                return;
            }

            callback(command);
        });
    }

    /**
     * Callback for selection changes.
     * @callback onSelectionChangeCallback
     * @param {IRange[]} selections The new selection.
     */

    /**
     * Register a callback that will be triggered when the selection changes.
     * @param {onSelectionChangeCallback} callback The callback.
     * @returns {IDisposable} A function to dispose the listening
     */
    onSelectionChange(callback: (selections: IRange[]) => void): IDisposable {
        return toDisposable(
            this._selectionManagerService.selectionMoveEnd$.subscribe((selections) => {
                if (this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId() !== this.id) {
                    return;
                }

                if (!selections?.length) {
                    callback([]);
                } else {
                    // TODO@wzhudev: filtered out ranges changes not other currently sheet
                    callback(selections!.map((s) => s.range));
                }
            })
        );
    }

    /**
     * Used to modify the editing permissions of the workbook. When the value is false, editing is not allowed.
     * @param {boolean} value  editable value want to set
     * @returns {FWorkbook} FWorkbook instance
     */
    setEditable(value: boolean): FWorkbook {
        const instance = new WorkbookEditablePermission(this._workbook.getUnitId());
        const editPermissionPoint = this._permissionService.getPermissionPoint(instance.id);
        if (!editPermissionPoint) {
            this._permissionService.addPermissionPoint(instance);
        }
        this._permissionService.updatePermissionPoint(instance.id, value);

        return this;
    }

    /**
     * Sets the selection region for active sheet.
     * @param {FRange} range The range to set as the active selection.
     * @returns {FWorkbook} FWorkbook instance
     */
    setActiveRange(range: FRange): FWorkbook {
        // In theory, FRange should belong to a specific context, rather than getting the currently active sheet
        const sheet = this.getActiveSheet();
        const sheetId = range.getRange().sheetId || sheet.getSheetId();

        const worksheet = sheetId ? this._workbook.getSheetBySheetId(sheetId) : this._workbook.getActiveSheet(true);
        if (!worksheet) {
            throw new Error('No active sheet found');
        }

        // if the range is not in the current sheet, set the active sheet to the range's sheet
        if (worksheet.getSheetId() !== sheet.getSheetId()) {
            this.setActiveSheet(this._injector.createInstance(FWorksheet, this, this._workbook, worksheet));
        }

        const setSelectionOperationParams: ISetSelectionsOperationParams = {
            unitId: this.getId(),
            subUnitId: sheetId,

            selections: [range].map((r) => ({ range: r.getRange(), primary: getPrimaryForRange(r.getRange(), worksheet), style: null })),
        };

        this._commandService.syncExecuteCommand(SetSelectionsOperation.id, setSelectionOperationParams);

        return this;
    }

    /**
     * Returns the selected range in the active sheet, or null if there is no active range.
     * @returns {FRange | null} The active range
     */
    // could sheet have no active range ?
    getActiveRange(): FRange | null {
        const activeSheet = this._workbook.getActiveSheet();
        const selections = this._selectionManagerService.getCurrentSelections();
        const active = selections.find((selection) => !!selection.primary);
        if (!active) {
            return null;
        }

        return this._injector.createInstance(FRange, this._workbook, activeSheet, active.range);
    }

    /**
     * Deletes the currently active sheet.
     * @returns {boolean} true if the sheet was deleted, false otherwise
     * @example
     * ```ts
     * // The code below deletes the currently active sheet and stores the new active
     * // sheet in a variable
     * const sheet = univerAPI.getActiveWorkbook().deleteActiveSheet();
     * ```
     */
    deleteActiveSheet(): boolean {
        const sheet = this.getActiveSheet();
        return this.deleteSheet(sheet);
    }

    /**
     * Duplicates the given worksheet.
     * @param {FWorksheet} sheet The worksheet to duplicate.
     * @returns {FWorksheet} The duplicated worksheet
     * @example
     * ```ts
     * // The code below duplicates the given worksheet
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * activeSpreadsheet.duplicateSheet(activeSheet);
     * ```
     */
    duplicateSheet(sheet: FWorksheet): FWorksheet {
        this._commandService.syncExecuteCommand(CopySheetCommand.id, {
            unitId: sheet.getWorkbook().getUnitId(),
            subUnitId: sheet.getSheetId(),
        });

        return this._injector.createInstance(FWorksheet, this, this._workbook, this._workbook.getActiveSheet());
    }

    /**
     * Duplicates the active sheet.
     * @returns {FWorksheet} The duplicated worksheet
     * @example
     * ```ts
     *  const activeSpreadsheet = univerAPI.getActiveWorkbook();
     *  activeSpreadsheet.duplicateActiveSheet();
     * ```
     */
    duplicateActiveSheet(): FWorksheet {
        const sheet = this.getActiveSheet();
        return this.duplicateSheet(sheet);
    }

    /**
     * Get the number of sheets in the workbook.
     * @returns {number} The number of sheets in the workbook
     * @example
     * ```ts
     * // The code below gets the number of sheets in the workbook
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const numSheets = activeSpreadsheet.getNumSheets();
     * ```
     */
    getNumSheets(): number {
        return this._workbook.getSheets().length;
    }

    /**
     * Get the locale of the workbook.
     * @returns {LocaleType} The locale of the workbook
     * @example
     * ```ts
     * // The code below gets the locale of the workbook
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const locale = activeSpreadsheet.getLocale();
     * ```
     */
    getLocale(): LocaleType {
        return this._localeService.getCurrentLocale();
    }

    /**
     * @deprecated use setSpreadsheetLocale instead.
     * @param {LocaleType} locale - The locale to set
     */
    setLocale(locale: LocaleType): void {
        this._localeService.setLocale(locale);
    }

    /**
     * Set the locale of the workbook.
     * @param {LocaleType} locale The locale to set
     * @returns {FWorkbook} This workbook, for chaining
     * @example
     * ```ts
     * // The code below sets the locale of the workbook
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * activeSpreadsheet.setLocale(LocaleType.EN_US);
     * ```
     */
    setSpreadsheetLocale(locale: LocaleType): FWorkbook {
        this._localeService.setLocale(locale);
        return this;
    }

    /**
     * Get the URL of the workbook.
     * @returns {string} The URL of the workbook
     * @example
     * ```ts
     * // The code below gets the URL of the workbook
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const url = activeSpreadsheet.getUrl();
     * ```
     */
    getUrl(): string {
        return location.href;
    }

    /**
     * Move the sheet to the specified index.
     * @param {FWorksheet} sheet The sheet to move
     * @param {number} index The index to move the sheet to
     * @returns {FWorkbook} This workbook, for chaining
     * @example
     * ```ts
     * // The code below moves the sheet to the specified index
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const sheet = activeSpreadsheet.getActiveSheet();
     * activeSpreadsheet.moveSheet(sheet, 1);
     * ```
     */
    moveSheet(sheet: FWorksheet, index: number): FWorkbook {
        let sheetIndexVal = index;
        if (sheetIndexVal < 0) {
            sheetIndexVal = 0;
        } else if (sheetIndexVal > this._workbook.getSheets().length - 1) {
            sheetIndexVal = this._workbook.getSheets().length - 1;
        }
        this._commandService.syncExecuteCommand(SetWorksheetOrderCommand.id, {
            unitId: sheet.getWorkbook().getUnitId(),
            order: sheetIndexVal,
            subUnitId: sheet.getSheetId(),
        });
        return this;
    }

    /**
     * Move the active sheet to the specified index.
     * @param {number} index The index to move the active sheet to
     * @returns {FWorkbook} This workbook, for chaining
     * @example
     * ```ts
     * // The code below moves the active sheet to the specified index
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * activeSpreadsheet.moveActiveSheet(1);
     * ```
     */
    moveActiveSheet(index: number): FWorkbook {
        const sheet = this.getActiveSheet();
        return this.moveSheet(sheet, index);
    }

    /**
     * Get the PermissionInstance.
     * @returns {FPermission} - The PermissionInstance.
     */
    getPermission(): FPermission {
        return this._injector.createInstance(FPermission);
    }

    /**
     * Get the defined name by name.
     * @param {string} name The name of the defined name to get
     * @returns {FDefinedName | null} The defined name with the given name
     * @example
     * ```ts
     * // The code below gets the defined name by name
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const definedName = activeSpreadsheet.getDefinedName('MyDefinedName');
     * ```
     */
    getDefinedName(name: string): FDefinedName | null {
        const definedName = this._definedNamesService.getValueByName(this.id, name);
        if (!definedName) {
            return null;
        }

        return this._injector.createInstance(FDefinedName, { ...definedName, unitId: this.id });
    }

    /**
     * Get all the defined names in the workbook.
     * @returns {FDefinedName[]} All the defined names in the workbook
     * @example
     * ```ts
     * // The code below gets all the defined names in the workbook
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const definedNames = activeSpreadsheet.getDefinedNames();
     * ```
     */
    getDefinedNames(): FDefinedName[] {
        const definedNames = this._definedNamesService.getDefinedNameMap(this.id);
        if (!definedNames) {
            return [];
        }
        return Object.values(definedNames).map((definedName) => {
            return this._injector.createInstance(FDefinedName, { ...definedName, unitId: this.id });
        });
    }

    /**
     * Insert a defined name.
     * @param {string} name The name of the defined name to insert
     * @param {string} formulaOrRefString The formula(=sum(A2:b10)) or reference(A1) string of the defined name to insert
     * @returns {FWorkbook} The current FWorkbook instance
     * @example
     * ```ts
     * // The code below inserts a defined name
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * activeSpreadsheet.insertDefinedName('MyDefinedName', 'Sheet1!A1');
     * ```
     */
    insertDefinedName(name: string, formulaOrRefString: string): FWorkbook {
        const definedNameBuilder = this._injector.createInstance(FDefinedNameBuilder);
        const param = definedNameBuilder.setName(name).setRef(formulaOrRefString).build();
        param.localSheetId = SCOPE_WORKBOOK_VALUE_DEFINED_NAME;
        this.insertDefinedNameBuilder(param);
        return this;
    }

    /**
     * Delete the defined name with the given name.
     * @param {string} name The name of the defined name to delete
     * @returns {boolean} true if the defined name was deleted, false otherwise
     * @example
     * ```ts
     * // The code below deletes the defined name with the given name
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const deleted = activeSpreadsheet.deleteDefinedName('MyDefinedName');
     * ```
     */
    deleteDefinedName(name: string): boolean {
        const definedName = this.getDefinedName(name);
        if (definedName) {
            definedName.delete();
            return true;
        }

        return false;
    }

    /**
     * Insert a defined name by builder param.
     * @param {ISetDefinedNameMutationParam} param The param to insert the defined name
     * @returns {void}
     * @example
     * ```ts
     * // The code below inserts a defined name by builder param
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const builder = univerAPI.newDefinedName();
     * const param = builder.setName('MyDefinedName').setRef('Sheet1!A1').build();
     * activeSpreadsheet.insertDefinedNameBuilder(param);
     * ```
     */
    insertDefinedNameBuilder(param: ISetDefinedNameMutationParam): void {
        param.unitId = this.getId();
        this._commandService.syncExecuteCommand(SetDefinedNameCommand.id, param);
    }

    /**
     * Update the defined name with the given name.
     * @param {ISetDefinedNameMutationParam} param The param to insert the defined name
     * @returns {void}
     * @example
     * ```ts
     * // The code below updates the defined name with the given name
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const builder = activeSpreadsheet.getDefinedName('MyDefinedName').toBuilder();
     * builder.setRef('Sheet1!A2').setName('MyDefinedName1').build();
     * activeSpreadsheet.updateDefinedNameBuilder(param);
     * ```
     */
    updateDefinedNameBuilder(param: ISetDefinedNameMutationParam): void {
        this._commandService.syncExecuteCommand(SetDefinedNameCommand.id, param);
    }

    /**
     * Gets the registered range themes.
     * @returns {string[]} The name list of registered range themes.
     * @example
     * ```ts
     * // The code below gets the registered range themes
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const themes = activeSpreadsheet.getRegisteredRangeThemes();
     * console.log(themes);
     * ```
     */
    getRegisteredRangeThemes(): string[] {
        return this._injector.get(SheetRangeThemeService).getRegisteredRangeThemes();
    }

    /**
     * Register a custom range theme style.
     * @param {RangeThemeStyle} rangeThemeStyle The range theme style to register
     * @returns {void}
     * @example
     * ```ts
     * // import {RangeThemeStyle} from '@univerjs/sheets';
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const rangeThemeStyle = new RangeThemeStyle('MyTheme');
     * rangeThemeStyle.setSecondRowStyle({
     *    bg: {
     *       rgb: 'rgb(214,231,241)',
     *    },
     * });
     * fWorkbook.registerRangeTheme(rangeThemeStyle);
     * ```
     */
    registerRangeTheme(rangeThemeStyle: RangeThemeStyle): void {
        this._commandService.syncExecuteCommand(RegisterWorksheetRangeThemeStyleCommand.id, {
            unitId: this.getId(),
            rangeThemeStyle,
        });
    }

    /**
     * Unregister a custom range theme style.
     * @param {string} themeName The name of the theme to unregister
     * @returns {void}
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * fWorkbook.unregisterRangeTheme('MyTheme');
     * ```
     */
    unregisterRangeTheme(themeName: string): void {
        this._commandService.syncExecuteCommand(UnregisterWorksheetRangeThemeStyleCommand.id, {
            unitId: this.getId(),
            themeName,
        });
    }

    /**
     * Set custom metadata of workbook
     * @param {CustomData | undefined} custom custom metadata
     * @returns {FWorkbook} FWorkbook
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * fWorkbook.setCustomMetadata({ key: 'value' });
     * ```
     */
    setCustomMetadata(custom: CustomData | undefined): FWorkbook {
        this._workbook.setCustomMetadata(custom);
        return this;
    }

    /**
     * Get custom metadata of workbook
     * @returns {CustomData | undefined} custom metadata
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const custom = fWorkbook.getCustomMetadata();
     * ```
     */
    getCustomMetadata(): CustomData | undefined {
        return this._workbook.getCustomMetadata();
    }
}

// eslint-disable-next-line ts/no-namespace
export namespace FWorkbook {
    export type FontLine = _FontLine;
    export type FontStyle = _FontLine;
    export type FontWeight = _FontLine;
}
