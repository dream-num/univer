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
import { shouldKeepCurrentSelectionOnMobileLongPress } from '../mobile-selection-render.service';

describe('MobileSheetsSelectionRenderService', () => {
    it('keeps the current mobile selection when a long press stays inside an existing range', () => {
        expect(shouldKeepCurrentSelectionOnMobileLongPress(
            [{ startRow: 1, endRow: 3, startColumn: 1, endColumn: 3 }],
            { startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 }
        )).toBe(true);

        expect(shouldKeepCurrentSelectionOnMobileLongPress(
            [{ startRow: 1, endRow: 3, startColumn: 1, endColumn: 3 }],
            { startRow: 4, endRow: 4, startColumn: 2, endColumn: 2 }
        )).toBe(false);
    });
});
