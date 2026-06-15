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

import { defaultTheme } from '@univerjs/themes';
import { beforeEach, describe, expect, it } from 'vitest';
import { Injector } from '../../../common/di';
import { ThemeService } from '../theme.service';

describe('ThemeService', () => {
    let service: ThemeService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([ThemeService]);
        service = injector.get(ThemeService);
    });

    it('publishes theme and dark-mode changes used by UI renderers', () => {
        const darkModes: boolean[] = [];
        const primaryColors: string[] = [];
        service.darkMode$.subscribe((darkMode) => darkModes.push(darkMode));
        service.currentTheme$.subscribe((theme) => primaryColors.push(theme.primary[600]));

        service.setDarkMode(true);
        service.setTheme({
            ...defaultTheme,
            primary: {
                ...defaultTheme.primary,
                600: '#123456',
            },
        });

        expect(darkModes).toEqual([false, true]);
        expect(primaryColors).toEqual([defaultTheme.primary[600], '#123456']);
        expect(service.getColorFromTheme('primary.600')).toBe('#123456');
    });

    it('validates only theme color tokens that exist in the active theme shape', () => {
        expect(service.isValidThemeColor('primary.600')).toBe(true);
        expect(service.isValidThemeColor('missing.600')).toBe(false);
        expect(service.isValidThemeColor('primary.999')).toBe(false);
    });
});
