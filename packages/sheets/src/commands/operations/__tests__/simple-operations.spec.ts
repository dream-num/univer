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
import { CancelMarkDirtyRowAutoHeightOperation, MarkDirtyRowAutoHeightOperation } from '../mark-dirty-auto-height.operation';
import { ScrollToCellOperation } from '../scroll-to-cell.operation';

describe('simple sheet operations', () => {
    it('acknowledges row auto-height dirty markers and cancellation markers', () => {
        expect(MarkDirtyRowAutoHeightOperation.handler(null as never, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            id: 'auto-height-1',
            ranges: [{ startRow: 1, endRow: 3, startColumn: 0, endColumn: 4 }],
        })).toBe(true);
        expect(CancelMarkDirtyRowAutoHeightOperation.handler(null as never, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            id: 'auto-height-1',
        })).toBe(true);
    });

    it('acknowledges scroll requests for a concrete cell range', () => {
        expect(ScrollToCellOperation.handler(null as never, {
            unitId: 'unit-1',
            range: { startRow: 8, endRow: 8, startColumn: 2, endColumn: 2 },
        })).toBe(true);
    });
});
