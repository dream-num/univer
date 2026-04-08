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

import { BaselineOffset, BooleanNumber, TextDecoration } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { Line } from '../line';

function createCtx() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        setLineDash: vi.fn(),
        strokeStyle: '',
        lineWidth: 1,
    } as any;
}

function createGlyph() {
    return {
        content: 'A',
        left: 10,
        width: 12,
        ts: {
            cl: { rgb: '#333333' },
            ul: { s: BooleanNumber.TRUE, t: TextDecoration.SINGLE },
            st: { s: BooleanNumber.TRUE, t: TextDecoration.WAVY_DOUBLE },
            ol: { s: BooleanNumber.TRUE, t: TextDecoration.DASH_DOT_DOT_HEAVY, c: BooleanNumber.FALSE, cl: { rgb: '#00ff00' } },
            bbl: { s: BooleanNumber.TRUE, t: TextDecoration.DOUBLE },
            va: BaselineOffset.SUPERSCRIPT,
        },
        bBox: {
            sp: 2,
            spo: 1,
            sbo: 3,
            bd: 8,
        },
        parent: {
            parent: {
                asc: 6,
                dsc: 2,
            },
        },
    } as any;
}

describe('docs line extension', () => {
    it('draws underline/bottom-border/strikethrough/overline', () => {
        const line = new Line();
        (line as any).extensionOffset = {};

        const ctx = createCtx();
        const glyph = createGlyph();
        line.draw(ctx, { scaleX: 1, scaleY: 1 } as any, glyph);

        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.lineTo).toHaveBeenCalled();
    });

    it('handles early return and baseline offset variants', () => {
        const line = new Line();
        (line as any).extensionOffset = {};

        const ctx = createCtx();

        const emptyGlyph = createGlyph();
        emptyGlyph.content = '\r';
        line.draw(ctx, { scaleX: 1, scaleY: 1 } as any, emptyGlyph);
        expect(ctx.beginPath).not.toHaveBeenCalled();

        const subGlyph = createGlyph();
        subGlyph.ts.va = BaselineOffset.SUBSCRIPT;
        line.draw(ctx, { scaleX: 1, scaleY: 1 } as any, subGlyph);
        expect(ctx.beginPath).toHaveBeenCalled();
    });

    it('covers private line helpers and line type switch', () => {
        const line = new Line() as any;
        line.extensionOffset = {};
        const ctx = createCtx();
        const glyph = createGlyph();

        line._drawLine(ctx, glyph, { s: BooleanNumber.FALSE }, 10, 1);
        expect(ctx.beginPath).not.toHaveBeenCalled();

        line._setLineType(ctx, TextDecoration.SINGLE, 5);
        expect(ctx.lineWidth).toBe(1);
        expect(ctx.setLineDash).toHaveBeenLastCalledWith([0]);

        line._setLineType(ctx, TextDecoration.DOTTED_HEAVY, 5);
        expect(ctx.lineWidth).toBe(2);
        expect(ctx.setLineDash).toHaveBeenLastCalledWith([2]);

        line._setLineType(ctx, TextDecoration.DASH_LONG, 5);
        expect(ctx.setLineDash).toHaveBeenLastCalledWith([6]);

        line._setLineType(ctx, TextDecoration.DOT_DASH, 5);
        expect(ctx.setLineDash).toHaveBeenLastCalledWith([2, 5, 2]);

        line._setLineType(ctx, TextDecoration.DASH_DOT_DOT_HEAVY, 5);
        expect(ctx.setLineDash).toHaveBeenLastCalledWith([2, 2, 5, 2, 2]);

        line._setLineType(ctx, TextDecoration.WAVY_HEAVY, 5);
        expect(ctx.lineWidth).toBe(2);

        line._setLineType(ctx, 999, 7);
        expect(ctx.lineWidth).toBe(7);

        line._drawLineTo(ctx, 0, 4, 2, TextDecoration.WAVE);
        const waveCalls = ctx.lineTo.mock.calls.length;
        line._drawLineTo(ctx, 0, 2, 3, TextDecoration.SINGLE);
        expect(ctx.lineTo.mock.calls.length).toBeGreaterThan(waveCalls);

        expect(line._isWave(TextDecoration.WAVE)).toBe(true);
        expect(line._isWave(TextDecoration.SINGLE)).toBe(false);
        expect(line._isDouble(TextDecoration.WAVY_DOUBLE)).toBe(true);
        expect(line._isDouble(TextDecoration.DASH)).toBe(false);
    });

    it('clears cache state', () => {
        const line = new Line() as any;
        line._preBackgroundColor = '#fff';
        line.clearCache();
        expect(line._preBackgroundColor).toBe('');
    });
});
