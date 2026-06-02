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
import type { ISortRangeCommandParams } from '@univerjs/sheets-sort';
import type { ISheetsRangeSortEventParams } from './f-event';
import { ICommandService } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { SortRangeCommand, SortType } from '@univerjs/sheets-sort';

export class FUniverSheetsSortMixin extends FUniver {
    /**
     * @ignore
     */
    override _initialize(injector: Injector): void {
        const commandService = injector.get(ICommandService);

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetBeforeRangeSort,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id !== SortRangeCommand.id) return;
                    this._beforeRangeSort(commandInfo as Readonly<ICommandInfo<ISortRangeCommandParams>>);
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.SheetRangeSorted,
                () => commandService.onCommandExecuted((commandInfo) => {
                    if (commandInfo.id !== SortRangeCommand.id) return;
                    this._onRangeSorted(commandInfo as Readonly<ICommandInfo<ISortRangeCommandParams>>);
                })
            )
        );
    }

    private _beforeRangeSort(commandInfo: Readonly<ICommandInfo<ISortRangeCommandParams>>): void {
        const params = commandInfo.params!;
        const fWorkbook = this.getWorkbook(params.unitId)!;
        const fWorksheet = fWorkbook.getSheetBySheetId(params.subUnitId)!;
        const { startColumn, endColumn, startRow, endRow } = params.range;
        const fRange = fWorksheet.getRange(startRow, startColumn, endRow - startRow + 1, endColumn - startColumn + 1);
        const eventParams: ISheetsRangeSortEventParams = {
            workbook: fWorkbook,
            worksheet: fWorksheet,
            range: fRange,
            sortColumn: params.orderRules.map((rule) => ({
                column: rule.colIndex - startColumn,
                ascending: rule.type === SortType.ASC,
            })),
        };

        this.fireEvent(this.Event.SheetBeforeRangeSort, eventParams);
        if (eventParams.cancel) {
            throw new Error('SortRangeCommand canceled.');
        }
    }

    private _onRangeSorted(commandInfo: Readonly<ICommandInfo<ISortRangeCommandParams>>): void {
        const params = commandInfo.params!;
        const fWorkbook = this.getWorkbook(params.unitId)!;
        const fWorksheet = fWorkbook.getSheetBySheetId(params.subUnitId)!;
        const { startColumn, endColumn, startRow, endRow } = params.range;
        const fRange = fWorksheet.getRange(startRow, startColumn, endRow - startRow + 1, endColumn - startColumn + 1);
        const eventParams: ISheetsRangeSortEventParams = {
            workbook: fWorkbook,
            worksheet: fWorksheet,
            range: fRange,
            sortColumn: params.orderRules.map((rule) => ({
                column: rule.colIndex - startColumn,
                ascending: rule.type === SortType.ASC,
            })),
        };

        this.fireEvent(this.Event.SheetRangeSorted, eventParams);
        if (eventParams.cancel) {
            throw new Error('SortRangeCommand canceled.');
        }
    }
}

FUniver.extend(FUniverSheetsSortMixin);
