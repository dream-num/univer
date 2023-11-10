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
});
