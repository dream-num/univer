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
import {
    getDrawingGroupState,
    getGroupState,
    getRenderTransformBaseOnParentBound,
    getRotatedBoundInGroup,
    transformObjectOutOfGroup,
} from '../group-transform';

describe('group transform', () => {
    it('calculates group bounds from child states', () => {
        const states = [
            { left: 10, top: 20, width: 30, height: 40 },
            { left: -5, top: 15, width: 12, height: 8 },
            { left: 40, top: 3, width: 5, height: 10 },
        ] as any[];

        const normal = getGroupState(100, 50, states);
        expect(normal).toEqual({
            left: 95,
            top: 53,
            width: 50,
            height: 57,
            angle: 0,
            scaleX: 1,
            scaleY: 1,
        });

        const drawing = getDrawingGroupState(100, 50, states);
        expect(drawing).toEqual({
            left: -5,
            top: 3,
            width: 50,
            height: 57,
            angle: 0,
            scaleX: 1,
            scaleY: 1,
        });
    });

    it('maps child bounds by parent/base bounds and rotates/flips out of group', () => {
        const mapped = getRenderTransformBaseOnParentBound(
            { left: 10, top: 20, width: 200, height: 100 },
            { left: 100, top: 60, width: 400, height: 200 },
            { left: 60, top: 45, width: 40, height: 20 }
        );
        expect(mapped).toEqual({
            left: 200,
            top: 110,
            width: 80,
            height: 40,
        });

        const passThrough = getRenderTransformBaseOnParentBound(
            null as any,
            { left: 100, top: 60, width: 400, height: 200 },
            { left: 60, top: 45, width: 40, height: 20 }
        );
        expect(passThrough).toEqual({
            left: 60,
            top: 45,
            width: 40,
            height: 20,
        });

        const transformed = transformObjectOutOfGroup(
            { left: 60, top: 45, width: 40, height: 20, angle: 30, flipX: false, flipY: true } as any,
            { left: 100, top: 60, angle: 90, flipX: true, flipY: false } as any,
            400,
            200,
            { left: 10, top: 20, width: 200, height: 100 }
        );
        expect(transformed.width).toBeGreaterThan(0);
        expect(transformed.height).toBeGreaterThan(0);
        expect(transformed.angle).toBe(120);
        expect(transformed.flipX).toBe(true);
        expect(transformed.flipY).toBe(true);
        expect(Number.isFinite(transformed.left)).toBe(true);
        expect(Number.isFinite(transformed.top)).toBe(true);
    });

    it('switches major axes for rotated bounds in group space', () => {
        const bound = { left: 10, top: 20, width: 60, height: 30 };

        const horizontal = getRotatedBoundInGroup(bound, 10);
        expect(horizontal).toEqual(bound);

        const vertical = getRotatedBoundInGroup(bound, 90);
        expect(vertical.width).toBe(30);
        expect(vertical.height).toBe(60);
        expect(vertical.left).toBe(25);
        expect(vertical.top).toBe(5);

        const around360 = getRotatedBoundInGroup(bound, 450);
        expect(around360.width).toBe(30);
        expect(around360.height).toBe(60);
    });
});
