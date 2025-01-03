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

import type { ICommandInfo, IEventBase, Injector } from '@univerjs/core';
import type { ISheetCommandSharedParams } from '@univerjs/sheets';
import type { ISetSheetsFilterCriteriaCommandParams } from '@univerjs/sheets-filter';
import type { FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
import { FEventName, FUniver, ICommandService } from '@univerjs/core';
import { ClearSheetsFilterCriteriaCommand, SetSheetsFilterCriteriaCommand } from '@univerjs/sheets-filter';
import { FSheetEventName } from '@univerjs/sheets/facade';

export interface IFSheetFilterEventMixin {
    /**
     * This event will be emitted when the filter criteria on a column is changed.
     * Type of the event is {@link ISheetRangeFilteredParams}.
     *
     * @example
     * ```typescript
     * const callbackDisposable = univerAPI.addEvent(univerAPI.Event.SheetRangeFiltered, (params) => {
     *   const { workbook, worksheet, col, criteria } = params;
     * });
     * ```
     */
    SheetRangeFiltered: 'SheetRangeFiltered';
    /**
     * This event will be emitted beftore the filter criteria on a column is changed.
     * Type of the event is {@link ISheetRangeFilteredParams}.
     *
     * @example
     * ```typescript
     * const callbackDisposable = univerAPI.addEvent(univerAPI.Event.SheetBeforeRangeFilter, (params) => {
     *   const { workbook, worksheet, col, criteria } = params;
     * });
     * ```
     */
    SheetBeforeRangeFilter: 'SheetBeforeRangeFilter';
    /**
     * This event will be emitted when the filter on a worksheet is cleared.
     * Type of the event is {@link ISheetRangeFilterClearedEventParams}.
     *
     * @example
     * ```typescript
     * const callbackDisposable = univerAPI.addEvent(univerAPI.Event.SheetRangeFilterCleared, (params) => {
     *   const { workbook, worksheet } = params;
     * });
     * ```
     */
    SheetRangeFilterCleared: 'SheetRangeFilterCleared';
    /**
     * This event will be emitted after the filter on a worksheet is cleared.
     * Type of the event is {@link ISheetRangeFilterClearedEventParams}.
     *
     * @example
     * ```typescript
     * const callbackDisposable = univerAPI.addEvent(univerAPI.Event.SheetBeforeRangeFilterClear, (params) => {
     *   const { workbook, worksheet } = params;
     * });
     * ```
     */
    SheetBeforeRangeFilterClear: 'SheetBeforeRangeFilterClear';
}

export class FSheetFilterEventName extends FEventName implements IFSheetFilterEventMixin {
    override readonly SheetRangeFiltered = 'SheetRangeFiltered' as const;
    override readonly SheetBeforeRangeFilter = 'SheetBeforeRangeFilter' as const;
    override readonly SheetRangeFilterCleared = 'SheetRangeFilterCleared' as const;
    override readonly SheetBeforeRangeFilterClear = 'SheetBeforeRangeFilterClear' as const;
}

export interface ISheetRangeFilteredParams extends IEventBase, Pick<ISetSheetsFilterCriteriaCommandParams, 'criteria' | 'col'> {
    workbook: FWorkbook;
    worksheet: FWorksheet;
}

export interface ISheetRangeFilterClearedEventParams extends IEventBase {
    workbook: FWorkbook;
    worksheet: FWorksheet;
}

export interface ISheetRangeFilterEventParamConfig {
    SheetBeforeRangeFilter: ISheetRangeFilteredParams;
    SheetRangeFiltered: ISheetRangeFilteredParams;
    SheetBeforeRangeFilterClear: ISheetRangeFilterClearedEventParams;
    SheetRangeFilterCleared: ISheetRangeFilterClearedEventParams;
}

FEventName.extend(FSheetEventName);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends IFSheetFilterEventMixin { }
    interface IEventParamConfig extends ISheetRangeFilterEventParamConfig { }
}

class FUniverSheetsFilterEventMixin extends FUniver {
    override _initialize(injector: Injector): void {
        const commandService = injector.get(ICommandService);

        this.disposeWithMe(commandService.beforeCommandExecuted((commandInfo) => {
            switch (commandInfo.id) {
                case SetSheetsFilterCriteriaCommand.id:
                    this._beforeRangeFilter(commandInfo as Readonly<ICommandInfo<ISetSheetsFilterCriteriaCommandParams>>);
                    break;
                case ClearSheetsFilterCriteriaCommand.id:
                    this._beforeRangeFilterClear(commandInfo as Readonly<ICommandInfo<ISheetCommandSharedParams>>);
                    break;
            }
        }));

        this.disposeWithMe(commandService.onCommandExecuted((commandInfo) => {
            switch (commandInfo.id) {
                case SetSheetsFilterCriteriaCommand.id:
                    this._onRangeFiltered(commandInfo as Readonly<ICommandInfo<ISetSheetsFilterCriteriaCommandParams>>);
                    break;
                case ClearSheetsFilterCriteriaCommand.id:
                    this._onRangeFilterCleared(commandInfo as Readonly<ICommandInfo<ISheetCommandSharedParams>>);
                    break;
            }
        }));
    }

    private _beforeRangeFilter(commandInfo: Readonly<ICommandInfo<ISetSheetsFilterCriteriaCommandParams>>): void {
        const params = commandInfo.params!;
        const fWorkbook = this.getUniverSheet(params.unitId)!;
        const eventParams: ISheetRangeFilteredParams = {
            workbook: fWorkbook,
            worksheet: fWorkbook.getSheetBySheetId(params.subUnitId)!,
            col: params.col,
            criteria: params.criteria,
        };

        this.fireEvent(this.Event.SheetBeforeRangeFilter, eventParams);
        if (eventParams.cancel) {
            throw new Error('SetSheetsFilterCriteriaCommand canceled.');
        }
    }

    private _onRangeFiltered(commandInfo: Readonly<ICommandInfo<ISetSheetsFilterCriteriaCommandParams>>): void {
        const params = commandInfo.params!;
        const fWorkbook = this.getUniverSheet(params.unitId)!;
        const eventParams: ISheetRangeFilteredParams = {
            workbook: fWorkbook,
            worksheet: fWorkbook.getSheetBySheetId(params.subUnitId)!,
            col: params.col,
            criteria: params.criteria,
        };

        this.fireEvent(this.Event.SheetRangeFiltered, eventParams);
        if (eventParams.cancel) {
            throw new Error('SetSheetsFilterCriteriaCommand canceled.');
        }
    }

    private _beforeRangeFilterClear(commandInfo: Readonly<ICommandInfo<ISheetCommandSharedParams>>): void {
        const params = commandInfo.params!;
        const fWorkbook = this.getUniverSheet(params.unitId)!;
        const eventParams: ISheetRangeFilterClearedEventParams = {
            workbook: fWorkbook,
            worksheet: fWorkbook.getSheetBySheetId(params.subUnitId)!,
        };

        this.fireEvent(this.Event.SheetBeforeRangeFilterClear, eventParams);
        if (eventParams.cancel) {
            throw new Error('SetSheetsFilterCriteriaCommand canceled.');
        }
    }

    private _onRangeFilterCleared(commandInfo: Readonly<ICommandInfo<ISheetCommandSharedParams>>): void {
        const params = commandInfo.params!;
        const fWorkbook = this.getUniverSheet(params.unitId)!;
        const eventParams: ISheetRangeFilterClearedEventParams = {
            workbook: fWorkbook,
            worksheet: fWorkbook.getSheetBySheetId(params.subUnitId)!,
        };

        this.fireEvent(this.Event.SheetRangeFilterCleared, eventParams);
        if (eventParams.cancel) {
            throw new Error('SetSheetsFilterCriteriaCommand canceled.');
        }
    }
}

FUniver.extend(FUniverSheetsFilterEventMixin);
