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

import { describe, expect, it } from 'vitest';
import { Transform } from '../transform';
import { Vector2 } from '../vector2';

describe('Transform extra', () => {
    it('applies translate/scale/rotate/skew/multiply and inverse transforms', () => {
        const transform = Transform.create();
        transform.translate(10, 20).scale(2, 3).rotate(90).skew(0.1, -0.2);

        const matrix = transform.getMatrix();
        expect(matrix.length).toBe(6);

        const point = new Vector2(2, 5);
        const world = transform.applyPoint(point);
        const local = transform.clone().invert().applyPoint(world);

        expect(local.x).toBeCloseTo(point.x, 4);
        expect(local.y).toBeCloseTo(point.y, 4);
    });

    it('copies and resets matrix values', () => {
        const transform = Transform.create([1, 2, 3, 4, 5, 6]);
        const copy = transform.copy();
        expect(copy.getMatrix()).toEqual([1, 2, 3, 4, 5, 6]);

        const target = Transform.create();
        transform.copyInto(target);
        expect(target.getMatrix()).toEqual([1, 2, 3, 4, 5, 6]);

        transform.reset();
        expect(transform.getMatrix()).toEqual([1, 0, 0, 1, 0, 0]);
    });

    it('supports matrix decomposition and composition', () => {
        const transform = Transform.create().composeMatrix({
            left: 30,
            top: 40,
            angle: 15,
            scaleX: 2,
            scaleY: 3,
            skewX: 10,
            skewY: -5,
            flipX: false,
            flipY: true,
        });

        const dom = transform.convert2DOMMatrix2D();
        expect(dom).toEqual(expect.objectContaining({
            a: expect.any(Number),
            b: expect.any(Number),
            c: expect.any(Number),
            d: expect.any(Number),
            e: expect.any(Number),
            f: expect.any(Number),
        }));

        const decomposed = transform.decompose();
        expect(decomposed.x).toBeCloseTo(30, 3);
        expect(decomposed.y).toBeCloseTo(40, 3);
        expect(decomposed.scaleX).toBeCloseTo(2, 1);
    });

    it('supports absolute positioning and matrix rounding helpers', () => {
        const transform = Transform.create().translate(10, 20);
        transform.setAbsolutePosition(new Vector2(30, 40));
        const translated = transform.getTranslation();
        expect(translated.x).toBeCloseTo(30, 5);
        expect(translated.y).toBeCloseTo(40, 5);

        const rounded = Transform.create([1 / 3, 2 / 3, 0, 1, 0, 0]).getMatrixByAccurate(2);
        expect(rounded).toEqual([0.33, 0.67, 0, 1, 0, 0]);
    });

    it('computes bounding boxes from transformed points', () => {
        const transform = Transform.create([1, 0, 0, 1, 5, -2]);
        const bounds = transform.makeBoundingBoxFromPoints([
            new Vector2(0, 0),
            new Vector2(4, 0),
            new Vector2(4, 3),
            new Vector2(0, 3),
        ]);

        expect(bounds.left).toBe(5);
        expect(bounds.top).toBe(-2);
        expect(bounds.width).toBe(4);
        expect(bounds.height).toBe(3);
        expect(bounds.points[0].asArray()).toEqual([5, -2]);
    });
});
