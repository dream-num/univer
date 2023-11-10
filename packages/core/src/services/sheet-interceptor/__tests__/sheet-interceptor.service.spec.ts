/* eslint-disable no-magic-numbers */
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Univer } from '../../../basics/univer';
import { Nullable } from '../../../common/type-utils';
import { ICellData } from '../../../types/interfaces/i-cell-data';
import { IUniverInstanceService } from '../../instance/instance.service';
import { INTERCEPTOR_NAMES, ISheetLocation, SheetInterceptorService } from '../sheet-interceptor.service';
import { createCoreTestBed } from './create-core-test-bed';

describe('Test SheetInterceptorService', () => {
    let univer: Univer;
    let get: Injector['get'];

    beforeEach(() => {
        const testBed = createCoreTestBed();
        univer = testBed.univer;
        get = testBed.get;
    });

    afterEach(() => univer.dispose());

    function getCell(row: number, col: number): Nullable<ICellData> {
        const cus = get(IUniverInstanceService);
        const sheet = cus.getCurrentUniverSheetInstance().getActiveSheet()!;
        return sheet.getCell(row, col);
    }

    describe('Test intercept getting cell content', () => {
        it('should intercept cells and merge result if next is called', () => {
            get(SheetInterceptorService).intercept(INTERCEPTOR_NAMES.CELL_CONTENT, {
                priority: 100,
                handler(_cell, location: ISheetLocation, next: (v: Nullable<ICellData>) => Nullable<ICellData>) {
                    if (location.row === 0 && location.col === 0) {
                        return next({ m: 'intercepted' });
                    }

                    return next();
                },
            });

            expect(getCell(0, 0)).toEqual({ m: 'intercepted', v: 'A1' });
            expect(getCell(0, 1)).toEqual({ v: 'A2' });
        });

        it('interceptors should directly return result if next is not called', () => {
            get(SheetInterceptorService).intercept(INTERCEPTOR_NAMES.CELL_CONTENT, {
                priority: 100,
                handler(_cell, location: ISheetLocation, next: (v: Nullable<ICellData>) => Nullable<ICellData>) {
                    if (location.row === 0 && location.col === 0) {
                        return { m: 'intercepted' };
                    }

                    return next();
                },
            });

            expect(getCell(0, 0)).toEqual({ m: 'intercepted' });
            expect(getCell(0, 1)).toEqual({ v: 'A2' });
        });
    });

    describe('Test intercept in general case', () => {
        it('should intercept BEFORE_CELL_EDIT and sum the values', () => {
            get(SheetInterceptorService).intercept(INTERCEPTOR_NAMES.BEFORE_CELL_EDIT, {
                priority: 0,
                handler(value: number, context: { step: number }, next) {
                    if (context.step) {
                        return next(value + context.step);
                    }

                    return next(value);
                },
            });

            get(SheetInterceptorService).intercept(INTERCEPTOR_NAMES.BEFORE_CELL_EDIT, {
                priority: 0,
                handler(value: number, context: { step: number }, next) {
                    if (context.step) {
                        return next(value + context.step * 2);
                    }

                    return next(value);
                },
            });

            const result = get(SheetInterceptorService).fetchThroughInterceptors(
                INTERCEPTOR_NAMES.BEFORE_CELL_EDIT,
                100,
                { step: 10 }
            );

            expect(result).toBe(130);
        });

        it('big priority should be executed first', () => {
            get(SheetInterceptorService).intercept(INTERCEPTOR_NAMES.BEFORE_CELL_EDIT, {
                priority: 100,
                handler(value: string, _, next) {
                    return next(`${value} first`);
                },
            });

            get(SheetInterceptorService).intercept(INTERCEPTOR_NAMES.BEFORE_CELL_EDIT, {
                priority: 0,
                handler(value: string, _, next) {
                    return next(`${value} second`);
                },
            });

            const result = get(SheetInterceptorService).fetchThroughInterceptors(
                INTERCEPTOR_NAMES.BEFORE_CELL_EDIT,
                'zero'
            );

            expect(result).toBe('zero first second');
        });

        it('the second interceptor should not be executed when not call next in the first interceptor', () => {
            get(SheetInterceptorService).intercept(INTERCEPTOR_NAMES.BEFORE_CELL_EDIT, {
                priority: 100,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                handler(value: string, _, _next) {
                    return `${value} first`;
                },
            });

            get(SheetInterceptorService).intercept(INTERCEPTOR_NAMES.BEFORE_CELL_EDIT, {
                priority: 0,
                handler(value: string, _, next) {
                    return next(`${value} second`);
                },
            });

            const result = get(SheetInterceptorService).fetchThroughInterceptors(
                INTERCEPTOR_NAMES.BEFORE_CELL_EDIT,
                'zero'
            );

            expect(result).toBe('zero first');
        });
    });
});
