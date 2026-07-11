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

import type { IDocumentBody, IParagraph } from '@univerjs/core';
import type { IDocumentSkeletonLine, IDocumentSkeletonPage } from '@univerjs/engine-render';
import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DocumentFlavor, NamedStyleType } from '@univerjs/core';
import { DocumentSkeletonPageType, GlyphType, LineType } from '@univerjs/engine-render';
import { describe, expect, it } from 'vitest';
import {
    getParagraphPlaceholderLayouts,
    shouldRenderParagraphPlaceholder,
} from '../doc-paragraph-placeholder.render-controller';

const locale = {
    heading1: '标题1',
    heading2: '标题2',
    heading3: '标题3',
    heading4: '标题4',
    heading5: '标题5',
    listItem: '项目',
    normalText: '请输入文字或按"/"启用命令',
};

function createLine(paragraphIndex: number, options?: {
    bullet?: boolean;
    fontFamily?: string;
    fontSize?: number;
    paragraphStart?: boolean;
    st?: number;
    top?: number;
}): IDocumentSkeletonLine {
    const fontSize = options?.fontSize ?? 12;
    const glyph = {
        glyphType: GlyphType.WORD,
        streamType: '',
        width: options?.bullet ? 12 : 0,
        bBox: {
            width: options?.bullet ? 12 : 0,
            ba: fontSize,
            bd: 2,
            aba: fontSize,
            abd: 2,
            sp: 0,
            sbr: 0,
            sbo: 0,
            spr: 0,
            spo: 0,
        },
        xOffset: 0,
        left: 0,
        count: 1,
        content: options?.bullet ? '1.' : '\r',
        raw: options?.bullet ? '1.' : '\r',
        adjustability: {
            stretchability: [0, 0],
            shrinkability: [0, 0],
        },
        ts: {
            fs: fontSize,
            ff: options?.fontFamily ?? 'Arial',
        },
        fontStyle: {
            fontSize,
            originFontSize: fontSize,
            fontFamily: options?.fontFamily ?? 'Arial',
            fontString: `${fontSize}px ${options?.fontFamily ?? 'Arial'}`,
            fontCache: `${fontSize}px ${options?.fontFamily ?? 'Arial'}`,
        },
    };

    return {
        paragraphIndex,
        type: LineType.PARAGRAPH,
        divides: [{
            glyphGroup: [glyph],
            width: 240,
            left: 8,
            paddingLeft: 3,
            isFull: false,
            st: options?.st ?? paragraphIndex,
            ed: paragraphIndex,
        }],
        divideLen: 1,
        lineHeight: 24,
        contentHeight: fontSize,
        top: options?.top ?? 20,
        asc: fontSize,
        dsc: 2,
        paddingTop: 2,
        paddingBottom: 2,
        marginTop: 1,
        marginBottom: 0,
        spaceBelowApply: 0,
        st: options?.st ?? paragraphIndex,
        ed: paragraphIndex,
        lineIndex: 0,
        paragraphStart: options?.paragraphStart ?? true,
        isBehindTable: false,
        tableId: '',
    } as IDocumentSkeletonLine;
}

function createPage(lines: IDocumentSkeletonLine[]): IDocumentSkeletonPage {
    const column = {
        lines,
        left: 10,
        width: 300,
        height: 120,
        spaceWidth: 0,
        separator: 0,
        st: 0,
        ed: 10,
        drawingLRIds: [],
        isFull: false,
    } as any;
    const section = {
        columns: [column],
        colCount: 1,
        height: 120,
        top: 30,
        st: 0,
        ed: 10,
    } as any;
    const page = {
        sections: [section],
        headerId: '',
        footerId: '',
        pageWidth: 500,
        pageHeight: 700,
        pageOrient: 0,
        marginLeft: 40,
        marginRight: 40,
        originMarginTop: 50,
        marginTop: 50,
        originMarginBottom: 50,
        marginBottom: 50,
        left: 0,
        pageNumber: 1,
        pageNumberStart: 1,
        verticalAlign: false,
        angle: 0,
        width: 400,
        height: 600,
        breakType: 0,
        st: 0,
        ed: 10,
        skeDrawings: new Map(),
        skeTables: new Map(),
        segmentId: '',
        type: DocumentSkeletonPageType.BODY,
    } as IDocumentSkeletonPage;

    section.parent = page;
    column.parent = section;
    lines.forEach((line) => {
        line.parent = column;
        line.divides.forEach((divide) => {
            divide.parent = line;
            divide.glyphGroup.forEach((glyph) => {
                glyph.parent = divide;
            });
        });
    });

    return page;
}

function createBody(dataStream: string, paragraphs: IParagraph[]): IDocumentBody {
    return {
        dataStream,
        paragraphs,
    };
}

function createDocumentModel(documentFlavor: DocumentFlavor) {
    return {
        getSnapshot: () => ({
            documentStyle: {
                documentFlavor,
            },
        }),
    } as any;
}

describe('doc paragraph placeholder render controller', () => {
    it('only enables placeholder rendering for modern docs when config is enabled', () => {
        expect(shouldRenderParagraphPlaceholder(createDocumentModel(DocumentFlavor.MODERN), 'doc-1', { placeholder: true })).toBe(true);
        expect(shouldRenderParagraphPlaceholder(createDocumentModel(DocumentFlavor.TRADITIONAL), 'doc-1', { placeholder: true })).toBe(false);
        expect(shouldRenderParagraphPlaceholder(createDocumentModel(DocumentFlavor.MODERN), 'doc-1', { placeholder: false })).toBe(false);
    });

    it('disables placeholder rendering for internal editors', () => {
        expect(shouldRenderParagraphPlaceholder(createDocumentModel(DocumentFlavor.MODERN), DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, { placeholder: true })).toBe(false);
    });

    it('uses a readable minimum font size for an empty normal paragraph', () => {
        const page = createPage([createLine(0, { fontSize: 13, fontFamily: 'Inter' })]);
        const body = createBody('\r\n', [{ startIndex: 0, paragraphId: 'para_placeholder_normal' }]);

        const placeholders = getParagraphPlaceholderLayouts(page, body, locale);

        expect(placeholders).toMatchObject([{
            text: '请输入文字或按"/"启用命令',
            fontFamily: 'Inter',
            fontSize: 16,
            fontWeight: 'normal',
            x: 61,
            y: 116,
        }]);
    });

    it('keeps a larger normal paragraph font size', () => {
        const page = createPage([createLine(0, { fontSize: 18 })]);
        const body = createBody('\r\n', [{ startIndex: 0, paragraphId: 'para_placeholder_large' }]);

        const placeholders = getParagraphPlaceholderLayouts(page, body, locale);

        expect(placeholders[0]).toMatchObject({
            fontSize: 18,
        });
    });

    it('shows heading placeholder with the heading font size', () => {
        const page = createPage([createLine(0, { fontSize: 20 })]);
        const body = createBody('\r\n', [{
            startIndex: 0,
            paragraphId: 'para_placeholder_heading',
            paragraphStyle: {
                namedStyleType: NamedStyleType.HEADING_1,
            },
        }]);

        const placeholders = getParagraphPlaceholderLayouts(page, body, locale);

        expect(placeholders[0]).toMatchObject({
            text: '标题1',
            fontSize: 20,
            fontWeight: 'bold',
        });
    });

    it('shows a readable list item placeholder after the marker when a list item has no text', () => {
        const page = createPage([createLine(0, { bullet: true, fontSize: 14 })]);
        const body = createBody('\r\n', [{
            startIndex: 0,
            paragraphId: 'para_placeholder_list',
            bullet: {
                listId: 'list-1',
                listType: 'decimal',
                nestingLevel: 0,
            },
        }]);

        const placeholders = getParagraphPlaceholderLayouts(page, body, locale);

        expect(placeholders[0]).toMatchObject({
            text: '项目',
            fontSize: 16,
            x: 77,
        });
    });

    it('hides placeholder once the paragraph has text', () => {
        const page = createPage([createLine(5, { st: 0 })]);
        const body = createBody('Hello\r\n', [{ startIndex: 5, paragraphId: 'para_placeholder_text' }]);

        const placeholders = getParagraphPlaceholderLayouts(page, body, locale);

        expect(placeholders).toEqual([]);
    });

    it('only returns the active empty paragraph when an active offset is provided', () => {
        const page = createPage([
            createLine(0, { st: 0, top: 20 }),
            createLine(1, { st: 1, top: 50 }),
        ]);
        const body = createBody('\r\r\n', [
            { startIndex: 0, paragraphId: 'para_placeholder_active_1' },
            { startIndex: 1, paragraphId: 'para_placeholder_active_2' },
        ]);

        const placeholders = getParagraphPlaceholderLayouts(page, body, locale, 0, 0, 1);

        expect(placeholders).toHaveLength(1);
        expect(placeholders[0]).toMatchObject({
            text: '请输入文字或按"/"启用命令',
            y: 145,
        });
    });
});
