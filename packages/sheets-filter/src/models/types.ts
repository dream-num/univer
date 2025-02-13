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

import type { BooleanNumber, IRange } from '@univerjs/core';

/**
 * Data of a filter in a {@link Worksheet}.
 *
 * Please refer to 18.3.2 AutoFilter Settings. Properties of this interface would be added in the future.
 * Please make sure that it is backward compatible.
 *
 * @property {IRange} ref The range of the filter.
 * @property {IFilterColumn[]} [filterColumns] The filter criteria of each column.
 * @property {number[]} [cachedFilteredOut] The cached filtered out row numbers.
 */
export interface IAutoFilter {
    ref: IRange;

    filterColumns?: IFilterColumn[];
    cachedFilteredOut?: number[];
}

/**
 * The filter criteria of a column.
 *
 * @property {number} colId The column number.
 * @property {IFilters} [filters] The basic filters (filter by value).
 * @property {ICustomFilters} [customFilters] The custom filters.
 */
export interface IFilterColumn {
    colId: number;
    filters?: IFilters;
    customFilters?: ICustomFilters;
};

/**
 * Basic filters (filter by value).
 *
 * @property {true} [blank] Filter by blank. If this field is present, blank cells would be visible.
 * @property {Array<string>} [filters] Filter by values. Cells with values in this array would be visible.
 */
export interface IFilters {
    blank?: true;
    filters?: Array<string>;
}

/**
 * Custom filters.
 *
 * @property {BooleanNumber.TRUE} and The logical operator of the custom filters. If this field is present,
 * the custom filters would be connected by 'and'. Otherwise, they would be connected by 'or'.
 * @property {ICustomFilter[]} customFilters The custom filters.
 */
export interface ICustomFilters {
    and?: BooleanNumber.TRUE;
    customFilters: [ICustomFilter] | [ICustomFilter, ICustomFilter];
}

/**
 * A custom filter.
 *
 * @property {string | number} val The value to be compared.
 * @property {CustomFilterOperator} [operator] The operator of the comparison. If this field is empty, the operator would be 'equal'.
 */
export interface ICustomFilter {
    val: string | number;
    operator?: CustomFilterOperator;
}

/**
 * Basic custom filter operators.
 *
 * @internal
 * doesNotContain, isBlank, isNotBlank are not defined in OOXML. They are represented by regex-like values.
 */
export enum CustomFilterOperator {
    /** "EQUAL" operator. */
    EQUAL = 'equal',
    /** "GREATER_THAN" operator. */
    GREATER_THAN = 'greaterThan',
    /** "GREATER_THAN_OR_EQUAL" operator. */
    GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual',
    /** "LESS_THAN" operator. */
    LESS_THAN = 'lessThan',
    /** "LESS_THAN_OR_EQUAL" operator. */
    LESS_THAN_OR_EQUAL = 'lessThanOrEqual',
    /** "NOT_EQUALS" operator. */
    NOT_EQUALS = 'notEqual',
}

export interface IDynamicFilter {
    val: string | number;

    type: DynamicFilterOperator;
}

/**
 * Not used now. Would be used in the future.
 */
export enum DynamicFilterOperator {
    ABOVE_AVERAGE = 'aboveAverage',
}
