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

/* eslint-disable no-magic-numbers */

import { describe, expect, it } from 'vitest';

import { deserializeRangeForR1C1 } from '../r1c1-reference';

describe('Test Reference R1C1', () => {
    it('deserializeRangeForR1C1', () => {
        expect(deserializeRangeForR1C1('[workbook1]sheet1!R1C1:R5C10')).toStrictEqual({
            range: {
                endAbsoluteRefType: 0,
                endColumn: 9,
                endRow: 4,
                startAbsoluteRefType: 0,
                startColumn: 0,
                startRow: 0,
            },
            sheetName: 'sheet1',
            unitId: 'workbook1',
        });

        expect(deserializeRangeForR1C1('[workbook1]sheet1!R[-3]C[-3]:R5C10', 4, 5)).toStrictEqual({
            range: {
                endAbsoluteRefType: 0,
                endColumn: 9,
                endRow: 4,
                startAbsoluteRefType: 0,
                startColumn: 2,
                startRow: 1,
            },
            sheetName: 'sheet1',
            unitId: 'workbook1',
        });

        expect(deserializeRangeForR1C1('[workbook1]sheet1!R3C[-3]:R5C[2]', 4, 5)).toStrictEqual({
            range: {
                endAbsoluteRefType: 0,
                endColumn: 7,
                endRow: 4,
                startAbsoluteRefType: 0,
                startColumn: 2,
                startRow: 2,
            },
            sheetName: 'sheet1',
            unitId: 'workbook1',
        });
    });
});
