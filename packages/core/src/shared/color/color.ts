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

import type { Nullable } from '../types';
import { THEME_COLORS } from '../../types/const/theme-color-map';
import { ColorType, ThemeColors, ThemeColorType } from '../../types/enum';

/**
 * @deprecated
 */
export class ColorBuilder {
    private _themeValue: ThemeColorType = ThemeColorType.LIGHT1;

    private _themeColors: ThemeColors;

    private _themeTint: number;

    private _rgbValue: string = '';

    private _colorType: ColorType;

    constructor() {
        this._colorType = ColorType.UNSUPPORTED;
        this._themeColors = ThemeColors.OFFICE;
        this._themeTint = 0;
    }

    asRgbColor(): RgbColor {
        return new RgbColor(this._rgbValue, this);
    }

    asThemeColor(): ThemeColor {
        return new ThemeColor(this._themeValue, this._themeTint, this._themeColors, this);
    }

    build(): Nullable<Color> {
        switch (this._colorType) {
            case ColorType.THEME: {
                return this.asThemeColor();
            }
            case ColorType.RGB: {
                return this.asRgbColor();
            }
            case ColorType.UNSUPPORTED: {
                throw new Error('unsupported color type');
            }
        }
    }

    setRgbColor(cssString: string): ColorBuilder {
        this._colorType = ColorType.RGB;
        this._rgbValue = cssString;
        return this;
    }

    setThemeColors(value: ThemeColors) {
        this._colorType = ColorType.THEME;
        this._themeColors = value;
    }

    setThemeTint(value: number) {
        this._colorType = ColorType.THEME;
        this._themeTint = value;
    }

    setThemeColor(theme: ThemeColorType): ColorBuilder {
        this._colorType = ColorType.THEME;
        this._themeValue = theme;
        return this;
    }

    getColorType(): ColorType {
        return this._colorType;
    }
}

/**
 * @deprecated
 */
export class Color {
    protected _builder: ColorBuilder;

    constructor(builder: ColorBuilder) {
        this._builder = builder;
    }

    static rgbColorToHexValue(color: RgbColor): string {
        return `#${((1 << 24) + (color.getRed() << 16) + (color.getGreen() << 8) + color.getBlue())
            .toString(16)
            .slice(1)}`;
    }

    static hexValueToRgbColor(hexValue: string): RgbColor {
        if (hexValue) {
            if (hexValue.indexOf('#') > -1) {
                hexValue = hexValue.substring(1);
            }
        } else {
            hexValue = '#000000';
        }
        const r = +`0x${hexValue[0]}${hexValue[1]}`;
        const g = +`0x${hexValue[2]}${hexValue[3]}`;
        const b = +`0x${hexValue[4]}${hexValue[5]}`;
        return new ColorBuilder().setRgbColor(`rgb(${r},${g},${b})`).asRgbColor();
    }

    static hexToRgbString(hex: string): Nullable<string> {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        let string = null;
        if (result) {
            const r = Number.parseInt(result[1], 16);
            const g = Number.parseInt(result[2], 16);
            const b = Number.parseInt(result[3], 16);
            string = `rgba(${r},${g},${b})`;
        }
        return string;
    }

    asRgbColor(): RgbColor {
        return this._builder.asRgbColor();
    }

    asThemeColor(): ThemeColor {
        return this._builder.asThemeColor();
    }

    getColorType(): ColorType {
        return this._builder.getColorType();
    }

    clone(): Color {
        return new Color(this._builder);
    }

    equals(color: Color): boolean {
        return false;
    }
}

export class HLSColor {
    private _saturation: number = 0;

    private _hue: number = 0;

    private _lightness: number = 0;

    private _alpha: number = 0;

    constructor(rgbColor: RgbColor) {
        const red = rgbColor.getRed() / 255;
        const green = rgbColor.getGreen() / 255;
        const blue = rgbColor.getBlue() / 255;
        const alpha = rgbColor.getAlpha() / 255;

        const min = Math.min(red, Math.min(green, blue));
        const max = Math.max(red, Math.max(green, blue));
        const delta = max - min;

        if (max === min) {
            this._hue = 0;
            this._saturation = 0;
            this._lightness = max;
            return;
        }

        this._lightness = (min + max) / 2;

        if (this._lightness < 0.5) {
            this._saturation = delta / (max + min);
        } else {
            this._saturation = delta / (2.0 - max - min);
        }

        if (red === max) {
            this._hue = (green - blue) / delta;
        }

        if (green === max) {
            this._hue = 2.0 + (blue - red) / delta;
        }

        if (blue === max) {
            this._hue = 4.0 + (red - green) / delta;
        }

        this._hue *= 60;

        if (this._hue < 0) {
            this._hue += 360;
        }

        this._alpha = alpha;
    }

    asRgbColor(): RgbColor {
        const builder = new ColorBuilder();

        if (this._saturation === 0) {
            builder.setRgbColor(
                `rgba(${this._lightness * 255},${this._lightness * 255},${this._lightness * 255},${this._alpha * 255})`
            );
            return builder.asRgbColor();
        }

        let t1;
        if (this._lightness < 0.5) {
            t1 = this._lightness * (1.0 + this._saturation);
        } else {
            t1 = this._lightness + this._saturation - this._lightness * this._saturation;
        }

        const t2 = 2.0 * this._lightness - t1;
        const hue = this._hue / 360;

        const tR = hue + 1.0 / 3.0;
        const red = this.setColor(t1, t2, tR);
        const green = this.setColor(t1, t2, hue);
        const tB = hue - 1.0 / 3.0;
        const blue = this.setColor(t1, t2, tB);

        builder.setRgbColor(
            `rgba(${Math.round(red * 255)},${Math.round(green * 255)},${Math.round(blue * 255)},${this._alpha * 255})`
        );
        return builder.asRgbColor();
    }

    getLightness() {
        return this._lightness;
    }

    getHue() {
        return this._hue;
    }

    getSaturation() {
        return this._saturation;
    }

    getAlpha() {
        return this._alpha;
    }

    setColor(t1: number, t2: number, t3: number): number {
        if (t3 < 0) {
            t3 += 1.0;
        }

        if (t3 > 1) {
            t3 -= 1.0;
        }

        let color: number;

        if (6.0 * t3 < 1) {
            color = t2 + (t1 - t2) * 6.0 * t3;
        } else if (2.0 * t3 < 1) {
            color = t1;
        } else if (3.0 * t3 < 2) {
            color = t2 + (t1 - t2) * (2.0 / 3.0 - t3) * 6.0;
        } else {
            color = t2;
        }

        return color;
    }

    setLightness(lightness: number): void {
        this._lightness = lightness;
    }
}

export class RgbColor extends Color {
    static RGB_COLOR_AMT: number = 0;

    static RGBA_EXTRACT: RegExp = new RegExp(
        '\\s*rgba\\s*\\((\\s*\\d+\\s*),(\\s*\\d+\\s*),(\\s*\\d+\\s*),(\\s*\\d.\\d|\\d\\s*)\\)\\s*'
    );

    static RGB_EXTRACT: RegExp = new RegExp('\\s*rgb\\s*\\((\\s*\\d+\\s*),(\\s*\\d+\\s*),(\\s*\\d+\\s*)\\)\\s*');

    private _cssString: string;

    private _red: number;

    private _green: number;

    private _blue: number;

    private _alpha: number;

    constructor(cssString: string, builder: ColorBuilder) {
        super(builder);

        let match = cssString.match(RgbColor.RGBA_EXTRACT);

        if (match) {
            const red = +match[1];
            const green = +match[2];
            const blue = +match[3];
            const alpha = +match[4];

            this._cssString = cssString;
            this._red = red;
            this._green = green;
            this._blue = blue;
            this._alpha = alpha;
            return;
        }

        match = cssString.match(RgbColor.RGB_EXTRACT);

        if (match) {
            const red = +match[1];
            const green = +match[2];
            const blue = +match[3];

            this._cssString = cssString;
            this._red = red;
            this._green = green;
            this._blue = blue;
            this._alpha = 1;
            return;
        }

        throw new Error('Invalid rgba or rgb color');
    }

    asHexString(): string {
        return Color.rgbColorToHexValue(this);
    }

    getRed(): number {
        let r = this._red + RgbColor.RGB_COLOR_AMT;

        if (r > 255) {
            r = 255;
        } else if (r < 0) {
            r = 0;
        }

        return r;
    }

    getGreen(): number {
        let g = this._green + RgbColor.RGB_COLOR_AMT;

        if (g > 255) {
            g = 255;
        } else if (g < 0) {
            g = 0;
        }

        return g;
    }

    getBlue(): number {
        let b = this._blue + RgbColor.RGB_COLOR_AMT;

        if (b > 255) {
            b = 255;
        } else if (b < 0) {
            b = 0;
        }

        return b;
    }

    getAlpha(): number {
        return this._alpha;
    }

    override getColorType(): ColorType {
        return ColorType.RGB;
    }

    override clone(): RgbColor {
        return new RgbColor(this._cssString, this._builder);
    }

    override asThemeColor(): ThemeColor {
        throw new Error('rgb color not support to themeColor');
    }

    override equals(color: Color): boolean {
        if (color instanceof RgbColor) {
            return (
                color._red === this._red &&
                color._blue === this._blue &&
                color._green === this._green &&
                color._alpha === this._alpha
            );
        }
        return false;
    }

    getCssString() {
        return this._cssString;
    }
}

export class ThemeColor extends Color {
    private static _cacheThemeColor = new Map<ThemeColors, Map<ThemeColorType, RgbColor>>();

    private _themeColorType: ThemeColorType;

    private _themeTint: number;

    private _themeColors: ThemeColors;

    constructor(theme: ThemeColorType, themeTint: number, themeColors: ThemeColors, builder: ColorBuilder) {
        super(builder);
        this._themeColorType = theme;
        this._themeTint = themeTint;
        this._themeColors = themeColors;
    }

    lumValue(tint: number, lum: number) {
        if (tint == null) {
            return lum;
        }

        let value: number;

        if (tint < 0) {
            value = lum * (1.0 + tint);
        } else {
            value = lum * (1.0 - tint) + (255 - 255 * (1.0 - tint));
        }

        return value;
    }

    override asRgbColor(): RgbColor {
        const themeColors = THEME_COLORS[this._themeColors];
        if (themeColors == null) {
            throw new Error('not find themeColors type');
        }

        const hexValue = themeColors[this._themeColorType];
        if (hexValue == null) {
            throw new Error('not find themeColors value');
        }

        let themeCache;
        if (ThemeColor._cacheThemeColor.has(this._themeColors)) {
            themeCache = ThemeColor._cacheThemeColor.get(this._themeColors) as Map<ThemeColorType, RgbColor>;
            if (themeCache.has(this._themeColorType)) {
                return themeCache.get(this._themeColorType) as RgbColor;
            }
        } else {
            themeCache = new Map<ThemeColorType, RgbColor>();
            ThemeColor._cacheThemeColor.set(this._themeColors, themeCache);
        }

        const hlsColor = new HLSColor(Color.hexValueToRgbColor(hexValue));
        hlsColor.setLightness(this.lumValue(this._themeTint, hlsColor.getLightness() * 255) / 255);
        const rgbColor = hlsColor.asRgbColor();
        themeCache.set(this._themeColorType, rgbColor);

        return rgbColor;
    }

    override clone(): ThemeColor {
        return new ThemeColor(this._themeColorType, this._themeTint, this._themeColors, this._builder);
    }

    override equals(color: Color): boolean {
        if (color instanceof ThemeColor) {
            return color._themeColorType === this._themeColorType;
        }
        return false;
    }

    override getColorType(): ColorType {
        return ColorType.THEME;
    }

    getThemeColorType(): ThemeColorType {
        return this._themeColorType;
    }
}
