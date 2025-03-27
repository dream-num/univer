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

import { generateNullCell, generateNullCellStyle, generateNullCellValue } from '../utils';

describe('Test utils', () => {
    it('Test generateNullCell', () => {
        const range: IRange[] = [cellToRange(0, 0), cellToRange(1, 1)];
        const result = generateNullCell(range);
        expect(result).toEqual({
            0: {
                0: null,
            },
            1: {
                1: null,
            },
        });
    });

    it('Test generateNullCellValue', () => {
        const range: IRange[] = [cellToRange(0, 0), cellToRange(1, 1)];
        const result = generateNullCellValue(range);
        expect(result).toEqual({
            0: {
                0: {
                    v: null,
                    p: null,
                    f: null,
                    si: null,
                    custom: null,
                },
            },
            1: {
                1: { v: null, p: null, f: null, si: null, custom: null },
            },
        });
    });

    it('Test generateNullCellStyle', () => {
        const range: IRange[] = [cellToRange(0, 0), cellToRange(1, 1)];
        const result = generateNullCellStyle(range);
        expect(result).toEqual({
            0: {
                0: {
                    s: null,
                },
            },
            1: {
                1: {
                    s: null,
                },
            },
        });
    });
});
