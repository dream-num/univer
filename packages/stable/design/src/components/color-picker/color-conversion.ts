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

export const hsvToRgb = (h: number, s: number, v: number): [number, number, number] => {
    s = s / 100; // Normalize saturation to [0, 1]
    v = v / 100; // Normalize value to [0, 1]

    const c = v * s; // Chroma
    const x = c * (1 - Math.abs((h / 60) % 2 - 1)); // Intermediate value
    const m = v - c; // Match component to shift to [0, 1]

    let r = 0;
    let g = 0;
    let b = 0;

    if (h >= 0 && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (h >= 60 && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (h >= 180 && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (h >= 240 && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (h >= 300 && h < 360) {
        r = c;
        g = 0;
        b = x;
    }

    // Convert to [0, 255] range
    return [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255),
    ];
};

export const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const rgbToHsv = (r: number, g: number, b: number): [number, number, number] => {
    // Normalize RGB values to [0, 1]
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b); // Maximum value among r, g, b
    const min = Math.min(r, g, b); // Minimum value among r, g, b
    const d = max - min; // Chroma (difference between max and min)

    let h = 0; // Hue
    let s = 0; // Saturation
    const v = max; // Value is the maximum RGB component

    // Calculate saturation (s)
    if (max !== 0) {
        s = d / max;
    }

    // Calculate hue (h)
    if (d !== 0) {
        if (max === r) {
            h = ((g - b) / d + (g < b ? 6 : 0)); // Red is max
        } else if (max === g) {
            h = (b - r) / d + 2; // Green is max
        } else if (max === b) {
            h = (r - g) / d + 4; // Blue is max
        }
        h *= 60; // Convert to degrees
    }

    // Return HSV with hue in [0, 360], saturation and value in [0, 100]
    return [
        h,
        s * 100,
        v * 100,
    ];
};

export const hexToHsv = (hex: string): [number, number, number] => {
    const [r, g, b] = hex.match(/\w\w/g)!.map((x) => Number.parseInt(x, 16));
    return rgbToHsv(r, g, b);
};

export const hsvToHex = (h: number, s: number, v: number): string => {
    const [r, g, b] = hsvToRgb(h, s, v);
    return rgbToHex(r, g, b);
};

export const hsvToHsl = (h: number, s: number, v: number): [number, number, number] => {
    const l = (2 - s / 100) * v / 2;
    const sl = l && l < 50 ? s * v / (l * 2) : s + l;
    return [h, sl, l];
};

export const hslToHsv = (h: number, s: number, l: number): [number, number, number] => {
    // Convert S and L to decimal form
    s /= 100;
    l /= 100;

    // Calculate V and S for HSV
    const v = l + s * Math.min(l, 1 - l);
    const sv = v === 0 ? 0 : 2 * (1 - l / v);

    return [
        h, // Hue remains the same
        Math.round(sv * 100), // Convert S back to percentage
        Math.round(v * 100), // Convert V back to percentage
    ];
};

export const parseRgba = (rgba: string): [number, number, number, number] => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/);
    if (!match) throw new Error('Invalid RGBA string');
    return [
        Number.parseInt(match[1], 10),
        Number.parseInt(match[2], 10),
        Number.parseInt(match[3], 10),
        match[4] ? Number.parseFloat(match[4]) : 1,
    ];
};
