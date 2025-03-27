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

import type { ICellData, ICellDataForSheetInterceptor, ICellInterceptor, Nullable } from '@univerjs/core';
import type { ISheetLocation, ISheetRowLocation } from './utils/interceptor';

import { createInterceptorKey } from '@univerjs/core';

const CELL_CONTENT = createInterceptorKey<ICellDataForSheetInterceptor, ISheetLocation & { rawData: Nullable<ICellData> }>('CELL_CONTENT') as ICellInterceptor<ICellDataForSheetInterceptor, ISheetLocation & { rawData: Nullable<ICellData> }>;
const ROW_FILTERED = createInterceptorKey<boolean, ISheetRowLocation>('ROW_FILTERED');

export const INTERCEPTOR_POINT = {
    CELL_CONTENT,
    ROW_FILTERED,
};

export enum InterceptCellContentPriority {
    DATA_VALIDATION = 9,
    NUMFMT = 10,
    CELL_IMAGE = 11,
}
// used for define the range theme interceptor, it will also use to ignore the range theme interceptor
export const RangeThemeInterceptorId = 'sheet.interceptor.range-theme-id';

export const IgnoreRangeThemeInterceptorKey = 'sheet.interceptor.ignore-range-theme';
