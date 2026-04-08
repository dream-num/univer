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

import { RANGE_TYPE } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { shouldKeepCurrentSelectionOnMobileLongPress } from '../mobile-selection-render.service';

describe('shouldKeepCurrentSelectionOnMobileLongPress', () => {
    it('keeps the existing selection when long press is inside it', () => {
        expect(shouldKeepCurrentSelectionOnMobileLongPress([
            {
                startRow: 1,
                endRow: 3,
                startColumn: 2,
                endColumn: 4,
                rangeType: RANGE_TYPE.NORMAL,
            },
        ], {
            startRow: 2,
            endRow: 2,
            startColumn: 3,
            endColumn: 3,
            rangeType: RANGE_TYPE.NORMAL,
        })).toBe(true);
    });

    it('does not keep the existing selection when long press is outside it', () => {
        expect(shouldKeepCurrentSelectionOnMobileLongPress([
            {
                startRow: 1,
                endRow: 3,
                startColumn: 2,
                endColumn: 4,
                rangeType: RANGE_TYPE.NORMAL,
            },
        ], {
            startRow: 5,
            endRow: 5,
            startColumn: 5,
            endColumn: 5,
            rangeType: RANGE_TYPE.NORMAL,
        })).toBe(false);
    });

    it('checks all existing selections', () => {
        expect(shouldKeepCurrentSelectionOnMobileLongPress([
            {
                startRow: 1,
                endRow: 1,
                startColumn: 1,
                endColumn: 1,
                rangeType: RANGE_TYPE.NORMAL,
            },
            {
                startRow: 4,
                endRow: 6,
                startColumn: 4,
                endColumn: 6,
                rangeType: RANGE_TYPE.NORMAL,
            },
        ], {
            startRow: 5,
            endRow: 5,
            startColumn: 5,
            endColumn: 5,
            rangeType: RANGE_TYPE.NORMAL,
        })).toBe(true);
    });
});
