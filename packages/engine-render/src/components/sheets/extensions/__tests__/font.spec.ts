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

import { CellValueType, HorizontalAlign, ObjectMatrix, VerticalAlign, WrapStrategy } from '@univerjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VERTICAL_ROTATE_ANGLE } from '../../../../basics/text-rotation';
import { Text } from '../../../../shape/text';
import { Font } from '../font';

function createCtx() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        clip: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        rectByPrecision: vi.fn(),
        drawImage: vi.fn(),
        fillRectByPrecision: vi.fn(),
        getScale: vi.fn(() => ({ scaleX: 1, scaleY: 1 })),
    } as any;
}

function createCellInfo(overrides?: Partial<any>) {
    return {
        startX: 0,
        startY: 0,
        endX: 40,
        endY: 20,
        isMerged: false,
        isMergedMainCell: false,
        mergeInfo: {
            startX: 0,
            startY: 0,
            endX: 40,
            endY: 20,
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        },
        ...overrides,
    };
}

function createFontCache(overrides?: Partial<any>) {
    return {
        verticalAlign: VerticalAlign.TOP,
        horizontalAlign: HorizontalAlign.LEFT,
        wrapStrategy: WrapStrategy.OVERFLOW,
        imageCacheMap: {
            getImage: vi.fn(() => null),
        },
        cellData: {
            v: 'A',
            t: CellValueType.STRING,
            fontRenderExtension: {},
        },
        fontString: '12px Arial',
        style: {
            pd: { l: 1, r: 1, t: 1, b: 1 },
            cl: { rgb: '#111111' },
        },
        ...overrides,
    };
}

function createSpreadsheetSkeleton() {
    const overflowCache = new ObjectMatrix<any>();
    const worksheet = {
        getRowVisible: vi.fn(() => true),
        getColVisible: vi.fn(() => true),
        getCell: vi.fn(() => ({ v: 'A', t: CellValueType.STRING })),
        getSpanModel: vi.fn(() => ({
            getMergeDataIndex: vi.fn(() => -1),
        })),
        getMergedCellRange: vi.fn(() => []),
    } as any;

    return {
        worksheet,
        overflowCache,
        rowHeightAccumulation: [20, 40, 60],
        columnWidthAccumulation: [40, 80, 120],
        getCellWithCoordByIndex: vi.fn((row: number, col: number) => createCellInfo({
            startX: col * 40,
            endX: col * 40 + 40,
            startY: row * 20,
            endY: row * 20 + 20,
        })),
        getRowCount: vi.fn(() => 3),
        getColumnCount: vi.fn(() => 3),
    } as any;
}

describe('font extension', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('covers fallback image draw branches', () => {
        const font = new Font() as any;
        const ctx = createCtx();
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        font._imageFallback = { complete: false, naturalWidth: 0 };
        font._drawFallbackImage(ctx, 0, 0, 10, 10);
        expect(ctx.drawImage).not.toHaveBeenCalled();

        font._imageFallback = { complete: true, naturalWidth: 12 };
        ctx.drawImage.mockImplementationOnce(() => {
            throw new Error('draw fail');
        });
        font._drawFallbackImage(ctx, 1, 2, 3, 4);
        font._drawFallbackImage(ctx, 2, 3, 4, 5);
        expect(ctx.drawImage).toHaveBeenCalledTimes(2);
        expect(errorSpy).toHaveBeenCalled();
    });

    it('covers clip bounds for overflow/offset align branches', () => {
        const font = new Font() as any;
        const ctx = createCtx();
        const clipOverflowSpy = vi.spyOn(font, '_clipRectangleForOverflow').mockImplementation(() => undefined);
        const skeleton = createSpreadsheetSkeleton();

        const renderFontContext = {
            ctx,
            scale: 1,
            overflowRectangle: { startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 },
            fontCache: createFontCache({
                horizontalAlign: HorizontalAlign.LEFT,
                cellData: { v: 'A', t: CellValueType.STRING, fontRenderExtension: {} },
            }),
            startX: 0,
            startY: 0,
            endX: 40,
            endY: 20,
            spreadsheetSkeleton: skeleton,
        } as any;

        font._clipByRenderBounds(renderFontContext, 0, 1);
        expect(ctx.rectByPrecision).toHaveBeenCalled();

        renderFontContext.overflowRectangle = { startRow: 0, endRow: 1, startColumn: 0, endColumn: 2 };
        renderFontContext.fontCache = createFontCache({
            horizontalAlign: HorizontalAlign.UNSPECIFIED,
            centerAngle: VERTICAL_ROTATE_ANGLE,
            vertexAngle: VERTICAL_ROTATE_ANGLE,
            cellData: { v: 'B', t: CellValueType.STRING, fontRenderExtension: {} },
        });
        font._clipByRenderBounds(renderFontContext, 0, 1);
        expect(clipOverflowSpy).toHaveBeenCalledWith(
            ctx,
            0,
            1,
            0,
            2,
            1,
            skeleton.rowHeightAccumulation,
            skeleton.columnWidthAccumulation,
            0
        );

        renderFontContext.fontCache = createFontCache({
            horizontalAlign: HorizontalAlign.UNSPECIFIED,
            centerAngle: 0,
            vertexAngle: 30,
            cellData: { v: 'C', t: CellValueType.STRING, fontRenderExtension: {} },
        });
        font._clipByRenderBounds(renderFontContext, 1, 1);
        expect(clipOverflowSpy).toHaveBeenCalledWith(
            ctx,
            0,
            1,
            0,
            1,
            1,
            skeleton.rowHeightAccumulation,
            skeleton.columnWidthAccumulation,
            0
        );

        renderFontContext.fontCache = createFontCache({
            horizontalAlign: HorizontalAlign.LEFT,
            cellData: { v: 'D', t: CellValueType.STRING, fontRenderExtension: { leftOffset: 2, rightOffset: 1 } },
        });
        font._clipByRenderBounds(renderFontContext, 0, 1);
        expect(renderFontContext.startX).toBe(2);
        expect(renderFontContext.endX).toBe(39);
    });

    it('covers text render alignment and wrap branches', () => {
        const drawWithSpy = vi.spyOn(Text as any, 'drawWith').mockImplementation((..._args: any[]) => undefined);
        const font = new Font() as any;
        const ctx = createCtx();
        const overflow = new ObjectMatrix<any>();

        const renderFontCtx = {
            startX: 0,
            startY: 0,
            endX: 100,
            endY: 20,
            fontCache: createFontCache({
                horizontalAlign: HorizontalAlign.UNSPECIFIED,
                verticalAlign: VerticalAlign.MIDDLE,
                wrapStrategy: WrapStrategy.WRAP,
                vertexAngle: 0,
                cellData: { v: 123, t: CellValueType.NUMBER },
            }),
        } as any;
        font._renderText(ctx, 0, 0, renderFontCtx, overflow);
        expect(drawWithSpy).toHaveBeenLastCalledWith(
            ctx,
            expect.objectContaining({
                hAlign: HorizontalAlign.RIGHT,
                warp: true,
            })
        );

        renderFontCtx.fontCache = createFontCache({
            horizontalAlign: HorizontalAlign.UNSPECIFIED,
            wrapStrategy: WrapStrategy.OVERFLOW,
            cellData: { v: true, t: CellValueType.BOOLEAN },
        });
        font._renderText(ctx, 0, 0, renderFontCtx, overflow);
        expect(drawWithSpy).toHaveBeenLastCalledWith(
            ctx,
            expect.objectContaining({
                hAlign: HorizontalAlign.CENTER,
                warp: false,
            })
        );

        const before = drawWithSpy.mock.calls.length;
        renderFontCtx.fontCache = createFontCache({
            cellData: { v: null, t: CellValueType.STRING },
        });
        font._renderText(ctx, 0, 0, renderFontCtx, overflow);
        expect(drawWithSpy.mock.calls.length).toBe(before);
    });

    it('covers documents render branches and missing documents error', () => {
        const font = new Font() as any;
        const ctx = createCtx();
        const overflow = new ObjectMatrix<any>();
        const spreadsheetSkeleton = createSpreadsheetSkeleton();
        overflow.setValue(0, 0, {
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
        });

        const documentDataModel = {
            updateDocumentDataPageSize: vi.fn(),
            getSnapshot: vi.fn(() => ({
                documentStyle: {
                    marginLeft: 1,
                    marginRight: 2,
                },
            })),
        };
        const documentSkeleton = {
            getViewModel: vi.fn(() => ({
                getDataModel: vi.fn(() => documentDataModel),
            })),
            calculate: vi.fn(),
            makeDirty: vi.fn(),
            getSkeletonData: vi.fn(() => ({
                pages: [{
                    width: 30,
                    height: 12,
                    sections: [{
                        columns: [{
                            width: 30,
                            spaceWidth: 0,
                            lines: [{ lineHeight: 10 }],
                        }],
                    }],
                }],
            })),
        };

        const documents = {
            resize: vi.fn(),
            changeSkeleton: vi.fn(() => documents),
            render: vi.fn(),
        };
        font.parent = {
            getDocuments: vi.fn(() => documents),
        };

        const renderFontCtx = {
            fontCache: createFontCache({
                documentSkeleton,
                wrapStrategy: WrapStrategy.WRAP,
                vertexAngle: 0,
            }),
            startX: 0,
            startY: 0,
            endX: 40,
            endY: 20,
            spreadsheetSkeleton,
        } as any;

        font._renderDocuments(ctx, 0, 0, renderFontCtx, overflow);
        expect(documentDataModel.updateDocumentDataPageSize).toHaveBeenCalled();
        expect(documentSkeleton.calculate).toHaveBeenCalled();
        expect(documents.resize).toHaveBeenCalledWith(40, 20);
        expect(documents.changeSkeleton).toHaveBeenCalledWith(documentSkeleton);
        expect(documents.render).toHaveBeenCalled();

        font.parent = { getDocuments: vi.fn(() => null) };
        expect(() => font._renderDocuments(ctx, 0, 0, renderFontCtx, overflow)).toThrow('documents is null');
    });

    it('covers image rendering fallback branches', () => {
        const font = new Font() as any;
        const ctx = createCtx();
        const fallbackSpy = vi.spyOn(font, '_drawFallbackImage').mockImplementation(() => undefined);

        const errorImage = { complete: true, getAttribute: vi.fn(() => 'true') };
        const throwImage = { complete: true, marker: 'throw', getAttribute: vi.fn(() => 'false') };
        const pendingImage = { complete: false, getAttribute: vi.fn(() => 'false') };
        ctx.drawImage.mockImplementation((image: any) => {
            if (image.marker === 'throw') {
                throw new Error('image draw error');
            }
        });

        const fontCache = createFontCache({
            verticalAlign: VerticalAlign.MIDDLE,
            horizontalAlign: HorizontalAlign.CENTER,
            imageCacheMap: {
                getImage: vi.fn((_type: any, src: string) => {
                    if (src === 'err') return errorImage;
                    if (src === 'throw') return throwImage;
                    return pendingImage;
                }),
            },
            documentSkeleton: {
                getViewModel: vi.fn(() => ({
                    getDataModel: vi.fn(() => ({
                        getDrawings: vi.fn(() => ({
                            d1: { imageSourceType: 'url', source: 'err' },
                            d2: { imageSourceType: 'url', source: 'throw' },
                            d3: { imageSourceType: 'url', source: 'pending' },
                        })),
                    })),
                })),
                getSkeletonData: vi.fn(() => ({
                    pages: [{
                        width: 20,
                        height: 10,
                        skeDrawings: [
                            { drawingId: 'd1', aLeft: 1, aTop: 1, width: 6, height: 4, angle: 0 },
                            { drawingId: 'd2', aLeft: 2, aTop: 2, width: 6, height: 4, angle: 15 },
                            { drawingId: 'd3', aLeft: 3, aTop: 3, width: 6, height: 4, angle: 0 },
                        ],
                    }],
                })),
            },
        });

        font._renderImages(ctx, fontCache, 0, 0, 40, 20);
        expect(fallbackSpy).toHaveBeenCalledTimes(2);
        expect(ctx.rotate).toHaveBeenCalled();
    });

    it('covers draw and render-each-cell early/normal branches', () => {
        const font = new Font() as any;
        const ctx = createCtx();
        const spreadsheetSkeleton = createSpreadsheetSkeleton();
        const fontMatrix = new ObjectMatrix<any>();
        fontMatrix.setValue(0, 0, createFontCache({
            cellData: { v: 'text', t: CellValueType.STRING, fontRenderExtension: {} },
        }));
        fontMatrix.setValue(1, 1, createFontCache({
            documentSkeleton: {
                getViewModel: vi.fn(() => ({
                    getDataModel: vi.fn(() => ({
                        getDrawingsOrder: vi.fn(() => ['d1']),
                    })),
                })),
            },
            cellData: { v: 'doc', t: CellValueType.STRING, fontRenderExtension: {} },
        }));
        spreadsheetSkeleton.stylesCache = { fontMatrix };
        spreadsheetSkeleton.columnTotalWidth = 120;
        spreadsheetSkeleton.rowTotalHeight = 60;
        spreadsheetSkeleton.worksheet.getCell = vi.fn((row: number, col: number) => {
            if (row === 2 && col === 2) {
                return { v: 'skip', fontRenderExtension: { isSkip: true } };
            }
            return { v: 'ok' };
        });
        spreadsheetSkeleton.worksheet.getMergedCellRange = vi.fn(() => [{
            startRow: 1,
            endRow: 1,
            startColumn: 1,
            endColumn: 1,
        }]);
        spreadsheetSkeleton.worksheet.getSpanModel = vi.fn(() => ({
            getMergeDataIndex: vi.fn((_row: number, _col: number) => 100),
        }));

        const renderTextSpy = vi.spyOn(font, '_renderText').mockImplementation(() => undefined);
        const renderDocSpy = vi.spyOn(font, '_renderDocuments').mockImplementation(() => undefined);
        const renderImageSpy = vi.spyOn(font, '_renderImages').mockImplementation(() => undefined);

        const renderFontCtx = {
            ctx,
            scale: 1,
            columnTotalWidth: 120,
            rowTotalHeight: 60,
            viewRanges: [{ startRow: 0, endRow: 2, startColumn: 0, endColumn: 2 }],
            checkOutOfViewBound: true,
            diffRanges: [],
            spreadsheetSkeleton,
            cellInfo: createCellInfo(),
        } as any;

        const mergedSkip = font._renderFontEachCell(
            {
                ...renderFontCtx,
                cellInfo: createCellInfo({ isMerged: true, isMergedMainCell: false }),
            },
            0,
            0,
            fontMatrix
        );
        expect(mergedSkip).toBe(true);

        const hiddenSkeleton = createSpreadsheetSkeleton();
        hiddenSkeleton.worksheet.getRowVisible = vi.fn(() => false);
        const hiddenResult = font._renderFontEachCell(
            {
                ...renderFontCtx,
                spreadsheetSkeleton: hiddenSkeleton,
                cellInfo: createCellInfo(),
            },
            0,
            0,
            fontMatrix
        );
        expect(hiddenResult).toBe(true);

        const skipResult = font._renderFontEachCell(
            {
                ...renderFontCtx,
                cellInfo: createCellInfo(),
            },
            2,
            2,
            fontMatrix
        );
        expect(skipResult).toBe(true);

        const normalResult = font._renderFontEachCell(
            {
                ...renderFontCtx,
                cellInfo: createCellInfo(),
            },
            0,
            0,
            fontMatrix
        );
        expect(normalResult).toBe(false);
        expect(renderTextSpy).toHaveBeenCalled();

        const documentResult = font._renderFontEachCell(
            {
                ...renderFontCtx,
                cellInfo: createCellInfo(),
            },
            1,
            1,
            fontMatrix
        );
        expect(documentResult).toBe(false);
        expect(renderDocSpy).toHaveBeenCalled();
        expect(renderImageSpy).toHaveBeenCalled();

        font.draw(ctx, { scaleX: 1, scaleY: 1 } as any, spreadsheetSkeleton, [], {
            viewRanges: [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }],
            checkOutOfViewBound: true,
            viewportKey: 'viewMain',
        } as any);
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
    });
});
