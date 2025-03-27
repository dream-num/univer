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

import type { IRange } from '@univerjs/core';
import { cellToRange } from '@univerjs/core';
import { describe, expect, it } from 'vitest';

import { rangeMerge, RangeMergeUtil } from '../range-merge';

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

    it('test rangeMergeUtil', () => {
        const testRange: IRange[] = [cellToRange(2, 2), cellToRange(3, 2), cellToRange(4, 2)];
        expect(new RangeMergeUtil().add(...testRange).merge()).toEqual([
            { startColumn: 2, endColumn: 2, startRow: 2, endRow: 4 },
        ]);
        expect(new RangeMergeUtil().add(...testRange).subtract(cellToRange(4, 2)).merge()).toEqual([
            { startColumn: 2, endColumn: 2, startRow: 2, endRow: 3 },
        ]);
        expect(new RangeMergeUtil().add(...testRange).subtract(cellToRange(3, 2)).merge()).toEqual([
            { startColumn: 2, endColumn: 2, startRow: 2, endRow: 2 },
            { startColumn: 2, endColumn: 2, startRow: 4, endRow: 4 },
        ]);
        expect(new RangeMergeUtil().add(...testRange).subtract(...testRange).merge()).toEqual([]);
    });

    it('should be no overlapping regions', () => {
        const arr = [
            {
                startRow: 4,
                endRow: 12,
                startColumn: 1,
                endColumn: 6,
            },
            {
                startRow: 12,
                endRow: 13,
                startColumn: 2,
                endColumn: 5,
            },
            {
                startRow: 3,
                endRow: 3,
                startColumn: 2,
                endColumn: 5,
            },
        ];
        const res = new RangeMergeUtil().add(...arr).merge();
        expect(res).toEqual([
            { startRow: 4, endRow: 12, startColumn: 1, endColumn: 6 },
            { startRow: 3, endRow: 3, startColumn: 2, endColumn: 5 },
            { startRow: 13, endRow: 13, startColumn: 2, endColumn: 5 },
        ]);
    });
});
