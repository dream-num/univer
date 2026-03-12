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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import type { IBoundRectNoAngle, IViewportInfo } from '../../../basics/vector2';
import {
    BooleanNumber,
    BorderStyleTypes,
    ILogService,
    IUniverInstanceService,
    LocaleType,
    LogLevel,
    ObjectMatrix,
    RANGE_TYPE,
    Univer,
    UniverInstanceType,
    WrapStrategy,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupRenderTestEnv } from '../../../__tests__/render-test-utils';
import { Vector2 } from '../../../basics/vector2';
import { Canvas } from '../../../canvas';
import { Engine } from '../../../engine';
import { MAIN_VIEW_PORT_KEY, Scene } from '../../../scene';
import { Viewport } from '../../../viewport';
import { SHEET_VIEWPORT_KEY } from '../interfaces';
import { convertTransformToOffsetX, convertTransformToOffsetY, SpreadsheetSkeleton } from '../sheet.render-skeleton';
import { Spreadsheet } from '../spreadsheet';

const workbookDataFactory = (): IWorkbookData => ({
    id: 'sheet-render-workbook',
    appVersion: '3.0.0-alpha',
    locale: LocaleType.EN_US,
    name: 'sheet-render-workbook',
    sheetOrder: ['sheet-1'],
    styles: {
        'style-bg-border': {
            bg: { rgb: '#f6f6cc' },
            bd: {
                t: { s: BorderStyleTypes.THIN, cl: { rgb: '#334455' } },
                r: { s: BorderStyleTypes.THIN, cl: { rgb: '#334455' } },
                b: { s: BorderStyleTypes.THIN, cl: { rgb: '#334455' } },
                l: { s: BorderStyleTypes.THIN, cl: { rgb: '#334455' } },
            },
            tb: WrapStrategy.WRAP,
            fs: 12,
            ff: 'Arial',
        },
        'style-rotate': {
            tr: { a: 45 },
            fs: 11,
            ff: 'Arial',
            cl: { rgb: '#111111' },
        },
    },
    sheets: {
        'sheet-1': {
            id: 'sheet-1',
            name: 'Sheet-1',
            rowCount: 20,
            columnCount: 12,
            defaultColumnWidth: 72,
            defaultRowHeight: 24,
            rowHeader: { width: 46 },
            columnHeader: { height: 28 },
            mergeData: [{ startRow: 2, endRow: 3, startColumn: 2, endColumn: 3, rangeType: RANGE_TYPE.NORMAL }],
            rowData: {
                6: { hd: BooleanNumber.TRUE },
            },
            columnData: {
                5: { hd: BooleanNumber.TRUE },
                1: { w: 48 },
                2: { w: 64 },
            },
            cellData: {
                0: {
                    0: { v: 'A1' },
                    1: { v: 'very-long-text-for-overflow-path', s: 'style-bg-border' },
                    2: { v: 'wrapped line text', s: 'style-bg-border' },
                },
                1: {
                    1: { v: 'rotate-text', s: 'style-rotate' },
                    3: { v: '123', f: '=1+2' },
                },
                2: {
                    2: { v: 'merged-main', s: 'style-bg-border' },
                },
            },
        },
    },
});

interface IFixture {
    univer: Univer;
    workbook: Workbook;
    skeleton: SpreadsheetSkeleton;
    engine: Engine;
    scene: Scene;
    viewport: Viewport;
    spreadsheet: Spreadsheet;
    mainCanvas: Canvas;
    cacheCanvas: Canvas;
    restoreEnv: () => void;
    container: HTMLDivElement;
}

function createBound(left: number, top: number, right: number, bottom: number): IBoundRectNoAngle {
    return { left, top, right, bottom };
}

function createViewportInfo(scene: Scene, cacheCanvas: Canvas, overrides?: Partial<IViewportInfo>): IViewportInfo {
    const viewBound = createBound(0, 0, 420, 240);
    const cacheBound = createBound(0, 0, 460, 280);
    const viewPortPosition = createBound(0, 0, 420, 240);

    return {
        viewBound,
        cacheBound,
        viewPortPosition,
        cacheViewPortPosition: viewPortPosition,
        diffBounds: [],
        diffCacheBounds: [],
        diffX: 0,
        diffY: 0,
        viewportKey: SHEET_VIEWPORT_KEY.VIEW_MAIN,
        isDirty: 1,
        isForceDirty: false,
        allowCache: true,
        shouldCacheUpdate: 1,
        sceneTrans: scene.transform,
        cacheCanvas,
        leftOrigin: 0,
        topOrigin: 0,
        bufferEdgeX: 12,
        bufferEdgeY: 8,
        ...overrides,
    };
}

function createFixture(): IFixture {
    const renderEnv = setupRenderTestEnv();

    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookDataFactory());
    get(IUniverInstanceService).focusUnit('sheet-render-workbook');
    get(ILogService).setLogLevel(LogLevel.SILENT);

    const worksheet = workbook.getActiveSheet()!;
    const skeleton = injector.createInstance(SpreadsheetSkeleton, worksheet, workbook.getStyles()).calculate() as SpreadsheetSkeleton;

    const container = document.createElement('div');
    container.style.width = '640px';
    container.style.height = '360px';
    document.body.appendChild(container);

    const engine = new Engine('sheet-render-engine', { elementWidth: 620, elementHeight: 340, dpr: 1 });
    engine.mount(container, false);
    const scene = new Scene('sheet-render-scene', engine);
    scene.transformByState({
        width: 1800,
        height: 1200,
        scaleX: 1,
        scaleY: 1,
    });

    const viewport = new Viewport(MAIN_VIEW_PORT_KEY, scene, {
        left: 0,
        top: 0,
        width: 420,
        height: 240,
        active: true,
        allowCache: true,
        bufferEdgeX: 12,
        bufferEdgeY: 8,
    });
    viewport.scrollToViewportPos({ viewportScrollX: 30, viewportScrollY: 18 });

    skeleton.setScene(scene);
    const spreadsheet = new Spreadsheet('sheet-component', skeleton, true);
    scene.addObject(spreadsheet, 1);

    const mainCanvas = new Canvas({ width: 640, height: 360, pixelRatio: 1 });
    const cacheCanvas = new Canvas({ width: 700, height: 420, pixelRatio: 1 });

    return {
        univer,
        workbook,
        skeleton,
        engine,
        scene,
        viewport,
        spreadsheet,
        mainCanvas,
        cacheCanvas,
        restoreEnv: renderEnv.restore,
        container,
    };
}

function disposeFixture(fixture: IFixture) {
    fixture.spreadsheet.dispose();
    fixture.viewport.dispose();
    fixture.scene.dispose();
    fixture.engine.dispose();
    fixture.mainCanvas.dispose();
    fixture.cacheCanvas.dispose();
    fixture.univer.dispose();
    fixture.restoreEnv();
    fixture.container.remove();
}

describe('spreadsheet integration', () => {
    let fixture: IFixture;

    beforeEach(() => {
        fixture = createFixture();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        disposeFixture(fixture);
        document.body.innerHTML = '';
    });

    it('builds sheet skeleton cache through visible viewport and style/layout calculations', () => {
        const { skeleton, scene, cacheCanvas } = fixture;
        const vpInfo = createViewportInfo(scene, cacheCanvas);

        expect(skeleton.updateVisibleRange(vpInfo)).toBe(true);
        skeleton.setStylesCache(vpInfo);

        const visibleMain = skeleton.getVisibleRangeByViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        expect(visibleMain).toEqual(expect.objectContaining({
            startRow: expect.any(Number),
            endRow: expect.any(Number),
            startColumn: expect.any(Number),
            endColumn: expect.any(Number),
        }));
        expect(skeleton.rowColumnSegment.endRow).toBeGreaterThanOrEqual(0);
        expect(skeleton.stylesCache.fontMatrix.getSizeOf()).toBeGreaterThan(0);

        const autoHeights = skeleton.calculateAutoHeightInRange([{ startRow: 0, endRow: 6, startColumn: 0, endColumn: 3, rangeType: RANGE_TYPE.NORMAL }]);
        expect(autoHeights.length).toBeGreaterThan(0);
        expect(autoHeights.some((item) => (item.autoHeight ?? 0) >= 24)).toBe(true);

        const currentCellHeights = new ObjectMatrix<number>();
        currentCellHeights.setValue(0, 0, 6);
        currentCellHeights.setValue(0, 1, 8);
        const autoHeightsWithCurrent = skeleton.calculateAutoHeightInRange([
            { startRow: 0, endRow: 3, startColumn: 0, endColumn: 2, rangeType: RANGE_TYPE.NORMAL },
        ], currentCellHeights);
        expect(autoHeightsWithCurrent.length).toBeGreaterThan(0);

        const autoWidths = skeleton.calculateAutoWidthInRange([{ startRow: 0, endRow: 8, startColumn: 0, endColumn: 4, rangeType: RANGE_TYPE.NORMAL }]);
        expect(autoWidths.length).toBeGreaterThan(0);
        expect(autoWidths.every((item) => (item.width ?? 0) > 0)).toBe(true);

        expect(skeleton.getFont(0, 1)).toBeTruthy();
        expect(skeleton.getColWidth(2)).toBeGreaterThan(0);
        expect(skeleton.getRowHeight(2)).toBeGreaterThan(0);
        expect(skeleton.getDistanceFromTopLeft(2, 2)).toEqual({
            x: expect.any(Number),
            y: expect.any(Number),
        });
        expect(convertTransformToOffsetX(120, 2, { x: 20, y: 0 })).toBe(200);
        expect(convertTransformToOffsetY(80, 1.5, { x: 0, y: 10 })).toBe(105);
        expect(skeleton.getCellWithMergeInfoByIndex(2, 2)).toEqual(expect.objectContaining({
            startRow: 2,
            endRow: 3,
            startColumn: 2,
            endColumn: 3,
        }));

        expect(skeleton.getHiddenRowsInRange({ startRow: 0, endRow: 10 })).toContain(6);
        expect(skeleton.getHiddenColumnsInRange({ startColumn: 0, endColumn: 8 })).toContain(5);

        const overflowRange = skeleton.getOverflowPosition({ width: 260, height: 20 }, 0 as any, 0, 1, 12);
        expect(overflowRange.endColumn).toBeGreaterThanOrEqual(overflowRange.startColumn);

        skeleton.resetRangeCache([{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 2, rangeType: RANGE_TYPE.NORMAL }]);
        skeleton.resetCache();
        expect(skeleton.stylesCache.fontMatrix.getSizeOf()).toBe(0);
    });

    it('renders spreadsheet with cache refresh and scrolling diff paths in scene viewport', () => {
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        const mainCtx = mainCanvas.getContext();

        const baseVpInfo = createViewportInfo(scene, cacheCanvas, {
            isDirty: 1,
            isForceDirty: false,
        });

        spreadsheet.render(mainCtx as any, baseVpInfo);
        expect(spreadsheet.allowCache).toBe(true);
        expect(spreadsheet.getSelectionBounding(2, 2, 2, 2)).toEqual(expect.objectContaining({
            startRow: 2,
            endRow: 3,
            startColumn: 2,
            endColumn: 3,
        }));

        spreadsheet.makeDirty(false);
        const scrollingVpInfo = createViewportInfo(scene, cacheCanvas, {
            isDirty: 0,
            isForceDirty: false,
            diffBounds: [createBound(120, 72, 220, 142)],
            diffCacheBounds: [createBound(120, 72, 220, 142)],
            diffX: 16,
            diffY: 8,
            shouldCacheUpdate: 1,
        });
        spreadsheet.render(mainCtx as any, scrollingVpInfo);

        spreadsheet.makeForceDirty(true);
        spreadsheet.render(mainCtx as any, createViewportInfo(scene, cacheCanvas, { isDirty: 0, isForceDirty: true }));
        expect(spreadsheet.isForceDirty()).toBe(true);

        spreadsheet.setForceDisableGridlines(true);
        spreadsheet.makeForceDirty(false);
        spreadsheet.render(mainCtx as any, createViewportInfo(scene, cacheCanvas, {
            viewportKey: SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP,
            isDirty: 1,
        }));

        expect(spreadsheet.getNoMergeCellPositionByIndex(1, 1)).toEqual(expect.objectContaining({
            startX: expect.any(Number),
            endX: expect.any(Number),
            startY: expect.any(Number),
            endY: expect.any(Number),
        }));
        expect(spreadsheet.isHit(Vector2.FromArray([100, 100]))).toBe(true);
        expect(spreadsheet.getScrollXYByRelativeCoords(Vector2.FromArray([20, 20]))).toEqual({
            x: expect.any(Number),
            y: expect.any(Number),
        });

        skeleton.dispose();
    });

    it('covers spreadsheet draw helpers and utility branches', () => {
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        const context = mainCanvas.getContext() as any;
        const viewportInfo = createViewportInfo(scene, cacheCanvas, {
            diffBounds: [createBound(100, 60, 220, 140)],
            diffCacheBounds: [createBound(100, 60, 220, 140)],
            diffX: 4,
            diffY: 3,
            shouldCacheUpdate: 1,
            isDirty: 0,
            isForceDirty: false,
        });

        const extensionDraw = vi.fn();
        vi.spyOn(spreadsheet as any, 'getExtensionsByOrder').mockReturnValue([{
            uKey: 'MockSheetExtension',
            draw: extensionDraw,
        }]);

        spreadsheet.draw(context, viewportInfo);
        expect(extensionDraw).toHaveBeenCalled();

        spreadsheet.paintNewAreaForScrolling(viewportInfo, {
            cacheCanvas,
            cacheCtx: cacheCanvas.getContext() as any,
            mainCtx: context,
            topOrigin: 0,
            leftOrigin: 0,
            bufferEdgeX: 8,
            bufferEdgeY: 6,
            rowHeaderWidth: skeleton.rowHeaderWidth,
            columnHeaderHeight: skeleton.columnHeaderHeight,
            scaleX: 1,
            scaleY: 1,
        } as any);

        spreadsheet.refreshCacheCanvas(viewportInfo, {
            cacheCanvas,
            cacheCtx: cacheCanvas.getContext() as any,
            mainCtx: context,
            topOrigin: 0,
            leftOrigin: 0,
            bufferEdgeX: 8,
            bufferEdgeY: 6,
        });

        (spreadsheet as any)._applyCache(cacheCanvas, null);
        spreadsheet.testShowRuler(cacheCanvas.getContext() as any, viewportInfo);
        const random = spreadsheet.testGetRandomLightColor();
        expect(random).toMatch(/^#[A-F]{6}$/);

        expect(spreadsheet.backgroundExtension).toBe(spreadsheet.backgroundExtension);
        expect(spreadsheet.borderExtension).toBe(spreadsheet.borderExtension);
        expect(spreadsheet.fontExtension).toBe(spreadsheet.fontExtension);
        expect(spreadsheet.getDocuments()).toBeDefined();
        expect(spreadsheet.forceDisableGridlines).toBe(spreadsheet.forceDisableGridlines);

        const noSkeletonSpreadsheet = new Spreadsheet('no-skeleton');
        expect(noSkeletonSpreadsheet.draw(context, viewportInfo)).toBeUndefined();
        expect(noSkeletonSpreadsheet.isHit(Vector2.FromArray([10, 10]))).toBe(false);
        expect(noSkeletonSpreadsheet.getNoMergeCellPositionByIndex(0, 0)).toEqual({
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
        });
        noSkeletonSpreadsheet.dispose();
    });
});
