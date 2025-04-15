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
import type { IBeforeActiveSheetChangeEvent, IBeforeGridlineColorChanged, IBeforeGridlineEnableChange, IBeforeSheetCreateEventParams, IBeforeSheetDeleteEvent, IBeforeSheetHideChangeEvent, IBeforeSheetMoveEvent, IBeforeSheetNameChangeEvent, IBeforeSheetTabColorChangeEvent, ISheetCreatedEventParams } from './f-event';
import type { FRange } from './f-range';
import type { FWorksheet } from './f-worksheet';
import { CanceledError, ICommandService, IUniverInstanceService, toDisposable, UniverInstanceType } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { COMMAND_LISTENER_VALUE_CHANGE, getValueChangedEffectedRange, InsertSheetCommand, RemoveSheetCommand, SetGridlinesColorCommand, SetTabColorMutation, SetWorksheetActiveOperation, SetWorksheetHideMutation, SetWorksheetNameCommand, SetWorksheetOrderMutation, ToggleGridlinesCommand } from '@univerjs/sheets';
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
     * const fWorkbook = univerAPI.createWorkbook({ id: 'Sheet1', name: 'Sheet1' });
     * console.log(fWorkbook);
     * ```
     *
     * Add you can make the workbook not as the active workbook by setting options:
     * ```ts
     * const fWorkbook = univerAPI.createWorkbook({ id: 'Sheet1', name: 'Sheet1' }, { makeCurrent: false });
     * console.log(fWorkbook);
     * ```
     */
    createWorkbook(data: Partial<IWorkbookData>, options?: ICreateUnitOptions): FWorkbook;

    /**
     * Get the currently focused Univer spreadsheet.
     * @returns {FWorkbook | null} The currently focused Univer spreadsheet.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * console.log(fWorkbook);
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
     *
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getUniverSheet('Sheet1');
     * console.log(fWorkbook);
     *
     * const fWorkbook = univerAPI.getWorkbook('Sheet1');
     * console.log(fWorkbook);
     * ```
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
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const definedNameBuilder = univerAPI.newDefinedName()
     *   .setRef('Sheet1!$A$1')
     *   .setName('MyDefinedName')
     *   .setComment('This is a comment');
     * console.log(definedNameBuilder);
     * fWorkbook.insertDefinedNameBuilder(definedNameBuilder.build());
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
     * const unitId = 'workbook-01';
     * const subUnitId = 'sheet-0001';
     * const target = univerAPI.getSheetTarget(unitId, subUnitId);
     * if (!target) return;
     * const { workbook, worksheet } = target;
     * console.log(workbook, worksheet);
     * ```
     */
    getSheetTarget(unitId: string, subUnitId: string): Nullable<{ workbook: FWorkbook; worksheet: FWorksheet }>;

    /**
     * Get the target of the sheet.
     * @param {ICommandInfo<object>} commandInfo - The commandInfo of the command.
     * @returns {Nullable<{ workbook: FWorkbook; worksheet: FWorksheet }>} - The target of the sheet.
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.CommandExecuted, (event) => {
     *   const { options, ...commandInfo } = event;
     *   const target = univerAPI.getCommandSheetTarget(commandInfo);
     *   if (!target) return;
     *   const { workbook, worksheet } = target;
     *   console.log(workbook, worksheet);
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
     * console.log(workbook, worksheet);
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
                    this.fireEvent(this.Event.WorkbookDisposed, {
                        unitId: unit.getUnitId(),
                        unitType: unit.type,
                        snapshot: unit.getSnapshot() as IWorkbookData,
                    });
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
                    this.fireEvent(this.Event.WorkbookCreated, {
                        unitId: unit.getUnitId(),
                        type: unit.type,
                        workbook: workbookUnit,
                        unit: workbookUnit,
                    });
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
                    this.fireEvent(this.Event.BeforeSheetCreate, eventParams);
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
                    const eventParams: IBeforeActiveSheetChangeEvent = {
                        workbook,
                        activeSheet,
                        oldActiveSheet,
                    };
                    this.fireEvent(this.Event.BeforeActiveSheetChange, eventParams);
                    // cancel this command
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
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
                    const eventParams: IBeforeSheetDeleteEvent = {
                        workbook,
                        worksheet,
                    };
                    this.fireEvent(this.Event.BeforeSheetDelete, eventParams);
                    // cancel this command
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeSheetMove,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetWorksheetOrderMutation.id) {
                    const { fromOrder, toOrder } = commandInfo.params as ISetWorksheetOrderMutationParams;
                    const target = this.getCommandSheetTarget(commandInfo);
                    if (!target) return;
                    const eventParams: IBeforeSheetMoveEvent = {
                        workbook: target.workbook,
                        worksheet: target.worksheet,
                        newIndex: toOrder,
                        oldIndex: fromOrder,
                    };
                    this.fireEvent(this.Event.BeforeSheetMove, eventParams);
                    // cancel this command
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
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
                    const eventParams: IBeforeSheetNameChangeEvent = {
                        workbook: target.workbook,
                        worksheet: target.worksheet,
                        newName: name,
                        oldName: target.worksheet.getSheetName(),
                    };
                    this.fireEvent(this.Event.BeforeSheetNameChange, eventParams);
                    // cancel this command
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeSheetTabColorChange,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetTabColorMutation.id) {
                    const { color } = commandInfo.params as ISetTabColorMutationParams;
                    const target = this.getCommandSheetTarget(commandInfo);
                    if (!target) return;
                    const eventParams: IBeforeSheetTabColorChangeEvent = {
                        workbook: target.workbook,
                        worksheet: target.worksheet,
                        newColor: color,
                        oldColor: target.worksheet.getTabColor(),
                    };
                    this.fireEvent(this.Event.BeforeSheetTabColorChange, eventParams);
                    // cancel this command
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeSheetHideChange,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetWorksheetHideMutation.id) {
                    const { hidden } = commandInfo.params as ISetWorksheetHideMutationParams;
                    const target = this.getCommandSheetTarget(commandInfo);
                    if (!target) return;
                    const eventParams: IBeforeSheetHideChangeEvent = {
                        workbook: target.workbook,
                        worksheet: target.worksheet,
                        hidden: Boolean(hidden),
                    };
                    this.fireEvent(this.Event.BeforeSheetHideChange, eventParams);
                    // cancel this command
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeGridlineColorChange,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id === SetGridlinesColorCommand.id) {
                    const target = this.getCommandSheetTarget(commandInfo);
                    if (!target) return;
                    const eventParams: IBeforeGridlineColorChanged = {
                        ...target,
                        color: (commandInfo.params as ISetGridlinesColorCommandParams)?.color,
                    };
                    this.fireEvent(this.Event.BeforeGridlineColorChange, eventParams);
                    // cancel this command
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeGridlineEnableChange,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id === ToggleGridlinesCommand.id) {
                    const target = this.getCommandSheetTarget(commandInfo);
                    if (!target) return;
                    const eventParams: IBeforeGridlineEnableChange = {
                        ...target,
                        enabled: Boolean((commandInfo.params as IToggleGridlinesCommandParams)?.showGridlines) ?? !target.worksheet.hasHiddenGridLines(),
                    };
                    this.fireEvent(this.Event.BeforeGridlineEnableChange, eventParams);
                    // cancel this command
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
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
                if (commandInfo.id === SetWorksheetOrderMutation.id) {
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
                if (commandInfo.id === SetTabColorMutation.id) {
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
                if (commandInfo.id === SetWorksheetHideMutation.id) {
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

    private _fireActiveSheetChanged(workbook: FWorkbook, newActiveSheet: FWorksheet): void {
        this.fireEvent(this.Event.ActiveSheetChanged, {
            workbook,
            activeSheet: newActiveSheet,
        });
    }

    private _fireSheetDeleted(workbook: FWorkbook, sheetId: string): void {
        this.fireEvent(this.Event.SheetDeleted, {
            workbook,
            sheetId,
        });
    }

    private _fireSheetMoved(workbook: FWorkbook, worksheet: FWorksheet, toIndex: number): void {
        this.fireEvent(this.Event.SheetMoved, {
            workbook,
            worksheet,
            newIndex: toIndex,
        });
    }

    private _fireSheetNameChanged(workbook: FWorkbook, worksheet: FWorksheet, newName: string): void {
        this.fireEvent(this.Event.SheetNameChanged, {
            workbook,
            worksheet,
            newName,
        });
    }

    private _fireSheetTabColorChanged(workbook: FWorkbook, worksheet: FWorksheet, newColor: string): void {
        this.fireEvent(this.Event.SheetTabColorChanged, {
            workbook,
            worksheet,
            newColor,
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
