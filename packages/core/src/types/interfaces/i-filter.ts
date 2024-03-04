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

import type { BooleanNumber } from '../enum';
import type { IRange } from './i-range';

// NOTE: Please refer to 18.3.2 AutoFilter Settings.
// Properties of this interface would be added in the future.
// Please make sure that it is backward compatible.

// OOXML

export interface IAutoFilter {
    ref: IRange;

    filterColumns?: IFilterColumn[];

    cachedFilteredOut?: number[];
}

export interface IFilterColumn {
    colId: number;

    filters?: Array<string>;
    customFilters?: ICustomFilters;
};

export interface ICustomFilters {
    and?: BooleanNumber.TRUE;

    /** Max 2 capacity. */
    customFilters: [ICustomFilter] | [ICustomFilter, ICustomFilter];
}

export interface IDynamicFilter {
    val: string | number;

    type: DynamicFilterOperator;
}

export interface ICustomFilter {
    val: string | number;

    /** This field may be empty. */
    operator?: CustomFilterOperator;
}

/**
 * These basic operators are defined in 18.18.31.
 *
 * Some comparison such as startsWith, endsWith, contains, doesNotContain, isBlank, isNotBlank are not defined in OOXML.
 * They are represented by regex-like values.
 */
export enum CustomFilterOperator {
    EQUAL = 'equal',
    GREATER_THAN = 'greaterThan',
    GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual',
    LESS_THAN = 'lessThan',
    LESS_THAN_OR_EQUAL = 'lessThanOrEqual',
    NOT_EQUAL = 'notEqual',
}

export enum DynamicFilterOperator {
    ABOVE_AVERAGE = 'aboveAverage',
}
