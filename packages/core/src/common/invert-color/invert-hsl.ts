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

import type { RGBColorType } from './utils';
import { denormalizeRGBColor, normalizeRGBColor } from './utils';

function rgbToHsl([r, g, b]: RGBColorType): RGBColorType {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    let h = 0;
    let s = 0;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return [h, s, l];
}

function getLuminance(r: number, g: number, b: number) {
    const a = [r, g, b].map((v) => {
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function getContrastRatio(luminance1: number, luminance2: number) {
    return (
        (Math.max(luminance1, luminance2) + 0.05) /
        (Math.min(luminance1, luminance2) + 0.05)
    );
}

function hslToRgb(h: number, s: number, l: number): RGBColorType {
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p: number, q: number, _t: number) => {
            let t = _t;
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r, g, b];
}

export function stringToRgb(color: string): RGBColorType {
    return color.split(',').slice(0, 3).map(Number) as RGBColorType;
}

const white = { r: 1, g: 1, b: 1 };
const black = { r: 0, g: 0, b: 0 };

const whiteLuminance = getLuminance(white.r, white.g, white.b);
const blackLuminance = getLuminance(black.r, black.g, black.b);

/**
 * Invert a color by HSL tunning method.
 * @param color The color to invert. Note that this color is already normalized.
 * @returns The inverted color.
 */
function invertNormalizedColorByHSL(color: RGBColorType): RGBColorType {
    const originalLuminance = getLuminance(color[0], color[1], color[2]);
    const originalContrast = getContrastRatio(
        whiteLuminance,
        originalLuminance
    );

    const hsl = rgbToHsl(color);
    let l = 1 - hsl[2]; // Invert the lightness
    let newColor, newLuminance, newContrast;
    do {
        newColor = hslToRgb(hsl[0], hsl[1], l);
        newLuminance = getLuminance(newColor[0], newColor[1], newColor[2]);
        newContrast = getContrastRatio(newLuminance, blackLuminance);
        l += 0.01;
    } while (l <= 1 && l >= 0 && Math.abs(newContrast - originalContrast) < 0.01);

    return newColor;
}

export function invertColorByHSL(color: RGBColorType): RGBColorType {
    return denormalizeRGBColor(invertNormalizedColorByHSL(normalizeRGBColor(color)));
}
