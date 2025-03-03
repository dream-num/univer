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

import type { Nullable } from '@univerjs/core';
import type { ICustomFilters, IFilterColumn } from '@univerjs/sheets-filter';
import { BooleanNumber } from '@univerjs/core';
import { CustomFilterOperator } from '@univerjs/sheets-filter';
import { ExtendCustomFilterOperator, OperatorOrder } from './extended-operators';

// This file implements a simple form schema system for condition filters (and only for it!)

export type FilterOperator = ExtendCustomFilterOperator | CustomFilterOperator;

export interface IFilterConditionFormParams {
    and?: true;

    operator1?: FilterOperator;
    val1?: string;

    operator2?: FilterOperator;
    val2?: string;
}

export interface IFilterConditionItem {
    operator: FilterOperator;
    numOfParameters: number;
    order: OperatorOrder;

    /**
     * Name of the filter condition. Should be an i18n key.
     */
    label: string;

    and?: true;

    /**
     * Get the initial form parameters for this condition item. This should only be called when `numOfParameters` is not `0`.
     */
    getDefaultFormParams(): IFilterConditionFormParams;
    /**
     * Test if the form params can be mapped to this condition item. This should be called when the
     * condition form changes and `numOfParameters` is not `0`.
     * @param params
     */
    testMappingParams(params: IFilterConditionFormParams): boolean;

    /**
     * When user confirm changing filter condition, this method will be called to map the form params
     * to the filter column data.
     * @param mapParams
     */
    mapToFilterColumn(mapParams: IFilterConditionFormParams): Nullable<Omit<IFilterColumn, 'colId'>>;
    /**
     * Test if the filter column data can be mapped to this condition item.
     * It should return the mapping parameters if it can be mapped, otherwise `false`.
     * This should be called when the filter panel opens.
     *
     * @param filterColumn
     * @returns the mapping parameters if it can be mapped, otherwise `false`
     */
    testMappingFilterColumn(filterColumn: Omit<IFilterColumn, 'colId'>): IFilterConditionFormParams | false;
}

// eslint-disable-next-line ts/no-namespace
export namespace FilterConditionItems {
    export const NONE: IFilterConditionItem = {
        label: 'sheets-filter.conditions.none',

        operator: ExtendCustomFilterOperator.NONE,
        order: OperatorOrder.SECOND,
        numOfParameters: 0,

        getDefaultFormParams: () => { throw new Error('[FilterConditionItems.NONE]: should not have initial form params!'); },
        testMappingParams: (params) => {
            return params.operator1 === ExtendCustomFilterOperator.NONE;
        },

        mapToFilterColumn: () => null,
        testMappingFilterColumn: (filterColumn) => {
            if (!filterColumn.customFilters && !filterColumn.filters) return {};
            return false;
        },
    };

    // ------------------------------

    export const EMPTY: IFilterConditionItem = {
        label: 'sheets-filter.conditions.empty',

        operator: ExtendCustomFilterOperator.EMPTY,
        order: OperatorOrder.SECOND,
        numOfParameters: 0,

        getDefaultFormParams: () => { throw new Error('[FilterConditionItems.EMPTY]: should not have initial form params!'); },
        testMappingParams: ({ operator1 }) => operator1 === ExtendCustomFilterOperator.EMPTY,

        mapToFilterColumn: () => ({ customFilters: { customFilters: [{ val: '' }] } }),
        testMappingFilterColumn: (filterColumn) => {
            if (filterColumn.customFilters?.customFilters.length !== 1) {
                return false;
            }

            const firstCustomFilter = filterColumn.customFilters.customFilters[0];
            const mapped = firstCustomFilter.val === '' && firstCustomFilter.operator === undefined;
            if (!mapped) {
                return false;
            }

            return { operator1: ExtendCustomFilterOperator.EMPTY };
        },
    };

    export const NOT_EMPTY: IFilterConditionItem = {
        label: 'sheets-filter.conditions.not-empty',

        operator: ExtendCustomFilterOperator.NOT_EMPTY,
        order: OperatorOrder.SECOND,
        numOfParameters: 0,

        getDefaultFormParams: () => { throw new Error('[FilterConditionItems.NOT_EMPTY]: should not have initial form params!'); },
        testMappingParams: ({ operator1 }) => operator1 === ExtendCustomFilterOperator.NOT_EMPTY,

        mapToFilterColumn: () => ({ customFilters: { customFilters: [{ val: '', operator: CustomFilterOperator.NOT_EQUALS }] } }),
        testMappingFilterColumn: (filterColumn) => {
            if (filterColumn.customFilters?.customFilters.length !== 1) {
                return false;
            }

            const firstCustomFilter = filterColumn.customFilters.customFilters[0];
            const canMap = firstCustomFilter.val === ' ' && firstCustomFilter.operator === CustomFilterOperator.NOT_EQUALS;
            if (!canMap) {
                return false;
            }

            return { operator1: ExtendCustomFilterOperator.NOT_EMPTY };
        },
    };

    // ------------------------------

    export const TEXT_CONTAINS: IFilterConditionItem = {
        label: 'sheets-filter.conditions.text-contains',

        operator: ExtendCustomFilterOperator.CONTAINS,
        order: OperatorOrder.FIRST,
        numOfParameters: 1,

        getDefaultFormParams: () => ({ operator1: ExtendCustomFilterOperator.CONTAINS, val1: '' }),
        testMappingParams: (params) => {
            const [op] = getOnlyOperatorAndVal(params);
            return op === ExtendCustomFilterOperator.CONTAINS;
        },

        mapToFilterColumn: (mapParams) => {
            const { val1 } = mapParams;
            if (val1 === '') return null;

            return {
                customFilters: { customFilters: [{ val: `*${val1}*` }] },
            };
        },
        testMappingFilterColumn: (filterColumn) => {
            if (filterColumn.customFilters?.customFilters.length !== 1) {
                return false;
            }

            const firstCustomFilter = filterColumn.customFilters.customFilters[0];
            const valAsString = firstCustomFilter.val.toString();
            if (!firstCustomFilter.operator && valAsString.startsWith('*') && valAsString.endsWith('*')) {
                return { operator1: ExtendCustomFilterOperator.CONTAINS, val1: valAsString.slice(1, -1) };
            }

            return false;
        },
    };

    export const DOES_NOT_CONTAIN: IFilterConditionItem = {
        label: 'sheets-filter.conditions.does-not-contain',

        operator: ExtendCustomFilterOperator.DOES_NOT_CONTAIN,
        order: OperatorOrder.FIRST,
        numOfParameters: 1,

        getDefaultFormParams: () => ({ operator1: ExtendCustomFilterOperator.DOES_NOT_CONTAIN, val1: '' }),
        mapToFilterColumn: (mapParams) => ({
            customFilters: { customFilters: [{ val: `*${mapParams.val1}*`, operator: CustomFilterOperator.NOT_EQUALS }] },
        }),
        testMappingParams: (params) => {
            const [op] = getOnlyOperatorAndVal(params);
            return op === ExtendCustomFilterOperator.DOES_NOT_CONTAIN;
        },
        testMappingFilterColumn: (filterColumn) => {
            if (filterColumn.customFilters?.customFilters.length !== 1) {
                return false;
            }

            const firstCustomFilter = filterColumn.customFilters.customFilters[0];
            const valAsString = firstCustomFilter.val.toString();
            if (
                firstCustomFilter.operator === CustomFilterOperator.NOT_EQUALS
                && valAsString.startsWith('*')
                && valAsString.endsWith('*')
            ) {
                return { operator1: ExtendCustomFilterOperator.DOES_NOT_CONTAIN, val1: valAsString.slice(1, -1) };
            }

            return false;
        },
    };

    export const STARTS_WITH: IFilterConditionItem = {
        label: 'sheets-filter.conditions.starts-with',

        operator: ExtendCustomFilterOperator.STARTS_WITH,
        order: OperatorOrder.FIRST,
        numOfParameters: 1,

        getDefaultFormParams: () => ({ operator1: ExtendCustomFilterOperator.STARTS_WITH, val1: '' }),
        mapToFilterColumn: (mapParams) => ({
            customFilters: { customFilters: [{ val: `${mapParams.val1}*` }] },
        }),
        testMappingParams: (params) => {
            const [op] = getOnlyOperatorAndVal(params);
            return op === ExtendCustomFilterOperator.STARTS_WITH;
        },
        testMappingFilterColumn: (filterColumn) => {
            if (filterColumn.customFilters?.customFilters.length !== 1) {
                return false;
            }

            const firstCustomFilter = filterColumn.customFilters.customFilters[0];
            const valAsString = firstCustomFilter.val.toString();
            if (!firstCustomFilter.operator && valAsString.endsWith('*') && !valAsString.startsWith('*')) {
                return { operator1: ExtendCustomFilterOperator.STARTS_WITH, val1: valAsString.slice(0, -1) };
            }

            return false;
        },
    };

    export const ENDS_WITH: IFilterConditionItem = {
        label: 'sheets-filter.conditions.ends-with',

        operator: ExtendCustomFilterOperator.ENDS_WITH,
        order: OperatorOrder.FIRST,
        numOfParameters: 1,

        getDefaultFormParams: () => ({ operator1: ExtendCustomFilterOperator.ENDS_WITH, val1: '' }),
        mapToFilterColumn: (mapParams) => ({
            customFilters: { customFilters: [{ val: `*${mapParams.val1}` }] },
        }),
        testMappingParams: (params) => {
            const [op] = getOnlyOperatorAndVal(params);
            return op === ExtendCustomFilterOperator.ENDS_WITH;
        },
        testMappingFilterColumn: (filterColumn) => {
            if (filterColumn.customFilters?.customFilters.length !== 1) {
                return false;
            }

            const firstCustomFilter = filterColumn.customFilters.customFilters[0];
            const valAsString = firstCustomFilter.val.toString();
            if (!firstCustomFilter.operator && valAsString.startsWith('*') && !valAsString.endsWith('*')) {
                return { operator1: ExtendCustomFilterOperator.ENDS_WITH, val1: valAsString.slice(1) };
            }

            return false;
        },
    };

    export const EQUALS: IFilterConditionItem = {
        label: 'sheets-filter.conditions.equals',

        operator: ExtendCustomFilterOperator.EQUALS,
        order: OperatorOrder.FIRST,
        numOfParameters: 1,

        getDefaultFormParams: () => ({ operator1: ExtendCustomFilterOperator.EQUALS, val1: '' }),
        testMappingParams: (params) => {
            const [op] = getOnlyOperatorAndVal(params);
            return op === ExtendCustomFilterOperator.EQUALS;
        },

        mapToFilterColumn: (mapParams) => {
            const { val1 } = mapParams;
            if (val1 === '') return null;

            return {
                customFilters: { customFilters: [{ val: val1! }] },
            };
        },
        testMappingFilterColumn: (filterColumn) => {
            if (filterColumn.filters?.filters?.length === 1) {
                return { operator1: ExtendCustomFilterOperator.EQUALS, val1: '' };
            }

            if (filterColumn.customFilters?.customFilters.length === 1 && !filterColumn.customFilters.customFilters[0].operator) {
                return { operator1: ExtendCustomFilterOperator.EQUALS, val1: filterColumn.customFilters.customFilters[0].val.toString() };
            }

            return false;
        },
    };

    // #region number conditions

    export const GREATER_THAN: IFilterConditionItem = {
        label: 'sheets-filter.conditions.greater-than',

        operator: CustomFilterOperator.GREATER_THAN,
        numOfParameters: 1,
        order: OperatorOrder.FIRST,

        getDefaultFormParams: () => ({ operator1: CustomFilterOperator.GREATER_THAN, val1: '' }),
        mapToFilterColumn: (mapParams) => ({
            customFilters: { customFilters: [{ val: mapParams.val1!, operator: CustomFilterOperator.GREATER_THAN }] },
        }),
        testMappingParams: (params) => {
            const [op] = getOnlyOperatorAndVal(params);
            return op === CustomFilterOperator.GREATER_THAN;
        },
        testMappingFilterColumn: (filterColumn) => {
            if (filterColumn.customFilters?.customFilters.length !== 1) {
                return false;
            }

            const firstCustomFilter = filterColumn.customFilters.customFilters[0];
            if (firstCustomFilter.operator !== CustomFilterOperator.GREATER_THAN) {
                return false;
            }

            return { operator1: CustomFilterOperator.GREATER_THAN, val1: firstCustomFilter.val.toString() };
        },
    };

    export const GREATER_THAN_OR_EQUAL: IFilterConditionItem = {
        label: 'sheets-filter.conditions.greater-than-or-equal',

        operator: CustomFilterOperator.GREATER_THAN_OR_EQUAL,
        numOfParameters: 1,
        order: OperatorOrder.FIRST,

        getDefaultFormParams: () => ({ operator1: CustomFilterOperator.GREATER_THAN_OR_EQUAL, val1: '' }),
        testMappingParams: (params) => {
            const [op] = getOnlyOperatorAndVal(params);
            return op === CustomFilterOperator.GREATER_THAN_OR_EQUAL;
        },

        mapToFilterColumn: (mapParams) => ({
            customFilters: { customFilters: [{ val: mapParams.val1!, operator: CustomFilterOperator.GREATER_THAN_OR_EQUAL }] },
        }),
        testMappingFilterColumn: (filterColumn) => {
            if (filterColumn.customFilters?.customFilters.length !== 1) {
                return false;
            }

            const firstCustomFilter = filterColumn.customFilters.customFilters[0];
            if (firstCustomFilter.operator !== CustomFilterOperator.GREATER_THAN_OR_EQUAL) {
                return false;
            }

            return { operator1: CustomFilterOperator.GREATER_THAN_OR_EQUAL, val1: firstCustomFilter.val.toString() };
        },
    };

    export const LESS_THAN: IFilterConditionItem = {
        label: 'sheets-filter.conditions.less-than',

        operator: CustomFilterOperator.LESS_THAN,
        numOfParameters: 1,
        order: OperatorOrder.FIRST,

        getDefaultFormParams: () => ({ operator1: CustomFilterOperator.LESS_THAN, val1: '' }),
        testMappingParams: (params) => {
            const [op] = getOnlyOperatorAndVal(params);
            return op === CustomFilterOperator.LESS_THAN;
        },

        mapToFilterColumn: (mapParams) => ({
            customFilters: { customFilters: [{ val: mapParams.val1!, operator: CustomFilterOperator.LESS_THAN }] },
        }),
        testMappingFilterColumn: (filterColumn) => {
            if (filterColumn.customFilters?.customFilters.length !== 1) {
                return false;
            }

            const firstCustomFilter = filterColumn.customFilters.customFilters[0];
            if (firstCustomFilter.operator !== CustomFilterOperator.LESS_THAN) {
                return false;
            }

            return { operator1: CustomFilterOperator.LESS_THAN, val1: firstCustomFilter.val.toString() };
        },
    };

    export const LESS_THAN_OR_EQUAL: IFilterConditionItem = {
        label: 'sheets-filter.conditions.less-than-or-equal',

        operator: CustomFilterOperator.LESS_THAN_OR_EQUAL,
        numOfParameters: 1,
        order: OperatorOrder.FIRST,

        getDefaultFormParams: () => ({ operator1: CustomFilterOperator.LESS_THAN_OR_EQUAL, val1: '' }),
        testMappingParams: (params) => {
            const [op] = getOnlyOperatorAndVal(params);
            return op === CustomFilterOperator.LESS_THAN_OR_EQUAL;
        },

        mapToFilterColumn: (mapParams) => ({
            customFilters: { customFilters: [{ val: mapParams.val1!, operator: CustomFilterOperator.LESS_THAN_OR_EQUAL }] },
        }),
        testMappingFilterColumn: (filterColumn) => {
            if (filterColumn.customFilters?.customFilters.length !== 1) {
                return false;
            }

            const firstCustomFilter = filterColumn.customFilters.customFilters[0];
            if (firstCustomFilter.operator !== CustomFilterOperator.LESS_THAN_OR_EQUAL) {
                return false;
            }

            return { operator1: CustomFilterOperator.LESS_THAN_OR_EQUAL, val1: firstCustomFilter.val.toString() };
        },
    };

    export const EQUAL: IFilterConditionItem = {
        label: 'sheets-filter.conditions.equal',

        operator: CustomFilterOperator.EQUAL,
        numOfParameters: 1,
        order: OperatorOrder.FIRST,

        getDefaultFormParams: () => ({ operator1: CustomFilterOperator.EQUAL, val1: '' }),
        testMappingParams: (params) => {
            const [op] = getOnlyOperatorAndVal(params);
            return op === CustomFilterOperator.EQUAL;
        },

        mapToFilterColumn: (mapParams) => ({
            customFilters: { customFilters: [{ val: mapParams.val1!, operator: CustomFilterOperator.EQUAL }] },
        }),
        testMappingFilterColumn: (filterColumn) => {
            if (filterColumn.customFilters?.customFilters.length !== 1) {
                return false;
            }

            const firstCustomFilter = filterColumn.customFilters.customFilters[0];
            if (firstCustomFilter.operator !== CustomFilterOperator.EQUAL) {
                return false;
            }

            return { operator1: CustomFilterOperator.EQUAL, val1: firstCustomFilter.val.toString() };
        },
    };

    export const NOT_EQUAL: IFilterConditionItem = {
        label: 'sheets-filter.conditions.not-equal',

        operator: CustomFilterOperator.NOT_EQUALS,
        numOfParameters: 1,
        order: OperatorOrder.FIRST,

        getDefaultFormParams: () => ({ operator1: CustomFilterOperator.NOT_EQUALS, val1: '' }),
        testMappingParams: (params) => {
            const [op] = getOnlyOperatorAndVal(params);
            return op === CustomFilterOperator.NOT_EQUALS;
        },

        mapToFilterColumn: (mapParams) => ({
            customFilters: { customFilters: [{ val: mapParams.val1!, operator: CustomFilterOperator.NOT_EQUALS }] },
        }),
        testMappingFilterColumn: (filterColumn) => {
            if (filterColumn.customFilters?.customFilters.length !== 1) {
                return false;
            }

            const firstCustomFilter = filterColumn.customFilters.customFilters[0];
            if (firstCustomFilter.operator !== CustomFilterOperator.NOT_EQUALS) {
                return false;
            }

            return { operator1: CustomFilterOperator.NOT_EQUALS, val1: firstCustomFilter.val.toString() };
        },
    };

    // #endregion

    export const BETWEEN: IFilterConditionItem = {
        label: 'sheets-filter.conditions.between',

        operator: ExtendCustomFilterOperator.BETWEEN,
        order: OperatorOrder.SECOND,
        numOfParameters: 2,

        getDefaultFormParams: () => ({
            and: true,
            operator1: CustomFilterOperator.GREATER_THAN_OR_EQUAL,
            val1: '',
            operator2: CustomFilterOperator.LESS_THAN_OR_EQUAL,
            val2: '',
        }),
        testMappingParams: (params) => {
            const { and, operator1, operator2 } = params;
            if (!and) return false;

            const operators = [operator1, operator2];
            return operators.includes(CustomFilterOperator.GREATER_THAN_OR_EQUAL)
                && operators.includes(CustomFilterOperator.LESS_THAN_OR_EQUAL);
        },

        mapToFilterColumn: (mapParams) => {
            const { val1, val2, operator1 } = mapParams;
            const operator1IsGreater = operator1 === CustomFilterOperator.GREATER_THAN_OR_EQUAL;
            return {
                customFilters: {
                    and: BooleanNumber.TRUE,
                    customFilters: [
                        { val: operator1IsGreater ? val1! : val2!, operator: CustomFilterOperator.GREATER_THAN_OR_EQUAL },
                        { val: operator1IsGreater ? val2! : val1!, operator: CustomFilterOperator.LESS_THAN_OR_EQUAL },
                    ],
                },
            };
        },
        testMappingFilterColumn: (filterColumn) => {
            if (filterColumn.customFilters?.customFilters.length !== 2) {
                return false;
            }

            const [firstCustomFilter, secondCustomFilter] = filterColumn.customFilters.customFilters;
            if (
                firstCustomFilter.operator === CustomFilterOperator.GREATER_THAN_OR_EQUAL
                && secondCustomFilter.operator === CustomFilterOperator.LESS_THAN_OR_EQUAL
                && filterColumn.customFilters.and
            ) {
                return {
                    and: true,
                    operator1: CustomFilterOperator.GREATER_THAN_OR_EQUAL,
                    val1: firstCustomFilter.val.toString(),
                    operator2: CustomFilterOperator.LESS_THAN_OR_EQUAL,
                    val2: secondCustomFilter.val.toString(),
                };
            }

            if (
                secondCustomFilter.operator === CustomFilterOperator.GREATER_THAN_OR_EQUAL
                && firstCustomFilter.operator === CustomFilterOperator.LESS_THAN_OR_EQUAL
                && filterColumn.customFilters.and
            ) {
                return {
                    and: true,
                    operator1: CustomFilterOperator.GREATER_THAN_OR_EQUAL,
                    val1: secondCustomFilter.val.toString(),
                    operator2: CustomFilterOperator.LESS_THAN_OR_EQUAL,
                    val2: firstCustomFilter.val.toLocaleString(),
                };
            }

            return false;
        },
    };

    export const NOT_BETWEEN: IFilterConditionItem = {
        label: 'sheets-filter.conditions.not-between',

        operator: ExtendCustomFilterOperator.NOT_BETWEEN,
        order: OperatorOrder.SECOND,
        numOfParameters: 2,

        getDefaultFormParams: () => ({
            operator1: CustomFilterOperator.LESS_THAN,
            val1: '',
            operator2: CustomFilterOperator.GREATER_THAN,
            val2: '',
        }),
        testMappingParams: (params) => {
            const { and, operator1, operator2 } = params;
            if (and) return false;

            const operators = [operator1, operator2];
            return operators.includes(CustomFilterOperator.GREATER_THAN) && operators.includes(CustomFilterOperator.LESS_THAN);
        },

        mapToFilterColumn: (mapParams) => {
            const { val1, val2, operator1 } = mapParams;
            const operator1IsGreater = operator1 === CustomFilterOperator.GREATER_THAN;
            return {
                customFilters: {
                    customFilters: [
                        { val: operator1IsGreater ? val1! : val2!, operator: CustomFilterOperator.GREATER_THAN },
                        { val: operator1IsGreater ? val2! : val1!, operator: CustomFilterOperator.LESS_THAN },
                    ],
                },
            };
        },
        testMappingFilterColumn: (filterColumn) => {
            if (filterColumn.customFilters?.customFilters.length !== 2) {
                return false;
            }

            const [firstCustomFilter, secondCustomFilter] = filterColumn.customFilters.customFilters;
            if (
                firstCustomFilter.operator === CustomFilterOperator.LESS_THAN
                && secondCustomFilter.operator === CustomFilterOperator.GREATER_THAN
                && !filterColumn.customFilters.and
            ) {
                return {
                    operator1: CustomFilterOperator.LESS_THAN,
                    val1: firstCustomFilter.val.toString(),
                    operator2: CustomFilterOperator.GREATER_THAN,
                    val2: secondCustomFilter.val.toString(),
                };
            }

            if (
                secondCustomFilter.operator === CustomFilterOperator.LESS_THAN
                && firstCustomFilter.operator === CustomFilterOperator.GREATER_THAN
                && !filterColumn.customFilters.and
            ) {
                return {
                    operator1: CustomFilterOperator.GREATER_THAN,
                    val1: secondCustomFilter.val.toString(),
                    operator2: CustomFilterOperator.LESS_THAN,
                    val2: firstCustomFilter.val.toLocaleString(),
                };
            }

            return false;
        },
    };

    /**
     * This should be test last. If no other condition item can be mapped, then it should be mapped.
     */
    export const CUSTOM: IFilterConditionItem = {
        label: 'sheets-filter.conditions.custom',

        operator: ExtendCustomFilterOperator.CUSTOM,
        order: OperatorOrder.SECOND,
        numOfParameters: 2,

        getDefaultFormParams: () => {
            return {
                operator1: ExtendCustomFilterOperator.NONE,
                val1: '',
                operator2: ExtendCustomFilterOperator.NONE,
                val2: '',
            };
        },
        testMappingParams: () => true,

        mapToFilterColumn: (mapParams) => {
            const { and, val1, val2, operator1, operator2 } = mapParams;

            function mapOperator(operator: FilterOperator | undefined, val: string) {
                // eslint-disable-next-line ts/no-use-before-define
                for (const condition of ALL_CONDITIONS) {
                    if (condition.operator === operator) {
                        return condition.mapToFilterColumn({ val1: val, operator1: operator });
                    }
                }
            }

            const operator1IsNone = !operator1 || operator1 === FilterConditionItems.NONE.operator;
            const operator2IsNone = !operator2 || operator2 === FilterConditionItems.NONE.operator;

            if (operator1IsNone && operator2IsNone) {
                return NONE.mapToFilterColumn({});
            }

            if (operator1IsNone) {
                return mapOperator(operator2!, val2!)!;
            }

            if (operator2IsNone) {
                return mapOperator(operator1!, val1!)!;
            }

            const mappedCustomFilter1 = mapOperator(operator1!, val1!)!;
            const mappedCustomFilter2 = mapOperator(operator2!, val2!)!;
            const customFilters: ICustomFilters = {
                customFilters: [
                    mappedCustomFilter1.customFilters!.customFilters[0],
                    mappedCustomFilter2.customFilters!.customFilters[0],
                ],
            };

            if (and) customFilters.and = BooleanNumber.TRUE;
            return { customFilters };
        },
        testMappingFilterColumn: (filterColumn) => {
            if (filterColumn.customFilters?.customFilters.length !== 2) {
                return false;
            }

            const params = filterColumn.customFilters.customFilters.map((customFilter) => {
                return testMappingFilterColumn({ customFilters: { customFilters: [customFilter] } });
            });

            const result: IFilterConditionFormParams = {
                operator1: params[0][0].operator,
                val1: params[0][1].val1,
                operator2: params[1][0].operator,
                val2: params[1][1].val1,
            };

            if (filterColumn.customFilters.and) {
                result.and = true;
            }

            return result;
        },
    };

    export const ALL_CONDITIONS: IFilterConditionItem[] = [
        // ------------------------------
        NONE,
        // ------------------------------
        EMPTY,
        NOT_EMPTY,
        // ------------------------------
        TEXT_CONTAINS,
        DOES_NOT_CONTAIN,
        STARTS_WITH,
        ENDS_WITH,
        EQUALS,
        // ------------------------------
        GREATER_THAN,
        GREATER_THAN_OR_EQUAL,
        LESS_THAN,
        LESS_THAN_OR_EQUAL,
        EQUAL,
        NOT_EQUAL,
        BETWEEN,
        NOT_BETWEEN,
        // ------------------------------
        CUSTOM,
    ];

    export function getItemByOperator(operator: FilterOperator): IFilterConditionItem {
        const item = ALL_CONDITIONS.find((condition) => condition.operator === operator);
        if (!item) {
            throw new Error(`[SheetsFilter]: no condition item found for operator: ${operator}`);
        }

        return item;
    }

    export function testMappingParams(mapParams: IFilterConditionFormParams, numOfParameters: number): IFilterConditionItem {
        // TODO@wzhudev: iteration here can be optimized
        // We match operators with same count of parameters first.
        for (const condition of ALL_CONDITIONS.filter((condition) => condition.numOfParameters === numOfParameters)) {
            if (condition.numOfParameters !== 0 && condition.testMappingParams(mapParams)) {
                return condition;
            }
        }

        // And fallback to others.
        for (const condition of ALL_CONDITIONS) {
            if (condition.testMappingParams(mapParams)) {
                return condition;
            }
        }

        throw new Error('[SheetsFilter]: no condition item can be mapped from the filter map params!');
    }

    export function getInitialFormParams(operator: FilterOperator): IFilterConditionFormParams {
        const condition = ALL_CONDITIONS.find((condition) => condition.operator === operator)!;
        if (condition?.numOfParameters === 0) {
            return { operator1: condition.operator };
        }

        return condition.getDefaultFormParams();
    }

    export function mapToFilterColumn(condition: IFilterConditionItem, mapParams: IFilterConditionFormParams): Nullable<Omit<IFilterColumn, 'colId'>> {
        return condition.mapToFilterColumn(mapParams);
    }

    export function testMappingFilterColumn(filterColumn: Nullable<Omit<IFilterColumn, 'colId'>>): [IFilterConditionItem, IFilterConditionFormParams] {
        if (!filterColumn) {
            return [NONE, {}];
        }

        for (const condition of ALL_CONDITIONS) {
            const mapParams = condition.testMappingFilterColumn(filterColumn);
            if (mapParams) {
                return [condition, mapParams];
            }
        }

        // Return NONE by default.
        return [NONE, {}];
    }
}

function getOnlyOperatorAndVal(mapParams: IFilterConditionFormParams): [FilterOperator, string | undefined] {
    const { operator1, operator2, val1, val2 } = mapParams;
    if (operator1 && operator2) {
        throw new Error('Both operator1 and operator2 are set!');
    }

    if (!operator1 && !operator2) {
        throw new Error('Neither operator1 and operator2 and both not set!');
    }

    return operator1 ? [operator1, val1] : [operator2!, val2];
}
