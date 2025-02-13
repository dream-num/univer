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

import type { ICommandInfo, ICreateUnitOptions, IDisposable, Injector, IWorkbookData, Nullable, Workbook } from '@univerjs/core';
import type { CommandListenerValueChange, IInsertSheetCommandParams, IRemoveSheetCommandParams, ISetGridlinesColorCommandParams, ISetTabColorMutationParams, ISetWorksheetActivateCommandParams, ISetWorksheetHideMutationParams, ISetWorksheetNameCommandParams, ISetWorksheetOrderMutationParams, IToggleGridlinesCommandParams } from '@univerjs/sheets';
import type { IBeforeSheetCreateEventParams, ISheetCreatedEventParams } from './f-event';
import type { FRange } from './f-range';
import type { FWorksheet } from './f-worksheet';
import { CanceledError, ICommandService, IUniverInstanceService, toDisposable, UniverInstanceType } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { COMMAND_LISTENER_VALUE_CHANGE, getValueChangedEffectedRange, InsertSheetCommand, RemoveSheetCommand, SetGridlinesColorCommand, SetTabColorCommand, SetWorksheetActiveOperation, SetWorksheetHideCommand, SetWorksheetNameCommand, SetWorksheetOrderCommand, ToggleGridlinesCommand } from '@univerjs/sheets';
import { FDefinedNameBuilder } from './f-defined-name';
import { FPermission } from './f-permission';
import { FWorkbook } from './f-workbook';

/**
 * @ignore
 */
export interface IFUniverSheetsMixin {
    /**
     * @deprecated use `univerAPI.createWorkbook` instead.
     */
    createUniverSheet(data: Partial<IWorkbookData>): FWorkbook;

    /**
     * Create a new spreadsheet and get the API handler of that spreadsheet.
     * @param {Partial<IWorkbookData>} data The snapshot of the spreadsheet.
     * @param {ICreateUnitOptions} options The options of creating the spreadsheet.
     * @returns {FWorkbook} FWorkbook API instance.
     * @example
     * ```ts
     * univerAPI.createWorkbook({ id: 'Sheet1', name: 'Sheet1' });
     * ```
     *
     * Add you can make the workbook not as the active workbook by setting options:
     * ```ts
     * univerAPI.createWorkbook({ id: 'Sheet1', name: 'Sheet1' }, { makeCurrent: false });
     * ```
     */
    createWorkbook(data: Partial<IWorkbookData>, options?: ICreateUnitOptions): FWorkbook;

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
     *   const target = univerAPI.getCommandSheetTarget(commandInfo);
     *   if (!target) return;
     *   const { workbook, worksheet } = target;
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
        if (!params) return this.getActiveSheet();
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

        // Register workbook disposed event handler
        this.registerEventHandler(
            this.Event.WorkbookDisposed,
            () => univerInstanceService.unitDisposed$.subscribe((unit) => {
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

        // Register workbook created event handler
        this.registerEventHandler(
            this.Event.WorkbookCreated,
            () => univerInstanceService.unitAdded$.subscribe((unit) => {
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

    /**
     * @ignore
     */
    // eslint-disable-next-line max-lines-per-function
    override _initialize(injector: Injector): void {
        const commandService = injector.get(ICommandService);

        this.registerEventHandler(
            this.Event.BeforeSheetCreate,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id === InsertSheetCommand.id) {
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
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeActiveSheetChange,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetWorksheetActiveOperation.id) {
                    const { subUnitId: sheetId, unitId } = commandInfo.params as ISetWorksheetActivateCommandParams;
                    const workbook = unitId ? this.getUniverSheet(unitId) : this.getActiveWorkbook?.();
                    if (!workbook || !sheetId) return;
                    const activeSheet = workbook.getSheetBySheetId(sheetId);
                    const oldActiveSheet = workbook.getActiveSheet();
                    if (!activeSheet || !oldActiveSheet) return;
                    this._fireBeforeActiveSheetChange(workbook, activeSheet, oldActiveSheet);
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeSheetDelete,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id === RemoveSheetCommand.id) {
                    const target = this.getCommandSheetTarget(commandInfo);
                    if (!target) return;
                    const { workbook, worksheet } = target;
                    this._fireBeforeSheetDelete(workbook, worksheet);
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeSheetMove,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetWorksheetOrderCommand.id) {
                    const { fromOrder, toOrder } = commandInfo.params as ISetWorksheetOrderMutationParams;
                    const target = this.getCommandSheetTarget(commandInfo);
                    if (!target) return;
                    this._fireBeforeSheetMove(target.workbook, target.worksheet, toOrder, fromOrder);
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeSheetNameChange,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetWorksheetNameCommand.id) {
                    const { name } = commandInfo.params as ISetWorksheetNameCommandParams;
                    const target = this.getCommandSheetTarget(commandInfo);
                    if (!target) return;
                    this._fireBeforeSheetNameChange(target.workbook, target.worksheet, name, target.worksheet.getSheetName());
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeSheetTabColorChange,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetTabColorCommand.id) {
                    const { color } = commandInfo.params as ISetTabColorMutationParams;
                    const target = this.getCommandSheetTarget(commandInfo);
                    if (!target) return;
                    this._fireBeforeSheetTabColorChange(target.workbook, target.worksheet, color, target.worksheet.getTabColor());
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeSheetHideChange,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetWorksheetHideCommand.id) {
                    const { hidden } = commandInfo.params as ISetWorksheetHideMutationParams;
                    const target = this.getCommandSheetTarget(commandInfo);
                    if (!target) return;
                    this._fireBeforeSheetHideChange(target.workbook, target.worksheet, Boolean(hidden));
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeGridlineColorChange,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetGridlinesColorCommand.id) {
                    const target = this.getCommandSheetTarget(commandInfo);
                    if (!target) return;
                    this.fireEvent(this.Event.BeforeGridlineColorChange, {
                        ...target,
                        color: (commandInfo.params as ISetGridlinesColorCommandParams)?.color,
                    });
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeGridlineEnableChange,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id === ToggleGridlinesCommand.id) {
                    const target = this.getCommandSheetTarget(commandInfo);
                    if (!target) return;
                    this.fireEvent(this.Event.BeforeGridlineEnableChange, {
                        ...target,
                        enabled: Boolean((commandInfo.params as IToggleGridlinesCommandParams)?.showGridlines) ?? !target.worksheet.hasHiddenGridLines(),
                    });
                }
            })
        );

        this.registerEventHandler(
            this.Event.SheetValueChanged,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (COMMAND_LISTENER_VALUE_CHANGE.indexOf(commandInfo.id) > -1) {
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
                }
            })
        );

        this.registerEventHandler(
            this.Event.SheetCreated,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === InsertSheetCommand.id) {
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
                }
            })
        );

        this.registerEventHandler(
            this.Event.ActiveSheetChanged,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetWorksheetActiveOperation.id) {
                    const target = this.getActiveSheet();
                    if (!target) return;
                    const { workbook, worksheet: activeSheet } = target;
                    this._fireActiveSheetChanged(workbook, activeSheet);
                }
            })
        );

        this.registerEventHandler(
            this.Event.SheetDeleted,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === RemoveSheetCommand.id) {
                    const { subUnitId: sheetId, unitId } = commandInfo.params as IRemoveSheetCommandParams;
                    const workbook = unitId ? this.getUniverSheet(unitId) : this.getActiveWorkbook?.();
                    if (!workbook || !sheetId) return;
                    this._fireSheetDeleted(workbook, sheetId);
                }
            })
        );

        this.registerEventHandler(
            this.Event.SheetMoved,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetWorksheetOrderCommand.id) {
                    const { toOrder: toIndex } = commandInfo.params as ISetWorksheetOrderMutationParams;
                    const target = this.getCommandSheetTarget(commandInfo);
                    if (!target) return;
                    this._fireSheetMoved(target.workbook, target.worksheet, toIndex);
                }
            })
        );

        this.registerEventHandler(
            this.Event.SheetNameChanged,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetWorksheetNameCommand.id) {
                    const { name } = commandInfo.params as ISetWorksheetNameCommandParams;
                    const target = this.getCommandSheetTarget(commandInfo);
                    if (!target) return;
                    this._fireSheetNameChanged(target.workbook, target.worksheet, name);
                }
            })
        );

        this.registerEventHandler(
            this.Event.SheetTabColorChanged,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetTabColorCommand.id) {
                    const { color } = commandInfo.params as ISetTabColorMutationParams;
                    const target = this.getCommandSheetTarget(commandInfo);
                    if (!target) return;
                    this._fireSheetTabColorChanged(target.workbook, target.worksheet, color);
                }
            })
        );

        this.registerEventHandler(
            this.Event.SheetHideChanged,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetWorksheetHideCommand.id) {
                    const { hidden } = commandInfo.params as ISetWorksheetHideMutationParams;
                    const target = this.getCommandSheetTarget(commandInfo);
                    if (!target) return;
                    this._fireSheetHideChanged(target.workbook, target.worksheet, !!hidden);
                }
            })
        );

        this.registerEventHandler(
            this.Event.GridlineChanged,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetGridlinesColorCommand.id || commandInfo.id === ToggleGridlinesCommand.id) {
                    const target = this.getCommandSheetTarget(commandInfo);
                    if (!target) return;
                    this.fireEvent(this.Event.GridlineChanged, {
                        ...target,
                        enabled: !target.worksheet.hasHiddenGridLines(),
                        color: target.worksheet.getGridLinesColor(),
                    });
                }
            })
        );

        this._initWorkbookEvent(injector);
    }

    override createUniverSheet(data: Partial<IWorkbookData>, options?: ICreateUnitOptions): FWorkbook {
        const instanceService = this._injector.get(IUniverInstanceService);
        const workbook = instanceService.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, data, options);
        return this._injector.createInstance(FWorkbook, workbook);
    };

    override createWorkbook(data: Partial<IWorkbookData>, options?: ICreateUnitOptions): FWorkbook {
        return this.createUniverSheet(data, options);
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
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverSheetsMixin { }
}
