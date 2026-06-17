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

import { Injector } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { ConditionalFormattingRangeTransformService } from '../conditional-formatting-range-transform.service';

const sortRanges = <T extends { startRow: number; startColumn: number; endRow: number; endColumn: number }>(ranges: T[]) => {
    return [...ranges].sort((a, b) =>
        a.startRow - b.startRow ||
        a.startColumn - b.startColumn ||
        a.endRow - b.endRow ||
        a.endColumn - b.endColumn
    );
};

function createService(): ConditionalFormattingRangeTransformService {
    const injector = new Injector();
    injector.add([ConditionalFormattingRangeTransformService]);
    return injector.get(ConditionalFormattingRangeTransformService);
}

describe('ConditionalFormattingRangeTransformService', () => {
    it('subtracts ranges without expanding to a cell matrix', () => {
        const service = createService();

        const ranges = service.subtractRanges(
            [{ startRow: 0, endRow: 4, startColumn: 0, endColumn: 4 }],
            [{ startRow: 1, endRow: 3, startColumn: 1, endColumn: 3 }]
        );

        expect(sortRanges(ranges)).toEqual(sortRanges([
            { startRow: 0, startColumn: 0, endRow: 0, endColumn: 4 },
            { startRow: 4, startColumn: 0, endRow: 4, endColumn: 4 },
            { startRow: 1, startColumn: 0, endRow: 3, endColumn: 0 },
            { startRow: 1, startColumn: 4, endRow: 3, endColumn: 4 },
        ]));
    });

    it('intersects source ranges and translates them to a target anchor', () => {
        const service = createService();

        const ranges = service.copyIntersectingRanges(
            [{ startRow: 0, endRow: 2, startColumn: 0, endColumn: 2 }],
            { startRow: 1, endRow: 1, startColumn: 1, endColumn: 2 },
            { row: 10, col: 20 }
        );

        expect(ranges).toEqual([
            { startRow: 10, endRow: 10, startColumn: 20, endColumn: 21 },
        ]);
    });

    it('adds and merges translated ranges', () => {
        const service = createService();

        const ranges = service.addRanges(
            [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
            [{ startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 }]
        );

        expect(ranges).toEqual([{ startRow: 0, startColumn: 0, endRow: 0, endColumn: 1 }]);
    });

    it('applies batched subtract and add operations once per rule', () => {
        const service = createService();

        const ranges = service.applyRangeDelta(
            [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 2 }],
            [{ startRow: 0, endRow: 0, startColumn: 1, endColumn: 1 }],
            [{ startRow: 1, endRow: 1, startColumn: 0, endColumn: 1 }]
        );

        expect(sortRanges(ranges)).toEqual(sortRanges([
            { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 },
            { startRow: 0, startColumn: 2, endRow: 0, endColumn: 2 },
            { startRow: 1, startColumn: 0, endRow: 1, endColumn: 1 },
        ]));
    });
});
