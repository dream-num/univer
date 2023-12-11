/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IRange } from '@univerjs/core';
import { describe, expect, it } from 'vitest';

import { rangeMerge } from '../rangeMerge';

const cellToRange = (row: number, col: number) =>
    ({ startColumn: col, endColumn: col, endRow: row, startRow: row }) as IRange;
describe('test rangeMerge', () => {
    it('simple row', () => {
        const testRange: IRange[] = [cellToRange(2, 2), cellToRange(3, 2), cellToRange(4, 2)];
        const result = rangeMerge(testRange);
        expect(result).toEqual([{ startColumn: 2, endColumn: 2, startRow: 2, endRow: 4 }] as IRange[]);
    });
    it('simple col', () => {
        const testRange: IRange[] = [cellToRange(2, 2), cellToRange(2, 3), cellToRange(2, 4)];
        const result = rangeMerge(testRange);
        expect(result).toEqual([{ startColumn: 2, endColumn: 4, startRow: 2, endRow: 2 }] as IRange[]);
    });

    it('simple col and simple row', () => {
        const testRange: IRange[] = [
            cellToRange(2, 2),
            cellToRange(2, 3),
            cellToRange(2, 4),
            cellToRange(2, 2),
            cellToRange(3, 2),
            cellToRange(4, 2),
        ];
        const result = rangeMerge(testRange);
        expect(result).toEqual([
            { startColumn: 2, endColumn: 4, startRow: 2, endRow: 2 },
            { startColumn: 2, endColumn: 2, startRow: 3, endRow: 4 },
        ] as IRange[]);
    });

    it('multiple range', () => {
        const testRange1 = rangeMerge([cellToRange(2, 2), cellToRange(2, 3), cellToRange(2, 4)]);
        const testRange2 = rangeMerge([cellToRange(3, 2), cellToRange(3, 3), cellToRange(3, 4)]);
        const testRange3 = rangeMerge([cellToRange(4, 5), cellToRange(4, 6), cellToRange(4, 7)]);
        //1 1 1
        //2 2 2
        //0 0 0 1 1 1
        const result = rangeMerge([...testRange1, ...testRange3, ...testRange2]);
        expect(result).toEqual([
            {
                startRow: 2,
                endRow: 3,
                startColumn: 2,
                endColumn: 4,
            },
            {
                startRow: 4,
                endRow: 4,
                startColumn: 5,
                endColumn: 7,
            },
        ]);
        //1 1 1 1
        //2 2 2 1
        //0 0 0 1 1 1
        const result2 = rangeMerge([...testRange1, ...testRange3, ...testRange2, cellToRange(2, 5), cellToRange(3, 5)]);
        expect(result2).toEqual([
            {
                startRow: 2,
                endRow: 3,
                startColumn: 2,
                endColumn: 5,
            },
            {
                startRow: 4,
                endRow: 4,
                startColumn: 5,
                endColumn: 7,
            },
        ]);
        //0 0 0 0 0 0
        //0 0 0 0 0 0
        //0 0 1 1 1 1
        //0 0 2 0 2 2
        //0 0 0 0 3 3 1 1
        const result3 = rangeMerge([
            cellToRange(2, 2),
            cellToRange(2, 3),
            cellToRange(2, 4),
            cellToRange(2, 5),
            cellToRange(3, 2),
            cellToRange(3, 4),
            cellToRange(3, 5),
            cellToRange(4, 4),
            cellToRange(4, 5),
            cellToRange(4, 6),
            cellToRange(4, 7),
        ]);
        expect(result3).toEqual([
            {
                startRow: 2,
                endRow: 4,
                startColumn: 4,
                endColumn: 5,
            },
            {
                startRow: 2,
                endRow: 2,
                startColumn: 2,
                endColumn: 3,
            },
            {
                startRow: 4,
                endRow: 4,
                startColumn: 6,
                endColumn: 7,
            },
            {
                startRow: 3,
                endRow: 3,
                startColumn: 2,
                endColumn: 2,
            },
        ]);
    });

    it('hollow range', () => {
        const result = rangeMerge([
            { startRow: 2, endRow: 3, startColumn: 2, endColumn: 10 },
            { startRow: 4, endRow: 6, startColumn: 2, endColumn: 4 },
            { startRow: 4, endRow: 6, startColumn: 8, endColumn: 10 },
            { startRow: 7, endRow: 10, startColumn: 2, endColumn: 10 },
        ]);
        console.log(JSON.stringify(result, null, 2));
        expect(result).toEqual([
            {
                startRow: 7,
                endRow: 10,
                startColumn: 2,
                endColumn: 10,
            },
            {
                startRow: 2,
                endRow: 3,
                startColumn: 2,
                endColumn: 10,
            },
            {
                startRow: 4,
                endRow: 6,
                startColumn: 2,
                endColumn: 4,
            },
            {
                startRow: 4,
                endRow: 6,
                startColumn: 8,
                endColumn: 10,
            },
        ]);
    });

    // it('performance 10 rows and 250 columns', () => {
    //     // column sparse matrices have better performance
    //     const now = performance.now();
    //     rangeMerge([{ startRow: 0, endRow: 10, startColumn: 0, endColumn: 250 }]);
    //     const end = performance.now();
    //     const result = end - now;
    //     console.log(result, ':ms');
    //     expect(result).toBeLessThanOrEqual(5000); // 4002
    // });

    // it('performance 100 rows and 100 columns', () => {
    //     const now = performance.now();
    //     rangeMerge([{ startRow: 0, endRow: 100, startColumn: 0, endColumn: 100 }]);
    //     const end = performance.now();
    //     const result = end - now;
    //     console.log(result, ':ms');
    //     expect(result).toBeLessThanOrEqual(5000); // 4640
    // });

    // it('performance 1000 rows and 10 columns', () => {
    //     const now = performance.now();
    //     rangeMerge([{ startRow: 0, endRow: 1000, startColumn: 0, endColumn: 10 }]);
    //     const end = performance.now();
    //     const result = end - now;
    //     console.log(result, ':ms');
    //     expect(result).toBeLessThanOrEqual(4000); // 3483
    // });
});
