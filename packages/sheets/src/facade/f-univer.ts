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
import type { IInsertSheetCommandParams } from '@univerjs/sheets';
import type { IBeforeSheetCreateEventParams, ISheetCreatedEventParams } from './f-event';
import type { FWorksheet } from './f-worksheet';
import { CanceledError, FUniver, ICommandService, IUniverInstanceService, toDisposable, UniverInstanceType } from '@univerjs/core';
import { InsertSheetCommand } from '@univerjs/sheets';
import { FDefinedNameBuilder } from './f-defined-name';
import { FPermission } from './f-permission';
import { FWorkbook } from './f-workbook';

export interface IFUniverSheetsMixin {
    /**
     * Create a new spreadsheet and get the API handler of that spreadsheet.
     *
     * @param {Partial<IWorkbookData>} data The snapshot of the spreadsheet.
     * @returns {FWorkbook} FWorkbook API instance.
     * @example
     * ```ts
     * univerAPI.createUniverSheet({ id: 'Sheet1', name: 'Sheet1' });
     * ```
     */
    createUniverSheet(data: Partial<IWorkbookData>): FWorkbook;
    /**
     * Get the currently focused Univer spreadsheet.
     * @returns {FWorkbook | null} The currently focused Univer spreadsheet.
     * @example
     * ```ts
     * univerAPI.getActiveUniverSheet();
     * ```
     */
    getActiveUniverSheet(): FWorkbook | null;
    /**
     * @deprecated use `getActiveUniverSheet` as instead.
     */
    getActiveWorkbook(): FWorkbook | null;
    /**
     * Get the spreadsheet API handler by the spreadsheet id.
     *
     * @param {string} id The spreadsheet id.
     * @returns {FWorkbook | null} The spreadsheet API instance.
     */
    getUniverSheet(id: string): FWorkbook | null;
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
     *
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

    override _initialize(injector: Injector): void {
        const commandService = injector.get(ICommandService);
        this.disposeWithMe(
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

                    default:
                        break;
                }
            })
        );

        this.disposeWithMe(
            commandService.onCommandExecuted((commandInfo) => {
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

    override getActiveUniverSheet(): FWorkbook | null {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return null;
        }

        return this._injector.createInstance(FWorkbook, workbook);
    }

    override getActiveWorkbook(): FWorkbook | null {
        return this.getActiveUniverSheet();
    }

    override getUniverSheet(id: string): FWorkbook | null {
        const workbook = this._univerInstanceService.getUnit<Workbook>(id, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return null;
        }

        return this._injector.createInstance(FWorkbook, workbook);
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
}

FUniver.extend(FUniverSheetsMixin);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverSheetsMixin { }
}
