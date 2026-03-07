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

import { BooleanNumber, ObjectMatrix } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { Vector2 } from '../../../basics/vector2';
import { SHEET_VIEWPORT_KEY } from '../interfaces';
import { Spreadsheet } from '../spreadsheet';

function createMainCtx() {
    return {
        renderConfig: {},
        imageSmoothingEnabled: true,
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        closePathByEnv: vi.fn(),
        stroke: vi.fn(),
        setTransform: vi.fn(),
        drawImage: vi.fn(),
        setLineWidthByPrecision: vi.fn(),
        moveToByPrecision: vi.fn(),
        lineToByPrecision: vi.fn(),
        clearRectByPrecision: vi.fn(),
        rectByPrecision: vi.fn(),
        clip: vi.fn(),
        translateWithPrecision: vi.fn(),
        translateWithPrecisionRatio: vi.fn(),
        getTransform: vi.fn(() => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })),
    } as any;
}

function createSpreadsheetMock() {
    const spreadsheet = Object.create(Spreadsheet.prototype) as Spreadsheet & any;
    spreadsheet._visible = true;
    spreadsheet._forceDirty = false;
    spreadsheet._forceDisableGridlines = false;
    spreadsheet._refreshIncrementalState = false;
    spreadsheet._dirtyBounds = [];
    spreadsheet.isDirty = vi.fn(() => false);
    spreadsheet.getParentScale = vi.fn(() => ({ scaleX: 1, scaleY: 1 }));
    spreadsheet.getExtensionsByOrder = vi.fn(() => []);
    spreadsheet.addRenderTagToScene = vi.fn();
    spreadsheet.addRenderFrameTimeMetricToScene = vi.fn();
    spreadsheet.draw = Spreadsheet.prototype.draw.bind(spreadsheet);
    spreadsheet._draw = vi.fn();
    spreadsheet.makeDirty = Spreadsheet.prototype.makeDirty.bind(spreadsheet);
    return spreadsheet;
}

describe('spreadsheet', () => {
    it('covers draw auxiliary and clear rectangle branches', () => {
        const spreadsheet = createSpreadsheetMock();
        const ctx = createMainCtx();

        const overflowCache = new ObjectMatrix();
        overflowCache.setValue(1, 1, {
            startRow: 1,
            endRow: 1,
            startColumn: 1,
            endColumn: 2,
        });
        const skeleton = {
            rowColumnSegment: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 2 },
            overflowCache,
            showGridlines: BooleanNumber.TRUE,
            gridlinesColor: '#dddddd',
            worksheet: {
                getRowVisible: vi.fn((row: number) => row !== 1),
            },
            rowHeightAccumulation: [20, 40, 60],
            rowTotalHeight: 60,
            columnWidthAccumulation: [50, 100, 150],
            columnTotalWidth: 150,
            getCurrentRowColumnSegmentMergeData: vi.fn(() => [{
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 0,
            }]),
        };
        spreadsheet.getSkeleton = vi.fn(() => skeleton);

        (spreadsheet as any)._drawAuxiliary(ctx);
        expect(ctx.setLineWidthByPrecision).toHaveBeenCalledWith(1);
        expect(ctx.stroke).toHaveBeenCalled();
        expect(ctx.clearRectByPrecision).toHaveBeenCalled();

        spreadsheet.setForceDisableGridlines(true);
        (spreadsheet as any)._drawAuxiliary(ctx);
        expect(spreadsheet.forceDisableGridlines).toBe(true);

        (spreadsheet as any)._clearRectangle(ctx, [20, 40, 60], [50, 100, 150], [{
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
        }]);
        expect(ctx.clearRectByPrecision).toHaveBeenCalled();
    });

    it('covers draw/renderByViewports/refresh and cache applying flows', () => {
        const spreadsheet = createSpreadsheetMock();
        const mainCtx = createMainCtx();
        const cacheCtx = createMainCtx();
        const cacheCanvas = {
            clear: vi.fn(),
            getPixelRatio: vi.fn(() => 2),
            getContext: vi.fn(() => cacheCtx),
            getCanvasEle: vi.fn(() => document.createElement('canvas')),
        };

        const skeleton = {
            rowHeaderWidth: 10,
            columnHeaderHeight: 8,
            getRangeByViewBound: vi.fn(() => ({
                startRow: 0,
                endRow: 2,
                startColumn: 0,
                endColumn: 2,
            })),
            getCacheRangeByViewport: vi.fn(() => ({
                startRow: 0,
                endRow: 2,
                startColumn: 0,
                endColumn: 2,
            })),
            setStylesCache: vi.fn(),
            rowColumnSegment: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 2 },
        };
        spreadsheet.getSkeleton = vi.fn(() => skeleton);
        spreadsheet.getScene = vi.fn(() => ({
            getEngine: () => ({
                renderFrameTimeMetric$: { next: vi.fn() },
                renderFrameTags$: { next: vi.fn() },
            }),
            updateTransformerZero: vi.fn(),
            getViewports: vi.fn(() => [{ markDirty: vi.fn() }]),
        }));
        spreadsheet.getExtensionsByOrder = vi.fn(() => [{
            uKey: 'ext-a',
            draw: vi.fn(),
            clearCache: vi.fn(),
        }]);

        spreadsheet.draw(mainCtx, {
            viewportKey: SHEET_VIEWPORT_KEY.VIEW_MAIN,
            cacheBound: { left: 0, top: 0, right: 100, bottom: 60 },
            diffBounds: [],
        } as any);
        expect(spreadsheet.getExtensionsByOrder).toHaveBeenCalled();

        const refreshSpy = vi.spyOn(spreadsheet, 'refreshCacheCanvas');
        const paintSpy = vi.spyOn(spreadsheet, 'paintNewAreaForScrolling');
        const applySpy = vi.spyOn(spreadsheet as any, '_applyCache');

        spreadsheet.renderByViewports(
            mainCtx,
            {
                diffBounds: [],
                diffCacheBounds: [],
                diffX: 0,
                diffY: 0,
                leftOrigin: 0,
                topOrigin: 0,
                bufferEdgeX: 4,
                bufferEdgeY: 4,
                cacheCanvas,
                isDirty: true,
                isForceDirty: false,
                shouldCacheUpdate: false,
                viewPortPosition: { left: 0, top: 0, right: 100, bottom: 60 },
            } as any,
            skeleton as any
        );
        expect(refreshSpy).toHaveBeenCalled();
        expect(applySpy).toHaveBeenCalled();

        spreadsheet.renderByViewports(
            mainCtx,
            {
                diffBounds: [{ left: 0, top: 0, right: 20, bottom: 20 }],
                diffCacheBounds: [{ left: 0, top: 0, right: 20, bottom: 20 }],
                diffX: 2,
                diffY: 3,
                leftOrigin: 0,
                topOrigin: 0,
                bufferEdgeX: 2,
                bufferEdgeY: 2,
                cacheCanvas,
                isDirty: false,
                isForceDirty: false,
                shouldCacheUpdate: true,
                viewPortPosition: { left: 0, top: 0, right: 100, bottom: 60 },
            } as any,
            skeleton as any
        );
        expect(paintSpy).toHaveBeenCalled();

        spreadsheet.refreshCacheCanvas(
            { viewportKey: SHEET_VIEWPORT_KEY.VIEW_MAIN, diffBounds: [] } as any,
            {
                cacheCanvas: cacheCanvas as any,
                cacheCtx: cacheCtx as any,
                mainCtx: mainCtx as any,
                topOrigin: 0,
                leftOrigin: 0,
                bufferEdgeX: 1,
                bufferEdgeY: 1,
            }
        );
        expect(cacheCanvas.clear).toHaveBeenCalled();
    });

    it('covers render dispatch and misc helpers', () => {
        const spreadsheet = createSpreadsheetMock();
        const mainCtx = createMainCtx();

        spreadsheet.getParent = vi.fn(() => ({
            findViewportByPosToScene: vi.fn(() => ({ viewportScrollX: 12, viewportScrollY: 34 })),
            getViewports: vi.fn(() => [{ markDirty: vi.fn() }]),
        }));
        spreadsheet.getSkeleton = vi.fn(() => ({
            rowHeaderWidth: 5,
            columnHeaderHeight: 6,
            rowColumnSegment: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            setStylesCache: vi.fn(),
            expandRangeByMerge: vi.fn(() => ({ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 })),
            getNoMergeCellWithCoordByIndex: vi.fn(() => ({ startX: 1, startY: 2, endX: 3, endY: 4 })),
        }));
        spreadsheet.renderByViewports = vi.fn();
        spreadsheet._draw = vi.fn();
        spreadsheet.getInverseCoord = vi.fn((coord: Vector2) => coord);
        spreadsheet.getScene = vi.fn(() => ({
            updateTransformerZero: vi.fn(),
            getViewports: vi.fn(() => [{ markDirty: vi.fn() }]),
        }));

        expect(spreadsheet.isHit(Vector2.create(20, 20))).toBe(true);
        expect(spreadsheet.getNoMergeCellPositionByIndex(0, 0)).toEqual({ startX: 1, startY: 2, endX: 3, endY: 4 });
        expect(spreadsheet.getScrollXYByRelativeCoords(Vector2.create(1, 1))).toEqual({ x: 12, y: 34 });
        expect(spreadsheet.getSelectionBounding(0, 0, 1, 1)).toEqual({
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
        });

        spreadsheet.makeForceDirty(true);
        expect(spreadsheet.isForceDirty()).toBe(true);
        spreadsheet.makeDirty(false);
        spreadsheet.setDirtyArea([{ left: 0, top: 0, right: 1, bottom: 1 }]);

        spreadsheet._visible = false;
        spreadsheet.render(mainCtx, { viewportKey: SHEET_VIEWPORT_KEY.VIEW_MAIN } as any);

        spreadsheet._visible = true;
        spreadsheet.render(mainCtx, {
            viewportKey: SHEET_VIEWPORT_KEY.VIEW_MAIN,
            cacheCanvas: { getContext: () => createMainCtx(), getCanvasEle: () => document.createElement('canvas') },
        } as any);
        expect(spreadsheet.renderByViewports).toHaveBeenCalled();

        spreadsheet.render(mainCtx, {
            viewportKey: SHEET_VIEWPORT_KEY.VIEW_ROW_TOP,
        } as any);

        expect((spreadsheet as any).testGetRandomLightColor()).toMatch(/^#([0-9a-f]{6})$/i);
    });
});
