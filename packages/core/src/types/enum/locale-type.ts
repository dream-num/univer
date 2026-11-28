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

/**
 * Built-in locales.
 */
export enum LocaleType {
    EN_US = 'en-US',
    FR_FR = 'fr-FR',
    ZH_CN = 'zh-CN',
    RU_RU = 'ru-RU',
    ZH_TW = 'zh-TW',
    ZH_HK = 'zh-HK',
    VI_VN = 'vi-VN',
    FA_IR = 'fa-IR',
    JA_JP = 'ja-JP',
    KO_KR = 'ko-KR',
    ES_ES = 'es-ES',
    CA_ES = 'ca-ES',
    SK_SK = 'sk-SK',
    PT_BR = 'pt-BR',
    DE_DE = 'de-DE',
    IT_IT = 'it-IT',
    ID_ID = 'id-ID',
    PL_PL = 'pl-PL',
    AR_SA = 'ar-SA',
}

type LocaleDirection = 'ltr' | 'rtl';

interface ILocaleMeta {
    name: string;
    tag: string;
    direction: LocaleDirection;
    numberingSystem?: string;
}

export const LOCALE_META: Record<LocaleType, ILocaleMeta> = {
    [LocaleType.EN_US]: {
        name: 'English',
        tag: 'en-US',
        direction: 'ltr',
    },
    [LocaleType.FR_FR]: {
        name: 'Français',
        tag: 'fr-FR',
        direction: 'ltr',
    },
    [LocaleType.ZH_CN]: {
        name: '简体中文',
        tag: 'zh-CN',
        direction: 'ltr',
    },
    [LocaleType.RU_RU]: {
        name: 'Русский',
        tag: 'ru-RU',
        direction: 'ltr',
    },
    [LocaleType.ZH_TW]: {
        name: '繁體中文',
        tag: 'zh-TW',
        direction: 'ltr',
    },
    [LocaleType.ZH_HK]: {
        name: '繁體中文（香港）',
        tag: 'zh-HK',
        direction: 'ltr',
    },
    [LocaleType.VI_VN]: {
        name: 'Tiếng Việt',
        tag: 'vi-VN',
        direction: 'ltr',
    },
    [LocaleType.FA_IR]: {
        name: 'فارسی',
        tag: 'fa-IR',
        direction: 'rtl',
        numberingSystem: 'arabext',
    },
    [LocaleType.JA_JP]: {
        name: '日本語',
        tag: 'ja-JP',
        direction: 'ltr',
    },
    [LocaleType.KO_KR]: {
        name: '한국어',
        tag: 'ko-KR',
        direction: 'ltr',
    },
    [LocaleType.ES_ES]: {
        name: 'Español',
        tag: 'es-ES',
        direction: 'ltr',
    },
    [LocaleType.CA_ES]: {
        name: 'Català',
        tag: 'ca-ES',
        direction: 'ltr',
    },
    [LocaleType.SK_SK]: {
        name: 'Slovenčina',
        tag: 'sk-SK',
        direction: 'ltr',
    },
    [LocaleType.PT_BR]: {
        name: 'Português (Brasil)',
        tag: 'pt-BR',
        direction: 'ltr',
    },
    [LocaleType.DE_DE]: {
        name: 'Deutsch',
        tag: 'de-DE',
        direction: 'ltr',
    },
    [LocaleType.IT_IT]: {
        name: 'Italiano',
        tag: 'it-IT',
        direction: 'ltr',
    },
    [LocaleType.ID_ID]: {
        name: 'Bahasa Indonesia',
        tag: 'id-ID',
        direction: 'ltr',
    },
    [LocaleType.PL_PL]: {
        name: 'Polski',
        tag: 'pl-PL',
        direction: 'ltr',
    },
    [LocaleType.AR_SA]: {
        name: 'العربية',
        tag: 'ar-SA',
        direction: 'rtl',
        numberingSystem: 'arab',
    },
};

// Currently registered primary language subtags have two or three letters.
// Capture the formatting fields separately from variants, extensions and private use.
const localeTagPattern = /^([a-z]{2,3}(?:-[a-z]{3}){0,3})(?:-([a-z]{4}))?(?:-([a-z]{2}|[0-9]{3}))?((?:-(?:[a-z0-9]{5,8}|[0-9][a-z0-9]{3}))*)((?:-[0-9a-wy-z](?:-[a-z0-9]{2,8})+)*)(-x(?:-[a-z0-9]{1,8})+)?$/i;

// Only the irregular grandfathered tags need a separate grammar (RFC 5646 §2.1).
const irregularTags = ('en-GB-oed i-ami i-bnn i-default i-enochian i-hak i-klingon i-lux i-mingo i-navajo ' +
    'i-pwn i-tao i-tay i-tsu sgn-BE-FR sgn-BE-NL sgn-CH-DE').split(' ');

function parseLocaleTag(region: string | undefined): string | undefined {
    if (typeof region !== 'string') return undefined;
    if (/^[a-z0-9-]+$/i.test(region)) {
        const parts = region.match(localeTagPattern);
        if (parts) {
            const [, language, script, territory, variants, extensions, privateUse = ''] = parts;
            const variantTags = variants.toLowerCase().split('-');
            const singletons = extensions.toLowerCase().match(/-[a-z0-9](?=-)/g) ?? [];
            if (new Set(variantTags).size === variantTags.length && new Set(singletons).size === singletons.length) {
                return language.toLowerCase() + (script ? `-${script[0].toUpperCase()}${script.slice(1).toLowerCase()}` : '') +
                    (territory ? `-${territory.toUpperCase()}` : '') + (variants + extensions + privateUse).toLowerCase();
            }
        } else {
            if (/^x(?:-[a-z0-9]{1,8})+$/i.test(region)) return region.toLowerCase();
            const grandfathered = irregularTags.find((tag) => tag.toLowerCase() === region.toLowerCase());
            if (grandfathered) return grandfathered;
        }
    }
    return undefined;
}

/**
 * Normalize the casing of a recognized tag.
 * Preserve unrecognized strings for callers that provide their own fallback.
 * @example getRegionTag('zh-cn') // 'zh-CN'
 */
export function getRegionTag(region: string = ''): string {
    return parseLocaleTag(region) ?? region;
}

/**
 * Validate a locale or region input and normalize BCP 47 subtag casing without host locale data.
 * @throws {RangeError} If the input is malformed.
 * @example normalizeLocaleTag('sr-latn-rs') // 'sr-Latn-RS'
 * @internal
 */
export function normalizeLocaleTag(input: string): string {
    const tag = parseLocaleTag(input);
    if (tag === undefined) throw new RangeError(`Invalid BCP 47 language tag: ${input}`);
    return tag;
}

/**
 * Read a tag from a snapshot or saved preference without changing its serialized spelling.
 * Missing, malformed and unassigned long primary language subtags yield undefined.
 * Private-use and grandfathered tags remain valid identifiers for custom language packs.
 * @example getStoredLocaleTag(workbook.getSnapshot().locale) === LocaleType.ZH_CN
 * @public
 */
export function getStoredLocaleTag(input: unknown): string | undefined {
    // Compatibility: remove compact spelling conversion when legacy snapshots and preferences are retired.
    return typeof input === 'string' ? parseLocaleTag(input.replace(/^([a-z]{2,3})([A-Z]{2})$/, '$1-$2')) : undefined;
}

// Formatting typically reuses one region across a sheet.
let lastRegion: string | undefined;
let lastLocale: Intl.Locale | undefined;

export function getRegionLocale(region: string): Intl.Locale | undefined {
    if (region !== lastRegion) {
        lastRegion = region;
        try {
            lastLocale = new Intl.Locale(getRegionTag(region));
        } catch (error) {
            if (!(error instanceof RangeError)) throw error;
            lastLocale = undefined;
        }
    }
    return lastLocale;
}

/**
 * Select the tag for native formatting. Tags the host cannot represent, including private-use-only
 * tags, use en-US. The configured UI language and region retain their original identities.
 * @example getIntlLocaleTag('x-univer') // 'en-US'
 * @internal
 */
export function getIntlLocaleTag(locale: string): string {
    return getRegionLocale(locale)?.toString() ?? LocaleType.EN_US;
}
