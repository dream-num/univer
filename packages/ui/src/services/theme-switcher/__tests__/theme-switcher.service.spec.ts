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
import { Injector } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';

import { ThemeSwitcherService } from '../theme-switcher.service';

function createService(): ThemeSwitcherService {
    const injector = new Injector();
    injector.add([ThemeSwitcherService]);
    return injector.get(ThemeSwitcherService);
}

describe('ThemeSwitcherService', () => {
    afterEach(() => {
        document.documentElement.style.removeProperty('--univer-primary-color');
        document.getElementById('univer-theme-css-variables')?.remove();
    });

    it('applies theme variables only to the supplied Univer roots', () => {
        const workbenchRoot = document.createElement('div');
        const portalRoot = document.createElement('div');
        document.documentElement.style.setProperty('--univer-primary-color', 'host');
        const service = createService();

        service.applyTheme(
            { primary: { color: 'red' }, radius: 4 } as unknown as Theme,
            [workbenchRoot, portalRoot]
        );

        for (const root of [workbenchRoot, portalRoot]) {
            expect(root.style.getPropertyValue('--univer-primary-color')).toBe('red');
            expect(root.style.getPropertyValue('--univer-radius')).toBe('4');
        }
        expect(document.documentElement.style.getPropertyValue('--univer-primary-color')).toBe('host');
        expect(document.getElementById('univer-theme-css-variables')).toBeNull();
    });
});
