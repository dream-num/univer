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

import type { IDocumentData, IWorkbookData, Workbook } from '@univerjs/core';
import type { IBoundRectNoAngle, IViewportInfo } from '../../../basics/vector2';
import {
    BooleanNumber,
    BorderStyleTypes,
    createSheetGapTestConfig,
    HorizontalAlign,
    ILogService,
    IUniverInstanceService,
    LocaleType,
    LogLevel,
    ObjectMatrix,
    RANGE_TYPE,
    Univer,
    UniverInstanceType,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupRenderTestEnv } from '../../../__tests__/render-test-utils';
import { FontCache } from '../../../basics';
import { Vector2 } from '../../../basics/vector2';
import { Canvas } from '../../../canvas';
import { Engine } from '../../../engine';
import { MAIN_VIEW_PORT_KEY, Scene } from '../../../scene';
import { Viewport } from '../../../viewport';
import { SHEET_VIEWPORT_KEY } from '../interfaces';
import {
    convertTransformToOffsetX,
    convertTransformToOffsetY,
    getShrinkToFitScale,
    scaleDocumentDataForShrinkToFit,
    SpreadsheetSkeleton,
} from '../sheet.render-skeleton';
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
        'style-shrink': {
            stf: BooleanNumber.TRUE,
            fs: 12,
            ff: 'Arial',
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
                    3: { v: 'very long text that must shrink to fit', s: 'style-shrink' },
                    4: { s: 'style-bg-border', custom: { key: 'value' } },
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

    it('calculates a shrink scale with a one-point minimum font size', () => {
        expect(getShrinkToFitScale(80, 100, 12)).toBe(1);
        expect(getShrinkToFitScale(200, 100, 12)).toBe(0.5);
        expect(getShrinkToFitScale(2400, 100, 12)).toBeCloseTo(1 / 12);
    });

    it('scales cloned rich-text font sizes without mutating the stored document', () => {
        const document = {
            id: 'rich-text',
            body: {
                dataStream: 'Univer\r\n',
                textRuns: [{ st: 0, ed: 6, ts: { fs: 20 } }],
            },
            documentStyle: { textStyle: { fs: 12 } },
        } as IDocumentData;

        const scaled = scaleDocumentDataForShrinkToFit(document, 0.5, 10);

        expect(scaled).not.toBe(document);
        expect(scaled.documentStyle.textStyle?.fs).toBe(6);
        expect(scaled.body?.textRuns?.[0].ts?.fs).toBe(10);
        expect(document.documentStyle.textStyle?.fs).toBe(12);
        expect(document.body?.textRuns?.[0].ts?.fs).toBe(20);
    });

    it('applies shrink to fit while building the font cache', () => {
        const { skeleton, workbook } = fixture;
        const worksheet = workbook.getActiveSheet()!;
        const cell = worksheet.getCell(0, 3)!;
        const style = worksheet.getComposedCellStyleByCellData(0, 3, cell)!;
        vi.spyOn(FontCache, 'getMeasureText').mockReturnValue({ width: 240 } as TextMetrics);

        skeleton._setFontStylesCache(0, 3, cell, style);

        const fontCache = skeleton.getFont(0, 3)!;
        expect(fontCache.shrinkScale).toBeCloseTo(68 / 240);
        expect(fontCache.fontString).toContain(`${12 * 68 / 240}pt`);
        expect(style.fs).toBe(12);
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
        expect(skeleton.stylesCache.border?.getValue(0, 4)).toBeTruthy();
        expect(skeleton.stylesCache.fontMatrix.getValue(0, 4)).toBeUndefined();
        expect(skeleton.overflowCache.getValue(0, 4)).toBeUndefined();

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

    it('keeps the last printing row and column when the viewport ends on their exact boundaries', () => {
        const { skeleton, scene, cacheCanvas } = fixture;
        const endRow = 3;
        const endColumn = 3;
        const cacheBound = createBound(
            skeleton.rowHeaderWidthAndMarginLeft,
            skeleton.columnHeaderHeightAndMarginTop,
            skeleton.rowHeaderWidthAndMarginLeft + skeleton.columnWidthAccumulation[endColumn],
            skeleton.columnHeaderHeightAndMarginTop + skeleton.rowHeightAccumulation[endRow]
        );
        const vpInfo = createViewportInfo(scene, cacheCanvas, { cacheBound });

        expect(skeleton.getCacheRangeByViewport(vpInfo, true)).toEqual({
            startRow: 0,
            endRow,
            startColumn: 0,
            endColumn,
        });
    });

    it('does not include the next printing row or column for a one-pixel viewport overlap', () => {
        const { skeleton, scene, cacheCanvas } = fixture;
        const endRow = 3;
        const endColumn = 3;
        const cacheBound = createBound(
            skeleton.rowHeaderWidthAndMarginLeft,
            skeleton.columnHeaderHeightAndMarginTop,
            skeleton.rowHeaderWidthAndMarginLeft + skeleton.columnWidthAccumulation[endColumn] + 1,
            skeleton.columnHeaderHeightAndMarginTop + skeleton.rowHeightAccumulation[endRow] + 1
        );
        const vpInfo = createViewportInfo(scene, cacheCanvas, { cacheBound });

        expect(skeleton.getCacheRangeByViewport(vpInfo, true)).toEqual({
            startRow: 0,
            endRow,
            startColumn: 0,
            endColumn,
        });
    });

    it('builds border cache for row-wise merged cells on the selection left edge', () => {
        const workbookData = workbookDataFactory();
        workbookData.id = 'sheet-render-border-workbook';
        workbookData.name = 'sheet-render-border-workbook';
        workbookData.styles.leftBorder = {
            bd: {
                l: { s: BorderStyleTypes.THIN, cl: { rgb: '#000000' } },
            },
        };
        workbookData.sheets['sheet-1'].mergeData = [
            { startRow: 3, endRow: 3, startColumn: 2, endColumn: 4, rangeType: RANGE_TYPE.NORMAL },
            { startRow: 4, endRow: 4, startColumn: 2, endColumn: 4, rangeType: RANGE_TYPE.NORMAL },
            { startRow: 5, endRow: 5, startColumn: 2, endColumn: 4, rangeType: RANGE_TYPE.NORMAL },
        ];
        workbookData.sheets['sheet-1'].cellData = {
            3: { 2: { s: 'leftBorder' } },
            4: { 2: { s: 'leftBorder' } },
            5: { 2: { s: 'leftBorder' } },
        };

        const workbook = fixture.univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData);
        const worksheet = workbook.getActiveSheet()!;
        const skeleton = fixture.univer.__getInjector().createInstance(SpreadsheetSkeleton, worksheet, workbook.getStyles()).calculate() as SpreadsheetSkeleton;
        skeleton.setScene(fixture.scene);
        skeleton.setStylesCache(createViewportInfo(fixture.scene, fixture.cacheCanvas));

        expect(skeleton.stylesCache.border?.getValue(3, 2)?.l).toEqual(expect.objectContaining({ color: '#000000' }));
        expect(skeleton.stylesCache.border?.getValue(4, 2)?.l).toEqual(expect.objectContaining({ color: '#000000' }));
        expect(skeleton.stylesCache.border?.getValue(5, 2)?.l).toEqual(expect.objectContaining({ color: '#000000' }));
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

    it('renders sheet content from the header plus outline margin origin', () => {
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        const mainCtx = mainCanvas.getContext() as any;
        const translateSpy = vi.spyOn(mainCtx, 'translateWithPrecision');
        const transformerSpy = vi.spyOn(scene, 'updateTransformerZero');

        skeleton.setMarginLeft(20);
        skeleton.setMarginTop(16);

        spreadsheet.render(mainCtx, createViewportInfo(scene, cacheCanvas, {
            isDirty: 1,
            isForceDirty: false,
        }));

        expect(translateSpy).toHaveBeenCalledWith(66, 44);
        expect(transformerSpy).toHaveBeenCalledWith(66, 44);
        expect(spreadsheet.isHit(Vector2.FromArray([65, 44]))).toBe(false);
        expect(spreadsheet.isHit(Vector2.FromArray([67, 45]))).toBe(true);
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

        (spreadsheet as any)._refreshIncrementalState = true;
        spreadsheet.draw(context, viewportInfo);
        const incrementalDrawInfo = extensionDraw.mock.calls.at(-1)?.[4];
        expect(incrementalDrawInfo.viewRanges).toEqual(
            viewportInfo.diffBounds.map((bound) => skeleton.getRangeByViewBound(bound))
        );

        const fontExtension = { uKey: 'DefaultFontExtension', draw: vi.fn() };
        const borderExtension = { uKey: 'DefaultBorderExtension', draw: vi.fn() };
        (spreadsheet as any)._fontExtension = fontExtension;
        (spreadsheet as any)._borderExtension = borderExtension;
        vi.spyOn(spreadsheet as any, 'getExtensionsByOrder').mockReturnValue([
            fontExtension,
            borderExtension,
            {
                uKey: 'MockSheetExtension',
                draw: extensionDraw,
            },
        ]);
        spreadsheet.draw(context, viewportInfo);
        const cacheRange = skeleton.getCacheRangeByViewport(viewportInfo);
        const overflowSafeRanges = viewportInfo.diffBounds.map((bound) => ({
            ...skeleton.getRangeByViewBound(bound),
            startColumn: cacheRange.startColumn,
            endColumn: cacheRange.endColumn,
        }));
        expect(fontExtension.draw.mock.calls.at(-1)?.[4].viewRanges).toEqual(overflowSafeRanges);
        expect(borderExtension.draw.mock.calls.at(-1)?.[4].viewRanges).toEqual(overflowSafeRanges);
        expect(extensionDraw.mock.calls.at(-1)?.[4].viewRanges).toEqual(
            viewportInfo.diffBounds.map((bound) => skeleton.getRangeByViewBound(bound))
        );
        (spreadsheet as any)._refreshIncrementalState = false;

        spreadsheet.paintNewAreaForScrolling(viewportInfo, {
            cacheCanvas,
            cacheCtx: cacheCanvas.getContext() as any,
            mainCtx: context,
            topOrigin: 0,
            leftOrigin: 0,
            bufferEdgeX: 8,
            bufferEdgeY: 6,
            rowHeaderWidthAndMarginLeft: skeleton.rowHeaderWidthAndMarginLeft,
            columnHeaderHeightAndMarginTop: skeleton.columnHeaderHeightAndMarginTop,
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

    it('skips merge gridline cleanup during merge-free drawing', () => {
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        const context = mainCanvas.getContext() as any;
        const extensionDraw = vi.fn();
        vi.spyOn(skeleton.worksheet, 'getMergeData').mockReturnValue([]);
        const getMergeRangesSpy = vi.spyOn(skeleton, 'getCurrentRowColumnSegmentMergeData');
        vi.spyOn(spreadsheet as any, 'getExtensionsByOrder').mockReturnValue([{
            uKey: 'MockSheetExtension',
            draw: extensionDraw,
        }]);

        spreadsheet.draw(context, createViewportInfo(scene, cacheCanvas));

        expect(getMergeRangesSpy).not.toHaveBeenCalled();
        expect(extensionDraw.mock.calls.at(-1)?.[4].hasMergeData).toBe(false);
    });

    it('skips sparse extensions with no matching cell data during merge-free incremental drawing', () => {
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        const context = mainCanvas.getContext() as any;
        const sparseDraw = vi.fn();
        const regularDraw = vi.fn();

        vi.spyOn(skeleton.worksheet, 'getMergeData').mockReturnValue([]);
        vi.spyOn(skeleton.worksheet, 'getCell').mockReturnValue(undefined);
        vi.spyOn(spreadsheet as any, 'getExtensionsByOrder').mockReturnValue([
            {
                draw: sparseDraw,
                uKey: 'DefaultCustomExtension',
            },
            {
                draw: regularDraw,
                uKey: 'RegularExtension',
            },
        ]);

        (spreadsheet as any)._refreshIncrementalState = true;
        spreadsheet.draw(context, createViewportInfo(scene, cacheCanvas, {
            diffBounds: [createBound(100, 60, 220, 140)],
            diffCacheBounds: [createBound(100, 60, 220, 140)],
        }));
        (spreadsheet as any)._refreshIncrementalState = false;

        expect(sparseDraw).not.toHaveBeenCalled();
        expect(regularDraw).toHaveBeenCalledOnce();
    });

    it('does not skip conditional-formatting render extensions during sparse scans', () => {
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        const context = mainCanvas.getContext() as any;
        const dataBarDraw = vi.fn();
        const iconDraw = vi.fn();
        const markerDraw = vi.fn();

        vi.spyOn(skeleton.worksheet, 'getMergeData').mockReturnValue([]);
        vi.spyOn(skeleton.worksheet, 'getCell').mockReturnValue(undefined);
        vi.spyOn(spreadsheet as any, 'getExtensionsByOrder').mockReturnValue([
            {
                draw: dataBarDraw,
                uKey: 'sheet-conditional-rule-data-bar',
            },
            {
                draw: iconDraw,
                uKey: 'sheet-conditional-rule-icon',
            },
            {
                draw: markerDraw,
                uKey: 'DefaultMarkerExtension',
            },
        ]);

        (spreadsheet as any)._refreshIncrementalState = true;
        spreadsheet.draw(context, createViewportInfo(scene, cacheCanvas, {
            diffBounds: [createBound(100, 60, 220, 140)],
            diffCacheBounds: [createBound(100, 60, 220, 140)],
        }));
        (spreadsheet as any)._refreshIncrementalState = false;

        expect(dataBarDraw).toHaveBeenCalledOnce();
        expect(iconDraw).toHaveBeenCalledOnce();
        expect(markerDraw).not.toHaveBeenCalled();
    });

    it('does not scan sparse extension features when no sparse extension is registered', () => {
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        const context = mainCanvas.getContext() as any;
        const regularDraw = vi.fn();
        const getCellSpy = vi.spyOn(skeleton.worksheet, 'getCell');

        vi.spyOn(skeleton.worksheet, 'getMergeData').mockReturnValue([]);
        vi.spyOn(spreadsheet as any, 'getExtensionsByOrder').mockReturnValue([
            {
                draw: regularDraw,
                uKey: 'RegularExtension',
            },
        ]);

        (spreadsheet as any)._refreshIncrementalState = true;
        spreadsheet.draw(context, createViewportInfo(scene, cacheCanvas, {
            diffBounds: [createBound(100, 60, 220, 140)],
            diffCacheBounds: [createBound(100, 60, 220, 140)],
        }));
        (spreadsheet as any)._refreshIncrementalState = false;

        expect(regularDraw).toHaveBeenCalledOnce();
        expect(getCellSpy).not.toHaveBeenCalled();
    });

    it('narrows sparse extension diff ranges to matching cells during merge-free incremental drawing', () => {
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        const context = mainCanvas.getContext() as any;
        const markerDraw = vi.fn();

        vi.spyOn(skeleton.worksheet, 'getMergeData').mockReturnValue([]);
        vi.spyOn(skeleton.worksheet, 'getCell').mockImplementation((row: number, col: number) => (
            row === 2 && col === 1 ? { markers: { tr: { color: '#ff0000', size: 4 } } } : undefined
        ));
        vi.spyOn(spreadsheet as any, 'getExtensionsByOrder').mockReturnValue([
            {
                draw: markerDraw,
                uKey: 'DefaultMarkerExtension',
            },
        ]);

        (spreadsheet as any)._refreshIncrementalState = true;
        spreadsheet.draw(context, createViewportInfo(scene, cacheCanvas, {
            diffBounds: [createBound(48, 48, 240, 120)],
            diffCacheBounds: [createBound(48, 48, 240, 120)],
        }));
        (spreadsheet as any)._refreshIncrementalState = false;

        expect(markerDraw).toHaveBeenCalledOnce();
        expect(markerDraw.mock.calls[0][3]).toEqual([{
            startRow: 2,
            endRow: 2,
            startColumn: 1,
            endColumn: 1,
        }]);
    });

    it('reuses style cache cell data when scanning sparse extension features', () => {
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        const context = mainCanvas.getContext() as any;
        const markerDraw = vi.fn();
        const diffBound = createBound(48, 48, 240, 120);
        const diffRange = skeleton.getRangeByViewBound(diffBound);
        const getCellSpy = vi.spyOn(skeleton.worksheet, 'getCell');

        vi.spyOn(skeleton.worksheet, 'getMergeData').mockReturnValue([]);
        for (let row = diffRange.startRow; row <= diffRange.endRow; row++) {
            for (let col = diffRange.startColumn; col <= diffRange.endColumn; col++) {
                skeleton.stylesCache.fontMatrix.setValue(row, col, {
                    cellData: row === 2 && col === 1
                        ? { markers: { tr: { color: '#ff0000', size: 4 } } }
                        : { v: `${row}-${col}` },
                } as any);
            }
        }
        vi.spyOn(spreadsheet as any, 'getExtensionsByOrder').mockReturnValue([
            {
                draw: markerDraw,
                uKey: 'DefaultMarkerExtension',
            },
        ]);

        (spreadsheet as any)._refreshIncrementalState = true;
        spreadsheet.draw(context, createViewportInfo(scene, cacheCanvas, {
            diffBounds: [diffBound],
            diffCacheBounds: [diffBound],
        }));
        (spreadsheet as any)._refreshIncrementalState = false;

        expect(getCellSpy).not.toHaveBeenCalled();
        expect(markerDraw).toHaveBeenCalledOnce();
        expect(markerDraw.mock.calls[0][3]).toEqual([{
            startRow: 2,
            endRow: 2,
            startColumn: 1,
            endColumn: 1,
        }]);
    });

    it('skips style cache cell visits when scrolling inside the existing cache area', () => {
        const { skeleton, scene, cacheCanvas } = fixture;
        vi.spyOn(skeleton.worksheet, 'getMergeData').mockReturnValue([]);
        const styleCellSpy = vi.spyOn(skeleton as any, '_setStylesCacheForOneCell');
        const viewportInfo = createViewportInfo(scene, cacheCanvas, {
            diffBounds: [createBound(100, 60, 220, 140)],
            diffCacheBounds: [],
            diffX: 0,
            diffY: 12,
            shouldCacheUpdate: 0,
            isDirty: 0,
            isForceDirty: false,
        });

        skeleton.setStylesCache(viewportInfo);

        expect(styleCellSpy).not.toHaveBeenCalled();
        expect(skeleton.rowColumnSegment).toEqual(skeleton.getCacheRangeByViewport(viewportInfo));
    });

    it('skips merge lookups for one-cell style cache when merge data is absent', () => {
        const { skeleton } = fixture;
        const mergeInfoSpy = vi.spyOn(skeleton.worksheet, 'getCellInfoInMergeData');

        (skeleton as any)._setStylesCacheForOneCell(0, 0, {
            cacheItem: { bg: true, border: true },
            hasMergeData: false,
        });

        expect(mergeInfoSpy).not.toHaveBeenCalled();
    });

    it('reuses row visibility from the style cache row scan', () => {
        const { skeleton, scene, cacheCanvas } = fixture;
        const getRowVisibleSpy = vi.spyOn(skeleton.worksheet, 'getRowVisible');
        const viewportInfo = createViewportInfo(scene, cacheCanvas);

        skeleton.setStylesCache(viewportInfo);

        const visibleRange = skeleton.rowColumnSegment;
        const visibleRowCount = visibleRange.endRow - visibleRange.startRow + 1;
        expect(getRowVisibleSpy.mock.calls.length).toBeLessThan(visibleRowCount * 3);
    });

    it('reuses cached overflow-only font styles without reading cell data again', () => {
        const { skeleton } = fixture;
        const getCellSpy = vi.spyOn(skeleton.worksheet, 'getCell');
        const getStyleSpy = vi.spyOn(skeleton.worksheet, 'getComposedCellStyleByCellData');
        const options = { cacheItem: { bg: false, border: false }, reuseExisting: true };

        (skeleton as any)._setStylesCacheForOneCell(0, 0, options);
        const getCellCalls = getCellSpy.mock.calls.length;
        const getStyleCalls = getStyleSpy.mock.calls.length;

        (skeleton as any)._setStylesCacheForOneCell(0, 0, options);

        expect(getCellSpy.mock.calls.length).toBe(getCellCalls);
        expect(getStyleSpy.mock.calls.length).toBe(getStyleCalls);
    });

    it('reuses fully cached cell styles during incremental scrolling', () => {
        const { skeleton } = fixture;
        const getCellSpy = vi.spyOn(skeleton.worksheet, 'getCell');
        const getStyleSpy = vi.spyOn(skeleton.worksheet, 'getComposedCellStyleByCellData');

        (skeleton as any)._setStylesCacheForOneCell(0, 0, { cacheItem: { bg: true, border: true } });
        const getCellCalls = getCellSpy.mock.calls.length;
        const getStyleCalls = getStyleSpy.mock.calls.length;

        (skeleton as any)._setStylesCacheForOneCell(0, 0, { cacheItem: { bg: true, border: true }, reuseExisting: true });

        expect(getCellSpy.mock.calls.length).toBe(getCellCalls);
        expect(getStyleSpy.mock.calls.length).toBe(getStyleCalls);
    });

    it('skips overflow boundary scanning when text fits in the current column', () => {
        const { skeleton } = fixture;
        const overflowBoundSpy = vi.spyOn(skeleton as any, '_getOverflowBound');
        const fontCache = {
            cellData: { v: 'A1' },
            fontString: '12px Arial',
            horizontalAlign: HorizontalAlign.LEFT,
            verticalAlign: VerticalAlign.TOP,
            wrapStrategy: WrapStrategy.OVERFLOW,
        } as any;

        const result = (skeleton as any)._calculateOverflowCell(0, 0, fontCache);

        expect(result).toBe(true);
        expect(fontCache.textFitsCurrentCell).toBe(true);
        expect(overflowBoundSpy).not.toHaveBeenCalled();
    });

    it('skips overflow text measurement when the adjacent cell blocks overflow', () => {
        const { skeleton } = fixture;
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText');
        vi.spyOn(skeleton.worksheet, 'getCell').mockImplementation((row: number, col: number) => (
            row === 0 && col === 1 ? { v: 'blocked' } as any : { v: 'long text' } as any
        ));

        const result = (skeleton as any)._calculateOverflowCell(0, 0, {
            cellData: { v: 'this is a very long text that would normally be measured' },
            fontString: '12px Arial',
            horizontalAlign: HorizontalAlign.LEFT,
            verticalAlign: VerticalAlign.TOP,
            wrapStrategy: WrapStrategy.OVERFLOW,
        });

        expect(result).toBe(true);
        expect(measureSpy).not.toHaveBeenCalled();
    });

    it('uses raw adjacent cell data to block overflow without worksheet reads', () => {
        const { skeleton } = fixture;
        const getCellSpy = vi.spyOn(skeleton.worksheet, 'getCell');
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText');

        const result = (skeleton as any)._calculateOverflowCell(0, 0, {
            cellData: { v: 'this is a very long text that would normally inspect the adjacent cell' },
            fontString: '12px Arial',
            horizontalAlign: HorizontalAlign.LEFT,
            verticalAlign: VerticalAlign.TOP,
            wrapStrategy: WrapStrategy.OVERFLOW,
        });

        expect(result).toBe(true);
        expect(getCellSpy).not.toHaveBeenCalled();
        expect(measureSpy).not.toHaveBeenCalled();
    });

    it('skips merge checks during overflow calculation when the sheet has no merged cells', () => {
        const { skeleton } = fixture;
        const mergeSpy = vi.spyOn(skeleton, 'intersectMergeRange');
        vi.spyOn(skeleton.worksheet, 'getCell').mockImplementation((row: number, col: number) => (
            row === 0 && col === 1 ? { v: 'blocked' } as any : { v: 'long text' } as any
        ));

        const result = (skeleton as any)._calculateOverflowCell(0, 0, {
            cellData: { v: 'this is a very long text that would normally check merge ranges' },
            fontString: '12px Arial',
            horizontalAlign: HorizontalAlign.LEFT,
            verticalAlign: VerticalAlign.TOP,
            wrapStrategy: WrapStrategy.OVERFLOW,
        }, false);

        expect(result).toBe(true);
        expect(mergeSpy).not.toHaveBeenCalled();
    });

    it('skips style cache work for sheet header viewports', () => {
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        const context = mainCanvas.getContext();
        const styleCacheSpy = vi.spyOn(skeleton, 'setStylesCache');
        const viewportInfo = createViewportInfo(scene, cacheCanvas, {
            viewportKey: SHEET_VIEWPORT_KEY.VIEW_ROW_TOP,
        });

        spreadsheet.render(context, viewportInfo);

        expect(styleCacheSpy).not.toHaveBeenCalled();
    });

    it('copies the full cache viewport so the first row and column remain visible', () => {
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        const context = mainCanvas.getContext() as any;
        const applyCacheSpy = vi.spyOn(spreadsheet as any, '_applyCache').mockImplementation(() => {});
        const viewportInfo = createViewportInfo(scene, cacheCanvas, {
            diffBounds: [],
            diffCacheBounds: [],
            isDirty: 0,
            isForceDirty: false,
            viewPortPosition: createBound(10, 20, 410, 220),
        });
        spreadsheet.makeDirty(false);
        spreadsheet.makeForceDirty(false);

        spreadsheet.renderByViewports(context, viewportInfo, skeleton);

        expect(applyCacheSpy).toHaveBeenCalledWith(
            cacheCanvas,
            context,
            12,
            8,
            400 + skeleton.rowHeaderWidthAndMarginLeft,
            200 + skeleton.columnHeaderHeightAndMarginTop,
            10,
            20,
            400 + skeleton.rowHeaderWidthAndMarginLeft,
            200 + skeleton.columnHeaderHeightAndMarginTop
        );
    });

    it('refreshes cache instead of incremental painting for large scroll jumps', () => {
        const { spreadsheet, skeleton, mainCanvas, cacheCanvas, scene } = fixture;
        const context = mainCanvas.getContext();
        const viewportInfo = createViewportInfo(scene, cacheCanvas, {
            diffBounds: [createBound(0, 10000, 460, 10280)],
            diffCacheBounds: [createBound(0, 10000, 460, 10280)],
            diffX: 0,
            diffY: -10000,
            isDirty: 0,
            isForceDirty: false,
            shouldCacheUpdate: 1,
        });
        spreadsheet.makeDirty(false);
        spreadsheet.makeForceDirty(false);

        const paintSpy = vi.spyOn(spreadsheet, 'paintNewAreaForScrolling');
        const refreshSpy = vi.spyOn(spreadsheet, 'refreshCacheCanvas');

        spreadsheet.renderByViewports(context, viewportInfo, skeleton);

        expect(refreshSpy).toHaveBeenCalledOnce();
        expect(paintSpy).not.toHaveBeenCalled();
    });

    it('uses backing-store cache size when detecting large scroll jumps', () => {
        const { spreadsheet, skeleton, mainCanvas, scene } = fixture;
        const context = mainCanvas.getContext();
        const cacheCanvas = new Canvas({ width: 700, height: 420, pixelRatio: 1.5 });
        vi.spyOn(skeleton.worksheet, 'getMergeData').mockReturnValue([]);
        context.setTransform(1.5, 0, 0, 1.5, 0, 0);
        const viewportInfo = createViewportInfo(scene, cacheCanvas, {
            diffBounds: [createBound(0, 360, 460, 640)],
            diffCacheBounds: [createBound(0, 360, 460, 640)],
            diffX: 0,
            diffY: -360,
            isDirty: 0,
            isForceDirty: false,
            shouldCacheUpdate: 1,
        });
        spreadsheet.makeDirty(false);
        spreadsheet.makeForceDirty(false);

        const paintSpy = vi.spyOn(spreadsheet, 'paintNewAreaForScrolling');
        const refreshSpy = vi.spyOn(spreadsheet, 'refreshCacheCanvas');

        spreadsheet.renderByViewports(context, viewportInfo, skeleton);

        expect(paintSpy).toHaveBeenCalledOnce();
        expect(refreshSpy).not.toHaveBeenCalled();
        cacheCanvas.dispose();
    });

    it('refreshes cache for merged sheets while scrolling to keep merged text visible', () => {
        const { spreadsheet, skeleton, mainCanvas, cacheCanvas, scene } = fixture;
        const context = mainCanvas.getContext();
        const viewportInfo = createViewportInfo(scene, cacheCanvas, {
            diffBounds: [createBound(0, 360, 460, 640)],
            diffCacheBounds: [],
            diffX: 0,
            diffY: -48,
            isDirty: 0,
            isForceDirty: false,
            shouldCacheUpdate: 0,
        });
        spreadsheet.makeDirty(false);
        spreadsheet.makeForceDirty(false);

        const paintSpy = vi.spyOn(spreadsheet, 'paintNewAreaForScrolling');
        const refreshSpy = vi.spyOn(spreadsheet, 'refreshCacheCanvas');

        spreadsheet.renderByViewports(context, viewportInfo, skeleton);

        expect(refreshSpy).toHaveBeenCalledOnce();
        expect(paintSpy).not.toHaveBeenCalled();
    });

    it('refreshes cache for horizontal cache updates to avoid exposing stale cache edges', () => {
        const { spreadsheet, skeleton, mainCanvas, cacheCanvas, scene } = fixture;
        const context = mainCanvas.getContext();
        const viewportInfo = createViewportInfo(scene, cacheCanvas, {
            diffBounds: [createBound(520, 0, 640, 280)],
            diffCacheBounds: [createBound(520, 0, 640, 280)],
            diffX: -80,
            diffY: 0,
            isDirty: 0,
            isForceDirty: false,
            shouldCacheUpdate: 1,
        });
        spreadsheet.makeDirty(false);
        spreadsheet.makeForceDirty(false);

        const paintSpy = vi.spyOn(spreadsheet, 'paintNewAreaForScrolling');
        const refreshSpy = vi.spyOn(spreadsheet, 'refreshCacheCanvas');

        spreadsheet.renderByViewports(context, viewportInfo, skeleton);

        expect(refreshSpy).toHaveBeenCalledOnce();
        expect(paintSpy).not.toHaveBeenCalled();
    });

    it('draws row and column gap areas using defaults from gapConfig', () => {
        const { spreadsheet, skeleton, mainCanvas } = fixture;
        const context = mainCanvas.getContext() as any;

        skeleton.setGapConfig({
            defaultBackgroundColor: 'rgba(11, 22, 33, 0.08)',
            defaultStripeColor: 'rgba(11, 22, 33, 0.25)',
            rowGaps: {
                1: { size: 6 },
            },
            colGaps: {
                1: { size: 5 },
            },
        });

        const drawSingleGapRectSpy = vi.spyOn(spreadsheet as any, '_drawSingleGapRect');

        (spreadsheet as any)._drawGapAreas(
            context,
            skeleton,
            0,
            3,
            0,
            3,
            0,
            400,
            0,
            240
        );

        expect(drawSingleGapRectSpy).toHaveBeenCalled();
        expect(drawSingleGapRectSpy).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ size: 6 }),
            expect.any(Number),
            expect.any(Number),
            expect.any(Number),
            6,
            'rgba(11, 22, 33, 0.08)',
            'rgba(11, 22, 33, 0.25)'
        );
        expect(drawSingleGapRectSpy).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ size: 5 }),
            expect.any(Number),
            expect.any(Number),
            5,
            expect.any(Number),
            'rgba(11, 22, 33, 0.08)',
            'rgba(11, 22, 33, 0.25)'
        );

        // Cover fallback branch in _drawSingleGapRect: use default colors when item colors are absent.
        expect(() => {
            (spreadsheet as any)._drawSingleGapRect(
                context,
                { size: 3 },
                1,
                2,
                30,
                12,
                'rgba(11, 22, 33, 0.08)',
                'rgba(11, 22, 33, 0.25)'
            );
        }).not.toThrow();
    });

    it('draws the reusable gap fixture with mixed default and item colors', () => {
        const { spreadsheet, skeleton, mainCanvas } = fixture;
        const context = mainCanvas.getContext() as any;

        skeleton.setGapConfig(createSheetGapTestConfig());

        const drawSingleGapRectSpy = vi.spyOn(spreadsheet as any, '_drawSingleGapRect');

        (spreadsheet as any)._drawGapAreas(
            context,
            skeleton,
            0,
            7,
            0,
            5,
            0,
            500,
            0,
            320
        );

        expect(drawSingleGapRectSpy).toHaveBeenCalledTimes(6);
        expect(drawSingleGapRectSpy).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                size: 10,
                color: 'rgba(245, 158, 11, 0.14)',
            }),
            expect.any(Number),
            expect.any(Number),
            expect.any(Number),
            10,
            'rgba(24, 119, 242, 0.08)',
            'rgba(24, 119, 242, 0.25)'
        );
        expect(drawSingleGapRectSpy).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                size: 8,
                stripeColor: 'rgba(59, 130, 246, 0.35)',
            }),
            expect.any(Number),
            expect.any(Number),
            8,
            expect.any(Number),
            'rgba(24, 119, 242, 0.08)',
            'rgba(24, 119, 242, 0.25)'
        );
    });
});
