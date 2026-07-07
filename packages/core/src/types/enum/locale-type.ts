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
    EN_US = 'enUS',
    FR_FR = 'frFR',
    ZH_CN = 'zhCN',
    RU_RU = 'ruRU',
    ZH_TW = 'zhTW',
    ZH_HK = 'zhHK',
    VI_VN = 'viVN',
    FA_IR = 'faIR',
    JA_JP = 'jaJP',
    KO_KR = 'koKR',
    ES_ES = 'esES',
    CA_ES = 'caES',
    SK_SK = 'skSK',
    PT_BR = 'ptBR',
    DE_DE = 'deDE',
    IT_IT = 'itIT',
    ID_ID = 'idID',
    PL_PL = 'plPL',
    AR_SA = 'arSA',
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
