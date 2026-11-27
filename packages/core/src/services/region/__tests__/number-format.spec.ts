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

    it('validates integer group widths and keeps punctuation in quoted format text', () => {
        expect(getNumfmtParseValueFilter('1,23,456', { region: 'en-IN' })?.v).toBe(123456);
        expect(getNumfmtParseValueFilter('1,23,456', { region: 'en-US' })).toBeNull();
        expect(getNumfmtParseValueFilter('1234.56', { region: 'de-DE' })).toBeNull();
        expect(format('0.00"."', 1.5, { region: 'de-DE' })).toBe('1,50.');
    });
});
