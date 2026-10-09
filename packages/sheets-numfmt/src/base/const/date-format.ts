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

interface IDateFormatProfile {
    dates: readonly string[];
    shortDate: string;
    periodBeforeTime?: boolean;
}

const ISO_DATE_PROFILE: IDateFormatProfile = {
    dates: ['yyyy/MM/dd', 'MM-dd'],
    shortDate: 'MM-dd',
};
const MDY_DATE_PROFILE: IDateFormatProfile = {
    dates: ['m/d/yyyy', 'mm/dd/yyyy', 'mmm d, yyyy', 'm/d', 'mmmm d'],
    shortDate: 'm/d',
};
const DMY_DATE_PROFILE: IDateFormatProfile = {
    dates: ['dd/mm/yyyy', 'd/m/yyyy', 'd mmm yyyy', 'dd/mm', 'd mmmm'],
    shortDate: 'dd/mm',
};
const DMY_DOT_DATE_PROFILE: IDateFormatProfile = {
    dates: ['dd.mm.yyyy', 'd.m.yyyy', 'd mmm yyyy', 'dd.mm', 'd mmmm'],
    shortDate: 'dd.mm',
};
const CJK_DATE_PROFILE: IDateFormatProfile = {
    dates: ['yyyy/MM/dd', 'yyyy"年"MM"月"dd"日"', 'MM-dd', 'M"月"d"日"'],
    shortDate: 'MM-dd',
    periodBeforeTime: true,
};
const DATE_FORMAT_PROFILES: Record<LocaleType, IDateFormatProfile> = {
    [LocaleType.EN_US]: MDY_DATE_PROFILE,
    [LocaleType.FR_FR]: DMY_DATE_PROFILE,
    [LocaleType.ZH_CN]: CJK_DATE_PROFILE,
    [LocaleType.RU_RU]: DMY_DOT_DATE_PROFILE,
    [LocaleType.ZH_TW]: CJK_DATE_PROFILE,
    [LocaleType.ZH_HK]: {
        ...CJK_DATE_PROFILE,
        dates: ['dd/MM/yyyy', ...CJK_DATE_PROFILE.dates],
        shortDate: 'dd/MM',
    },
    [LocaleType.VI_VN]: DMY_DATE_PROFILE,
    // The formatter currently falls back to English for Persian and Spanish for Catalan.
    [LocaleType.FA_IR]: ISO_DATE_PROFILE,
    [LocaleType.CA_ES]: {
        dates: ['dd/mm/yyyy', 'd/m/yyyy', 'dd/mm'],
        shortDate: 'dd/mm',
    },
    [LocaleType.JA_JP]: CJK_DATE_PROFILE,
    [LocaleType.KO_KR]: {
        dates: ['yyyy. mm. dd.', 'yyyy"년" m"월" d"일"', 'mm-dd', 'm"월" d"일"'],
        shortDate: 'mm-dd',
        periodBeforeTime: true,
    },
    [LocaleType.ES_ES]: DMY_DATE_PROFILE,
    [LocaleType.SK_SK]: DMY_DOT_DATE_PROFILE,
    [LocaleType.PT_BR]: DMY_DATE_PROFILE,
    [LocaleType.DE_DE]: DMY_DOT_DATE_PROFILE,
    [LocaleType.IT_IT]: DMY_DATE_PROFILE,
    [LocaleType.ID_ID]: DMY_DATE_PROFILE,
    [LocaleType.PL_PL]: DMY_DOT_DATE_PROFILE,
    [LocaleType.AR_SA]: {
        dates: ['dd/mm/yyyy', 'd/m/yyyy', 'dd/mm'],
        shortDate: 'dd/mm',
    },
};

export function getDateFormatPatterns(locale: LocaleType): string[] {
    const profile = DATE_FORMAT_PROFILES[locale] ?? ISO_DATE_PROFILE;
    const clockPatterns = ['hh:mm', 'h:mm', 'h:mm:ss'];
    const timePatterns = clockPatterns.map((pattern) => profile.periodBeforeTime
        ? `AM/PM ${pattern}`
        : `${pattern} AM/PM`);

    return [...new Set([
        'yyyy-MM-dd',
        ...profile.dates,
        'h:mm:ss',
        'h:mm',
        ...timePatterns,
        `${profile.shortDate} ${timePatterns[0]}`,
    ])];
}
