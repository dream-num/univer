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
import { virtualizeDiscreteRanges } from '../range-tools';

describe('range-tools', () => {
    it('should virtualize sparse discrete ranges and provide reverse mapping', () => {
        const { ranges, mapFunc } = virtualizeDiscreteRanges([
            {
                rows: [5, 7],
                cols: [10, 20],
            },
            {
                rows: [7, 9],
                cols: [20, 30],
            },
        ] as any);

        expect(ranges).toEqual([
            { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 },
        ]);

        expect(mapFunc(0, 0)).toEqual({ row: 5, col: 10 });
        expect(mapFunc(2, 2)).toEqual({ row: 9, col: 30 });
    });
});
