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

import { LocaleService, LocaleType } from '@univerjs/core';
import { useDependency } from '@univerjs/ui';
import { useEffect } from 'react';

const locales = [
    {
        label: 'English',
        value: LocaleType.EN_US,
    },
    {
        label: 'Français',
        value: LocaleType.FR_FR,
    },
    {
        label: 'Русский',
        value: LocaleType.RU_RU,
    },
    {
        label: 'Tiếng Việt',
        value: LocaleType.VI_VN,
    },
    {
        label: 'فارسی',
        value: LocaleType.FA_IR,
    },
    {
        label: 'Español',
        value: LocaleType.ES_ES,
    },
    {
        label: 'Català',
        value: LocaleType.CA_ES,
    },
    {
        label: 'Slovenčina',
        value: LocaleType.SK_SK,
    },
    {
        label: '简体中文',
        value: LocaleType.ZH_CN,
    },
    {
        label: '繁體中文（台灣）',
        value: LocaleType.ZH_TW,
    },
    {
        label: '繁體中文（香港）',
        value: LocaleType.ZH_HK,
    },
    {
        label: '日本語',
        value: LocaleType.JA_JP,
    },
    {
        label: '한국어',
        value: LocaleType.KO_KR,
    },
    {
        label: 'Português (Brasil)',
        value: LocaleType.PT_BR,
    },
    {
        label: 'Deutsch',
        value: LocaleType.DE_DE,
    },
    {
        label: 'Italiano',
        value: LocaleType.IT_IT,
    },
    {
        label: 'Bahasa Indonesia',
        value: LocaleType.ID_ID,
    },
    {
        label: 'Polski',
        value: LocaleType.PL_PL,
    },
    {
        label: 'العربية',
        value: LocaleType.AR_SA,
    },
];

// eslint-disable-next-line max-lines-per-function
export function useLocale() {
    const localeService = useDependency(LocaleService);

    async function loadLocales(value: string) {
        let locales;
        switch (value) {
            case LocaleType.ZH_CN:
                locales = await import('@univerjs/mockdata/locales/zh-CN');
                break;
            case LocaleType.ZH_TW:
                locales = await import('@univerjs/mockdata/locales/zh-TW');
                break;
            case LocaleType.ZH_HK:
                locales = await import('@univerjs/mockdata/locales/zh-HK');
                break;
            case LocaleType.FR_FR:
                locales = await import('@univerjs/mockdata/locales/fr-FR');
                break;
            case LocaleType.RU_RU:
                locales = await import('@univerjs/mockdata/locales/ru-RU');
                break;
            case LocaleType.VI_VN:
                locales = await import('@univerjs/mockdata/locales/vi-VN');
                break;
            case LocaleType.JA_JP:
                locales = await import('@univerjs/mockdata/locales/ja-JP');
                break;
            case LocaleType.FA_IR:
                locales = await import('@univerjs/mockdata/locales/fa-IR');
                break;
            case LocaleType.KO_KR:
                locales = await import('@univerjs/mockdata/locales/ko-KR');
                break;
            case LocaleType.ES_ES:
                locales = await import('@univerjs/mockdata/locales/es-ES');
                break;
            case LocaleType.CA_ES:
                locales = await import('@univerjs/mockdata/locales/ca-ES');
                break;
            case LocaleType.SK_SK:
                locales = await import('@univerjs/mockdata/locales/sk-SK');
                break;
            case LocaleType.PT_BR:
                locales = await import('@univerjs/mockdata/locales/pt-BR');
                break;
            case LocaleType.DE_DE:
                locales = await import('@univerjs/mockdata/locales/de-DE');
                break;
            case LocaleType.IT_IT:
                locales = await import('@univerjs/mockdata/locales/it-IT');
                break;
            case LocaleType.ID_ID:
                locales = await import('@univerjs/mockdata/locales/id-ID');
                break;
            case LocaleType.PL_PL:
                locales = await import('@univerjs/mockdata/locales/pl-PL');
                break;
            case LocaleType.AR_SA:
                locales = await import('@univerjs/mockdata/locales/ar-SA');
                break;
            case LocaleType.EN_US:
            default:
                locales = await import('@univerjs/mockdata/locales/en-US');
                break;
        }

        localeService.load({
            [value]: locales.default,
        });
    }

    useEffect(() => {
        const locale = localStorage.getItem('local.locale');

        if (locale) {
            loadLocales(locale).then(() => {
                localeService.setLocale(locale as LocaleType);
            });
        }
    }, []);

    const onSelect = async (value: string) => {
        await loadLocales(value);

        localeService.setLocale(value as LocaleType);

        localStorage.setItem('local.locale', value);
    };

    return {
        type: 'subItem' as const,
        children: '🌐 Languages',
        options: locales.map((lang) => ({
            type: 'radio' as const,
            value: localeService.getCurrentLocale(),
            options: [{
                label: lang.label,
                value: lang.value,
            }],
            onSelect,
        })),
    };
}
