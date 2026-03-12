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

import { CellValueType, HorizontalAlign, TextDecoration, VerticalAlign } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
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
    } as any;
}

function createSkeleton(lines: Array<{ text: string; width: number; height: number; baseline: number }>) {
    const totalHeight = lines.reduce((sum, item) => sum + item.height, 0);
    return {
        calculate: vi.fn(() => lines),
        getTotalHeight: vi.fn(() => totalHeight),
    } as any;
}

describe('text shape', () => {
    it('draws center/right alignment', () => {
        const ctx = createCtx();
        const skeleton = createSkeleton([{ text: 'abcd', width: 20, height: 10, baseline: 8 }]);

        Text.drawWith(
            ctx,
            {
                text: 'abcd',
                fontStyle: '12px Arial',
                width: 100,
                height: 30,
                hAlign: HorizontalAlign.CENTER,
                vAlign: VerticalAlign.TOP,
            } as any,
            skeleton
        );
        expect(ctx.fillText).toHaveBeenCalledWith('abcd', 40, 8);

        Text.drawWith(
            ctx,
            {
                text: 'abcd',
                fontStyle: '12px Arial',
                width: 100,
                height: 30,
                hAlign: HorizontalAlign.RIGHT,
                vAlign: VerticalAlign.TOP,
            } as any,
            skeleton
        );
        expect(ctx.fillText).toHaveBeenLastCalledWith('abcd', 80, 8);
    });

    it('keeps number left-aligned when overflow in no-wrap mode', () => {
        const ctx = createCtx();
        const skeleton = createSkeleton([{ text: '123456', width: 60, height: 10, baseline: 8 }]);

        Text.drawWith(
            ctx,
            {
                text: '123456',
                fontStyle: '12px Arial',
                width: 20,
                height: 20,
                warp: false,
                hAlign: HorizontalAlign.RIGHT,
                vAlign: VerticalAlign.TOP,
                cellValueType: CellValueType.NUMBER,
            } as any,
            skeleton
        );

        expect(ctx.fillText).toHaveBeenCalledWith('123456', 0, 8);
    });

    it('builds skeleton internally and supports middle/bottom vertical alignment', () => {
        const middleCtx = createCtx();
        const middleHeight = Text.drawWith(
            middleCtx,
            {
                text: 'line',
                fontStyle: '12px Arial',
                width: 100,
                height: 40,
                warp: false,
                hAlign: HorizontalAlign.LEFT,
                vAlign: VerticalAlign.MIDDLE,
            } as any
        );
        expect(middleHeight).toBeGreaterThanOrEqual(0);
        expect(middleCtx.fillText).toHaveBeenCalledTimes(1);

        const bottomCtx = createCtx();
        const bottomHeight = Text.drawWith(
            bottomCtx,
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
            } as any
        );
        expect(bottomHeight).toBeGreaterThanOrEqual(0);
        expect(bottomCtx.beginPath).toHaveBeenCalled();
    });

    it('draws underline and strike line decorations', () => {
        const ctx = createCtx();
        const skeleton = createSkeleton([{ text: 'abc', width: 6, height: 10, baseline: 8 }]);

        Text.drawWith(
            ctx,
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
            } as any,
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
            const skeleton = createSkeleton([{ text: 'abc', width: 8, height: 10, baseline: 8 }]);
            Text.drawWith(
                ctx,
                {
                    text: 'abc',
                    fontStyle: '12px Arial',
                    width: 30,
                    height: 20,
                    hAlign: HorizontalAlign.LEFT,
                    vAlign: VerticalAlign.TOP,
                    underline: true,
                    underlineType: style,
                } as any,
                skeleton
            );

            expect(ctx.lineWidth).toBe(expectedLineWidth);
            if (expectedDash) {
                expect(ctx.setLineDash).toHaveBeenCalledWith(expectedDash);
            }
        }
    });

    it('covers line type setup and line drawing helpers', () => {
        const ctx = createCtx();
        const setLineType = (Text as any)._setLineType.bind(Text);

        setLineType(ctx, TextDecoration.SINGLE, 7);
        expect(ctx.lineWidth).toBe(1);
        expect(ctx.setLineDash).toHaveBeenLastCalledWith([0]);

        setLineType(ctx, TextDecoration.DOTTED_HEAVY, 7);
        expect(ctx.lineWidth).toBe(2);
        expect(ctx.setLineDash).toHaveBeenLastCalledWith([2]);

        setLineType(ctx, TextDecoration.DASH_LONG, 7);
        expect(ctx.lineWidth).toBe(1);
        expect(ctx.setLineDash).toHaveBeenLastCalledWith([6]);

        setLineType(ctx, TextDecoration.DASH_DOT_DOT_HEAVY, 7);
        expect(ctx.lineWidth).toBe(2);
        expect(ctx.setLineDash).toHaveBeenLastCalledWith([2, 2, 5, 2, 2]);

        setLineType(ctx, TextDecoration.WAVY_HEAVY, 7);
        expect(ctx.lineWidth).toBe(2);

        setLineType(ctx, 999 as TextDecoration, 7);
        expect(ctx.lineWidth).toBe(7);
        expect(ctx.setLineDash).toHaveBeenLastCalledWith([0]);

        const drawLine = (Text as any)._drawLine.bind(Text);
        drawLine(ctx, 2, 3, 4, TextDecoration.SINGLE);
        expect(ctx.lineTo).toHaveBeenLastCalledWith(6, 3);

        const beforeWaveCalls = ctx.lineTo.mock.calls.length;
        drawLine(ctx, 1, 5, 3, TextDecoration.WAVE);
        expect(ctx.lineTo.mock.calls.length).toBeGreaterThan(beforeWaveCalls);
    });
});
