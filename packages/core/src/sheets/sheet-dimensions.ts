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

import type { Nullable } from '../shared/types';
import type { IColumnData, IRowData } from './typedef';

export function isValidSheetDimension(value: unknown, allowZero = true): value is number {
    return typeof value === 'number' && Number.isFinite(value) && (allowZero ? value >= 0 : value > 0);
}

export function normalizeSheetDimension(value: unknown, fallback: number, allowZero = true): number {
    return isValidSheetDimension(value, allowZero) ? value : fallback;
}

export function isValidColumnDimensions(data: Nullable<Partial<IColumnData>>): boolean {
    return data?.w == null || isValidSheetDimension(data.w);
}

export function isValidRowDimensions(data: Nullable<Partial<IRowData>>): boolean {
    return (data?.h == null || isValidSheetDimension(data.h)) &&
        (data?.ah == null || isValidSheetDimension(data.ah));
}
