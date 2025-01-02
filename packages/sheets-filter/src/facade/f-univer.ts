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

import type { ICommandInfo, Injector } from '@univerjs/core';
import type { ISheetCommandSharedParams } from '@univerjs/sheets';
import type { ISetSheetsFilterCriteriaCommandParams } from '@univerjs/sheets-filter';
import type { ISheetRangeFilterClearedEventParams, ISheetRangeFilteredParams } from './f-event';
import { FUniver, ICommandService } from '@univerjs/core';
import { ClearSheetsFilterCriteriaCommand, SetSheetsFilterCriteriaCommand } from '@univerjs/sheets-filter';

export class FUniverSheetsFilterMixin extends FUniver {
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
        const fworkbook = this.getUniverSheet(params.unitId)!;
        const eventParams: ISheetRangeFilteredParams = {
            workbook: fworkbook,
            worksheet: fworkbook.getSheetBySheetId(params.subUnitId)!,
            col: params.col,
            criteria: params.criteria,
        };

        if (eventParams.cancel) {
            this.fireEvent(this.Event.SheetBeforeRangeFilter, eventParams);
            throw new Error('SetSheetsFilterCriteriaCommand canceled.');
        }
    }

    private _onRangeFiltered(commandInfo: Readonly<ICommandInfo<ISetSheetsFilterCriteriaCommandParams>>): void {
        const params = commandInfo.params!;
        const fworkbook = this.getUniverSheet(params.unitId)!;
        const eventParams: ISheetRangeFilteredParams = {
            workbook: fworkbook,
            worksheet: fworkbook.getSheetBySheetId(params.subUnitId)!,
            col: params.col,
            criteria: params.criteria,
        };

        if (eventParams.cancel) {
            this.fireEvent(this.Event.SheetRangeFiltered, eventParams);
            throw new Error('SetSheetsFilterCriteriaCommand canceled.');
        }
    }

    private _beforeRangeFilterClear(commandInfo: Readonly<ICommandInfo<ISheetCommandSharedParams>>): void {
        const params = commandInfo.params!;
        const fworkbook = this.getUniverSheet(params.unitId)!;
        const eventParams: ISheetRangeFilterClearedEventParams = {
            workbook: fworkbook,
            worksheet: fworkbook.getSheetBySheetId(params.subUnitId)!,
        };

        if (eventParams.cancel) {
            this.fireEvent(this.Event.SheetBeforeRangeFilterClear, eventParams);
            throw new Error('SetSheetsFilterCriteriaCommand canceled.');
        }
    }

    private _onRangeFilterCleared(commandInfo: Readonly<ICommandInfo<ISheetCommandSharedParams>>): void {
        const params = commandInfo.params!;
        const fworkbook = this.getUniverSheet(params.unitId)!;
        const eventParams: ISheetRangeFilterClearedEventParams = {
            workbook: fworkbook,
            worksheet: fworkbook.getSheetBySheetId(params.subUnitId)!,
        };

        if (eventParams.cancel) {
            this.fireEvent(this.Event.SheetRangeFilterCleared, eventParams);
            throw new Error('SetSheetsFilterCriteriaCommand canceled.');
        }
    }
}

FUniver.extend(FUniverSheetsFilterMixin);

