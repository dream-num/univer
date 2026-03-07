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

import { BooleanNumber, BorderStyleTypes, CellValueType, HorizontalAlign, ObjectMatrix, VerticalAlign, WrapStrategy } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { BORDER_TYPE as BORDER_LTRB } from '../../../basics/const';
import { DocumentSkeleton } from '../../docs/layout/doc-skeleton';
import { SHEET_VIEWPORT_KEY } from '../interfaces';
import {
    convertTransformToOffsetX,
    convertTransformToOffsetY,
    getDocsSkeletonPageSize,
    SpreadsheetSkeleton,
} from '../sheet.render-skeleton';

function createSkeletonMock() {
    const skeleton = Object.create(SpreadsheetSkeleton.prototype) as any;

    skeleton._rowHeightAccumulation = [20, 40, 60];
    skeleton._columnWidthAccumulation = [50, 100, 150];
    skeleton._columnHeaderHeight = 10;
    skeleton._rowHeaderWidth = 5;
    skeleton._marginTop = 0;
    skeleton._marginLeft = 0;

    skeleton._overflowCache = new ObjectMatrix();
    skeleton._cacheRangeMap = new Map();
    skeleton._visibleRangeMap = new Map();
    skeleton._drawingRange = {
        startRow: -1,
        endRow: -1,
        startColumn: -1,
        endColumn: -1,
    };
    skeleton._stylesCache = {
        background: {},
        backgroundPositions: new ObjectMatrix(),
        fontMatrix: new ObjectMatrix(),
        border: new ObjectMatrix(),
    };
    skeleton._handleBgMatrix = new ObjectMatrix();
    skeleton._handleBorderMatrix = new ObjectMatrix();
    skeleton._cellData = new ObjectMatrix();
    skeleton._imageCacheMap = new Map();
    skeleton._renderRawFormula = false;
    skeleton._localeService = {} as any;
    skeleton._styles = {
        getStyleByCell: vi.fn(() => ({})),
    };

    skeleton.intersectMergeRange = vi.fn(() => false);
    skeleton.getColumnCount = vi.fn(() => 10);
    skeleton.getCellWithCoordByIndex = vi.fn((row: number, col: number, withHeader = true) => ({
        startX: col * 50 + (withHeader ? 5 : 0),
        endX: (col + 1) * 50 + (withHeader ? 5 : 0),
        startY: row * 20 + (withHeader ? 10 : 0),
        endY: (row + 1) * 20 + (withHeader ? 10 : 0),
        row,
        column: col,
    }));
    skeleton.makeDirty = vi.fn();

    skeleton.worksheet = {
        getRowVisible: vi.fn(() => true),
        getColVisible: vi.fn(() => true),
        getMergedCellRange: vi.fn(() => []),
        getCellInfoInMergeData: vi.fn(() => ({
            isMerged: false,
            isMergedMainCell: false,
            startRow: 0,
            startColumn: 0,
            endRow: 0,
            endColumn: 0,
        })),
        getCell: vi.fn(() => null),
        getCellRaw: vi.fn(() => null),
        getComposedCellStyleByCellData: vi.fn(() => ({})),
        getCellDocumentModel: vi.fn(() => null),
    };

    return skeleton;
}

describe('sheet render skeleton', () => {
    it('covers range/position helpers and transform conversion', () => {
        const skeleton = createSkeletonMock();

        expect(skeleton.getColWidth(1)).toBe(50);
        expect(skeleton.getRowHeight(2)).toBe(20);
        expect(skeleton.colStartX(0)).toBe(0);
        expect(skeleton.colStartX(2)).toBe(100);
        expect(skeleton.rowStartY(0)).toBe(0);
        expect(skeleton.rowStartY(2)).toBe(40);
        expect(skeleton.getDistanceFromTopLeft(2, 2)).toEqual({ x: 100, y: 40 });

        const fullRange = skeleton.getRangeByViewBound();
        expect(fullRange).toEqual({
            startRow: 0,
            endRow: 2,
            startColumn: 0,
            endColumn: 2,
        });

        const cacheRange = skeleton.getCacheRangeByViewport({
            cacheBound: {
                left: 5,
                top: 10,
                right: 120,
                bottom: 55,
            },
        } as any);
        expect(cacheRange.startRow).toBeGreaterThanOrEqual(0);
        expect(cacheRange.endRow).toBeGreaterThanOrEqual(cacheRange.startRow);
        expect(cacheRange.startColumn).toBeGreaterThanOrEqual(0);
        expect(cacheRange.endColumn).toBeGreaterThanOrEqual(cacheRange.startColumn);

        const printRange = (skeleton as any)._getRangeByViewBounding(
            skeleton.rowHeightAccumulation,
            skeleton.columnWidthAccumulation,
            {
                left: 5,
                top: 10,
                right: 150,
                bottom: 60,
            },
            true
        );
        expect(printRange.endRow).toBeLessThanOrEqual(2);
        expect(printRange.endColumn).toBeLessThanOrEqual(2);

        expect(skeleton.convertTransformToOffsetX(21, 2, { x: 1, y: 0 })).toBe(40);
        expect(skeleton.convertTransformToOffsetY(31, 0.5, { x: 0, y: 11 })).toBe(10);
        expect(convertTransformToOffsetX(10, 3, { x: 2, y: 0 })).toBe(24);
        expect(convertTransformToOffsetY(22, 2, { x: 0, y: 5 })).toBe(34);
    });

    it('covers overflow bounds and hidden rows/columns', () => {
        const skeleton = createSkeletonMock();
        (skeleton as any)._getOverflowBound = vi
            .fn()
            .mockReturnValueOnce(1)
            .mockReturnValueOnce(4)
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(3);

        expect(
            skeleton.getOverflowPosition(
                { width: 200, height: 20 },
                HorizontalAlign.CENTER,
                1,
                2,
                10
            )
        ).toEqual({ startColumn: 1, endColumn: 4 });

        expect(
            skeleton.getOverflowPosition(
                { width: 80, height: 20 },
                HorizontalAlign.RIGHT,
                1,
                2,
                10
            ).startColumn
        ).toBe(0);

        expect(
            skeleton.getOverflowPosition(
                { width: 80, height: 20 },
                HorizontalAlign.LEFT,
                1,
                2,
                10
            ).endColumn
        ).toBe(3);

        skeleton.appendToOverflowCache(2, 3, 1, 6);
        expect(skeleton.overflowCache.getValue(2, 3)).toEqual({
            startRow: 2,
            endRow: 2,
            startColumn: 1,
            endColumn: 6,
        });

        skeleton.worksheet.getRowVisible = vi.fn((row: number) => row !== 1);
        skeleton.worksheet.getColVisible = vi.fn((col: number) => col !== 2);
        expect(skeleton.getHiddenRowsInRange({ startRow: 0, endRow: 2 })).toEqual([1]);
        expect(skeleton.getHiddenColumnsInRange({ startColumn: 0, endColumn: 3 })).toEqual([2]);
    });

    it('covers style cache branches for bg/border/font and reset', () => {
        const skeleton = createSkeletonMock();
        const style = {
            bg: { rgb: '#ff0000' },
            bd: {
                [BORDER_LTRB.TOP]: { s: BorderStyleTypes.THIN, cl: { rgb: '#111111' } },
                [BORDER_LTRB.BOTTOM]: { s: BorderStyleTypes.MEDIUM, cl: { rgb: '#222222' } },
                [BORDER_LTRB.LEFT]: { s: BorderStyleTypes.DASHED, cl: { rgb: '#333333' } },
                [BORDER_LTRB.RIGHT]: { s: BorderStyleTypes.DOTTED, cl: { rgb: '#444444' } },
            },
            ht: HorizontalAlign.LEFT,
            vt: VerticalAlign.TOP,
            tb: WrapStrategy.OVERFLOW,
        } as any;

        skeleton._setBgStylesCache(0, 0, style, { cacheItem: { bg: true, border: true } });
        expect(skeleton.stylesCache.background['#ff0000']).toBeTruthy();
        expect(skeleton.stylesCache.backgroundPositions.getValue(0, 0)).toEqual(
            expect.objectContaining({ row: 0, column: 0 })
        );

        (skeleton as any)._setBorderProps(1, 1, BORDER_LTRB.TOP, style, skeleton.stylesCache);
        (skeleton as any)._setBorderProps(1, 1, BORDER_LTRB.LEFT, style, skeleton.stylesCache);
        expect(skeleton.stylesCache.border.getValue(1, 1)?.[BORDER_LTRB.TOP]).toBeTruthy();
        expect(skeleton.stylesCache.border.getValue(1, 1)?.[BORDER_LTRB.LEFT]).toBeTruthy();

        skeleton.stylesCache.border.setValue(0, 1, {
            [BORDER_LTRB.BOTTOM]: { type: BORDER_LTRB.BOTTOM, style: BorderStyleTypes.THIN, color: '#000' },
        } as any);
        const whiteTop = {
            bd: {
                [BORDER_LTRB.TOP]: { s: BorderStyleTypes.THIN, cl: { rgb: '#ffffff' } },
            },
        } as any;
        (skeleton as any)._setBorderProps(1, 1, BORDER_LTRB.TOP, whiteTop, skeleton.stylesCache);
        expect(skeleton.stylesCache.border.getValue(1, 1)?.[BORDER_LTRB.TOP]?.color).not.toBe('#ffffff');

        skeleton.worksheet.getCell = vi.fn(() => ({}));
        skeleton.worksheet.getComposedCellStyleByCellData = vi.fn(() => ({
            bd: {
                [BORDER_LTRB.TOP]: { s: BorderStyleTypes.THIN, cl: { rgb: '#55aa55' } },
            },
        }));
        (skeleton as any)._setMergeBorderProps(
            BORDER_LTRB.TOP,
            skeleton.stylesCache,
            { startRow: 0, endRow: 0, startColumn: 0, endColumn: 2 }
        );
        expect(skeleton.stylesCache.border.getValue(0, 2)?.[BORDER_LTRB.TOP]).toBeTruthy();

        const appendSpy = vi.spyOn(skeleton, 'appendToOverflowCache');
        (skeleton as any)._getOverflowBound = vi
            .fn()
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(3);
        skeleton._cellData.setValue(3, 3, { v: 'hello', t: CellValueType.STRING });
        (skeleton as any)._calculateOverflowCell(3, 3, {
            horizontalAlign: HorizontalAlign.LEFT,
            wrapStrategy: WrapStrategy.OVERFLOW,
            vertexAngle: 0,
            centerAngle: 0,
            cellData: { v: 'hello', t: CellValueType.STRING },
            fontString: '10px Arial',
        });
        expect(appendSpy).toHaveBeenCalled();

        skeleton.resetRangeCache([{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }]);
        expect(skeleton.makeDirty).toHaveBeenCalledWith(true);

        skeleton._resetCache();
        expect(skeleton.stylesCache.fontMatrix.getValue(0, 0)).toBeUndefined();
        expect(skeleton.overflowCache.getValue(3, 3)).toBeUndefined();
    });

    it('covers blank/formula document model and docs size helpers', () => {
        const skeleton = createSkeletonMock();

        const blankModel = skeleton.getBlankCellDocumentModel(null);
        expect(blankModel.documentModel).toBeTruthy();
        expect(blankModel.fontString).toContain('pt');

        const formulaModel = skeleton.getCellDocumentModelWithFormula({
            f: '=SUM(A1:B1)',
            t: CellValueType.NUMBER,
        } as any);
        expect(formulaModel?.documentModel).toBeTruthy();
        expect(formulaModel?.horizontalAlign).toBe(HorizontalAlign.UNSPECIFIED);

        expect(getDocsSkeletonPageSize({ getSkeletonData: () => null } as any)).toBeNull();
        expect(getDocsSkeletonPageSize({ getSkeletonData: () => ({ pages: [] }) } as any)).toBeNull();

        const mockSkeleton = {
            getSkeletonData: () => ({
                pages: [
                    {
                        width: 120,
                        height: 60,
                        sections: [
                            {
                                columns: [
                                    {
                                        width: 80,
                                        spaceWidth: 5,
                                        lines: [{ lineHeight: 20 }],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            }),
        } as any;

        expect(getDocsSkeletonPageSize(mockSkeleton, 0)).toEqual({ width: 120, height: 60 });
        expect(getDocsSkeletonPageSize(mockSkeleton, 90)).toEqual({ width: 60, height: 120 });
        const rotated = getDocsSkeletonPageSize(mockSkeleton, 30);
        expect(rotated?.width).toBeGreaterThan(0);
        expect(rotated?.height).toBeGreaterThan(0);
    });

    it('covers auto-size calculations and measurement wrappers', () => {
        const skeleton = createSkeletonMock();
        skeleton._worksheetData = {
            columnCount: 3,
            defaultRowHeight: 18,
            defaultColumnWidth: 50,
        };

        skeleton.calculateAutoHeightForCell = vi
            .fn()
            .mockReturnValueOnce(undefined)
            .mockReturnValueOnce(40)
            .mockReturnValueOnce(20);
        const autoHeight = (skeleton as any)._calculateRowAutoHeight(2);
        expect(autoHeight).toBe(40);

        skeleton.worksheet.getColVisible = vi.fn((c: number) => c !== 2);
        (skeleton as any)._calculateColWidth = vi.fn((c: number) => c * 10 + 60);
        expect(skeleton.calculateAutoWidthInRange(null as any)).toEqual([]);
        expect(skeleton.calculateAutoWidthInRange([
            { startRow: 0, endRow: 0, startColumn: 1, endColumn: 3 },
            { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
        ])).toEqual([
            { col: 1, width: 70 },
            { col: 3, width: 90 },
        ]);

        skeleton.getCellIndexByOffset = vi.fn(() => ({ row: 9, column: 8 }));
        skeleton.getColumnIndexByOffsetX = vi.fn(() => 7);
        skeleton.getRowIndexByOffsetY = vi.fn(() => 6);
        skeleton.getCellWithCoordByIndex = vi.fn(() => ({ row: 1, column: 2 }));

        expect(skeleton.getCellPositionByOffset(1, 2, 1, 1, { x: 0, y: 0 } as any)).toEqual({ row: 9, column: 8 });
        expect(skeleton.getColumnPositionByOffsetX(1, 1, { x: 0, y: 0 } as any)).toBe(7);
        expect(skeleton.getRowPositionByOffsetY(1, 1, { x: 0, y: 0 } as any)).toBe(6);
        expect(skeleton.getCellByIndex(1, 2)).toEqual({ row: 1, column: 2 });
        expect(skeleton.getCellByIndexWithNoHeader(1, 2)).toEqual({ row: 1, column: 2 });
    });

    it('covers _calculateColWidth and measured width branch details', () => {
        const skeleton = createSkeletonMock();
        skeleton._worksheetData = {
            defaultColumnWidth: 40,
        };
        skeleton._columnWidthAccumulation = [30, 70, 110];
        skeleton.visibleRangeByViewportKey = vi.fn((key: string) => {
            if (key === SHEET_VIEWPORT_KEY.VIEW_MAIN) {
                return { startRow: 1, endRow: 2, startColumn: 0, endColumn: 2 };
            }
            if (key === SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP) {
                return { startRow: 0, endRow: 0, startColumn: 0, endColumn: 2 };
            }
            return null;
        });
        skeleton.worksheet.getRowCount = vi.fn(() => 5);
        skeleton.worksheet.getCellInfoInMergeData = vi.fn(() => ({
            isMerged: false,
            isMergedMainCell: false,
        }));
        skeleton.worksheet.getRowVisible = vi.fn(() => true);
        skeleton.worksheet.getCell = vi.fn((row: number) => (row <= 2 ? ({ v: 'x' } as any) : null));
        skeleton._getMeasuredWidthByCell = vi.fn((_cell: any, row: number) => 20 + row * 10);
        const colWidth = (skeleton as any)._calculateColWidth(1);
        expect(colWidth).toBeGreaterThan(0);

        skeleton.visibleRangeByViewportKey = vi.fn(() => null);
        expect((skeleton as any)._calculateColWidth(1)).toBe(0);

        const interceptorWidth = SpreadsheetSkeleton.prototype._getMeasuredWidthByCell.call(skeleton, {
            fontRenderExtension: { isSkip: true },
            interceptorAutoWidth: () => 77,
        } as any, 0, 0, 30);
        expect(interceptorWidth).toBe(77);

        skeleton.worksheet.getComposedCellStyleByCellData = vi.fn(() => ({}));
        skeleton.worksheet.getCellDocumentModel = vi.fn(() => null);
        expect(SpreadsheetSkeleton.prototype._getMeasuredWidthByCell.call(skeleton, { v: 'v' } as any, 0, 0, 40)).toBe(0);

        const docModel = {
            updateDocumentDataPageSize: vi.fn(),
            getBody: vi.fn(() => ({
                dataStream: '\r\n',
                tables: [],
                textRuns: [],
                paragraphs: [],
                sectionBreaks: [],
                customBlocks: [],
                customRanges: [],
                customDecorations: [],
            })),
            getSnapshot: vi.fn(() => ({ tableSource: {} })),
            headerModelMap: new Map(),
            footerModelMap: new Map(),
        };
        skeleton.worksheet.getComposedCellStyleByCellData = vi.fn(() => ({ tb: WrapStrategy.WRAP }));
        skeleton.worksheet.getCellDocumentModel = vi.fn(() => ({
            documentModel: docModel,
            textRotation: { a: 0 },
        }));
        const skeletonMock = {
            calculate: vi.fn(),
            getSkeletonData: vi.fn(() => ({
                pages: [{
                    width: 20,
                    height: 10,
                    marginTop: 1,
                    marginBottom: 1,
                    marginLeft: 1,
                    marginRight: 1,
                }],
            })),
        };
        const createSpy = vi.spyOn(DocumentSkeleton, 'create').mockReturnValue(skeletonMock as any);
        const measured = SpreadsheetSkeleton.prototype._getMeasuredWidthByCell.call(skeleton, { v: 'doc' } as any, 1, 1, 60);
        expect(measured).toBeGreaterThan(0);
        expect(docModel.updateDocumentDataPageSize).toHaveBeenCalled();
        expect(skeletonMock.calculate).toHaveBeenCalled();
        createSpy.mockRestore();
    });

    it('covers style cache early returns and font cache update paths', () => {
        const skeleton = createSkeletonMock();
        const style = { ht: HorizontalAlign.LEFT, vt: VerticalAlign.TOP, tb: WrapStrategy.OVERFLOW } as any;
        skeleton._stylesCache.fontMatrix.setValue(0, 0, createSkeletonMock()._stylesCache.fontMatrix.getValue(0, 0) as any);

        skeleton._setBorderStylesCache(0, 0, style, { cacheItem: { bg: true, border: false } });
        expect(skeleton._handleBorderMatrix.getValue(0, 0)).toBeUndefined();

        skeleton._setBgStylesCache(0, 0, style, { cacheItem: { bg: false, border: true } });
        expect(skeleton._handleBgMatrix.getValue(0, 0)).toBeUndefined();

        skeleton.worksheet.getCellInfoInMergeData = vi.fn(() => ({
            isMerged: true,
            isMergedMainCell: false,
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        }));
        skeleton.worksheet.getRowVisible = vi.fn(() => false);
        skeleton.worksheet.getColVisible = vi.fn(() => false);
        (skeleton as any)._setStylesCacheForOneCell(0, 0, { cacheItem: { bg: true, border: true } });
        expect(skeleton.stylesCache.fontMatrix.getValue(0, 0)).toBeUndefined();

        (skeleton as any)._setStylesCacheForOneCell(-1, 0, { cacheItem: { bg: true, border: true } });
        expect(skeleton.stylesCache.fontMatrix.getValue(-1, 0)).toBeUndefined();

        skeleton._setFontStylesCache(1, 1, null as any, style);
        expect(skeleton.stylesCache.fontMatrix.getValue(1, 1)).toBeUndefined();

        skeleton._stylesCache.fontMatrix.setValue(2, 2, {
            cellData: { v: 'old' },
        } as any);
        skeleton._setFontStylesCache(2, 2, { v: 'new' } as any, style);
        expect(skeleton.stylesCache.fontMatrix.getValue(2, 2)?.cellData?.v).toBe('new');

        skeleton.worksheet.getCell = vi.fn(() => null);
        (skeleton as any)._setMergeBorderProps(BORDER_LTRB.TOP, skeleton.stylesCache, {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 1,
        });
        expect(skeleton.stylesCache.border.getValue(0, 0)).toBeUndefined();
    });

    it('covers visible-range map updates and setStylesCache branches', () => {
        const skeleton = createSkeletonMock();
        skeleton._worksheetData = {
            showGridlines: BooleanNumber.TRUE,
            gridlinesColor: '#cccccc',
            defaultColumnWidth: 40,
            rowData: [{}, {}],
        };
        skeleton.getRangeByViewport = vi.fn(() => ({ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }));
        skeleton.getCacheRangeByViewport = vi.fn(() => ({ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }));
        expect(skeleton.updateVisibleRange({
            viewportKey: SHEET_VIEWPORT_KEY.VIEW_MAIN,
        } as any)).toBe(true);
        expect(skeleton.getVisibleRangeByViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN)).toEqual({
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
        });
        expect(skeleton.visibleRangeByViewportKey(SHEET_VIEWPORT_KEY.VIEW_MAIN)).toEqual({
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
        });
        expect(skeleton.rowColumnSegment).toEqual({
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
        });
        expect(skeleton.getVisibleRanges().size).toBe(1);
        skeleton._showGridlines = BooleanNumber.TRUE;
        skeleton._gridlinesColor = '#cccccc';
        expect(skeleton.showGridlines).toBe(BooleanNumber.TRUE);
        expect(skeleton.gridlinesColor).toBe('#cccccc');

        skeleton.worksheet.getRowVisible = vi.fn((r: number) => r !== 1);
        const setCellSpy = vi.spyOn(skeleton as any, '_setStylesCacheForOneCell').mockImplementation(() => undefined);
        skeleton.getCurrentRowColumnSegmentMergeData = vi.fn(() => [{
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 1,
        }]);
        const ret = skeleton.setStylesCache({
            viewportKey: SHEET_VIEWPORT_KEY.VIEW_MAIN,
        } as any);
        expect(ret).toBe(skeleton);
        expect(setCellSpy).toHaveBeenCalled();

        skeleton.getCacheRangeByViewport = vi.fn(() => ({ startRow: 0, endRow: -1, startColumn: 0, endColumn: -1 }));
        expect(skeleton.setStylesCache({ viewportKey: SHEET_VIEWPORT_KEY.VIEW_MAIN } as any)).toBeUndefined();
    });

    it('covers auto-height range/cell branches', () => {
        const skeleton = createSkeletonMock();
        skeleton._worksheetData = {
            rowData: [{}, { ia: BooleanNumber.FALSE }, {}],
            columnData: [{ w: 30 }, { w: 30 }],
            defaultRowHeight: 18,
            defaultColumnWidth: 30,
        };
        skeleton.worksheet.getRowCount = vi.fn(() => 3);
        skeleton.worksheet.getRowHeight = vi.fn(() => 26);
        (skeleton as any)._hasUnMergedCellInRow = vi.fn(() => true);

        const prevHeights = new ObjectMatrix<number>();
        prevHeights.setValue(0, 0, 12);
        prevHeights.setValue(0, 1, 10);
        skeleton.calculateAutoHeightForCell = vi
            .fn()
            .mockReturnValueOnce(20)
            .mockReturnValueOnce(22)
            .mockReturnValueOnce(12)
            .mockReturnValueOnce(11)
            .mockReturnValueOnce(30)
            .mockReturnValueOnce(35);

        const inRange = skeleton.calculateAutoHeightInRange([{
            startRow: 0,
            endRow: 2,
            startColumn: 0,
            endColumn: 1,
        }], prevHeights);
        expect(inRange.length).toBeGreaterThan(0);
        expect(inRange[0].autoHeight).toBeGreaterThan(0);

        const withoutPrev = skeleton.calculateAutoHeightInRange([{
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 1,
        }]);
        expect(withoutPrev.length).toBeGreaterThan(0);
        expect(skeleton.calculateAutoHeightInRange(null as any)).toEqual([]);

        skeleton._skipAutoHeightForMergedCells = true;
        skeleton.worksheet.getCellInfoInMergeData = vi.fn(() => ({
            isMerged: true,
            isMergedMainCell: false,
            startColumn: 0,
            endColumn: 0,
        }));
        expect(SpreadsheetSkeleton.prototype.calculateAutoHeightForCell.call(skeleton, 0, 0)).toBeUndefined();

        skeleton._skipAutoHeightForMergedCells = false;
        skeleton.worksheet.getCellInfoInMergeData = vi.fn(() => ({
            isMerged: false,
            isMergedMainCell: false,
            startColumn: 0,
            endColumn: 0,
        }));
        skeleton.worksheet.getCell = vi.fn(() => ({
            interceptorAutoHeight: () => 33,
        }));
        skeleton.worksheet.getComposedCellStyleByCellData = vi.fn(() => ({}));
        expect(SpreadsheetSkeleton.prototype.calculateAutoHeightForCell.call(skeleton, 0, 0)).toBe(33);

        skeleton.worksheet.getCell = vi.fn(() => ({ p: { body: {} }, v: 'rt' }));
        skeleton.worksheet.getComposedCellStyleByCellData = vi.fn(() => ({ tr: { a: 30 }, tb: WrapStrategy.WRAP }));
        skeleton.worksheet.getCellDocumentModel = vi.fn(() => null);
        expect(SpreadsheetSkeleton.prototype.calculateAutoHeightForCell.call(skeleton, 0, 0)).toBeUndefined();

        const docModel = {
            updateDocumentDataPageSize: vi.fn(),
            getBody: vi.fn(() => ({
                dataStream: '\r\n',
                tables: [],
                textRuns: [],
                paragraphs: [],
                sectionBreaks: [],
                customBlocks: [],
                customRanges: [],
                customDecorations: [],
            })),
            getSnapshot: vi.fn(() => ({ tableSource: {} })),
            headerModelMap: new Map(),
            footerModelMap: new Map(),
        };
        skeleton.worksheet.getCellDocumentModel = vi.fn(() => ({
            documentModel: docModel,
            textRotation: { a: 0 },
            wrapStrategy: WrapStrategy.WRAP,
        }));
        const docSkeleton = {
            calculate: vi.fn(),
            getSkeletonData: vi.fn(() => ({
                pages: [{
                    width: 10,
                    height: 8,
                    marginTop: 1,
                    marginBottom: 1,
                    marginLeft: 1,
                    marginRight: 1,
                }],
            })),
        };
        const createSpy = vi.spyOn(DocumentSkeleton, 'create').mockReturnValue(docSkeleton as any);
        const richHeight = SpreadsheetSkeleton.prototype.calculateAutoHeightForCell.call(skeleton, 0, 0);
        expect(richHeight).toBeGreaterThan(0);
        expect(docSkeleton.calculate).toHaveBeenCalled();

        skeleton.worksheet.getCell = vi.fn(() => ({ v: null }));
        skeleton.worksheet.getComposedCellStyleByCellData = vi.fn(() => ({ tb: WrapStrategy.OVERFLOW }));
        expect(SpreadsheetSkeleton.prototype.calculateAutoHeightForCell.call(skeleton, 0, 0)).toBeUndefined();

        skeleton.worksheet.getCell = vi.fn(() => ({ v: 'wrap' }));
        skeleton.worksheet.getComposedCellStyleByCellData = vi.fn(() => ({
            tb: WrapStrategy.WRAP,
            pd: { l: 1, r: 1, t: 1, b: 1 },
        }));
        const wrapHeight = SpreadsheetSkeleton.prototype.calculateAutoHeightForCell.call(skeleton, 0, 0);
        expect(wrapHeight).toBeGreaterThan(0);

        skeleton.worksheet.getComposedCellStyleByCellData = vi.fn(() => ({
            tb: WrapStrategy.OVERFLOW,
            pd: { l: 1, r: 1, t: 1, b: 1 },
        }));
        const plainHeight = SpreadsheetSkeleton.prototype.calculateAutoHeightForCell.call(skeleton, 0, 0);
        expect(plainHeight).toBeGreaterThan(0);
        createSpy.mockRestore();
    });
});
