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
import type { IDocumentData, IDocumentRenderConfig } from '../../types/interfaces/i-document-data';
import type { IPaddingData } from '../../types/interfaces/i-style-data';
import type { IWorkbookData } from '../typedef';
import { LocaleService } from '../../services/locale/locale.service';
import { ThemeService } from '../../services/theme/theme.service';
import { ColorKit } from '../../shared/color/color-kit';
import { LocaleType } from '../../types/enum/locale-type';
import { BooleanNumber, HorizontalAlign } from '../../types/enum/text-style';
import { DocumentFlavor } from '../../types/interfaces/i-document-data';
import { createSheetGapTestConfig, SheetSkeleton } from '../sheet-skeleton';
import { RANGE_TYPE } from '../typedef';
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

    it.each([
        ['zero-width columns', false, false],
        ['zero-height rows', true, false],
        ['hidden columns', false, true],
        ['hidden rows', true, true],
    ])('keeps leading merged bounds collapsed for %s', (_name, rows, hidden) => {
        const worksheet = testBed.sheet.getActiveSheet()!;
        const config = worksheet.getConfig();
        config.rowCount = 4;
        config.columnCount = 4;
        config.defaultRowHeight = 24;
        config.defaultColumnWidth = 88;
        for (const index of [0, 1]) {
            if (rows) {
                config.rowData[index] = hidden ? { hd: BooleanNumber.TRUE } : { h: 0 };
            } else {
                config.columnData[index] = hidden ? { hd: BooleanNumber.TRUE } : { w: 0 };
            }
        }
        worksheet.setMergeData([{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }]);
        const skeleton = testBed.univer.__getInjector().createInstance(SheetSkeleton, worksheet, testBed.sheet.getStyles());
        try {
            skeleton.calculate();
            for (const index of [0, 1]) {
                const cell = skeleton.getCellWithCoordByIndex(index, index, false);
                expect(cell.mergeInfo).toMatchObject({ startX: 0, startY: 0, endX: rows ? 176 : 0, endY: rows ? 0 : 48 });
                const withHeaders = skeleton.getCellWithCoordByIndex(index, index);
                expect(withHeaders.mergeInfo.endX - withHeaders.mergeInfo.startX).toBe(rows ? 176 : 0);
                expect(withHeaders.mergeInfo.endY - withHeaders.mergeInfo.startY).toBe(rows ? 0 : 48);
            }
            const nextCell = skeleton.getNoMergeCellWithCoordByIndex(2, 2, false);
            expect(nextCell.endX - nextCell.startX).toBe(88);
            expect(nextCell.endY - nextCell.startY).toBe(24);
        } finally {
            skeleton.dispose();
        }
    });

    it.each([0, 24])('preserves merged bounds with gaps and a remaining row height of %s', (remainingHeight) => {
        const worksheet = testBed.sheet.getActiveSheet()!;
        const config = worksheet.getConfig();
        config.rowCount = 4;
        config.columnCount = 4;
        config.rowData[0] = { hd: BooleanNumber.TRUE };
        config.rowData[1] = { h: remainingHeight };
        config.columnData[0] = { hd: BooleanNumber.TRUE };
        config.columnData[1] = { w: 0 };
        worksheet.setMergeData([{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }]);
        const skeleton = testBed.univer.__getInjector().createInstance(SheetSkeleton, worksheet, testBed.sheet.getStyles());
        try {
            skeleton.setGapConfig({
                rowGaps: { 0: { size: 3 }, 1: { size: 5 } },
                colGaps: { 0: { size: 7 }, 1: { size: 11 } },
            });
            for (const index of [0, 1]) {
                expect(skeleton.getCellWithCoordByIndex(index, index, false).mergeInfo).toMatchObject({
                    startX: 7,
                    endX: 18,
                    startY: 3,
                    endY: 8 + remainingHeight,
                });
            }
        } finally {
            skeleton.dispose();
        }
    });

    it('limits merged bounds to the available layout when the range extends past the sheet', () => {
        const worksheet = testBed.sheet.getActiveSheet()!;
        const config = worksheet.getConfig();
        config.rowCount = 4;
        config.columnCount = 4;
        worksheet.setMergeData([{ startRow: 0, endRow: 5, startColumn: 0, endColumn: 5 }]);
        const skeleton = testBed.univer.__getInjector().createInstance(SheetSkeleton, worksheet, testBed.sheet.getStyles());
        try {
            skeleton.calculate();
            for (const index of [0, 1]) {
                expect(skeleton.getCellWithCoordByIndex(index, index, false).mergeInfo).toMatchObject({
                    startX: 0,
                    startY: 0,
                    endX: skeleton.columnTotalWidth,
                    endY: skeleton.rowTotalHeight,
                });
            }
        } finally {
            skeleton.dispose();
        }
    });

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

const workbookDataFactory = (): IWorkbookData => ({
    id: 'styled-workbook',
    appVersion: '3.0.0-alpha',
    locale: LocaleType.EN_US,
    name: 'Styled workbook',
    sheetOrder: ['sheet-1'],
    styles: {},
    sheets: {
        'sheet-1': {
            id: 'sheet-1',
            name: 'Styled sheet',
            rowCount: 8,
            columnCount: 6,
            defaultColumnWidth: 72,
            defaultRowHeight: 24,
            mergeData: [{ startRow: 1, endRow: 2, startColumn: 1, endColumn: 2, rangeType: RANGE_TYPE.NORMAL }],
            cellData: {
                0: {
                    3: { v: 'Stop overflow' },
                },
                1: {
                    1: { v: 'Merged main' },
                },
            },
            rowData: {
                0: { h: 28 },
                4: { hd: BooleanNumber.TRUE },
            },
            columnData: {
                1: { w: 120 },
                4: { hd: BooleanNumber.TRUE },
            },
            rowHeader: { width: 46 },
            columnHeader: { height: 28 },
        },
    },
});

class TestableSheetSkeleton extends SheetSkeleton {
    getOverflowBoundPublic(row: number, startColumn: number, endColumn: number, contentWidth: number, horizontalAlign = HorizontalAlign.LEFT) {
        return this._getOverflowBound(row, startColumn, endColumn, contentWidth, horizontalAlign);
    }

    hasUnMergedCellInRowPublic(rowIndex: number, startColumn: number, endColumn: number) {
        return this._hasUnMergedCellInRow(rowIndex, startColumn, endColumn);
    }

    updateConfigAndGetDocumentModelPublic(
        documentData: IDocumentData,
        horizontalAlign: HorizontalAlign,
        paddingData: IPaddingData,
        renderConfig?: IDocumentRenderConfig
    ) {
        return this._updateConfigAndGetDocumentModel(documentData, horizontalAlign, paddingData, renderConfig);
    }
}

describe('SheetSkeleton integration', () => {
    const disposables: Array<() => void> = [];

    afterEach(() => {
        while (disposables.length) {
            disposables.pop()?.();
        }
    });

    it('should calculate merged layout coordinates and offsets from a worksheet snapshot', () => {
        const testBed = createCoreTestBed(workbookDataFactory());
        const injector = testBed.univer.__getInjector();
        const worksheet = testBed.sheet.getActiveSheet()!;
        const skeleton = injector.createInstance(SheetSkeleton, worksheet, testBed.sheet.getStyles());
        skeleton.calculate();

        disposables.push(() => {
            skeleton.dispose();
            testBed.univer.dispose();
        });

        expect(skeleton.getLocation()).toEqual(['styled-workbook', 'sheet-1']);
        expect(skeleton.rowHeightAccumulation).toEqual([28, 52, 76, 100, 100, 124, 148, 172]);
        expect(skeleton.columnWidthAccumulation).toEqual([72, 192, 264, 336, 336, 408]);
        expect(skeleton.rowTotalHeight).toBe(172);
        expect(skeleton.columnTotalWidth).toBe(408);
        expect(skeleton.rowHeaderWidth).toBe(46);
        expect(skeleton.columnHeaderHeight).toBe(28);
        expect(skeleton.getRowCount()).toBe(8);
        expect(skeleton.getColumnCount()).toBe(6);

        expect(skeleton.expandRangeByMerge({ startRow: 2, endRow: 2, startColumn: 2, endColumn: 2, rangeType: RANGE_TYPE.NORMAL })).toEqual({
            startRow: 1,
            endRow: 2,
            startColumn: 1,
            endColumn: 2,
        });
        expect(skeleton.expandRangeByMerge({ startRow: 2, endRow: 2, startColumn: 2, endColumn: 2, rangeType: RANGE_TYPE.NORMAL }, true)).toEqual({
            startRow: 1,
            endRow: 1,
            startColumn: 1,
            endColumn: 1,
        });

        expect(skeleton.getNoMergeCellWithCoordByIndex(1, 1, false)).toEqual({
            startY: 28,
            endY: 52,
            startX: 72,
            endX: 192,
        });
        expect(skeleton.getCellWithCoordByIndex(1, 1)).toEqual({
            actualRow: 1,
            actualColumn: 1,
            startY: 56,
            endY: 80,
            startX: 118,
            endX: 238,
            isMerged: false,
            isMergedMainCell: true,
            mergeInfo: {
                startRow: 1,
                endRow: 2,
                startColumn: 1,
                endColumn: 2,
                startY: 56,
                endY: 104,
                startX: 118,
                endX: 310,
            },
        });

        expect(skeleton.getOffsetByColumn(1)).toBe(238);
        expect(skeleton.getOffsetByColumn(-1)).toBe(46);
        expect(skeleton.getOffsetByColumn(99)).toBe(454);
        expect(skeleton.getOffsetByRow(1)).toBe(80);
        expect(skeleton.getOffsetByRow(-1)).toBe(28);
        expect(skeleton.getOffsetByRow(99)).toBe(200);
        expect(skeleton.getOffsetRelativeToRowCol(100, 50)).toEqual({
            row: 1,
            column: 1,
            rowOffset: 22,
            columnOffset: 28,
        });
    });

    it('should resolve viewport offsets back to visible cells across hidden rows and columns', () => {
        const testBed = createCoreTestBed(workbookDataFactory());
        const injector = testBed.univer.__getInjector();
        const worksheet = testBed.sheet.getActiveSheet()!;
        const skeleton = injector.createInstance(SheetSkeleton, worksheet, testBed.sheet.getStyles());
        skeleton.calculate();

        disposables.push(() => {
            skeleton.dispose();
            testBed.univer.dispose();
        });

        expect(skeleton.getCellIndexByOffset(150, 60, 1, 1, { x: 0, y: 0 })).toEqual({ row: 1, column: 1 });
        expect(skeleton.getCellByOffset(150, 60, 1, 1, { x: 0, y: 0 })).toMatchObject({
            actualRow: 1,
            actualColumn: 1,
            isMergedMainCell: true,
            startRow: 1,
            endRow: 2,
            startColumn: 1,
            endColumn: 2,
        });
        expect(skeleton.getCellWithCoordByOffset(150, 60, 1, 1, { x: 0, y: 0 })).toMatchObject({
            actualRow: 1,
            actualColumn: 1,
            mergeInfo: {
                startRow: 1,
                endRow: 2,
                startColumn: 1,
                endColumn: 2,
            },
        });

        expect(skeleton.getCellIndexByOffset(382, 128, 1, 1, { x: 0, y: 0 }, { firstMatch: true })).toEqual({ row: 5, column: 5 });
        expect(skeleton.getCellIndexByOffset(252, 96, 2, 2, { x: 24, y: 12 })).toEqual({ row: 1, column: 1 });
        expect(skeleton.getRowIndexByOffsetY(128, 1, { x: 0, y: 0 }, { firstMatch: true })).toBe(5);
        expect(skeleton.getColumnIndexByOffsetX(382, 1, { x: 0, y: 0 }, { firstMatch: true })).toBe(5);
    });

    it('resolves model positions independently of the viewport while preserving default viewport lookup', () => {
        const testBed = createCoreTestBed(workbookDataFactory());
        const injector = testBed.univer.__getInjector();
        const worksheet = testBed.sheet.getActiveSheet()!;
        const createSkeleton = () => injector.createInstance(SheetSkeleton, worksheet, testBed.sheet.getStyles());
        injector.add([SheetSkeleton, { useFactory: createSkeleton }]);
        const skeleton = injector.get(SheetSkeleton);
        skeleton.calculate();
        disposables.push(() => {
            skeleton.dispose();
            testBed.univer.dispose();
        });
        const expected = skeleton.getCellIndexAndOffsetByPosition(150, 60, 1, 1, { x: 0, y: 0 });
        skeleton.setScroll(24, 12);
        skeleton.setScale(2);
        expect(skeleton.getCellIndexAndOffsetByPosition(150, 60, 1, 1, { x: 0, y: 0 })).toEqual(expected);
        const viewportCell = skeleton.getCellWithCoordByOffset(252, 96, 2, 2, { x: 24, y: 12 });
        expect(skeleton.getCellIndexAndOffsetByPosition(252, 96)).toMatchObject({
            row: viewportCell.actualRow,
            column: viewportCell.actualColumn,
        });
    });

    it('should compute overflow bounds and document render config through the real skeleton instance', () => {
        const testBed = createCoreTestBed(workbookDataFactory());
        const injector = testBed.univer.__getInjector();
        const worksheet = testBed.sheet.getActiveSheet()!;
        const skeleton = injector.createInstance(TestableSheetSkeleton, worksheet, testBed.sheet.getStyles());
        skeleton.calculate();

        disposables.push(() => {
            skeleton.dispose();
            testBed.univer.dispose();
        });

        expect(skeleton.getOverflowBoundPublic(0, 0, 3, 100)).toBe(1);
        expect(skeleton.getOverflowBoundPublic(0, 0, 3, 500)).toBe(2);
        expect(skeleton.getOverflowBoundPublic(0, 2, 0, 100)).toBe(1);
        expect(skeleton.getOverflowBoundPublic(0, 5, 0, 500)).toBe(4);
        expect(skeleton.getOverflowBoundPublic(0, 2, 0, 170, HorizontalAlign.CENTER)).toBe(0);
        expect(skeleton.getOverflowBoundPublic(1, 1, 0, 100)).toBe(1);
        expect(skeleton.hasUnMergedCellInRowPublic(1, 1, 2)).toBe(false);
        expect(skeleton.hasUnMergedCellInRowPublic(1, 0, 2)).toBe(true);

        const docData: IDocumentData = {
            id: 'doc-in-skeleton',
            body: {
                dataStream: 'Hello\r\n',
                paragraphs: [{ startIndex: 5, paragraphId: 'para_fixture_17' }],
            },
            documentStyle: {
                marginTop: 9,
                marginBottom: 9,
                marginLeft: 9,
                marginRight: 9,
                renderConfig: {
                    horizontalAlign: HorizontalAlign.LEFT,
                },
            },
        };
        const updatedModel = skeleton.updateConfigAndGetDocumentModelPublic(
            docData,
            HorizontalAlign.CENTER,
            { t: 1, r: 4, b: 3, l: 2 },
            { horizontalAlign: HorizontalAlign.CENTER }
        );

        expect(skeleton.updateConfigAndGetDocumentModelPublic({ id: 'no-body' } as IDocumentData, HorizontalAlign.CENTER, { t: 0, r: 0, b: 0, l: 0 }, { horizontalAlign: HorizontalAlign.CENTER })).toBeUndefined();
        expect(skeleton.updateConfigAndGetDocumentModelPublic(docData, HorizontalAlign.CENTER, { t: 0, r: 0, b: 0, l: 0 })).toBeUndefined();
        expect(updatedModel?.getSnapshot()).toMatchObject({
            documentStyle: {
                marginTop: 1,
                marginBottom: 3,
                marginLeft: 2,
                marginRight: 4,
                pageSize: {
                    width: Number.POSITIVE_INFINITY,
                    height: Number.POSITIVE_INFINITY,
                },
                documentFlavor: DocumentFlavor.UNSPECIFIED,
                paragraphLineGapDefault: 0,
                renderConfig: {
                    horizontalAlign: HorizontalAlign.CENTER,
                },
            },
            body: {
                paragraphs: [{
                    startIndex: 5,
                    paragraphId: 'para_fixture_17',
                    paragraphStyle: {
                        horizontalAlign: HorizontalAlign.CENTER,
                    },
                }],
            },
        });
    });

    it('should not throw when getCellWithCoordByIndex is called after skeleton is disposed', () => {
        const testBed = createCoreTestBed(workbookDataFactory());
        const injector = testBed.univer.__getInjector();
        const worksheet = testBed.sheet.getActiveSheet()!;
        const skeleton = injector.createInstance(SheetSkeleton, worksheet, testBed.sheet.getStyles());
        skeleton.calculate();

        disposables.push(() => {
            skeleton.dispose();
            testBed.univer.dispose();
        });

        skeleton.dispose();

        expect(() => skeleton.getCellWithCoordByIndex(0, 0)).not.toThrow();
    });

    it('should fill gap default colors from theme and include gap sizes in accumulation arrays', () => {
        const testBed = createCoreTestBed(workbookDataFactory());
        const injector = testBed.univer.__getInjector();
        const worksheet = testBed.sheet.getActiveSheet()!;
        const skeleton = injector.createInstance(SheetSkeleton, worksheet, testBed.sheet.getStyles());
        skeleton.calculate();

        disposables.push(() => {
            skeleton.dispose();
            testBed.univer.dispose();
        });

        skeleton.setGapConfig({
            rowGaps: {
                1: { size: 5 },
            },
            colGaps: {
                2: { size: 7 },
            },
        });

        const themeService = injector.get(ThemeService);
        const baseColor = themeService.getColorFromTheme('primary.500');
        const { r, g, b } = new ColorKit(baseColor).toRgb();

        expect(skeleton.gapConfig.defaultBackgroundColor).toBe(`rgba(${r}, ${g}, ${b}, 0.025)`);
        expect(skeleton.gapConfig.defaultStripeColor).toBe(`rgba(${r}, ${g}, ${b}, 0.08)`);
        expect(skeleton.getRowGapSize(1)).toBe(5);
        expect(skeleton.getColGapSize(2)).toBe(7);

        // Gap sizes are included in cumulative arrays.
        expect(skeleton.rowHeightAccumulation).toEqual([28, 57, 81, 105, 105, 129, 153, 177]);
        expect(skeleton.columnWidthAccumulation).toEqual([72, 192, 271, 343, 343, 415]);

        // Position queries should detect gap hit ranges.
        expect(skeleton.getRowGapAtPosition(30)).toBe(1);
        expect(skeleton.getRowGapAtPosition(10)).toBe(-1);
        expect(skeleton.getColGapAtPosition(195)).toBe(2);
        expect(skeleton.getColGapAtPosition(100)).toBe(-1);
    });

    it('should preserve viewport positions when decomposing offsets that land inside gaps', () => {
        const testBed = createCoreTestBed(workbookDataFactory());
        const injector = testBed.univer.__getInjector();
        const worksheet = testBed.sheet.getActiveSheet()!;
        const skeleton = injector.createInstance(SheetSkeleton, worksheet, testBed.sheet.getStyles());
        skeleton.calculate();

        disposables.push(() => {
            skeleton.dispose();
            testBed.univer.dispose();
        });

        skeleton.setGapConfig({
            rowGaps: {
                1: { size: 5 },
            },
            colGaps: {
                2: { size: 7 },
            },
        });

        const viewportScrollX = 195;
        const viewportScrollY = 30;
        const { row, column, rowOffset, columnOffset } = skeleton.getOffsetRelativeToRowCol(viewportScrollX, viewportScrollY);
        const { startX, startY } = skeleton.getCellWithCoordByIndex(row, column, false);

        expect({ row, column, rowOffset, columnOffset }).toEqual({
            row: 1,
            column: 2,
            rowOffset: -3,
            columnOffset: -4,
        });
        expect({
            viewportScrollX: startX + columnOffset,
            viewportScrollY: startY + rowOffset,
        }).toEqual({
            viewportScrollX,
            viewportScrollY,
        });
    });

    it('should keep provided gap default colors and return no-gap helpers when row/col gaps are absent', () => {
        const testBed = createCoreTestBed(workbookDataFactory());
        const injector = testBed.univer.__getInjector();
        const worksheet = testBed.sheet.getActiveSheet()!;
        const skeleton = injector.createInstance(SheetSkeleton, worksheet, testBed.sheet.getStyles());
        skeleton.calculate();

        disposables.push(() => {
            skeleton.dispose();
            testBed.univer.dispose();
        });

        skeleton.setGapConfig({
            defaultBackgroundColor: '#112233',
            defaultStripeColor: '#445566',
        });

        expect(skeleton.gapConfig.defaultBackgroundColor).toBe('#112233');
        expect(skeleton.gapConfig.defaultStripeColor).toBe('#445566');
        expect(skeleton.getGapSizeGetter()).toBeUndefined();
        expect(skeleton.getRowGapAtPosition(20)).toBe(-1);
        expect(skeleton.getColGapAtPosition(20)).toBe(-1);
    });

    it('should expose a reusable mixed gap test fixture', () => {
        const testBed = createCoreTestBed(workbookDataFactory());
        const injector = testBed.univer.__getInjector();
        const worksheet = testBed.sheet.getActiveSheet()!;
        const skeleton = injector.createInstance(SheetSkeleton, worksheet, testBed.sheet.getStyles());
        skeleton.calculate();

        disposables.push(() => {
            skeleton.dispose();
            testBed.univer.dispose();
        });

        skeleton.setGapConfig(createSheetGapTestConfig());

        expect(skeleton.rowHeightAccumulation).toEqual([28, 58, 82, 116, 116, 140, 178, 202]);
        expect(skeleton.columnWidthAccumulation).toEqual([72, 197, 277, 349, 361, 433]);

        expect(skeleton.getRowGapAtPosition(30)).toBe(1);
        expect(skeleton.getRowGapAtPosition(86)).toBe(3);
        expect(skeleton.getRowGapAtPosition(145)).toBe(6);
        expect(skeleton.getColGapAtPosition(74)).toBe(1);
        expect(skeleton.getColGapAtPosition(200)).toBe(2);
        expect(skeleton.getColGapAtPosition(355)).toBe(4);
        expect(skeleton.getNoMergeCellWithCoordByIndex(3, 2, false)).toEqual({
            startY: 92,
            endY: 116,
            startX: 205,
            endX: 277,
        });
    });

    it('should preserve provided one-sided gap color and fill the missing side from theme', () => {
        const testBed = createCoreTestBed(workbookDataFactory());
        const injector = testBed.univer.__getInjector();
        const worksheet = testBed.sheet.getActiveSheet()!;
        const skeleton = injector.createInstance(SheetSkeleton, worksheet, testBed.sheet.getStyles());
        skeleton.calculate();

        disposables.push(() => {
            skeleton.dispose();
            testBed.univer.dispose();
        });

        const themeService = injector.get(ThemeService);
        const baseColor = themeService.getColorFromTheme('primary.500');
        const { r, g, b } = new ColorKit(baseColor).toRgb();

        skeleton.setGapConfig({
            defaultBackgroundColor: '#abcdef',
        });
        expect(skeleton.gapConfig.defaultBackgroundColor).toBe('#abcdef');
        expect(skeleton.gapConfig.defaultStripeColor).toBe(`rgba(${r}, ${g}, ${b}, 0.08)`);

        skeleton.setGapConfig({
            defaultStripeColor: '#fedcba',
        });
        expect(skeleton.gapConfig.defaultStripeColor).toBe('#fedcba');
        expect(skeleton.gapConfig.defaultBackgroundColor).toBe(`rgba(${r}, ${g}, ${b}, 0.025)`);
    });
});
