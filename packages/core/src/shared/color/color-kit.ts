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

export interface IRgbColor {
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

export const RGB_PAREN = 'rgb(';
export const RGBA_PAREN = 'rgba(';
export const COLORS: { [key: string]: number[] } = {
    aliceBlue: [240, 248, 255],
    antiqueWhite: [250, 235, 215],
    aqua: [0, 255, 255],
    aquamarine: [127, 255, 212],
    azure: [240, 255, 255],
    beige: [245, 245, 220],
    bisque: [255, 228, 196],
    black: [0, 0, 0],
    blancheAlmond: [255, 235, 205],
    blue: [0, 0, 255],
    blueViolet: [138, 43, 226],
    brown: [165, 42, 42],
    burlyWood: [222, 184, 135],
    cadetBlue: [95, 158, 160],
    chartreuse: [127, 255, 0],
    chocolate: [210, 105, 30],
    coral: [255, 127, 80],
    cornFlowerBlue: [100, 149, 237],
    cornSilk: [255, 248, 220],
    crimson: [220, 20, 60],
    cyan: [0, 255, 255],
    darkblue: [0, 0, 139],
    darkCyan: [0, 139, 139],
    darkGoldenrod: [184, 132, 11],
    darkGray: [169, 169, 169],
    darkGreen: [0, 100, 0],
    darkGrey: [169, 169, 169],
    darkKhaki: [189, 183, 107],
    darkMagenta: [139, 0, 139],
    darkOliveGreen: [85, 107, 47],
    darkOrange: [255, 140, 0],
    darkOrchid: [153, 50, 204],
    darkRed: [139, 0, 0],
    darkSalmon: [233, 150, 122],
    darkSeaGreen: [143, 188, 143],
    darkSlateBlue: [72, 61, 139],
    darkSlateGray: [47, 79, 79],
    darkSlateGrey: [47, 79, 79],
    darkTurquoise: [0, 206, 209],
    darkViolet: [148, 0, 211],
    deepPink: [255, 20, 147],
    deepSkyBlue: [0, 191, 255],
    dimGray: [105, 105, 105],
    dimGrey: [105, 105, 105],
    dodgerBlue: [30, 144, 255],
    firebrick: [178, 34, 34],
    floralWhite: [255, 255, 240],
    forestGreen: [34, 139, 34],
    fuchsia: [255, 0, 255],
    gainsboro: [220, 220, 220],
    ghostWhite: [248, 248, 255],
    gold: [255, 215, 0],
    goldenrod: [218, 165, 32],
    gray: [128, 128, 128],
    green: [0, 128, 0],
    greenYellow: [173, 255, 47],
    grey: [128, 128, 128],
    honeydew: [240, 255, 240],
    hotPink: [255, 105, 180],
    indianRed: [205, 92, 92],
    indigo: [75, 0, 130],
    ivory: [255, 255, 240],
    khaki: [240, 230, 140],
    lavender: [230, 230, 250],
    lavenderBlush: [255, 240, 245],
    lawnGreen: [124, 252, 0],
    lemonChiffon: [255, 250, 205],
    lightblue: [173, 216, 230],
    lightCoral: [240, 128, 128],
    lightCyan: [224, 255, 255],
    lightGoldenrodYellow: [250, 250, 210],
    lightGray: [211, 211, 211],
    lightGreen: [144, 238, 144],
    lightGrey: [211, 211, 211],
    lightPink: [255, 182, 193],
    lightSalmon: [255, 160, 122],
    lightSeaGreen: [32, 178, 170],
    lightSkyBlue: [135, 206, 250],
    lightSlateGray: [119, 136, 153],
    lightSlateGrey: [119, 136, 153],
    lightSteelBlue: [176, 196, 222],
    lightYellow: [255, 255, 224],
    lime: [0, 255, 0],
    limeGreen: [50, 205, 50],
    linen: [250, 240, 230],
    magenta: [255, 0, 255],
    maroon: [128, 0, 0],
    mediumAquamarine: [102, 205, 170],
    mediumBlue: [0, 0, 205],
    mediumOrchid: [186, 85, 211],
    mediumPurple: [147, 112, 219],
    mediumSeaGreen: [60, 179, 113],
    mediumSlateBlue: [123, 104, 238],
    mediumSpringGreen: [0, 250, 154],
    mediumTurquoise: [72, 209, 204],
    mediumVioletRed: [199, 21, 133],
    midBightBlue: [25, 25, 112],
    mintCream: [245, 255, 250],
    mistyRose: [255, 228, 225],
    moccasin: [255, 228, 181],
    navajoWhite: [255, 222, 173],
    navy: [0, 0, 128],
    oldLace: [253, 245, 230],
    olive: [128, 128, 0],
    oliveDrab: [107, 142, 35],
    orange: [255, 165, 0],
    orangeRed: [255, 69, 0],
    orchid: [218, 112, 214],
    paleGoldenrod: [238, 232, 170],
    paleGreen: [152, 251, 152],
    paleTurquoise: [175, 238, 238],
    paleVioletRed: [219, 112, 147],
    papayaWhip: [255, 239, 213],
    peachPuff: [255, 218, 185],
    peru: [205, 133, 63],
    pink: [255, 192, 203],
    plum: [221, 160, 203],
    powderBlue: [176, 224, 230],
    purple: [128, 0, 128],
    rebeccaPurple: [102, 51, 153],
    red: [255, 0, 0],
    rosyBrown: [188, 143, 143],
    royalBlue: [65, 105, 225],
    saddleBrown: [139, 69, 19],
    salmon: [250, 128, 114],
    sandyBrown: [244, 164, 96],
    seaGreen: [46, 139, 87],
    seashell: [255, 245, 238],
    sienna: [160, 82, 45],
    silver: [192, 192, 192],
    skyBlue: [135, 206, 235],
    slateBlue: [106, 90, 205],
    slateGray: [119, 128, 144],
    slateGrey: [119, 128, 144],
    snow: [255, 255, 250],
    springGreen: [0, 255, 127],
    steelBlue: [70, 130, 180],
    tan: [210, 180, 140],
    teal: [0, 128, 128],
    thistle: [216, 191, 216],
    transparent: [255, 255, 255, 0],
    tomato: [255, 99, 71],
    turquoise: [64, 224, 208],
    violet: [238, 130, 238],
    wheat: [245, 222, 179],
    white: [255, 255, 255],
    whiteSmoke: [245, 245, 245],
    yellow: [255, 255, 0],
    yellowGreen: [154, 205, 5],
};

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

    constructor(color: string | Color | ColorKit | undefined) {
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

// eslint-disable-next-line max-lines-per-function
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

    if (COLORS[parsedColor]) {
        const colorArray = COLORS[parsedColor];
        const rgb: IRgbColor = {
            r: Math.round(colorArray[0]),

            g: Math.round(colorArray[1]),

            b: Math.round(colorArray[2]),
        };

        rgb.a = colorArray[3] || 1;

        return rgb;
    }

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
        r: Number.parseInt(colors[0], 16),

        g: Number.parseInt(colors[1], 16),

        b: Number.parseInt(colors[2], 16),
    };

    if (colors.length > 3) {
        rgbColor.a = Number.parseInt(colors[3], 16) / 255;
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
        r: Number.parseInt(values[0], 10),

        g: Number.parseInt(values[1], 10),

        b: Number.parseInt(values[2], 10),
    };

    if (values.length > 3) {
        rgbColor.a = Number.parseFloat(values[3]);
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
        h: Number.parseInt(values[0], 10),

        s: Number.parseFloat(values[1]),

        l: Number.parseFloat(values[2]),
    };

    if (values.length > 3) {
        hslColor.a = Number.parseFloat(values[3]);
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
        h: Number.parseInt(values[0], 10),

        s: Number.parseFloat(values[1]),

        v: Number.parseFloat(values[2]),
    };

    if (values.length > 3) {
        hsvColor.a = Number.parseFloat(values[3]);
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

export function isBlackColor(color: string): boolean {
    // Regular expressions match different color formats.
    const hexRegex = /^#(?:[0]{3}|[0]{6})\b/;
    const rgbRegex = /^rgb\s*\(\s*0+\s*,\s*0+\s*,\s*0+\s*\)$/;
    const rgbaRegex = /^rgba\s*\(\s*0+\s*,\s*0+\s*,\s*0+\s*,\s*(1|1\.0*|0?\.\d+)\)$/;
    const hslRegex = /^hsl\s*\(\s*0*\s*,\s*0%*\s*,\s*0%*\s*\)$/;
    const hslaRegex = /^hsla\s*\(\s*0*\s*,\s*0%*\s*,\s*0%*\s*,\s*(1|1\.0*|0?\.\d+)\)$/;

    if (hexRegex.test(color)) {
        return true;
    }
    if (rgbRegex.test(color)) {
        return true;
    }

    if (rgbaRegex.test(color)) {
        return true;
    }

    if (hslRegex.test(color)) {
        return true;
    }

    if (hslaRegex.test(color)) {
        return true;
    }

    return false;
}

export function isWhiteColor(color: string): boolean {
    // Regular expressions match different color formats.
    const hexRegex = /^#(?:[Ff]{3}|[Ff]{6})\b/;
    const rgbRegex = /^rgb\s*\(\s*255\s*,\s*255\s*,\s*255\s*\)$/;
    const rgbaRegex = /^rgba\s*\(\s*255\s*,\s*255\s*,\s*255\s*,\s*(1|1\.0*|0?\.\d+)\)$/;
    const hslRegex = /^hsl\s*\(\s*0*\s*,\s*0%*\s*,\s*100%*\s*\)$/;
    const hslaRegex = /^hsla\s*\(\s*0*\s*,\s*0%*\s*,\s*100%*\s*,\s*(1|1\.0*|0?\.\d+)\)$/;

    if (hexRegex.test(color)) {
        return true;
    }

    if (rgbRegex.test(color)) {
        return true;
    }

    if (rgbaRegex.test(color)) {
        return true;
    }

    if (hslRegex.test(color)) {
        return true;
    }

    if (hslaRegex.test(color)) {
        return true;
    }

    return false;
}
