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
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BORDER_TYPE } from '../../../../basics/const';
import { Vector2 } from '../../../../basics/vector2';
import { Border } from '../border';

const drawLineByBorderTypeMock = vi.fn((..._args: any[]) => undefined);
const getLineWidthMock = vi.fn((..._args: any[]) => 2);
const setLineTypeMock = vi.fn((..._args: any[]) => undefined);

vi.mock('../../../../basics/draw', () => ({
    drawLineByBorderType: (...args: any[]) => drawLineByBorderTypeMock(...args),
    getLineWidth: (...args: any[]) => getLineWidthMock(...args),
    setLineType: (...args: any[]) => setLineTypeMock(...args),
}));

function createCtx() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        translateWithPrecisionRatio: vi.fn(),
        setLineWidthByPrecision: vi.fn(),
        getScale: vi.fn(() => ({ scaleX: 2, scaleY: 2 })),
        strokeStyle: '',
    } as any;
}

function createGlyph(borderData?: any) {
    return {
        ts: borderData ? { bd: borderData } : undefined,
        left: 0,
        width: 40,
        parent: {
            parent: {
                asc: 12,
                lineHeight: 24,
            },
        },
    } as any;
}

describe('docs border extension', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns early without line, text style or border data', () => {
        const extension = new Border();
        const ctx = createCtx();

        extension.draw(ctx, { scaleX: 1, scaleY: 1 }, { ts: { bd: {} } } as any);
        extension.draw(ctx, { scaleX: 1, scaleY: 1 }, createGlyph());
        extension.draw(ctx, { scaleX: 1, scaleY: 1 }, { ...createGlyph(), ts: {} } as any);

        expect(ctx.save).not.toHaveBeenCalled();
    });

    it('draws each span border and reuses cached line style/color until cleared', () => {
        const extension = new Border();
        extension.extensionOffset = { spanStartPoint: Vector2.create(5, 7) } as any;
        const ctx = createCtx();
        const borderData = {
            t: { s: BorderStyleTypes.THIN, cl: { rgb: '#111111' } },
            b: { s: BorderStyleTypes.THIN, cl: { rgb: '#111111' } },
            l: { s: BorderStyleTypes.DASHED, cl: { rgb: '#222222' } },
            r: { s: BorderStyleTypes.DASHED },
        };

        extension.draw(ctx, { scaleX: 1, scaleY: 1 }, createGlyph(borderData));

        expect(ctx.save).toHaveBeenCalledTimes(1);
        expect(ctx.translateWithPrecisionRatio).toHaveBeenCalled();
        expect(drawLineByBorderTypeMock).toHaveBeenCalledTimes(4);
        expect(drawLineByBorderTypeMock).toHaveBeenCalledWith(
            ctx,
            BORDER_TYPE.TOP,
            0.25,
            expect.objectContaining({
                startX: 5,
                startY: 7,
                endX: 45,
                endY: 31,
            })
        );
        expect(setLineTypeMock).toHaveBeenCalledTimes(2);
        expect(ctx.setLineWidthByPrecision).toHaveBeenCalledWith(2);
        expect(ctx.strokeStyle).toBe('rgb(0,0,0)');

        extension.clearCache();
        extension.draw(ctx, { scaleX: 1, scaleY: 1 }, createGlyph({
            t: { s: BorderStyleTypes.THIN, cl: { rgb: '#333333' } },
        }));

        expect(setLineTypeMock).toHaveBeenCalledTimes(3);
        expect(ctx.restore).toHaveBeenCalledTimes(2);
    });
});
