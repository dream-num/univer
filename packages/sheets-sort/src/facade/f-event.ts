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
import type { FRange, FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
import { FEventName, FUniver, ICommandService } from '@univerjs/core';
import { type ISortRangeCommandParams, SortRangeCommand, SortType } from '@univerjs/sheets-sort';
import { FSheetEventName } from '@univerjs/sheets/facade';

export interface IFSheetSortEventMixin {
    /**
     * This event will be emitted when a range on a worksheet is sorted.
     * Type of the event is {@link ISheetRangeSortedParams}.
     * @example
     * ```typescript
     * const callbackDisposable = univerAPI.addEvent(univerAPI.Event.SheetRangeSorted, (params) => {
     *   const { workbook, worksheet, sortColumn } = params;
     *   sortColumn.forEach((col) => {
     *    console.log(col.column, col.ascending);
     *  });
     * });
     * ```
     */
    SheetRangeSorted: 'SheetRangeSorted';
    /**
     * This event will be emitted before sorting a range on a worksheet.
     * Type of the event is {@link ISheetRangeSortParams}.
     * @example
     * ```typescript
     * const callbackDisposable = univerAPI.addEvent(univerAPI.Event.SheetBeforeRangeSort, (params) => {
     *   const { workbook, worksheet, sortColumn } = params;
     *   sortColumn.forEach((col) => {
     *    console.log(col.column, col.ascending);
     *   });
     * });
     * ```
     */
    SheetBeforeRangeSort: 'SheetBeforeRangeSort';
}

export class FSheetSortEventName extends FEventName implements IFSheetSortEventMixin {
    override readonly SheetRangeSorted = 'SheetRangeSorted' as const;
    override readonly SheetBeforeRangeSort = 'SheetBeforeRangeSort' as const;
}

interface ISortColumn {
    column: number;
    ascending: boolean;
}

export interface ISheetRangeSortParams extends IEventBase {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    range: FRange;
    sortColumn: ISortColumn[];
}

export interface ISheetRangeSortEventParamConfig {
    SheetBeforeRangeSort: ISheetRangeSortParams;
    SheetRangeSorted: ISheetRangeSortParams;
}

FEventName.extend(FSheetEventName);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends IFSheetSortEventMixin { }
    interface IEventParamConfig extends ISheetRangeSortEventParamConfig { }
}

class FUniverSheetsSortEventMixin extends FUniver {
    override _initialize(injector: Injector): void {
        const commandService = injector.get(ICommandService);

        this.disposeWithMe(commandService.beforeCommandExecuted((commandInfo) => {
            switch (commandInfo.id) {
                case SortRangeCommand.id:
                    this._beforeRangeSort(commandInfo as Readonly<ICommandInfo<ISortRangeCommandParams>>);
                    break;
            }
        }));

        this.disposeWithMe(commandService.onCommandExecuted((commandInfo) => {
            switch (commandInfo.id) {
                case SortRangeCommand.id:
                    this._onRangeSorted(commandInfo as Readonly<ICommandInfo<ISortRangeCommandParams>>);
                    break;
            }
        }));
    }

    private _beforeRangeSort(commandInfo: Readonly<ICommandInfo<ISortRangeCommandParams>>): void {
        const params = commandInfo.params!;
        const fWorkbook = this.getUniverSheet(params.unitId)!;
        const fWorksheet = fWorkbook.getSheetBySheetId(params.subUnitId)!;
        const { startColumn, endColumn, startRow, endRow } = params.range;
        const fRange = fWorksheet.getRange(startRow, startColumn, endRow - startRow + 1, endColumn - startColumn + 1);
        const eventParams: ISheetRangeSortParams = {
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
        const fWorkbook = this.getUniverSheet(params.unitId)!;
        const fWorksheet = fWorkbook.getSheetBySheetId(params.subUnitId)!;
        const { startColumn, endColumn, startRow, endRow } = params.range;
        const fRange = fWorksheet.getRange(startRow, startColumn, endRow - startRow + 1, endColumn - startColumn + 1);
        const eventParams: ISheetRangeSortParams = {
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

FUniver.extend(FUniverSheetsSortEventMixin);
