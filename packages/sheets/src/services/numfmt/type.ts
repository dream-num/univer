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

import type { ICellData, IRange, Nullable, ObjectMatrix } from '@univerjs/core';
import { createIdentifier } from '@univerjs/core';

// eslint-disable-next-line ts/consistent-type-definitions
export type INumfmtItem = {
    i: string;
};

export type FormatType =
    | 'currency'
    | 'date'
    | 'datetime'
    | 'error'
    | 'fraction'
    | 'general'
    | 'grouped'
    | 'number'
    | 'percent'
    | 'scientific'
    | 'text'
    | 'time'
    | 'unknown';

export interface INumfmtItemWithCache {
    // when change parameters or pattern, the cache is cleared follow mutation execute
    _cache?: {
        result: ICellData;
        parameters: number; // The parameter that was last calculated
    };
    pattern: string;
}

export const INumfmtService = createIdentifier<INumfmtService>('INumfmtService');
export interface INumfmtService {
    getValue(
        unitId: string,
        subUnitId: string,
        row: number,
        col: number,
        model?: ObjectMatrix<INumfmtItem>
    ): Nullable<INumfmtItemWithCache>;
    setValues(
        unitId: string,
        subUnitId: string,
        values: Array<{ ranges: IRange[]; pattern: string }>
    ): void;
    deleteValues(unitId: string, subUnitId: string, values: IRange[]): void;
}
