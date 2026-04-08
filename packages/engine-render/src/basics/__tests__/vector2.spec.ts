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
import { Vector2 } from '../vector2';

describe('Vector2 extra', () => {
    it('supports static constructors and interpolation helpers', () => {
        expect(Vector2.Zero().asArray()).toEqual([0, 0]);
        expect(Vector2.One().asArray()).toEqual([1, 1]);
        expect(Vector2.FromArray([9, 8, 7], 1).asArray()).toEqual([8, 7]);

        const target = new Vector2();
        Vector2.FromArrayToRef([3, 4], 0, target);
        expect(target.asArray()).toEqual([3, 4]);

        const catmull = Vector2.CatmullRom(
            new Vector2(0, 0),
            new Vector2(10, 0),
            new Vector2(10, 10),
            new Vector2(20, 10),
            0.5
        );
        expect(catmull.x).toBeCloseTo(10);
        expect(catmull.y).toBeCloseTo(5);

        const hermite = Vector2.Hermite(
            new Vector2(0, 0),
            new Vector2(2, 0),
            new Vector2(10, 10),
            new Vector2(0, 2),
            0.5
        );
        expect(hermite.x).toBeCloseTo(5.25);
        expect(hermite.y).toBeCloseTo(4.75);

        const derivative = Vector2.Hermite1stDerivative(
            new Vector2(0, 0),
            new Vector2(2, 0),
            new Vector2(10, 10),
            new Vector2(0, 2),
            0.5
        );
        expect(derivative.x).toBeCloseTo(14.5);
        expect(derivative.y).toBeCloseTo(14.5);
    });

    it('supports static geometry helpers', () => {
        const value = new Vector2(5, -3);
        const clamped = Vector2.Clamp(value, new Vector2(0, -2), new Vector2(4, 2));
        expect(clamped.asArray()).toEqual([4, -2]);

        expect(Vector2.Lerp(new Vector2(0, 0), new Vector2(10, 20), 0.25).asArray()).toEqual([2.5, 5]);
        expect(Vector2.Dot(new Vector2(2, 3), new Vector2(4, -1))).toBe(5);

        expect(Vector2.Normalize(new Vector2(3, 4)).asArray()).toEqual([0.6, 0.8]);

        const zeroResult = new Vector2(10, 10);
        Vector2.NormalizeToRef(new Vector2(0, 0), zeroResult);
        expect(zeroResult.asArray()).toEqual([10, 10]);

        expect(Vector2.Minimize(new Vector2(1, 5), new Vector2(2, 4)).asArray()).toEqual([1, 4]);
        expect(Vector2.Maximize(new Vector2(1, 5), new Vector2(2, 4)).asArray()).toEqual([2, 5]);

        expect(
            Vector2.PointInTriangle(
                new Vector2(1, 1),
                new Vector2(0, 0),
                new Vector2(4, 0),
                new Vector2(0, 4)
            )
        ).toBe(true);
        expect(
            Vector2.PointInTriangle(
                new Vector2(4, 4),
                new Vector2(0, 0),
                new Vector2(4, 0),
                new Vector2(0, 4)
            )
        ).toBe(false);

        expect(Vector2.Distance(new Vector2(0, 0), new Vector2(3, 4))).toBe(5);
        expect(Vector2.DistanceSquared(new Vector2(0, 0), new Vector2(3, 4))).toBe(25);
        expect(Vector2.Center(new Vector2(0, 0), new Vector2(4, 2)).asArray()).toEqual([2, 1]);
        expect(Vector2.DistanceOfPointFromSegment(new Vector2(5, 2), new Vector2(0, 0), new Vector2(10, 0))).toBe(2);
    });

    it('supports instance operators and transforms', () => {
        const vec = new Vector2(3, 4);
        expect(vec.getClassName()).toBe('Vector2');
        expect(vec.getHashCode()).toBe((3 * 397) ^ 4);
        expect(vec.toString()).toBe('{X: 3 Y: 4}');

        const arr: number[] = [];
        vec.toArray(arr);
        expect(arr).toEqual([3, 4]);
        expect(new Vector2().fromArray(arr).asArray()).toEqual([3, 4]);
        expect(vec.asArray()).toEqual([3, 4]);

        const ref = new Vector2();
        expect(vec.add(new Vector2(1, 2)).asArray()).toEqual([4, 6]);
        vec.addToRef(new Vector2(1, 2), ref);
        expect(ref.asArray()).toEqual([4, 6]);
        expect(vec.addByPoint(2, -1).asArray()).toEqual([5, 3]);

        expect(vec.clone().addInPlace(new Vector2(1, 2)).asArray()).toEqual([4, 6]);
        expect(vec.subtract(new Vector2(1, 2)).asArray()).toEqual([2, 2]);
        expect(vec.subtractByPoint(2, -1).asArray()).toEqual([1, 5]);
        vec.subtractToRef(new Vector2(1, 2), ref);
        expect(ref.asArray()).toEqual([2, 2]);
        expect(vec.clone().subtractInPlace(new Vector2(1, 2)).asArray()).toEqual([2, 2]);

        expect(vec.clone().multiplyInPlace(new Vector2(2, 3)).asArray()).toEqual([6, 12]);
        expect(vec.multiply(new Vector2(2, 3)).asArray()).toEqual([6, 12]);
        vec.multiplyToRef(new Vector2(2, 3), ref);
        expect(ref.asArray()).toEqual([6, 12]);
        expect(vec.multiplyByFloats(2, 3).asArray()).toEqual([6, 12]);

        expect(vec.divide(new Vector2(3, 2)).asArray()).toEqual([1, 2]);
        vec.divideToRef(new Vector2(3, 2), ref);
        expect(ref.asArray()).toEqual([1, 2]);
        expect(vec.clone().divideInPlace(new Vector2(3, 2)).asArray()).toEqual([1, 2]);

        expect(vec.negate().asArray()).toEqual([-3, -4]);
        expect(vec.clone().negateInPlace().asArray()).toEqual([-3, -4]);
        vec.negateToRef(ref);
        expect(ref.asArray()).toEqual([-3, -4]);

        expect(vec.clone().scaleInPlace(2).asArray()).toEqual([6, 8]);
        expect(vec.scale(2).asArray()).toEqual([6, 8]);
        vec.scaleToRef(2, ref);
        expect(ref.asArray()).toEqual([6, 8]);
        vec.scaleAndAddToRef(2, ref);
        expect(ref.asArray()).toEqual([12, 16]);

        expect(vec.equals(new Vector2(3, 4))).toBe(true);
        expect(vec.floor().asArray()).toEqual([3, 4]);
        expect(new Vector2(3.5, -2.25).fract().asArray()).toEqual([0.5, 0.75]);

        const rotated = new Vector2(1, 0).rotate(Math.PI / 2);
        expect(rotated.x).toBeCloseTo(0);
        expect(rotated.y).toBeCloseTo(1);

        const rotateRef = new Vector2();
        new Vector2(1, 0).rotateToRef(Math.PI / 2, rotateRef);
        expect(rotateRef.x).toBeCloseTo(0);
        expect(rotateRef.y).toBeCloseTo(1);

        const byPoint = new Vector2(2, 1).rotateByPoint(Math.PI / 2, new Vector2(1, 1));
        expect(byPoint.x).toBeCloseTo(1);
        expect(byPoint.y).toBeCloseTo(2);

        const coordOnRotate = new Vector2(3, 4).transformCoordinateOnRotate(Math.PI / 4);
        expect(coordOnRotate.length()).toBeCloseTo(5);
        expect(coordOnRotate.lengthSquared()).toBeCloseTo(25);
        expect(new Vector2(3, 4).normalize().asArray()).toEqual([0.6, 0.8]);

        expect(new Vector2().copyFrom(vec).asArray()).toEqual([3, 4]);
        expect(new Vector2().copyFromFloats(9, 8).asArray()).toEqual([9, 8]);
        expect(new Vector2().set(7, 6).clone().asArray()).toEqual([7, 6]);
    });
});
