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

import type { ICreateUnitOptions, Injector, IWorkbookData, Workbook } from '@univerjs/core';
import type {
    CommandListenerValueChange,
    IInsertSheetCommandParams,
    IRemoveSheetCommandParams,
    ISetGridlinesColorCommandParams,
    ISetTabColorMutationParams,
    ISetWorksheetActiveOperationParams,
    ISetWorksheetHideMutationParams,
    ISetWorksheetNameCommandParams,
    ISetWorksheetOrderMutationParams,
    IToggleGridlinesCommandParams,
} from '@univerjs/sheets';
import type {
    IActiveSheetChangedEventParams,
    IBeforeActiveSheetChangeEventParams,
    IBeforeGridlineColorChangedEventParams,
    IBeforeGridlineEnableChangeEventParams,
    IBeforeSheetCreateEventParams,
    IBeforeSheetDeleteEventParams,
    IBeforeSheetHideChangeEventParams,
    IBeforeSheetMoveEventParams,
    IBeforeSheetNameChangeEventParams,
    IBeforeSheetTabColorChangeEventParams,
    IGridlineChangedEventParams,
    ISheetCreatedEventParams,
    ISheetDeletedEventParams,
    ISheetHideChangedEventParams,
    ISheetMovedEventParams,
    ISheetNameChangedEventParams,
    ISheetTabColorChangedEventParams,
    ISheetValueChangedEventParams,
    IWorkbookCreateEventParams,
    IWorkbookDisposedEventParams,
} from './f-event';
import type { FRange } from './f-range';
import type { FWorksheet } from './f-worksheet';
import { CanceledError, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import {
    COMMAND_LISTENER_VALUE_CHANGE,
    getValueChangedEffectedRange,
    InsertSheetCommand,
    RemoveSheetCommand,
    SetGridlinesColorCommand,
    SetTabColorMutation,
    SetWorksheetActiveOperation,
    SetWorksheetHideMutation,
    SetWorksheetNameCommand,
    SetWorksheetOrderMutation,
    SheetsFreezeSyncController,
    ToggleGridlinesCommand,
} from '@univerjs/sheets';
import { FWorkbook } from './f-workbook';

/**
 * @ignore
 */
export interface IFUniverSheetsMixin {
    /**
     * Create a new spreadsheet and get the API handler of that spreadsheet.
     * @param {Partial<IWorkbookData>} data The snapshot of the spreadsheet.
     * @param {ICreateUnitOptions} options The options of creating the spreadsheet.
     * @returns {FWorkbook} The spreadsheet API instance.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.createWorkbook({ id: 'workbook-01', name: 'Workbook1' });
     * console.log(fWorkbook);
     * ```
     *
     * Add you can make the workbook not as the active workbook by setting options:
     * ```ts
     * const fWorkbook = univerAPI.createWorkbook({ id: 'workbook-01', name: 'Workbook1' }, { makeCurrent: false });
     * console.log(fWorkbook);
     * ```
     */
    createWorkbook(data: Partial<IWorkbookData>, options?: ICreateUnitOptions): FWorkbook;

    /**
     * Get the currently focused Univer spreadsheet.
     * @returns {FWorkbook | null} The currently focused Univer spreadsheet API instance, or null if there is no active spreadsheet.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * console.log(fWorkbook);
     * ```
     */
    getActiveWorkbook(): FWorkbook | null;

    /**
     * Get the spreadsheet API handler by the spreadsheet id.
     * @param {string} id The spreadsheet id.
     * @returns {FWorkbook | null} The spreadsheet API instance corresponding to the spreadsheet id, or null if not found.
     *
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getWorkbook('workbook-01');
     * console.log(fWorkbook);
     * ```
     */
    getWorkbook(id: string): FWorkbook | null;

    /**
     * Get the target of the sheet.
     * @param {ICommandInfo<object>} commandInfo - The commandInfo of the command.
     * @returns {Nullable<{ workbook: FWorkbook; worksheet: FWorksheet }>} - The target of the sheet.
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.CommandExecuted, (event) => {
     *   const { options, ...commandInfo } = event;
     *   const target = univerAPI.getSheetCommandTarget(commandInfo.params);
     *   if (!target) return;
     *   const { workbook, worksheet } = target;
     *   console.log(workbook, worksheet);
     * });
     * ```
     */
    getSheetCommandTarget(params?: { unitId?: string; subUnitId?: string; sheetId?: string }): { workbook: FWorkbook; worksheet: FWorksheet; unitId: string; subUnitId: string } | null;

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
    getActiveSheet(): { workbook: FWorkbook; worksheet: FWorksheet } | null;

    /**
     * Set whether to enable synchronize the frozen state to other users in real-time collaboration.
     * @param {boolean} enabled - Whether to enable freeze sync. Default is true.
     * @example
     * ```ts
     * // Disable freeze sync
     * univerAPI.setFreezeSync(false);
     * ```
     */
    setFreezeSync(enabled: boolean): void;
}

export class FUniverSheetsMixin extends FUniver implements IFUniverSheetsMixin {
    override createWorkbook(data: Partial<IWorkbookData>, options?: ICreateUnitOptions): FWorkbook {
        const instanceService = this._injector.get(IUniverInstanceService);
        const workbook = instanceService.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, data, options);
        return this._injector.createInstance(FWorkbook, workbook);
    }

    override getActiveWorkbook(): FWorkbook | null {
        const workbook = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return null;
        }

        return this._injector.createInstance(FWorkbook, workbook);
    }

    override getWorkbook(id: string): FWorkbook | null {
        const workbook = this._univerInstanceService.getUnit<Workbook>(id, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return null;
        }

        return this._injector.createInstance(FWorkbook, workbook);
    }

    override getSheetCommandTarget(params: { unitId?: string; subUnitId?: string; sheetId?: string } = {}): { workbook: FWorkbook; worksheet: FWorksheet; unitId: string; subUnitId: string } | null {
        const { unitId, subUnitId, sheetId } = params;
        const workbook = unitId ? this.getWorkbook(unitId) : this.getActiveWorkbook();
        if (!workbook) {
            return null;
        }

        const sheetIdToFind = subUnitId || sheetId;
        const worksheet = sheetIdToFind ? workbook.getSheetBySheetId(sheetIdToFind) : workbook.getActiveSheet();
        if (!worksheet) {
            return null;
        }

        return {
            workbook,
            worksheet,
            unitId: workbook.getId(),
            subUnitId: worksheet.getSheetId(),
        };
    }

    override getActiveSheet(): { workbook: FWorkbook; worksheet: FWorksheet } | null {
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

    override setFreezeSync(enabled: boolean): void {
        const controller = this._injector.get(SheetsFreezeSyncController);
        controller.setEnabled(enabled);
    }

    /**
     * @ignore
     */
    // eslint-disable-next-line max-lines-per-function
    override _initialize(injector: Injector): void {
        const univerInstanceService = injector.get(IUniverInstanceService);
        const commandService = injector.get(ICommandService);

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetCreate,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id === InsertSheetCommand.id) {
                        const params = commandInfo.params as IInsertSheetCommandParams;
                        const { unitId, index, sheet } = params || {};

                        const workbook = unitId ? this.getWorkbook(unitId) : this.getActiveWorkbook();
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
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeActiveSheetChange,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id === SetWorksheetActiveOperation.id) {
                        const params = commandInfo.params as ISetWorksheetActiveOperationParams;
                        const target = this.getSheetCommandTarget(params);
                        if (!target) return;

                        const { workbook, worksheet: activeSheet } = target;
                        const oldActiveSheet = workbook.getActiveSheet();
                        if (!activeSheet || !oldActiveSheet) return;

                        const eventParams: IBeforeActiveSheetChangeEventParams = {
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
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetDelete,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id === RemoveSheetCommand.id) {
                        const params = commandInfo.params as IRemoveSheetCommandParams;
                        const target = this.getSheetCommandTarget(params);
                        if (!target) return;

                        const { workbook, worksheet } = target;

                        const eventParams: IBeforeSheetDeleteEventParams = {
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
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetMove,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id === SetWorksheetOrderMutation.id) {
                        const params = commandInfo.params as ISetWorksheetOrderMutationParams;
                        const target = this.getSheetCommandTarget(params);
                        if (!target) return;

                        const { workbook, worksheet } = target;
                        const { fromOrder: oldIndex, toOrder: newIndex } = params;

                        const eventParams: IBeforeSheetMoveEventParams = {
                            workbook,
                            worksheet,
                            newIndex,
                            oldIndex,
                        };
                        this.fireEvent(this.Event.BeforeSheetMove, eventParams);

                        // cancel this command
                        if (eventParams.cancel) {
                            throw new CanceledError();
                        }
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetNameChange,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id === SetWorksheetNameCommand.id) {
                        const params = commandInfo.params as ISetWorksheetNameCommandParams;
                        const target = this.getSheetCommandTarget(params);
                        if (!target) return;

                        const { workbook, worksheet } = target;
                        const oldName = worksheet.getSheetName();
                        const { name: newName } = params;

                        const eventParams: IBeforeSheetNameChangeEventParams = {
                            workbook,
                            worksheet,
                            newName,
                            oldName,
                        };
                        this.fireEvent(this.Event.BeforeSheetNameChange, eventParams);

                        // cancel this command
                        if (eventParams.cancel) {
                            throw new CanceledError();
                        }
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetTabColorChange,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id === SetTabColorMutation.id) {
                        const params = commandInfo.params as ISetTabColorMutationParams;
                        const target = this.getSheetCommandTarget(params);
                        if (!target) return;

                        const { workbook, worksheet } = target;
                        const oldColor = worksheet.getTabColor();
                        const { color: newColor } = params;

                        const eventParams: IBeforeSheetTabColorChangeEventParams = {
                            workbook,
                            worksheet,
                            newColor,
                            oldColor,
                        };
                        this.fireEvent(this.Event.BeforeSheetTabColorChange, eventParams);

                        // cancel this command
                        if (eventParams.cancel) {
                            throw new CanceledError();
                        }
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeSheetHideChange,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id === SetWorksheetHideMutation.id) {
                        const params = commandInfo.params as ISetWorksheetHideMutationParams;
                        const target = this.getSheetCommandTarget(params);
                        if (!target) return;

                        const { workbook, worksheet } = target;
                        const { hidden } = params;

                        const eventParams: IBeforeSheetHideChangeEventParams = {
                            workbook,
                            worksheet,
                            hidden: Boolean(hidden),
                        };
                        this.fireEvent(this.Event.BeforeSheetHideChange, eventParams);

                        // cancel this command
                        if (eventParams.cancel) {
                            throw new CanceledError();
                        }
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeGridlineColorChange,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id === SetGridlinesColorCommand.id) {
                        const params = commandInfo.params as ISetGridlinesColorCommandParams;
                        const target = this.getSheetCommandTarget(params);
                        if (!target) return;

                        const { workbook, worksheet } = target;
                        const { color } = params;

                        const eventParams: IBeforeGridlineColorChangedEventParams = {
                            workbook,
                            worksheet,
                            color,
                        };
                        this.fireEvent(this.Event.BeforeGridlineColorChange, eventParams);

                        // cancel this command
                        if (eventParams.cancel) {
                            throw new CanceledError();
                        }
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeGridlineEnableChange,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id === ToggleGridlinesCommand.id) {
                        const params = commandInfo.params as IToggleGridlinesCommandParams;
                        const target = this.getSheetCommandTarget(params);
                        if (!target) return;

                        const { workbook, worksheet } = target;
                        const showGridlines = params.showGridlines ?? !worksheet.hasHiddenGridLines();

                        const eventParams: IBeforeGridlineEnableChangeEventParams = {
                            workbook,
                            worksheet,
                            enabled: Boolean(showGridlines),
                        };
                        this.fireEvent(this.Event.BeforeGridlineEnableChange, eventParams);

                        // cancel this command
                        if (eventParams.cancel) {
                            throw new CanceledError();
                        }
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetValueChanged,
                () => commandService.onCommandExecuted((commandInfo) => {
                    if (COMMAND_LISTENER_VALUE_CHANGE.indexOf(commandInfo.id) > -1) {
                        const sheet = this.getActiveSheet();
                        if (!sheet) return;

                        const ranges = getValueChangedEffectedRange(univerInstanceService, commandInfo)
                            .map(
                                (range) => this.getWorkbook(range.unitId)
                                    ?.getSheetBySheetId(range.subUnitId)
                                    ?.getRange(range.range)
                            )
                            .filter(Boolean) as FRange[];
                        if (!ranges.length) return;

                        const eventParams: ISheetValueChangedEventParams = {
                            payload: commandInfo as CommandListenerValueChange,
                            effectedRanges: ranges,
                        };
                        this.fireEvent(this.Event.SheetValueChanged, eventParams);
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetCreated,
                () => commandService.onCommandExecuted((commandInfo) => {
                    if (commandInfo.id === InsertSheetCommand.id) {
                        const params = commandInfo.params as IInsertSheetCommandParams;
                        const workbook = params?.unitId ? this.getWorkbook(params.unitId) : this.getActiveWorkbook();
                        if (!workbook) return;

                        const sheets = workbook.getSheets();
                        const worksheet = params?.sheet?.id
                            ? workbook.getSheetBySheetId(params.sheet.id)
                            : sheets[params?.index ?? sheets.length - 1];
                        if (!worksheet) return;

                        const eventParams: ISheetCreatedEventParams = {
                            workbook,
                            worksheet,
                        };
                        this.fireEvent(this.Event.SheetCreated, eventParams);
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.ActiveSheetChanged,
                () => commandService.onCommandExecuted((commandInfo) => {
                    if (commandInfo.id === SetWorksheetActiveOperation.id) {
                        const params = commandInfo.params as ISetWorksheetActiveOperationParams;
                        const target = this.getSheetCommandTarget(params);
                        if (!target) return;

                        const { workbook, worksheet: activeSheet } = target;

                        const eventParams: IActiveSheetChangedEventParams = {
                            workbook,
                            activeSheet,
                        };
                        this.fireEvent(this.Event.ActiveSheetChanged, eventParams);
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetDeleted,
                () => commandService.onCommandExecuted((commandInfo) => {
                    if (commandInfo.id === RemoveSheetCommand.id) {
                        const { unitId, subUnitId: sheetId } = commandInfo.params as IRemoveSheetCommandParams;
                        const workbook = unitId ? this.getWorkbook(unitId) : this.getActiveWorkbook();
                        if (!workbook || !sheetId) return;

                        const eventParams: ISheetDeletedEventParams = {
                            workbook,
                            sheetId,
                        };
                        this.fireEvent(this.Event.SheetDeleted, eventParams);
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetMoved,
                () => commandService.onCommandExecuted((commandInfo) => {
                    if (commandInfo.id === SetWorksheetOrderMutation.id) {
                        const params = commandInfo.params as ISetWorksheetOrderMutationParams;
                        const target = this.getSheetCommandTarget(params);
                        if (!target) return;

                        const { workbook, worksheet } = target;
                        const { toOrder: newIndex } = params;

                        const eventParams: ISheetMovedEventParams = {
                            workbook,
                            worksheet,
                            newIndex,
                        };
                        this.fireEvent(this.Event.SheetMoved, eventParams);
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetNameChanged,
                () => commandService.onCommandExecuted((commandInfo) => {
                    if (commandInfo.id === SetWorksheetNameCommand.id) {
                        const params = commandInfo.params as ISetWorksheetNameCommandParams;
                        const target = this.getSheetCommandTarget(params);
                        if (!target) return;

                        const { workbook, worksheet } = target;
                        const { name: newName } = params;

                        const eventParams: ISheetNameChangedEventParams = {
                            workbook,
                            worksheet,
                            newName,
                        };
                        this.fireEvent(this.Event.SheetNameChanged, eventParams);
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetTabColorChanged,
                () => commandService.onCommandExecuted((commandInfo) => {
                    if (commandInfo.id === SetTabColorMutation.id) {
                        const params = commandInfo.params as ISetTabColorMutationParams;
                        const target = this.getSheetCommandTarget(params);
                        if (!target) return;

                        const { workbook, worksheet } = target;
                        const { color: newColor } = params;

                        const eventParams: ISheetTabColorChangedEventParams = {
                            workbook,
                            worksheet,
                            newColor,
                        };
                        this.fireEvent(this.Event.SheetTabColorChanged, eventParams);
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetHideChanged,
                () => commandService.onCommandExecuted((commandInfo) => {
                    if (commandInfo.id === SetWorksheetHideMutation.id) {
                        const params = commandInfo.params as ISetWorksheetHideMutationParams;
                        const target = this.getSheetCommandTarget(params);
                        if (!target) return;

                        const { workbook, worksheet } = target;
                        const { hidden } = params;

                        const eventParams: ISheetHideChangedEventParams = {
                            workbook,
                            worksheet,
                            hidden: Boolean(hidden),
                        };
                        this.fireEvent(this.Event.SheetHideChanged, eventParams);
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.GridlineChanged,
                () => commandService.onCommandExecuted((commandInfo) => {
                    if (commandInfo.id === SetGridlinesColorCommand.id || commandInfo.id === ToggleGridlinesCommand.id) {
                        const params = commandInfo.params as ISetGridlinesColorCommandParams | IToggleGridlinesCommandParams;
                        const target = this.getSheetCommandTarget(params);
                        if (!target) return;

                        const { workbook, worksheet } = target;
                        const enabled = !worksheet.hasHiddenGridLines();
                        const color = worksheet.getGridLinesColor();

                        const eventParams: IGridlineChangedEventParams = {
                            workbook,
                            worksheet,
                            enabled,
                            color,
                        };
                        this.fireEvent(this.Event.GridlineChanged, eventParams);
                    }
                })
            )
        );

        this._initWorkbookEvent(injector);
    }

    private _initWorkbookEvent(injector: Injector): void {
        const univerInstanceService = injector.get(IUniverInstanceService);

        // Register workbook disposed event handler
        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.WorkbookDisposed,
                () => univerInstanceService.unitDisposed$.subscribe((unit) => {
                    if (unit.type === UniverInstanceType.UNIVER_SHEET) {
                        const eventParams: IWorkbookDisposedEventParams = {
                            unitId: unit.getUnitId(),
                            unitType: unit.type,
                            snapshot: unit.getSnapshot() as IWorkbookData,
                        };
                        this.fireEvent(this.Event.WorkbookDisposed, eventParams);
                    }
                })
            )
        );

        // Register workbook created event handler
        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.WorkbookCreated,
                () => univerInstanceService.unitAdded$.subscribe((event) => {
                    const { unit } = event;
                    if (unit.type === UniverInstanceType.UNIVER_SHEET) {
                        const workbook = unit as Workbook;
                        const workbookUnit = injector.createInstance(FWorkbook, workbook);
                        const eventParams: IWorkbookCreateEventParams = {
                            unitId: unit.getUnitId(),
                            type: unit.type,
                            workbook: workbookUnit,
                            unit: workbookUnit,
                        };
                        this.fireEvent(this.Event.WorkbookCreated, eventParams);
                    }
                })
            )
        );
    }
}

FUniver.extend(FUniverSheetsMixin);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverSheetsMixin { }
}
