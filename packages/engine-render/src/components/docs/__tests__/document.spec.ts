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

import { DashStyleType, DocumentFlavor } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupRenderTestEnv } from '../../../__tests__/render-test-utils';
import {
    DocumentSkeletonPageType,
    GlyphType,
    LineType,
    PageLayoutType,
} from '../../../basics/i-document-skeleton-cached';
import { Vector2 } from '../../../basics/vector2';
import { Canvas } from '../../../canvas';
import { Engine } from '../../../engine';
import { MAIN_VIEW_PORT_KEY, Scene } from '../../../scene';
import { Path, Rect } from '../../../shape';
import { Viewport } from '../../../viewport';
import { DocBackground } from '../doc-background';
import { DOCS_EXTENSION_TYPE } from '../doc-extension';
import { Documents } from '../document';
import { getDocumentCompatibilityPolicy } from '../document-compatibility';
import { setDocsTableRenderViewportProvider } from '../table-render-viewport';

function createGlyph(content: string, left: number, width = 16, backgroundColor?: string) {
    return {
        glyphType: GlyphType.WORD,
        streamType: 'word',
        content,
        raw: content,
        count: content.length,
        width,
        left,
        xOffset: 0,
        isJustifiable: false,
        bBox: {
            width,
            ba: 10,
            bd: 2,
            aba: 10,
            abd: 2,
            sp: 0,
            sbr: 0.6,
            sbo: 1,
            spr: 0.6,
            spo: 1,
        },
        ts: {
            fs: 12,
            ff: 'Arial',
            cl: { rgb: '#222222' },
            ...(backgroundColor
                ? {
                    bg: { rgb: backgroundColor },
                }
                : {}),
        },
        fontStyle: {
            fontString: '12px Arial',
            fontSize: 12,
            originFontSize: 12,
            fontFamily: 'Arial',
            fontCache: '12px Arial',
        },
        adjustability: {
            stretchability: [0, 0],
            shrinkability: [0, 0],
        },
    } as any;
}

function createLine(type: LineType, top: number, withBorder = false, backgroundColor?: string) {
    const glyphA = createGlyph('A', 0, 16, backgroundColor);
    const glyphB = createGlyph('B', 18, 16, backgroundColor);
    const divide = {
        glyphGroup: [glyphA, glyphB],
        width: 120,
        left: 0,
        paddingLeft: 0,
        isFull: false,
        st: 0,
        ed: 2,
    } as any;
    const line = {
        paragraphIndex: 0,
        type,
        divides: [divide],
        divideLen: 1,
        lineHeight: 20,
        contentHeight: 12,
        top,
        asc: 10,
        dsc: 2,
        paddingTop: 2,
        paddingBottom: 2,
        marginTop: 1,
        marginBottom: 0,
        spaceBelowApply: 0,
        st: 0,
        ed: 2,
        lineIndex: 0,
        paragraphStart: true,
        isBehindTable: false,
        tableId: '',
        borderBottom: withBorder
            ? {
                color: { rgb: '#cdd0d8' },
                padding: 0,
            }
            : undefined,
    } as any;

    divide.parent = line;
    glyphA.parent = divide;
    glyphB.parent = divide;

    return line;
}

function createPage(pageType: DocumentSkeletonPageType, segmentId: string, backgroundColor?: string) {
    const lineBlock = createLine(LineType.BLOCK, 0, false, backgroundColor);
    const lineText = createLine(LineType.PARAGRAPH, 24, true, backgroundColor);
    const column = {
        lines: [lineBlock, lineText],
        left: 0,
        width: 180,
        height: 80,
        spaceWidth: 0,
        separator: 0,
        st: 0,
        ed: 2,
        drawingLRIds: [],
        isFull: false,
    } as any;
    const section = {
        columns: [column],
        colCount: 1,
        height: 120,
        top: 0,
        st: 0,
        ed: 2,
    } as any;
    const page = {
        sections: [section],
        headerId: 'header-main',
        footerId: 'footer-main',
        pageWidth: 200,
        pageHeight: 420,
        pageOrient: 0,
        marginLeft: 10,
        marginRight: 10,
        originMarginTop: 12,
        marginTop: 12,
        originMarginBottom: 12,
        marginBottom: 12,
        left: 0,
        pageNumber: 1,
        pageNumberStart: 1,
        verticalAlign: false,
        angle: 0,
        width: 180,
        height: 120,
        breakType: 0,
        st: 0,
        ed: 2,
        skeDrawings: new Map(),
        skeTables: new Map(),
        skeColumnGroups: new Map(),
        segmentId,
        type: pageType,
        renderConfig: {
            horizontalAlign: 2,
            verticalAlign: 1,
            centerAngle: 8,
            vertexAngle: 35,
            wrapStrategy: 2,
        },
    } as any;

    section.parent = page;
    column.parent = section;
    lineBlock.parent = column;
    lineText.parent = column;

    return page;
}

function attachTable(page: any) {
    const cellPage = createPage(DocumentSkeletonPageType.CELL, 'cell-seg');
    cellPage.marginLeft = 0;
    cellPage.marginTop = 0;
    cellPage.marginRight = 0;
    cellPage.marginBottom = 0;
    cellPage.pageWidth = 120;
    cellPage.pageHeight = 60;
    cellPage.headerId = '';
    cellPage.footerId = '';

    const row = {
        cells: [cellPage],
        index: 0,
        height: 60,
        top: 0,
        st: 0,
        ed: 2,
        isRepeatRow: false,
        rowSource: {
            tableCells: [{
                borderTop: { color: { rgb: '#333333' } },
                borderBottom: { color: { rgb: '#333333' } },
                borderLeft: { color: { rgb: '#333333' } },
                borderRight: { color: { rgb: '#333333' } },
                backgroundColor: { rgb: '#ffeecc' },
            }],
        },
    } as any;
    const table = {
        rows: [row],
        width: 120,
        height: 60,
        top: 20,
        left: 12,
        st: 0,
        ed: 2,
        tableId: 'table-1',
        tableSource: {},
        parent: page,
    } as any;

    row.parent = table;
    cellPage.parent = row;
    page.skeTables.set('table-1', table);
}

function setFirstTextGlyph(page: any, content: string) {
    const glyph = page.sections[0].columns[0].lines[1].divides[0].glyphGroup[0];
    glyph.content = content;
    glyph.raw = content;
    glyph.count = content.length;
}

function attachColumnGroup(page: any) {
    const leftPage = createPage(DocumentSkeletonPageType.BODY, 'column-left');
    const rightPage = createPage(DocumentSkeletonPageType.BODY, 'column-right');
    leftPage.marginLeft = 0;
    leftPage.marginTop = 0;
    leftPage.marginRight = 0;
    leftPage.marginBottom = 0;
    rightPage.marginLeft = 0;
    rightPage.marginTop = 0;
    rightPage.marginRight = 0;
    rightPage.marginBottom = 0;
    setFirstTextGlyph(leftPage, 'L');
    setFirstTextGlyph(rightPage, 'R');

    const columnGroup = {
        columns: [
            {
                columnId: 'column-left',
                left: 0,
                top: 0,
                width: 70,
                height: 80,
                st: 0,
                ed: 10,
                page: leftPage,
            },
            {
                columnId: 'column-right',
                left: 90,
                top: 0,
                width: 70,
                height: 80,
                st: 11,
                ed: 20,
                page: rightPage,
            },
        ],
        width: 160,
        height: 80,
        top: 20,
        left: 12,
        st: 0,
        ed: 20,
        columnGroupId: 'column-group-1',
        columnGroupSource: {
            columnGroupId: 'column-group-1',
            gap: { v: 20 },
            columns: [],
        },
        parent: page,
    } as any;

    columnGroup.columns.forEach((column: any) => {
        column.parent = columnGroup;
        column.page.parent = column;
    });
    page.skeColumnGroups.set(columnGroup.columnGroupId, columnGroup);
}

describe('documents render', () => {
    let restoreEnv: () => void;
    let container: HTMLDivElement;
    let engine: Engine;
    let scene: Scene;
    let canvas: Canvas;

    beforeEach(() => {
        restoreEnv = setupRenderTestEnv().restore;
        container = document.createElement('div');
        container.style.width = '820px';
        container.style.height = '520px';
        document.body.appendChild(container);

        engine = new Engine('document-engine', { elementWidth: 800, elementHeight: 500, dpr: 1 });
        engine.mount(container, false);

        scene = new Scene('document-scene', engine);
        scene.transformByState({
            width: 1200,
            height: 900,
            scaleX: 1,
            scaleY: 1,
        });
        new Viewport(MAIN_VIEW_PORT_KEY, scene, {
            left: 0,
            top: 0,
            width: 600,
            height: 400,
            active: true,
            allowCache: true,
            bufferEdgeX: 10,
            bufferEdgeY: 8,
        });

        canvas = new Canvas({ width: 800, height: 500, pixelRatio: 1 });
    });

    afterEach(() => {
        canvas.dispose();
        scene.dispose();
        engine.dispose();
        restoreEnv();
        container.remove();
        document.body.innerHTML = '';
        vi.restoreAllMocks();
        setDocsTableRenderViewportProvider(null);
    });

    it('uses explicit table cell border width inside table render path', () => {
        const skeleton = { getSkeletonData: () => ({ pages: [] }) } as any;
        const documents = new Documents('docs-border', skeleton, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });
        const cell = createPage(DocumentSkeletonPageType.CELL, 'cell-seg');
        cell.marginLeft = 0;
        cell.marginTop = 0;
        cell.pageWidth = 120;
        cell.pageHeight = 60;
        const row = {
            cells: [cell],
            rowSource: {
                tableCells: [{
                    borderTop: { color: { rgb: '#ff0000' }, width: { v: 5 } },
                    borderBottom: { color: { rgb: 'transparent' }, width: { v: 0 } },
                    borderLeft: { color: { rgb: 'transparent' }, width: { v: 0 } },
                    borderRight: { color: { rgb: 'transparent' }, width: { v: 0 } },
                }],
            },
        } as any;
        cell.parent = row;
        (documents as any)._drawLiquid = { x: 0, y: 0 };

        const lineWidths: number[] = [];
        const strokeStyles: string[] = [];
        const ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            fillRectByPrecision: vi.fn(),
            setLineWidthByPrecision: vi.fn((width: number) => lineWidths.push(width)),
            beginPath: vi.fn(),
            moveToByPrecision: vi.fn(),
            lineToByPrecision: vi.fn(),
            setLineDash: vi.fn(),
            stroke: vi.fn(),
            closePathByEnv: vi.fn(),
            set strokeStyle(value: string) {
                strokeStyles.push(value);
            },
        } as any;

        (documents as any)._drawTableCellBordersAndBg(ctx, { marginLeft: 0, marginTop: 0 }, cell);

        expect(lineWidths).toEqual([5]);
        expect(strokeStyles).toEqual(['#ff0000']);
        expect(ctx.stroke).toHaveBeenCalledTimes(1);

        documents.dispose();
    });

    it('aligns table cell background to precise start and end edges', () => {
        const skeleton = { getSkeletonData: () => ({ pages: [] }) } as any;
        const documents = new Documents('docs-background-precision', skeleton, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });
        const cell = createPage(DocumentSkeletonPageType.CELL, 'cell-background-precision');
        cell.marginLeft = 0;
        cell.marginTop = 0;
        cell.pageWidth = 10.25;
        cell.pageHeight = 6.25;
        const noBorder = { color: { rgb: 'transparent' }, width: { v: 0 } };
        const row = {
            cells: [cell],
            rowSource: {
                tableCells: [{
                    backgroundColor: { rgb: '#bf125d' },
                    borderTop: noBorder,
                    borderBottom: noBorder,
                    borderLeft: noBorder,
                    borderRight: noBorder,
                }],
            },
        } as any;
        cell.parent = row;
        (documents as any)._drawLiquid = { x: 0.25, y: 0.25 };

        const ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            getScale: vi.fn(() => ({ scaleX: 2, scaleY: 2 })),
            fillRect: vi.fn(),
            fillRectByPrecision: vi.fn(),
            setLineWidthByPrecision: vi.fn(),
            beginPath: vi.fn(),
            moveToByPrecision: vi.fn(),
            lineToByPrecision: vi.fn(),
            setLineDash: vi.fn(),
            stroke: vi.fn(),
            closePathByEnv: vi.fn(),
            set fillStyle(_value: string) {},
            set strokeStyle(_value: string) {},
        } as any;

        (documents as any)._drawTableCellBordersAndBg(ctx, { marginLeft: 0, marginTop: 0 }, cell);

        expect(ctx.fillRect).toHaveBeenCalledWith(0.5, 0.5, 10, 6);
        expect(ctx.fillRectByPrecision).not.toHaveBeenCalled();

        documents.dispose();
    });

    it('draws a docs workspace background behind traditional pages', () => {
        const page = createPage(DocumentSkeletonPageType.BODY, '');
        const skeleton = {
            getSkeletonData: () => ({ pages: [page] }),
            getViewModel: () => ({
                getDataModel: () => ({
                    getSnapshot: () => ({
                        documentStyle: {
                            documentFlavor: DocumentFlavor.TRADITIONAL,
                        },
                    }),
                }),
            }),
        } as any;
        const docBackground = new DocBackground('docs-background', skeleton, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 20,
            pageMarginTop: 20,
        });
        docBackground.resize(260, 480);

        const rectDraw = vi.spyOn(Rect, 'drawWith').mockImplementation(() => {});
        vi.spyOn(Path, 'drawWith').mockImplementation(() => {});

        const translate = vi.fn();
        docBackground.draw({
            restore: vi.fn(),
            save: vi.fn(),
            translate,
        } as any, {
            viewBound: { left: 100, top: 50, right: 700, bottom: 450 },
            cacheBound: { left: 80, top: 30, right: 760, bottom: 490 },
        } as any);

        expect(rectDraw.mock.calls.map(([, props]) => props.fill)).toEqual([
            '#fafafa',
            'rgba(255, 255, 255, 1)',
        ]);
        expect(rectDraw.mock.calls[0][1]).toMatchObject({
            width: 680,
            height: 460,
            fill: '#fafafa',
        });
        expect(translate.mock.calls[0]).toEqual([80, 30]);

        docBackground.dispose();
    });

    it('draws DOCX page background images on every traditional page', () => {
        const firstPage = createPage(DocumentSkeletonPageType.BODY, 'first');
        const secondPage = createPage(DocumentSkeletonPageType.BODY, 'second');
        const backgroundImage = { complete: true };
        vi.spyOn(document, 'createElement').mockReturnValue(backgroundImage as any);
        const skeleton = {
            getSkeletonData: () => ({ pages: [firstPage, secondPage] }),
            getViewModel: () => ({
                getDataModel: () => ({
                    getSnapshot: () => ({
                        documentStyle: {
                            documentFlavor: DocumentFlavor.TRADITIONAL,
                            background: {
                                source: 'data:image/png;base64,background',
                            },
                        },
                    }),
                }),
            }),
        } as any;
        const docBackground = new DocBackground('docs-background-docx', skeleton, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 20,
            pageMarginTop: 20,
        });

        vi.spyOn(Rect, 'drawWith').mockImplementation(() => {});
        vi.spyOn(Path, 'drawWith').mockImplementation(() => {});
        const drawImage = vi.fn();

        docBackground.draw({
            restore: vi.fn(),
            save: vi.fn(),
            translate: vi.fn(),
            drawImage,
        } as any);

        expect(drawImage).toHaveBeenCalledTimes(2);
        expect(drawImage).toHaveBeenNthCalledWith(1, backgroundImage, 0, 0, 200, 420);
        expect(drawImage).toHaveBeenNthCalledWith(2, backgroundImage, 0, 0, 200, 420);

        docBackground.dispose();
    });

    it('treats unspecified document flavor as traditional when drawing the page background', () => {
        const page = createPage(DocumentSkeletonPageType.BODY, '');
        const skeleton = {
            getSkeletonData: () => ({ pages: [page] }),
            getViewModel: () => ({
                getDataModel: () => ({
                    getSnapshot: () => ({
                        documentStyle: {
                            documentFlavor: DocumentFlavor.UNSPECIFIED,
                        },
                    }),
                }),
            }),
        } as any;
        const docBackground = new DocBackground('docs-background-unspecified', skeleton, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 20,
            pageMarginTop: 20,
        });
        docBackground.resize(260, 480);

        const rectDraw = vi.spyOn(Rect, 'drawWith').mockImplementation(() => {});
        vi.spyOn(Path, 'drawWith').mockImplementation(() => {});

        docBackground.draw({
            restore: vi.fn(),
            save: vi.fn(),
            translate: vi.fn(),
        } as any);

        expect(rectDraw.mock.calls.map(([, props]) => props.fill)).toEqual([
            '#fafafa',
            'rgba(255, 255, 255, 1)',
        ]);

        docBackground.dispose();
    });

    it('draws the docs workspace background for modern documents', () => {
        const page = createPage(DocumentSkeletonPageType.BODY, '');
        const skeleton = {
            getSkeletonData: () => ({ pages: [page] }),
            getViewModel: () => ({
                getDataModel: () => ({
                    getSnapshot: () => ({
                        documentStyle: {
                            documentFlavor: DocumentFlavor.MODERN,
                        },
                    }),
                }),
            }),
        } as any;
        const docBackground = new DocBackground('docs-background-modern', skeleton, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 20,
            pageMarginTop: 20,
        });
        docBackground.resize(260, 480);

        const rectDraw = vi.spyOn(Rect, 'drawWith').mockImplementation(() => {});
        vi.spyOn(Path, 'drawWith').mockImplementation(() => {});

        const translate = vi.fn();
        docBackground.draw({
            restore: vi.fn(),
            save: vi.fn(),
            translate,
        } as any, {
            viewBound: { left: 120, top: 60, right: 640, bottom: 420 },
            cacheBound: { left: 90, top: 40, right: 700, bottom: 480 },
        } as any);

        expect(rectDraw.mock.calls.map(([, props]) => props.fill)).toEqual(['rgba(255, 255, 255, 1)']);
        expect(rectDraw.mock.calls[0][1]).toMatchObject({
            width: 610,
            height: 440,
            fill: 'rgba(255, 255, 255, 1)',
        });
        expect(translate.mock.calls[0]).toEqual([90, 40]);

        docBackground.dispose();
    });

    it('uses configured transparent fills for embedded editor backgrounds', () => {
        const page = createPage(DocumentSkeletonPageType.BODY, '');
        const skeleton = {
            getSkeletonData: () => ({ pages: [page] }),
            getViewModel: () => ({
                getDataModel: () => ({
                    getSnapshot: () => ({
                        documentStyle: {
                            documentFlavor: DocumentFlavor.TRADITIONAL,
                        },
                    }),
                }),
            }),
        } as any;
        const docBackground = new DocBackground('docs-background-editor', skeleton, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 20,
            pageMarginTop: 20,
            backgroundFillColor: 'transparent',
            pageFillColor: 'transparent',
            pageStrokeColor: 'transparent',
            marginStrokeColor: 'transparent',
        });
        docBackground.resize(260, 480);

        const rectDraw = vi.spyOn(Rect, 'drawWith').mockImplementation(() => {});
        vi.spyOn(Path, 'drawWith').mockImplementation(() => {});

        docBackground.draw({
            restore: vi.fn(),
            save: vi.fn(),
            translate: vi.fn(),
        } as any);

        expect(rectDraw.mock.calls.map(([, props]) => props.fill)).toEqual([
            'transparent',
            'transparent',
        ]);
        expect(rectDraw.mock.calls[1][1].stroke).toBe('transparent');
        expect((Path.drawWith as any).mock.calls[0][1].stroke).toBe('transparent');

        docBackground.dispose();
    });

    it('draws unspecified table borders with the default table grid color', () => {
        const skeleton = { getSkeletonData: () => ({ pages: [] }) } as any;
        const documents = new Documents('docs-border-default', skeleton, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });
        const cell = createPage(DocumentSkeletonPageType.CELL, 'cell-seg');
        cell.marginLeft = 0;
        cell.marginTop = 0;
        cell.pageWidth = 120;
        cell.pageHeight = 60;
        const row = {
            cells: [cell],
            rowSource: {
                tableCells: [{}],
            },
        } as any;
        cell.parent = row;
        (documents as any)._drawLiquid = { x: 0, y: 0 };

        const strokeStyles: string[] = [];
        const ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            fillRectByPrecision: vi.fn(),
            setLineWidthByPrecision: vi.fn(),
            beginPath: vi.fn(),
            moveToByPrecision: vi.fn(),
            lineToByPrecision: vi.fn(),
            setLineDash: vi.fn(),
            stroke: vi.fn(),
            closePathByEnv: vi.fn(),
            set strokeStyle(value: string) {
                strokeStyles.push(value);
            },
        } as any;

        (documents as any)._drawTableCellBordersAndBg(ctx, { marginLeft: 0, marginTop: 0 }, cell);

        expect(strokeStyles).toEqual(['#c7c9cc', '#c7c9cc', '#c7c9cc', '#c7c9cc']);

        documents.dispose();
    });

    it('draws paragraph bottom borders with their configured width and dash style', () => {
        const skeleton = { getSkeletonData: () => ({ pages: [] }) } as any;
        const documents = new Documents('docs-paragraph-border', skeleton, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });
        const page = createPage(DocumentSkeletonPageType.BODY, '');
        const line = page.sections[0].columns[0].lines[1];
        line.borderBottom = {
            color: { rgb: '#ff0000' },
            width: 2.5,
            padding: 4,
            dashStyle: DashStyleType.DASH,
        };
        (documents as any)._drawLiquid = { x: 0, y: 0 };

        const ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            setLineWidthByPrecision: vi.fn(),
            beginPath: vi.fn(),
            moveToByPrecision: vi.fn(),
            lineToByPrecision: vi.fn(),
            setLineDash: vi.fn(),
            stroke: vi.fn(),
            closePathByEnv: vi.fn(),
            set strokeStyle(_value: string) {},
        } as any;

        (documents as any)._drawBorderBottom(ctx, page, line);

        expect(ctx.setLineWidthByPrecision).toHaveBeenCalledWith(2.5);
        expect(ctx.setLineDash).toHaveBeenCalledWith([6]);
        expect(ctx.stroke).toHaveBeenCalledTimes(1);

        documents.dispose();
    });

    it('draws each physical table grid line only once', () => {
        const skeleton = { getSkeletonData: () => ({ pages: [] }) } as any;
        const documents = new Documents('docs-border-canonical', skeleton, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });
        const cells = Array.from({ length: 4 }, (_, index) => {
            const cell = createPage(DocumentSkeletonPageType.CELL, `cell-${index}`);
            cell.marginLeft = 0;
            cell.marginTop = 0;
            cell.pageWidth = 50;
            cell.pageHeight = 30;
            return cell;
        });
        const row0 = {
            cells: [cells[0], cells[1]],
            index: 0,
            rowSource: { tableCells: [{}, {}] },
        } as any;
        const row1 = {
            cells: [cells[2], cells[3]],
            index: 1,
            rowSource: { tableCells: [{}, {}] },
        } as any;
        const table = { rows: [row0, row1] } as any;
        row0.parent = table;
        row1.parent = table;
        cells[0].parent = row0;
        cells[1].parent = row0;
        cells[2].parent = row1;
        cells[3].parent = row1;

        let currentSegment = '';
        const drawnSegments: string[] = [];
        const ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            fillRectByPrecision: vi.fn(),
            setLineWidthByPrecision: vi.fn(),
            beginPath: vi.fn(),
            moveToByPrecision: vi.fn((x: number, y: number) => {
                currentSegment = `${x},${y}`;
            }),
            lineToByPrecision: vi.fn((x: number, y: number) => {
                currentSegment += `-${x},${y}`;
                drawnSegments.push(currentSegment);
            }),
            setLineDash: vi.fn(),
            stroke: vi.fn(),
            closePathByEnv: vi.fn(),
            set strokeStyle(_value: string) {},
        } as any;

        [
            { cell: cells[0], x: 0, y: 0 },
            { cell: cells[1], x: 50, y: 0 },
            { cell: cells[2], x: 0, y: 30 },
            { cell: cells[3], x: 50, y: 30 },
        ].forEach(({ cell, x, y }) => {
            (documents as any)._drawLiquid = { x, y };
            (documents as any)._drawTableCellBordersAndBg(ctx, { marginLeft: 0, marginTop: 0 }, cell);
        });

        expect(ctx.stroke).toHaveBeenCalledTimes(12);
        expect(new Set(drawnSegments).size).toBe(12);

        documents.dispose();
    });

    it('uses neighboring table cell borders for internal canonical edges', () => {
        const skeleton = { getSkeletonData: () => ({ pages: [] }) } as any;
        const documents = new Documents('docs-border-neighbor', skeleton, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });
        const cells = Array.from({ length: 2 }, (_, index) => {
            const cell = createPage(DocumentSkeletonPageType.CELL, `neighbor-cell-${index}`);
            cell.marginLeft = 0;
            cell.marginTop = 0;
            cell.pageWidth = 50;
            cell.pageHeight = 30;
            return cell;
        });
        const noBorder = { color: { rgb: 'transparent' }, width: { v: 0 } };
        const row = {
            cells,
            index: 0,
            rowSource: {
                tableCells: [
                    {
                        borderTop: noBorder,
                        borderBottom: noBorder,
                        borderLeft: noBorder,
                    },
                    {
                        borderTop: noBorder,
                        borderBottom: noBorder,
                        borderLeft: { color: { rgb: '#ff0000' }, width: { v: 3 } },
                        borderRight: noBorder,
                    },
                ],
            },
        } as any;
        const table = { rows: [row] } as any;
        row.parent = table;
        cells[0].parent = row;
        cells[1].parent = row;

        const strokeStyles: string[] = [];
        const lineWidths: number[] = [];
        const ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            fillRectByPrecision: vi.fn(),
            setLineWidthByPrecision: vi.fn((width: number) => lineWidths.push(width)),
            beginPath: vi.fn(),
            moveToByPrecision: vi.fn(),
            lineToByPrecision: vi.fn(),
            setLineDash: vi.fn(),
            stroke: vi.fn(),
            closePathByEnv: vi.fn(),
            set strokeStyle(value: string) {
                strokeStyles.push(value);
            },
        } as any;

        [
            { cell: cells[0], x: 0 },
            { cell: cells[1], x: 50 },
        ].forEach(({ cell, x }) => {
            (documents as any)._drawLiquid = { x, y: 0 };
            (documents as any)._drawTableCellBordersAndBg(ctx, { marginLeft: 0, marginTop: 0 }, cell);
        });

        expect(ctx.stroke).toHaveBeenCalledTimes(1);
        expect(lineWidths).toEqual([3]);
        expect(strokeStyles).toEqual(['#ff0000']);

        documents.dispose();
    });

    it('batches adjacent table cell backgrounds into a shared path', () => {
        const bodyPage = createPage(DocumentSkeletonPageType.BODY, '');
        bodyPage.marginLeft = 0;
        bodyPage.marginTop = 0;
        const cells = Array.from({ length: 2 }, (_, index) => {
            const cell = createPage(DocumentSkeletonPageType.CELL, `background-batch-cell-${index}`);
            cell.marginLeft = 0;
            cell.marginTop = 0;
            cell.pageWidth = 10.25;
            cell.pageHeight = 6.25;
            cell.left = index * 10.25;
            return cell;
        });
        const noBorder = { color: { rgb: 'transparent' }, width: { v: 0 } };
        const row = {
            cells,
            index: 0,
            height: 6.25,
            top: 0,
            rowSource: {
                tableCells: [
                    {
                        backgroundColor: { rgb: '#000000' },
                        borderTop: noBorder,
                        borderBottom: noBorder,
                        borderLeft: noBorder,
                        borderRight: noBorder,
                    },
                    {
                        backgroundColor: { rgb: '#000000' },
                        borderTop: noBorder,
                        borderBottom: noBorder,
                        borderLeft: noBorder,
                        borderRight: noBorder,
                    },
                ],
            },
        } as any;
        const table = {
            rows: [row],
            width: 20.5,
            height: 6.25,
            top: 0.25,
            left: 0.25,
            tableId: 'table-background-batch',
            tableSource: {},
            parent: bodyPage,
        } as any;
        row.parent = table;
        cells.forEach((cell) => {
            cell.parent = row;
        });
        bodyPage.skeTables.set('table-background-batch', table);

        const documents = new Documents('docs-background-batch', {
            getSkeletonData: () => ({ pages: [bodyPage] }),
        } as any, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });

        const rects: Array<[number, number, number, number]> = [];
        const fillStyles: string[] = [];
        const ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            getScale: vi.fn(() => ({ scaleX: 2, scaleY: 2 })),
            beginPath: vi.fn(),
            rect: vi.fn((x: number, y: number, width: number, height: number) => rects.push([x, y, width, height])),
            fill: vi.fn(),
            closePath: vi.fn(),
            set fillStyle(value: string) {
                fillStyles.push(value);
            },
        } as any;

        vi.spyOn(documents as any, '_drawTableCell').mockImplementation(() => {});

        (documents as any)._drawTable(
            ctx,
            bodyPage,
            bodyPage.skeTables,
            [],
            null,
            [],
            {} as any,
            0,
            0,
            {},
            { scaleX: 1, scaleY: 1 }
        );

        expect(fillStyles).toEqual(['#000000']);
        expect(ctx.fill).toHaveBeenCalledTimes(1);
        expect(rects).toEqual([
            [0.5, 0.5, 10, 6],
            [10.5, 0.5, 10.5, 6],
        ]);

        documents.dispose();
    });

    it('uses the document unit id to apply table horizontal viewport while drawing', () => {
        const bodyPage = createPage(DocumentSkeletonPageType.BODY, '');
        attachTable(bodyPage);

        const skeleton = {
            getViewModel: () => ({
                getDataModel: () => ({
                    getUnitId: () => 'doc-unit-1',
                }),
            }),
        } as any;
        const documents = new Documents('not-the-unit-id', skeleton, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });

        const queriedUnitIds: string[] = [];
        setDocsTableRenderViewportProvider((unitId, tableId) => {
            queriedUnitIds.push(`${unitId}:${tableId}`);
            if (unitId !== 'doc-unit-1' || tableId !== 'table-1') {
                return null;
            }

            return {
                contentWidth: 240,
                leadingInsetLeft: 40,
                scrollLeft: 80,
                viewportWidth: 120,
            };
        });

        const ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            getScale: vi.fn(() => ({ scaleX: 1, scaleY: 1 })),
            beginPath: vi.fn(),
            rect: vi.fn(),
            fill: vi.fn(),
            rectByPrecision: vi.fn(),
            closePath: vi.fn(),
            clip: vi.fn(),
            set fillStyle(_value: string) {},
        } as any;

        const translateCalls: Array<[number | undefined, number | undefined]> = [];
        const liquid = (documents as any)._drawLiquid;
        vi.spyOn(liquid, 'translate').mockImplementation((...args: unknown[]) => {
            const [x, y] = args as [number | undefined, number | undefined];
            translateCalls.push([x, y]);
            liquid.translateBy(liquid.x + (x ?? 0), liquid.y + (y ?? 0));
        });
        vi.spyOn(documents as any, '_drawTableCell').mockImplementation(() => {});

        (documents as any)._drawTable(
            ctx,
            bodyPage,
            bodyPage.skeTables,
            [],
            null,
            [],
            {} as any,
            0,
            0,
            {},
            { scaleX: 1, scaleY: 1 }
        );

        expect(queriedUnitIds).toEqual(['doc-unit-1:table-1']);
        expect(ctx.clip).toHaveBeenCalledTimes(1);
        expect(ctx.rectByPrecision).toHaveBeenCalledWith(-20, 30, 124, 64);
        expect(translateCalls).toContainEqual([-80, 0]);

        documents.dispose();
    });

    it('clips oversized tables on first render before a table viewport state exists', () => {
        const bodyPage = createPage(DocumentSkeletonPageType.BODY, '');
        attachTable(bodyPage);
        const table = bodyPage.skeTables.get('table-1')!;
        table.width = 260;
        table.rows[0].cells[0].pageWidth = 260;

        const documents = new Documents('docs-main', {
            getSkeletonData: () => ({ pages: [bodyPage] }),
            getViewModel: () => ({
                getSnapshot: () => ({
                    documentStyle: {
                        documentFlavor: DocumentFlavor.TRADITIONAL,
                    },
                }),
            }),
        } as any, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });

        const ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            getScale: vi.fn(() => ({ scaleX: 1, scaleY: 1 })),
            beginPath: vi.fn(),
            rect: vi.fn(),
            fill: vi.fn(),
            rectByPrecision: vi.fn(),
            closePath: vi.fn(),
            clip: vi.fn(),
            set fillStyle(_value: string) {},
        } as any;

        vi.spyOn(documents as any, '_drawTableCell').mockImplementation(() => {});

        (documents as any)._drawTable(
            ctx,
            bodyPage,
            bodyPage.skeTables,
            [],
            null,
            [],
            {} as any,
            0,
            0,
            {},
            { scaleX: 1, scaleY: 1 }
        );

        expect(ctx.clip).toHaveBeenCalledTimes(1);
        expect(ctx.rectByPrecision).toHaveBeenCalledWith(20, 30, 172, 64);

        documents.dispose();
    });

    it('does not clip DOCX tables that extend into margins while fitting the physical page', () => {
        const bodyPage = createPage(DocumentSkeletonPageType.BODY, '');
        attachTable(bodyPage);
        const table = bodyPage.skeTables.get('table-1')!;
        table.left = -6;
        table.width = 190;
        table.tableSource = {
            docxWidth: {
                value: '2850',
                type: 'dxa',
            },
        };
        table.rows[0].cells[0].pageWidth = 190;

        const documents = new Documents('docs-main', {
            getSkeletonData: () => ({ pages: [bodyPage] }),
        } as any, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });

        const ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            getScale: vi.fn(() => ({ scaleX: 1, scaleY: 1 })),
            beginPath: vi.fn(),
            rect: vi.fn(),
            fill: vi.fn(),
            rectByPrecision: vi.fn(),
            closePath: vi.fn(),
            clip: vi.fn(),
            set fillStyle(_value: string) {},
        } as any;

        vi.spyOn(documents as any, '_drawTableCell').mockImplementation(() => {});
        vi.spyOn(documents as any, '_getDocumentCompatibilityPolicy').mockReturnValue(
            getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL)
        );

        (documents as any)._drawTable(
            ctx,
            bodyPage,
            bodyPage.skeTables,
            [],
            null,
            [],
            {} as any,
            0,
            0,
            {},
            { scaleX: 1, scaleY: 1 }
        );

        expect(ctx.clip).not.toHaveBeenCalled();

        documents.dispose();
    });

    it('uses explicit table cell border width and skips no-border markers', () => {
        const skeleton = { getSkeletonData: () => ({ pages: [] }) } as any;
        const documents = new Documents('docs-border', skeleton, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });
        const cell = createPage(DocumentSkeletonPageType.CELL, 'cell-seg');
        cell.marginLeft = 0;
        cell.marginTop = 0;
        cell.pageWidth = 120;
        cell.pageHeight = 60;
        const row = {
            cells: [cell],
            rowSource: {
                tableCells: [{
                    borderTop: { color: { rgb: '#ff0000' }, width: { v: 5 } },
                    borderBottom: { color: { rgb: 'transparent' }, width: { v: 0 } },
                    borderLeft: { color: { rgb: 'transparent' }, width: { v: 0 } },
                    borderRight: { color: { rgb: 'transparent' }, width: { v: 0 } },
                }],
            },
        } as any;
        cell.parent = row;
        (documents as any)._drawLiquid = { x: 0, y: 0 };

        const lineWidths: number[] = [];
        const strokeStyles: string[] = [];
        const ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            fillRectByPrecision: vi.fn(),
            setLineWidthByPrecision: vi.fn((width: number) => lineWidths.push(width)),
            beginPath: vi.fn(),
            moveToByPrecision: vi.fn(),
            lineToByPrecision: vi.fn(),
            setLineDash: vi.fn(),
            stroke: vi.fn(),
            closePathByEnv: vi.fn(),
            set strokeStyle(value: string) {
                strokeStyles.push(value);
            },
        } as any;

        (documents as any)._drawTableCellBordersAndBg(ctx, { marginLeft: 0, marginTop: 0 }, cell);

        expect(lineWidths).toEqual([5]);
        expect(strokeStyles).toEqual(['#ff0000']);
        expect(ctx.stroke).toHaveBeenCalledTimes(1);

        documents.dispose();
    });

    it('draws column group child pages at their column offsets', () => {
        const bodyPage = createPage(DocumentSkeletonPageType.BODY, '');
        bodyPage.sections[0].columns[0].lines = [];
        bodyPage.marginLeft = 0;
        bodyPage.marginTop = 0;
        bodyPage.renderConfig.centerAngle = 0;
        bodyPage.renderConfig.vertexAngle = 0;
        attachColumnGroup(bodyPage);

        const skeletonData = {
            pages: [bodyPage],
            skeHeaders: new Map(),
            skeFooters: new Map(),
        };
        bodyPage.parent = skeletonData;

        const documents = new Documents('docs-column-group', {
            getSkeletonData: () => skeletonData,
        } as any, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });
        documents.transformByState({
            left: 0,
            top: 0,
            width: 260,
            height: 180,
        });
        scene.addObject(documents, 1);

        const spanRecords: Array<{ content: string; x: number }> = [];
        const spanExtension = {
            uKey: 'DocsSpanExtension',
            type: DOCS_EXTENSION_TYPE.SPAN,
            extensionOffset: {},
            clearCache: vi.fn(),
            draw: vi.fn(function (this: any, _ctx: unknown, _parentScale: unknown, glyph: any) {
                if (['L', 'R'].includes(glyph.content)) {
                    spanRecords.push({
                        content: glyph.content,
                        x: this.extensionOffset.spanStartPoint.x,
                    });
                }
            }),
        };
        vi.spyOn(documents as any, 'getExtensionsByOrder').mockReturnValue([
            spanExtension,
        ] as any);

        documents.draw(canvas.getContext(), {
            viewBound: { left: 0, top: 0, right: 900, bottom: 700 },
            cacheBound: { left: 0, top: 0, right: 900, bottom: 700 },
        } as any);

        expect(spanRecords.map((record) => record.content)).toEqual(['L', 'R']);
        expect(spanRecords[1].x - spanRecords[0].x).toBeGreaterThanOrEqual(90);

        documents.dispose();
    });

    it('clips table cell content with parent page margins', () => {
        const bodyPage = createPage(DocumentSkeletonPageType.BODY, '');
        bodyPage.marginLeft = 30;
        bodyPage.marginTop = 40;
        const cell = createPage(DocumentSkeletonPageType.CELL, 'cell-seg');
        cell.marginLeft = 4;
        cell.marginTop = 6;
        cell.pageWidth = 120;
        cell.pageHeight = 60;
        cell.sections[0].columns[0].lines = [];

        const documents = new Documents('docs-table-cell-clip');
        (documents as any)._drawLiquid = {
            x: 12,
            y: 20,
            translateSave: vi.fn(),
            translateRestore: vi.fn(),
            translateSection: vi.fn(),
            translateColumn: vi.fn(),
        };
        const ctx = {
            beginPath: vi.fn(),
            clip: vi.fn(),
            closePath: vi.fn(),
            rectByPrecision: vi.fn(),
            restore: vi.fn(),
            save: vi.fn(),
        } as any;

        (documents as any)._drawNestedPageContent(
            ctx,
            bodyPage,
            cell,
            [],
            null,
            [],
            { x: 0, y: 0 },
            0,
            0,
            {},
            { scaleX: 1, scaleY: 1 }
        );

        expect(ctx.rectByPrecision).toHaveBeenCalledWith(42, 60, 120, 60);

        documents.dispose();
    });

    it('clips column group nested page content with the column align offset', () => {
        const bodyPage = createPage(DocumentSkeletonPageType.BODY, '');
        bodyPage.marginLeft = 30;
        bodyPage.marginTop = 40;
        attachColumnGroup(bodyPage);
        const columnGroup = bodyPage.skeColumnGroups.get('column-group-1')!;
        const nestedPage = columnGroup.columns[0].page;
        nestedPage.marginLeft = 4;
        nestedPage.marginTop = 6;
        nestedPage.sections[0].columns[0].lines = [];

        const documents = new Documents('docs-column-group-clip');
        (documents as any)._drawLiquid = {
            x: 12,
            y: 20,
            translateSave: vi.fn(),
            translateRestore: vi.fn(),
            translateSection: vi.fn(),
            translateColumn: vi.fn(),
        };
        const ctx = {
            beginPath: vi.fn(),
            clip: vi.fn(),
            closePath: vi.fn(),
            rectByPrecision: vi.fn(),
            restore: vi.fn(),
            save: vi.fn(),
        } as any;

        (documents as any)._drawNestedPageContent(
            ctx,
            bodyPage,
            nestedPage,
            [],
            null,
            [],
            { x: 100, y: 200 },
            0,
            0,
            {},
            { scaleX: 1, scaleY: 1 }
        );

        expect(ctx.rectByPrecision).toHaveBeenCalledWith(116, 226, 200, 420);

        documents.dispose();
    });

    it('draws tables inside column group nested pages', () => {
        const bodyPage = createPage(DocumentSkeletonPageType.BODY, '');
        attachColumnGroup(bodyPage);
        const nestedPage = bodyPage.skeColumnGroups.get('column-group-1')!.columns[0].page;
        attachTable(nestedPage);
        nestedPage.marginLeft = 4;
        nestedPage.marginTop = 6;
        nestedPage.sections[0].columns[0].lines = [];

        const documents = new Documents('docs-column-group-table');
        const translate = vi.fn();
        (documents as any)._drawLiquid = {
            x: 12,
            y: 20,
            translateSave: vi.fn(),
            translateRestore: vi.fn(),
            translate,
            translateSection: vi.fn(),
            translateColumn: vi.fn(),
        };
        const ctx = {
            beginPath: vi.fn(),
            clip: vi.fn(),
            closePath: vi.fn(),
            rectByPrecision: vi.fn(),
            restore: vi.fn(),
            save: vi.fn(),
        } as any;
        const drawTable = vi.spyOn(documents as any, '_drawTable').mockImplementation(() => undefined);

        (documents as any)._drawNestedPageContent(
            ctx,
            bodyPage,
            nestedPage,
            [],
            null,
            [],
            { x: 0, y: 0 },
            0,
            0,
            {},
            { scaleX: 1, scaleY: 1 }
        );

        expect(drawTable).toHaveBeenCalledWith(
            ctx,
            expect.objectContaining({
                marginLeft: 0,
                marginTop: 0,
            }),
            nestedPage.skeTables,
            [],
            null,
            [],
            { x: 0, y: 0 },
            0,
            0,
            {},
            { scaleX: 1, scaleY: 1 }
        );
        expect(translate).toHaveBeenCalledWith(4, 6);

        documents.dispose();
    });

    it('does not draw persistent backgrounds behind column group columns', () => {
        const bodyPage = createPage(DocumentSkeletonPageType.BODY, '');
        bodyPage.marginLeft = 3;
        bodyPage.marginTop = 5;
        attachColumnGroup(bodyPage);
        const documents = new Documents('docs-column-group-background');
        const translateSave = vi.fn();
        const translateRestore = vi.fn();
        const translate = vi.fn();
        (documents as any)._drawLiquid = {
            x: 10,
            y: 20,
            translateSave,
            translateRestore,
            translate,
        };
        const rects: Array<{ x: number; y: number; width: number; height: number }> = [];
        const fillStyles: string[] = [];
        const ctx = {
            beginPath: vi.fn(),
            closePath: vi.fn(),
            fill: vi.fn(),
            getScale: () => ({ scaleX: 1, scaleY: 1 }),
            rect: vi.fn((x: number, y: number, width: number, height: number) => {
                rects.push({ x, y, width, height });
            }),
            restore: vi.fn(),
            save: vi.fn(),
            set fillStyle(value: string) {
                fillStyles.push(value);
            },
        } as any;
        const drawNestedPageContent = vi
            .spyOn(documents as any, '_drawNestedPageContent')
            .mockImplementation(() => undefined);

        (documents as any)._drawColumnGroups(
            ctx,
            bodyPage,
            bodyPage.skeColumnGroups,
            [],
            null,
            [],
            { x: 0, y: 0 },
            0,
            0,
            {},
            { scaleX: 1, scaleY: 1 }
        );

        expect(fillStyles).toEqual([]);
        expect(rects).toEqual([]);
        expect(ctx.fill).not.toHaveBeenCalled();
        expect(drawNestedPageContent).toHaveBeenCalledTimes(2);

        documents.dispose();
    });

    it('draws body/header/footer/table flows with extension dispatch and page events', () => {
        const bodyPage = createPage(DocumentSkeletonPageType.BODY, '');
        const headerPage = createPage(DocumentSkeletonPageType.HEADER, 'header-main');
        const footerPage = createPage(DocumentSkeletonPageType.FOOTER, 'footer-main');
        bodyPage.marginLeft = 48;
        headerPage.marginLeft = 0;
        attachTable(bodyPage);
        attachTable(headerPage);

        const skeletonData = {
            pages: [bodyPage],
            skeHeaders: new Map([['header-main', new Map([[bodyPage.pageWidth, headerPage]])]]),
            skeFooters: new Map([['footer-main', new Map([[bodyPage.pageWidth, footerPage]])]]),
        };
        bodyPage.parent = skeletonData;
        headerPage.parent = skeletonData;
        footerPage.parent = skeletonData;

        const skeleton = {
            getSkeletonData: () => skeletonData,
        } as any;

        const documents = new Documents('docs-main', skeleton, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 6,
            pageMarginTop: 8,
        });
        documents.transformByState({
            left: 12,
            top: 16,
            width: 260,
            height: 180,
        });
        scene.addObject(documents, 1);

        const lineDraw = vi.fn();
        const bgDraw = vi.fn();
        const spanDraw = vi.fn();
        const clearCache = vi.fn();

        vi.spyOn(documents as any, 'getExtensionsByOrder').mockReturnValue([
            {
                uKey: 'DefaultDocsBackgroundExtension',
                type: DOCS_EXTENSION_TYPE.SPAN,
                extensionOffset: {},
                clearCache,
                draw: bgDraw,
            },
            {
                uKey: 'DocsLineExtension',
                type: DOCS_EXTENSION_TYPE.LINE,
                extensionOffset: {},
                clearCache,
                draw: lineDraw,
            },
            {
                uKey: 'DocsSpanExtension',
                type: DOCS_EXTENSION_TYPE.SPAN,
                extensionOffset: {},
                clearCache,
                draw: spanDraw,
            },
        ] as any);

        const pageEvents: string[] = [];
        documents.pageRender$.subscribe((event) => {
            pageEvents.push(`${event.page.pageNumber}:${Math.round(event.pageTop)}`);
        });

        const offsetConfig = documents.getOffsetConfig();
        expect(offsetConfig.pageMarginLeft).toBe(6);
        expect(documents.getEngine()).toBe(engine);
        const tableDraw = vi.spyOn(documents as any, '_drawTable');

        documents.draw(canvas.getContext(), {
            viewBound: { left: 0, top: 0, right: 900, bottom: 700 },
            cacheBound: { left: 0, top: 0, right: 900, bottom: 700 },
        } as any);

        expect(pageEvents.length).toBe(1);
        expect(clearCache).toHaveBeenCalled();
        expect(lineDraw).toHaveBeenCalled();
        expect(spanDraw).toHaveBeenCalled();
        expect(tableDraw).toHaveBeenCalledTimes(2);
        expect(tableDraw.mock.calls[1][1]).toMatchObject({
            marginLeft: 48,
            type: DocumentSkeletonPageType.HEADER,
        });

        documents.draw(canvas.getContext(), {
            viewBound: { left: 2000, top: 2000, right: 2200, bottom: 2200 },
            cacheBound: { left: 2000, top: 2000, right: 2200, bottom: 2200 },
        } as any);
        expect(pageEvents.length).toBe(1);

        const newSkeleton = { getSkeletonData: () => skeletonData } as any;
        expect(documents.changeSkeleton(newSkeleton as any)).toBe(documents);
        (documents as any)._drawLiquid = null;
        documents.draw(canvas.getContext(), {
            viewBound: { left: 0, top: 0, right: 300, bottom: 300 },
        } as any);

        documents.dispose();
    });

    it('draws footer table backgrounds relative to the footer parent area', () => {
        const parentPage = createPage(DocumentSkeletonPageType.BODY, '');
        parentPage.marginLeft = 48;
        parentPage.marginTop = 12;

        const footerPage = createPage(DocumentSkeletonPageType.FOOTER, 'footer-main');
        footerPage.sections = [];
        attachTable(footerPage);

        const skeleton = { getSkeletonData: () => ({ pages: [] }) } as any;
        const documents = new Documents('docs-footer-table-offset', skeleton, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });

        const rects: Array<{ x: number; y: number; width: number; height: number }> = [];
        const ctx = {
            beginPath: vi.fn(),
            closePath: vi.fn(),
            fill: vi.fn(),
            getScale: () => ({ scaleX: 1, scaleY: 1 }),
            rect: vi.fn((x: number, y: number, width: number, height: number) => {
                rects.push({ x, y, width, height });
            }),
            restore: vi.fn(),
            save: vi.fn(),
            set fillStyle(_value: string) {},
        } as any;
        vi.spyOn(documents as any, '_drawTableCell').mockImplementation(() => undefined);

        (documents as any)._drawHeaderFooter(
            footerPage,
            ctx,
            [],
            null,
            [],
            Vector2.create(0, 300),
            0,
            0,
            {},
            { scaleX: 1, scaleY: 1 },
            parentPage,
            false
        );

        expect(rects).toEqual([{
            x: 60,
            y: 332,
            width: 120,
            height: 60,
        }]);

        documents.dispose();
    });

    it('draws lower-page header content for DOCX page-relative header backgrounds', () => {
        const bodyPage = createPage(DocumentSkeletonPageType.BODY, '');
        bodyPage.sections[0].columns[0].lines = [];
        bodyPage.skeTables.clear();

        const headerPage = createPage(DocumentSkeletonPageType.HEADER, 'header-main');
        const headerLine = createLine(LineType.PARAGRAPH, 260);
        headerLine.parent = headerPage.sections[0].columns[0];
        headerPage.sections[0].columns[0].lines = [headerLine];
        headerPage.skeTables.clear();

        const skeletonData = {
            pages: [bodyPage],
            skeHeaders: new Map([['header-main', new Map([[bodyPage.pageWidth, headerPage]])]]),
            skeFooters: new Map(),
        };
        bodyPage.parent = skeletonData;
        headerPage.parent = skeletonData;

        const documents = new Documents('docs-page-header-background', { getSkeletonData: () => skeletonData } as any, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });
        documents.transformByState({
            left: 0,
            top: 0,
            width: 260,
            height: 480,
        });
        scene.addObject(documents, 1);

        const spanDraw = vi.fn();
        vi.spyOn(documents as any, 'getExtensionsByOrder').mockReturnValue([
            {
                uKey: 'DocsSpanExtension',
                type: DOCS_EXTENSION_TYPE.SPAN,
                extensionOffset: {},
                clearCache: vi.fn(),
                draw: spanDraw,
            },
        ] as any);

        documents.draw(canvas.getContext(), {
            viewBound: { left: 0, top: 0, right: 900, bottom: 700 },
            cacheBound: { left: 0, top: 0, right: 900, bottom: 700 },
        } as any);

        expect(spanDraw).toHaveBeenCalled();

        documents.dispose();
    });

    it('merges adjacent glyph backgrounds with the same color into one draw per line', () => {
        const bodyPage = createPage(DocumentSkeletonPageType.BODY, '', '#d9eaf7');
        const skeletonData = {
            pages: [bodyPage],
            skeHeaders: new Map(),
            skeFooters: new Map(),
        };
        bodyPage.parent = skeletonData;

        const skeleton = {
            getSkeletonData: () => skeletonData,
        } as any;

        const documents = new Documents('docs-merged-background', skeleton, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });
        documents.transformByState({
            left: 0,
            top: 0,
            width: 260,
            height: 180,
        });
        scene.addObject(documents, 1);

        const bgDraw = vi.fn();
        vi.spyOn(documents as any, 'getExtensionsByOrder').mockReturnValue([
            {
                uKey: 'DefaultDocsBackgroundExtension',
                type: DOCS_EXTENSION_TYPE.SPAN,
                extensionOffset: {},
                clearCache: vi.fn(),
                draw: bgDraw,
            },
        ] as any);

        documents.draw(canvas.getContext(), {
            viewBound: { left: 0, top: 0, right: 900, bottom: 700 },
            cacheBound: { left: 0, top: 0, right: 900, bottom: 700 },
        } as any);

        expect(bgDraw).toHaveBeenCalledTimes(1);
        expect(bgDraw.mock.calls.map((call) => call[2].width)).toEqual([34]);

        documents.dispose();
    });

    it('draws paragraph background colors behind line text', () => {
        const bodyPage = createPage(DocumentSkeletonPageType.BODY, '');
        const paragraphLine = createLine(LineType.PARAGRAPH, 24);
        paragraphLine.backgroundColor = { rgb: '#ffffff' };
        paragraphLine.parent = bodyPage.sections[0].columns[0];
        bodyPage.sections[0].columns[0].lines = [paragraphLine];
        bodyPage.skeTables.clear();

        const skeletonData = {
            pages: [bodyPage],
            skeHeaders: new Map(),
            skeFooters: new Map(),
        };
        bodyPage.parent = skeletonData;

        const skeleton = {
            getSkeletonData: () => skeletonData,
        } as any;

        const documents = new Documents('docs-paragraph-background', skeleton, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });
        documents.transformByState({
            left: 0,
            top: 0,
            width: 260,
            height: 180,
        });
        scene.addObject(documents, 1);

        const ctx = canvas.getContext();
        const fillRect = vi.spyOn(ctx, 'fillRect');

        documents.draw(ctx, {
            viewBound: { left: 0, top: 0, right: 900, bottom: 700 },
            cacheBound: { left: 0, top: 0, right: 900, bottom: 700 },
        } as any);

        expect(fillRect).toHaveBeenCalled();

        documents.dispose();
    });
});
