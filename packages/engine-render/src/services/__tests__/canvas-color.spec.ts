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

import type { Injector } from '@univerjs/core';
import { ThemeService } from '@univerjs/core';
import { ICanvasColorService } from '@univerjs/engine-render';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CanvasColorService, DumbCanvasColorService, hexToRgb, rgbToHex } from '../canvas-color.service';
import { createCanvasColorTestBed } from './create-canvas-color-test-bed';

describe('Test Canvas Color', () => {
    let get: Injector['get'];
    let canvasColorService: ICanvasColorService;
    let themeService: ThemeService;

    beforeEach(() => {
        const testBed = createCanvasColorTestBed();
        get = testBed.get;
        canvasColorService = get(ICanvasColorService);
        themeService = get(ThemeService);
    });

    it('test hex color', async () => {
        const color = '#FF0000';
        themeService.setDarkMode(false);
        const invertedColor = canvasColorService.getRenderColor(color);
        expect(invertedColor).toEqual(color);
        themeService.setDarkMode(true);
        const invertedColor2 = canvasColorService.getRenderColor(color);
        expect(invertedColor2).toEqual('#ff5555');
    });

    it('test rgb color', async () => {
        const color = 'rgb(255, 0, 0)';
        themeService.setDarkMode(false);
        const invertedColor = canvasColorService.getRenderColor(color);
        expect(invertedColor).toEqual(color);
        themeService.setDarkMode(true);
        const invertedColor2 = canvasColorService.getRenderColor(color);
        expect(invertedColor2).toEqual('rgb(255,85,85)');
    });

    it('test rgba color', async () => {
        const color = 'rgba(255, 0, 0, 1)';
        themeService.setDarkMode(false);
        const invertedColor = canvasColorService.getRenderColor(color);
        expect(invertedColor).toEqual(color);
        themeService.setDarkMode(true);
        const invertedColor2 = canvasColorService.getRenderColor(color);
        expect(invertedColor2).toEqual('rgba(255,85,85, 1)');
    });

    it('test short hex color', async () => {
        const color = '#ccc';
        themeService.setDarkMode(false);
        const invertedColor = canvasColorService.getRenderColor(color);
        expect(invertedColor).toEqual(color);
        themeService.setDarkMode(true);
        const invertedColor2 = canvasColorService.getRenderColor(color);
        expect(invertedColor2).toEqual('#333333');
    });

    it('test hex color with alpha', async () => {
        const color = '#ccccccff';
        themeService.setDarkMode(false);
        const invertedColor = canvasColorService.getRenderColor(color);
        expect(invertedColor).toEqual(color);
        themeService.setDarkMode(true);
        const invertedColor2 = canvasColorService.getRenderColor(color);
        expect(invertedColor2).toEqual('#333333ff');
    });

    it('test short hex color with alpha', async () => {
        const color = '#cccf';
        themeService.setDarkMode(false);
        const invertedColor = canvasColorService.getRenderColor(color);
        expect(invertedColor).toEqual(color);
        themeService.setDarkMode(true);
        const invertedColor2 = canvasColorService.getRenderColor(color);
        expect(invertedColor2).toEqual('#333333ff');
    });

    it('test color parser and formatter', () => {
        expect(hexToRgb('#abc')).toEqual([170, 187, 204]);
        expect(hexToRgb('#112233')).toEqual([17, 34, 51]);
        expect(hexToRgb('#abcd')).toEqual([170, 187, 204]);
        expect(rgbToHex([10.2, 255.4, 0.49] as any)).toBe('#0aff00');
    });

    it('test dumb service', () => {
        const service = new DumbCanvasColorService();
        expect(service.getRenderColor('rgb(1,2,3)')).toBe('rgb(1,2,3)');
    });

    it('test theme token cache and illegal color branch', () => {
        const themed = new CanvasColorService({
            darkMode: true,
            isValidThemeColor: (color: string) => color === 'primary.500',
            getColorFromTheme: () => '#123456',
        } as any);
        expect(themed.getRenderColor('primary.500')).toBe('#123456');

        const service = new CanvasColorService({
            darkMode: true,
            isValidThemeColor: () => false,
            getColorFromTheme: () => '#000000',
        } as any);

        const invert = vi.fn(() => [1, 2, 3]);
        (service as any)._invertAlgo = invert;
        expect(service.getRenderColor('#ffffff')).toBe('#010203');
        expect(service.getRenderColor('#ffffff')).toBe('#010203');
        expect(invert).toHaveBeenCalledTimes(1);

        (service as any)._invertAlgo = () => [9, 8, 7];
        expect(service.getRenderColor('red')).toBe('rgba(9,8,7, 1)');
        expect(() => service.getRenderColor('not-a-color-token')).toThrow(/illegal color/);
    });
});
