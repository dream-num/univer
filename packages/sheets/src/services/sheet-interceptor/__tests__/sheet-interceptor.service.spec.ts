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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { INTERCEPTOR_POINT } from '../interceptor-const';
import { AFTER_CELL_EDIT, SheetInterceptorService, VALIDATE_CELL } from '../sheet-interceptor.service';
import { createSheetTestBed } from './create-core-test-bed';

describe('Test SheetInterceptorService', () => {
    let univer: Univer;
    let get: Injector['get'];
    const stringIntercept = createInterceptorKey<string, null>('stringIntercept');
    const numberIntercept = createInterceptorKey<number, { step: number }>('numberIntercept');
    type ICellContentTestLocation = ISheetLocation & { rawData: Nullable<ICellData> };

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
        const sheet = cus.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()!;
        return (key && filter) ? sheet.getCellWithFilteredInterceptors(row, col, key, filter) : sheet.getCell(row, col);
    }

    function getRowFiltered(row: number): boolean {
        const cus = get(IUniverInstanceService);
        const sheet = cus.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()!;
        return sheet.getRowFiltered(row);
    }

    function getRowVisible(row: number): boolean {
        const cus = get(IUniverInstanceService);
        const sheet = cus.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()!;
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

                    return next(_cell);
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

                    return next(_cell);
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

                    return next(_cell);
                },
            });

            interceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
                id: 'should-not-skip',
                priority: 0,
                handler(_cell, location: ISheetLocation, next: (v: Nullable<ICellData>) => Nullable<ICellData>) {
                    if (location.row === 0 && location.col === 0) {
                        return { v: 'intercepted B' };
                    }

                    return next(_cell);
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

        it('should reuse row filtered composed interceptors while registrations are stable', () => {
            const interceptorService = get(SheetInterceptorService);
            const fetchThroughInterceptorsSpy = vi.spyOn(interceptorService, 'fetchThroughInterceptors');

            getRowFiltered(1);
            getRowFiltered(2);
            getRowFiltered(3);

            expect(fetchThroughInterceptorsSpy).toHaveBeenCalledTimes(1);

            const disposable = interceptorService.intercept(INTERCEPTOR_POINT.ROW_FILTERED, {
                handler(filtered, _, next) {
                    return next(filtered);
                },
            });

            getRowFiltered(4);
            getRowFiltered(5);

            expect(fetchThroughInterceptorsSpy).toHaveBeenCalledTimes(2);

            disposable.dispose();

            getRowFiltered(6);
            getRowFiltered(7);

            expect(fetchThroughInterceptorsSpy).toHaveBeenCalledTimes(3);
        });
    });

    describe('Test intercept in general case', () => {
        it('collects command, after-command, range, auto-height, and before-command interceptor results in priority order', async () => {
            const interceptorService = get(SheetInterceptorService);
            const high = {
                priority: 100,
                getMutations: () => ({
                    preRedos: [{ id: 'high-pre-redo', params: {} }],
                    redos: [{ id: 'high-redo', params: {} }],
                    preUndos: [{ id: 'high-pre-undo', params: {} }],
                    undos: [{ id: 'high-undo', params: {} }],
                }),
            };
            const low = {
                priority: 0,
                getMutations: () => ({
                    redos: [{ id: 'low-redo', params: {} }],
                    undos: [{ id: 'low-undo', params: {} }],
                }),
            };

            const commandDisposable = interceptorService.interceptCommand(low);
            interceptorService.interceptCommand(high);
            expect(interceptorService.onCommandExecute({ id: 'cmd', params: {} })).toEqual({
                preRedos: [{ id: 'high-pre-redo', params: {} }],
                redos: [{ id: 'high-redo', params: {} }, { id: 'low-redo', params: {} }],
                preUndos: [{ id: 'high-pre-undo', params: {} }],
                undos: [{ id: 'high-undo', params: {} }, { id: 'low-undo', params: {} }],
            });
            expect(() => interceptorService.interceptCommand(high)).toThrow('Interceptor already exists');
            commandDisposable.dispose();

            const afterDisposable = interceptorService.interceptAfterCommand(high);
            interceptorService.interceptAfterCommand(low);
            expect(interceptorService.afterCommandExecute({ id: 'cmd', params: {} })).toEqual({
                redos: [{ id: 'high-redo', params: {} }, { id: 'low-redo', params: {} }],
                undos: [{ id: 'high-undo', params: {} }, { id: 'low-undo', params: {} }],
            });
            expect(() => interceptorService.interceptAfterCommand(high)).toThrow('Interceptor already exists');
            afterDisposable.dispose();

            const rangeDisposable = interceptorService.interceptRanges(high);
            interceptorService.interceptRanges(low);
            expect(interceptorService.generateMutationsByRanges({ unitId: 'unit', subUnitId: 'sheet', ranges: [] })).toEqual({
                preRedos: [{ id: 'high-pre-redo', params: {} }],
                redos: [{ id: 'high-redo', params: {} }, { id: 'low-redo', params: {} }],
                preUndos: [{ id: 'high-pre-undo', params: {} }],
                undos: [{ id: 'high-undo', params: {} }, { id: 'low-undo', params: {} }],
            });
            expect(() => interceptorService.interceptRanges(high)).toThrow('Interceptor already exists');
            rangeDisposable.dispose();

            const autoHeightDisposable = interceptorService.interceptAutoHeight(high);
            interceptorService.interceptAutoHeight(low);
            expect(interceptorService.generateMutationsOfAutoHeight({ unitId: 'unit', subUnitId: 'sheet', ranges: [] })).toEqual({
                preRedos: [{ id: 'high-pre-redo', params: {} }],
                redos: [{ id: 'high-redo', params: {} }, { id: 'low-redo', params: {} }],
                preUndos: [{ id: 'high-pre-undo', params: {} }],
                undos: [{ id: 'high-undo', params: {} }, { id: 'low-undo', params: {} }],
            });
            expect(() => interceptorService.interceptAutoHeight(high)).toThrow('Interceptor already exists');
            autoHeightDisposable.dispose();

            const before = { priority: 10, performCheck: vi.fn(async () => true) };
            interceptorService.interceptBeforeCommand(before);
            interceptorService.interceptBeforeCommand({ priority: 0, performCheck: async () => false });
            await expect(interceptorService.beforeCommandExecute({ id: 'cmd', params: {} })).resolves.toBe(false);
            expect(before.performCheck).toHaveBeenCalledWith({ id: 'cmd', params: {} });
            expect(() => interceptorService.interceptBeforeCommand(before)).toThrow('Interceptor already exists');
        });

        it('runs write-cell and validation interceptors with workbook context', async () => {
            const interceptorService = get(SheetInterceptorService);
            const workbook = get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            const worksheet = workbook.getActiveSheet()!;

            interceptorService.writeCellInterceptor.intercept(AFTER_CELL_EDIT, {
                priority: 100,
                handler(value, location, next) {
                    expect(location.unitId).toBe(workbook.getUnitId());
                    expect(location.subUnitId).toBe(worksheet.getSheetId());
                    expect(location.origin).toEqual({ v: 'origin' });
                    return next({ ...value, v: `${value?.v} edited` });
                },
            });

            interceptorService.writeCellInterceptor.intercept(VALIDATE_CELL, {
                priority: 100,
                handler(value, location, next) {
                    if (location.row === 3 && location.col === 4) {
                        return Promise.resolve(false);
                    }
                    return next(value);
                },
            });

            expect(interceptorService.onWriteCell(workbook, worksheet, 1, 2, { v: 'origin' })).toEqual({ v: 'origin edited' });
            await expect(interceptorService.onValidateCell(workbook, worksheet, 3, 4)).resolves.toBe(false);
        });

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

        it('should rebuild cached cell content effect interceptors after dispose and same-length replacement', () => {
            const interceptorService = get(SheetInterceptorService);
            const calls: string[] = [];

            interceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
                effect: InterceptorEffectEnum.Style,
                priority: 100,
                handler(value, _, next) {
                    calls.push('first');
                    return next({ ...value, v: `${value?.v} first` });
                },
            });

            const staleDisposable = interceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
                effect: InterceptorEffectEnum.Style,
                priority: 0,
                handler(value, _, next) {
                    calls.push('stale');
                    return next({ ...value, v: `${value?.v} stale` });
                },
            });

            expect(
                interceptorService.fetchThroughInterceptors<ICellData, ICellContentTestLocation>(
                    INTERCEPTOR_POINT.CELL_CONTENT,
                    InterceptorEffectEnum.Style
                )({ v: 'zero' }, null as unknown as ICellContentTestLocation)
            ).toEqual({ v: 'zero first stale' });

            staleDisposable.dispose();

            interceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
                effect: InterceptorEffectEnum.Style,
                priority: 0,
                handler(value, _, next) {
                    calls.push('fresh');
                    return next({ ...value, v: `${value?.v} fresh` });
                },
            });

            calls.length = 0;

            expect(
                interceptorService.fetchThroughInterceptors<ICellData, ICellContentTestLocation>(
                    INTERCEPTOR_POINT.CELL_CONTENT,
                    InterceptorEffectEnum.Style
                )({ v: 'zero' }, null as unknown as ICellContentTestLocation)
            ).toEqual({ v: 'zero first fresh' });
            expect(calls).toEqual(['first', 'fresh']);
        });

        it('should reuse common cell content composed interceptors while registrations are stable', () => {
            const interceptorService = get(SheetInterceptorService);
            const fetchThroughInterceptorsSpy = vi.spyOn(interceptorService, 'fetchThroughInterceptors');

            getCell(0, 0);
            getCell(0, 1);
            getCell(1, 0);

            expect(fetchThroughInterceptorsSpy).toHaveBeenCalledTimes(1);

            const disposable = interceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
                effect: InterceptorEffectEnum.Style | InterceptorEffectEnum.Value,
                handler(value, _, next) {
                    return next(value);
                },
            });

            getCell(1, 1);
            getCell(2, 0);

            expect(fetchThroughInterceptorsSpy).toHaveBeenCalledTimes(2);

            disposable.dispose();

            getCell(2, 1);
            getCell(3, 0);

            expect(fetchThroughInterceptorsSpy).toHaveBeenCalledTimes(3);
        });
    });
});
