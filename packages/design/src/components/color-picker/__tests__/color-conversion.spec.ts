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
import { hexToHsv, hsvToHex, hsvToRgb, hsvToRgba, parseRgba, rgbToHex, rgbToHsv } from '../color-conversion';

describe('color-conversion', () => {
    it('should convert hsv to rgb across hue segments', () => {
        expect(hsvToRgb(0, 100, 100)).toEqual([255, 0, 0]);
        expect(hsvToRgb(60, 100, 100)).toEqual([255, 255, 0]);
        expect(hsvToRgb(120, 100, 100)).toEqual([0, 255, 0]);
        expect(hsvToRgb(180, 100, 100)).toEqual([0, 255, 255]);
        expect(hsvToRgb(240, 100, 100)).toEqual([0, 0, 255]);
        expect(hsvToRgb(300, 100, 100)).toEqual([255, 0, 255]);
    });

    it('should convert rgb and hsv values', () => {
        expect(rgbToHex(255, 0, 16)).toBe('#ff0010');
        expect(hsvToHex(0, 100, 100)).toBe('#ff0000');
        expect(hsvToRgba(0, 100, 100, 0.5)).toBe('rgba(255, 0, 0, 0.5)');

        const fromRed = rgbToHsv(255, 0, 0);
        const fromGreen = rgbToHsv(0, 255, 0);
        const fromBlue = rgbToHsv(0, 0, 255);
        const fromGray = rgbToHsv(128, 128, 128);

        expect(Math.round(fromRed[0])).toBe(0);
        expect(Math.round(fromGreen[0])).toBe(120);
        expect(Math.round(fromBlue[0])).toBe(240);
        expect(fromGray[1]).toBe(0);
    });

    it('should parse hex and rgba strings', () => {
        const shortHex = hexToHsv('#f00');
        const longHex = hexToHsv('#00ff00');
        expect(Math.round(shortHex[0])).toBe(0);
        expect(Math.round(longHex[0])).toBe(120);

        expect(parseRgba('rgba(255, 128, 0, 0.25)')).toEqual([255, 128, 0, 0.25]);
        expect(parseRgba('rgb(10, 20, 30)')).toEqual([10, 20, 30, 1]);
        expect(() => parseRgba('not-a-color')).toThrow('Invalid RGBA string');
    });
});
