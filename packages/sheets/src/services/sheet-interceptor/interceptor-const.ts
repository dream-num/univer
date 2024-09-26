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

import { createInterceptorKey } from '@univerjs/core';
import type { ICellDataForSheetInterceptor, ICellInterceptor } from '@univerjs/core';

import type { ISheetLocation, ISheetRowLocation } from './utils/interceptor';

const CELL_CONTENT = createInterceptorKey<ICellDataForSheetInterceptor, ISheetLocation>('CELL_CONTENT') as ICellInterceptor<ICellDataForSheetInterceptor, ISheetLocation>;
const ROW_FILTERED = createInterceptorKey<boolean, ISheetRowLocation>('ROW_FILTERED');

export const INTERCEPTOR_POINT = {
    CELL_CONTENT,
    ROW_FILTERED,
};

export enum InterceptCellContentPriority {
    DATA_VALIDATION = 9,
    NUMFMT = 10,
}
