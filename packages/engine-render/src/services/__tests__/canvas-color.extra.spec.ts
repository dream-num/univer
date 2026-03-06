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

import { describe, expect, it, vi } from 'vitest';
import { CanvasColorService, DumbCanvasColorService, hexToRgb, rgbToHex } from '../canvas-color.service';

describe('canvas color extra', () => {
    it('should parse and format rgb/hex values', () => {
        expect(hexToRgb('#abc')).toEqual([170, 187, 204]);
        expect(hexToRgb('#112233')).toEqual([17, 34, 51]);
        expect(hexToRgb('#abcd')).toEqual([170, 187, 204]);

        expect(rgbToHex([10.2, 255.4, 0.49] as any)).toBe('#0aff00');
    });

    it('DumbCanvasColorService should return color directly', () => {
        const service = new DumbCanvasColorService();
        expect(service.getRenderColor('rgb(1,2,3)')).toBe('rgb(1,2,3)');
    });

    it('should use theme token color in dark mode', () => {
        const service = new CanvasColorService({
            darkMode: true,
            isValidThemeColor: (color: string) => color === 'primary.500',
            getColorFromTheme: () => '#123456',
        } as any);

        expect(service.getRenderColor('primary.500')).toBe('#123456');
    });

    it('should cache inverted colors in dark mode', () => {
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
    });

    it('should support X11 color names and throw for illegal colors', () => {
        const service = new CanvasColorService({
            darkMode: true,
            isValidThemeColor: () => false,
            getColorFromTheme: () => '#000000',
        } as any);

        (service as any)._invertAlgo = () => [9, 8, 7];
        expect(service.getRenderColor('red')).toBe('rgba(9,8,7, 1)');

        expect(() => service.getRenderColor('not-a-color-token')).toThrow(/illegal color/);
    });
});
