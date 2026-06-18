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
    CellValueType,
    HorizontalAlign,
    ILogService,
    IUniverInstanceService,
    LocaleType,
    LogLevel,
    Univer,
    UniverInstanceType,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupRenderTestEnv } from '../../../__tests__/render-test-utils';
import { Vector2 } from '../../../basics/vector2';
import { Canvas } from '../../../canvas';
import { Engine } from '../../../engine';
import { MAIN_VIEW_PORT_KEY, Scene } from '../../../scene';
import { Viewport } from '../../../viewport';
import { SpreadsheetColumnHeader } from '../column-header';
import { SHEET_VIEWPORT_KEY } from '../interfaces';
import { SpreadsheetRowHeader } from '../row-header';
import { SpreadsheetSkeleton } from '../sheet.render-skeleton';
import { createDocumentModelWithStyle, extractOtherStyle, getFontFormat } from '../util';
import '../extensions/column-header-layout';
import '../extensions/row-header-layout';

function workbookDataFactory(): IWorkbookData {
    return {
        id: 'header-workbook',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'header-workbook',
        sheetOrder: ['sheet-1'],
        styles: {},
        sheets: {
            'sheet-1': {
                id: 'sheet-1',
                name: 'Sheet-1',
                rowCount: 12,
                columnCount: 8,
                defaultColumnWidth: 64,
                defaultRowHeight: 24,
                rowHeader: { width: 42 },
                columnHeader: { height: 28 },
            },
        },
    };
}

function createBound(left: number, top: number, right: number, bottom: number): IBoundRectNoAngle {
    return { left, top, right, bottom };
}

function createViewportInfo(scene: Scene, cacheCanvas: Canvas): IViewportInfo {
    const viewBound = createBound(0, 0, 320, 180);
    const cacheBound = createBound(0, 0, 360, 220);
    const viewPortPosition = createBound(0, 0, 320, 180);

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
        bufferEdgeX: 8,
        bufferEdgeY: 8,
    };
}

function createCtx() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        moveToByPrecision: vi.fn(),
        lineToByPrecision: vi.fn(),
        stroke: vi.fn(),
        clip: vi.fn(),
        rectByPrecision: vi.fn(),
        fillRectByPrecision: vi.fn(),
        setLineWidthByPrecision: vi.fn(),
        translateWithPrecision: vi.fn(),
        translateWithPrecisionRatio: vi.fn(),
        fillText: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        textAlign: 'center',
        textBaseline: 'middle',
        font: '',
    } as any;
}

describe('spreadsheet headers and cell document helpers', () => {
    let univer: Univer;
    let workbook: Workbook;
    let skeleton: SpreadsheetSkeleton;
    let engine: Engine;
    let scene: Scene;
    let viewport: Viewport;
    let cacheCanvas: Canvas;
    let restoreEnv: () => void;
    let container: HTMLDivElement;

    beforeEach(() => {
        restoreEnv = setupRenderTestEnv().restore;
        univer = new Univer();
        const injector = univer.__getInjector();
        const get = injector.get.bind(injector);

        workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookDataFactory());
        get(IUniverInstanceService).focusUnit('header-workbook');
        get(ILogService).setLogLevel(LogLevel.SILENT);

        skeleton = injector.createInstance(SpreadsheetSkeleton, workbook.getActiveSheet()!, workbook.getStyles()).calculate() as SpreadsheetSkeleton;

        container = document.createElement('div');
        container.style.width = '480px';
        container.style.height = '320px';
        document.body.appendChild(container);
        engine = new Engine('header-engine', { elementWidth: 480, elementHeight: 320, dpr: 1 });
        engine.mount(container, false);
        scene = new Scene('header-scene', engine);
        scene.transformByState({ width: 1000, height: 800, scaleX: 1, scaleY: 1 });
        viewport = new Viewport(MAIN_VIEW_PORT_KEY, scene, {
            left: 0,
            top: 0,
            width: 320,
            height: 180,
            active: true,
            allowCache: true,
            bufferEdgeX: 8,
            bufferEdgeY: 8,
        });
        cacheCanvas = new Canvas({ width: 360, height: 220, pixelRatio: 1 });
        skeleton.setScene(scene);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        cacheCanvas?.dispose();
        viewport?.dispose();
        scene?.dispose();
        engine?.dispose();
        univer?.dispose();
        restoreEnv?.();
        container?.remove();
    });

    it('draws column and row headers from a DI-created spreadsheet skeleton', () => {
        const bounds = createViewportInfo(scene, cacheCanvas);
        const columnHeader = new SpreadsheetColumnHeader('column-header', skeleton);
        const rowHeader = new SpreadsheetRowHeader('row-header', skeleton);
        const ctx = createCtx();
        scene.addObject(columnHeader, 1);
        scene.addObject(rowHeader, 1);

        columnHeader.setCustomHeader({
            columnsCfg: {
                0: { text: 'SKU', backgroundColor: '#f4f6f8', textAlign: 'left' },
            },
            headerStyle: { fontColor: '#123456' },
        }, 'sheet-1');
        rowHeader.setCustomHeader({
            rowsCfg: {
                0: { text: 'Top', backgroundColor: '#eef2ff', textAlign: 'right' },
            },
            headerStyle: { borderColor: '#8899aa' },
        }, 'sheet-1');

        columnHeader.draw(ctx, bounds);
        rowHeader.draw(ctx, bounds);

        expect(ctx.translateWithPrecision).toHaveBeenCalledWith(42, 0);
        expect(ctx.translateWithPrecision).toHaveBeenCalledWith(0, 28);
        expect(ctx.fillText).toHaveBeenCalled();
        expect(columnHeader.isHit(Vector2.FromArray([50, 10]))).toBe(true);
        expect(columnHeader.isHit(Vector2.FromArray([10, 10]))).toBe(false);
        expect(rowHeader.isHit(Vector2.FromArray([10, 40]))).toBe(true);
        expect(rowHeader.isHit(Vector2.FromArray([50, 10]))).toBe(false);
        expect(() => columnHeader.getDocuments()).toThrow('Method not implemented.');
        expect(() => rowHeader.getDocuments()).toThrow('Method not implemented.');

        columnHeader.dispose();
        rowHeader.dispose();
    });

    it('builds a sheet cell document model with render style metadata', () => {
        const documentModel = createDocumentModelWithStyle('Revenue', { fs: 14, bl: 1, cl: { rgb: '#223344' } }, {
            horizontalAlign: HorizontalAlign.RIGHT,
            verticalAlign: VerticalAlign.MIDDLE,
            wrapStrategy: WrapStrategy.WRAP,
            cellValueType: CellValueType.STRING,
            paddingData: { t: 3, r: 4, b: 5, l: 6 },
        });

        const snapshot = documentModel.getSnapshot();
        expect(snapshot.body?.dataStream).toBe('Revenue\r\n');
        expect(snapshot.body?.textRuns?.[0].ts).toMatchObject({ fs: 14, bl: 1 });
        expect(snapshot.documentStyle).toMatchObject({
            marginTop: 3,
            marginRight: 4,
            marginBottom: 5,
            marginLeft: 6,
            renderConfig: {
                horizontalAlign: HorizontalAlign.RIGHT,
                verticalAlign: VerticalAlign.MIDDLE,
                wrapStrategy: WrapStrategy.WRAP,
                cellValueType: CellValueType.STRING,
            },
        });
    });

    it('extracts non-font cell style and font format for sheet text rendering', () => {
        const style = {
            ff: 'Arial',
            fs: 12,
            bl: 1,
            it: 1,
            ul: { s: 1 },
            st: { s: 1 },
            ol: { s: 1 },
            cl: { rgb: '#112233' },
            ht: HorizontalAlign.CENTER,
            vt: VerticalAlign.BOTTOM,
            tb: WrapStrategy.CLIP,
            pd: { t: 1, r: 2, b: 3, l: 4 },
            tr: { a: 45 },
        } as any;

        expect(extractOtherStyle(style)).toEqual({
            textRotation: { a: 45 },
            textDirection: undefined,
            horizontalAlign: HorizontalAlign.CENTER,
            verticalAlign: VerticalAlign.BOTTOM,
            wrapStrategy: WrapStrategy.CLIP,
            paddingData: { t: 1, r: 2, b: 3, l: 4 },
        });
        expect(extractOtherStyle(null)).toEqual({});

        expect(getFontFormat(style)).toMatchObject({
            ff: 'Arial',
            fs: 12,
            bl: 1,
            it: 1,
            cl: { rgb: '#112233' },
        });
        expect(getFontFormat(undefined)).toEqual({});
    });
});
