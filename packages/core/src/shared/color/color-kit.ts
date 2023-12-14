/**
 * Copyright 2023-present DreamNum Inc.
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

/* eslint-disable no-magic-numbers */
interface IRgbColor {
    b: number;

    g: number;

    r: number;

    a?: number;
}

interface IHslColor {
    h: number;

    l: number;

    s: number;

    a?: number;
}

interface IHsvColor {
    h: number;

    s: number;

    v: number;

    a?: number;
}

type Color = IRgbColor | IHslColor | IHsvColor;

export class ColorKit {
    private _color!: Color;

    private _rgbColor!: IRgbColor;

    private _isValid = false;

    static mix(color1: string | Color | ColorKit, color2: string | Color | ColorKit, amount: number) {
        amount = Math.min(1, Math.max(0, amount));

        const rgb1 = new ColorKit(color1).toRgb();

        const rgb2 = new ColorKit(color2).toRgb();

        const alpha1 = rgb1.a ?? 1;

        const alpha2 = rgb2.a ?? 1;

        const rgba: IRgbColor = {
            r: (rgb2.r - rgb1.r) * amount + rgb1.r,

            g: (rgb2.g - rgb1.g) * amount + rgb1.g,

            b: (rgb2.b - rgb1.b) * amount + rgb1.b,

            a: (alpha2 - alpha1) * amount + alpha1,
        };

        return new ColorKit(rgba);
    }

    static getContrastRatio(foreground: string | Color | ColorKit, background: string | Color | ColorKit) {
        const lumA = new ColorKit(foreground).getLuminance();

        const lumB = new ColorKit(background).getLuminance();

        return (Math.max(lumA, lumB) + 0.05) / (Math.min(lumA, lumB) + 0.05);
    }

    constructor(color: string | Color | ColorKit) {
        if (color == null) {
            this._setNullColor();
            return;
        }

        if (color instanceof ColorKit) {
            this._color = { ...color._color };

            this._rgbColor = { ...color._rgbColor };

            return;
        }

        const colorObject = toColor(color);

        if (colorObject == null) {
            this._setNullColor();
            return;
        }

        this._color = colorObject;

        const rgbColorObject = toRgbColor(this._color);

        if (rgbColorObject == null) {
            this._setNullColor();
            return;
        }

        this._rgbColor = rgbColorObject;

        this._isValid = true;
    }

    get isValid() {
        return this._isValid;
    }

    toRgb() {
        return this._rgbColor;
    }

    toRgbString() {
        const { r, g, b, a = 1 } = this.toRgb();

        const useAlpha = a < 1;

        return `rgb${useAlpha ? 'a' : ''}(${r},${g},${b}${useAlpha ? `,${a}` : ''})`;
    }

    toString() {
        return this.toRgbString();
    }

    toHexString(allowShort?: boolean) {
        const { r, g, b, a = 1 } = this.toRgb();

        const useAlpha = a < 1;

        const hex = [
            pad2(Math.round(r).toString(16)),

            pad2(Math.round(g).toString(16)),

            pad2(Math.round(b).toString(16)),

            pad2(Math.round(a * 255).toString(16)),
        ];

        if (allowShort) {
            if (
                hex[0][0] === hex[0][1] &&
                hex[1][0] === hex[1][1] &&
                hex[2][0] === hex[2][1] &&
                hex[3][0] === hex[3][1]
            ) {
                return useAlpha
                    ? `#${hex[0][0]}${hex[1][0]}${hex[2][0]}${hex[3][0]}`
                    : `#${hex[0][0]}${hex[1][0]}${hex[2][0]}`;
            }
        }

        return useAlpha ? `#${hex[0]}${hex[1]}${hex[2]}${hex[3]}` : `#${hex[0]}${hex[1]}${hex[2]}`;
    }

    toHsv() {
        return rgb2Hsv(this.toRgb());
    }

    toHsl() {
        return rgb2Hsl(this.toRgb());
    }

    lighten(amount = 10) {
        const hsl = this.toHsl();

        hsl.l += amount;

        hsl.l = Math.min(Math.max(hsl.l, 0), 100);

        return new ColorKit(hsl);
    }

    darken(amount = 10) {
        const hsl = this.toHsl();

        hsl.l -= amount;

        hsl.l = Math.min(Math.max(hsl.l, 0), 100);

        return new ColorKit(hsl);
    }

    setAlpha(value: number) {
        return new ColorKit({ ...this._rgbColor, a: value });
    }

    getLuminance() {
        let { r, g, b } = this.toRgb();

        r = rgbNormalize(r);

        g = rgbNormalize(g);

        b = rgbNormalize(b);

        // Truncate at 3 digits

        return Number((0.2126 * r + 0.7152 * g + 0.0722 * b).toFixed(3));
    }

    getBrightness() {
        const { r, g, b } = this.toRgb();

        return (r * 299 + g * 587 + b * 114) / 1000;
    }

    getAlpha() {
        return this._color.a ?? 1;
    }

    isDark() {
        return this.getBrightness() < 128;
    }

    isLight() {
        return !this.isDark();
    }

    private _setNullColor() {
        this._isValid = false;
        this._color = {
            r: 0,
            g: 0,
            b: 0,
            a: 0,
        };
        this._rgbColor = {
            r: 0,
            g: 0,
            b: 0,
            a: 0,
        };
    }
}

const pad2 = (v: string) => {
    return v.length === 1 ? `0${v}` : v;
};

const rgbNormalize = (val: number) => {
    val /= 255;

    return val <= 0.03928 ? val / 12.92 : ((val + 0.055) / 1.055) ** 2.4;
};

const toColor: (color: string | Color) => Color | undefined = (color) => {
    if (isObject(color)) {
        if ('r' in color) {
            const rgb: IRgbColor = {
                r: Math.round(color.r),

                g: Math.round(color.g),

                b: Math.round(color.b),
            };

            if (color.a !== undefined) {
                rgb.a = color.a;
            }

            return rgb;
        }

        if ('l' in color) {
            const hsl: IHslColor = {
                h: Math.round(color.h),

                s: color.s,

                l: color.l,
            };

            if (color.a !== undefined) {
                hsl.a = color.a;
            }

            return hsl;
        }

        const hsv: IHsvColor = {
            h: Math.round(color.h),

            s: color.s,

            v: color.v,
        };

        if (color.a !== undefined) {
            hsv.a = color.a;
        }

        return hsv;
    }

    const parsedColor = color.trim();

    if (parsedColor.startsWith('#')) {
        return hexToColor(parsedColor);
    }

    if (parsedColor.startsWith('rgb')) {
        return rgbToColor(parsedColor);
    }

    if (parsedColor.startsWith('hsl')) {
        return hslToColor(parsedColor);
    }

    if (parsedColor.startsWith('hsv')) {
        return hsvToColor(parsedColor);
    }
};

const hexToColor: (color: string) => Color = (color) => {
    const parsedColor = color.substring(1);

    const re = new RegExp(`.{1,${parsedColor.length >= 6 ? 2 : 1}}`, 'g');

    let colors: string[] | RegExpMatchArray | null = parsedColor.match(re);

    if (!colors || colors.length < 3) {
        throw new Error(`The color '${color}' is illegal hex color`);
    }

    if (colors[0].length === 1) {
        colors = colors.map((n) => n + n);
    }

    const rgbColor: IRgbColor = {
        r: parseInt(colors[0], 16),

        g: parseInt(colors[1], 16),

        b: parseInt(colors[2], 16),
    };

    if (colors.length > 3) {
        rgbColor.a = parseInt(colors[3], 16) / 255;
    }

    return rgbColor;
};

const rgbToColor: (color: string) => Color = (color) => {
    const matcher = color.indexOf('(');

    if (matcher === -1) {
        throw new Error(`The color '${color}' is illegal rgb color`);
    }

    const values = color.substring(matcher + 1, color.length - 1).split(',');

    if (values.length < 3) {
        throw new Error(`The color '${color}' is illegal rgb color`);
    }

    const rgbColor: IRgbColor = {
        r: parseInt(values[0], 10),

        g: parseInt(values[1], 10),

        b: parseInt(values[2], 10),
    };

    if (values.length > 3) {
        rgbColor.a = parseFloat(values[3]);
    }

    return rgbColor;
};

const hslToColor: (color: string) => Color = (color) => {
    const matcher = color.indexOf('(');

    if (matcher === -1) {
        throw new Error(`The color '${color}' is illegal hsl color`);
    }

    const values = color.substring(matcher + 1, color.length - 1).split(',');

    if (values.length < 3) {
        throw new Error(`The color '${color}' is illegal hsl color`);
    }

    const hslColor: IHslColor = {
        h: parseInt(values[0], 10),

        s: parseFloat(values[1]),

        l: parseFloat(values[2]),
    };

    if (values.length > 3) {
        hslColor.a = parseFloat(values[3]);
    }

    return hslColor;
};

const hsvToColor: (color: string) => Color = (color) => {
    const matcher = color.indexOf('(');

    if (matcher === -1) {
        throw new Error(`The color '${color}' is illegal hsv color`);
    }

    const values = color.substring(matcher + 1, color.length - 1).split(',');

    if (values.length < 3) {
        throw new Error(`The color '${color}' is illegal hsv color`);
    }

    const hsvColor: IHsvColor = {
        h: parseInt(values[0], 10),

        s: parseFloat(values[1]),

        v: parseFloat(values[2]),
    };

    if (values.length > 3) {
        hsvColor.a = parseFloat(values[3]);
    }

    return hsvColor;
};

const toRgbColor: (color: string | Color) => IRgbColor | undefined = (color) => {
    const obj = toColor(color);

    if (obj == null) {
        return;
    }

    if ('r' in obj) {
        return obj;
    }

    if ('l' in obj) {
        return hsl2Rgb(obj);
    }

    return hsv2Rgb(obj);
};

const hue2Rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;

    if (t > 1) t -= 1;

    if (t < 1 / 6) return p + (q - p) * 6 * t;

    if (t < 1 / 2) return q;

    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;

    return p;
};

const hsl2Rgb: (color: IHslColor) => IRgbColor = (color) => {
    let { h, s, l } = color;

    h /= 360;

    s /= 100;

    l /= 100;

    let r = 0;

    let g = 0;

    let b = 0;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;

        const p = 2 * l - q;

        r = hue2Rgb(p, q, h + 1 / 3);

        g = hue2Rgb(p, q, h);

        b = hue2Rgb(p, q, h - 1 / 3);
    }

    const IRgbColor: IRgbColor = {
        r: Math.round(r * 255),

        g: Math.round(g * 255),

        b: Math.round(b * 255),
    };

    if (color.a !== undefined) {
        IRgbColor.a = color.a;
    }

    return IRgbColor;
};

const hsv2Rgb: (color: IHsvColor) => IRgbColor = (color) => {
    let { h, s, v } = color;

    h = (h / 360) * 6;

    s /= 100;

    v /= 100;

    const i = Math.floor(h);

    const f = h - i;

    const p = v * (1 - s);

    const q = v * (1 - f * s);

    const t = v * (1 - (1 - f) * s);

    const mod = i % 6;

    const r = [v, q, p, p, t, v][mod];

    const g = [t, v, v, q, p, p][mod];

    const b = [p, p, t, v, v, q][mod];

    const IRgbColor: IRgbColor = {
        r: r * 255,

        g: g * 255,

        b: b * 255,
    };

    if (color.a !== undefined) {
        IRgbColor.a = color.a;
    }

    return IRgbColor;
};

const rgb2Hsl: (color: IRgbColor) => IHslColor = (color) => {
    let { r, g, b } = color;

    r /= 255;

    g /= 255;

    b /= 255;

    const max = Math.max(r, g, b);

    const min = Math.min(r, g, b);

    const l = (max + min) / 2;

    let h: number;

    let s: number;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;

        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);

                break;

            case g:
                h = (b - r) / d + 2;

                break;

            default:
                h = (r - g) / d + 4;

                break;
        }

        h /= 6;
    }

    const hslColor: IHslColor = {
        h: Math.round(h * 360),

        s: Math.round(s * 100),

        l: Math.round(l * 100),
    };

    if (color.a !== undefined) {
        hslColor.a = color.a;
    }

    return hslColor;
};

const rgb2Hsv: (color: IRgbColor) => IHsvColor = (color) => {
    let { r, g, b } = color;

    r /= 255;

    g /= 255;

    b /= 255;

    const max = Math.max(r, g, b);

    const min = Math.min(r, g, b);

    let h;

    const v = max;

    const d = max - min;

    const s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);

                break;

            case g:
                h = (b - r) / d + 2;

                break;

            default:
                h = (r - g) / d + 4;

                break;
        }

        h /= 6;
    }

    const hsvColor: IHsvColor = {
        h: Math.round(h * 360),

        s: Math.round(s * 100),

        v: Math.round(v * 100),
    };

    if (color.a !== undefined) {
        hsvColor.a = color.a;
    }

    return hsvColor;
};

const isUndefinedOrNull = (value: unknown): value is null | undefined => value == null;

const isObject = (value: unknown): value is object => !isUndefinedOrNull(value) && typeof value === 'object';
