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

import { isAllColumnsCovered, isAllRowsCovered } from '../utils/selection-utils';

describe('Test selection utils', () => {
    it('Function isAllRowsCovered', () => {
        // single range
        expect(
            isAllRowsCovered(
                [{ startRow: 0, endRow: 999, startColumn: Number.NaN, endColumn: Number.NaN }],
                [{ startRow: 0, endRow: 1, startColumn: Number.NaN, endColumn: Number.NaN }]
            )
        ).toBeFalsy();

        expect(
            isAllRowsCovered(
                [{ startRow: 0, endRow: 999, startColumn: Number.NaN, endColumn: Number.NaN }],
                [{ startRow: 0, endRow: 999, startColumn: Number.NaN, endColumn: Number.NaN }]
            )
        ).toBeTruthy();

        // multiple range
        expect(
            isAllRowsCovered(
                [
                    { startRow: 0, endRow: 999, startColumn: Number.NaN, endColumn: Number.NaN },
                    { startRow: 1000, endRow: 1999, startColumn: Number.NaN, endColumn: Number.NaN },
                ],
                [
                    { startRow: 100, endRow: 999, startColumn: Number.NaN, endColumn: Number.NaN },
                    { startRow: 1000, endRow: 1500, startColumn: Number.NaN, endColumn: Number.NaN },
                ]
            )
        ).toBeFalsy();

        expect(
            isAllRowsCovered(
                [
                    { startRow: 0, endRow: 999, startColumn: Number.NaN, endColumn: Number.NaN },
                    { startRow: 1000, endRow: 1999, startColumn: Number.NaN, endColumn: Number.NaN },
                ],
                [
                    { startRow: 0, endRow: 1500, startColumn: Number.NaN, endColumn: Number.NaN },
                    { startRow: 1000, endRow: 1999, startColumn: Number.NaN, endColumn: Number.NaN },
                ]
            )
        ).toBeTruthy();
    });

    it('Function isAllColumnsCovered', () => {
        // single range
        expect(
            isAllColumnsCovered(
                [{ startRow: Number.NaN, endRow: Number.NaN, startColumn: 0, endColumn: 999 }],
                [{ startRow: Number.NaN, endRow: Number.NaN, startColumn: 0, endColumn: 1 }]
            )
        ).toBeFalsy();

        expect(
            isAllColumnsCovered(
                [{ startRow: Number.NaN, endRow: Number.NaN, startColumn: 0, endColumn: 999 }],
                [{ startRow: Number.NaN, endRow: Number.NaN, startColumn: 0, endColumn: 999 }]
            )
        ).toBeTruthy();

        // multiple range
        expect(
            isAllColumnsCovered(
                [
                    { startRow: Number.NaN, endRow: Number.NaN, startColumn: 0, endColumn: 999 },
                    { startRow: Number.NaN, endRow: Number.NaN, startColumn: 1000, endColumn: 1999 },
                ],
                [
                    { startRow: Number.NaN, endRow: Number.NaN, startColumn: 100, endColumn: 999 },
                    { startRow: Number.NaN, endRow: Number.NaN, startColumn: 1000, endColumn: 1500 },
                ]
            )
        ).toBeFalsy();

        expect(
            isAllColumnsCovered(
                [
                    { startRow: Number.NaN, endRow: Number.NaN, startColumn: 0, endColumn: 999 },
                    { startRow: Number.NaN, endRow: Number.NaN, startColumn: 1000, endColumn: 1999 },
                ],
                [
                    { startRow: Number.NaN, endRow: Number.NaN, startColumn: 0, endColumn: 1500 },
                    { startRow: Number.NaN, endRow: Number.NaN, startColumn: 1000, endColumn: 1999 },
                ]
            )
        ).toBeTruthy();
    });
});
