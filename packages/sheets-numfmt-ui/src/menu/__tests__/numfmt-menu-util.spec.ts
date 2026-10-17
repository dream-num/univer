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

import { getNumfmtParseValueFilter } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getNumberFormatLabelKey } from '../numfmt-menu-util';

describe('getNumberFormatLabelKey', () => {
    it.each(['en', 'zh-CN'])('classifies typed dollar amounts as currency in %s', (locale) => {
        const parsed = getNumfmtParseValueFilter('$100.11', { locale });
        expect(parsed?.v).toBe(100.11);
        expect(getNumberFormatLabelKey(parsed?.z, '$')).toBe('sheets-numfmt-ui.currency');
        expect(getNumberFormatLabelKey(parsed?.z, '¥')).toBe('sheets-numfmt-ui.currency');
    });

    it('preserves specific presets while recognizing other patterns by type', () => {
        expect(getNumberFormatLabelKey('"$" #,##0.00_);[Red]("$"#,##0.00)', '$')).toBe('sheets-numfmt-ui.accounting');
        expect(getNumberFormatLabelKey('"$"#,##0;[Red]"$"#,##0', '$')).toBe('sheets-numfmt-ui.roundingCurrency');
        expect(getNumberFormatLabelKey('[h]:mm:ss', '$')).toBe('sheets-numfmt-ui.timeDuration');
        expect(getNumberFormatLabelKey('"€"#,##0.000', '$')).toBe('sheets-numfmt-ui.currency');
        expect(getNumberFormatLabelKey('0.000%;[Red]-0.000%', '$')).toBe('sheets-numfmt-ui.percent');
        expect(getNumberFormatLabelKey('dd/mm/yyyy', '$')).toBe('sheets-numfmt-ui.date');
        expect(getNumberFormatLabelKey('#,##0.000', '$')).toBe('sheets-numfmt-ui.number');
        expect(getNumberFormatLabelKey('# ?/?', '$')).toBe('sheets-numfmt-ui.moreFmt');
    });
});
