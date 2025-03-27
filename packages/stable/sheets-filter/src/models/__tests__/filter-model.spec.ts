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

import type { Injector, IWorkbookData, Workbook } from '@univerjs/core';
import { ILogService, IUniverInstanceService, LocaleType, LogLevel, Univer, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FilterColumn, generateFilterFn } from '../filter-model';
import { CustomFilterOperator } from '../types';

describe('Test filter model and related utils', () => {
    describe('Test "FilterFn"s', () => {
        it('should AND work', () => {
            // equivalent to "between"
            const fn = generateFilterFn({
                colId: 0,
                customFilters: {
                    and: 1,
                    customFilters: [
                        { operator: CustomFilterOperator.LESS_THAN_OR_EQUAL, val: 456 },
                        { operator: CustomFilterOperator.GREATER_THAN_OR_EQUAL, val: 123 },
                    ],
                },
            });

            expect(fn(123)).toBeTruthy();
            expect(fn(456)).toBeTruthy();
            expect(fn(400)).toBeTruthy();
            expect(fn(100)).toBeFalsy();
            expect(fn(500)).toBeFalsy();
        });

        it('should OR work', () => {
            // equivalent to "notBetween"
            const fn = generateFilterFn({
                colId: 0,
                customFilters: {
                    customFilters: [
                        { operator: CustomFilterOperator.LESS_THAN, val: 123 },
                        { operator: CustomFilterOperator.GREATER_THAN, val: 456 },
                    ],
                },
            });

            expect(fn(123)).toBeFalsy();
            expect(fn(456)).toBeFalsy();
            expect(fn(400)).toBeFalsy();
            expect(fn(100)).toBeTruthy();
            expect(fn(500)).toBeTruthy();
        });

        it('should throw error on not supported yet filter types', () => {
            // eslint-disable-next-line ts/no-explicit-any
            expect(() => generateFilterFn({ colId: 0, dynamicFilters: {} } as any)).toThrowError();
        });

        it('should "filter by values" work', () => {
            const fn = generateFilterFn({ colId: 0, filters: { filters: ['hello', 'univer'] } });

            expect(fn('hello')).toBeTruthy();
            expect(fn('univer')).toBeTruthy();
            expect(fn('wzhudev')).toBeFalsy();
            expect(fn('')).toBeFalsy();
            expect(fn(undefined)).toBeFalsy();
        });

        it('should "filter by values" work with blank values', () => {
            const fn = generateFilterFn({ colId: 0, filters: { filters: ['hello', 'univer'], blank: true } });
            expect(fn('hello')).toBeTruthy();
            expect(fn('univer')).toBeTruthy();
            expect(fn('wzhudev')).toBeFalsy();
            expect(fn('')).toBeTruthy();
            expect(fn(undefined)).toBeTruthy();
        });
    });

    describe('Test "FilterColumn"', () => {
        let univer: Univer;
        let filterColumn: FilterColumn;
        let get: Injector['get'];

        beforeEach(() => {
            const testBed = createFilterModelTestBed({
                id: 'test',
                appVersion: '3.0.0-alpha',
                sheets: {
                    sheet1: {
                        id: 'sheet1',
                        name: 'sheet1',
                        cellData: {
                            0: {
                                1: { v: 'header' },
                            },
                            1: {
                                1: { v: 123 },
                            },
                            2: {
                                1: { v: 345 },
                            },
                        },
                    },
                },
                locale: LocaleType.ZH_CN,
                name: '',
                sheetOrder: [],
                styles: {},
            });

            univer = testBed.univer;
            get = testBed.get;
        });

        afterEach(() => {
            univer.dispose();
            filterColumn.dispose();
        });

        it('should not calc when filter fn or range is not set', () => {
            filterColumn = new FilterColumn(
                'test',
                'sheet1',
                get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()!,
                { colId: 0, customFilters: { customFilters: [{ operator: CustomFilterOperator.LESS_THAN, val: 123 }] } },
                { getAlreadyFilteredOutRows() { return new Set(); } }
            );

            expect(filterColumn.hasCache()).toBeFalsy();

            filterColumn.setRangeAndColumn({ startRow: 0, endRow: 100, startColumn: 0, endColumn: 0 }, 0);
            expect(filterColumn.hasCache()).toBeFalsy();

            expect(() => filterColumn.reCalc()).toThrowError();
            expect(filterColumn.hasCache()).toBeFalsy();

            filterColumn.dispose();

            // -------------------------------------------------------

            filterColumn = new FilterColumn(
                'test',
                'sheet1',
                get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()!,
                { colId: 0, customFilters: { customFilters: [{ operator: CustomFilterOperator.LESS_THAN, val: 123 }] } },
                { getAlreadyFilteredOutRows() { return new Set(); } }
            );

            expect(filterColumn.hasCache()).toBeFalsy();

            filterColumn.setCriteria({ colId: 0, customFilters: { customFilters: [{ operator: CustomFilterOperator.LESS_THAN, val: 123 }] } });
            expect(filterColumn.hasCache()).toBeFalsy();

            expect(() => filterColumn.reCalc()).toThrowError();
            expect(filterColumn.hasCache()).toBeFalsy();
        });

        it('should not auto calc when set criteria', () => {
            filterColumn = new FilterColumn(
                'test',
                'sheet1',
                get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()!,
                { colId: 0, customFilters: { customFilters: [{ operator: CustomFilterOperator.LESS_THAN, val: 123 }] } },
                { getAlreadyFilteredOutRows() { return new Set(); } }
            );

            expect(filterColumn.hasCache()).toBeFalsy();

            filterColumn.setRangeAndColumn({ startRow: 0, endRow: 100, startColumn: 0, endColumn: 0 }, 0);
            filterColumn.setCriteria({ colId: 0, customFilters: { customFilters: [{ operator: CustomFilterOperator.LESS_THAN, val: 123 }] } });
            expect(filterColumn.hasCache()).toBeFalsy();
            expect(filterColumn.filteredOutRows).toBeNull();

            filterColumn.reCalc();
            expect(filterColumn.hasCache()).toBeTruthy();
            expect(filterColumn.filteredOutRows!.size).toBe(100);
        });

        it('should filtered out rows correctly', () => {
            filterColumn = new FilterColumn(
                'test',
                'sheet1',
                get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()!,
                { colId: 0, customFilters: { customFilters: [{ operator: CustomFilterOperator.LESS_THAN, val: 123 }] } },
                { getAlreadyFilteredOutRows() { return new Set(); } }
            );

            filterColumn.setRangeAndColumn({ startRow: 1, endRow: 3, startColumn: 1, endColumn: 1 }, 1);
            filterColumn.setCriteria({ colId: 1, customFilters: { customFilters: [{ operator: CustomFilterOperator.GREATER_THAN, val: 200 }] } });
            filterColumn.reCalc();
            expect(filterColumn.filteredOutRows!.size).toBe(1);
        });

        it('should skip rows that already filtered out by other rows', () => {
            filterColumn = new FilterColumn(
                'test',
                'sheet1',
                get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()!,
                { colId: 0, customFilters: { customFilters: [{ operator: CustomFilterOperator.LESS_THAN, val: 123 }] } },
                { getAlreadyFilteredOutRows() { return new Set([1]); } }
            );

            filterColumn.setRangeAndColumn({ startRow: 1, endRow: 3, startColumn: 1, endColumn: 1 }, 1);
            filterColumn.setCriteria({ colId: 1, customFilters: { customFilters: [{ operator: CustomFilterOperator.GREATER_THAN, val: 200 }] } });
            filterColumn.reCalc();
            expect(filterColumn.filteredOutRows!.size).toBe(1);
        });
    });
});

function createFilterModelTestBed(workbookData: IWorkbookData) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    const sheet = univer.createUniverSheet(workbookData);

    const univerInstanceService = get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');

    const logService = get(ILogService);
    logService.setLogLevel(LogLevel.SILENT);

    return {
        univer,
        get,
        sheet,
    };
}
