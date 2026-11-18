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
import type { ISheetCommandSharedParams } from '@univerjs/sheets';
import type { ISetSheetsFilterCriteriaCommandParams } from '@univerjs/sheets-filter';
import { ICommandService } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { ClearSheetsFilterCriteriaCommand, SetSheetsFilterCriteriaCommand } from '@univerjs/sheets-filter';
import type { ISheetsRangeFilteredEventParams } from './f-event';

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
                        this._beforeRangeFilterClear(commandInfo.params);
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
                        this._onRangeFilterCleared(commandInfo.params);
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

    private _beforeRangeFilterClear(params?: Partial<ISheetCommandSharedParams>): void {
        const target = this.getSheetCommandTarget(params);
        if (!target) return;

        const { workbook, worksheet } = target;
        if (this.fireEvent(this.Event.SheetBeforeRangeFilterClear, { workbook, worksheet })) {
            throw new Error('ClearSheetsFilterCriteriaCommand canceled.');
        }
    }

    private _onRangeFilterCleared(params?: Partial<ISheetCommandSharedParams>): void {
        const target = this.getSheetCommandTarget(params);
        if (!target) return;

        const { workbook, worksheet } = target;
        this.fireEvent(this.Event.SheetRangeFilterCleared, { workbook, worksheet });
    }
}

FUniver.extend(FUniverSheetsFilterMixin);
