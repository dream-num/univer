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
import type { ISetSheetsFilterCriteriaCommandParams } from '@univerjs/sheets-filter';
import type { FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
import { FEventName } from '@univerjs/core/facade';

/**
 * The params of SheetRangeFiltered and SheetBeforeRangeFilter events.
 * @param workbook - The corresponding workbook wrapped in {@link FWorkbook}.
 * @param worksheet - The corresponding worksheet wrapped in {@link FWorksheet}.
 * @param col - The column on which the filter criteria is changed.
 * @param criteria - Raw filter criteria.
 */
export interface ISheetsRangeFilteredEventParams extends IEventBase, Pick<ISetSheetsFilterCriteriaCommandParams, 'criteria' | 'col'> {
    workbook: FWorkbook;
    worksheet: FWorksheet;
}

/**
 * The params of SheetRangeFilterCleared and SheetBeforeRangeFilterClear events.
 * @param workbook - The corresponding workbook wrapped in {@link FWorkbook}.
 * @param worksheet - The corresponding worksheet wrapped in {@link FWorksheet}.
 */
export interface ISheetsRangeFilterClearedEventParams extends IEventBase {
    workbook: FWorkbook;
    worksheet: FWorksheet;
}

/**
 * @ignore
 */
interface ISheetsFilterEventParamConfig {
    SheetBeforeRangeFilter: ISheetsRangeFilteredEventParams;
    SheetRangeFiltered: ISheetsRangeFilteredEventParams;
    SheetBeforeRangeFilterClear: ISheetsRangeFilterClearedEventParams;
    SheetRangeFilterCleared: ISheetsRangeFilterClearedEventParams;
}

/**
 * @ignore
 */
export interface IFSheetsFilterEventNameMixin {
    /**
     * This event will be emitted when the filter criteria on a column is changed.
     * @see {@link ISheetRangeFilteredParams}
     * @example
     * ```typescript
     * const callbackDisposable = univerAPI.addEvent(univerAPI.Event.SheetRangeFiltered, (params) => {
     *   console.log(params);
     *   const { workbook, worksheet, col, criteria } = params;
     *
     *   // your custom logic
     * });
     *
     * // Remove the event listener, use `callbackDisposable.dispose()`
     * ```
     */
    readonly SheetRangeFiltered: 'SheetRangeFiltered';

    /**
     * This event will be emitted before the filter criteria on a column is changed.
     * @see {@link ISheetRangeFilteredParams}
     * @example
     * ```typescript
     * const callbackDisposable = univerAPI.addEvent(univerAPI.Event.SheetBeforeRangeFilter, (params) => {
     *   console.log(params);
     *   const { workbook, worksheet, col, criteria } = params;
     *
     *   // your custom logic
     *
     *   // Cancel the filter criteria change operation
     *   params.cancel = true;
     * });
     *
     * // Remove the event listener, use `callbackDisposable.dispose()`
     * ```
     */
    readonly SheetBeforeRangeFilter: 'SheetBeforeRangeFilter';

    /**
     * This event will be emitted when the filter on a worksheet is cleared.
     * @see {@link ISheetRangeFilterClearedEventParams}
     * @example
     * ```typescript
     * const callbackDisposable = univerAPI.addEvent(univerAPI.Event.SheetRangeFilterCleared, (params) => {
     *   console.log(params);
     *   const { workbook, worksheet } = params;
     *
     *   // your custom logic
     * });
     *
     * // Remove the event listener, use `callbackDisposable.dispose()`
     * ```
     */
    readonly SheetRangeFilterCleared: 'SheetRangeFilterCleared';

    /**
     * This event will be emitted after the filter on a worksheet is cleared.
     * @see {@link ISheetRangeFilterClearedEventParams}
     * @example
     * ```typescript
     * const callbackDisposable = univerAPI.addEvent(univerAPI.Event.SheetBeforeRangeFilterClear, (params) => {
     *   console.log(params);
     *   const { workbook, worksheet } = params;
     *
     *   // your custom logic
     *
     *   // Cancel the filter clear operation
     *   params.cancel = true;
     * });
     *
     * // Remove the event listener, use `callbackDisposable.dispose()`
     * ```
     */
    readonly SheetBeforeRangeFilterClear: 'SheetBeforeRangeFilterClear';
}

export class FSheetsFilterEventNameMixin extends FEventName implements IFSheetsFilterEventNameMixin {
    override get SheetBeforeRangeFilter(): 'SheetBeforeRangeFilter' { return 'SheetBeforeRangeFilter'; }
    override get SheetRangeFiltered(): 'SheetRangeFiltered' { return 'SheetRangeFiltered'; }
    override get SheetRangeFilterCleared(): 'SheetRangeFilterCleared' { return 'SheetRangeFilterCleared'; };
    override get SheetBeforeRangeFilterClear(): 'SheetBeforeRangeFilterClear' { return 'SheetBeforeRangeFilterClear'; }
}

FEventName.extend(FSheetsFilterEventNameMixin);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends IFSheetsFilterEventNameMixin { }
    interface IEventParamConfig extends ISheetsFilterEventParamConfig { }
}
