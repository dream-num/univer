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

import { LocaleType, numfmt } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { DATEFMTLISG } from '../../base/const/formatdetail';
import { getDateFormatOptions } from '../options';

describe('getDateFormatOptions', () => {
    it('keeps the legacy public options when no locale is supplied', () => {
        expect(getDateFormatOptions()).toEqual(DATEFMTLISG.map(({ label, suffix }) => ({ label, value: suffix })));
    });

    it.each<[LocaleType, string, string]>([
        [LocaleType.EN_US, '08/05/1930', '1:30 PM'],
        [LocaleType.FR_FR, '05/08/1930', '1:30 PM'],
        [LocaleType.DE_DE, '05.08.1930', '1:30 PM'],
        [LocaleType.ZH_CN, '1930年08月05日', '下午 1:30'],
        [LocaleType.JA_JP, '1930年08月05日', '午後 1:30'],
        [LocaleType.KO_KR, '1930년 8월 5일', '오후 1:30'],
    ])('previews the date order and day period for %s', (locale, dateLabel, timeLabel) => {
        const labels = getDateFormatOptions(locale).map((option) => option.label);
        expect(labels).toContain(dateLabel);
        expect(labels).toContain(timeLabel);
    });

    it.each(Object.values(LocaleType))('provides valid, unique temporal patterns for %s', (locale) => {
        const options = getDateFormatOptions(locale);
        expect(options.length).toBeGreaterThan(0);
        expect(new Set(options.map((option) => option.value)).size).toBe(options.length);
        for (const option of options) {
            expect(['date', 'time', 'datetime']).toContain(numfmt.getFormatInfo(option.value).type);
            expect(option.label).not.toMatch(/#|NaN/);
        }
    });

    it('does not offer Chinese literals in English presets', () => {
        for (const option of getDateFormatOptions(LocaleType.EN_US)) {
            expect(option.label).not.toMatch(/[年月日]|上午|下午/);
            expect(option.value).not.toMatch(/[年月日]|上午|下午/);
        }
    });

    it('does not select the US date order for locales whose formatter falls back to English', () => {
        const persian = getDateFormatOptions(LocaleType.FA_IR);
        expect(persian.some((option) => option.label === '1930/08/05')).toBe(true);
        expect(persian.some((option) => option.label === '8/5/1930')).toBe(false);
    });

    it('falls back to language-neutral date patterns for an unsupported locale', () => {
        const options = getDateFormatOptions('unsupported' as LocaleType);
        expect(options.some((option) => option.label === '1930-08-05')).toBe(true);
        expect(options.some((option) => /[年月日]|上午|下午/.test(option.label))).toBe(false);
    });
});
