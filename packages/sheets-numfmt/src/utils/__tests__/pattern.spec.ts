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

import { DEFAULT_NUMBER_FORMAT } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPatternPreview, getPatternPreviewIgnoreGeneral, getPatternType } from '../pattern';

describe('getPatternType', () => {
    it('classifies conditional general formats as number formats', () => {
        expect(getPatternType(DEFAULT_NUMBER_FORMAT)).toBe('general');
        expect(getPatternType('[>0]"A";[<0]"B";"B"')).toBe('number');
    });

    it('classifies two-section conditional text formats as number formats', () => {
        const pattern = '[>0]"未完成";[<=0]"完成"';
        expect(getPatternType(pattern)).toBe('number');
        expect(getPatternPreview(pattern, 1)).toEqual({ result: '未完成' });
        expect(getPatternPreview(pattern, 0)).toEqual({ result: '完成' });
        expect(getPatternPreview(pattern, -1)).toEqual({ result: '-完成' });
    });

    it('classifies three-section conditional text formats as number formats', () => {
        const pattern = '[>0]"未完成";[<0]"完成";"完成"';
        expect(getPatternType(pattern)).toBe('number');
        expect(getPatternPreview(pattern, 1)).toEqual({ result: '未完成' });
        expect(getPatternPreview(pattern, 0)).toEqual({ result: '完成' });
        expect(getPatternPreview(pattern, -1)).toEqual({ result: '完成' });
    });
});

describe('getPatternPreview', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it.each([
        { pattern: '[Red]0.00;[Green]\\-0.00;0.00', colors: ['red', 'green', undefined, 'red'] },
        { pattern: '[Red]0.00;[Green]\\-0.00;[Blue]0.00', colors: ['red', 'green', 'blue', 'red'] },
        { pattern: '[Red]0.00', colors: ['red', 'red', 'red', 'red'] },
        { pattern: '[Red]0.00;[Green]\\-0.00', colors: ['red', 'green', 'red', 'red'] },
        { pattern: '[Red][>=10]0.00;[Blue][<0]\\-0.00;[Green]0.00', colors: ['red', 'blue', 'green', 'green'] },
        { pattern: '0.00', colors: [undefined, undefined, undefined, undefined] },
    ])('returns the active section color for $pattern', ({ pattern, colors }) => {
        [12.34, -12.34, 0, 5].forEach((value, index) => {
            expect(getPatternPreview(pattern, value)).toEqual({
                result: value.toFixed(2),
                color: colors[index],
            });
        });
    });

    it('pattern preview helpers return types and gracefully handle general or invalid formats', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        expect(getPatternType('0%')).toBe('percent');
        expect(getPatternPreview('0.00', 12.3)).toEqual({ result: '12.30' });
        expect(getPatternPreviewIgnoreGeneral(DEFAULT_NUMBER_FORMAT, 0.1 + 0.2)).toEqual({ result: '0.3' });
        expect(getPatternPreview('[invalid', 42)).toEqual({ result: '42' });
    });
});
