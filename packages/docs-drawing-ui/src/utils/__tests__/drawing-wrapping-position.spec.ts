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

import type { IDocDrawingPosition } from '@univerjs/core';
import type { IDrawingAnchorInPage } from '../drawing-wrapping-position';
import {
    AlignTypeH,
    AlignTypeV,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
} from '@univerjs/core';
import { DocumentEditArea } from '@univerjs/engine-render';
import { describe, expect, it } from 'vitest';
import { findDrawingAnchor, getDrawingWrappingPosition } from '../drawing-wrapping-position';

const { INLINE, WRAP_NONE, WRAP_SQUARE, WRAP_TOP_AND_BOTTOM } = PositionedObjectLayoutType;

function anchor(layoutType = INLINE, marginLeft = 50, position?: Partial<IDocDrawingPosition>): IDrawingAnchorInPage {
    return {
        page: { pageWidth: 720, pageHeight: 960, marginLeft, marginTop: 64 },
        pageMarginLeft: marginLeft,
        pageMarginTop: 64,
        skeDrawing: {
            aLeft: 150,
            aTop: 200,
            width: 120,
            height: 60,
            columnLeft: 24,
            lineTop: 180,
            blockAnchorTop: 160,
            drawingOrigin: {
                layoutType,
                docTransform: {
                    size: { width: 120, height: 60 },
                    angle: 0,
                    positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 150 },
                    positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 264 },
                    ...position,
                },
            },
        },
    } as IDrawingAnchorInPage;
}

describe('getDrawingWrappingPosition', () => {
    it.each([false, true])('uses the indented column anchor, including traditional paragraph normalization: %s', (traditional) => {
        const source = anchor(WRAP_SQUARE);
        source.skeDrawing.columnLeft = 0;
        source.skeDrawing.blockAnchorLeft = 40;
        source.skeDrawing.normalizeTraditionalColumnAnchor = traditional;
        for (const vertical of [ObjectRelativeFromV.PAGE, ObjectRelativeFromV.PARAGRAPH, ObjectRelativeFromV.LINE]) {
            const result = getDrawingWrappingPosition(source, WRAP_SQUARE, ObjectRelativeFromH.COLUMN, vertical);
            const columnOrigin = vertical === ObjectRelativeFromV.LINE ? 0 : 40 - 50 - (traditional && vertical === ObjectRelativeFromV.PARAGRAPH ? 50 : 0);
            expect(result.positionH.posOffset! + columnOrigin + source.pageMarginLeft).toBe(150);
        }
    });

    it('compensates the horizontal column origin when its vertical paragraph reference changes', () => {
        const source = anchor(WRAP_SQUARE, 50, {
            positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: 20 },
            positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
        });
        Object.assign(source.skeDrawing, { columnLeft: 0, blockAnchorLeft: 40, normalizeTraditionalColumnAnchor: true, aLeft: -40 });
        const result = getDrawingWrappingPosition(source, WRAP_SQUARE, undefined, ObjectRelativeFromV.MARGIN);
        expect(result.positionH).toEqual({ relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: -30 });
    });

    it.each([50, 200 / 3])('keeps an inline drawing at its rendered position with margin %s', (margin) => {
        const source = anchor(INLINE, margin);
        for (const layout of [WRAP_NONE, WRAP_SQUARE, WRAP_TOP_AND_BOTTOM]) {
            const result = getDrawingWrappingPosition(source, layout);
            expect(result.positionH.posOffset).toBeCloseTo(150 + margin);
            expect(result.positionV.posOffset).toBe(264);
        }
        expect(source.skeDrawing.drawingOrigin.docTransform.positionH.posOffset).toBe(150);
    });

    it.each([-35, 0, 120])('round-trips wrapped and overlay page offsets without drift: %s', (offset) => {
        const source = anchor(WRAP_SQUARE);
        source.skeDrawing.aLeft = offset;
        source.skeDrawing.drawingOrigin.docTransform.positionH.posOffset = offset;
        const overlay = getDrawingWrappingPosition(source, WRAP_NONE);
        expect(overlay.positionH.posOffset).toBe(offset);
        source.skeDrawing.drawingOrigin = { ...source.skeDrawing.drawingOrigin, layoutType: WRAP_NONE, docTransform: overlay };
        expect(getDrawingWrappingPosition(source, WRAP_SQUARE).positionH.posOffset).toBe(offset);
    });

    it('preserves floating alignments and percentages when only the wrap exclusion or layer changes', () => {
        const positions = {
            positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, align: AlignTypeH.RIGHT },
            positionV: { relativeFrom: ObjectRelativeFromV.PAGE, percent: 0.25 },
        };
        for (const [from, to] of [[WRAP_NONE, WRAP_NONE], [WRAP_SQUARE, WRAP_TOP_AND_BOTTOM]]) {
            expect(getDrawingWrappingPosition(anchor(from, 50, positions), to)).toMatchObject(positions);
        }
    });

    it('retains page alignment across floating wrapping styles', () => {
        const source = anchor(WRAP_NONE, 50, {
            positionH: { relativeFrom: ObjectRelativeFromH.PAGE, align: AlignTypeH.RIGHT },
            positionV: { relativeFrom: ObjectRelativeFromV.PAGE, align: AlignTypeV.CENTER },
        });
        const result = getDrawingWrappingPosition(source, WRAP_SQUARE);
        expect(result.positionH).toEqual(source.skeDrawing.drawingOrigin.docTransform.positionH);
        expect(result.positionV).toEqual(source.skeDrawing.drawingOrigin.docTransform.positionV);
    });

    it.each([0, 0.25, -0.1])('retains page percentages across floating wrapping styles: %s', (percent) => {
        const result = getDrawingWrappingPosition(anchor(WRAP_NONE, 50, {
            positionH: { relativeFrom: ObjectRelativeFromH.PAGE, percent },
            positionV: { relativeFrom: ObjectRelativeFromV.PAGE, percent },
        }), WRAP_SQUARE);
        expect(result.positionH).toEqual({ relativeFrom: ObjectRelativeFromH.PAGE, percent });
        expect(result.positionV).toEqual({ relativeFrom: ObjectRelativeFromV.PAGE, percent });
    });

    it.each([ObjectRelativeFromH.PAGE, ObjectRelativeFromH.MARGIN, ObjectRelativeFromH.COLUMN])('converts inline horizontal anchors: %s', (relativeFrom) => {
        const result = getDrawingWrappingPosition(anchor(INLINE, 50, {
            positionH: { relativeFrom, posOffset: -20 },
        }), WRAP_SQUARE);
        const origin = relativeFrom === ObjectRelativeFromH.MARGIN ? 50 : relativeFrom === ObjectRelativeFromH.COLUMN ? 24 : -50;
        expect(result.positionH.posOffset! + origin).toBe(150);
    });

    it.each([ObjectRelativeFromV.PAGE, ObjectRelativeFromV.MARGIN, ObjectRelativeFromV.LINE, ObjectRelativeFromV.PARAGRAPH])('converts inline vertical anchors: %s', (relativeFrom) => {
        const result = getDrawingWrappingPosition(anchor(INLINE, 50, {
            positionV: { relativeFrom, posOffset: -20 },
        }), WRAP_SQUARE);
        const origin = relativeFrom === ObjectRelativeFromV.PAGE ? -64 : relativeFrom === ObjectRelativeFromV.LINE ? 180 : relativeFrom === ObjectRelativeFromV.PARAGRAPH ? 160 : 0;
        expect(result.positionV.posOffset! + origin).toBe(200);
    });

    it('uses the complete nested cell offset while retaining cell-local margin anchors', () => {
        const source = anchor(INLINE, 8);
        source.pageMarginLeft = 170;
        source.pageMarginTop = 310;
        expect(getDrawingWrappingPosition(source, WRAP_NONE)).toMatchObject({
            positionH: { posOffset: 320 },
            positionV: { posOffset: 510 },
        });
        source.skeDrawing.drawingOrigin.docTransform.positionH.relativeFrom = ObjectRelativeFromH.MARGIN;
        expect(getDrawingWrappingPosition(source, WRAP_SQUARE).positionH.posOffset).toBe(142);
    });

    it('uses the outer page for a page-sized header background', () => {
        const source = anchor(WRAP_NONE, 50, {
            positionH: { relativeFrom: ObjectRelativeFromH.PAGE, align: AlignTypeH.RIGHT },
            positionV: { relativeFrom: ObjectRelativeFromV.PAGE, align: AlignTypeV.BOTTOM },
        });
        source.hostPage = { ...source.page, pageHeight: 960 } as IDrawingAnchorInPage['hostPage'];
        source.page.pageHeight = 80;
        source.skeDrawing.height = 900;
        source.skeDrawing.width = 700;
        source.pageMarginTop = 20;
        const result = getDrawingWrappingPosition(source, WRAP_SQUARE);
        expect(result.positionH).toEqual({ relativeFrom: ObjectRelativeFromH.PAGE, align: AlignTypeH.RIGHT });
        expect(result.positionV).toEqual({ relativeFrom: ObjectRelativeFromV.PAGE, align: AlignTypeV.BOTTOM });
    });

    it('keeps a page-relative overlay fixed when the position panel selects margin or column', () => {
        const source = anchor(WRAP_NONE);
        for (const relativeFrom of [ObjectRelativeFromH.MARGIN, ObjectRelativeFromH.COLUMN]) {
            const origin = relativeFrom === ObjectRelativeFromH.MARGIN ? 50 : 24;
            const result = getDrawingWrappingPosition(source, WRAP_NONE, relativeFrom);
            expect(result.positionH.posOffset! + origin + 50).toBe(150);
        }
    });

    it('moves aligned and percentage-positioned drawings without adding to an absent offset', () => {
        const source = anchor(WRAP_NONE, 50, {
            positionH: { relativeFrom: ObjectRelativeFromH.PAGE, align: AlignTypeH.RIGHT },
            positionV: { relativeFrom: ObjectRelativeFromV.PAGE, percent: 0.25 },
        });
        const result = getDrawingWrappingPosition(source, WRAP_NONE, undefined, undefined, { left: -17, top: 31 });
        expect(result.positionH).toEqual({ relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 583 });
        expect(result.positionV).toEqual({ relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 271 });
    });

    it('retains the section-relative paragraph origin when disabling move-with-text', () => {
        const source = anchor(WRAP_SQUARE, 50, { positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 40 } });
        const result = getDrawingWrappingPosition(source, WRAP_SQUARE, undefined, ObjectRelativeFromV.PAGE);
        expect(result.positionV.posOffset).toBe(264);
    });

    it('uses the continuation page origin for column and paragraph anchors across a page break', () => {
        const source = anchor(INLINE);
        Object.assign(source.skeDrawing, { isPageBreak: true, aLeft: -12, aTop: 27 });
        const result = getDrawingWrappingPosition(source, WRAP_SQUARE, ObjectRelativeFromH.COLUMN, ObjectRelativeFromV.PARAGRAPH);
        expect(result.positionH.posOffset).toBe(-12);
        expect(result.positionV.posOffset).toBe(27);
    });

    it('finds footer drawings relative to the physical host page', () => {
        const drawing = anchor().skeDrawing;
        const footer = { marginTop: 12, height: 20, marginBottom: 16, skeDrawings: new Map([['image', drawing]]), skeTables: new Map() };
        const page = { footerId: 'footer', pageWidth: 720, pageHeight: 960, marginLeft: 50, marginTop: 64, marginBottom: 48 };
        const skeleton = { pages: [page], skeHeaders: new Map(), skeFooters: new Map([['footer', new Map([[720, footer]])]]) } as Parameters<typeof findDrawingAnchor>[2];
        const found = findDrawingAnchor('doc', 'image', skeleton, DocumentEditArea.FOOTER);
        expect(found?.hostPage).toBe(page);
        expect(found?.pageMarginTop).toBe(924);
        expect(found?.pageMarginLeft).toBe(50);
    });

    it('converts page overlays using current positions after a refresh without layout', () => {
        const cached = anchor(WRAP_NONE);
        const page = { ...cached.page, skeDrawings: new Map([['image', cached.skeDrawing]]), skeTables: new Map() };
        const current = { ...cached.skeDrawing.drawingOrigin, docTransform: {
            ...cached.skeDrawing.drawingOrigin.docTransform,
            positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: -20 },
            positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: -35 },
        } };
        const skeleton = { pages: [page], skeHeaders: new Map(), skeFooters: new Map() } as Parameters<typeof findDrawingAnchor>[2];
        const found = findDrawingAnchor('doc', 'image', skeleton, DocumentEditArea.BODY, current)!;
        const result = getDrawingWrappingPosition(found, WRAP_NONE, ObjectRelativeFromH.MARGIN, ObjectRelativeFromV.MARGIN);
        expect(result.positionH.posOffset).toBe(-120);
        expect(result.positionV.posOffset).toBe(-99);
        expect(cached.skeDrawing.drawingOrigin.docTransform.positionH.posOffset).toBe(150);
    });

    it('finds drawings in notes and nested column groups', () => {
        const drawing = anchor().skeDrawing;
        const nested = { marginLeft: 3, marginTop: 4, skeDrawings: new Map([['image', drawing]]), skeTables: new Map() };
        const note = { skeDrawings: new Map(), skeTables: new Map(), skeColumnGroups: new Map([['g', {
            left: 5,
            top: 6,
            columns: [{ left: 7, top: 8, page: nested }],
        }]]) };
        const page = { marginLeft: 50, marginTop: 64, skeDrawings: new Map(), skeTables: new Map(), notes: [{ left: 10, top: 500, page: note }] };
        const skeleton = { pages: [page], skeHeaders: new Map(), skeFooters: new Map() } as Parameters<typeof findDrawingAnchor>[2];
        const found = findDrawingAnchor('doc', 'image', skeleton, DocumentEditArea.BODY)!;
        expect(found.pageMarginLeft).toBe(25);
        expect(found.pageMarginTop).toBe(518);
    });

    it('finds drawings in nested cells using the same accumulated offsets as rendering', () => {
        const drawing = anchor().skeDrawing;
        const cell = { marginLeft: 8, marginTop: 6, left: 30, skeDrawings: new Map([['image', drawing]]), skeTables: new Map() };
        const inner = { marginLeft: 4, marginTop: 3, left: 12, skeDrawings: new Map(), skeTables: new Map([['inner', { tableId: 'inner', left: 10, top: 20, rows: [{ top: 5, cells: [cell] }] }]]) };
        const page = { marginLeft: 50, marginTop: 64, skeDrawings: new Map(), skeTables: new Map([['outer', { tableId: 'outer', left: 15, top: 25, rows: [{ top: 7, cells: [inner] }] }]]) };
        const skeleton = { pages: [page], skeHeaders: new Map(), skeFooters: new Map() } as Parameters<typeof findDrawingAnchor>[2];
        const found = findDrawingAnchor('doc', 'image', skeleton, DocumentEditArea.BODY);
        expect(found?.skeDrawing).toBe(drawing);
        expect(found?.pageMarginLeft).toBe(129);
        expect(found?.pageMarginTop).toBe(130);
        expect(findDrawingAnchor('doc', 'missing', skeleton, DocumentEditArea.BODY)).toBeNull();
    });
});
