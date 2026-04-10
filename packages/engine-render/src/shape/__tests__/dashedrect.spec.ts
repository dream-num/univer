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

import { describe, expect, it, vi } from 'vitest';
import { DashedRect } from '../dashedrect';

function createContext() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        rect: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        setLineDash: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        lineCap: 'round',
        lineDashOffset: 0,
        lineJoin: 'round',
        miterLimit: 0,
    } as any;
}

describe('dashed rect', () => {
    it('draws dashed rect paths with and without rounded corners', () => {
        const ctx = createContext();

        DashedRect.drawWith(ctx, {
            left: 0,
            top: 0,
            width: 60,
            height: 30,
            strokeDashArray: [4, 2],
            stroke: '#222222',
            strokeWidth: 1,
            fill: '#dddddd',
        } as any);
        expect(ctx.rect).toHaveBeenCalledWith(0, 0, 60, 30);
        expect(ctx.setLineDash).toHaveBeenCalledWith([4, 2]);

        DashedRect.drawWith(ctx, {
            left: 0,
            top: 0,
            width: 40,
            height: 20,
            radius: 6,
            strokeDashArray: [3, 1],
            stroke: '#111111',
            strokeWidth: 1,
            fill: '#eeeeee',
        } as any);
        expect(ctx.arc).toHaveBeenCalled();
    });

    it('clips draw region by viewport bounds for selection overlay rendering', () => {
        const ctx = createContext();
        const drawSpy = vi.spyOn(DashedRect, 'drawWith').mockImplementation(() => undefined);
        const rect = new DashedRect('dashed-selection', {
            width: 80,
            height: 40,
            strokeDashArray: [2, 2],
            stroke: '#555555',
            strokeWidth: 1,
        } as any);

        (rect as any).parent = {
            transform: {
                getMatrix: () => [1, 0, 0, 1, 10, 20],
            },
        };

        (rect as any)._draw(ctx, {
            cacheBound: {
                left: 20,
                top: 30,
                right: 60,
                bottom: 50,
            },
        });

        expect(drawSpy).toHaveBeenCalledWith(
            ctx,
            expect.objectContaining({
                width: 40,
                height: 20,
                left: 10,
                top: 10,
            })
        );
    });
});
