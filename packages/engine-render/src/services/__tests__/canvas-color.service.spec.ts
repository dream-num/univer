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

import { ColorKit, Injector, ThemeService } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import {
    CanvasColorService,
    DumbCanvasColorService,
    getDarkRenderColorOverride,
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
        const service = injector.get(ICanvasColorService);
        const theme = themeService.getCurrentTheme();

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

    it('resolves and caches mixed theme colors without becoming stale after theme changes', () => {
        const injector = new Injector();
        injector.add([ThemeService]);
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        const themeService = injector.get(ThemeService);
        const service = injector.get(ICanvasColorService);
        const mixSpy = vi.spyOn(ColorKit, 'mix');
        const expression = 'mix(gray.200, gray.900, 0.07)';

        expect(service.getRenderColor(expression)).toBe('#d5d7dc');
        expect(service.getRenderColor(expression)).toBe('#d5d7dc');
        expect(mixSpy).toHaveBeenCalledTimes(1);

        themeService.setDarkMode(true);
        expect(service.getRenderColor(expression)).toBe(service.getRenderColor('#d5d7dc'));
        expect(mixSpy).toHaveBeenCalledTimes(1);

        themeService.setDarkMode(false);
        const theme = themeService.getCurrentTheme();
        themeService.setTheme({
            ...theme,
            gray: {
                ...theme.gray,
                200: '#ccddee',
                900: '#112233',
            },
        });

        expect(service.getRenderColor(expression)).toBe('#bfd0e1');
        expect(mixSpy).toHaveBeenCalledTimes(2);
        mixSpy.mockRestore();
    });

    it('resolves and caches alpha theme colors without becoming stale after theme changes', () => {
        const injector = new Injector();
        injector.add([ThemeService]);
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        const themeService = injector.get(ThemeService);
        const service = injector.get(ICanvasColorService);
        const alphaSpy = vi.spyOn(ColorKit.prototype, 'setAlpha');
        const expression = 'alpha(gray.50, 0.5)';

        expect(service.getRenderColor(expression)).toBe('rgba(249,250,251,0.5)');
        expect(service.getRenderColor(expression)).toBe('rgba(249,250,251,0.5)');
        expect(alphaSpy).toHaveBeenCalledTimes(1);

        themeService.setDarkMode(true);
        expect(service.getRenderColor(expression)).toBe(service.getRenderColor('rgba(249,250,251,0.5)'));
        expect(alphaSpy).toHaveBeenCalledTimes(1);

        themeService.setDarkMode(false);
        const theme = themeService.getCurrentTheme();
        themeService.setTheme({
            ...theme,
            gray: {
                ...theme.gray,
                50: '#101827',
            },
        });

        expect(service.getRenderColor(expression)).toBe('rgba(16,24,39,0.5)');
        expect(alphaSpy).toHaveBeenCalledTimes(2);
        alphaSpy.mockRestore();
    });

    it('resolves alpha CSS color names', () => {
        const injector = new Injector();
        injector.add([ThemeService]);
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        const service = injector.get(ICanvasColorService);

        expect(service.getRenderColor('alpha(white, 0.5)')).toBe('rgba(255,255,255,0.5)');
        expect(service.getRenderColor('alpha(white, 0.7)')).toBe('rgba(255,255,255,0.7)');
    });

    it('rejects invalid alpha color expressions', () => {
        const injector = new Injector();
        injector.add([ThemeService]);
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        const service = injector.get(ICanvasColorService);

        expect(() => service.getRenderColor('alpha(gray.50, 1.1)')).toThrow('[CanvasColorService]: illegal color');
        expect(() => service.getRenderColor('alpha(not-a-color, 0.5)')).toThrow('[CanvasColorService]: illegal color');
    });

    it('maps render colors for dark mode rendering', () => {
        const injector = new Injector();
        injector.add([ThemeService]);
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        injector.get(ThemeService).setDarkMode(true);

        expect(injector.get(ICanvasColorService).getRenderColor('#17212b')).toBe('#e2e8f0');
        expect(injector.get(ICanvasColorService).getRenderColor('rgba(37, 99, 235, 0.08)')).toBe('rgba(96,165,250,0.22)');
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

    it('reports dark overrides and color conversion helpers used by renderers', () => {
        expect(getDarkRenderColorOverride(' RGBA(37, 99, 235, 0.08) ')).toBe('rgba(96,165,250,0.22)');
        expect(getDarkRenderColorOverride('#ffffff')).toBeNull();
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
