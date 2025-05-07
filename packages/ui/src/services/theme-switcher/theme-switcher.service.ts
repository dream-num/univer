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

import type { Theme } from '@univerjs/themes';

export class ThemeSwitcherService {
    private _styleSheetId = 'univer-theme-css-variables';

    injectThemeToHead(theme: Theme) {
        function generateCSSVariables(theme: any, prefix = '--univer') {
            const variables: string[] = [];

            function traverse(obj: any, path = '') {
                for (const key in obj) {
                    const value = obj[key];
                    const currentPath = path ? `${path}-${key}` : key;

                    if (typeof value === 'object' && value !== null) {
                        traverse(value, currentPath);
                    } else {
                        variables.push(`${prefix}-${currentPath}: ${value};`);
                    }
                }
            }

            traverse(theme);
            return variables.join('\n');
        }

        const cssVariables = generateCSSVariables(theme);

        const existingStyleElement = document.getElementById(this._styleSheetId);
        if (existingStyleElement) {
            existingStyleElement.remove();
        }

        const styleElement = document.createElement('style');
        styleElement.setAttribute('id', this._styleSheetId);
        styleElement.innerHTML = `:root {\n${cssVariables}\n}`;
        document.head.appendChild(styleElement);
    }
}
