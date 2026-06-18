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
import { subtractViewportRange } from '../viewport-subtract';

describe('subtractViewportRange', () => {
    it('returns the original viewport when the ranges do not overlap', () => {
        const range = { startRow: 0, endRow: 10, startColumn: 0, endColumn: 8 };

        expect(subtractViewportRange(range, { startRow: 10, endRow: 12, startColumn: 0, endColumn: 8 })).toEqual([range]);
        expect(subtractViewportRange(range, { startRow: 0, endRow: 10, startColumn: 8, endColumn: 12 })).toEqual([range]);
    });

    it('splits the visible viewport around a frozen pane overlap', () => {
        const ranges = subtractViewportRange(
            { startRow: 0, endRow: 10, startColumn: 0, endColumn: 10 },
            { startRow: 2, endRow: 8, startColumn: 3, endColumn: 7 }
        );

        expect(ranges).toEqual([
            { startRow: 0, startColumn: 0, endRow: 2, endColumn: 10 },
            { startRow: 8, startColumn: 0, endRow: 10, endColumn: 10 },
            { startRow: 2, startColumn: 0, endRow: 8, endColumn: 3 },
            { startRow: 2, startColumn: 7, endRow: 8, endColumn: 10 },
        ]);
    });

    it('returns an empty list when the second range fully covers the first range', () => {
        expect(subtractViewportRange(
            { startRow: 2, endRow: 8, startColumn: 3, endColumn: 7 },
            { startRow: 0, endRow: 10, startColumn: 0, endColumn: 10 }
        )).toEqual([]);
    });
});
