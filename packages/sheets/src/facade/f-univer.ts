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

import type { ICommandInfo, IDisposable, Injector, IWorkbookData, Nullable, Workbook } from '@univerjs/core';
import type { CommandListenerValueChange, IInsertSheetCommandParams, IRemoveSheetCommandParams, ISetGridlinesColorCommandParams, ISetTabColorMutationParams, ISetWorksheetActivateCommandParams, ISetWorksheetHideMutationParams, ISetWorksheetNameCommandParams, ISetWorksheetOrderMutationParams, IToggleGridlinesCommandParams } from '@univerjs/sheets';
import type { IBeforeSheetCreateEventParams, ISheetCreatedEventParams } from './f-event';
import type { FRange } from './f-range';
import type { FWorksheet } from './f-worksheet';
import { CanceledError, FUniver, ICommandService, IUniverInstanceService, toDisposable, UniverInstanceType } from '@univerjs/core';
import { COMMAND_LISTENER_VALUE_CHANGE, getValueChangedEffectedRange, InsertSheetCommand, RemoveSheetCommand, SetGridlinesColorCommand, SetTabColorCommand, SetWorksheetActivateCommand, SetWorksheetHideCommand, SetWorksheetNameCommand, SetWorksheetOrderCommand, ToggleGridlinesCommand } from '@univerjs/sheets';
import { FDefinedNameBuilder } from './f-defined-name';
import { FPermission } from './f-permission';
import { FWorkbook } from './f-workbook';

export interface IFUniverSheetsMixin {
    /**
     * @deprecated use `univerAPI.createWorkbook` instead.
     */
    createUniverSheet(data: Partial<IWorkbookData>): FWorkbook;

    /**
     * Create a new spreadsheet and get the API handler of that spreadsheet.
     * @param {Partial<IWorkbookData>} data The snapshot of the spreadsheet.
     * @returns {FWorkbook} FWorkbook API instance.
     * @example
     * ```ts
     * univerAPI.createWorkbook({ id: 'Sheet1', name: 'Sheet1' });
     * ```
     */
    createWorkbook(data: Partial<IWorkbookData>): FWorkbook;

    /**
     * Get the currently focused Univer spreadsheet.
     * @returns {FWorkbook | null} The currently focused Univer spreadsheet.
     * @example
     * ```ts
     * univerAPI.getActiveWorkbook();
     * ```
     */
    getActiveWorkbook(): FWorkbook | null;

    /**
     * @deprecated use `univerAPI.getActiveWorkbook` instead
     */
    getActiveUniverSheet(): FWorkbook | null;

    /**
     * Get the spreadsheet API handler by the spreadsheet id.
     * @param {string} id The spreadsheet id.
     * @returns {FWorkbook | null} The spreadsheet API instance.
     */
    getUniverSheet(id: string): FWorkbook | null;

    getWorkbook(id: string): FWorkbook | null;
    /**
     * Get the PermissionInstance.
     * @deprecated This function is deprecated and will be removed in version 0.6.0. Please use the function with the same name on the `FWorkbook` instance instead.
     */
    getPermission(): FPermission;

    /**
     * @deprecated Use `univerAPI.addEvent(univerAPI.Event.UnitCreated, () => {})`
     */
    onUniverSheetCreated(callback: (workbook: FWorkbook) => void): IDisposable;

    /**
     * Create a new defined name builder.
     * @returns {FDefinedNameBuilder} - The defined name builder.
     * @example
     * ```ts
     * univerAPI.newDefinedName();
     * ```
     */
    newDefinedName(): FDefinedNameBuilder;

    /**
     * Get the target of the sheet.
     * @param {string} unitId - The unitId of the sheet.
     * @param {string} subUnitId - The subUnitId of the sheet.
     * @returns {Nullable<{ workbook: FWorkbook; worksheet: FWorksheet }>} - The target of the sheet.
     * @example
     * ```ts
     * univerAPI.getSheetTarget('unitId', 'subUnitId');
     * ```
     */
    getSheetTarget(unitId: string, subUnitId: string): Nullable<{ workbook: FWorkbook; worksheet: FWorksheet }>;

    /**
     * Get the target of the sheet.
     * @param {ICommandInfo<object>} commandInfo - The commandInfo of the command.
     * @returns {Nullable<{ workbook: FWorkbook; worksheet: FWorksheet }>} - The target of the sheet.
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.CommandExecuted, (commandInfo) => {
     *      const target = univerAPI.getCommandSheetTarget(commandInfo);
     *      if (!target) return;
     *      const { workbook, worksheet } = target;
     * });
     * ```
     */
    getCommandSheetTarget(commandInfo: ICommandInfo<object>): Nullable<{ workbook: FWorkbook; worksheet: FWorksheet }>;

    /**
     * Get the active sheet.
     * @returns {Nullable<{ workbook: FWorkbook; worksheet: FWorksheet }>} The active sheet.
     * @example
     * ```ts
     * const target = univerAPI.getActiveSheet();
     * if (!target) return;
     * const { workbook, worksheet } = target;
     * ```
     */
    getActiveSheet(): Nullable<{ workbook: FWorkbook; worksheet: FWorksheet }>;
}

export class FUniverSheetsMixin extends FUniver implements IFUniverSheetsMixin {
    override getCommandSheetTarget(commandInfo: ICommandInfo<object>): Nullable<{ workbook: FWorkbook; worksheet: FWorksheet }> {
        const params = commandInfo.params as { unitId: string; subUnitId: string; sheetId: string };
        if (!params) return;
        const workbook = params.unitId ? this.getUniverSheet(params.unitId) : this.getActiveWorkbook?.();
        if (!workbook) {
            return;
        }

        const worksheet = workbook.getSheetBySheetId(params.subUnitId || params.sheetId) || workbook.getActiveSheet();
        if (!worksheet) {
            return;
        }

        return { workbook, worksheet };
    }

    override getSheetTarget(unitId: string, subUnitId: string): Nullable<{ workbook: FWorkbook; worksheet: FWorksheet }> {
        const workbook = this.getUniverSheet(unitId);
        if (!workbook) {
            return;
        }

        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) {
            return;
        }

        return { workbook, worksheet };
    }

    private _initWorkbookEvent(injector: Injector): void {
        const univerInstanceService = injector.get(IUniverInstanceService);
        this.disposeWithMe(
            univerInstanceService.unitDisposed$.subscribe((unit) => {
                if (!this._eventRegistry.get(this.Event.WorkbookDisposed)) return;

                if (unit.type === UniverInstanceType.UNIVER_SHEET) {
                    this.fireEvent(this.Event.WorkbookDisposed,
                        {
                            unitId: unit.getUnitId(),
                            unitType: unit.type,
                            snapshot: unit.getSnapshot() as IWorkbookData,

                        }
                    );
                }
            })
        );

        this.disposeWithMe(
            univerInstanceService.unitAdded$.subscribe((unit) => {
                if (!this._eventRegistry.get(this.Event.WorkbookCreated)) return;

                if (unit.type === UniverInstanceType.UNIVER_SHEET) {
                    const workbook = unit as Workbook;
                    const workbookUnit = injector.createInstance(FWorkbook, workbook);
                    this.fireEvent(this.Event.WorkbookCreated,
                        {
                            unitId: unit.getUnitId(),
                            type: unit.type,
                            workbook: workbookUnit,
                            unit: workbookUnit,
                        }
                    );
                }
            })
        );
    }

    // eslint-disable-next-line max-lines-per-function
    override _initialize(injector: Injector): void {
        const commandService = injector.get(ICommandService);
        this.disposeWithMe(
            // eslint-disable-next-line max-lines-per-function, complexity
            commandService.beforeCommandExecuted((commandInfo) => {
                switch (commandInfo.id) {
                    case InsertSheetCommand.id: {
                        const params = (commandInfo.params) as IInsertSheetCommandParams;
                        const { unitId, index, sheet } = params || {};
                        const workbook = unitId ? this.getUniverSheet(unitId) : this.getActiveWorkbook?.();
                        if (!workbook) {
                            return;
                        }
                        const eventParams: IBeforeSheetCreateEventParams = {
                            workbook,
                            index,
                            sheet,
                        };
                        this.fireEvent(
                            this.Event.BeforeSheetCreate,
                            eventParams
                        );
                        // cancel this command
                        if (eventParams.cancel) {
                            throw new CanceledError();
                        }
                        break;
                    }
                    case SetWorksheetActivateCommand.id: {
                        if (!this._eventListend(this.Event.BeforeActiveSheetChange)) return;
                        const { subUnitId: sheetId, unitId } = commandInfo.params as ISetWorksheetActivateCommandParams;
                        const workbook = unitId ? this.getUniverSheet(unitId) : this.getActiveWorkbook?.();
                        if (!workbook || !sheetId) return;
                        const activeSheet = workbook.getSheetBySheetId(sheetId);
                        const oldActiveSheet = workbook.getActiveSheet();
                        if (!activeSheet || !oldActiveSheet) return;
                        this._fireBeforeActiveSheetChange(workbook, activeSheet, oldActiveSheet);
                        break;
                    }
                    case RemoveSheetCommand.id: {
                        if (!this._eventListend(this.Event.BeforeSheetDelete)) return;
                        const target = this.getCommandSheetTarget(commandInfo);
                        if (!target) return;
                        const { workbook, worksheet } = target;
                        this._fireBeforeSheetDelete(workbook, worksheet);
                        break;
                    }
                    case SetWorksheetOrderCommand.id: {
                        if (!this._eventListend(this.Event.BeforeSheetMove)) return;
                        const { fromOrder, toOrder } = commandInfo.params as ISetWorksheetOrderMutationParams;
                        const target = this.getCommandSheetTarget(commandInfo);
                        if (!target) return;
                        this._fireBeforeSheetMove(target.workbook, target.worksheet, toOrder, fromOrder);
                        break;
                    }
                    case SetWorksheetNameCommand.id: {
                        if (!this._eventListend(this.Event.BeforeSheetNameChange)) return;
                        const { name } = commandInfo.params as ISetWorksheetNameCommandParams;
                        const target = this.getCommandSheetTarget(commandInfo);
                        if (!target) return;
                        this._fireBeforeSheetNameChange(target.workbook, target.worksheet, name, target.worksheet.getSheetName());
                        break;
                    }
                    case SetTabColorCommand.id: {
                        if (!this._eventListend(this.Event.BeforeSheetTabColorChange)) return;
                        const { color } = commandInfo.params as ISetTabColorMutationParams;
                        const target = this.getCommandSheetTarget(commandInfo);
                        if (!target) return;
                        this._fireBeforeSheetTabColorChange(target.workbook, target.worksheet, color, target.worksheet.getTabColor());
                        break;
                    }
                    case SetWorksheetHideCommand.id: {
                        if (!this._eventListend(this.Event.BeforeSheetHideChange)) return;
                        const { hidden } = commandInfo.params as ISetWorksheetHideMutationParams;
                        const target = this.getCommandSheetTarget(commandInfo);
                        if (!target) return;
                        this._fireBeforeSheetHideChange(target.workbook, target.worksheet, Boolean(hidden));
                        break;
                    }
                    case SetGridlinesColorCommand.id: {
                        if (!this._eventListend(this.Event.BeforeGridlineColorChange)) return;
                        const target = this.getCommandSheetTarget(commandInfo);
                        if (!target) return;
                        this.fireEvent(this.Event.BeforeGridlineColorChange, {
                            ...target,
                            color: (commandInfo.params as ISetGridlinesColorCommandParams)?.color,
                        });
                        break;
                    }
                    case ToggleGridlinesCommand.id: {
                        if (!this._eventListend(this.Event.BeforeGridlineEnableChange)) return;
                        const target = this.getCommandSheetTarget(commandInfo);
                        if (!target) return;
                        this.fireEvent(this.Event.BeforeGridlineEnableChange, {
                            ...target,
                            enabled: Boolean((commandInfo.params as IToggleGridlinesCommandParams)?.showGridlines) ?? !target.worksheet.hasHiddenGridLines(),
                        });
                        break;
                    }
                    default:
                        break;
                }
            })
        );

        this.disposeWithMe(
            // eslint-disable-next-line max-lines-per-function, complexity
            commandService.onCommandExecuted((commandInfo) => {
                if (COMMAND_LISTENER_VALUE_CHANGE.indexOf(commandInfo.id) > -1) {
                    if (!this._eventListend(this.Event.SheetValueChanged)) return;
                    const sheet = this.getActiveSheet();
                    if (!sheet) return;
                    const ranges = getValueChangedEffectedRange(commandInfo)
                        .map(
                            (range) => this.getWorkbook(range.unitId)
                                ?.getSheetBySheetId(range.subUnitId)
                                ?.getRange(range.range)
                        )
                        .filter(Boolean) as FRange[];
                    if (!ranges.length) return;
                    this.fireEvent(this.Event.SheetValueChanged, {
                        payload: commandInfo as CommandListenerValueChange,
                        effectedRanges: ranges,
                    });
                    return;
                }

                switch (commandInfo.id) {
                    case InsertSheetCommand.id: {
                        const params = commandInfo.params as IInsertSheetCommandParams;
                        const { unitId } = params || {};
                        const workbook = unitId ? this.getUniverSheet(unitId) : this.getActiveWorkbook?.();
                        if (!workbook) {
                            return;
                        }
                        const worksheet = workbook.getActiveSheet();
                        if (!worksheet) {
                            return;
                        }
                        const eventParams: ISheetCreatedEventParams = {
                            workbook,
                            worksheet,
                        };
                        this.fireEvent(
                            this.Event.SheetCreated,
                            eventParams
                        );
                        break;
                    }
                    case SetWorksheetActivateCommand.id: {
                        if (!this._eventListend(this.Event.ActiveSheetChanged)) return;
                        const target = this.getActiveSheet();
                        if (!target) return;
                        const { workbook, worksheet: activeSheet } = target;
                        this._fireActiveSheetChanged(workbook, activeSheet);
                        break;
                    }
                    case RemoveSheetCommand.id: {
                        if (!this._eventListend(this.Event.SheetDeleted)) return;
                        const { subUnitId: sheetId, unitId } = commandInfo.params as IRemoveSheetCommandParams;
                        const workbook = unitId ? this.getUniverSheet(unitId) : this.getActiveWorkbook?.();
                        if (!workbook || !sheetId) return;
                        this._fireSheetDeleted(workbook, sheetId);
                        break;
                    }
                    case SetWorksheetOrderCommand.id: {
                        if (!this._eventListend(this.Event.SheetMoved)) return;
                        const { toOrder: toIndex } = commandInfo.params as ISetWorksheetOrderMutationParams;
                        const target = this.getCommandSheetTarget(commandInfo);
                        if (!target) return;
                        this._fireSheetMoved(target.workbook, target.worksheet, toIndex);
                        break;
                    }
                    case SetWorksheetNameCommand.id: {
                        if (!this._eventListend(this.Event.SheetNameChanged)) return;
                        const { name } = commandInfo.params as ISetWorksheetNameCommandParams;
                        const target = this.getCommandSheetTarget(commandInfo);
                        if (!target) return;
                        this._fireSheetNameChanged(target.workbook, target.worksheet, name);
                        break;
                    }
                    case SetTabColorCommand.id: {
                        if (!this._eventListend(this.Event.SheetTabColorChanged)) return;
                        const { color } = commandInfo.params as ISetTabColorMutationParams;
                        const target = this.getCommandSheetTarget(commandInfo);
                        if (!target) return;
                        this._fireSheetTabColorChanged(target.workbook, target.worksheet, color);
                        break;
                    }
                    case SetWorksheetHideCommand.id: {
                        if (!this._eventListend(this.Event.SheetHideChanged)) return;
                        const { hidden } = commandInfo.params as ISetWorksheetHideMutationParams;
                        const target = this.getCommandSheetTarget(commandInfo);
                        if (!target) return;
                        this._fireSheetHideChanged(target.workbook, target.worksheet, !!hidden);
                        break;
                    }
                    case SetGridlinesColorCommand.id:
                    case ToggleGridlinesCommand.id: {
                        if (!this._eventListend(this.Event.GridlineChanged)) return;
                        const target = this.getCommandSheetTarget(commandInfo);
                        if (!target) return;
                        this.fireEvent(this.Event.GridlineChanged, {
                            ...target,
                            enabled: !target.worksheet.hasHiddenGridLines(),
                            color: target.worksheet.getGridLinesColor(),
                        });
                        break;
                    }
                    default:
                        break;
                }
            })
        );

        this._initWorkbookEvent(injector);
    }

    override createUniverSheet(data: Partial<IWorkbookData>): FWorkbook {
        const instanceService = this._injector.get(IUniverInstanceService);
        const workbook = instanceService.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, data);
        return this._injector.createInstance(FWorkbook, workbook);
    };

    override createWorkbook(data: Partial<IWorkbookData>): FWorkbook {
        return this.createUniverSheet(data);
    }

    override getActiveWorkbook(): FWorkbook | null {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return null;
        }

        return this._injector.createInstance(FWorkbook, workbook);
    }

    override getActiveUniverSheet(): FWorkbook | null {
        return this.getActiveWorkbook();
    }

    override getUniverSheet(id: string): FWorkbook | null {
        const workbook = this._univerInstanceService.getUnit<Workbook>(id, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return null;
        }

        return this._injector.createInstance(FWorkbook, workbook);
    }

    override getWorkbook(id: string): FWorkbook | null {
        return this.getUniverSheet(id);
    }

    override getPermission(): FPermission {
        return this._injector.createInstance(FPermission);
    }

    override onUniverSheetCreated(callback: (workbook: FWorkbook) => void): IDisposable {
        const subscription = this._univerInstanceService.getTypeOfUnitAdded$<Workbook>(UniverInstanceType.UNIVER_SHEET).subscribe((workbook) => {
            const fworkbook = this._injector.createInstance(FWorkbook, workbook);
            callback(fworkbook);
        });

        return toDisposable(subscription);
    }

    override newDefinedName(): FDefinedNameBuilder {
        return this._injector.createInstance(FDefinedNameBuilder);
    }

    override getActiveSheet(): Nullable<{ workbook: FWorkbook; worksheet: FWorksheet }> {
        const workbook = this.getActiveWorkbook();
        if (!workbook) {
            return null;
        }
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return null;
        }
        return { workbook, worksheet };
    }

    private _fireBeforeActiveSheetChange(workbook: FWorkbook, newActiveSheet: FWorksheet, oldActiveSheet: FWorksheet): void {
        this.fireEvent(this.Event.BeforeActiveSheetChange, {
            workbook,
            activeSheet: newActiveSheet,
            oldActiveSheet,
        });
    }

    private _fireActiveSheetChanged(workbook: FWorkbook, newActiveSheet: FWorksheet): void {
        this.fireEvent(this.Event.ActiveSheetChanged, {
            workbook,
            activeSheet: newActiveSheet,
        });
    }

    private _fireBeforeSheetDelete(workbook: FWorkbook, worksheet: FWorksheet): void {
        this.fireEvent(this.Event.BeforeSheetDelete, {
            workbook,
            worksheet,
        });
    }

    private _fireSheetDeleted(workbook: FWorkbook, sheetId: string): void {
        this.fireEvent(this.Event.SheetDeleted, {
            workbook,
            sheetId,
        });
    }

    private _fireBeforeSheetMove(workbook: FWorkbook, worksheet: FWorksheet, toIndex: number, fromIndex: number): void {
        this.fireEvent(this.Event.BeforeSheetMove, {
            workbook,
            worksheet,
            newIndex: toIndex,
            oldIndex: fromIndex,
        });
    }

    private _fireSheetMoved(workbook: FWorkbook, worksheet: FWorksheet, toIndex: number): void {
        this.fireEvent(this.Event.SheetMoved, {
            workbook,
            worksheet,
            newIndex: toIndex,
        });
    }

    private _fireBeforeSheetNameChange(workbook: FWorkbook, worksheet: FWorksheet, newName: string, oldName: string): void {
        this.fireEvent(this.Event.BeforeSheetNameChange, {
            workbook,
            worksheet,
            newName,
            oldName,
        });
    }

    private _fireSheetNameChanged(workbook: FWorkbook, worksheet: FWorksheet, newName: string): void {
        this.fireEvent(this.Event.SheetNameChanged, {
            workbook,
            worksheet,
            newName,
        });
    }

    private _fireBeforeSheetTabColorChange(workbook: FWorkbook, worksheet: FWorksheet, newColor: string, oldColor: string | undefined): void {
        this.fireEvent(this.Event.BeforeSheetTabColorChange, {
            workbook,
            worksheet,
            newColor,
            oldColor,
        });
    }

    private _fireSheetTabColorChanged(workbook: FWorkbook, worksheet: FWorksheet, newColor: string): void {
        this.fireEvent(this.Event.SheetTabColorChanged, {
            workbook,
            worksheet,
            newColor,
        });
    }

    private _fireBeforeSheetHideChange(workbook: FWorkbook, worksheet: FWorksheet, hidden: boolean): void {
        this.fireEvent(this.Event.BeforeSheetHideChange, {
            workbook,
            worksheet,
            hidden,
        });
    }

    private _fireSheetHideChanged(workbook: FWorkbook, worksheet: FWorksheet, hidden: boolean): void {
        this.fireEvent(this.Event.SheetHideChanged, {
            workbook,
            worksheet,
            hidden,
        });
    }
}

FUniver.extend(FUniverSheetsMixin);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverSheetsMixin { }
}
