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

import type { IDocumentData, IStyleData, IWorkbookData, Workbook } from '@univerjs/core';
import {
    BooleanNumber,
    BorderStyleTypes,
    createSheetGapTestConfig,
    CustomRangeType,
    HorizontalAlign,
    ILogService,
    IUniverInstanceService,
    LocaleType,
    LogLevel,
    ObjectMatrix,
    RANGE_TYPE,
    ThemeService,
    Univer,
    UniverInstanceType,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IBoundRectNoAngle, IViewportInfo } from '../../../basics/vector2';
import { setupRenderTestEnv } from '../../../__tests__/render-test-utils';
import { Vector2 } from '../../../basics/vector2';
import { Canvas } from '../../../canvas';
import { Engine } from '../../../engine';
import { MAIN_VIEW_PORT_KEY, Scene } from '../../../scene';
import { Viewport } from '../../../viewport';
import { FontCache } from '../../docs/layout/shaping-engine/font-cache';
import { Background } from '../extensions/background';
import { Border } from '../extensions/border';
import { Font } from '../extensions/font';
import { SHEET_EXTENSION_TYPE, SheetExtension } from '../extensions/sheet-extension';
import { SHEET_VIEWPORT_KEY } from '../interfaces';
import {
    convertTransformToOffsetX,
    convertTransformToOffsetY,
    getShrinkToFitScale,
    scaleDocumentDataForShrinkToFit,
    SpreadsheetSkeleton,
} from '../sheet.render-skeleton';
import { Spreadsheet } from '../spreadsheet';
import { createDocumentModelWithStyle } from '../util';

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

function createFixture(data: IWorkbookData = workbookDataFactory()): IFixture {
    const renderEnv = setupRenderTestEnv();

    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, data);
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

class RenderOrderProbe extends SheetExtension {
    drawCount = 0;

    constructor(key: string, zIndex: number, type: SHEET_EXTENSION_TYPE) {
        super();
        this.uKey = key;
        this.Z_INDEX = zIndex;
        this.type = type;
    }

    override draw() {
        this.drawCount++;
    }
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

    it.each(['invalidate', 'clear'])('rejects viewport reuse after a font metrics %s without font load events', (action) => {
        const { spreadsheet, mainCanvas, scene, cacheCanvas } = fixture;
        const info = createViewportInfo(scene, cacheCanvas);
        spreadsheet.render(mainCanvas.getContext(), info);
        expect(spreadsheet.canReuseViewportCache()).toBe(true);

        if (action === 'invalidate') {
            FontCache.invalidateMetrics(() => false);
        } else {
            FontCache.clearFontMeasureCache('12px Arial');
        }
        expect(spreadsheet.canReuseViewportCache()).toBe(false);

        spreadsheet.render(mainCanvas.getContext(), info);
        expect(spreadsheet.canReuseViewportCache()).toBe(true);
    });

    it.each([
        { reset: 'range', key: 't', row: 2, col: 3 },
        { reset: 'range', key: 'r', row: 3, col: 3 },
        { reset: 'range', key: 'b', row: 3, col: 2 },
        { reset: 'range', key: 'l', row: 2, col: 2 },
        { reset: 'all', key: 't', row: 2, col: 3 },
        { reset: 'all', key: 'r', row: 3, col: 3 },
        { reset: 'all', key: 'b', row: 3, col: 2 },
        { reset: 'all', key: 'l', row: 2, col: 2 },
    ] as const)('refreshes a cached merged $key edge after $reset invalidation', ({ reset, key, row, col }) => {
        disposeFixture(fixture);
        const data = workbookDataFactory();
        for (let r = 2; r <= 3; r++) {
            for (let c = 2; c <= 3; c++) {
                const cells = data.sheets['sheet-1'].cellData!;
                (cells[r] ??= {})[c] = {
                    v: r === 2 && c === 2 ? 'merged title' : undefined,
                    s: {
                        bg: { rgb: '#fef3c7' },
                        bd: Object.fromEntries(['t', 'r', 'b', 'l'].map((side) => [side, {
                            s: BorderStyleTypes.THIN,
                            cl: { rgb: '#334455' },
                        }])),
                    },
                };
            }
        }
        fixture = createFixture(data);
        const { skeleton, scene, cacheCanvas } = fixture;
        const info = createViewportInfo(scene, cacheCanvas);
        skeleton.setStylesCache(info);
        expect(skeleton.stylesCache.border?.getValue(row, col)?.[key]).toEqual(expect.objectContaining({ color: '#334455' }));

        const previous = skeleton.worksheet.getCellRaw(row, col)!;
        const previousStyle = previous.s as IStyleData;
        skeleton.worksheet.getCellMatrix().setValue(row, col, {
            ...previous,
            s: {
                ...previousStyle,
                bd: {
                    ...previousStyle.bd,
                    [key]: {
                        s: BorderStyleTypes.DOUBLE,
                        cl: { rgb: '#be123c' },
                    },
                },
            },
        });
        if (reset === 'range') {
            skeleton.resetRangeCache([{ startRow: row, endRow: row, startColumn: col, endColumn: col }]);
        } else {
            skeleton.resetCache();
        }
        skeleton.setStylesCache({ ...info, isDirty: 0, shouldCacheUpdate: 0, diffX: 0.2 });
        expect(skeleton.stylesCache.border?.getValue(row, col)?.[key]).toEqual(expect.objectContaining({
            style: BorderStyleTypes.DOUBLE,
            color: '#be123c',
        }));
        const opposites = {
            t: { row: 3, col: 3, key: 'b' },
            b: { row: 2, col: 2, key: 't' },
            l: { row: 3, col: 3, key: 'r' },
            r: { row: 2, col: 2, key: 'l' },
        };
        const opposite = opposites[key];
        expect(skeleton.stylesCache.border?.getValue(opposite.row, opposite.col)?.[opposite.key])
            .toEqual(expect.objectContaining({ color: '#334455' }));
    });

    it.each([false, true])('keeps consumer extensions ordered around native background, text and border draws, repair=%s', (repair) => {
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        expect(spreadsheet.backgroundExtension).toBeInstanceOf(Background);
        expect(spreadsheet.borderExtension).toBeInstanceOf(Border);
        const background = new RenderOrderProbe('ConsumerBackground', 1, SHEET_EXTENSION_TYPE.BACKGROUND);
        const early = new RenderOrderProbe('ConsumerBeforeText', 25, SHEET_EXTENSION_TYPE.GRID);
        const late = new RenderOrderProbe('ConsumerAfterBorder', 70, SHEET_EXTENSION_TYPE.GRID);
        spreadsheet.register(background, early, late);
        const backgroundDraw = vi.spyOn(background, 'draw');
        const earlyDraw = vi.spyOn(early, 'draw');
        const lateDraw = vi.spyOn(late, 'draw');
        const textDraw = vi.spyOn(spreadsheet.fontExtension, 'draw');
        const borderDraw = vi.spyOn(spreadsheet.borderExtension, 'draw');
        const info = createViewportInfo(scene, cacheCanvas);
        skeleton.setStylesCache(info);
        spreadsheet.draw(mainCanvas.getContext(), info, repair);

        expect(backgroundDraw).toHaveBeenCalled();
        expect(earlyDraw).toHaveBeenCalledOnce();
        expect(lateDraw).toHaveBeenCalledOnce();
        expect(backgroundDraw.mock.invocationCallOrder.at(-1)).toBeLessThan(earlyDraw.mock.invocationCallOrder[0]);
        expect(earlyDraw.mock.invocationCallOrder[0]).toBeLessThan(textDraw.mock.invocationCallOrder[0]);
        expect(textDraw.mock.invocationCallOrder[0]).toBeLessThan(borderDraw.mock.invocationCallOrder[0]);
        expect(borderDraw.mock.invocationCallOrder[0]).toBeLessThan(lateDraw.mock.invocationCallOrder[0]);
    });

    it.each(['cache', 'swapped-cache', 'stale-cache', 'main', 'mac', 'printing', 'disabled'])('limits native gridline interior repair to the current Linux cache: %s', (mode) => {
        const { spreadsheet, skeleton, scene, viewport, cacheCanvas, mainCanvas } = fixture;
        const info = createViewportInfo(scene, cacheCanvas);
        skeleton.setStylesCache(info);
        const previousCache = viewport.canvas!;
        if (mode === 'swapped-cache') {
            viewport.swapCacheCanvas(cacheCanvas);
        }
        let canvas = viewport.canvas!;
        if (mode === 'main') {
            canvas = mainCanvas;
        } else if (mode === 'stale-cache') {
            canvas = cacheCanvas;
        }
        const context = canvas.getContext();
        vi.spyOn(context, 'getSystemType').mockReturnValue(mode === 'mac' ? 'Mac' : 'Linux');
        if (mode === 'printing') {
            context.__mode = 'printing';
        }
        if (mode === 'disabled') {
            vi.spyOn(spreadsheet, 'allowCache', 'get').mockReturnValue(false);
        }
        const repair = vi.spyOn(spreadsheet as unknown as {
            _repairGridlineStroke: (...args: unknown[]) => void;
        }, '_repairGridlineStroke');
        try {
            spreadsheet.draw(context, info);
        } finally {
            viewport.swapCacheCanvas(previousCache);
        }
        expect(repair.mock.calls.length > 0).toBe(mode === 'cache' || mode === 'swapped-cache');
    });

    it('updates the mixed screen gridline color after theme changes', () => {
        const { scene, skeleton, viewport } = fixture;
        const themeService = fixture.univer.__getInjector().get(ThemeService);
        const nativeContext = viewport.canvas!.getCanvasEle().getContext('2d') as CanvasRenderingContext2D & {
            __getEvents: () => Array<{ type: string; props: Record<string, unknown> }>;
            __clearEvents: () => void;
        };
        const getStrokeStyles = () => nativeContext.__getEvents()
            .filter((event) => event.type === 'strokeStyle')
            .map((event) => event.props.value);

        nativeContext.__clearEvents();
        skeleton.updateVisibleRange(viewport.calcViewportInfo());
        scene.makeDirty(true);
        scene.render();
        expect(getStrokeStyles()).toContain('#d5d7dc');

        const theme = themeService.getCurrentTheme();
        themeService.setTheme({
            ...theme,
            gray: {
                ...theme.gray,
                200: '#ccddee',
                900: '#112233',
            },
        });

        nativeContext.__clearEvents();
        scene.render();
        expect(getStrokeStyles()).toContain('#bfd0e1');
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

    it('applies document hyperlink styling to rich-text cells', () => {
        const { skeleton, workbook } = fixture;
        const worksheet = workbook.getActiveSheet()!;
        const document = createDocumentModelWithStyle('Univer', {}).getSnapshot();
        document.body!.customRanges = [{
            startIndex: 0,
            endIndex: 5,
            rangeId: 'sheet-link',
            rangeType: CustomRangeType.HYPERLINK,
        }];
        const cell = { p: document };
        const style = worksheet.getComposedCellStyleByCellData(0, 6, cell)!;

        skeleton._setFontStylesCache(0, 6, cell, style);

        const pages = skeleton.getFont(0, 6)!.documentSkeleton!.getSkeletonData()!.pages;
        const sections = pages.flatMap((page) => page.sections);
        const columns = sections.flatMap((section) => section.columns);
        const lines = columns.flatMap((column) => column.lines);
        const divides = lines.flatMap((line) => line.divides);
        const glyphs = divides.flatMap((divide) => divide.glyphGroup);
        const linkGlyph = glyphs.find((glyph) => glyph.content === 'U');

        expect(linkGlyph?.ts?.cl?.rgb).toBe('blue.600');
        expect(linkGlyph?.ts?.ul?.s).toBe(BooleanNumber.TRUE);
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

    it('skips font cache for sub-four-pixel rows without dropping visible styles or merged text', () => {
        const workbookData = workbookDataFactory();
        workbookData.id = 'sheet-render-short-row-workbook';
        workbookData.name = 'sheet-render-short-row-workbook';
        workbookData.sheets['sheet-1'].rowData = {
            ...workbookData.sheets['sheet-1'].rowData,
            2: { h: 2 },
            3: { h: 2 },
            4: { h: 2 },
        };
        workbookData.sheets['sheet-1'].cellData = {
            ...workbookData.sheets['sheet-1'].cellData,
            4: { 0: { v: 'compressed', s: 'style-bg-border' } },
        };

        const workbook = fixture.univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData);
        const worksheet = workbook.getActiveSheet()!;
        const skeleton = fixture.univer.__getInjector().createInstance(SpreadsheetSkeleton, worksheet, workbook.getStyles()).calculate() as SpreadsheetSkeleton;
        skeleton.setScene(fixture.scene);
        const viewportInfo = createViewportInfo(fixture.scene, fixture.cacheCanvas);

        skeleton.setStylesCache(viewportInfo, { scaleY: 1 });

        expect(skeleton.stylesCache.fontMatrix.getValue(4, 0)).toBeUndefined();
        expect(skeleton.stylesCache.backgroundPositions?.getValue(4, 0)).toBeDefined();
        expect(skeleton.stylesCache.border?.getValue(4, 0)).toBeDefined();
        expect(skeleton.stylesCache.fontMatrix.getValue(2, 2)).toBeDefined();

        skeleton.resetCache();
        skeleton.setStylesCache(viewportInfo, { scaleY: 2 });
        expect(skeleton.stylesCache.fontMatrix.getValue(4, 0)).toBeDefined();

        skeleton.resetCache();
        skeleton.setStylesCache(viewportInfo);
        expect(skeleton.stylesCache.fontMatrix.getValue(4, 0)).toBeDefined();
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
            3: { 2: { s: 'leftBorder' }, 3: { s: 'leftBorder' }, 4: { s: 'leftBorder' } },
            4: { 2: { s: 'leftBorder' }, 3: { s: 'leftBorder' }, 4: { s: 'leftBorder' } },
            5: { 2: { s: 'leftBorder' }, 3: { s: 'leftBorder' }, 4: { s: 'leftBorder' } },
        };

        const workbook = fixture.univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData);
        const worksheet = workbook.getActiveSheet()!;
        const skeleton = fixture.univer.__getInjector().createInstance(SpreadsheetSkeleton, worksheet, workbook.getStyles()).calculate() as SpreadsheetSkeleton;
        skeleton.setScene(fixture.scene);
        const borderStyleSpy = vi.spyOn(skeleton, '_setBorderStylesCache');
        skeleton.setStylesCache(createViewportInfo(fixture.scene, fixture.cacheCanvas));

        expect(skeleton.stylesCache.border?.getValue(3, 2)?.l).toEqual(expect.objectContaining({ color: '#000000' }));
        expect(skeleton.stylesCache.border?.getValue(4, 2)?.l).toEqual(expect.objectContaining({ color: '#000000' }));
        expect(skeleton.stylesCache.border?.getValue(5, 2)?.l).toEqual(expect.objectContaining({ color: '#000000' }));
        expect(borderStyleSpy.mock.calls.filter(([, , , options]) => options?.mergeRange)).toHaveLength(3);
    });

    it('renders spreadsheet with cache refresh and scrolling diff paths in scene viewport', () => {
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        const mainCtx = mainCanvas.getContext();

        const baseVpInfo = createViewportInfo(scene, cacheCanvas, {
            isDirty: 1,
            isForceDirty: false,
        });
        const stylesCacheSpy = vi.spyOn(skeleton, 'setStylesCache');

        spreadsheet.render(mainCtx as any, baseVpInfo);
        expect(stylesCacheSpy).toHaveBeenCalledWith(baseVpInfo, { scaleY: 1 });
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

    it.each([
        { system: 'Linux', browser: 'Safari', fractional: true, printing: false, corner: true, native: true },
        { system: 'Mac', browser: 'Safari', fractional: true, printing: false, corner: true, native: false },
        { system: 'Unknown system', browser: 'Safari', fractional: true, printing: false, corner: true, native: false },
        { system: 'Linux', browser: 'Chrome', fractional: true, printing: false, corner: true, native: false },
        { system: 'Linux', browser: 'Safari', fractional: false, printing: false, corner: true, native: false },
        { system: 'Linux', browser: 'Safari', fractional: true, printing: true, corner: true, native: false },
        { system: 'Linux', browser: 'Safari', fractional: true, printing: false, corner: false, native: false },
    ])('preserves native frozen-corner coverage without changing other cache paths: %j', (scenario) => {
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        const mainCtx = mainCanvas.getContext();
        vi.spyOn(mainCtx, 'getSystemType').mockReturnValue(scenario.system);
        vi.spyOn(mainCtx, 'getBrowserType').mockReturnValue(scenario.browser);
        mainCtx.__mode = scenario.printing ? 'printing' : 'rendering';
        const drawSpy = vi.spyOn(spreadsheet, 'draw');
        const refreshSpy = vi.spyOn(spreadsheet, 'refreshCacheCanvas');
        const info = createViewportInfo(scene, cacheCanvas, {
            viewportKey: scenario.corner ? SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP : SHEET_VIEWPORT_KEY.VIEW_MAIN,
            viewPortPosition: createBound(scenario.fractional ? 30.82 : 30, 16, 140, 67),
        });

        spreadsheet.render(mainCtx, info);

        expect(drawSpy.mock.calls.some(([ctx]) => ctx === mainCtx)).toBe(scenario.native);
        expect(refreshSpy).toHaveBeenCalledTimes(scenario.native ? 0 : 1);
        expect(drawSpy.mock.calls.filter(([ctx]) => ctx === mainCtx)).toHaveLength(scenario.native ? 1 : 0);
        expect(drawSpy.mock.calls.some(([ctx]) => ctx === cacheCanvas.getContext())).toBe(!scenario.native);
        skeleton.dispose();
    });

    it('rebuilds the frozen-corner bitmap once after native paints even on a clean return to integral bounds', () => {
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        const mainCtx = mainCanvas.getContext();
        vi.spyOn(mainCtx, 'getSystemType').mockReturnValue('Linux');
        vi.spyOn(mainCtx, 'getBrowserType').mockReturnValue('Safari');
        const drawSpy = vi.spyOn(spreadsheet, 'draw');
        const refreshSpy = vi.spyOn(spreadsheet, 'refreshCacheCanvas');
        spreadsheet.render(mainCtx, createViewportInfo(scene, cacheCanvas, {
            viewportKey: SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP,
            viewPortPosition: createBound(30, 16, 140, 67),
        }));
        expect(refreshSpy).toHaveBeenCalledOnce();
        drawSpy.mockClear();
        refreshSpy.mockClear();
        spreadsheet.makeDirty(false);
        const info = createViewportInfo(scene, cacheCanvas, {
            viewportKey: SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP,
            isDirty: 0,
            isForceDirty: false,
            shouldCacheUpdate: 0,
            diffBounds: [],
            diffCacheBounds: [],
            viewPortPosition: createBound(30.82, 16, 140, 67),
        });
        spreadsheet.render(mainCtx, info);
        spreadsheet.makeDirty(true);
        spreadsheet.render(mainCtx, info);
        expect(refreshSpy).not.toHaveBeenCalled();
        expect(drawSpy.mock.calls.filter(([ctx]) => ctx === mainCtx)).toHaveLength(2);

        spreadsheet.makeDirty(false);
        spreadsheet.makeForceDirty(false);
        drawSpy.mockClear();
        const clean = {
            ...info,
            isDirty: 0,
            isForceDirty: false,
            shouldCacheUpdate: 0,
            diffBounds: [],
            diffCacheBounds: [],
            diffX: 0,
            diffY: 0,
            viewPortPosition: createBound(30, 16, 140, 67),
        };
        spreadsheet.render(mainCtx, clean);
        expect(drawSpy.mock.calls.some(([ctx]) => ctx === mainCtx)).toBe(false);
        expect(refreshSpy).toHaveBeenCalledOnce();
        spreadsheet.makeDirty(false);
        spreadsheet.render(mainCtx, clean);
        expect(refreshSpy).toHaveBeenCalledOnce();
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
        const borderRanges = viewportInfo.diffBounds.map((bound) => skeleton.getRangeByViewBound(createBound(
            bound.left - 2,
            bound.top - 2,
            bound.right + 2,
            bound.bottom + 2
        )));
        expect(borderExtension.draw.mock.calls.at(-1)?.[4].viewRanges).toEqual(borderRanges);
        expect(borderExtension.draw.mock.calls.at(-1)?.[3]).toEqual(borderRanges);
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

        expect(spreadsheet.getDocuments()).toBeDefined();

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

    it('repaints text across the cleared incremental scroll bound', () => {
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        const context = mainCanvas.getContext();
        const viewportInfo = createViewportInfo(scene, cacheCanvas, {
            diffBounds: [createBound(46, 28, 118, 52)],
            diffX: 0,
            diffY: 24,
            isDirty: 0,
            isForceDirty: false,
        });

        skeleton.setStylesCache(createViewportInfo(scene, cacheCanvas));
        const fontExtension = new Font();
        spreadsheet.register(fontExtension);
        Reflect.set(spreadsheet, '_fontExtension', fontExtension);
        Reflect.set(skeleton, '_incrementalFontRenderRanges', [{
            startRow: 10,
            endRow: 10,
            startColumn: 0,
            endColumn: 0,
        }]);
        Reflect.set(spreadsheet, '_refreshIncrementalState', true);
        const renderFontSpy = vi.spyOn(
            fontExtension as unknown as { _renderFontEachCell: (...args: unknown[]) => void },
            '_renderFontEachCell'
        );

        spreadsheet.draw(context, viewportInfo);

        expect(renderFontSpy.mock.calls.some(([, row, column]) => row === 0 && column === 0)).toBe(true);
    });

    it('keeps full-row border candidates when a merged diagonal intersects the damaged area', () => {
        disposeFixture(fixture);
        const data = workbookDataFactory();
        const style = data.styles['style-bg-border'] as IStyleData;
        style.bd!.tl_br = { s: BorderStyleTypes.THIN, cl: { rgb: '#be123c' } };
        fixture = createFixture(data);
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        const info = createViewportInfo(scene, cacheCanvas, {
            diffBounds: [createBound(100, 60, 220, 140)],
            isDirty: 0,
            isForceDirty: false,
        });
        skeleton.setStylesCache(info);
        const border = vi.spyOn(spreadsheet.borderExtension, 'draw');
        (spreadsheet as any)._refreshIncrementalState = true;
        spreadsheet.draw(mainCanvas.getContext(), info);
        const cacheRange = skeleton.getCacheRangeByViewport(info);
        const expected = info.diffBounds.map((bound) => ({
            ...skeleton.getRangeByViewBound(bound),
            startColumn: cacheRange.startColumn,
            endColumn: cacheRange.endColumn,
        }));
        expect(border.mock.calls.at(-1)?.[4].viewRanges).toEqual(expected);
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

    it('repaints background extensions after clearing merged cell gridlines', () => {
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        const context = mainCanvas.getContext();
        const backgroundDraw = vi.fn();
        const gridDraw = vi.fn();
        const clearRectSpy = vi.spyOn(context, 'clearRect');
        const mergedRange = { startRow: 2, endRow: 3, startColumn: 2, endColumn: 3, rangeType: RANGE_TYPE.NORMAL };
        vi.spyOn(skeleton, 'getCurrentRowColumnSegmentMergeData').mockReturnValue([mergedRange]);
        vi.spyOn(skeleton.overflowCache, 'toNativeArray').mockReturnValue([]);
        vi.spyOn(spreadsheet as unknown as { getExtensionsByOrder: () => unknown[] }, 'getExtensionsByOrder').mockReturnValue([
            {
                type: SHEET_EXTENSION_TYPE.BACKGROUND,
                uKey: 'MockBackgroundExtension',
                draw: backgroundDraw,
            },
            {
                type: SHEET_EXTENSION_TYPE.GRID,
                uKey: 'MockGridExtension',
                draw: gridDraw,
            },
        ]);

        const viewportInfo = createViewportInfo(scene, cacheCanvas);
        skeleton.setStylesCache(viewportInfo);
        spreadsheet.draw(context, viewportInfo);

        expect(backgroundDraw).toHaveBeenCalledTimes(2);
        expect(backgroundDraw.mock.calls[1][3]).toEqual(expect.arrayContaining([mergedRange]));
        expect(clearRectSpy.mock.invocationCallOrder[0]).toBeLessThan(backgroundDraw.mock.invocationCallOrder[1]);
        expect(backgroundDraw.mock.invocationCallOrder[1]).toBeLessThan(gridDraw.mock.invocationCallOrder[0]);
    });

    it('clears overflow gridlines at integral physical pixels without changing stroke geometry or caller state', () => {
        const { spreadsheet, mainCanvas } = fixture;
        const context = mainCanvas.getContext();
        context.setTransform(1.5, 0, 0, 1.5, -162.5, 100.5);
        const clear = vi.spyOn(context, 'clearRect');
        const line = vi.spyOn(context, 'moveToByPrecision');
        const repaint = vi.fn();
        const ranges = [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }];
        (spreadsheet as any)._clearRectangle(context, [25], [54], ranges, repaint);

        expect(clear).toHaveBeenCalledWith(-162, 101, 81, 38);
        expect(line).toHaveBeenCalledWith(0, 0);
        expect(repaint).toHaveBeenCalledWith(ranges);
        expect(context.getTransform()).toMatchObject({ a: 1.5, d: 1.5, e: -162.5, f: 100.5 });
    });

    it.each(['printing', 'rotation'])('keeps the native gridline clear for %s', (mode) => {
        const { spreadsheet, mainCanvas } = fixture;
        const context = mainCanvas.getContext();
        if (mode === 'printing') {
            context.__mode = 'printing';
        } else {
            context.setTransform(1, 0.2, 0, 1, 0, 0);
        }
        const clear = vi.spyOn(context, 'clearRectByPrecision');
        (spreadsheet as any)._clearRectangle(context, [25], [54], [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }]);
        expect(clear).toHaveBeenCalledWith(0, 0, 54, 25);
    });

    it.each([false, true])('skips absent sparse extensions on merged sheets, repair=%s', (repair) => {
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        const context = mainCanvas.getContext() as any;
        const sparseDraw = vi.fn();
        const regularDraw = vi.fn();

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
        }), repair);
        (spreadsheet as any)._refreshIncrementalState = false;

        expect(sparseDraw).not.toHaveBeenCalled();
        expect(regularDraw).toHaveBeenCalledOnce();
    });

    it.each([false, true])('includes an off-strip merged feature through a visible cell, hidden=%s', (hidden) => {
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        const merge = { startRow: 0, endRow: 6, startColumn: 0, endColumn: 4 };
        const markerDraw = vi.fn();
        vi.spyOn(skeleton.worksheet, 'getMergeData').mockReturnValue([merge]);
        vi.spyOn(skeleton.worksheet, 'getMergedCellRange').mockReturnValue([merge]);
        if (hidden) {
            vi.spyOn(skeleton.worksheet, 'getRowVisible').mockImplementation((row) => row !== 1);
            vi.spyOn(skeleton.worksheet, 'getColVisible').mockImplementation((column) => column !== 0);
        }
        skeleton.stylesCache.fontMatrix.reset();
        vi.spyOn(skeleton.worksheet, 'getCell').mockImplementation((row, column) => (
            row === 0 && column === 0 ? { markers: { tr: { color: '#ff0000', size: 4 } } } : undefined
        ));
        vi.spyOn(spreadsheet as any, 'getExtensionsByOrder').mockReturnValue([{
            draw: markerDraw,
            uKey: 'DefaultMarkerExtension',
        }]);
        (spreadsheet as any)._refreshIncrementalState = true;
        spreadsheet.draw(mainCanvas.getContext(), createViewportInfo(scene, cacheCanvas, {
            diffBounds: [createBound(100, 60, 220, 140)],
            diffCacheBounds: [createBound(100, 60, 220, 140)],
        }), true);
        (spreadsheet as any)._refreshIncrementalState = false;

        expect(markerDraw).toHaveBeenCalledOnce();
        expect(markerDraw.mock.calls[0][3]).toContainEqual({
            startRow: hidden ? 2 : 1,
            endRow: hidden ? 2 : 1,
            startColumn: hidden ? 1 : 0,
            endColumn: hidden ? 1 : 0,
        });
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

    it.each([
        { axis: 'row', edge: 'cell', delta: 5 / 6 },
        { axis: 'column', edge: 'cell', delta: 5 / 6 },
        { axis: 'row', edge: 'stroke', delta: 1 },
        { axis: 'column', edge: 'stroke', delta: 1 },
    ])('includes the $axis $edge intersecting a repair edge', ({ axis, edge, delta }) => {
        disposeFixture(fixture);
        const data = workbookDataFactory();
        const sheet = data.sheets['sheet-1'];
        sheet.rowCount = 160;
        sheet.columnCount = 64;
        sheet.defaultRowHeight = 25;
        sheet.defaultColumnWidth = 54;
        sheet.columnHeader = { height: 24 };
        sheet.rowData = {};
        sheet.columnData = {};
        sheet.mergeData = [];
        sheet.cellData = { 13: { 3: { v: 'repair edge', s: 'style-bg-border' } } };
        fixture = createFixture(data);
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        cacheCanvas.setSize(1000, 760, 3);
        const context = mainCanvas.getContext();
        context.setTransform(6, 0, 0, 6, 0, 0);
        const damage = axis === 'row'
            ? createBound(46, 373 + delta, 700, 450)
            : createBound(261 + delta, 24, 500, 450);
        const viewportInfo = createViewportInfo(scene, cacheCanvas, {
            cacheBound: createBound(0, 0, 800, 1000),
            diffBounds: [damage],
            diffCacheBounds: [damage],
            diffX: axis === 'column' ? -1 : 0,
            diffY: axis === 'row' ? -1 : 0,
        });
        skeleton.setStylesCache(viewportInfo);
        const extension = edge === 'stroke' ? spreadsheet.borderExtension : spreadsheet.backgroundExtension;
        const draw = vi.spyOn(extension, 'draw');

        spreadsheet.paintNewAreaForScrolling(viewportInfo, {
            cacheCanvas,
            cacheCtx: cacheCanvas.getContext(),
            mainCtx: context,
            topOrigin: 0,
            leftOrigin: 0,
            bufferEdgeX: viewportInfo.bufferEdgeX,
            bufferEdgeY: viewportInfo.bufferEdgeY,
            rowHeaderWidthAndMarginLeft: skeleton.rowHeaderWidthAndMarginLeft,
            columnHeaderHeightAndMarginTop: skeleton.columnHeaderHeightAndMarginTop,
            scaleX: 6,
            scaleY: 6,
        });

        const ranges = draw.mock.calls.flatMap((call) => call[3]);
        expect(ranges.some((range) => range.startRow <= 13 && range.endRow >= 13
            && range.startColumn <= 3 && range.endColumn >= 3)).toBe(true);
    });

    it('keeps viewport ranges without recalculating styles for an unchanged cached viewport', () => {
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        skeleton.setStylesCache(createViewportInfo(scene, cacheCanvas));
        spreadsheet.makeDirty(false);
        spreadsheet.makeForceDirty(false);
        const styleSpy = vi.spyOn(skeleton, 'setStylesCache');
        const rangeSpy = vi.spyOn(skeleton, 'updateVisibleRange');
        const viewportInfo = createViewportInfo(scene, cacheCanvas, {
            isDirty: 0,
            isForceDirty: false,
            shouldCacheUpdate: 0,
        });

        spreadsheet.render(mainCanvas.getContext(), viewportInfo);

        expect(styleSpy).not.toHaveBeenCalled();
        expect(rangeSpy).toHaveBeenCalledWith(viewportInfo);
        expect(skeleton.rowColumnSegment).toEqual(skeleton.getCacheRangeByViewport(viewportInfo));
    });

    it.each(['dirty', 'uncached'])('calculates styles for a %s viewport even without scroll movement', (mode) => {
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        spreadsheet.makeForceDirty(false);
        spreadsheet.makeDirty(mode === 'dirty');
        const styleSpy = vi.spyOn(skeleton, 'setStylesCache');
        const viewportInfo = createViewportInfo(scene, cacheCanvas, {
            cacheCanvas: mode === 'uncached' ? undefined : cacheCanvas,
            isDirty: 0,
            isForceDirty: false,
            shouldCacheUpdate: 0,
        });

        spreadsheet.render(mainCanvas.getContext(), viewportInfo);

        expect(styleSpy).toHaveBeenCalledOnce();
    });

    it('skips style cache cell visits when scrolling inside the existing cache area', () => {
        const { skeleton, scene, cacheCanvas } = fixture;
        vi.spyOn(skeleton.worksheet, 'getMergeData').mockReturnValue([]);
        skeleton.setStylesCache(createViewportInfo(scene, cacheCanvas));
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

    it('reuses prepared member and merged styles while scrolling within the covered range', () => {
        const { skeleton, scene, cacheCanvas } = fixture;
        skeleton.setStylesCache(createViewportInfo(scene, cacheCanvas));
        const cachedStyle = skeleton.stylesCache.fontMatrix.getValue(1, 1);
        expect(cachedStyle).toBeDefined();
        const borderStyleSpy = vi.spyOn(skeleton, '_setBorderStylesCache');

        skeleton.setStylesCache(createViewportInfo(scene, cacheCanvas, {
            diffBounds: [createBound(100, 60, 220, 140)],
            diffCacheBounds: [createBound(100, 60, 220, 140)],
            diffX: 0,
            diffY: 12,
            shouldCacheUpdate: 1,
            isDirty: 0,
            isForceDirty: false,
        }));

        expect(skeleton.stylesCache.fontMatrix.getValue(1, 1)).toBe(cachedStyle);
        expect(borderStyleSpy).not.toHaveBeenCalled();
    });

    it('reuses a fully prepared merged anchor without recomposing its perimeter during scrolling', () => {
        const { skeleton, scene, cacheCanvas } = fixture;
        skeleton.setStylesCache(createViewportInfo(scene, cacheCanvas));
        const mergeRange = skeleton.worksheet.getMergeData()[0];
        const cachedFont = skeleton.stylesCache.fontMatrix.getValue(2, 2);
        const composed = vi.spyOn(skeleton.worksheet, 'getComposedCellStyleByCellData');
        const borders = vi.spyOn(skeleton as any, '_setMergeBorderProps');

        (skeleton as any)._setStylesCacheForOneCell(2, 2, { mergeRange, reuseExisting: true, hasMergeData: true });

        expect(composed).not.toHaveBeenCalled();
        expect(borders).not.toHaveBeenCalled();
        expect(skeleton.stylesCache.fontMatrix.getValue(2, 2)).toBe(cachedFont);
    });

    it('prepares all merged edges after the ordinary anchor was visited first', () => {
        const { skeleton } = fixture;
        const mergeRange = skeleton.worksheet.getMergeData()[0];
        (skeleton as any)._setStylesCacheForOneCell(2, 2, {
            cacheItem: { bg: true, border: true },
            hasMergeData: true,
            reuseExisting: true,
        });
        const borders = vi.spyOn(skeleton as any, '_setMergeBorderProps');
        (skeleton as any)._setStylesCacheForOneCell(2, 2, { mergeRange, reuseExisting: true, hasMergeData: true });
        expect(borders).toHaveBeenCalledTimes(4);
    });

    it('recomposes merged styles after a theme change even during a scroll preparation pass', () => {
        const { skeleton, scene, cacheCanvas } = fixture;
        skeleton.setStylesCache(createViewportInfo(scene, cacheCanvas));
        const mergeRange = skeleton.worksheet.getMergeData()[0];
        const composed = vi.spyOn(skeleton.worksheet, 'getComposedCellStyleByCellData');
        const themeService = fixture.univer.__getInjector().get(ThemeService);
        const theme = themeService.getCurrentTheme();
        themeService.setTheme({ ...theme, gray: { ...theme.gray, 200: '#ccddee' } });
        (skeleton as any)._setStylesCacheForOneCell(2, 2, { mergeRange, reuseExisting: true, hasMergeData: true });
        expect(composed).toHaveBeenCalled();
    });

    it('bounds dense background candidates to the damaged columns across many cached rows', () => {
        disposeFixture(fixture);
        const data = workbookDataFactory();
        const sheet = data.sheets['sheet-1'];
        sheet.columnCount = 64;
        sheet.mergeData = [];
        sheet.cellData = Object.fromEntries(Array.from({ length: 20 }, (_, row) => [row, Object.fromEntries(Array.from({ length: 64 }, (_, col) => [col, { s: { bg: { rgb: '#fef3c7' } } }]))]));
        fixture = createFixture(data);
        const { spreadsheet, skeleton, scene, cacheCanvas, mainCanvas } = fixture;
        const info = createViewportInfo(scene, cacheCanvas, { cacheBound: createBound(0, 0, 5000, 600) });
        skeleton.setStylesCache(info);
        const background = spreadsheet.backgroundExtension;
        const candidates = vi.spyOn(background, 'renderBGByCell');
        const damage = [{ startRow: 0, endRow: 19, startColumn: 20, endColumn: 21 }];

        background.draw(mainCanvas.getContext(), { scaleX: 1, scaleY: 1 }, skeleton, damage, {
            viewRanges: damage,
            checkOutOfViewBound: true,
            hasMergeData: false,
            viewportKey: 'viewMain',
        });

        expect(candidates).toHaveBeenCalledTimes(38);
        expect(candidates.mock.calls.every(([, , col]) => col === 20 || col === 21)).toBe(true);
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

    it('reuses styled cells without text during incremental scrolling', () => {
        const { skeleton } = fixture;
        const getCellSpy = vi.spyOn(skeleton.worksheet, 'getCell');
        const getStyleSpy = vi.spyOn(skeleton.worksheet, 'getComposedCellStyleByCellData');
        const options = { cacheItem: { bg: true, border: true }, reuseExisting: true };
        (skeleton as any)._setStylesCacheForOneCell(0, 4, options);
        expect(skeleton.stylesCache.fontMatrix.getValue(0, 4)).toBeUndefined();
        getCellSpy.mockClear();
        getStyleSpy.mockClear();

        (skeleton as any)._setStylesCacheForOneCell(0, 4, options);

        expect(getCellSpy).not.toHaveBeenCalled();
        expect(getStyleSpy).not.toHaveBeenCalled();
        expect(skeleton.stylesCache.backgroundPositions?.getValue(0, 4)).toBeDefined();
        expect(skeleton.stylesCache.border?.getValue(0, 4)).toBeDefined();
    });

    it('reuses a completely empty cell without creating visible styles', () => {
        const { skeleton } = fixture;
        const options = { cacheItem: { bg: true, border: true }, reuseExisting: true };
        (skeleton as any)._setStylesCacheForOneCell(15, 8, options);
        const getCellSpy = vi.spyOn(skeleton.worksheet, 'getCell');

        (skeleton as any)._setStylesCacheForOneCell(15, 8, options);

        expect(getCellSpy).not.toHaveBeenCalled();
        expect(skeleton.stylesCache.fontMatrix.getValue(15, 8)).toBeUndefined();
        expect(skeleton.stylesCache.backgroundPositions?.getValue(15, 8)).toBeUndefined();
        expect(skeleton.stylesCache.border?.getValue(15, 8)).toBeUndefined();
    });

    it.each(['range', 'all'])('invalidates cached text absence on %s cache reset', (reset) => {
        const { skeleton } = fixture;
        const options = { cacheItem: { bg: true, border: true }, reuseExisting: true };
        (skeleton as any)._setStylesCacheForOneCell(0, 4, options);
        if (reset === 'range') {
            skeleton.resetRangeCache([{ startRow: 0, endRow: 0, startColumn: 4, endColumn: 4 }]);
        } else {
            skeleton.resetCache();
        }
        const cell = skeleton.worksheet.getCellRaw(0, 4)!;
        skeleton.worksheet.getCellMatrix().setValue(0, 4, { ...cell, v: 'New text' });

        (skeleton as any)._setStylesCacheForOneCell(0, 4, options);

        expect(skeleton.stylesCache.fontMatrix.getValue(0, 4)?.cellData?.v).toBe('New text');
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

    it('clips merge repair to the exposed strip while retaining the merged text anchor', () => {
        const { spreadsheet, skeleton, mainCanvas, cacheCanvas, scene } = fixture;
        const context = mainCanvas.getContext();
        const mergeInfo = skeleton.getCellWithCoordByIndex(2, 2, false).mergeInfo;
        const mergedBound = createBound(
            mergeInfo.startX + skeleton.rowHeaderWidthAndMarginLeft,
            mergeInfo.startY + skeleton.columnHeaderHeightAndMarginTop,
            mergeInfo.endX + skeleton.rowHeaderWidthAndMarginLeft,
            mergeInfo.endY + skeleton.columnHeaderHeightAndMarginTop
        );
        const viewportInfo = createViewportInfo(scene, cacheCanvas, {
            diffBounds: [createBound(mergedBound.right - 8, mergedBound.top, mergedBound.right, mergedBound.bottom)],
            diffCacheBounds: [],
            diffX: 0,
            diffY: -8,
            isDirty: 0,
            isForceDirty: false,
            shouldCacheUpdate: 0,
        });
        spreadsheet.makeDirty(false);
        spreadsheet.makeForceDirty(false);

        const paintSpy = vi.spyOn(spreadsheet, 'paintNewAreaForScrolling');
        const refreshSpy = vi.spyOn(spreadsheet, 'refreshCacheCanvas');
        skeleton.setStylesCache({ ...viewportInfo, isDirty: 1, shouldCacheUpdate: 1 });
        const drawSpy = vi.spyOn(spreadsheet, 'draw');
        const fontSpy = vi.spyOn(spreadsheet.fontExtension, '_renderFontEachCell');
        const clear = vi.spyOn(cacheCanvas.getContext(), 'clearRect');

        spreadsheet.renderByViewports(context, viewportInfo, skeleton);

        expect(refreshSpy).not.toHaveBeenCalled();
        expect(paintSpy).toHaveBeenCalledOnce();
        const repair = drawSpy.mock.calls.find((call) => call[2]);
        expect(repair?.[1].diffBounds).toEqual(viewportInfo.diffBounds.map((bound) => createBound(
            bound.left - 2,
            bound.top - 2,
            bound.right + 2,
            bound.bottom + 2
        )));
        expect(clear).toHaveBeenCalledWith(mergeInfo.endX - 8 + 12, mergeInfo.startY + 8, 8, mergeInfo.endY - mergeInfo.startY);
        expect(fontSpy.mock.calls.some(([, row, col]) => row === 2 && col === 2)).toBe(true);
    });

    it('keeps a wide merged title incremental when only a narrow frozen strip is exposed', () => {
        const { spreadsheet, skeleton, mainCanvas, cacheCanvas, scene } = fixture;
        skeleton.worksheet.setMergeData([{ startRow: 0, endRow: 2, startColumn: 0, endColumn: 11 }]);
        const cacheBound = createBound(46, 28, 506, 118);
        const viewportInfo = createViewportInfo(scene, cacheCanvas, {
            viewportKey: SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP,
            cacheBound,
            diffBounds: [createBound(498, 28, 506, 118)],
            diffCacheBounds: [],
            diffX: -8,
            diffY: 0,
            isDirty: 0,
            isForceDirty: false,
            shouldCacheUpdate: 0,
        });
        skeleton.setStylesCache({ ...viewportInfo, isDirty: 1, shouldCacheUpdate: 1 });
        spreadsheet.makeDirty(false);
        spreadsheet.makeForceDirty(false);
        const refresh = vi.spyOn(spreadsheet, 'refreshCacheCanvas');
        const draw = vi.spyOn(spreadsheet, 'draw');
        const font = vi.spyOn(spreadsheet.fontExtension, '_renderFontEachCell');
        const clear = vi.spyOn(cacheCanvas.getContext(), 'clearRect');
        spreadsheet.renderByViewports(mainCanvas.getContext(), viewportInfo, skeleton);
        expect(refresh).not.toHaveBeenCalled();
        const repair = draw.mock.calls.find((call) => call[2]);
        expect(repair?.[1].diffBounds).toEqual([createBound(496, 26, 508, 102)]);
        expect(clear).toHaveBeenCalledWith(464, 8, 8, 72);
        expect(font.mock.calls.some(([, row, col]) => row === 0 && col === 0)).toBe(true);
    });

    it('retains whole-merge repair for fractional bitmap shifts', () => {
        const { spreadsheet, skeleton, mainCanvas, cacheCanvas, scene } = fixture;
        skeleton.worksheet.setMergeData([{ startRow: 0, endRow: 2, startColumn: 0, endColumn: 11 }]);
        const viewportInfo = createViewportInfo(scene, cacheCanvas, {
            cacheBound: createBound(46, 28, 506, 118),
            diffBounds: [createBound(498, 28, 506, 118)],
            diffCacheBounds: [],
            diffX: -0.5,
            diffY: 0,
            isDirty: 0,
            isForceDirty: false,
            shouldCacheUpdate: 0,
        });
        spreadsheet.makeDirty(false);
        spreadsheet.makeForceDirty(false);
        const refresh = vi.spyOn(spreadsheet, 'refreshCacheCanvas');
        const paint = vi.spyOn(spreadsheet, 'paintNewAreaForScrolling');
        spreadsheet.renderByViewports(mainCanvas.getContext(), viewportInfo, skeleton);
        expect(refresh).toHaveBeenCalledOnce();
        expect(paint).not.toHaveBeenCalled();
    });

    it('refreshes the cache when merge repair covers most of the cache area', () => {
        const { spreadsheet, skeleton, mainCanvas, cacheCanvas, scene } = fixture;
        const context = mainCanvas.getContext();
        const viewportInfo = createViewportInfo(scene, cacheCanvas, {
            diffBounds: [createBound(46, 28, 506, 240)],
            diffCacheBounds: [],
            diffX: 0,
            diffY: -80,
            isDirty: 0,
            isForceDirty: false,
            shouldCacheUpdate: 0,
        });
        spreadsheet.makeDirty(false);
        spreadsheet.makeForceDirty(false);
        skeleton.worksheet.setMergeData([
            { startRow: 0, endRow: 9, startColumn: 0, endColumn: 11, rangeType: RANGE_TYPE.NORMAL },
        ]);

        const paintSpy = vi.spyOn(spreadsheet, 'paintNewAreaForScrolling');
        const refreshSpy = vi.spyOn(spreadsheet, 'refreshCacheCanvas');

        spreadsheet.renderByViewports(context, viewportInfo, skeleton);

        expect(refreshSpy).toHaveBeenCalledOnce();
        expect(paintSpy).not.toHaveBeenCalled();
    });

    it('does not repaint merged cells outside the scroll diff', () => {
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

        const drawSpy = vi.spyOn(spreadsheet, 'draw').mockImplementation(() => {});

        spreadsheet.renderByViewports(context, viewportInfo, skeleton);

        expect(drawSpy).not.toHaveBeenCalled();
    });

    it('limits horizontal style work to exposed columns while preparing new backgrounds', () => {
        const { skeleton, scene, cacheCanvas } = fixture;
        const initial = createViewportInfo(scene, cacheCanvas, { cacheBound: createBound(0, 0, 300, 280) });
        skeleton.setStylesCache(initial);
        const cachedFont = skeleton.stylesCache.fontMatrix.getValue(0, 1);
        expect(skeleton.stylesCache.backgroundPositions?.getValue(0, 4)).toBeUndefined();
        const cacheBuilder = skeleton as unknown as { _setStylesCacheForOneCell(...args: unknown[]): void };
        const styleVisits = vi.spyOn(cacheBuilder, '_setStylesCacheForOneCell');
        const changed = createViewportInfo(scene, cacheCanvas, {
            cacheBound: createBound(72, 0, 460, 280),
            diffBounds: [createBound(440, 0, 460, 280)],
            diffCacheBounds: [createBound(300, 0, 460, 280)],
            diffX: -72,
            diffY: 0,
            isDirty: 0,
            isForceDirty: false,
            shouldCacheUpdate: 1,
        });
        skeleton.setStylesCache(changed, { scaleY: 1 });
        const incrementalVisits = styleVisits.mock.calls.length;
        expect(skeleton.stylesCache.backgroundPositions?.getValue(0, 4)).toBeDefined();
        expect(skeleton.stylesCache.fontMatrix.getValue(0, 1)).toBe(cachedFont);
        styleVisits.mockClear();
        skeleton.setStylesCache({ ...changed, isDirty: 1 }, { scaleY: 1 });
        expect(incrementalVisits).toBeLessThan(styleVisits.mock.calls.length);
    });

    it.each(['distance', 'origin'])('reuses prepared merged styles when fractional %s needs a pixel refresh', (fractional) => {
        const { spreadsheet, skeleton, viewport, scene, mainCanvas } = fixture;
        const cacheCanvas = viewport.canvas!;
        cacheCanvas.setSize(700, 420, 1);
        skeleton.setStylesCache(createViewportInfo(scene, cacheCanvas));
        const mergedFont = skeleton.stylesCache.fontMatrix.getValue(2, 2);
        expect(mergedFont).toBeDefined();
        const prepareFont = vi.spyOn(skeleton, '_setFontStylesCache');
        const renderFont = vi.spyOn(spreadsheet.fontExtension, '_renderFontEachCell');
        spreadsheet.makeDirty(false);
        spreadsheet.makeForceDirty(false);
        const context = mainCanvas.getContext();
        if (fractional === 'origin') {
            context.translate(0.5, 0);
        }
        spreadsheet.render(context, createViewportInfo(scene, cacheCanvas, {
            diffBounds: [createBound(440, 0, 460, 280)],
            diffCacheBounds: [],
            diffX: fractional === 'distance' ? -20.5 : -20,
            diffY: 0,
            isDirty: 0,
            isForceDirty: false,
            shouldCacheUpdate: 0,
        }));
        expect(skeleton.stylesCache.fontMatrix.getValue(2, 2)).toBeDefined();
        expect(prepareFont).not.toHaveBeenCalled();
        expect(renderFont.mock.calls.some(([, row, col]) => row === 2 && col === 2)).toBe(true);
    });

    it.each([
        { from: 69, to: 38.7, scale: 1.5, y: 11.25, reported: -20, expected: -30 },
        { from: -287.15, to: -287.5, scale: 0.5, y: 0, reported: -2, expected: 0 },
        { from: -287.5, to: -287.7, scale: 1, y: 0, reported: 0, expected: -1 },
    ])('moves cached pixels by the actual raster origin: $from to $to at $scale', ({ from, to, scale, y, reported, expected }) => {
        const { spreadsheet, skeleton, viewport, scene, mainCanvas } = fixture;
        const canvas = viewport.canvas!;
        canvas.setSize(700, 420, 1);
        const ctx = mainCanvas.getContext();
        ctx.setTransform(scale, 0, 0, scale, from, y);
        spreadsheet.renderByViewports(ctx, createViewportInfo(scene, canvas), skeleton);
        spreadsheet.makeDirty(false);
        spreadsheet.makeForceDirty(false);
        ctx.setTransform(scale, 0, 0, scale, to, y);
        const refresh = vi.spyOn(spreadsheet, 'refreshCacheCanvas');
        const copyTarget = spreadsheet as unknown as { _copyCacheForScrolling(...args: unknown[]): void };
        const copy = vi.spyOn(copyTarget, '_copyCacheForScrolling');
        spreadsheet.renderByViewports(ctx, createViewportInfo(scene, viewport.canvas!, {
            diffBounds: reported ? [createBound(400, 0, 420, 240)] : [],
            diffCacheBounds: [],
            diffX: reported,
            diffY: 0,
            isDirty: 0,
            isForceDirty: false,
            shouldCacheUpdate: 0,
        }), skeleton);
        expect(refresh).not.toHaveBeenCalled();
        if (expected) {
            expect(copy).toHaveBeenCalledWith(expect.anything(), canvas, expected, 0);
        } else {
            expect(copy).not.toHaveBeenCalled();
        }
    });

    it('rebuilds style coverage after a range reset even when the viewport stays in place', () => {
        const { skeleton, scene, cacheCanvas } = fixture;
        const info = createViewportInfo(scene, cacheCanvas);
        skeleton.setStylesCache(info, { scaleY: 1 });
        skeleton.resetRangeCache([{ startRow: 2, endRow: 3, startColumn: 2, endColumn: 3 }]);
        const cell = skeleton.worksheet.getCellRaw(2, 2)!;
        skeleton.worksheet.getCellMatrix().setValue(2, 2, { ...cell, v: 'Updated merge' });
        skeleton.setStylesCache({ ...info, isDirty: 0, shouldCacheUpdate: 0, diffX: -0.2 }, { scaleY: 1 });
        expect(skeleton.stylesCache.fontMatrix.getValue(2, 2)?.cellData?.v).toBe('Updated merge');
    });

    it.each(['scale', 'size', 'pixel-ratio', 'untracked-origin', 'fractional-viewport'])('refreshes an existing bitmap after its %s changes', (change) => {
        const { spreadsheet, skeleton, viewport, scene, mainCanvas } = fixture;
        const canvas = viewport.canvas!;
        canvas.setSize(700, 420, 1);
        const ctx = mainCanvas.getContext();
        spreadsheet.renderByViewports(ctx, createViewportInfo(scene, canvas), skeleton);
        spreadsheet.makeDirty(false);
        spreadsheet.makeForceDirty(false);
        if (change === 'scale') {
            ctx.setTransform(2, 0, 0, 2, 0, 0);
        } else if (change === 'untracked-origin' || change === 'fractional-viewport') {
            ctx.translate(-4, 0);
        } else {
            canvas.setSize(change === 'size' ? 710 : 700, 420, change === 'pixel-ratio' ? 2 : 1);
        }
        const refresh = vi.spyOn(spreadsheet, 'refreshCacheCanvas');
        spreadsheet.renderByViewports(ctx, createViewportInfo(scene, canvas, {
            diffX: change === 'fractional-viewport' ? -4 : 0,
            viewPortPosition: createBound(change === 'fractional-viewport' ? 0.25 : 0, 0, 420, 240),
            isDirty: 0,
            isForceDirty: false,
            shouldCacheUpdate: 0,
        }), skeleton);
        expect(refresh).toHaveBeenCalledOnce();
    });

    it('prepares missing style coverage independently of the bitmap damage strips', () => {
        const { skeleton, scene, cacheCanvas } = fixture;
        skeleton.setStylesCache(createViewportInfo(scene, cacheCanvas, { cacheBound: createBound(0, 0, 300, 280) }));
        expect(skeleton.stylesCache.backgroundPositions?.getValue(0, 4)).toBeUndefined();
        skeleton.setStylesCache(createViewportInfo(scene, cacheCanvas, {
            cacheBound: createBound(72, 0, 460, 280),
            diffX: -72,
            isDirty: 0,
            isForceDirty: false,
            shouldCacheUpdate: 0,
        }));
        expect(skeleton.stylesCache.backgroundPositions?.getValue(0, 4)).toBeDefined();
    });

    it('batches styles at the cache boundary while the prepared range covers the visible cells', () => {
        const { skeleton, scene, cacheCanvas } = fixture;
        skeleton.setStylesCache(createViewportInfo(scene, cacheCanvas, {
            cacheBound: createBound(0, 0, 300, 280),
            viewBound: createBound(46, 28, 250, 240),
        }));
        const info = createViewportInfo(scene, cacheCanvas, {
            cacheBound: createBound(20, 0, 320, 280),
            viewBound: createBound(66, 28, 270, 240),
            diffX: -20,
            isDirty: 0,
            isForceDirty: false,
            shouldCacheUpdate: 0,
        });
        const prepareFont = vi.spyOn(skeleton, '_setFontStylesCache');
        skeleton.setStylesCache(info);
        expect(prepareFont).not.toHaveBeenCalled();
        expect(skeleton.stylesCache.backgroundPositions?.getValue(0, 4)).toBeUndefined();
        skeleton.setStylesCache({ ...info, shouldCacheUpdate: 1 });
        expect(skeleton.stylesCache.backgroundPositions?.getValue(0, 4)).toBeDefined();
    });

    it('keeps full and incremental raster origins integral at non-binary zooms', () => {
        const { spreadsheet, skeleton, viewport, scene, mainCanvas } = fixture;
        const canvas = viewport.canvas!;
        canvas.setSize(700, 420, 1);
        const ctx = mainCanvas.getContext();
        const origins: { left: number; top: number }[] = [];
        const draw = spreadsheet.draw.bind(spreadsheet);
        vi.spyOn(spreadsheet, 'draw').mockImplementation((context, info, repair) => {
            const transform = context.getTransform();
            origins.push({ left: transform.e, top: transform.f });
            return draw(context, info, repair);
        });
        ctx.setTransform(2.01, 0, 0, 2.01, -387.123, 20.7);
        spreadsheet.renderByViewports(ctx, createViewportInfo(scene, canvas), skeleton);
        spreadsheet.makeDirty(false);
        spreadsheet.makeForceDirty(false);
        ctx.setTransform(2.01, 0, 0, 2.01, -407.4, 20.7);
        spreadsheet.renderByViewports(ctx, createViewportInfo(scene, viewport.canvas!, {
            diffX: -10.09,
            diffY: 0,
            diffBounds: [createBound(400, 0, 420, 240)],
            diffCacheBounds: [createBound(400, 0, 460, 280)],
            isDirty: 0,
            isForceDirty: false,
            shouldCacheUpdate: 1,
        }), skeleton);
        expect(origins.length).toBeGreaterThan(1);
        expect(origins.every(({ left, top }) => Number.isInteger(left) && Number.isInteger(top))).toBe(true);
    });

    it('uses independent viewport buffers to repaint only newly exposed horizontal cache strips', () => {
        const { spreadsheet, skeleton, mainCanvas, viewport, scene } = fixture;
        const cacheCanvas = viewport.canvas!;
        cacheCanvas.setSize(700, 420, 1);
        const viewportInfo = createViewportInfo(scene, cacheCanvas, {
            diffBounds: [createBound(440, 0, 460, 280)],
            diffCacheBounds: [createBound(400, 0, 460, 280)],
            diffX: -20,
            diffY: 0,
            isDirty: 0,
            isForceDirty: false,
            shouldCacheUpdate: 1,
        });
        spreadsheet.makeDirty(false);
        spreadsheet.makeForceDirty(false);
        const paint = vi.spyOn(spreadsheet, 'paintNewAreaForScrolling');
        const refresh = vi.spyOn(spreadsheet, 'refreshCacheCanvas');
        spreadsheet.render(mainCanvas.getContext(), viewportInfo);
        expect(refresh).not.toHaveBeenCalled();
        expect(paint).toHaveBeenCalledOnce();
        expect(viewport.canvas).not.toBe(cacheCanvas);
    });

    it.each([
        { key: SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT, width: 32.16, full: true },
        { key: SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT, width: 32, full: false },
        { key: SHEET_VIEWPORT_KEY.VIEW_MAIN, width: 32.16, full: false },
    ])('protects a fractional frozen edge without broadening main viewport refresh: $key $width', ({ key, width, full }) => {
        const { spreadsheet, skeleton, mainCanvas, cacheCanvas, scene } = fixture;
        const info = createViewportInfo(scene, cacheCanvas, {
            viewportKey: key,
            viewPortPosition: createBound(0, 0, width, 240),
            diffY: -10,
            diffBounds: [createBound(0, 240, 420, 250)],
            diffCacheBounds: [createBound(0, 240, 460, 280)],
            isDirty: 0,
            isForceDirty: false,
            shouldCacheUpdate: 1,
        });
        skeleton.setStylesCache(info);
        spreadsheet.makeDirty(false);
        spreadsheet.makeForceDirty(false);
        const refresh = vi.spyOn(spreadsheet, 'refreshCacheCanvas');
        const paint = vi.spyOn(spreadsheet, 'paintNewAreaForScrolling');
        spreadsheet.renderByViewports(mainCanvas.getContext(), info, skeleton);
        expect(refresh).toHaveBeenCalledTimes(full ? 1 : 0);
        expect(paint).toHaveBeenCalledTimes(full ? 0 : 1);
    });

    it.each(['dirty', 'force', 'fractional', 'within-buffer-fractional', 'fractional-origin', 'within-buffer-fractional-origin', 'missing-strip', 'jump'])('retains the horizontal full-refresh fallback for %s', (reason) => {
        const { spreadsheet, skeleton, mainCanvas, viewport, scene } = fixture;
        const cacheCanvas = viewport.canvas!;
        cacheCanvas.setSize(700, 420, 1);
        const viewportInfo = createViewportInfo(scene, cacheCanvas, {
            diffBounds: [createBound(440, 0, 460, 280)],
            diffCacheBounds: reason === 'missing-strip' ? [] : [createBound(400, 0, 460, 280)],
            diffX: reason.endsWith('fractional') ? -20.5 : -20,
            diffY: 0,
            isDirty: reason === 'dirty' ? 1 : 0,
            isForceDirty: reason === 'force',
            shouldCacheUpdate: reason.startsWith('within-buffer') ? 0 : 1,
        });
        if (reason === 'jump') {
            viewportInfo.diffX = -10000;
        }
        spreadsheet.makeDirty(false);
        spreadsheet.makeForceDirty(false);
        if (reason.endsWith('fractional-origin')) {
            mainCanvas.getContext().translate(0.5, 0);
        }
        const refresh = vi.spyOn(spreadsheet, 'refreshCacheCanvas');
        const paint = vi.spyOn(spreadsheet, 'paintNewAreaForScrolling');
        spreadsheet.renderByViewports(mainCanvas.getContext(), viewportInfo, skeleton);
        expect(refresh).toHaveBeenCalledOnce();
        expect(paint).not.toHaveBeenCalled();
    });

    it('retains full horizontal refresh when the cache is not owned by the viewport', () => {
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

    it('alternates scroll buffers independently for each viewport', () => {
        const { spreadsheet, skeleton, scene, viewport, mainCanvas } = fixture;
        const mainCtx = mainCanvas.getContext() as any;
        const mainCache = viewport.canvas!;
        mainCache.setSize(460, 280, 1);
        const frozenViewport = new Viewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT, scene, {
            left: 0,
            top: 0,
            width: 80,
            height: 240,
            active: true,
            allowCache: true,
        });
        const frozenCache = frozenViewport.canvas!;
        frozenCache.setSize(120, 280, 1);

        const paint = (viewportKey: string, cacheCanvas: Canvas) => spreadsheet.paintNewAreaForScrolling(
            createViewportInfo(scene, cacheCanvas, {
                viewportKey,
                cacheCanvas,
                diffX: 4,
                diffY: 3,
                diffBounds: [createBound(100, 60, 220, 140)],
                diffCacheBounds: [createBound(100, 60, 220, 140)],
            }),
            {
                cacheCanvas,
                cacheCtx: cacheCanvas.getContext() as any,
                mainCtx,
                topOrigin: 0,
                leftOrigin: 0,
                bufferEdgeX: 8,
                bufferEdgeY: 6,
                rowHeaderWidthAndMarginLeft: skeleton.rowHeaderWidthAndMarginLeft,
                columnHeaderHeightAndMarginTop: skeleton.columnHeaderHeightAndMarginTop,
                scaleX: 1,
                scaleY: 1,
            }
        );

        const nextMainCache = paint(SHEET_VIEWPORT_KEY.VIEW_MAIN, mainCache);
        const nextFrozenCache = paint(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT, frozenCache);
        expect(viewport.canvas).toBe(nextMainCache);
        expect(frozenViewport.canvas).toBe(nextFrozenCache);
        expect(nextMainCache).not.toBe(mainCache);
        expect(nextFrozenCache).not.toBe(frozenCache);
        expect(nextMainCache.getWidth()).toBe(460);
        expect(nextFrozenCache.getWidth()).toBe(120);

        expect(paint(SHEET_VIEWPORT_KEY.VIEW_MAIN, nextMainCache)).toBe(mainCache);
        expect(paint(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT, nextFrozenCache)).toBe(frozenCache);
    });
});
