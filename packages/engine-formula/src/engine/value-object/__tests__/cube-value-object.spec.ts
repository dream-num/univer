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
import { CubeValueObject } from '../cube-value-object';
import { NumberValueObject } from '../primitive-object';

function createArrayStub(values: {
    sum: number;
    max: number;
    count: number;
    countA: number;
    countBlank: number;
}) {
    return {
        dispose: vi.fn(),
        sum: () => NumberValueObject.create(values.sum),
        max: () => NumberValueObject.create(values.max),
        count: () => NumberValueObject.create(values.count),
        countA: () => NumberValueObject.create(values.countA),
        countBlank: () => NumberValueObject.create(values.countBlank),
    };
}

describe('CubeValueObject', () => {
    it('should aggregate sum/max/min/count metrics', () => {
        const a1 = createArrayStub({ sum: 5, max: 8, count: 2, countA: 3, countBlank: 1 });
        const a2 = createArrayStub({ sum: 7, max: 4, count: 5, countA: 6, countBlank: 2 });
        const cube = CubeValueObject.create([a1 as never, a2 as never]);

        expect(cube.isCube()).toBe(true);
        expect(cube.getCubeCount()).toBe(2);
        expect(cube.getCubeValues().length).toBe(2);
        expect(cube.sum().getValue()).toBe(0);
        expect(cube.max().getValue()).toBe(4);
        expect(cube.min().getValue()).toBe(4);
        expect(cube.count().getValue()).toBe(0);
        expect(cube.countA().getValue()).toBe(0);
        expect(cube.countBlank().getValue()).toBe(0);
    });

    it('should dispose all array members', () => {
        const a1 = createArrayStub({ sum: 1, max: 1, count: 1, countA: 1, countBlank: 1 });
        const a2 = createArrayStub({ sum: 2, max: 2, count: 2, countA: 2, countBlank: 2 });
        const cube = CubeValueObject.create([a1 as never, a2 as never]);

        cube.dispose();
        expect(a1.dispose).toHaveBeenCalledTimes(1);
        expect(a2.dispose).toHaveBeenCalledTimes(1);
        expect(cube.getCubeValues()).toEqual([]);
    });
});
