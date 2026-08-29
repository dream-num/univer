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
import { describe, expect, it } from 'vitest';
import { getPatternPreview, getPatternType } from '../pattern';

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
