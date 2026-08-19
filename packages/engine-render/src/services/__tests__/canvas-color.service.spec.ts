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

import { Injector, invertColorByMatrix, ThemeService } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import {
    CanvasColorService,
    DumbCanvasColorService,
    hexToRgb,
    ICanvasColorService,
    rgbToHex,
} from '../canvas-color.service';

describe('CanvasColorService', () => {
    it('keeps render colors unchanged in light mode', () => {
        const injector = new Injector();
        injector.add([ThemeService]);
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);

        expect(injector.get(ICanvasColorService).getRenderColor('#17212b')).toBe('#17212b');
    });

    it('resolves design tokens from the current theme in light mode', () => {
        const injector = new Injector();
        injector.add([ThemeService]);
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        const themeService = injector.get(ThemeService);
        const getColorFromTheme = vi.spyOn(themeService, 'getColorFromTheme');
        const isValidThemeColor = vi.spyOn(themeService, 'isValidThemeColor');
        const service = injector.get(ICanvasColorService);
        const theme = themeService.getCurrentTheme();

        getColorFromTheme.mockClear();
        isValidThemeColor.mockClear();

        themeService.setTheme({
            ...theme,
            gray: {
                ...theme.gray,
                0: '#07111f',
                50: '#0d1422',
            },
        });

        expect(service.getRenderColor('gray.0')).toBe('#07111f');
        expect(service.getRenderColor('gray.50')).toBe('#0d1422');
        expect(service.getRenderColor('white')).toBe('white');
        expect(service.getRenderColor('black')).toBe('black');
        expect(service.getRenderColor('rgba(37, 99, 235, 0.08)')).toBe('rgba(37, 99, 235, 0.08)');
        expect(getColorFromTheme).not.toHaveBeenCalled();
        expect(isValidThemeColor).not.toHaveBeenCalled();

        themeService.setTheme({
            ...theme,
            gray: {
                ...theme.gray,
                0: '#050914',
                50: '#101827',
            },
        });

        expect(service.getRenderColor('gray.0')).toBe('#050914');
        expect(service.getRenderColor('gray.50')).toBe('#101827');
        expect(getColorFromTheme).not.toHaveBeenCalled();
        expect(isValidThemeColor).not.toHaveBeenCalled();
    });

    it('applies dark rendering to resolved design tokens', () => {
        const injector = new Injector();
        injector.add([ThemeService]);
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        const themeService = injector.get(ThemeService);
        const service = injector.get(ICanvasColorService);
        const gray900 = themeService.getColorFromTheme('gray.900');

        themeService.setDarkMode(true);

        expect(service.getRenderColor('gray.900')).toBe(service.getRenderColor(gray900));
    });

    it('applies matrix inversion to current theme colors without fixed palette overrides', () => {
        const injector = new Injector();
        injector.add([ThemeService]);
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        const themeService = injector.get(ThemeService);
        const service = injector.get(ICanvasColorService);
        const theme = themeService.getCurrentTheme();

        themeService.setDarkMode(true);

        for (const color of ['#2563eb', '#0f766e']) {
            themeService.setTheme({
                ...theme,
                primary: {
                    ...theme.primary,
                    300: color,
                },
            });
            const expected = rgbToHex(invertColorByMatrix(hexToRgb(color)));

            expect(service.getRenderColor('primary.300')).toBe(expected);
            expect(service.getRenderColor(color)).toBe(expected);
        }
    });

    it('inverts supported color syntaxes in dark mode and caches the render result', () => {
        const injector = new Injector();
        injector.add([ThemeService]);
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        injector.get(ThemeService).setDarkMode(true);
        const service = injector.get(ICanvasColorService);

        const shortHex = service.getRenderColor('#abc');
        expect(shortHex).toMatch(/^#[0-9a-f]{6}$/);
        expect(service.getRenderColor('#abcd')).toMatch(/^#[0-9a-f]{8}$/);
        expect(service.getRenderColor('#abcdef99')).toMatch(/^#[0-9a-f]{8}$/);
        expect(service.getRenderColor('rgb(1, 2, 3)')).toMatch(/^rgb\(\d+,\d+,\d+\)$/);
        expect(service.getRenderColor('rgba(1, 2, 3, 0.5)')).toMatch(/^rgba\(\d+,\d+,\d+, 0.5\)$/);
        expect(service.getRenderColor('transparent')).toBe('transparent');
        expect(service.getRenderColor('transparent')).toBe('transparent');
        expect(service.getRenderColor('red')).toEqual(expect.anything());
        expect(service.getRenderColor('#abc')).toBe(shortHex);
    });

    it('converts colors used by renderers', () => {
        expect(hexToRgb('#abc')).toEqual([170, 187, 204]);
        expect(hexToRgb('#abcdef')).toEqual([171, 205, 239]);
        expect(rgbToHex([1.2, 15.5, 255])).toBe('#0110ff');
    });

    it('throws for colors that renderers cannot parse in dark mode', () => {
        const injector = new Injector();
        injector.add([ThemeService]);
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        injector.get(ThemeService).setDarkMode(true);

        expect(() => injector.get(ICanvasColorService).getRenderColor('not-a-color-token')).toThrow('[CanvasColorService]: illegal color');
    });

    it('provides a dumb color service for render contexts that should not transform colors', () => {
        const injector = new Injector();
        injector.add([ICanvasColorService, { useClass: DumbCanvasColorService }]);

        expect(injector.get(ICanvasColorService).getRenderColor('primary.600')).toBe('primary.600');
    });
});
