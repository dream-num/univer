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
import {
    DEFAULT_NUMBER_FORMAT,
    DEFAULT_TEXT_FORMAT,
    DEFAULT_TEXT_FORMAT_EXCEL,
    getNumfmtParseValueFilter,
    isDefaultFormat,
    isPatternEqualWithoutDecimal,
    isTextFormat,
} from '../numfmt';

describe('numfmt helpers', () => {
    it('should recognize text and default number formats', () => {
        expect(isTextFormat(DEFAULT_TEXT_FORMAT)).toBe(true);
        expect(isTextFormat(DEFAULT_TEXT_FORMAT_EXCEL)).toBe(true);
        expect(isTextFormat('0.00')).toBe(false);

        expect(isDefaultFormat(null)).toBe(true);
        expect(isDefaultFormat(undefined)).toBe(true);
        expect(isDefaultFormat(DEFAULT_NUMBER_FORMAT)).toBe(true);
        expect(isDefaultFormat('0.00')).toBe(false);
    });

    it('should compare patterns while ignoring decimal precision differences', () => {
        expect(isPatternEqualWithoutDecimal('0.00', '0.0')).toBe(true);
        expect(isPatternEqualWithoutDecimal('$#,##0.00', '$#,##0')).toBe(true);
        expect(isPatternEqualWithoutDecimal('0.00', '0%')).toBe(false);
        expect(isPatternEqualWithoutDecimal('', '0.0')).toBe(false);
    });

    it('should filter invalid parse results and keep valid numfmt parses', () => {
        expect(getNumfmtParseValueFilter('1 23')).toBeNull();
        expect(getNumfmtParseValueFilter('5A')).toBeNull();
        expect(getNumfmtParseValueFilter('1000,')).toBeNull();
        expect(getNumfmtParseValueFilter('1,00,0')).toBeNull();

        expect(getNumfmtParseValueFilter('2/3')?.z).toBe('m/d');
        expect(getNumfmtParseValueFilter('5 A')?.z).toBe('h:mm AM/PM');
        expect(getNumfmtParseValueFilter('$1000')?.z).toBe('$#,##0');
        expect(getNumfmtParseValueFilter('25%')?.z).toBe('0%');
    });
});
