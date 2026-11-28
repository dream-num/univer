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
import { format } from '../../../shared/numfmt/api';
import { getNumfmtParseValueFilter } from '../../../shared/numfmt/utils';
import samples from './fixtures/excel-number-format.json';

describe('Excel regional number formats', () => {
    it('round-trips the Excel 16.115 display and direct-entry samples in every measured region', () => {
        for (const { regions, general, formatted, direct } of samples) {
            for (const region of regions.split(' ')) {
                const options = { region, locale: 'en' };
                expect(format('General', 1234.56, options), region).toBe(general);
                expect(format('#,##0.00', 1234567890123.75, options), region).toBe(formatted);
                expect(getNumfmtParseValueFilter(general, options)?.v, region).toBe(1234.56);
                expect(getNumfmtParseValueFilter(formatted, options)?.v, region).toBe(1234567890123.75);
                expect(getNumfmtParseValueFilter('1,234', options)?.v ?? '1,234', region).toBe(direct);
            }
        }
    });

    it.each([
        ['uz-Cyrl-CA', '1,234,567.5', 1234],
        ['uz-Cyrl-GB', '1,234,567.5', 1234],
        ['fr-CA', '1 234 567,5', 1.234],
        ['sh-CH', "1'234'567.5", '1,234'],
        ['rm-Latn-CH', '1 234 567,5', 1.234],
        ['rm-Cyrl-CH', "1'234'567.5", '1,234'],
        ['la', '1234567.5', '1,234'],
        ['la-CA', '1,234,567.5', 1234],
        ['cmn-FR', '1 234 567,5', 1.234],
        ['zh-Hans-FR', '1,234,567.5', 1234],
        ['cmn-Arab-IR', '1234567.5', '1,234'],
        ['zh-cmn-Hans-DE', '1,234,567.5', 1234],
        ['x-univer', '1,234,567.5', 1234],
    ] as const)('round-trips grouped numbers and interprets direct commas in %s', (region, display, commaInput) => {
        expect(format('#,##0.0', 1234567.5, { region })).toBe(display);
        expect(getNumfmtParseValueFilter(display, { region })?.v).toBe(1234567.5);
        expect(getNumfmtParseValueFilter('1,234', { region })?.v ?? '1,234').toBe(commaInput);
    });

    it('uses HTML grouping only for an external table in regions with ungrouped display', () => {
        for (const [region, input] of [['la', '1,234'], ['und-CA', '1,234'], ['fa-AF', '1٬234']]) {
            expect(getNumfmtParseValueFilter(input, { region, inputSource: 'text-paste' })).toBeNull();
            expect(getNumfmtParseValueFilter(input, { region, inputSource: 'html-paste' })?.v).toBe(1234);
        }
        expect(getNumfmtParseValueFilter('1,234', { region: 'en-US-u-va-posix', inputSource: 'html-paste' })).toBeNull();
    });

    it('validates integer group widths and keeps punctuation in quoted format text', () => {
        expect(getNumfmtParseValueFilter('1,23,456', { region: 'en-IN' })?.v).toBe(123456);
        expect(getNumfmtParseValueFilter('1,23,456', { region: 'en-US' })).toBeNull();
        expect(getNumfmtParseValueFilter('1234.56', { region: 'de-DE' })).toBeNull();
        expect(format('0.00"."', 1.5, { region: 'de-DE' })).toBe('1,50.');
    });
});
