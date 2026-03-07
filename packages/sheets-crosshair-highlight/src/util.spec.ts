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

import { RANGE_TYPE, Rectangle } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { CrossHairRangeCollection } from './util';

describe('CrossHairRangeCollection', () => {
    it('should add/split/reset ranges and skip full row/column/all ranges', () => {
        const collection = new CrossHairRangeCollection();

        collection.addRange({
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
            rangeType: RANGE_TYPE.COLUMN,
        } as never);
        collection.addRange({
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
            rangeType: RANGE_TYPE.ROW,
        } as never);
        collection.addRange({
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
            rangeType: RANGE_TYPE.ALL,
        } as never);
        expect(collection.getRanges()).toEqual([]);

        collection.setSelectedRanges([{
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        } as never]);

        collection.addRange({
            startRow: 0,
            endRow: 2,
            startColumn: 0,
            endColumn: 2,
        } as never);
        expect(collection.getRanges().length).toBeGreaterThan(0);

        const subtractSpy = vi.spyOn(Rectangle, 'subtract').mockReturnValueOnce([{
            startRow: 2,
            endRow: 1,
            startColumn: 0,
            endColumn: 0,
        } as never]);
        collection.addRange({
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        } as never);
        expect(subtractSpy).toHaveBeenCalled();

        vi.spyOn(Rectangle, 'subtract').mockReturnValueOnce(undefined as never);
        collection.addRange({
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        } as never);

        collection.reset();
        expect(collection.getRanges()).toEqual([]);
    });
});
