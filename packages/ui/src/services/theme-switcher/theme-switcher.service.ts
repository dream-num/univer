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
import { Disposable } from '@univerjs/core';

export class ThemeSwitcherService extends Disposable {
    applyTheme(theme: Theme, roots: HTMLElement[]): void {
        function applyCSSVariables(value: unknown, path: string[] = []) {
            if (typeof value === 'object' && value !== null) {
                for (const [key, child] of Object.entries(value)) {
                    applyCSSVariables(child, [...path, key]);
                }

                return;
            }

            const property = `--univer-${path.join('-')}`;
            for (const root of roots) {
                root.style.setProperty(property, String(value));
            }
        }

        applyCSSVariables(theme);
    }
}
