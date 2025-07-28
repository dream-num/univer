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

import type { Univer } from '../../univer';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeService } from '../theme/theme.service';
import { createTestBed } from './create-test-bed';

describe('Test theme service', () => {
    let univer: Univer;

    beforeEach(() => {
        univer?.dispose();
        const instance = createTestBed();
        univer = instance.univer;
    });

    beforeEach(() => {
        univer?.dispose();
        const instance = createTestBed();
        univer = instance.univer;
    });

    it('should get default theme', () => {
        const themeService = univer.__getInjector().get(ThemeService);
        expect(themeService.getCurrentTheme()).toBeDefined();
    });

    it('should set and get theme', () => {
        const themeService = univer.__getInjector().get(ThemeService);
        const oldTheme = themeService.getCurrentTheme();
        const theme = {
            ...oldTheme,
            primary: {
                ...oldTheme.primary,
                600: '#123456',
            },
        };
        themeService.setTheme(theme);
        expect(themeService.getCurrentTheme().primary[600]).toBe('#123456');
    });

    it('should set and get dark mode', () => {
        const themeService = univer.__getInjector().get(ThemeService);
        themeService.setDarkMode(true);
        expect(themeService.darkMode).toBe(true);
        themeService.setDarkMode(false);
        expect(themeService.darkMode).toBe(false);
    });

    it('should validate theme color', () => {
        const themeService = univer.__getInjector().get(ThemeService);
        expect(themeService.isValidThemeColor('primary.600')).toBe(true);
        expect(themeService.isValidThemeColor('notexist')).toBe(false);
    });

    it('should get color from theme', () => {
        const themeService = univer.__getInjector().get(ThemeService);
        const oldTheme = themeService.getCurrentTheme();
        const theme = {
            ...oldTheme,
            primary: {
                ...oldTheme.primary,
                600: '#abcdef',
            },
        };
        themeService.setTheme(theme);
        expect(themeService.getColorFromTheme('primary.600')).toBe('#abcdef');
    });

    it('should tap cached theme color', () => {
        const themeService = univer.__getInjector().get(ThemeService);
        const oldTheme = themeService.getCurrentTheme();
        const theme = {
            ...oldTheme,
            primary: {
                ...oldTheme.primary,
                600: '#abcdef',
            },
        };
        themeService.setTheme(theme);

        expect(themeService.isValidThemeColor('primary.600')).toBe(true);
        expect(themeService.isValidThemeColor('primary.600')).toBe(true); // Should hit the cache
        expect(themeService.getColorFromTheme('primary.600')).toBe('#abcdef');
        expect(themeService.getColorFromTheme('primary.600')).toBe('#abcdef'); // Should hit the cache
    });
});
