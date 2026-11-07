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

import { BorderStyleTypes, ObjectMatrix } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SpreadsheetSkeleton } from '../../sheet.render-skeleton';
import { BORDER_TYPE } from '../../../../basics/const';
import { UniverRenderingContext } from '../../../../context';
import { BorderRowCache } from '../border-row-cache';

describe('prepared native border row blits', () => {
    let cache: BorderRowCache;
    let ctx: UniverRenderingContext;
    let skeleton: SpreadsheetSkeleton;
    const range = { startRow: 0, endRow: 1, startColumn: 0, endColumn: 9 };
    const paint = vi.fn<(target: UniverRenderingContext) => void>();
    let resolved = '#123456';
    let sprite: HTMLCanvasElement;
    let paintingRow = 0;

    beforeEach(() => {
        cache = new BorderRowCache();
        ctx = new UniverRenderingContext(document.createElement('canvas').getContext('2d')!);
        ctx.setTransform(1.5, 0, 0, 1.5, 0.5, 0.5);
        const border = new ObjectMatrix();
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 10; col++) {
                border.setValue(row, col, {
                    [BORDER_TYPE.TOP]: { type: BORDER_TYPE.TOP, style: BorderStyleTypes.THIN, color: '#123456' },
                    [BORDER_TYPE.RIGHT]: { type: BORDER_TYPE.RIGHT, style: BorderStyleTypes.THIN, color: '#123456' },
                });
            }
        }
        skeleton = {
            rowHeightAccumulation: [2, 4],
            columnWidthAccumulation: Array.from({ length: 10 }, (_, col) => (col + 1) * 24),
            overflowCache: new ObjectMatrix(),
            stylesCache: { border },
            worksheet: { getRowVisible: () => true, getColVisible: () => true },
            getCellWithCoordByIndex: (row: number, col: number) => ({
                startX: col * 24,
                endX: (col + 1) * 24,
                startY: row * 2,
                endY: (row + 1) * 2,
                isMerged: false,
                isMergedMainCell: false,
            }),
        } as unknown as SpreadsheetSkeleton;
        resolved = '#123456';
        paint.mockClear();
        sprite = document.createElement('canvas');
        sprite.width = 8;
        sprite.height = 4;
        paint.mockImplementation((target) => {
            const m = target.getTransform();
            const startY = paintingRow === 0 ? 0 : skeleton.rowHeightAccumulation[paintingRow - 1];
            const y = Math.floor(Math.round(startY * m.d) + m.f);
            target.setTransform(1, 0, 0, 1, 0, 0);
            for (let index = 0; index < 20; index++) {
                target.drawImage(sprite, Math.floor(m.e) + index * 4, y);
            }
            target.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
        });
    });

    afterEach(() => {
        cache.dispose();
        vi.restoreAllMocks();
    });

    const draw = (row = 0) => {
        paintingRow = row;
        return cache.draw(ctx, skeleton, row, range, () => resolved, paint);
    };

    it('keeps the native fallback when no document is available', () => {
        const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document')!;
        Object.defineProperty(globalThis, 'document', { configurable: true, value: undefined });
        try {
            expect(draw()).toBe(false);
            expect(paint).not.toHaveBeenCalled();
        } finally {
            Object.defineProperty(globalThis, 'document', descriptor);
        }
    });

    it('reuses a row with identical geometry and borders across rows and integral scroll translations', () => {
        const image = vi.spyOn(ctx._context, 'drawImage');
        expect(draw()).toBe(true);
        ctx.translate(0, -2);
        expect(draw(1)).toBe(true);
        expect(paint).toHaveBeenCalledTimes(1);
        expect(image).toHaveBeenCalledTimes(40);
        expect(image.mock.calls.slice(0, 20)).toEqual(image.mock.calls.slice(20));
    });

    it('includes edited border contents, resolved theme color, fractional phase and scale in the identity', () => {
        draw();
        skeleton.stylesCache.border!.getValue(0, 0)![BORDER_TYPE.TOP] = {
            type: BORDER_TYPE.TOP,
            style: BorderStyleTypes.THIN,
            color: '#abcdef',
        };
        draw();
        resolved = '#654321';
        draw();
        ctx.translate(0, 0.2);
        draw();
        ctx.scale(2, 2);
        draw();
        expect(paint).toHaveBeenCalledTimes(5);
    });

    it.each(['printing', 'alpha', 'composite', 'rotation', 'shadow', 'tall', 'overflow', 'hidden', 'merged', 'double', 'diagonal', 'transparent'])('retains the original edge renderer for %s', (reason) => {
        if (reason === 'printing') {
            ctx.__mode = 'printing';
        }
        if (reason === 'alpha') {
            ctx.globalAlpha = 0.5;
        }
        if (reason === 'composite') {
            ctx.globalCompositeOperation = 'destination-out';
        }
        if (reason === 'rotation') {
            ctx.rotate(0.1);
        }
        if (reason === 'shadow') {
            ctx.shadowBlur = 2;
        }
        if (reason === 'tall') {
            skeleton.rowHeightAccumulation[0] = 40;
        }
        if (reason === 'overflow') {
            skeleton.overflowCache.setValue(0, 0, range);
        }
        if (reason === 'hidden') {
            vi.spyOn(skeleton.worksheet, 'getColVisible').mockReturnValue(false);
        }
        if (reason === 'merged') {
            vi.spyOn(skeleton, 'getCellWithCoordByIndex').mockReturnValue({ isMerged: true } as never);
        }
        if (reason === 'double' || reason === 'diagonal') {
            skeleton.stylesCache.border!.getValue(0, 0)![BORDER_TYPE.TOP] = {
                type: reason === 'diagonal' ? BORDER_TYPE.TL_BR : BORDER_TYPE.TOP,
                style: reason === 'double' ? BorderStyleTypes.DOUBLE : BorderStyleTypes.THIN,
                color: '#123456',
            };
        }
        if (reason === 'transparent') {
            resolved = 'rgba(0,0,0,0.5)';
        }
        expect(draw()).toBe(false);
        expect(paint).not.toHaveBeenCalled();
    });

    it('restores the destination transform and smoothing when a cached blit fails', () => {
        draw();
        ctx.imageSmoothingEnabled = true;
        const before = ctx.getTransform();
        vi.spyOn(ctx._context, 'drawImage').mockImplementationOnce(() => {
            throw new Error('blit failed');
        });
        expect(draw).toThrow('blit failed');
        expect(ctx.getTransform()).toEqual(before);
        expect(ctx.imageSmoothingEnabled).toBe(true);
    });

    it('bounds retained commands and leaves borrowed primitive bitmaps owned by their cache', () => {
        for (let i = 0; i < 150; i++) {
            resolved = `#${i.toString(16).padStart(6, '0')}`;
            draw();
        }
        expect((cache as any)._rows.size).toBeLessThan(150);
        cache.clear();
        expect((cache as any)._rows.size).toBe(0);
        expect(sprite.width).toBe(8);
    });

    it('falls back when a borrowed bitmap is evicted without submitting any stale blits', () => {
        draw();
        sprite.width = 0;
        const image = vi.spyOn(ctx._context, 'drawImage');
        image.mockClear();
        expect(draw()).toBe(false);
        expect(image).not.toHaveBeenCalled();
    });

    it('does not paint during preparation when a primitive needs the native fallback', () => {
        paint.mockImplementation((target) => target.stroke());
        const stroke = vi.spyOn(ctx._context, 'stroke');
        expect(draw()).toBe(false);
        expect(stroke).not.toHaveBeenCalled();
    });
});
