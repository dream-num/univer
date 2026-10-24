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

import { LocaleType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getCurrencyFormat, getCurrencySymbolByLocale, getCurrencySymbolIconByLocale } from '../currency-symbols';

describe('currency symbols', () => {
    it('currency symbol helpers', () => {
        expect(getCurrencySymbolByLocale(LocaleType.ZH_CN)).toBe('¥');
        expect(getCurrencySymbolByLocale(LocaleType.KO_KR)).toBe('₩');
        expect(getCurrencySymbolIconByLocale(LocaleType.FR_FR)).toEqual({
            icon: 'EuroIcon',
            symbol: '€',
            locale: LocaleType.FR_FR,
        });
        expect(getCurrencySymbolIconByLocale(LocaleType.KO_KR)).toEqual({
            icon: 'WonIcon',
            symbol: '₩',
            locale: LocaleType.KO_KR,
        });
        expect([
            LocaleType.VI_VN,
            LocaleType.FA_IR,
            LocaleType.AR_SA,
            LocaleType.ID_ID,
            LocaleType.PL_PL,
        ].map((locale) => getCurrencySymbolIconByLocale(locale).icon)).toEqual([
            'DongIcon',
            'RialIcon',
            'RialIcon',
            'RupiahIcon',
            'ZlotyIcon',
        ]);
        expect(getCurrencyFormat(LocaleType.ZH_CN, 3)).toContain('"¥"#,##0.000');
        expect(getCurrencyFormat(LocaleType.EN_US, 200)).toContain(`.${'0'.repeat(127)}`);
    });
});
