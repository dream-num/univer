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
import { useDependency } from '@univerjs/ui';
import { useEffect } from 'react';

export function useDarkMode() {
    const themeService = useDependency(ThemeService);

    useEffect(() => {
        const darkMode = localStorage.getItem('local.darkMode');

        if (darkMode === 'dark') {
            document.documentElement.classList.add('univer-dark');
            themeService.setDarkMode(true);
        } else if (darkMode === 'system') {
            themeService.setDarkMode(false);
        }
    }, []);

    const onSelect = () => {
        const darkMode = themeService.darkMode ? 'light' : 'dark';

        themeService.setDarkMode(darkMode === 'dark');
        localStorage.setItem('local.darkMode', darkMode);
    };

    return {
        type: 'item' as const,
        children: '🌓 Toggle dark mode',
        onSelect,
    };
}
