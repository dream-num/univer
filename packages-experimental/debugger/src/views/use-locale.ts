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
        label: '简体中文',
        value: LocaleType.ZH_CN,
    },
    {
        label: 'Русский',
        value: LocaleType.RU_RU,
    },
    {
        label: '繁體中文',
        value: LocaleType.ZH_TW,
    },
    {
        label: 'Tiếng Việt',
        value: LocaleType.VI_VN,
    },
    {
        label: '한국어',
        value: LocaleType.KO_KR,
    },
    {
        label: 'Español',
        value: 'es-ES',
    },
    {
        label: 'Català',
        value: 'ca-ES',
    },
];

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
            case LocaleType.FR_FR:
                locales = await import('@univerjs/mockdata/locales/fr-FR');
                break;
            case LocaleType.RU_RU:
                locales = await import('@univerjs/mockdata/locales/ru-RU');
                break;
            case LocaleType.VI_VN:
                locales = await import('@univerjs/mockdata/locales/vi-VN');
                break;
            case LocaleType.KO_KR:
                locales = await import('@univerjs/mockdata/locales/ko-KR');
                break;
            case 'es-ES':
                locales = await import('@univerjs/mockdata/locales/es-ES');
                break;
            case 'ca-ES':
                locales = await import('@univerjs/mockdata/locales/ca-ES');
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
