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

import { describe, expect, it } from 'vitest';
import { ColorKit, isBlackColor, isWhiteColor } from '../color/color-kit';

describe('ColorKit', () => {
    it('should parse named, hex, rgb, hsl and hsv colors', () => {
        expect(new ColorKit('white').toRgb()).toEqual({ r: 255, g: 255, b: 255, a: 1 });
        expect(new ColorKit('#ffffff00').toRgb()).toEqual({ r: 255, g: 255, b: 255, a: 0 });
        expect(new ColorKit('rgb(1,2,3)').toRgb()).toEqual({ r: 1, g: 2, b: 3 });
        expect(new ColorKit('hsl(0,100,50)').toRgb()).toEqual({ r: 255, g: 0, b: 0 });
        expect(new ColorKit('hsv(240,100,100)').toRgb()).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should stringify colors and support short hex output when possible', () => {
        const color = new ColorKit({ r: 255, g: 255, b: 255, a: 0 });

        expect(color.toRgbString()).toBe('rgba(255,255,255,0)');
        expect(color.toString()).toBe('rgba(255,255,255,0)');
        expect(color.toHexString()).toBe('#ffffff00');
        expect(color.toHexString(true)).toBe('#fff0');
    });

    it('should adjust lightness and alpha and calculate brightness metrics', () => {
        const color = new ColorKit('#808080');

        expect(color.lighten(30).toHexString()).toBe('#cccccc');
        expect(color.darken(60).toHexString()).toBe('#000000');
        expect(color.setAlpha(0.25).toRgbString()).toBe('rgba(128,128,128,0.25)');
        expect(color.getAlpha()).toBe(1);
        expect(color.getBrightness()).toBe(128);
        expect(color.getLuminance()).toBeGreaterThan(0);
        expect(color.isDark()).toBe(false);
        expect(color.isLight()).toBe(true);
    });

    it('should mix colors, clamp amount and compute contrast ratio', () => {
        expect(ColorKit.mix('#000000', '#ffffff', -1).toHexString()).toBe('#000000');
        expect(ColorKit.mix('#000000', '#ffffff', 2).toHexString()).toBe('#ffffff');
        expect(ColorKit.mix('#000000', '#ffffff', 0.5).toHexString()).toBe('#808080');
        expect(ColorKit.getContrastRatio('#000000', '#ffffff')).toBe(21);
    });

    it('should mark invalid colors and throw on malformed known formats', () => {
        const invalid = new ColorKit('not-a-color');

        expect(invalid.isValid).toBe(false);
        expect(invalid.toRgb()).toEqual({ r: 0, g: 0, b: 0, a: 0 });
        expect(() => new ColorKit('#1')).toThrowError(/illegal hex color/);
        expect(() => new ColorKit('rgb(1,2)')).toThrowError(/illegal rgb color/);
    });

    it('should recognize black and white strings across formats', () => {
        expect(isBlackColor('#000')).toBe(true);
        expect(isBlackColor('rgba(0,0,0,0.5)')).toBe(true);
        expect(isBlackColor('hsl(0,0,0)')).toBe(true);
        expect(isBlackColor('rgb(1,0,0)')).toBe(false);

        expect(isWhiteColor('#fff')).toBe(true);
        expect(isWhiteColor('rgba(255,255,255,0.5)')).toBe(true);
        expect(isWhiteColor('hsl(0,0,100)')).toBe(true);
        expect(isWhiteColor('rgb(254,255,255)')).toBe(false);
    });
});
