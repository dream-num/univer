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
import { Path2 } from '../path2';
import { Vector2 } from '../vector2';

describe('Path2', () => {
    it('returns undefined when either path has no drawable segment', () => {
        expect(new Path2([]).intersection([new Vector2(0, 0), new Vector2(1, 1)])).toBeUndefined();
        expect(new Path2([new Vector2(0, 0), new Vector2(1, 1)]).intersection([])).toBeUndefined();
    });

    it('finds intersections between the source path and the provided contrast path', () => {
        const path = new Path2([
            new Vector2(0, 0),
            new Vector2(10, 10),
            new Vector2(20, 0),
        ]);

        const intersections = path.intersection([
            new Vector2(0, 10),
            new Vector2(10, 0),
            new Vector2(20, 10),
        ]);

        expect(intersections).toHaveLength(2);
        expect(intersections?.[0].x).toBeCloseTo(5);
        expect(intersections?.[0].y).toBeCloseTo(5);
        expect(intersections?.[1].x).toBeCloseTo(15);
        expect(intersections?.[1].y).toBeCloseTo(5);
    });

    it('does not report parallel or touching-only segments as intersections', () => {
        const path = new Path2([new Vector2(0, 0), new Vector2(10, 0)]);

        expect(path.intersection([new Vector2(0, 2), new Vector2(10, 2)])).toEqual([]);
        expect(path.intersection([new Vector2(10, 0), new Vector2(10, 10)])).toEqual([]);
    });
});
