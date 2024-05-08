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

import canUseDom from 'rc-util/lib/Dom/canUseDom';

import styles from './theme-root.module.less';

function convertToDashCase(input: string): string {
    const dashCase = input.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`).replace(/(\d+)/g, '-$1');

    return `--${dashCase}`;
}

function convertHexToRgb(input: string): string {
    if (input.startsWith('#')) {
        const hex = input.replace('#', '');
        const r = Number.parseInt(hex.substring(0, 2), 16);
        const g = Number.parseInt(hex.substring(2, 4), 16);
        const b = Number.parseInt(hex.substring(4, 6), 16);

        return `${r}, ${g}, ${b}`;
    }

    return input;
}

class Theme {
    private static _instance: Theme | null = null;
    private _styleSheet: HTMLStyleElement | null = null;
    private _themeRootName = styles.theme;

    private constructor() {
        if (!canUseDom()) return;

        const $style = document.createElement('style');
        $style.id = this._themeRootName;

        // Determine the mount point for the stylesheet
        let mountPoint: HTMLElement | ShadowRoot | null = null;
        const currentRoot = document.getRootNode();

        if (currentRoot === document) {
            // Normal DOM environment
            mountPoint = document.head;
        } else if (currentRoot instanceof ShadowRoot) {
            // Shadow DOM environment
            mountPoint = currentRoot;
        } else {
            // Inside an iframe or other environment
            mountPoint = (currentRoot as Document).head;
        }

        if (mountPoint) {
            mountPoint.appendChild($style);
            this._styleSheet = $style;
        }
    }

    static getInstance(): Theme {
        if (!Theme._instance) {
            Theme._instance = new Theme();
        }
        return Theme._instance;
    }

    setTheme(root: HTMLElement, theme: Record<string, string>) {
        if (!this._styleSheet) return;

        // 1. set theme root class
        root.classList.remove(this._themeRootName);
        root.classList.add(this._themeRootName);

        // 2. remove old theme
        this._styleSheet.innerHTML = '';

        // 3. set new theme
        this._styleSheet.innerHTML = `.${this._themeRootName} {${Object.keys(theme)
            .map((key) => `${convertToDashCase(key)}: ${convertHexToRgb(theme[key])};`)
            .join('')}}`;
    }
}

export const themeInstance = Theme.getInstance();
