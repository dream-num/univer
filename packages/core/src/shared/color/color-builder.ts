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

import type { Nullable } from '../../common/type-utils';
import { ColorType, ThemeColors, ThemeColorType } from '../../types/enum';
import type { Color } from './color';
import { RgbColor, ThemeColor } from './color';

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
                throw Error('unsupported color type');
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
