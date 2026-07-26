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

import type { ILineProps } from '../line';
import { describe, expect, it, vi } from 'vitest';
import { Vector2 } from '../../basics/vector2';
import { UniverRenderingContext2D } from '../../context';
import { Line } from '../line';

function createLineContext() {
    const nativeContext = document.createElement('canvas').getContext('2d');
    if (!nativeContext) {
        throw new Error('Canvas rendering context is unavailable');
    }

    return new UniverRenderingContext2D(nativeContext);
}

describe('Line', () => {
    it('draws a single segment with the configured stroke style', () => {
        const props: ILineProps = {
            startX: 4,
            startY: 8,
            endX: 4,
            endY: 28,
            stroke: '#4285f4',
            strokeWidth: 1,
            strokeLineCap: 'butt',
            strokeDashArray: [4, 2],
        };
        const ctx = createLineContext();
        const moveTo = vi.spyOn(ctx, 'moveTo');
        const lineTo = vi.spyOn(ctx, 'lineTo');
        const setLineDash = vi.spyOn(ctx, 'setLineDash');
        const stroke = vi.spyOn(ctx, 'stroke');

        Line.drawWith(ctx, props);

        expect(moveTo).toHaveBeenCalledOnce();
        expect(moveTo).toHaveBeenCalledWith(4, 8);
        expect(lineTo).toHaveBeenCalledOnce();
        expect(lineTo).toHaveBeenCalledWith(4, 28);
        expect(setLineDash).toHaveBeenCalledWith([4, 2]);
        expect(stroke).toHaveBeenCalledOnce();
    });

    it('derives bounds from endpoints and uses line distance for hit testing', () => {
        const line = new Line('line', {
            startX: 20,
            startY: 10,
            endX: 0,
            endY: 10,
            stroke: '#4285f4',
            strokeWidth: 1,
            hitStrokeWidth: 8,
        });

        expect(line.left).toBe(0);
        expect(line.top).toBe(10);
        expect(line.width).toBe(20);
        expect(line.height).toBe(0);
        expect(line.startX).toBe(20);
        expect(line.endX).toBe(0);
        expect(line.isHit(new Vector2(10, 13))).toBe(true);
        expect(line.isHit(new Vector2(10, 15))).toBe(false);
        expect(line.isHit(new Vector2(24, 10))).toBe(true);
        expect(line.isHit(new Vector2(25, 10))).toBe(false);
    });

    it('updates and serializes endpoint geometry without exposing internal bounds', () => {
        const line = new Line('line', {
            startX: 4,
            startY: 18,
            endX: 14,
            endY: 8,
            stroke: '#4285f4',
            strokeWidth: 1,
        });

        line.setPoints({
            startX: 30,
            startY: 40,
            endX: 10,
            endY: 20,
        });
        line.setProps({ endX: 50 });

        expect(line.left).toBe(30);
        expect(line.top).toBe(20);
        expect(line.width).toBe(20);
        expect(line.height).toBe(20);
        expect(line.startX).toBe(30);
        expect(line.startY).toBe(40);
        expect(line.endX).toBe(50);
        expect(line.endY).toBe(20);
        expect(line.toJson()).toEqual(expect.objectContaining({
            startX: 30,
            startY: 40,
            endX: 50,
            endY: 20,
        }));
        expect(line.toJson()).not.toHaveProperty('left');
        expect(line.toJson()).not.toHaveProperty('top');
        expect(line.toJson()).not.toHaveProperty('width');
        expect(line.toJson()).not.toHaveProperty('height');
    });
});
