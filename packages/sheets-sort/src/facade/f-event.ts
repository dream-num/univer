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

import type { IEventBase } from '@univerjs/core/facade';
import type { FRange, FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
import { FEventName } from '@univerjs/core/facade';

/**
 * @ignore
 */
export interface IFSheetsSortEventNameMixin {
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

export class FSheetsSortEventNameMixin implements IFSheetsSortEventNameMixin {
    get SheetRangeSorted(): 'SheetRangeSorted' { return 'SheetRangeSorted' as const; }
    get SheetBeforeRangeSort(): 'SheetBeforeRangeSort' { return 'SheetBeforeRangeSort' as const; }
}

interface ISortColumn {
    column: number;
    ascending: boolean;
}

export interface ISheetsRangeSortEventParams extends IEventBase {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    range: FRange;
    sortColumn: ISortColumn[];
}

/**
 * @ignore
 */
export interface ISheetsSortEventParamConfig {
    SheetBeforeRangeSort: ISheetsRangeSortEventParams;
    SheetRangeSorted: ISheetsRangeSortEventParams;
}

FEventName.extend(FSheetsSortEventNameMixin);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends IFSheetsSortEventNameMixin { }
    interface IEventParamConfig extends ISheetsSortEventParamConfig { }
}
