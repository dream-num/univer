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

import { Injector, ThemeService } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
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
