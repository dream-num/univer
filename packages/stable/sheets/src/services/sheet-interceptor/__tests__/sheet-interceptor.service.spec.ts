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

import type { ICellData, IInterceptor, Injector, Nullable, Univer, Workbook } from '@univerjs/core';
import type { ISheetLocation } from '../utils/interceptor';
import { createInterceptorKey, InterceptorEffectEnum, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { INTERCEPTOR_POINT } from '../interceptor-const';
import { SheetInterceptorService } from '../sheet-interceptor.service';
import { createSheetTestBed } from './create-core-test-bed';

describe('Test SheetInterceptorService', () => {
    let univer: Univer;
    let get: Injector['get'];
    const stringIntercept = createInterceptorKey<string, null>('stringIntercept');
    const numberIntercept = createInterceptorKey<number, { step: number }>('numberIntercept');

    beforeEach(() => {
        const testBed = createSheetTestBed(undefined, [[SheetInterceptorService]]);
        univer = testBed.univer;
        get = testBed.get;
    });

    afterEach(() => univer.dispose());

    function getCell(row: number, col: number): Nullable<ICellData>;
    function getCell(row: number, col: number, key: string, filter: (interceptor: IInterceptor<any, any>) => boolean): Nullable<ICellData>;
    function getCell(row: number, col: number, key?: string, filter?: (interceptor: IInterceptor<any, any>) => boolean): Nullable<ICellData> {
        const cus = get(IUniverInstanceService);
        const sheet = cus.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()!;
        return (key && filter) ? sheet.getCellWithFilteredInterceptors(row, col, key, filter) : sheet.getCell(row, col);
    }

    function getRowFiltered(row: number): boolean {
        const cus = get(IUniverInstanceService);
        const sheet = cus.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()!;
        return sheet.getRowFiltered(row);
    }

    function getRowVisible(row: number): boolean {
        const cus = get(IUniverInstanceService);
        const sheet = cus.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()!;
        return sheet.getRowVisible(row);
    }

    describe('Test intercepting getting cell content', () => {
        it('should intercept cells and merge result if next is called', () => {
            get(SheetInterceptorService).intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
                effect: InterceptorEffectEnum.Value | InterceptorEffectEnum.Style,
                priority: 100,
                handler(_cell, location: ISheetLocation, next: (v: Nullable<ICellData>) => Nullable<ICellData>) {
                    if (location.row === 0 && location.col === 0) {
                        return next({ v: 'intercepted' });
                    }

                    return next();
                },
            });

            expect(getCell(0, 0)).toEqual({ v: 'intercepted' });
            expect(getCell(0, 1)).toEqual({ v: 'A2' });
        });

        it('interceptors should directly return result if next is not called', () => {
            get(SheetInterceptorService).intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
                priority: 100,
                effect: InterceptorEffectEnum.Value | InterceptorEffectEnum.Style,
                handler(_cell, location: ISheetLocation, next: (v: Nullable<ICellData>) => Nullable<ICellData>) {
                    if (location.row === 0 && location.col === 0) {
                        return { v: 'intercepted' };
                    }

                    return next();
                },
            });

            expect(getCell(0, 0)).toEqual({ v: 'intercepted' });
            expect(getCell(0, 1)).toEqual({ v: 'A2' });
        });

        it('should skip some interceptors by filtering out the effect', () => {
            const interceptorService = get(SheetInterceptorService);
            interceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
                id: 'should-skip',
                priority: 100,
                handler(_cell, location: ISheetLocation, next: (v: Nullable<ICellData>) => Nullable<ICellData>) {
                    if (location.row === 0 && location.col === 0) {
                        return { v: 'intercepted A' };
                    }

                    return next();
                },
            });

            interceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
                id: 'should-not-skip',
                priority: 0,
                handler(_cell, location: ISheetLocation, next: (v: Nullable<ICellData>) => Nullable<ICellData>) {
                    if (location.row === 0 && location.col === 0) {
                        return { v: 'intercepted B' };
                    }

                    return next();
                },
            });

            expect(getCell(0, 0)).toEqual({ v: 'intercepted A' });
            expect(getCell(0, 1)).toEqual({ v: 'A2' });
            expect(getCell(0, 0, 'cache-filter-key', (interceptor) => interceptor.id !== 'should-skip')).toEqual({ v: 'intercepted B' });
        });
    });

    describe('Test intercepting getting row filtered', () => {
        it('should return not filtered when no interceptor is registered', () => {
            expect(getRowFiltered(1)).toBeFalsy();
        });

        it('should return filtered according to the interceptor when it is registed', () => {
            let realFiltered = false;

            get(SheetInterceptorService).intercept(INTERCEPTOR_POINT.ROW_FILTERED, {
                handler(filtered, location, next) {
                    if (filtered) {
                        return true;
                    }

                    if (realFiltered && location.row === 1) {
                        return true;
                    }

                    return next();
                },
            });

            expect(getRowFiltered(1)).toBeFalsy();
            expect(getRowVisible(1)).toBeTruthy();

            realFiltered = true;
            expect(getRowFiltered(1)).toBeTruthy();
            expect(getRowVisible(1)).toBeFalsy();
            expect(getRowFiltered(2)).toBeFalsy();
            expect(getRowVisible(2)).toBeTruthy();
        });
    });

    describe('Test intercept in general case', () => {
        it('should intercept BEFORE_CELL_EDIT and sum the values', () => {
            get(SheetInterceptorService).intercept(numberIntercept, {
                priority: 0,
                handler(value, context, next) {
                    if (context.step) {
                        return next((value || 0) + context.step);
                    }

                    return next(value);
                },
            });

            get(SheetInterceptorService).intercept(numberIntercept, {
                priority: 0,
                handler(value, context, next) {
                    if (context.step) {
                        return next((value || 0) + context.step * 2);
                    }

                    return next(value);
                },
            });

            const result = get(SheetInterceptorService).fetchThroughInterceptors(numberIntercept)(100, { step: 10 });

            expect(result).toBe(130);
        });

        it('big priority should be executed first', () => {
            get(SheetInterceptorService).intercept(stringIntercept, {
                priority: 100,
                handler(value, _, next) {
                    return next(`${value} first`);
                },
            });

            get(SheetInterceptorService).intercept(stringIntercept, {
                priority: 0,
                handler(value, _, next) {
                    return next(`${value} second`);
                },
            });

            const result = get(SheetInterceptorService).fetchThroughInterceptors(stringIntercept)('zero', null);

            expect(result).toBe('zero first second');
        });

        it('the second interceptor should not be executed when not call next in the first interceptor', () => {
            get(SheetInterceptorService).intercept(stringIntercept, {
                priority: 100,
                handler(value, _, _next) {
                    return `${value} first`;
                },
            });

            get(SheetInterceptorService).intercept(stringIntercept, {
                priority: 0,
                handler(value, _, next) {
                    return next(`${value} second`);
                },
            });

            const result = get(SheetInterceptorService).fetchThroughInterceptors(stringIntercept)('zero', null);

            expect(result).toBe('zero first');
        });

        it('should return the initial value when there is no interceptor', () => {
            const result = get(SheetInterceptorService).fetchThroughInterceptors(stringIntercept)('zero', null);

            expect(result).toBe('zero');
        });
    });
});
