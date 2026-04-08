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

import { BorderStyleTypes } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BORDER_TYPE, ORIENTATION_TYPE } from '../const';
import {
    calculateRectRotate,
    clearLineByBorderType,
    drawDiagonalLineByBorderType,
    drawLineByBorderType,
    getDevicePixelRatio,
    getLineOffset,
    getLineWidth,
    getLineWith,
    getRotateOffsetAndFarthestHypotenuse,
    getRotateOrientation,
    getTranslateInSpreadContextWithPixelRatio,
    setLineType,
} from '../draw';
import { Vector2 } from '../vector2';

function createCtxMock() {
    return {
        beginPath: vi.fn(),
        moveToByPrecision: vi.fn(),
        lineToByPrecision: vi.fn(),
        stroke: vi.fn(),
        closePathByEnv: vi.fn(),
        clearRectForTexture: vi.fn(),
        setLineDash: vi.fn(),
    } as any;
}

describe('draw extra', () => {
    beforeEach(() => {
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
            webkitBackingStorePixelRatio: 1,
            mozBackingStorePixelRatio: 1,
            msBackingStorePixelRatio: 1,
            oBackingStorePixelRatio: 1,
            backingStorePixelRatio: 1,
        } as any);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('gets pixel ratio and line helpers', () => {
        const ratio = getDevicePixelRatio();
        expect(ratio).toBeGreaterThanOrEqual(1);

        expect(getLineWith(2)).toBeGreaterThan(0);
        expect(getLineOffset()).toBeGreaterThanOrEqual(0);
        expect(getLineOffset()).toBeLessThan(1);
        expect(getLineWidth(BorderStyleTypes.THICK)).toBe(3);
        expect(getLineWidth(BorderStyleTypes.MEDIUM)).toBe(2);
        expect(getLineWidth(BorderStyleTypes.DASHED)).toBe(1);
    });

    it('draws and clears lines by border type', () => {
        const ctx = createCtxMock();
        const position = { startX: 10, startY: 20, endX: 30, endY: 40 };

        drawLineByBorderType(ctx, BORDER_TYPE.TOP, 1, position);
        drawLineByBorderType(ctx, BORDER_TYPE.BOTTOM, 1, position);
        drawLineByBorderType(ctx, BORDER_TYPE.LEFT, 1, position);
        drawLineByBorderType(ctx, BORDER_TYPE.RIGHT, 1, position);

        expect(ctx.beginPath).toHaveBeenCalledTimes(4);
        expect(ctx.moveToByPrecision).toHaveBeenCalledTimes(4);
        expect(ctx.lineToByPrecision).toHaveBeenCalledTimes(4);
        expect(ctx.stroke).toHaveBeenCalledTimes(4);

        clearLineByBorderType(ctx, BORDER_TYPE.TOP, position);
        clearLineByBorderType(ctx, BORDER_TYPE.BOTTOM, position);
        clearLineByBorderType(ctx, BORDER_TYPE.LEFT, position);
        clearLineByBorderType(ctx, BORDER_TYPE.RIGHT, position);
        expect(ctx.clearRectForTexture).toHaveBeenCalledTimes(4);
    });

    it('draws diagonal lines and sets line styles', () => {
        const ctx = createCtxMock();
        const position = { startX: 0, startY: 0, endX: 20, endY: 20 };

        drawDiagonalLineByBorderType(ctx, BorderStyleTypes.DOUBLE, BORDER_TYPE.TL_BR, position);
        drawDiagonalLineByBorderType(ctx, BorderStyleTypes.DOUBLE, BORDER_TYPE.BL_TR, position);
        drawDiagonalLineByBorderType(ctx, BorderStyleTypes.THIN, BORDER_TYPE.TL_BC, position);

        expect(ctx.moveToByPrecision).toHaveBeenCalled();
        expect(ctx.lineToByPrecision).toHaveBeenCalled();
        expect(ctx.stroke).toHaveBeenCalled();

        setLineType(ctx, BorderStyleTypes.HAIR);
        setLineType(ctx, BorderStyleTypes.DASH_DOT_DOT);
        setLineType(ctx, BorderStyleTypes.DASH_DOT);
        setLineType(ctx, BorderStyleTypes.DOTTED);
        setLineType(ctx, BorderStyleTypes.DASHED);
        setLineType(ctx, BorderStyleTypes.THICK);

        expect(ctx.setLineDash).toHaveBeenCalledTimes(6);
    });

    it('computes rotate offsets and translation helpers', () => {
        const rectResult = calculateRectRotate(
            new Vector2(10, 0),
            new Vector2(5, 5),
            Math.PI / 6,
            Math.PI / 4,
            new Vector2(2, 3)
        );
        expect(Number.isFinite(rectResult.x)).toBe(true);
        expect(Number.isFinite(rectResult.y)).toBe(true);

        expect(getRotateOrientation(0.2)).toBe(ORIENTATION_TYPE.DOWN);
        expect(getRotateOrientation(-0.2)).toBe(ORIENTATION_TYPE.UP);

        const resultUp = getRotateOffsetAndFarthestHypotenuse(
            [{ lineHeight: 10 }, { lineHeight: 20 }] as any,
            100,
            -Math.PI / 6
        );
        expect(resultUp.rotateTranslateXList.length).toBe(2);
        expect(resultUp.rotatedHeight).toBeGreaterThan(0);

        const resultDown = getRotateOffsetAndFarthestHypotenuse(
            [{ lineHeight: 10 }, { lineHeight: 15 }, { lineHeight: 20 }] as any,
            80,
            Math.PI / 6
        );
        expect(resultDown.rotateTranslateXList.length).toBe(3);
        expect(resultDown.rotatedWidth).toBeGreaterThan(0);

        const translate = getTranslateInSpreadContextWithPixelRatio();
        expect(translate).toEqual({
            left: expect.any(Number),
            top: expect.any(Number),
        });
    });
});
