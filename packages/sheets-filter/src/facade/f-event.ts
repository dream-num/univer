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

import type { IEventBase } from '@univerjs/core';
import type { ISetSheetsFilterCriteriaCommandParams } from '@univerjs/sheets-filter';
import type { FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
import { FEventName } from '@univerjs/core';
import { FSheetEventName } from '@univerjs/sheets/facade';

// TODO: add js comments for the following API

export interface IFSheetFilterEventMixin {
    /**
     * Type of the event's parameters is {@link ISheetRangeFilteredParams}.
     *
     * ```typescript
     * @example
     * ```
     */
    SheetRangeFiltered: 'SheetRangeFiltered';
    /**
     * Type of the event's parameters is {@link ISheetRangeFilteredParams}.
     *
     * ```typescript
     * @example
     * ```
     */
    SheetBeforeRangeFilter: 'SheetBeforeRangeFilter';
    /**
     * Type of the event's parameters is {@link ISheetRangeFilterClearedEventParams}.
     *
     * ```typescript
     * @example
     * ```
     */
    SheetRangeFilterCleared: 'SheetRangeFilterCleared';
    /**
     * Type of the event's parameters is {@link ISheetRangeFilterClearedEventParams}.
     *
     * ```typescript
     * @example
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

