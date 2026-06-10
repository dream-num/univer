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

import type { IUniverDebuggerConfig } from '../config/config';
import { IConfigService, LocaleService, LocaleType } from '@univerjs/core';
import { useDependency } from '@univerjs/ui';
import { useCallback, useEffect } from 'react';
import { DEBUGGER_PLUGIN_CONFIG_KEY } from '../config/config';

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

export function useLocale() {
    const configService = useDependency(IConfigService);
    const localeService = useDependency(LocaleService);
    const configs = configService.getConfig<IUniverDebuggerConfig>(DEBUGGER_PLUGIN_CONFIG_KEY);
    const localeLoader = configs?.localeLoader;

    const loadLocales = useCallback(async (value: string) => {
        const locale = value as LocaleType;
        if (!localeLoader) {
            throw new Error('[UniverDebuggerPlugin]: localeLoader is required.');
        }
        const localePack = await localeLoader(locale);

        localeService.load({
            [locale]: localePack,
        });
    }, [localeLoader, localeService]);

    useEffect(() => {
        const locale = localStorage.getItem('local.locale');

        if (locale) {
            loadLocales(locale).then(() => {
                localeService.setLocale(locale as LocaleType);
            });
        }
    }, [loadLocales, localeService]);

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
