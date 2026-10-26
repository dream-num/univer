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

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LocaleService } from '../../services/locale/locale.service';
import { BooleanNumber } from '../../types/enum';
import { LocaleType } from '../../types/enum/locale-type';
import { SheetSkeleton } from '../sheet-skeleton';
import { createCoreTestBed } from './create-core-test-bed';

describe('SheetSkeleton dimension fallback', () => {
    let testBed: ReturnType<typeof createCoreTestBed>;

    beforeEach(() => {
        testBed = createCoreTestBed();
        const localeService = testBed.get(LocaleService);
        localeService.load({ [LocaleType.EN_US]: {} });
        localeService.setLocale(LocaleType.EN_US);
        localeService.setDirection('ltr');
    });

    afterEach(() => testBed.univer.dispose());

    it.each([-232.90908628521544, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, '88', null])(
        'collapses invalid dimensions %s while keeping subsequent cells visible and hit-testable',
        (value) => {
            const worksheet = testBed.sheet.getActiveSheet()!;
            const config = worksheet.getConfig();
            config.columnCount = 4;
            config.rowCount = 3;
            config.columnData[0] = { w: value as number };
            config.columnData[1] = { w: 114.3671875 };
            config.rowData[0] = { h: value as number, ah: Number.POSITIVE_INFINITY };
            config.rowData[1] = { h: 30.5, ah: Number.NaN };
            const injector = testBed.univer.__getInjector();
            const createSkeleton = () => injector.createInstance(SheetSkeleton, worksheet, testBed.sheet.getStyles());
            injector.add([SheetSkeleton, { useFactory: createSkeleton }]);
            const skeleton = injector.get(SheetSkeleton);
            try {
                skeleton.calculate();
                expect(skeleton.columnWidthAccumulation).toEqual([0, 114.3671875, 202.3671875, 290.3671875]);
                expect(skeleton.columnTotalWidth).toBe(290.3671875);
                expect(skeleton.rowHeightAccumulation).toEqual([0, 30.5, 54.5]);
                for (let column = 1; column < 4; column++) {
                    const cell = skeleton.getNoMergeCellWithCoordByIndex(0, column, false);
                    expect(cell.endX - cell.startX).toBe(worksheet.getColumnWidth(column));
                    expect(skeleton.getColumnIndexByOffsetX((cell.startX + cell.endX) / 2 + skeleton.rowHeaderWidth, 1, { x: 0, y: 0 })).toBe(column);
                }
                expect(worksheet.getColumnWidth(0)).toBe(0);
                expect(worksheet.getRowHeight(0)).toBe(0);
                expect(worksheet.getRowHeight(1)).toBe(30.5);
            } finally {
                skeleton.dispose();
            }
        }
    );

    it('preserves zero and hidden dimensions while ignoring invalid auto heights', () => {
        const worksheet = testBed.sheet.getActiveSheet()!;
        const config = worksheet.getConfig();
        config.columnCount = 4;
        config.rowCount = 6;
        config.defaultColumnWidth = Number.NaN;
        config.defaultRowHeight = -1;
        config.columnData[0] = { w: 0 };
        config.columnData[1] = { w: -1, hd: BooleanNumber.TRUE };
        config.columnData[3] = {};
        config.rowData[0] = { h: 0 };
        config.rowData[1] = { h: -1, hd: BooleanNumber.TRUE };
        config.rowData[2] = { h: 30.5, ah: 0 };
        config.rowData[3] = { h: 20, ah: 40.5 };
        config.rowData[4] = { h: -1 };
        config.rowData[5] = {};
        const injector = testBed.univer.__getInjector();
        const createSkeleton = () => injector.createInstance(SheetSkeleton, worksheet, testBed.sheet.getStyles());
        injector.add([SheetSkeleton, { useFactory: createSkeleton }]);
        const skeleton = injector.get(SheetSkeleton);
        worksheet.__interceptViewModel((viewModel) => {
            skeleton.disposeWithMe(viewModel.registerRowFilteredInterceptor({ getRowFiltered: (row) => row === 4 }));
        });
        try {
            skeleton.calculate();
            expect(skeleton.columnWidthAccumulation).toEqual([0, 0, 88, 176]);
            expect(skeleton.rowHeightAccumulation).toEqual([0, 0, 30.5, 71, 71, 95]);
            expect(worksheet.getColumnWidth(3)).toBe(88);
            expect(worksheet.getRowHeight(5)).toBe(24);
            expect(worksheet.getRowHeight(4)).toBe(0);
            expect(worksheet.getColumnWidth(2)).toBe(88);
            expect(worksheet.getRowHeight(2)).toBe(30.5);
            expect(worksheet.getRowHeight(3)).toBe(40.5);
            worksheet.getColumnManager().setColumnWidth(2, Number.NaN);
            worksheet.getRowManager().setRowHeight(2, -1);
            expect(worksheet.getColumnWidth(2)).toBe(88);
            expect(worksheet.getRowHeight(2)).toBe(30.5);
        } finally {
            skeleton.dispose();
        }
    });
});
