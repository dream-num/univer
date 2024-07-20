/**
 * Copyright 2023-present DreamNum Inc.
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

import lightTheme from './lightTheme.module.less';
import darkTheme from './darkTheme.module.less';

export function initTheme() {
    applyTheme();

    const observer = new MutationObserver(applyTheme);
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class'],
    });
}

function applyTheme() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const theme = isDarkMode ? darkTheme : lightTheme;
    Object.keys(theme).forEach((key) => {
        document.documentElement.style.setProperty(convertToDashCase(key), theme[key]);
    });
};

function convertToDashCase(input: string): string {
    const dashCase = input.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`).replace(/(\d+)/g, '-$1');

    return `--${dashCase}`;
}
