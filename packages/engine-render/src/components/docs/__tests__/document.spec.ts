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

import type { IDocumentBody, IParagraphStyle, ITable } from '@univerjs/core';
import { ColumnSeparatorType, CustomRangeType, DashStyleType, DataStreamTreeTokenType, DocumentDataModel, DocumentFlavor, HorizontalAlign, LocaleService, ObjectRelativeFromH, ObjectRelativeFromV, TableAlignmentType, TableRowHeightRule, TableSizeType, TableTextWrapType, TabStopAlignment, Univer } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupRenderTestEnv } from '../../../__tests__/render-test-utils';
import { BORDER_TYPE } from '../../../basics/const';
import {
    DocumentSkeletonPageType,
    GlyphType,
    LineType,
    PageLayoutType,
} from '../../../basics/i-document-skeleton-cached';
import { Vector2 } from '../../../basics/vector2';
import { Canvas } from '../../../canvas';
import { UniverRenderingContext } from '../../../context';
import { Engine } from '../../../engine';
import { MAIN_VIEW_PORT_KEY, Scene } from '../../../scene';
import { Path, Rect } from '../../../shape';
import { Viewport } from '../../../viewport';
import { DocBackground } from '../doc-background';
import { DOCS_EXTENSION_TYPE } from '../doc-extension';
import { Documents, drawSectionColumnSeparators, resolveHeaderFooterFieldGlyph } from '../document';
import { createParagraphLayoutTestBed } from '../layout/block/paragraph/__tests__/create-paragraph-layout-test-bed';
import { DocumentSkeleton } from '../layout/doc-skeleton';
import { setDocsTableRenderViewportProvider } from '../table-render-viewport';
import { DocumentEditArea, DocumentViewModel } from '../view-model/document-view-model';

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
    it('resolves PAGE and NUMPAGES fields without mutating the model glyph', () => {
        const glyph = { st: 1, ed: 1, content: '1' } as any;
        const pageRange = { startIndex: 0, endIndex: 2, properties: { fieldType: 'PAGE' } } as any;
        const pageCountRange = { startIndex: 0, endIndex: 2, properties: { fieldType: 'NUMPAGES' } } as any;

        expect(resolveHeaderFooterFieldGlyph(glyph, 1, 1, [pageRange], 15, 16).content).toBe('15');
        expect(resolveHeaderFooterFieldGlyph(glyph, 1, 1, [pageCountRange], 15, 16).content).toBe('16');
        expect(glyph.content).toBe('1');
    });
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

    it.each(['separator', 'continuationSeparator', 'continuationNotice'] as const)('renders each note kind with its own %s fields', (kind) => {
        const fieldBody = (fieldType: string) => ({
            dataStream: '\uFFFC\r\n',
            paragraphs: [{ startIndex: 1, paragraphId: 'field' }],
            sectionBreaks: [{ startIndex: 2, sectionId: 'field-section' }],
            customRanges: [{ rangeId: fieldType, rangeType: CustomRangeType.FIELD, startIndex: 0, endIndex: 0, properties: { fieldType } }],
        });
        const footnoteBody = fieldBody('PAGE');
        const endnoteBody = fieldBody('NUMPAGES');
        const bed = createParagraphLayoutTestBed('Reference\uFFFC\uFFFC', {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
            body: {
                customRanges: ['footnote', 'endnote'].map((type, index) => ({
                    rangeId: type,
                    rangeType: index === 0 ? CustomRangeType.FOOTNOTE : CustomRangeType.ENDNOTE,
                    startIndex: 9 + index,
                    endIndex: 9 + index,
                    wholeEntity: true,
                    properties: { noteId: type },
                })),
            },
            notes: Object.fromEntries(['footnote', 'endnote'].map((type) => [type, { noteId: type, type, body: fieldBody('PAGE') }])),
            noteSettings: { footnote: { [kind]: footnoteBody }, endnote: { [kind]: endnoteBody } },
        });
        const skeleton = DocumentSkeleton.create(bed.viewModel, bed.ctx.docsConfig.localeService);
        const documents = new Documents('note-fields', skeleton);
        try {
            skeleton.calculate();
            const page = skeleton.getSkeletonData()!.pages[0];
            const fragments = page.notes!;
            // Render both kinds on the same body page, including continuation decorations.
            page.noteDecorations = fragments.map((note) => ({
                noteType: bed.dataModel.getSnapshot().notes![note.noteId].type,
                kind,
                left: note.left,
                top: note.top,
                page: note.page,
            }));
            const render = vi.spyOn(documents as unknown as { _drawHeaderFooter: (...args: unknown[]) => void }, '_drawHeaderFooter');
            documents.draw(canvas.getContext());
            for (const decoration of page.noteDecorations) {
                const call = render.mock.calls.find((args) => args[0] === decoration.page);
                expect(call).toBeDefined();
                expect(call![14]).toEqual(decoration.noteType === 'endnote' ? endnoteBody.customRanges : footnoteBody.customRanges);
            }
            expect(page.noteDecorations.map((note) => note.noteType).sort()).toEqual(['endnote', 'footnote']);
        } finally {
            documents.dispose();
            skeleton.dispose();
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });

    it('hit tests table content and controls that overflow the document bounds', () => {
        const bodyPage = createPage(DocumentSkeletonPageType.BODY, '');
        attachTable(bodyPage);
        const table = bodyPage.skeTables.get('table-1')!;
        table.width = 260;
        table.rows[0].cells[0].pageWidth = 260;
        const skeletonData = {
            pages: [bodyPage],
            skeHeaders: new Map(),
            skeFooters: new Map(),
        };
        const documents = new Documents('docs-overflow-hit', {
            getSkeletonData: () => skeletonData,
        } as any, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });
        documents.transformByState({
            left: 0,
            top: 0,
            width: 200,
            height: 420,
        });
        scene.addObject(documents, 1);

        expect(documents.isHit(Vector2.create(250, 50))).toBe(true);
        expect(documents.isHit(Vector2.create(250, 12))).toBe(true);
        expect(documents.isHit(Vector2.create(250, 130))).toBe(false);

        documents.dispose();
    });

    it('hit tests a horizontally projected table to the left of the document bounds', () => {
        const bodyPage = createPage(DocumentSkeletonPageType.BODY, '');
        attachTable(bodyPage);
        const table = bodyPage.skeTables.get('table-1')!;
        table.width = 260;
        table.rows[0].cells[0].pageWidth = 260;
        const skeletonData = {
            pages: [bodyPage],
            skeHeaders: new Map(),
            skeFooters: new Map(),
        };
        const documents = new Documents('docs-left-overflow-hit', {
            getSkeletonData: () => skeletonData,
        } as any, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });
        documents.transformByState({
            left: 0,
            top: 0,
            width: 200,
            height: 420,
        });
        scene.addObject(documents, 1);
        setDocsTableRenderViewportProvider((unitId, tableId) => unitId === 'docs-left-overflow-hit' && tableId === 'table-1'
            ? {
                contentWidth: 260,
                leadingInsetLeft: 80,
                scrollLeft: 0,
                viewportLeft: -20,
                viewportWidth: 200,
            }
            : null);

        expect(documents.isHit(Vector2.create(-40, 50))).toBe(true);
        expect(documents.isHit(Vector2.create(-40, 12))).toBe(true);
        expect(documents.isHit(Vector2.create(-70, 50))).toBe(false);

        documents.dispose();
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

    it.each([
        { a: 1, d: 1, e: 0, f: 0 },
        { a: 1.25, d: 1.25, e: 0.35, f: 0.7 },
        { a: 2, d: 2, e: 1.1, f: 2.3 },
        { a: 1.5, d: 2, e: -0.7, f: -1.3 },
    ])('paints traditional table borders on whole device pixels at $a/$d scale', ({ a, d, e, f }) => {
        const bed = createParagraphLayoutTestBed('Table', {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
        });
        const skeleton = DocumentSkeleton.create(bed.viewModel, bed.ctx.docsConfig.localeService);
        const documents = new Documents('pixel-table-border', skeleton);
        const ctx = canvas.getContext();
        ctx.setTransform(a, 0, 0, d, e, f);
        const move = vi.spyOn(ctx, 'moveTo');
        const line = vi.spyOn(ctx, 'lineTo');
        const widths: number[] = [];
        vi.spyOn(ctx, 'stroke').mockImplementation(() => {
            widths.push(ctx.lineWidth);
        });
        const position = { startX: 10.99, startY: 20.99, endX: 110.1, endY: 80.4 };
        const savedPosition = { ...position };
        try {
            for (const width of [2 / 3, 1, 2]) {
                const border = { color: { rgb: '#000000' }, width: { v: width } };
                for (const side of [BORDER_TYPE.TOP, BORDER_TYPE.RIGHT, BORDER_TYPE.BOTTOM, BORDER_TYPE.LEFT]) {
                    (documents as any)._drawTableCellBorder(ctx, border, side, position);
                    const horizontal = side === BORDER_TYPE.TOP || side === BORDER_TYPE.BOTTOM;
                    const scale = horizontal ? d : a;
                    const paintedWidth = widths[widths.length - 1] * scale;
                    const start = move.mock.calls[move.mock.calls.length - 1];
                    const end = line.mock.calls[line.mock.calls.length - 1];
                    const center = horizontal ? start[1] * d + f : start[0] * a + e;
                    expect(paintedWidth).toBeGreaterThanOrEqual(1);
                    expect(Math.abs(paintedWidth - width * scale)).toBeLessThanOrEqual(0.5);
                    expect(center - paintedWidth / 2).toBeCloseTo(Math.round(center - paintedWidth / 2), 10);
                    expect(center + paintedWidth / 2).toBeCloseTo(Math.round(center + paintedWidth / 2), 10);
                    expect(horizontal ? end[1] : end[0]).toBe(horizontal ? start[1] : start[0]);
                    const modelX = side === BORDER_TYPE.LEFT ? position.startX : position.endX;
                    const modelY = side === BORDER_TYPE.TOP ? position.startY : position.endY;
                    const modelCenter = horizontal ? modelY * d + f : modelX * a + e;
                    const originalInkEdge = modelCenter - width * scale / 2;
                    expect(Math.abs(center - paintedWidth / 2 - originalInkEdge)).toBeLessThanOrEqual(0.5);
                    expect(border.width.v).toBe(width);
                }
            }
            expect(position).toEqual(savedPosition);
            expect(ctx.getTransform()).toMatchObject({ a, b: 0, c: 0, d, e, f });
        } finally {
            documents.dispose();
            skeleton.dispose();
            bed.viewModel.dispose();
        }
    });

    it.each([
        { flavor: DocumentFlavor.MODERN, rotated: false },
        { flavor: DocumentFlavor.TRADITIONAL, rotated: true },
    ])('retains the existing stroke path for $flavor with rotation=$rotated', ({ flavor, rotated }) => {
        const bed = createParagraphLayoutTestBed('Table', { documentStyle: { documentFlavor: flavor } });
        const skeleton = DocumentSkeleton.create(bed.viewModel, bed.ctx.docsConfig.localeService);
        const documents = new Documents('unsnapped-table-border', skeleton);
        const ctx = canvas.getContext();
        if (rotated) {
            ctx.rotate(Math.PI / 4);
        }
        const move = vi.spyOn(ctx, 'moveToByPrecision');
        const width = vi.spyOn(ctx, 'setLineWidthByPrecision');
        try {
            (documents as any)._drawTableCellBorder(
                ctx,
                { width: { v: 2 / 3 } },
                BORDER_TYPE.TOP,
                { startX: 10, startY: 20, endX: 100, endY: 80 }
            );
            expect(move).toHaveBeenCalledWith(10, 20);
            expect(width).toHaveBeenCalledWith(2 / 3);
        } finally {
            documents.dispose();
            skeleton.dispose();
            bed.viewModel.dispose();
        }
    });

    it('draws section column separators between columns', () => {
        const nativeContext = document.createElement('canvas').getContext('2d');
        if (!nativeContext) {
            throw new Error('Expected a canvas 2D context.');
        }
        const ctx = new UniverRenderingContext(nativeContext);
        vi.spyOn(ctx, 'moveToByPrecision');
        vi.spyOn(ctx, 'lineToByPrecision');
        vi.spyOn(ctx, 'stroke');

        drawSectionColumnSeparators(ctx, {
            height: 300,
            colCount: 2,
            top: 0,
            st: 0,
            ed: 0,
            columns: [
                {
                    lines: [],
                    left: 0,
                    width: 120,
                    spaceWidth: 20,
                    separator: ColumnSeparatorType.BETWEEN_EACH_COLUMN,
                    st: 0,
                    ed: 0,
                    drawingLRIds: [],
                    isFull: false,
                },
                {
                    lines: [],
                    left: 140,
                    width: 120,
                    spaceWidth: 0,
                    separator: ColumnSeparatorType.BETWEEN_EACH_COLUMN,
                    st: 0,
                    ed: 0,
                    drawingLRIds: [],
                    isFull: false,
                },
            ],
        }, 500, 96, 72);

        expect(ctx.moveToByPrecision).toHaveBeenCalledWith(226, 72);
        expect(ctx.lineToByPrecision).toHaveBeenCalledWith(226, 572);
        expect(ctx.stroke).toHaveBeenCalledTimes(1);
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

        expect(rectDraw).toHaveBeenCalledTimes(2);
        expect(rectDraw.mock.calls[0][1]).toMatchObject({
            width: 680,
            height: 460,
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

        expect(rectDraw).toHaveBeenCalledTimes(2);

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

        expect(rectDraw).toHaveBeenCalledTimes(1);
        expect(rectDraw.mock.calls[0][1]).toMatchObject({
            width: 610,
            height: 440,
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

    it.each([false, true])('draws styled paragraph borders but skips explicit zero widths (cleared: %s)', (cleared) => {
        const skeleton = { getSkeletonData: () => ({ pages: [] }) } as any;
        const documents = new Documents('docs-paragraph-border', skeleton, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });
        const page = createPage(DocumentSkeletonPageType.BODY, '');
        const line = page.sections[0].columns[0].lines[1];
        line.paragraphPaddingLeft = 8;
        line.paragraphPaddingRight = 12;
        line.borderTop = {
            color: { rgb: 'auto' },
            width: 1,
            padding: 3,
            dashStyle: DashStyleType.DOT,
        };
        line.borderBottom = {
            color: { rgb: '#444444' },
            width: 4,
            padding: 6,
            dashStyle: DashStyleType.DASH,
        };
        line.borderLeft = {
            color: { rgb: '#222222' },
            width: 2,
            padding: 4,
            dashStyle: DashStyleType.SOLID,
        };
        line.borderRight = {
            color: { rgb: '#333333' },
            width: 3,
            padding: 5,
            dashStyle: DashStyleType.DASH,
        };
        if (cleared) {
            for (const border of [line.borderTop, line.borderBottom, line.borderLeft, line.borderRight]) {
                border.width = 0;
            }
        }
        (documents as any)._drawLiquid = { x: 0, y: 0 };

        const strokeStyles: string[] = [];
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
            set strokeStyle(value: string) {
                strokeStyles.push(value);
            },
        } as any;

        (documents as any)._drawParagraphBorders(ctx, page, line, 72);

        if (cleared) {
            expect(ctx.stroke).not.toHaveBeenCalled();
            expect(ctx.setLineWidthByPrecision).not.toHaveBeenCalled();
            documents.dispose();
            return;
        }

        expect(ctx.setLineWidthByPrecision.mock.calls).toEqual([[1], [4], [2], [3]]);
        expect(ctx.setLineDash.mock.calls).toEqual([[[2]], [[6]], [[0]], [[6]]]);
        expect(ctx.lineToByPrecision.mock.calls).toEqual([
            [75, 7],
            [75, 35],
            [14, 35],
            [75, 35],
        ]);
        expect(strokeStyles).toEqual(['rgb(0,0,0)', '#444444', '#222222', '#333333']);
        expect(ctx.stroke).toHaveBeenCalledTimes(4);

        documents.dispose();
    });

    it('limits paragraph backgrounds to the current column width', () => {
        const skeleton = { getSkeletonData: () => ({ pages: [] }) } as any;
        const documents = new Documents('docs-paragraph-background', skeleton, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });
        const page = createPage(DocumentSkeletonPageType.BODY, '');
        const line = page.sections[0].columns[0].lines[1];
        line.backgroundColor = { rgb: '#ffeecc' };
        (documents as any)._drawLiquid = { x: 0, y: 0 };

        const ctx = {
            save: vi.fn(),
            restore: vi.fn(),
            fillRect: vi.fn(),
            getScale: () => ({ scaleX: 1, scaleY: 1 }),
            set fillStyle(_value: string) {},
        } as any;

        (documents as any)._drawLineBackground(ctx, page, line, 72);

        expect(ctx.fillRect).toHaveBeenCalledWith(10, 9, 72, 20);

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

    it('does not clip traditional tables with a model width that extend into margins', () => {
        const bodyPage = createPage(DocumentSkeletonPageType.BODY, '');
        attachTable(bodyPage);
        const table = bodyPage.skeTables.get('table-1')!;
        table.left = -6;
        table.width = 190;
        table.tableSource = {
            size: {
                width: {
                    v: 190,
                },
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
        vi.spyOn(documents as any, '_getDocumentFlavor').mockReturnValue(DocumentFlavor.TRADITIONAL);

        (documents as any)._drawTable(
            ctx,
            bodyPage,
            bodyPage.skeTables,
            [],
            null,
            [],
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

    it('clips nested table cells at the accumulated content origin', () => {
        const parent = createPage(DocumentSkeletonPageType.CELL, 'outer-cell');
        parent.marginLeft = 4;
        parent.marginTop = 6;
        const cell = createPage(DocumentSkeletonPageType.CELL, 'inner-cell');
        cell.pageWidth = 120;
        cell.pageHeight = 60;
        cell.sections[0].columns[0].lines = [];
        const documents = new Documents('docs-nested-table-cell-clip');
        (documents as any)._drawLiquid.translate(12, 20);
        const ctx = {
            beginPath: vi.fn(),
            clip: vi.fn(),
            closePath: vi.fn(),
            rectByPrecision: vi.fn(),
            restore: vi.fn(),
            save: vi.fn(),
        };

        (documents as any)._drawNestedPageContent(
            ctx,
            parent,
            cell,
            [],
            null,
            [],
            [],
            Vector2.create(30, 40),
            0,
            0,
            {},
            { scaleX: 1, scaleY: 1 }
        );

        expect(ctx.rectByPrecision).toHaveBeenCalledWith(42, 60, 120, 60);
        expect((documents as any)._drawLiquid).toMatchObject({ x: 12, y: 20 });
        documents.dispose();
    });

    it.each([TableTextWrapType.NONE, TableTextWrapType.WRAP])('clips flow tables but preserves floating table overflow beyond the anchor cell: %s', (textWrap) => {
        const parent = createPage(DocumentSkeletonPageType.BODY, '');
        const cell = createPage(DocumentSkeletonPageType.CELL, 'anchor');
        cell.pageWidth = 50;
        cell.sections[0].columns[0].lines = [];
        attachTable(cell);
        const table = cell.skeTables.get('table-1');
        table.tableSource.textWrap = textWrap;
        table.tableSource.size = { width: { v: 120 } };
        table.tableSource.tableColumns = [{ size: { width: { v: 120 } } }];
        table.rows[0].cells[0].sections[0].columns[0].lines = [];
        const univer = new Univer();
        const model = new DocumentDataModel({
            id: 'floating-table-cell-overflow',
            body: { dataStream: '\r\n' },
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(model), univer.__getInjector().get(LocaleService));
        const documents = new Documents(model.getUnitId(), skeleton);
        const ctx = canvas.getContext();
        const clip = vi.spyOn(ctx, 'clip');
        const fill = vi.spyOn(ctx, 'fill');

        (documents as any)._drawNestedPageContent(
            ctx,
            parent,
            cell,
            [],
            null,
            [],
            [],
            Vector2.create(10, 12),
            0,
            0,
            {},
            { scaleX: 1, scaleY: 1 }
        );

        expect(fill).toHaveBeenCalled();
        expect(clip).toHaveBeenCalled();
        expect(fill.mock.invocationCallOrder[0] < clip.mock.invocationCallOrder[0])
            .toBe(textWrap === TableTextWrapType.WRAP);
        expect((documents as any)._drawLiquid).toMatchObject({ x: 0, y: 0 });
        documents.dispose();
        skeleton.dispose();
        univer.dispose();
    });

    it('draws vertical cell glyphs down the physical cell and restores its parent origin', () => {
        const parent = createPage(DocumentSkeletonPageType.CELL, 'outer');
        const cell = createPage(DocumentSkeletonPageType.CELL, 'vertical');
        cell.cellTextDirection = 'tbRlV';
        cell.pageWidth = 40;
        cell.pageHeight = 120;
        cell.marginLeft = 5;
        cell.marginTop = 4;
        const line = createLine(LineType.PARAGRAPH, 0);
        line.paddingTop = 0;
        line.marginTop = 0;
        const column = cell.sections[0].columns[0];
        column.lines = [line];
        line.parent = column;
        const documents = new Documents('vertical-cell-render');
        (documents as any)._drawLiquid.translate(12, 20);
        const positions: { x: number; y: number }[] = [];
        const extension = {
            extensionOffset: {} as any,
            draw() {
                expect(this.extensionOffset.renderConfig).toMatchObject({ centerAngle: 90, vertexAngle: 90 });
                const { spanStartPoint, centerPoint } = this.extensionOffset;
                positions.push({ x: spanStartPoint.x + centerPoint.x, y: spanStartPoint.y + centerPoint.y });
            },
        };
        const ctx = {
            beginPath: vi.fn(),
            clip: vi.fn(),
            closePath: vi.fn(),
            rectByPrecision: vi.fn(),
            restore: vi.fn(),
            save: vi.fn(),
        };
        (documents as any)._drawNestedPageContent(ctx, parent, cell, [], null, [], [extension], Vector2.create(30, 40), 0, 0, {}, { scaleX: 1, scaleY: 1 });
        expect(ctx.rectByPrecision).toHaveBeenCalledWith(42, 60, 40, 120);
        expect(positions).toHaveLength(2);
        expect(positions[0].x).toBeCloseTo(68);
        expect(positions[1].x).toBeCloseTo(68);
        expect(positions[0].y).toBeCloseTo(73);
        expect(positions[1].y).toBeCloseTo(91);
        expect((documents as any)._drawLiquid).toMatchObject({ x: 12, y: 20 });
        documents.dispose();
    });

    it('offsets table cell paragraph backgrounds by parent page margins', () => {
        const bodyPage = createPage(DocumentSkeletonPageType.BODY, '');
        bodyPage.marginLeft = 30;
        bodyPage.marginTop = 40;
        const cell = createPage(DocumentSkeletonPageType.CELL, 'cell-seg');
        const line = createLine(LineType.PARAGRAPH, 0);
        line.backgroundColor = { rgb: '#ffeecc' };
        const column = cell.sections[0].columns[0];
        column.lines = [line];
        line.parent = column;

        const documents = new Documents('docs-table-cell-background');
        (documents as any)._drawLiquid = {
            x: 12,
            y: 20,
            translateSave: vi.fn(),
            translateRestore: vi.fn(),
            translateSection: vi.fn(),
            translateColumn: vi.fn(),
            translateLine: vi.fn(),
            translateDivide: vi.fn(),
        };
        const drawLineBackground = vi.spyOn(documents as any, '_drawLineBackground').mockImplementation(() => {});
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
            [],
            { x: 0, y: 0 },
            0,
            0,
            {},
            { scaleX: 1, scaleY: 1 }
        );

        expect(drawLineBackground).toHaveBeenCalledWith(ctx, cell, line, column.width, 30, 40);

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
            [],
            { x: 0, y: 0 },
            0,
            0,
            {},
            { scaleX: 1, scaleY: 1 },
            undefined
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

    it.each([
        { documentFlavor: DocumentFlavor.TRADITIONAL, zOrder: 'front' as const },
        { documentFlavor: DocumentFlavor.TRADITIONAL, zOrder: 'back' as const },
        { documentFlavor: DocumentFlavor.MODERN, zOrder: 'front' as const },
    ])('renders section borders only in paginated documents, with $zOrder ordering: $documentFlavor', ({ documentFlavor, zOrder }) => {
        const univer = new Univer();
        const model = new DocumentDataModel({
            id: 'section-page-borders',
            body: {
                dataStream: 'A\r\n',
                paragraphs: [{ startIndex: 1, paragraphId: 'p' }],
                sectionBreaks: [{ startIndex: 2, sectionId: 'section', pageBorders: {
                    offsetFrom: 'page',
                    zOrder,
                    top: { width: 2, padding: 24, color: { rgb: '#123456' } },
                } }],
            },
            documentStyle: { documentFlavor, pageSize: { width: 320, height: 400 } },
        });
        const viewModel = new DocumentViewModel(model);
        const skeleton = DocumentSkeleton.create(viewModel, univer.__getInjector().get(LocaleService));
        skeleton.calculate();
        const documents = new Documents(model.getUnitId(), skeleton);
        scene.addObject(documents, 1);
        const ctx = canvas.getContext();
        const paints: string[] = [];
        const rectangles: number[][] = [];
        vi.spyOn(ctx, 'fillRect').mockImplementation((...rect) => {
            if (ctx.fillStyle === '#123456') {
                paints.push('border');
                rectangles.push(rect);
            }
        });
        vi.spyOn(ctx, 'fillText').mockImplementation(() => {
            paints.push('text');
        });
        documents.draw(ctx);
        if (documentFlavor === DocumentFlavor.MODERN) {
            expect(rectangles).toEqual([]);
        } else {
            expect(rectangles).toEqual([[0, 24, 320, 2]]);
            expect(paints).toContain('text');
            expect(paints.indexOf('border') < paints.indexOf('text')).toBe(zOrder === 'back');
        }
        documents.dispose();
        skeleton.dispose();
        viewModel.dispose();
        univer.dispose();
    });

    it.each(['PAGE', 'NUMPAGES'])('renders %s once, excluding sentinels and subsequent cached digit runs', (fieldType) => {
        const univer = new Univer();
        const model = new DocumentDataModel({
            id: 'footer-field-once',
            body: {
                dataStream: 'A\r\n',
                paragraphs: [{ startIndex: 1, paragraphId: 'p' }],
                sectionBreaks: [{ startIndex: 2, sectionId: 's', defaultFooterId: 'footer' }],
            },
            footers: { footer: { footerId: 'footer', body: {
                dataStream: `${DataStreamTreeTokenType.CUSTOM_RANGE_START}67${DataStreamTreeTokenType.CUSTOM_RANGE_END}\r\n`,
                paragraphs: [{ startIndex: 4, paragraphId: 'footer-p' }],
                textRuns: [{ st: 1, ed: 2, ts: { fs: 11 } }, { st: 2, ed: 3, ts: { fs: 12 } }],
                customRanges: [{ startIndex: 0, endIndex: 3, rangeId: 'f', rangeType: 1, properties: { fieldType } }],
            } } },
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 320, height: 400 } },
        });
        const viewModel = new DocumentViewModel(model);
        const skeleton = DocumentSkeleton.create(viewModel, univer.__getInjector().get(LocaleService));
        skeleton.calculate();
        const documents = new Documents(model.getUnitId(), skeleton);
        scene.addObject(documents, 1);
        const ctx = canvas.getContext();
        const text = vi.spyOn(ctx, 'fillText');
        documents.draw(ctx);
        expect(text.mock.calls.map(([value]) => value).filter((value) => /\d/.test(String(value)))).toEqual(['1']);
        expect(model.getSnapshot().footers!.footer.body.dataStream).toContain('67');
        documents.dispose();
        skeleton.dispose();
        viewModel.dispose();
        univer.dispose();
    });

    it.each([
        { horizontalAlign: HorizontalAlign.LEFT },
        { horizontalAlign: HorizontalAlign.CENTER },
        { horizontalAlign: HorizontalAlign.RIGHT },
        { tabStops: [{ offset: 150, alignment: TabStopAlignment.START }] },
        { tabStops: [{ offset: 150, alignment: TabStopAlignment.CENTER }] },
        { tabStops: [{ offset: 150, alignment: TabStopAlignment.END }] },
    ].flatMap((paragraphStyle) => [80, 100].map((scale) => ({ paragraphStyle, scale }))))(
        'positions live multi-digit page fields independently of cached digit widths: %j',
        ({ paragraphStyle, scale }: { paragraphStyle: IParagraphStyle; scale: number }) => {
            const render = (cached: string) => {
                const univer = new Univer();
                const T = DataStreamTreeTokenType;
                const prefix = paragraphStyle.tabStops ? 'X\t' : 'X';
                const fieldStart = prefix.length;
                const suffix = paragraphStyle.tabStops ? 'Y\tZ' : 'Y Z';
                const dataStream = `${prefix}${T.CUSTOM_RANGE_START}${cached}${T.CUSTOM_RANGE_END}${suffix}\r\n`;
                const bodyStream = `${new Array(18).fill('A').join(T.PAGE_BREAK)}\r\n`;
                const model = new DocumentDataModel({
                    id: `field-advance-${cached}`,
                    body: {
                        dataStream: bodyStream,
                        paragraphs: [{ startIndex: bodyStream.length - 2, paragraphId: 'body' }],
                        sectionBreaks: [{ startIndex: bodyStream.length - 1, sectionId: 's', defaultFooterId: 'footer' }],
                    },
                    footers: { footer: { footerId: 'footer', body: {
                        dataStream,
                        paragraphs: [{ startIndex: dataStream.length - 2, paragraphId: 'f', paragraphStyle }],
                        textRuns: [{ st: 0, ed: dataStream.length - 1, ts: { fs: 11, sa: scale } }],
                        customRanges: [{ startIndex: fieldStart, endIndex: fieldStart + cached.length + 1, rangeId: 'field', rangeType: CustomRangeType.FIELD, properties: { fieldType: 'NUMPAGES' } }],
                    } } },
                    documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 320, height: 400 } },
                });
                const viewModel = new DocumentViewModel(model);
                const skeleton = DocumentSkeleton.create(viewModel, univer.__getInjector().get(LocaleService));
                const documents = new Documents(model.getUnitId(), skeleton);
                try {
                    skeleton.calculate();
                    expect(skeleton.getSkeletonData()!.pages).toHaveLength(18);
                    scene.addObject(documents, 1);
                    const text = vi.spyOn(canvas.getContext(), 'fillText');
                    text.mockClear();
                    documents.draw(canvas.getContext());
                    const positions = text.mock.calls.filter(([value]) => ['X', '18', 'Y', 'Z'].includes(String(value)))
                        .map(([value, x, y]) => [value, x, y]);
                    expect(positions).toHaveLength(18 * 4);
                    expect(model.getSnapshot().footers!.footer.body.dataStream).toBe(dataStream);
                    return positions;
                } finally {
                    documents.dispose();
                    skeleton.dispose();
                    viewModel.dispose();
                    model.dispose();
                    univer.dispose();
                }
            };
            const expected = render('18');
            for (const cached of ['1', '123']) {
                const actual = render(cached);
                actual.forEach(([value, x, y], i) => {
                    expect(value).toBe(expected[i][0]);
                    expect(x).toBeCloseTo(expected[i][1] as number, 4);
                    expect(y).toBeCloseTo(expected[i][2] as number, 4);
                });
            }
        }
    );

    it.each(['header', 'footer'] as const)('renders live page fields inside nested %s tables without changing cached results', (story) => {
        const univer = new Univer();
        const T = DataStreamTreeTokenType;
        const fields = `${T.CUSTOM_RANGE_START}67${T.CUSTOM_RANGE_END} / ${T.CUSTOM_RANGE_START}89${T.CUSTOM_RANGE_END}\r`;
        const wrap = (content: string) => `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}${content}\n${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
        const inner = wrap(fields);
        const outer = wrap(`${inner}\r`);
        const dataStream = `${outer}\r\n`;
        const fieldStart = dataStream.indexOf(T.CUSTOM_RANGE_START);
        const countStart = dataStream.indexOf(T.CUSTOM_RANGE_START, fieldStart + 1);
        const body: IDocumentBody = {
            dataStream,
            paragraphs: [...dataStream.matchAll(/\r/g)].map((match, index) => ({ startIndex: match.index!, paragraphId: `p-${index}` })),
            sectionBreaks: [...dataStream.matchAll(/\n/g)].map((match, index) => ({ startIndex: match.index!, sectionId: `s-${index}` })),
            tables: [
                { tableId: 'outer', startIndex: 0, endIndex: outer.length },
                { tableId: 'inner', startIndex: 3, endIndex: 3 + inner.length },
            ],
            customRanges: [fieldStart, countStart].map((startIndex, index) => ({
                startIndex,
                endIndex: startIndex + 3,
                rangeId: `f-${index}`,
                rangeType: CustomRangeType.FIELD,
                properties: { fieldType: index === 0 ? 'PAGE' : 'NUMPAGES' },
            })),
            textRuns: [fieldStart, countStart].flatMap((st) => [
                { st: st + 1, ed: st + 2, ts: { fs: 11 } },
                { st: st + 2, ed: st + 3, ts: { fs: 12 } },
            ]),
        };
        const tableSource = Object.fromEntries(['outer', 'inner'].map((tableId): [string, ITable] => [tableId, {
            tableId,
            align: TableAlignmentType.START,
            indent: { v: 0 },
            textWrap: TableTextWrapType.NONE,
            size: { type: TableSizeType.SPECIFIED, width: { v: 200 } },
            position: { positionH: { relativeFrom: ObjectRelativeFromH.PAGE }, positionV: { relativeFrom: ObjectRelativeFromV.PAGE } },
            dist: { distT: 0, distB: 0, distL: 0, distR: 0 },
            cellMargin: { top: { v: 0 }, bottom: { v: 0 }, start: { v: 0 }, end: { v: 0 } },
            tableColumns: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 200 } } }],
            tableRows: [{ trHeight: { hRule: TableRowHeightRule.AUTO, val: { v: 0 } }, tableCells: [{}] }],
        }]));
        const model = new DocumentDataModel({
            id: `nested-${story}-fields`,
            body: {
                dataStream: `A${T.PAGE_BREAK}B${T.PAGE_BREAK}C\r\n`,
                paragraphs: [{ startIndex: 5, paragraphId: 'body' }],
                sectionBreaks: [{ startIndex: 6, sectionId: 'section', defaultHeaderId: 'header', defaultFooterId: 'footer' }],
            },
            headers: story === 'header' ? { header: { headerId: 'header', body } } : {},
            footers: story === 'footer' ? { footer: { footerId: 'footer', body } } : {},
            tableSource,
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 320, height: 400 } },
        });
        const viewModel = new DocumentViewModel(model);
        const skeleton = DocumentSkeleton.create(viewModel, univer.__getInjector().get(LocaleService));
        const documents = new Documents(model.getUnitId(), skeleton);
        try {
            skeleton.calculate();
            expect(skeleton.getSkeletonData()!.pages).toHaveLength(3);
            scene.addObject(documents, 1);
            const text = vi.spyOn(canvas.getContext(), 'fillText');
            documents.draw(canvas.getContext());
            expect(text.mock.calls.map(([value]) => String(value)).filter((value) => /\d/.test(value)))
                .toEqual(['1', '3', '2', '3', '3', '3']);
            expect((story === 'header' ? model.getSnapshot().headers!.header : model.getSnapshot().footers!.footer).body.dataStream)
                .toBe(dataStream);
        } finally {
            documents.dispose();
            skeleton.dispose();
            viewModel.dispose();
            model.dispose();
            univer.dispose();
        }
    });

    it('does not treat the first visible continuation page as the first page of its section', () => {
        const univer = new Univer();
        const pageBorders = {
            display: 'firstPage' as const,
            offsetFrom: 'page' as const,
            top: { width: 2, padding: 24, color: { rgb: '#123456' } },
        };
        const model = new DocumentDataModel({
            id: 'section-border-scroll',
            body: {
                dataStream: `A${DataStreamTreeTokenType.PAGE_BREAK}B\r\nC\r\n`,
                paragraphs: [{ startIndex: 3, paragraphId: 'ab' }, { startIndex: 6, paragraphId: 'c' }],
                sectionBreaks: [
                    { startIndex: 4, sectionId: 'ab', pageBorders },
                    { startIndex: 7, sectionId: 'c', pageBorders },
                ],
            },
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 320, height: 400 } },
        });
        const viewModel = new DocumentViewModel(model);
        const skeleton = DocumentSkeleton.create(viewModel, univer.__getInjector().get(LocaleService));
        skeleton.calculate();
        const pages = skeleton.getSkeletonData()!.pages;
        expect(pages.map((page) => page.sectionId)).toEqual(['ab', 'ab', 'c']);
        const documents = new Documents(model.getUnitId(), skeleton);
        scene.addObject(documents, 1);
        const ctx = canvas.getContext();
        const rectangles: number[][] = [];
        vi.spyOn(ctx, 'fillRect').mockImplementation((...rect) => {
            if (ctx.fillStyle === '#123456') {
                rectangles.push(rect);
            }
        });
        documents.draw(ctx, { viewBound: { left: 0, right: 500, top: 700, bottom: 1500 } } as any);
        expect(rectangles).toEqual([[0, 2 * (400 + documents.pageMarginTop) + 24, 320, 2]]);
        documents.dispose();
        skeleton.dispose();
        viewModel.dispose();
        univer.dispose();
    });

    it.each([DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN])('retains the physical page boundary only in paginated rendering: %s', (documentFlavor) => {
        const univer = new Univer();
        const model = new DocumentDataModel({
            id: 'physical-page-clip',
            body: { dataStream: 'A\r\n', paragraphs: [{ startIndex: 1, paragraphId: 'p' }] },
            documentStyle: { documentFlavor, pageSize: { width: 320, height: 400 } },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(model), univer.__getInjector().get(LocaleService));
        skeleton.calculate();
        const documents = new Documents(model.getUnitId(), skeleton);
        scene.addObject(documents, 1);
        const ctx = canvas.getContext();
        const rect = vi.spyOn(ctx, 'rect');
        const clip = vi.spyOn(ctx, 'clip');

        documents.draw(ctx);

        if (documentFlavor === DocumentFlavor.TRADITIONAL) {
            expect(rect).toHaveBeenCalledWith(0, 0, 320, 400);
            expect(clip).toHaveBeenCalled();
        } else {
            expect(clip).not.toHaveBeenCalled();
        }
        documents.dispose();
        skeleton.dispose();
        univer.dispose();
    });

    it.each([
        { documentFlavor: DocumentFlavor.TRADITIONAL, enabled: true },
        { documentFlavor: DocumentFlavor.TRADITIONAL, enabled: false },
        { documentFlavor: DocumentFlavor.MODERN, enabled: true },
    ])('dims inactive content, not page-margin rectangles: $documentFlavor, editor=$enabled', ({ documentFlavor, enabled }) => {
        const univer = new Univer();
        const model = new DocumentDataModel({
            id: 'edit-area-colors',
            body: {
                dataStream: 'D\r\n',
                paragraphs: [{ startIndex: 1, paragraphId: 'body-p' }],
                sectionBreaks: [{ startIndex: 2, sectionId: 'section', defaultHeaderId: 'header', defaultFooterId: 'footer' }],
            },
            headers: { header: { headerId: 'header', body: { dataStream: 'H\r\n', paragraphs: [{ startIndex: 1, paragraphId: 'header-p' }] } } },
            footers: { footer: { footerId: 'footer', body: { dataStream: 'F\r\n', paragraphs: [{ startIndex: 1, paragraphId: 'footer-p' }] } } },
            documentStyle: {
                documentFlavor,
                pageSize: { width: 320, height: 400 },
                marginTop: 50,
                marginBottom: 50,
                marginHeader: 10,
                marginFooter: 10,
            },
        });
        const viewModel = new DocumentViewModel(model);
        const skeleton = DocumentSkeleton.create(viewModel, univer.__getInjector().get(LocaleService));
        skeleton.calculate();
        const bodyPage = skeleton.getSkeletonData()!.pages[0];
        attachTable(bodyPage);
        bodyPage.skeTables.get('table-1')!.top = -bodyPage.marginTop;
        const documents = new Documents(model.getUnitId(), skeleton);
        scene.addObject(documents, 1);
        if (enabled) {
            documents.setInactiveAreaOpacity(0.5);
        }
        const ctx = canvas.getContext();
        const textPaints: Array<{ text: string; alpha: number }> = [];
        const tablePaints: number[] = [];
        vi.spyOn(ctx, 'fillText').mockImplementation((text) => {
            textPaints.push({ text: String(text), alpha: ctx.globalAlpha });
        });
        vi.spyOn(ctx, 'fill').mockImplementation(() => {
            if (ctx.fillStyle === '#ffeecc') {
                tablePaints.push(ctx.globalAlpha);
            }
        });

        for (const editArea of [DocumentEditArea.BODY, DocumentEditArea.HEADER, DocumentEditArea.FOOTER]) {
            viewModel.setEditArea(editArea);
            textPaints.length = 0;
            tablePaints.length = 0;
            ctx.globalAlpha = 0.8;
            documents.draw(ctx);

            const dims = enabled && documentFlavor === DocumentFlavor.TRADITIONAL;
            const bodyAlpha = dims && editArea !== DocumentEditArea.BODY ? 0.4 : 0.8;
            expect(textPaints.filter(({ text }) => text === 'D').map(({ alpha }) => alpha)).toEqual([bodyAlpha]);
            expect(tablePaints).toEqual([bodyAlpha]);
            if (documentFlavor === DocumentFlavor.TRADITIONAL) {
                const headerFooterAlpha = dims && editArea === DocumentEditArea.BODY ? 0.4 : 0.8;
                expect(textPaints.filter(({ text }) => text === 'H' || text === 'F').map(({ alpha }) => alpha))
                    .toEqual([headerFooterAlpha, headerFooterAlpha]);
            }
            expect(ctx.globalAlpha).toBe(0.8);
        }
        documents.dispose();
        skeleton.dispose();
        viewModel.dispose();
        univer.dispose();
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
        const drawOrder: Array<{ glyph: unknown; phase: 'background' | 'span' }> = [];
        const preTextBackgroundDraw = vi.fn((_ctx, _parentScale, glyph) => drawOrder.push({ glyph, phase: 'background' }));
        const spanDraw = vi.fn((_ctx, _parentScale, glyph) => drawOrder.push({ glyph, phase: 'span' }));
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
                uKey: 'DocsPreTextBackgroundExtension',
                type: DOCS_EXTENSION_TYPE.BACKGROUND,
                extensionOffset: {},
                clearCache,
                draw: preTextBackgroundDraw,
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
        expect(preTextBackgroundDraw).toHaveBeenCalled();
        expect(spanDraw).toHaveBeenCalled();
        drawOrder.forEach((entry, index) => {
            if (entry.phase === 'span') {
                expect(drawOrder.slice(0, index)).toContainEqual({ glyph: entry.glyph, phase: 'background' });
            }
        });
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

    it('restores the section offset before advancing to the next page', () => {
        const firstPage = createPage(DocumentSkeletonPageType.BODY, 'first');
        const secondPage = createPage(DocumentSkeletonPageType.BODY, 'second');
        firstPage.sections.push({
            columns: [],
            height: 80,
            top: 90,
        } as any);
        secondPage.pageNumber = 2;
        attachTable(secondPage);

        const skeletonData = {
            pages: [firstPage, secondPage],
            skeFooters: new Map(),
            skeHeaders: new Map(),
        };
        const documents = new Documents('docs-section-page-offset', { getSkeletonData: () => skeletonData } as any, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 0,
            pageMarginTop: 8,
        });
        const tableOrigins: Array<{ x: number; y: number }> = [];

        vi.spyOn(documents as any, 'getExtensionsByOrder').mockReturnValue([]);
        vi.spyOn(documents as any, '_drawTable').mockImplementation(() => {
            tableOrigins.push({
                x: (documents as any)._drawLiquid.x,
                y: (documents as any)._drawLiquid.y,
            });
        });

        documents.draw(canvas.getContext());

        expect(tableOrigins).toEqual([{
            x: 0,
            y: firstPage.pageHeight + 8,
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

    it('visits only viewport-adjacent lines when imported modern geometry keeps a finite page height', () => {
        const bodyPage = createPage(DocumentSkeletonPageType.BODY, '');
        bodyPage.pageHeight = 120;
        bodyPage.height = 100_020;
        bodyPage.skeTables.clear();
        bodyPage.renderConfig.centerAngle = 0;
        bodyPage.renderConfig.vertexAngle = 0;

        const column = bodyPage.sections[0].columns[0];
        const lines = Array.from({ length: 5_000 }, (_, index) => createLine(LineType.PARAGRAPH, index * 20));
        for (const line of lines) {
            line.parent = column;
        }
        let numericLineReads = 0;
        column.lines = new Proxy(lines, {
            get(target, property, receiver) {
                if (typeof property === 'string' && /^\d+$/.test(property)) {
                    numericLineReads++;
                }
                return Reflect.get(target, property, receiver);
            },
        });

        const skeletonData = {
            pages: [bodyPage],
            skeHeaders: new Map(),
            skeFooters: new Map(),
        };
        bodyPage.parent = skeletonData;

        const documents = new Documents('docs-modern-viewport', {
            getSkeletonData: () => skeletonData,
            getViewModel: () => ({
                getDataModel: () => ({ documentStyle: { documentFlavor: DocumentFlavor.MODERN } }),
            }),
        } as any, {
            pageLayoutType: PageLayoutType.VERTICAL,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        });
        const spanDraw = vi.fn();
        vi.spyOn(documents as any, 'getExtensionsByOrder').mockReturnValue([{
            uKey: 'DocsSpanExtension',
            type: DOCS_EXTENSION_TYPE.SPAN,
            extensionOffset: {},
            clearCache: vi.fn(),
            draw: spanDraw,
        }] as any);

        documents.draw(canvas.getContext(), {
            viewBound: { left: 0, top: 50_000, right: 900, bottom: 50_100 },
            cacheBound: { left: 0, top: 50_000, right: 900, bottom: 50_100 },
        } as any);

        expect(spanDraw).toHaveBeenCalled();
        expect(numericLineReads).toBeLessThan(160);
        documents.dispose();
    });
});
