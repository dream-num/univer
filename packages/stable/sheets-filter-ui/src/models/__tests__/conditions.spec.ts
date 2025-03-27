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

import { BooleanNumber } from '@univerjs/core';
import { CustomFilterOperator } from '@univerjs/sheets-filter';
import { describe, expect, it } from 'vitest';

import { FilterConditionItems } from '../conditions';
import { ExtendCustomFilterOperator } from '../extended-operators';

describe('test "FilterConditionItems"', () => {
    describe('test utils work as expected in different condition format situations', () => {
        describe('test NONE condition', () => {
            it('should load NONE condition from empty filter column', () => {
                expect(FilterConditionItems.testMappingFilterColumn()).toEqual([FilterConditionItems.NONE, {}]);
                expect(FilterConditionItems.testMappingFilterColumn({ customFilters: undefined })).toEqual([FilterConditionItems.NONE, {}]);
            });

            it('should throw error when trying to get default params', () => {
                expect(() => FilterConditionItems.NONE.getDefaultFormParams()).toThrowError();
            });

            it('should mapped to its own operator', () => {
                expect(FilterConditionItems.NONE.testMappingParams({ operator1: ExtendCustomFilterOperator.NONE })).toBeTruthy();
                expect(FilterConditionItems.NONE.testMappingParams({ operator1: ExtendCustomFilterOperator.NOT_EQUALS })).toBeFalsy();
            });

            it('should map to empty filter column', () => {
                // clear filter column
                expect(FilterConditionItems.NONE.mapToFilterColumn({ operator1: ExtendCustomFilterOperator.NONE })).toEqual(null);
            });
        });

        describe('test EMPTY condition', () => {
            it('should load EMPTY condition from custom filter with empty string', () => {
                expect(FilterConditionItems.testMappingFilterColumn({ customFilters: { customFilters: [{ val: '' }] } }))
                    .toEqual([FilterConditionItems.EMPTY, { operator1: ExtendCustomFilterOperator.EMPTY }]);
            });

            it('should throw error when trying to get default params', () => {
                expect(() => FilterConditionItems.EMPTY.getDefaultFormParams()).toThrowError();
            });

            it('should map to its own operator', () => {
                expect(FilterConditionItems.EMPTY.testMappingParams({ operator1: ExtendCustomFilterOperator.EMPTY })).toBeTruthy();
                expect(FilterConditionItems.EMPTY.testMappingParams({ operator1: ExtendCustomFilterOperator.NONE })).toBeFalsy();
            });

            it('should map to filter  column with empty string', () => {
                expect(FilterConditionItems.EMPTY.mapToFilterColumn({ operator1: ExtendCustomFilterOperator.EMPTY }))
                    .toEqual({ customFilters: { customFilters: [{ val: '' }] } });
            });
        });

        describe('test NOT_EMPTY condition', () => {
            it('should load NOT_EMPTY condition from custom filter with space string', () => {
                expect(FilterConditionItems.testMappingFilterColumn({ customFilters: { customFilters: [{ operator: CustomFilterOperator.NOT_EQUALS, val: ' ' }] } }))
                    .toEqual([FilterConditionItems.NOT_EMPTY, { operator1: ExtendCustomFilterOperator.NOT_EMPTY }]);

                // when the val is not a space char, it would map to NOT_EQUAL
                expect(FilterConditionItems.testMappingFilterColumn({
                    customFilters: { customFilters: [{ operator: CustomFilterOperator.NOT_EQUALS, val: '123' }] },
                })).toEqual([FilterConditionItems.NOT_EQUAL, { operator1: CustomFilterOperator.NOT_EQUALS, val1: '123' }]);
            });

            it('should throw error when trying to get default params', () => {
                expect(() => FilterConditionItems.NOT_EMPTY.getDefaultFormParams()).toThrowError();
            });

            it('should map to its own operator', () => {
                expect(FilterConditionItems.NOT_EMPTY.testMappingParams({ operator1: ExtendCustomFilterOperator.NOT_EMPTY })).toBeTruthy();
                expect(FilterConditionItems.NOT_EMPTY.testMappingParams({ operator1: ExtendCustomFilterOperator.NONE })).toBeFalsy();
            });

            it('should map to filter column with space string', () => {
                expect(FilterConditionItems.NOT_EMPTY.mapToFilterColumn({ operator1: ExtendCustomFilterOperator.NOT_EMPTY }))
                    .toEqual({ customFilters: { customFilters: [{ operator: CustomFilterOperator.NOT_EQUALS, val: '' }] } });
            });
        });

        describe('test TEXT_CONTAINS condition', () => {
            it('should load TEXT_CONTAINS condition from char set "*xxx*"', () => {
                expect(FilterConditionItems.testMappingFilterColumn({ customFilters: { customFilters: [{ val: '*xxx*' }] } }))
                    .toEqual([FilterConditionItems.TEXT_CONTAINS, { operator1: ExtendCustomFilterOperator.CONTAINS, val1: 'xxx' }]);

                expect(FilterConditionItems.testMappingFilterColumn({ customFilters: { customFilters: [{ val: '*xxx' }] } }))
                    .not
                    .toEqual([FilterConditionItems.TEXT_CONTAINS, { operator1: ExtendCustomFilterOperator.CONTAINS, val1: 'xxx' }]);
            });

            it('should support default params with empty string', () => {
                expect(FilterConditionItems.TEXT_CONTAINS.getDefaultFormParams()).toEqual({ operator1: ExtendCustomFilterOperator.CONTAINS, val1: '' });
            });

            it('should mapped params with only one operator CONTAINS', () => {
                expect(FilterConditionItems.TEXT_CONTAINS.testMappingParams({ operator1: ExtendCustomFilterOperator.CONTAINS })).toBeTruthy();
                expect(FilterConditionItems.TEXT_CONTAINS.testMappingParams({ operator1: ExtendCustomFilterOperator.DOES_NOT_CONTAIN })).toBeFalsy();
                expect(() => FilterConditionItems.TEXT_CONTAINS.testMappingParams({ operator1: ExtendCustomFilterOperator.CONTAINS, operator2: ExtendCustomFilterOperator.CONTAINS }))
                    .toThrowError();

                expect(FilterConditionItems.TEXT_CONTAINS.testMappingParams({ operator2: ExtendCustomFilterOperator.CONTAINS })).toBeTruthy();
            });

            it('should map to filter column with char set "*xxx*"', () => {
                expect(FilterConditionItems.TEXT_CONTAINS.mapToFilterColumn({ operator1: ExtendCustomFilterOperator.CONTAINS, val1: 'univer' }))
                    .toEqual({ customFilters: { customFilters: [{ val: '*univer*' }] } });

                expect(FilterConditionItems.TEXT_CONTAINS.mapToFilterColumn({ operator1: ExtendCustomFilterOperator.CONTAINS, val1: ' ' }))
                    .toEqual({ customFilters: { customFilters: [{ val: '* *' }] } });
            });
        });

        describe('test DOES_NOT_CONTAIN condition', () => {
            it('should load DOES_NOT_CONTAIN condition from char set "*xxx*"', () => {
                expect(FilterConditionItems.testMappingFilterColumn({ customFilters: { customFilters: [{ val: '*xxx*', operator: CustomFilterOperator.NOT_EQUALS }] } }))
                    .toEqual([FilterConditionItems.DOES_NOT_CONTAIN, { operator1: ExtendCustomFilterOperator.DOES_NOT_CONTAIN, val1: 'xxx' }]);
            });

            it('should support default params with empty string', () => {
                expect(FilterConditionItems.DOES_NOT_CONTAIN.getDefaultFormParams()).toEqual({ operator1: ExtendCustomFilterOperator.DOES_NOT_CONTAIN, val1: '' });
            });

            it('should mapped params with only one operator DOES_NOT_CONTAIN', () => {
                expect(FilterConditionItems.DOES_NOT_CONTAIN.testMappingParams({ operator1: ExtendCustomFilterOperator.DOES_NOT_CONTAIN })).toBeTruthy();
                expect(FilterConditionItems.DOES_NOT_CONTAIN.testMappingParams({ operator1: ExtendCustomFilterOperator.CONTAINS })).toBeFalsy();
                expect(() => FilterConditionItems.DOES_NOT_CONTAIN.testMappingParams({ operator1: ExtendCustomFilterOperator.DOES_NOT_CONTAIN, operator2: ExtendCustomFilterOperator.DOES_NOT_CONTAIN }))
                    .toThrowError();

                expect(FilterConditionItems.DOES_NOT_CONTAIN.testMappingParams({ operator2: ExtendCustomFilterOperator.DOES_NOT_CONTAIN })).toBeTruthy();
            });

            it('should map to filter column with char set "*xxx*"', () => {
                expect(FilterConditionItems.DOES_NOT_CONTAIN.mapToFilterColumn({ operator1: ExtendCustomFilterOperator.DOES_NOT_CONTAIN, val1: 'univer' }))
                    .toEqual({ customFilters: { customFilters: [{ val: '*univer*', operator: CustomFilterOperator.NOT_EQUALS }] } });

                expect(FilterConditionItems.DOES_NOT_CONTAIN.mapToFilterColumn({ operator1: ExtendCustomFilterOperator.DOES_NOT_CONTAIN, val1: ' ' }))
                    .toEqual({ customFilters: { customFilters: [{ val: '* *', operator: CustomFilterOperator.NOT_EQUALS }] } });
            });
        });

        describe('test STARTS_WITH', () => {
            it('should load STARTS_WITH condition from char set "xxx*"', () => {
                expect(FilterConditionItems.testMappingFilterColumn({ customFilters: { customFilters: [{ val: 'xxx*' }] } }))
                    .toEqual([FilterConditionItems.STARTS_WITH, { operator1: ExtendCustomFilterOperator.STARTS_WITH, val1: 'xxx' }]);
            });

            it('should support default params with empty string', () => {
                expect(FilterConditionItems.STARTS_WITH.getDefaultFormParams()).toEqual({ operator1: ExtendCustomFilterOperator.STARTS_WITH, val1: '' });
            });

            it('should mapped params with only one operator STARTS_WITH', () => {
                expect(FilterConditionItems.STARTS_WITH.testMappingParams({ operator1: ExtendCustomFilterOperator.STARTS_WITH })).toBeTruthy();
                expect(FilterConditionItems.STARTS_WITH.testMappingParams({ operator1: ExtendCustomFilterOperator.DOES_NOT_START_WITH })).toBeFalsy();
                expect(() => FilterConditionItems.STARTS_WITH.testMappingParams({ operator1: ExtendCustomFilterOperator.STARTS_WITH, operator2: ExtendCustomFilterOperator.STARTS_WITH }))
                    .toThrowError();

                expect(FilterConditionItems.STARTS_WITH.testMappingParams({ operator2: ExtendCustomFilterOperator.STARTS_WITH })).toBeTruthy();
            });

            it('should map to filter column with char set "xxx*"', () => {
                expect(FilterConditionItems.STARTS_WITH.mapToFilterColumn({ operator1: ExtendCustomFilterOperator.STARTS_WITH, val1: 'univer' }))
                    .toEqual({ customFilters: { customFilters: [{ val: 'univer*' }] } });

                expect(FilterConditionItems.STARTS_WITH.mapToFilterColumn({ operator1: ExtendCustomFilterOperator.STARTS_WITH, val1: ' ' }))
                    .toEqual({ customFilters: { customFilters: [{ val: ' *' }] } });
            });
        });

        describe('test ENDS_WITH', () => {
            it('should load ENDS_WITH condition from char set "*xxx"', () => {
                expect(FilterConditionItems.testMappingFilterColumn({ customFilters: { customFilters: [{ val: '*xxx' }] } }))
                    .toEqual([FilterConditionItems.ENDS_WITH, { operator1: ExtendCustomFilterOperator.ENDS_WITH, val1: 'xxx' }]);
            });

            it('should support default params with empty string', () => {
                expect(FilterConditionItems.ENDS_WITH.getDefaultFormParams()).toEqual({ operator1: ExtendCustomFilterOperator.ENDS_WITH, val1: '' });
            });

            it('should mapped params with only one operator ENDS_WITH', () => {
                expect(FilterConditionItems.ENDS_WITH.testMappingParams({ operator1: ExtendCustomFilterOperator.ENDS_WITH })).toBeTruthy();
                expect(FilterConditionItems.ENDS_WITH.testMappingParams({ operator1: ExtendCustomFilterOperator.DOES_NOT_END_WITH })).toBeFalsy();
                expect(() => FilterConditionItems.ENDS_WITH.testMappingParams({ operator1: ExtendCustomFilterOperator.ENDS_WITH, operator2: ExtendCustomFilterOperator.ENDS_WITH }))
                    .toThrowError();

                expect(FilterConditionItems.ENDS_WITH.testMappingParams({ operator2: ExtendCustomFilterOperator.ENDS_WITH })).toBeTruthy();
            });

            it('should map to filter column with char set "*xxx"', () => {
                expect(FilterConditionItems.ENDS_WITH.mapToFilterColumn({ operator1: ExtendCustomFilterOperator.ENDS_WITH, val1: 'univer' }))
                    .toEqual({ customFilters: { customFilters: [{ val: '*univer' }] } });

                expect(FilterConditionItems.ENDS_WITH.mapToFilterColumn({ operator1: ExtendCustomFilterOperator.ENDS_WITH, val1: ' ' }))
                    .toEqual({ customFilters: { customFilters: [{ val: '* ' }] } });
            });
        });

        describe('test EQUALS', () => {
            it('should load EQUALS condition from char set "xxx"', () => {
                expect(FilterConditionItems.testMappingFilterColumn({ customFilters: { customFilters: [{ val: 'xxx' }] } }))
                    .toEqual([FilterConditionItems.EQUALS, { operator1: ExtendCustomFilterOperator.EQUALS, val1: 'xxx' }]);

                expect(FilterConditionItems.testMappingFilterColumn({ filters: { filters: [''] } }))
                    .toEqual([FilterConditionItems.EQUALS, { operator1: ExtendCustomFilterOperator.EQUALS, val1: '' }]);
            });

            it('should support default params with empty string', () => {
                expect(FilterConditionItems.EQUALS.getDefaultFormParams()).toEqual({ operator1: ExtendCustomFilterOperator.EQUALS, val1: '' });
            });

            it('should mapped params with only one operator EQUALS', () => {
                expect(FilterConditionItems.EQUALS.testMappingParams({ operator1: ExtendCustomFilterOperator.EQUALS })).toBeTruthy();
                expect(FilterConditionItems.EQUALS.testMappingParams({ operator1: ExtendCustomFilterOperator.NOT_EQUALS })).toBeFalsy();
                expect(() => FilterConditionItems.EQUALS.testMappingParams({ operator1: ExtendCustomFilterOperator.EQUALS, operator2: ExtendCustomFilterOperator.EQUALS }))
                    .toThrowError();

                expect(FilterConditionItems.EQUALS.testMappingParams({ operator2: ExtendCustomFilterOperator.EQUALS })).toBeTruthy();
            });

            it('should map to filter column with char set "xxx"', () => {
                expect(FilterConditionItems.EQUALS.mapToFilterColumn({ operator1: ExtendCustomFilterOperator.EQUALS, val1: 'univer' }))
                    .toEqual({ customFilters: { customFilters: [{ val: 'univer' }] } });

                expect(FilterConditionItems.EQUALS.mapToFilterColumn({ operator1: ExtendCustomFilterOperator.EQUALS, val1: ' ' }))
                    .toEqual({ customFilters: { customFilters: [{ val: ' ' }] } });
            });
        });

        describe('test GREATER_THAN', () => {
            it('should load GREATER_THAN condition from operator"', () => {
                expect(FilterConditionItems.testMappingFilterColumn({ customFilters: { customFilters: [{ val: '123', operator: CustomFilterOperator.GREATER_THAN }] } }))
                    .toEqual([FilterConditionItems.GREATER_THAN, { operator1: CustomFilterOperator.GREATER_THAN, val1: '123' }]);
            });

            it('should support default params with empty string', () => {
                expect(FilterConditionItems.GREATER_THAN.getDefaultFormParams()).toEqual({ operator1: CustomFilterOperator.GREATER_THAN, val1: '' });
            });

            it('should mapped params with only one operator GREATER_THAN', () => {
                expect(FilterConditionItems.GREATER_THAN.testMappingParams({ operator1: CustomFilterOperator.GREATER_THAN })).toBeTruthy();
                expect(FilterConditionItems.GREATER_THAN.testMappingParams({ operator1: CustomFilterOperator.LESS_THAN })).toBeFalsy();
                expect(() => FilterConditionItems.GREATER_THAN.testMappingParams({ operator1: CustomFilterOperator.GREATER_THAN, operator2: CustomFilterOperator.GREATER_THAN }))
                    .toThrowError();

                expect(FilterConditionItems.GREATER_THAN.testMappingParams({ operator2: CustomFilterOperator.GREATER_THAN })).toBeTruthy();
            });

            it('should map to filter column with operator GREATER_THAN', () => {
                expect(FilterConditionItems.GREATER_THAN.mapToFilterColumn({ operator1: CustomFilterOperator.GREATER_THAN, val1: '123' }))
                    .toEqual({ customFilters: { customFilters: [{ val: '123', operator: CustomFilterOperator.GREATER_THAN }] } });
            });
        });

        describe('test GREATER_THAN_OR_EQUAL', () => {
            it('should load GREATER_THAN_OR_EQUAL condition from operator"', () => {
                expect(FilterConditionItems.testMappingFilterColumn({ customFilters: { customFilters: [{ val: '123', operator: CustomFilterOperator.GREATER_THAN_OR_EQUAL }] } }))
                    .toEqual([FilterConditionItems.GREATER_THAN_OR_EQUAL, { operator1: CustomFilterOperator.GREATER_THAN_OR_EQUAL, val1: '123' }]);
            });

            it('should support default params with empty string', () => {
                expect(FilterConditionItems.GREATER_THAN_OR_EQUAL.getDefaultFormParams()).toEqual({ operator1: CustomFilterOperator.GREATER_THAN_OR_EQUAL, val1: '' });
            });

            it('should mapped params with only one operator GREATER_THAN_OR_EQUAL', () => {
                expect(FilterConditionItems.GREATER_THAN_OR_EQUAL.testMappingParams({ operator1: CustomFilterOperator.GREATER_THAN_OR_EQUAL })).toBeTruthy();
                expect(FilterConditionItems.GREATER_THAN_OR_EQUAL.testMappingParams({ operator1: CustomFilterOperator.LESS_THAN_OR_EQUAL })).toBeFalsy();
                expect(() => FilterConditionItems.GREATER_THAN_OR_EQUAL.testMappingParams({ operator1: CustomFilterOperator.GREATER_THAN_OR_EQUAL, operator2: CustomFilterOperator.GREATER_THAN_OR_EQUAL }))
                    .toThrowError();

                expect(FilterConditionItems.GREATER_THAN_OR_EQUAL.testMappingParams({ operator2: CustomFilterOperator.GREATER_THAN_OR_EQUAL })).toBeTruthy();
            });

            it('should map to filter column with operator GREATER_THAN_OR_EQUAL', () => {
                expect(FilterConditionItems.GREATER_THAN_OR_EQUAL.mapToFilterColumn({ operator1: CustomFilterOperator.GREATER_THAN_OR_EQUAL, val1: '123' }))
                    .toEqual({ customFilters: { customFilters: [{ val: '123', operator: CustomFilterOperator.GREATER_THAN_OR_EQUAL }] } });
            });
        });

        describe('test LESS_THAN', () => {
            it('should load LESS_THAN condition from operator"', () => {
                expect(FilterConditionItems.testMappingFilterColumn({ customFilters: { customFilters: [{ val: '123', operator: CustomFilterOperator.LESS_THAN }] } }))
                    .toEqual([FilterConditionItems.LESS_THAN, { operator1: CustomFilterOperator.LESS_THAN, val1: '123' }]);
            });

            it('should support default params with empty string', () => {
                expect(FilterConditionItems.LESS_THAN.getDefaultFormParams()).toEqual({ operator1: CustomFilterOperator.LESS_THAN, val1: '' });
            });

            it('should mapped params with only one operator LESS_THAN', () => {
                expect(FilterConditionItems.LESS_THAN.testMappingParams({ operator1: CustomFilterOperator.LESS_THAN })).toBeTruthy();
                expect(FilterConditionItems.LESS_THAN.testMappingParams({ operator1: CustomFilterOperator.GREATER_THAN })).toBeFalsy();
                expect(() => FilterConditionItems.LESS_THAN.testMappingParams({ operator1: CustomFilterOperator.LESS_THAN, operator2: CustomFilterOperator.LESS_THAN }))
                    .toThrowError();

                expect(FilterConditionItems.LESS_THAN.testMappingParams({ operator2: CustomFilterOperator.LESS_THAN })).toBeTruthy();
            });

            it('should map to filter column with operator LESS_THAN', () => {
                expect(FilterConditionItems.LESS_THAN.mapToFilterColumn({ operator1: CustomFilterOperator.LESS_THAN, val1: '123' }))
                    .toEqual({ customFilters: { customFilters: [{ val: '123', operator: CustomFilterOperator.LESS_THAN }] } });
            });
        });

        describe('test LESS_THAN_OR_EQUAL', () => {
            it('should load LESS_THAN_OR_EQUAL condition from operator"', () => {
                expect(FilterConditionItems.testMappingFilterColumn({ customFilters: { customFilters: [{ val: '123', operator: CustomFilterOperator.LESS_THAN_OR_EQUAL }] } }))
                    .toEqual([FilterConditionItems.LESS_THAN_OR_EQUAL, { operator1: CustomFilterOperator.LESS_THAN_OR_EQUAL, val1: '123' }]);
            });

            it('should support default params with empty string', () => {
                expect(FilterConditionItems.LESS_THAN_OR_EQUAL.getDefaultFormParams()).toEqual({ operator1: CustomFilterOperator.LESS_THAN_OR_EQUAL, val1: '' });
            });

            it('should mapped params with only one operator LESS_THAN_OR_EQUAL', () => {
                expect(FilterConditionItems.LESS_THAN_OR_EQUAL.testMappingParams({ operator1: CustomFilterOperator.LESS_THAN_OR_EQUAL })).toBeTruthy();
                expect(FilterConditionItems.LESS_THAN_OR_EQUAL.testMappingParams({ operator1: CustomFilterOperator.GREATER_THAN_OR_EQUAL })).toBeFalsy();
                expect(() => FilterConditionItems.LESS_THAN_OR_EQUAL.testMappingParams({ operator1: CustomFilterOperator.LESS_THAN_OR_EQUAL, operator2: CustomFilterOperator.LESS_THAN_OR_EQUAL }))
                    .toThrowError();

                expect(FilterConditionItems.LESS_THAN_OR_EQUAL.testMappingParams({ operator2: CustomFilterOperator.LESS_THAN_OR_EQUAL })).toBeTruthy();
            });

            it('should map to filter column with operator LESS_THAN_OR_EQUAL', () => {
                expect(FilterConditionItems.LESS_THAN_OR_EQUAL.mapToFilterColumn({ operator1: CustomFilterOperator.LESS_THAN_OR_EQUAL, val1: '123' }))
                    .toEqual({ customFilters: { customFilters: [{ val: '123', operator: CustomFilterOperator.LESS_THAN_OR_EQUAL }] } });
            });
        });

        describe('test EQUAL condition', () => {
            it('should load EQUAL condition from operator"', () => {
                expect(FilterConditionItems.testMappingFilterColumn({ customFilters: { customFilters: [{ val: '123', operator: CustomFilterOperator.EQUAL }] } }))
                    .toEqual([FilterConditionItems.EQUAL, { operator1: CustomFilterOperator.EQUAL, val1: '123' }]);
            });

            it('should support default params with empty string', () => {
                expect(FilterConditionItems.EQUAL.getDefaultFormParams()).toEqual({ operator1: CustomFilterOperator.EQUAL, val1: '' });
            });

            it('should mapped params with only one operator EQUAL', () => {
                expect(FilterConditionItems.EQUAL.testMappingParams({ operator1: CustomFilterOperator.EQUAL })).toBeTruthy();
                expect(FilterConditionItems.EQUAL.testMappingParams({ operator1: CustomFilterOperator.NOT_EQUALS })).toBeFalsy();
                expect(() => FilterConditionItems.EQUAL.testMappingParams({ operator1: CustomFilterOperator.EQUAL, operator2: CustomFilterOperator.EQUAL }))
                    .toThrowError();

                expect(FilterConditionItems.EQUAL.testMappingParams({ operator2: CustomFilterOperator.EQUAL })).toBeTruthy();
            });

            it('should map to filter column with operator EQUAL', () => {
                expect(FilterConditionItems.EQUAL.mapToFilterColumn({ operator1: CustomFilterOperator.EQUAL, val1: '123' }))
                    .toEqual({ customFilters: { customFilters: [{ val: '123', operator: CustomFilterOperator.EQUAL }] } });
            });
        });

        describe('test NOT_EQUAL', () => {
            it('should load NOT_EQUAL condition from operator"', () => {
                expect(FilterConditionItems.testMappingFilterColumn({ customFilters: { customFilters: [{ val: '123', operator: CustomFilterOperator.NOT_EQUALS }] } }))
                    .toEqual([FilterConditionItems.NOT_EQUAL, { operator1: CustomFilterOperator.NOT_EQUALS, val1: '123' }]);
            });

            it('should support default params with empty string', () => {
                expect(FilterConditionItems.NOT_EQUAL.getDefaultFormParams()).toEqual({ operator1: CustomFilterOperator.NOT_EQUALS, val1: '' });
            });

            it('should mapped params with only one operator NOT_EQUAL', () => {
                expect(FilterConditionItems.NOT_EQUAL.testMappingParams({ operator1: CustomFilterOperator.NOT_EQUALS })).toBeTruthy();
                expect(FilterConditionItems.NOT_EQUAL.testMappingParams({ operator1: CustomFilterOperator.EQUAL })).toBeFalsy();
                expect(() => FilterConditionItems.NOT_EQUAL.testMappingParams({ operator1: CustomFilterOperator.NOT_EQUALS, operator2: CustomFilterOperator.NOT_EQUALS }))
                    .toThrowError();

                expect(FilterConditionItems.NOT_EQUAL.testMappingParams({ operator2: CustomFilterOperator.NOT_EQUALS })).toBeTruthy();
            });

            it('should map to filter column with operator NOT_EQUAL', () => {
                expect(FilterConditionItems.NOT_EQUAL.mapToFilterColumn({ operator1: CustomFilterOperator.NOT_EQUALS, val1: '123' }))
                    .toEqual({ customFilters: { customFilters: [{ val: '123', operator: CustomFilterOperator.NOT_EQUALS }] } });
            });
        });

        describe('test BETWEEN', () => {
            it('should load BETWEEN condition from correct combination of two operators"', () => {
                expect(FilterConditionItems.testMappingFilterColumn({
                    customFilters: {
                        and: BooleanNumber.TRUE,
                        customFilters: [
                            { val: '123', operator: CustomFilterOperator.GREATER_THAN_OR_EQUAL },
                            { val: '456', operator: CustomFilterOperator.LESS_THAN_OR_EQUAL },
                        ],
                    },
                })).toEqual([FilterConditionItems.BETWEEN, {
                    and: true,
                    operator1: CustomFilterOperator.GREATER_THAN_OR_EQUAL,
                    val1: '123',
                    operator2: CustomFilterOperator.LESS_THAN_OR_EQUAL,
                    val2: '456',
                }]);

                expect(FilterConditionItems.testMappingFilterColumn({
                    customFilters: {
                        and: BooleanNumber.TRUE,
                        customFilters: [
                            { val: '456', operator: CustomFilterOperator.LESS_THAN_OR_EQUAL },
                            { val: '123', operator: CustomFilterOperator.GREATER_THAN_OR_EQUAL },
                        ],
                    },
                })).toEqual([FilterConditionItems.BETWEEN, {
                    and: true,
                    operator1: CustomFilterOperator.GREATER_THAN_OR_EQUAL,
                    val1: '123',
                    operator2: CustomFilterOperator.LESS_THAN_OR_EQUAL,
                    val2: '456',
                }]);

                expect(FilterConditionItems.testMappingFilterColumn({
                    customFilters: {
                        customFilters: [
                            { val: '456', operator: CustomFilterOperator.LESS_THAN_OR_EQUAL },
                            { val: '123', operator: CustomFilterOperator.GREATER_THAN_OR_EQUAL },
                        ],
                    },
                })).not.toEqual([FilterConditionItems.BETWEEN, {
                    and: true,
                    operator1: CustomFilterOperator.GREATER_THAN_OR_EQUAL,
                    val1: '123',
                    operator2: CustomFilterOperator.LESS_THAN_OR_EQUAL,
                    val2: '456',
                }]);
            });

            it('should support default params with empty string', () => {
                expect(FilterConditionItems.BETWEEN.getDefaultFormParams()).toEqual({
                    and: true,
                    operator1: CustomFilterOperator.GREATER_THAN_OR_EQUAL,
                    val1: '',
                    operator2: CustomFilterOperator.LESS_THAN_OR_EQUAL,
                    val2: '',
                });
            });

            it('should mapped params with only two operators GREATER_THAN_OR_EQUAL and LESS_THAN_OR_EQUAL', () => {
                expect(FilterConditionItems.BETWEEN.testMappingParams({
                    and: true,
                    operator1: CustomFilterOperator.GREATER_THAN_OR_EQUAL,
                    operator2: CustomFilterOperator.LESS_THAN_OR_EQUAL,
                })).toBeTruthy();

                expect(FilterConditionItems.BETWEEN.testMappingParams({
                    and: true,
                    operator1: CustomFilterOperator.LESS_THAN_OR_EQUAL,
                    operator2: CustomFilterOperator.GREATER_THAN_OR_EQUAL,
                })).toBeTruthy();

                expect(FilterConditionItems.BETWEEN.testMappingParams({
                    and: true,
                    operator1: CustomFilterOperator.GREATER_THAN_OR_EQUAL,
                })).toBeFalsy();

                expect(FilterConditionItems.BETWEEN.testMappingParams({
                    and: true,
                    operator2: CustomFilterOperator.LESS_THAN_OR_EQUAL,
                })).toBeFalsy();

                expect(FilterConditionItems.BETWEEN.testMappingParams({
                    and: true,
                    operator1: CustomFilterOperator.GREATER_THAN_OR_EQUAL,
                    operator2: CustomFilterOperator.GREATER_THAN_OR_EQUAL,
                })).toBeFalsy();
            });

            it('should map to filter column with correct combination of two operators', () => {
                expect(FilterConditionItems.BETWEEN.mapToFilterColumn({
                    and: true,
                    operator1: CustomFilterOperator.GREATER_THAN_OR_EQUAL,
                    val1: '123',
                    operator2: CustomFilterOperator.LESS_THAN_OR_EQUAL,
                    val2: '456',
                })).toEqual({
                    customFilters: {
                        and: BooleanNumber.TRUE,
                        customFilters: [
                            { val: '123', operator: CustomFilterOperator.GREATER_THAN_OR_EQUAL },
                            { val: '456', operator: CustomFilterOperator.LESS_THAN_OR_EQUAL },
                        ],
                    },
                });
            });
        });

        describe('test NOT_BETWEEN', () => {
            it('should load NOT_BETWEEN condition from correct combination of two operators"', () => {
                expect(FilterConditionItems.testMappingFilterColumn({
                    customFilters: {
                        customFilters: [
                            { val: '123', operator: CustomFilterOperator.LESS_THAN },
                            { val: '456', operator: CustomFilterOperator.GREATER_THAN },
                        ],
                    },
                })).toEqual([FilterConditionItems.NOT_BETWEEN, {
                    operator1: CustomFilterOperator.LESS_THAN,
                    val1: '123',
                    operator2: CustomFilterOperator.GREATER_THAN,
                    val2: '456',
                }]);
            });

            it('should support default params with empty string', () => {
                expect(FilterConditionItems.NOT_BETWEEN.getDefaultFormParams()).toEqual({
                    operator1: CustomFilterOperator.LESS_THAN,
                    val1: '',
                    operator2: CustomFilterOperator.GREATER_THAN,
                    val2: '',
                });
            });

            it('should mapped params with only two operators GREATER_THAN and LESS_THAN', () => {
                expect(FilterConditionItems.NOT_BETWEEN.testMappingParams({
                    operator1: CustomFilterOperator.GREATER_THAN,
                    operator2: CustomFilterOperator.LESS_THAN,
                })).toBeTruthy();

                expect(FilterConditionItems.NOT_BETWEEN.testMappingParams({
                    operator1: CustomFilterOperator.LESS_THAN,
                    operator2: CustomFilterOperator.GREATER_THAN,
                })).toBeTruthy();

                expect(FilterConditionItems.NOT_BETWEEN.testMappingParams({
                    operator1: CustomFilterOperator.GREATER_THAN,
                })).toBeFalsy();

                expect(FilterConditionItems.NOT_BETWEEN.testMappingParams({
                    operator2: CustomFilterOperator.LESS_THAN,
                })).toBeFalsy();

                expect(FilterConditionItems.NOT_BETWEEN.testMappingParams({
                    operator1: CustomFilterOperator.GREATER_THAN,
                    operator2: CustomFilterOperator.GREATER_THAN,
                })).toBeFalsy();
            });

            it('should map to filter column with correct combination of two operators', () => {
                expect(FilterConditionItems.NOT_BETWEEN.mapToFilterColumn({
                    operator1: CustomFilterOperator.GREATER_THAN,
                    val1: '123',
                    operator2: CustomFilterOperator.LESS_THAN,
                    val2: '456',
                })).toEqual({
                    customFilters: {
                        customFilters: [
                            { val: '123', operator: CustomFilterOperator.GREATER_THAN },
                            { val: '456', operator: CustomFilterOperator.LESS_THAN },
                        ],
                    },
                });
            });
        });

        describe('test CUSTOM', () => {
            it('should load CUSTOM condition from two custom filters that cannot map to previous', () => {
                expect(FilterConditionItems.testMappingFilterColumn({ customFilters: { and: BooleanNumber.TRUE, customFilters: [
                    { val: '*123' },
                    { val: '123*' },
                ] } })).toEqual([FilterConditionItems.CUSTOM, {
                    and: true,
                    operator1: ExtendCustomFilterOperator.ENDS_WITH,
                    val1: '123',
                    operator2: ExtendCustomFilterOperator.STARTS_WITH,
                    val2: '123',
                }]);
            });

            it('should support default params with empty string', () => {
                expect(FilterConditionItems.CUSTOM.getDefaultFormParams()).toEqual({
                    operator1: ExtendCustomFilterOperator.NONE,
                    val1: '',
                    operator2: ExtendCustomFilterOperator.NONE,
                    val2: '',
                });
            });

            it('should mapped by any params change', () => {
                expect(FilterConditionItems.CUSTOM.testMappingParams({ operator1: ExtendCustomFilterOperator.CUSTOM })).toBeTruthy();
            });

            it('should map to filter column with empty string', () => {
                expect(FilterConditionItems.CUSTOM.mapToFilterColumn({
                    and: true,
                    operator1: ExtendCustomFilterOperator.ENDS_WITH,
                    val1: '123',
                    operator2: CustomFilterOperator.GREATER_THAN,
                    val2: '456',
                }))
                    .toEqual({ customFilters: {
                        and: BooleanNumber.TRUE,
                        customFilters: [{ val: '*123' }, { val: '456', operator: CustomFilterOperator.GREATER_THAN }],
                    } });
            });

            it('should fallback to NONE when no custom filter is provided', () => {
                expect(FilterConditionItems.CUSTOM.mapToFilterColumn({ operator1: ExtendCustomFilterOperator.NONE })).toEqual(null);
            });

            it('should fallback to one conditional filter when only one is provided', () => {
                expect(FilterConditionItems.CUSTOM.mapToFilterColumn({ operator1: ExtendCustomFilterOperator.ENDS_WITH, val1: '123' }))
                    .toEqual({ customFilters: { customFilters: [{ val: '*123' }] } });

                expect(FilterConditionItems.CUSTOM.mapToFilterColumn({ operator2: ExtendCustomFilterOperator.STARTS_WITH, val2: '123' }))
                    .toEqual({ customFilters: { customFilters: [{ val: '123*' }] } });
            });
        });
    });
});
