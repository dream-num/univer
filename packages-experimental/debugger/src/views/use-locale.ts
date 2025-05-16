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
];

export function useLocale() {
    const localeService = useDependency(LocaleService);

    useEffect(() => {
        const locale = localStorage.getItem('local.locale');
        if (locale) {
            localeService.setLocale(locale as LocaleType);
        }
    }, []);

    const onSelect = (value: string) => {
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
