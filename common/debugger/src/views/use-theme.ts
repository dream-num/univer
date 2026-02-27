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

import { ThemeService } from '@univerjs/core';
import { defaultTheme, greenTheme } from '@univerjs/themes';
import { useDependency } from '@univerjs/ui';
import { useEffect } from 'react';

const themes = [
    {
        label: '🟢',
        value: greenTheme,
    },
    {
        label: '🔵',
        value: defaultTheme,
    },
];

export function useTheme() {
    const themeService = useDependency(ThemeService);

    useEffect(() => {
        const themeKey = localStorage.getItem('local.theme');

        const theme = themes.find((theme) => theme.label === themeKey);

        if (theme) {
            themeService.setTheme(theme.value);
        }
    }, []);

    const onSelect = (value: string) => {
        localStorage.setItem('local.theme', value);

        const theme = themes.find((theme) => theme.label === value);

        if (theme) {
            themeService.setTheme(theme.value);
        }
    };

    return {
        type: 'subItem' as const,
        children: '🎨 Themes',
        options: themes.map((theme) => ({
            type: 'item' as const,
            children: theme.label,
            onSelect: () => onSelect(theme.label),
        })),
    };
}
