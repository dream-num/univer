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

import { CellValueType, HorizontalAlign, VerticalAlign, WrapStrategy } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { LineType } from '../../../basics/i-document-skeleton-cached';
import { Vector2 } from '../../../basics/vector2';
import { DOCS_EXTENSION_TYPE } from '../doc-extension';
import { Documents } from '../document';

function createCtx() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        clip: vi.fn(),
        rectByPrecision: vi.fn(),
        fillRectByPrecision: vi.fn(),
        moveToByPrecision: vi.fn(),
        lineToByPrecision: vi.fn(),
        stroke: vi.fn(),
        closePathByEnv: vi.fn(),
        rotate: vi.fn(),
        setLineWidthByPrecision: vi.fn(),
        strokeStyle: '',
        fillStyle: '',
    } as any;
}

function createLiquid() {
    return {
        x: 10,
        y: 15,
        reset: vi.fn(),
        translate: vi.fn(),
        translateSave: vi.fn(),
        translateRestore: vi.fn(),
        translatePage: vi.fn(() => ({ x: 1, y: 2 })),
        translatePagePadding: vi.fn(),
        translateSection: vi.fn(),
        translateColumn: vi.fn(),
        translateLine: vi.fn(),
        translateDivide: vi.fn(),
    } as any;
}

function createDocsLike() {
    const docs = Object.create(Documents.prototype) as any;
    docs.width = 200;
    docs.height = 100;
    docs.pageLayoutType = 0;
    docs.pageMarginLeft = 0;
    docs.pageMarginTop = 0;
    docs._drawLiquid = createLiquid();
    return docs;
}

describe('documents component', () => {
    it('covers alignment and rotation helpers', () => {
        const docs = createDocsLike();
        const ctx = createCtx();

        expect(docs._horizontalHandler(120, 5, 6, HorizontalAlign.UNSPECIFIED, 0, 0, CellValueType.NUMBER)).toBeGreaterThan(0);
        expect(docs._horizontalHandler(120, 5, 6, HorizontalAlign.UNSPECIFIED, 0, 0, CellValueType.BOOLEAN)).toBe((docs.width - 120) / 2);
        expect(docs._horizontalHandler(120, 5, 6, HorizontalAlign.RIGHT, 0, 0, CellValueType.STRING)).toBe(docs.width - 120 - 6);
        expect(docs._horizontalHandler(120, 5, 6, HorizontalAlign.LEFT, 0, 0, CellValueType.STRING)).toBe(5);

        expect(docs._verticalHandler(60, 3, 4, VerticalAlign.MIDDLE)).toBe((docs.height - 60) / 2);
        expect(docs._verticalHandler(60, 3, 4, VerticalAlign.TOP)).toBe(3);
        expect(docs._verticalHandler(60, 3, 4, VerticalAlign.BOTTOM)).toBe(docs.height - 60 - 4);

        docs._startRotation(ctx, 0.5);
        docs._resetRotation(ctx, 0.5);
        expect(ctx.rotate).toHaveBeenCalledWith(0.5);
        expect(ctx.rotate).toHaveBeenCalledWith(-0.5);
    });

    it('covers border bottom and table-cell border/background rendering', () => {
        const docs = createDocsLike();
        const ctx = createCtx();
        const page = {
            pageWidth: 120,
            marginLeft: 6,
            marginRight: 4,
            marginTop: 3,
        } as any;
        const line = {
            marginTop: 1,
            paddingTop: 1,
            lineHeight: 16,
            borderBottom: {
                padding: 2,
                color: { rgb: '#123456' },
            },
        } as any;
        docs._drawBorderBottom(ctx, page, line, 2, 3);
        expect(ctx.setLineWidthByPrecision).toHaveBeenCalled();
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();

        const rowSource = {
            tableCells: [{
                borderTop: { color: { rgb: '#111111' } },
                borderBottom: { color: { rgb: '#222222' } },
                borderLeft: { color: { rgb: '#333333' } },
                borderRight: { color: { rgb: '#444444' } },
                backgroundColor: { rgb: '#eeeeee' },
            }],
        };
        const row = {
            cells: [],
            rowSource,
        } as any;
        const cell = {
            pageWidth: 50,
            pageHeight: 20,
            parent: row,
        } as any;
        row.cells = [cell];

        docs._drawTableCellBordersAndBg(ctx, {
            marginLeft: 5,
            marginTop: 4,
        } as any, cell);
        expect(ctx.fillRectByPrecision).toHaveBeenCalled();
        expect(ctx.setLineWidthByPrecision).toHaveBeenCalled();
    });

    it('covers table traversal, table cell drawing and header/footer flow', () => {
        const docs = createDocsLike();
        const ctx = createCtx();

        const lineExtension = {
            type: DOCS_EXTENSION_TYPE.LINE,
            extensionOffset: {},
            draw: vi.fn(),
        };
        const backgroundExtension = {
            type: DOCS_EXTENSION_TYPE.SPAN,
            extensionOffset: {},
            draw: vi.fn(),
        };
        const spanExtension = {
            type: DOCS_EXTENSION_TYPE.SPAN,
            extensionOffset: {},
            draw: vi.fn(),
        };

        const glyph = {
            content: 'A',
            width: 8,
            left: 1,
            xOffset: 0,
        };
        const divide = {
            glyphGroup: [glyph],
        };
        const lineNormal = {
            type: LineType.PARAGRAPH,
            asc: 2,
            lineHeight: 14,
            divides: [divide],
            borderBottom: {
                padding: 1,
                color: { rgb: '#999999' },
            },
        };
        const lineBlock = {
            type: LineType.BLOCK,
            lineHeight: 12,
            divides: [],
        };
        const column = {
            lines: [lineBlock, lineNormal],
        };
        const section = {
            columns: [column],
        };

        const rowSource = {
            tableCells: [{
                borderTop: { color: { rgb: '#111111' } },
                borderBottom: { color: { rgb: '#222222' } },
                borderLeft: { color: { rgb: '#333333' } },
                borderRight: { color: { rgb: '#444444' } },
                backgroundColor: { rgb: '#f0f0f0' },
            }],
        };
        const row = {
            top: 2,
            isRepeatRow: false,
            rowSource,
            cells: [],
        } as any;
        const cell = {
            type: 3,
            st: 0,
            ed: 1,
            left: 3,
            pageWidth: 60,
            pageHeight: 30,
            marginLeft: 1,
            marginTop: 2,
            sections: [section],
            parent: row,
            skeTables: new Map(),
        } as any;
        row.cells = [cell];
        const table = {
            top: 4,
            left: 5,
            rows: [row],
        } as any;
        const page = {
            pageWidth: 140,
            pageHeight: 80,
            marginLeft: 6,
            marginTop: 4,
            marginBottom: 6,
            sections: [section],
            skeTables: new Map([['t1', table]]),
        } as any;

        const drawBorderSpy = vi.spyOn(docs, '_drawBorderBottom').mockImplementation(() => undefined);
        docs._drawTableCell(
            ctx,
            page,
            cell,
            [lineExtension],
            backgroundExtension,
            [spanExtension],
            Vector2.create(0, 0),
            0,
            0,
            {
                wrapStrategy: WrapStrategy.OVERFLOW,
            },
            { scaleX: 1, scaleY: 1 }
        );

        expect(lineExtension.draw).toHaveBeenCalled();
        expect(backgroundExtension.draw).toHaveBeenCalled();
        expect(spanExtension.draw).toHaveBeenCalled();
        expect(drawBorderSpy).toHaveBeenCalled();

        const drawCellSpy = vi.spyOn(docs, '_drawTableCell');
        docs._drawTable(
            ctx,
            page,
            page.skeTables,
            [lineExtension],
            backgroundExtension,
            [spanExtension],
            Vector2.create(0, 0),
            0,
            0,
            {},
            { scaleX: 1, scaleY: 1 }
        );
        expect(drawCellSpy).toHaveBeenCalled();

        docs._drawHeaderFooter(
            page,
            ctx,
            [lineExtension],
            backgroundExtension,
            [spanExtension],
            Vector2.create(0, 0),
            0,
            0,
            {},
            { scaleX: 1, scaleY: 1 },
            page,
            true
        );
        expect(lineExtension.draw).toHaveBeenCalled();
    });

    it('covers early return guards in draw helpers', () => {
        const docs = createDocsLike();
        const ctx = createCtx();

        docs._drawLiquid = null;
        docs._drawBorderBottom(ctx, {} as any, {} as any);
        docs._drawTableCell(ctx, {} as any, {} as any, [], null, [], Vector2.create(0, 0), 0, 0, {}, { scaleX: 1, scaleY: 1 });
        docs._drawHeaderFooter({ sections: [] } as any, ctx, [], null, [], Vector2.create(0, 0), 0, 0, {}, { scaleX: 1, scaleY: 1 }, {} as any);
    });
});
