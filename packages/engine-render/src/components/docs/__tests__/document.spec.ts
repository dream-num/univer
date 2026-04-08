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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupRenderTestEnv } from '../../../__tests__/render-test-utils';
import { DocumentSkeletonPageType, GlyphType, LineType, PageLayoutType } from '../../../basics/i-document-skeleton-cached';
import { Canvas } from '../../../canvas';
import { Engine } from '../../../engine';
import { MAIN_VIEW_PORT_KEY, Scene } from '../../../scene';
import { Viewport } from '../../../viewport';
import { DOCS_EXTENSION_TYPE } from '../doc-extension';
import { Documents } from '../document';

function createGlyph(content: string, left: number, width = 16) {
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

function createLine(type: LineType, top: number, withBorder = false) {
    const glyphA = createGlyph('A', 0);
    const glyphB = createGlyph('B', 18);
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

function createPage(pageType: DocumentSkeletonPageType, segmentId: string) {
    const lineBlock = createLine(LineType.BLOCK, 0);
    const lineText = createLine(LineType.PARAGRAPH, 24, true);
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
    });

    it('draws body/header/footer/table flows with extension dispatch and page events', () => {
        const bodyPage = createPage(DocumentSkeletonPageType.BODY, '');
        const headerPage = createPage(DocumentSkeletonPageType.HEADER, 'header-main');
        const footerPage = createPage(DocumentSkeletonPageType.FOOTER, 'footer-main');
        attachTable(bodyPage);

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

        documents.draw(canvas.getContext(), {
            viewBound: { left: 0, top: 0, right: 900, bottom: 700 },
            cacheBound: { left: 0, top: 0, right: 900, bottom: 700 },
        } as any);

        expect(pageEvents.length).toBe(1);
        expect(clearCache).toHaveBeenCalled();
        expect(lineDraw).toHaveBeenCalled();
        expect(bgDraw).toHaveBeenCalled();
        expect(spanDraw).toHaveBeenCalled();

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
});
