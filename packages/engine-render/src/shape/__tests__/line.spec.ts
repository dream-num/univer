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
        const line = new Line('line', {
            width: 0,
            height: 20,
            stroke: '#4285f4',
            strokeWidth: 1,
            strokeLineCap: 'butt',
            strokeDashArray: [4, 2],
        });
        const ctx = createLineContext();
        const moveTo = vi.spyOn(ctx, 'moveTo');
        const lineTo = vi.spyOn(ctx, 'lineTo');
        const setLineDash = vi.spyOn(ctx, 'setLineDash');
        const stroke = vi.spyOn(ctx, 'stroke');

        Line.drawWith(ctx, line);

        expect(moveTo).toHaveBeenCalledOnce();
        expect(moveTo).toHaveBeenCalledWith(0, 0);
        expect(lineTo).toHaveBeenCalledOnce();
        expect(lineTo).toHaveBeenCalledWith(0, 20);
        expect(setLineDash).toHaveBeenCalledWith([4, 2]);
        expect(stroke).toHaveBeenCalledOnce();
    });

    it('uses line distance and hit stroke width for hit testing', () => {
        const line = new Line('line', {
            width: 20,
            height: 0,
            stroke: '#4285f4',
            strokeWidth: 1,
            hitStrokeWidth: 8,
        });

        expect(line.isHit(new Vector2(10, 3))).toBe(true);
        expect(line.isHit(new Vector2(10, 5))).toBe(false);
        expect(line.isHit(new Vector2(24, 0))).toBe(true);
        expect(line.isHit(new Vector2(25, 0))).toBe(false);
    });
});
