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
import { covertCellValue, covertCellValues } from '../utils';

describe('Test utils', () => {
    it('function covertCellValue', () => {
        expect(covertCellValue('=SUM(1)')).toStrictEqual({ f: '=SUM(1)', v: null, p: null });

        expect(covertCellValue('1')).toStrictEqual({ v: '1', f: null, p: null });
        expect(covertCellValue(1)).toStrictEqual({ v: 1, f: null, p: null });
        expect(covertCellValue(true)).toStrictEqual({ v: true, f: null, p: null });

        expect(covertCellValue({})).toStrictEqual({});
    });

    it('function covertCellValues', () => {
        expect(
            covertCellValues(
                [
                    [1, 2],
                    [3, 4],
                ],
                { startRow: 1, startColumn: 1, endRow: 2, endColumn: 2 }
            )
        ).toStrictEqual({
            1: { 1: { v: 1, f: null, p: null }, 2: { v: 2, f: null, p: null } },
            2: { 1: { v: 3, f: null, p: null }, 2: { v: 4, f: null, p: null } },
        });

        expect(
            covertCellValues(
                {
                    1: { 1: 1, 2: 2 },
                    2: { 1: 3, 2: 4 },
                },
                { startRow: 1, startColumn: 1, endRow: 2, endColumn: 2 }
            )
        ).toStrictEqual({
            1: { 1: { v: 1, f: null, p: null }, 2: { v: 2, f: null, p: null } },
            2: { 1: { v: 3, f: null, p: null }, 2: { v: 4, f: null, p: null } },
        });

        expect(
            covertCellValues(
                [
                    [{ v: 1 }, { v: 2 }],
                    [{ v: 3 }, { v: 4 }],
                ],
                { startRow: 1, startColumn: 1, endRow: 2, endColumn: 2 }
            )
        ).toStrictEqual({
            1: { 1: { v: 1 }, 2: { v: 2 } },
            2: { 1: { v: 3 }, 2: { v: 4 } },
        });

        expect(
            covertCellValues(
                {
                    1: { 1: { v: 1 }, 2: { v: 2 } },
                    2: { 1: { v: 3 }, 2: { v: 4 } },
                },
                { startRow: 1, startColumn: 1, endRow: 2, endColumn: 2 }
            )
        ).toStrictEqual({
            1: { 1: { v: 1 }, 2: { v: 2 } },
            2: { 1: { v: 3 }, 2: { v: 4 } },
        });
    });
});
