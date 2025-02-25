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
import type { IEventBase } from '@univerjs/core/facade';
import type { ISortRangeCommandParams } from '@univerjs/sheets-sort';
import type { FRange, FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
import { ICommandService } from '@univerjs/core';
import { FEventName, FUniver } from '@univerjs/core/facade';
import { SortRangeCommand, SortType } from '@univerjs/sheets-sort';
import { FSheetEventName } from '@univerjs/sheets/facade';

/**
 * @ignore
 */
export interface IFSheetSortEventMixin {
    /**
     * This event will be emitted when a range on a worksheet is sorted.
     * @see {@link ISheetRangeSortParams}
     * @example
     * ```typescript
     * const callbackDisposable = univerAPI.addEvent(univerAPI.Event.SheetRangeSorted, (params) => {
     *   console.log(params);
     *   const { workbook, worksheet, range, sortColumn } = params;
     * });
     *
     * // Remove the event listener, use `callbackDisposable.dispose()`
     * ```
     */
    SheetRangeSorted: 'SheetRangeSorted';

    /**
     * This event will be emitted before sorting a range on a worksheet.
     * @see {@link ISheetRangeSortParams}
     * @example
     * ```typescript
     * const callbackDisposable = univerAPI.addEvent(univerAPI.Event.SheetBeforeRangeSort, (params) => {
     *   console.log(params);
     *   const { workbook, worksheet, range, sortColumn } = params;
     *
     *   // Cancel the sorting operation.
     *   params.cancel = true;
     * });
     *
     * // Remove the event listener, use `callbackDisposable.dispose()`
     * ```
     */
    SheetBeforeRangeSort: 'SheetBeforeRangeSort';
}

export class FSheetSortEventName implements IFSheetSortEventMixin {
    get SheetRangeSorted(): 'SheetRangeSorted' { return 'SheetRangeSorted' as const; }
    get SheetBeforeRangeSort(): 'SheetBeforeRangeSort' { return 'SheetBeforeRangeSort' as const; }
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

/**
 * @ignore
 */
export interface ISheetRangeSortEventParamConfig {
    SheetBeforeRangeSort: ISheetRangeSortParams;
    SheetRangeSorted: ISheetRangeSortParams;
}

FEventName.extend(FSheetEventName);

class FUniverSheetsSortEventMixin extends FUniver {
    /**
     * @ignore
     */
    override _initialize(injector: Injector): void {
        const commandService = injector.get(ICommandService);

        this.registerEventHandler(
            this.Event.SheetBeforeRangeSort,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id !== SortRangeCommand.id) return;
                this._beforeRangeSort(commandInfo as Readonly<ICommandInfo<ISortRangeCommandParams>>);
            })
        );

        this.registerEventHandler(
            this.Event.SheetRangeSorted,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id !== SortRangeCommand.id) return;
                this._onRangeSorted(commandInfo as Readonly<ICommandInfo<ISortRangeCommandParams>>);
            })
        );
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
FEventName.extend(FSheetSortEventName);

declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends IFSheetSortEventMixin { }
    interface IEventParamConfig extends ISheetRangeSortEventParamConfig { }
}
