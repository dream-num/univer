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

import type { ICommandInfo, Injector } from '@univerjs/core';
import type { ISetSheetsFilterCriteriaCommandParams } from '@univerjs/sheets-filter';
import type { ISheetsRangeFilterClearedEventParams, ISheetsRangeFilteredEventParams } from './f-event';
import { ICommandService } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { ClearSheetsFilterCriteriaCommand, SetSheetsFilterCriteriaCommand } from '@univerjs/sheets-filter';

export class FUniverSheetsFilterMixin extends FUniver {
    /**
     * @ignore
     */
    override _initialize(injector: Injector): void {
        const commandService = injector.get(ICommandService);

        // Register filter criteria set event handlers
        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetBeforeRangeFilter,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id === SetSheetsFilterCriteriaCommand.id) {
                        this._beforeRangeFilter(commandInfo as Readonly<ICommandInfo<ISetSheetsFilterCriteriaCommandParams>>);
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetBeforeRangeFilterClear,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id === ClearSheetsFilterCriteriaCommand.id) {
                        this._beforeRangeFilterClear();
                    }
                })
            )
        );

        // Register filter criteria execution event handlers
        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetRangeFiltered,
                () => commandService.onCommandExecuted((commandInfo) => {
                    if (commandInfo.id === SetSheetsFilterCriteriaCommand.id) {
                        this._onRangeFiltered(commandInfo as Readonly<ICommandInfo<ISetSheetsFilterCriteriaCommandParams>>);
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetRangeFilterCleared,
                () => commandService.onCommandExecuted((commandInfo) => {
                    if (commandInfo.id === ClearSheetsFilterCriteriaCommand.id) {
                        this._onRangeFilterCleared();
                    }
                })
            )
        );
    }

    private _beforeRangeFilter(commandInfo: Readonly<ICommandInfo<ISetSheetsFilterCriteriaCommandParams>>): void {
        const params = commandInfo.params!;
        const fWorkbook = this.getWorkbook(params.unitId)!;
        const eventParams: ISheetsRangeFilteredEventParams = {
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
        const fWorkbook = this.getWorkbook(params.unitId)!;
        const eventParams: ISheetsRangeFilteredEventParams = {
            workbook: fWorkbook,
            worksheet: fWorkbook.getSheetBySheetId(params.subUnitId)!,
            col: params.col,
            criteria: params.criteria,
        };

        this.fireEvent(this.Event.SheetRangeFiltered, eventParams);
    }

    private _beforeRangeFilterClear(): void {
        const fWorkbook = this.getActiveWorkbook();
        if (!fWorkbook) return;

        const eventParams: ISheetsRangeFilterClearedEventParams = {
            workbook: fWorkbook,
            worksheet: fWorkbook.getActiveSheet(),
        };

        this.fireEvent(this.Event.SheetBeforeRangeFilterClear, eventParams);
        if (eventParams.cancel) {
            throw new Error('SetSheetsFilterCriteriaCommand canceled.');
        }
    }

    private _onRangeFilterCleared(): void {
        const fWorkbook = this.getActiveWorkbook();
        if (!fWorkbook) return;

        const eventParams: ISheetsRangeFilterClearedEventParams = {
            workbook: fWorkbook,
            worksheet: fWorkbook.getActiveSheet(),
        };

        this.fireEvent(this.Event.SheetRangeFilterCleared, eventParams);
    }
}

FUniver.extend(FUniverSheetsFilterMixin);
