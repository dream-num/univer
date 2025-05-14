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
import { beforeEach, describe, expect, it } from 'vitest';
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
});
