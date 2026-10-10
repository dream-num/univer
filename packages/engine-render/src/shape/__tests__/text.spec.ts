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

import type { UniverRenderingContext } from '../../context';
import { CellValueType, HorizontalAlign, Injector, TextDecoration, VerticalAlign } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocSimpleSkeleton } from '../../components/docs/layout/doc-simple-skeleton';
import { FontCache } from '../../components/docs/layout/shaping-engine/font-cache';
import { Text } from '../text';

function createCtx() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        transform: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        fillText: vi.fn(),
        setLineDash: vi.fn(),
        font: '',
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
    };
}

describe('text shape', () => {
    let injector: Injector;

    beforeEach(() => {
        injector = new Injector();
        Reflect.set(FontCache, '_context', null);
        FontCache.invalidateMetrics(() => true);
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
            font: '',
            measureText: (text: string) => ({
                width: text.length * 5,
                fontBoundingBoxAscent: 8,
                fontBoundingBoxDescent: 2,
                actualBoundingBoxAscent: 8,
                actualBoundingBoxDescent: 2,
            }),
        } as unknown as CanvasRenderingContext2D);
    });

    afterEach(() => {
        injector.dispose();
        vi.restoreAllMocks();
        Reflect.set(FontCache, '_context', null);
        FontCache.invalidateMetrics(() => true);
    });

    it('draws center/right alignment', () => {
        const ctx = createCtx();
        const skeleton = injector.createInstance(DocSimpleSkeleton, 'abcd', '12px Arial', false, 100, Infinity);

        Text.drawWith(
            ctx as unknown as UniverRenderingContext,
            {
                text: 'abcd',
                fontStyle: '12px Arial',
                width: 100,
                height: 30,
                hAlign: HorizontalAlign.CENTER,
                vAlign: VerticalAlign.TOP,
            },
            skeleton
        );
        expect(ctx.fillText).toHaveBeenCalledWith('abcd', 40, 8);

        Text.drawWith(
            ctx as unknown as UniverRenderingContext,
            {
                text: 'abcd',
                fontStyle: '12px Arial',
                width: 100,
                height: 30,
                hAlign: HorizontalAlign.RIGHT,
                vAlign: VerticalAlign.TOP,
            },
            skeleton
        );
        expect(ctx.fillText).toHaveBeenLastCalledWith('abcd', 80, 8);
    });

    it('keeps number left-aligned when overflow in no-wrap mode', () => {
        const ctx = createCtx();
        const skeleton = injector.createInstance(DocSimpleSkeleton, '123456', '12px Arial', false, 100, Infinity);

        Text.drawWith(
            ctx as unknown as UniverRenderingContext,
            {
                text: '123456',
                fontStyle: '12px Arial',
                width: 20,
                height: 20,
                warp: false,
                hAlign: HorizontalAlign.RIGHT,
                vAlign: VerticalAlign.TOP,
                cellValueType: CellValueType.NUMBER,
            },
            skeleton
        );

        expect(ctx.fillText).toHaveBeenCalledWith('123456', 0, 8);
    });

    it('builds skeleton internally and supports middle/bottom vertical alignment', () => {
        const middleCtx = createCtx();
        const middleHeight = Text.drawWith(
            middleCtx as unknown as UniverRenderingContext,
            {
                text: 'line',
                fontStyle: '12px Arial',
                width: 100,
                height: 40,
                warp: false,
                hAlign: HorizontalAlign.LEFT,
                vAlign: VerticalAlign.MIDDLE,
            }
        );
        expect(middleHeight).toBeGreaterThanOrEqual(0);
        expect(middleCtx.fillText).toHaveBeenCalledTimes(1);

        const bottomCtx = createCtx();
        const bottomHeight = Text.drawWith(
            bottomCtx as unknown as UniverRenderingContext,
            {
                text: 'line',
                fontStyle: '12px Arial',
                width: 100,
                height: 40,
                warp: false,
                hAlign: HorizontalAlign.LEFT,
                vAlign: VerticalAlign.BOTTOM,
                underline: true,
                strokeLine: true,
            }
        );
        expect(bottomHeight).toBeGreaterThanOrEqual(0);
        expect(bottomCtx.beginPath).toHaveBeenCalled();
    });

    it('draws plain cached text without nested context save and restore', () => {
        const ctx = createCtx();
        const height = Text.drawPlainWith(
            ctx as unknown as UniverRenderingContext,
            {
                text: '123',
                fontStyle: '12px Arial',
                width: 100,
                height: 20,
                hAlign: HorizontalAlign.RIGHT,
                vAlign: VerticalAlign.TOP,
                cellValueType: CellValueType.NUMBER,
            }
        );

        expect(height).toBeGreaterThanOrEqual(0);
        expect(ctx.save).not.toHaveBeenCalled();
        expect(ctx.restore).not.toHaveBeenCalled();
        expect(ctx.fillText.mock.calls[0][1]).toBeGreaterThanOrEqual(0);
    });

    it('draws underline and strike line decorations', () => {
        const ctx = createCtx();
        const skeleton = injector.createInstance(DocSimpleSkeleton, 'abc', '12px Arial', false, 100, Infinity);

        Text.drawWith(
            ctx as unknown as UniverRenderingContext,
            {
                text: 'abc',
                fontStyle: '12px Arial',
                width: 20,
                height: 20,
                hAlign: HorizontalAlign.LEFT,
                vAlign: VerticalAlign.TOP,
                underline: true,
                underlineType: TextDecoration.WAVY_DOUBLE,
                strokeLine: true,
                color: '#f00',
            },
            skeleton
        );

        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();
        expect(ctx.lineTo.mock.calls.length).toBeGreaterThan(3);
    });

    it('applies each supported underline style through the business rendering path', () => {
        const styleCases: Array<{ style: TextDecoration; expectedLineWidth: number; expectedDash?: number[] }> = [
            { style: TextDecoration.DOTTED, expectedLineWidth: 1, expectedDash: [2] },
            { style: TextDecoration.DASH, expectedLineWidth: 1, expectedDash: [3] },
            { style: TextDecoration.DASHED_HEAVY, expectedLineWidth: 2, expectedDash: [3] },
            { style: TextDecoration.DASH_LONG_HEAVY, expectedLineWidth: 2, expectedDash: [6] },
            { style: TextDecoration.DOT_DASH, expectedLineWidth: 1, expectedDash: [2, 5, 2] },
            { style: TextDecoration.DASH_DOT_HEAVY, expectedLineWidth: 2, expectedDash: [2, 5, 2] },
            { style: TextDecoration.DOT_DOT_DASH, expectedLineWidth: 1, expectedDash: [2, 2, 5, 2, 2] },
            { style: TextDecoration.THICK, expectedLineWidth: 2, expectedDash: [0] },
            { style: TextDecoration.WAVY_DOUBLE, expectedLineWidth: 1 },
            { style: TextDecoration.WAVY_HEAVY, expectedLineWidth: 2 },
        ];

        for (const { style, expectedLineWidth, expectedDash } of styleCases) {
            const ctx = createCtx();
            const skeleton = injector.createInstance(DocSimpleSkeleton, 'abc', '12px Arial', false, 100, Infinity);
            Text.drawWith(
                ctx as unknown as UniverRenderingContext,
                {
                    text: 'abc',
                    fontStyle: '12px Arial',
                    width: 30,
                    height: 20,
                    hAlign: HorizontalAlign.LEFT,
                    vAlign: VerticalAlign.TOP,
                    underline: true,
                    underlineType: style,
                },
                skeleton
            );

            expect(ctx.lineWidth).toBe(expectedLineWidth);
            if (expectedDash) {
                expect(ctx.setLineDash).toHaveBeenCalledWith(expectedDash);
            }
        }
    });

    it.each([VerticalAlign.TOP, VerticalAlign.MIDDLE, VerticalAlign.BOTTOM])('uses the configured gap for drawing and vertical alignment: %s', (vAlign) => {
        const props = { text: 'one\ntwo\nthree', fontStyle: '12px Arial', width: 100, height: 80, warp: true, vAlign };
        const oldContext = createCtx();
        const newContext = createCtx();
        const oldLayout = injector.createInstance(DocSimpleSkeleton, props.text, props.fontStyle, true, 100, Infinity);
        const newLayout = injector.createInstance(DocSimpleSkeleton, props.text, props.fontStyle, true, 100, Infinity, 2);
        const oldHeight = Text.drawWith(oldContext as unknown as UniverRenderingContext, props, oldLayout);
        const newHeight = Text.drawWith(newContext as unknown as UniverRenderingContext, { ...props, lineGap: 2 }, newLayout);
        expect(newHeight).toBe(oldHeight + 4);
        const offset = vAlign === VerticalAlign.TOP ? 0 : vAlign === VerticalAlign.MIDDLE ? -2 : -4;
        expect(newContext.fillText.mock.calls.map((call, index) => call[2] - oldContext.fillText.mock.calls[index][2])).toEqual([offset, offset + 2, offset + 4]);
    });
});
