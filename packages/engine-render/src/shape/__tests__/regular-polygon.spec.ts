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
import { RegularPolygon } from '../regular-polygon';

function createCtx() {
    return {
        beginPath: vi.fn(),
        setLineDash: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        lineWidth: 1,
        lineCap: 'round',
        lineJoin: 'round',
        lineDashOffset: 0,
        miterLimit: 10,
        fillStyle: '#fff',
        strokeStyle: '#000',
    } as any;
}

describe('regular polygon extra', () => {
    it('draws and serializes polygon state', () => {
        const polygon = new RegularPolygon('p1', {
            left: 10,
            top: 20,
            fill: '#00ff00',
            stroke: '#333',
            strokeWidth: 1,
            strokeDashArray: [2, 2],
            pointsGroup: [[
                { x: 10, y: 10 },
                { x: 110, y: 10 },
                { x: 110, y: 80 },
                { x: 10, y: 80 },
            ]],
        });

        const ctx = createCtx();
        RegularPolygon.drawWith(ctx, polygon);
        expect(ctx.beginPath).toHaveBeenCalled();
        expect(ctx.setLineDash).toHaveBeenCalledWith([2, 2]);
        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.lineTo).toHaveBeenCalled();

        const json = polygon.toJson();
        expect(json).toMatchObject({
            left: expect.any(Number),
            top: expect.any(Number),
            width: expect.any(Number),
            height: expect.any(Number),
        });
    });

    it('updates points, hit checks and resize behavior', () => {
        const polygon = new RegularPolygon('p2', {
            pointsGroup: [
                [
                    { x: 0, y: 0 },
                    { x: 120, y: 0 },
                    { x: 120, y: 120 },
                    { x: 0, y: 120 },
                ],
                [
                    { x: 40, y: 40 },
                    { x: 80, y: 40 },
                    { x: 80, y: 80 },
                    { x: 40, y: 80 },
                ],
            ],
        });

        polygon.transformByState({
            left: 20,
            top: 30,
            scaleX: 1,
            scaleY: 1,
        });

        expect(polygon.isHit(Vector2.FromArray([30, 40]))).toBe(true);
        expect(polygon.isHit(Vector2.FromArray([85, 90]))).toBe(false); // hole
        expect(polygon.isHit(Vector2.FromArray([200, 200]))).toBe(false);

        const preState = polygon.getState();
        polygon.resizePolygon({
            width: preState.width! - 20,
            height: preState.height! - 20,
        } as any);
        expect(polygon.scaleX).not.toBe(1);
        expect(polygon.scaleY).not.toBe(1);

        polygon.updatePointGroup([[
            { x: -10, y: -10 },
            { x: 20, y: -10 },
            { x: 20, y: 20 },
            { x: -10, y: 20 },
        ]]);
        const rect = polygon.getRect();
        expect(rect.width).toBeGreaterThan(0);
        expect(rect.height).toBeGreaterThan(0);
    });
});
