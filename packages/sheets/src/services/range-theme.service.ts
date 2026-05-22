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

import type { IRangeThemeRangeInfo } from '../model/range-theme-model';
import type { RangeThemeStyle } from '../model/range-theme-util';
import { Disposable, Inject } from '@univerjs/core';
import { SheetRangeThemeModel } from '../model/range-theme-model';

export class SheetRangeThemeService extends Disposable {
    constructor(
        @Inject(SheetRangeThemeModel) private _sheetRangeThemeModel: SheetRangeThemeModel
    ) {
        super();
    }

    /**
     * Register a custom range theme style.
     * @param {string} unitId Which unit to register the range theme style.
     * @param {RangeThemeStyle} rangeThemeStyle The range theme style to register.
     */
    registerRangeTheme(unitId: string, rangeThemeStyle: RangeThemeStyle): void {
        this._sheetRangeThemeModel.registerRangeThemeStyle(unitId, rangeThemeStyle);
    }

    removeRangeThemeRule(themeName: string, rangeInfo: IRangeThemeRangeInfo): void {
        this._sheetRangeThemeModel.removeRangeThemeRule(themeName, rangeInfo);
    }

    /**
     * Get custom register themes name list
     * @param {string} unitId Which unit to register the range theme style.
     * @returns {string[]} The list of custom register themes name.
     */
    getALLRegisterThemes(unitId: string): string[] {
        return this._sheetRangeThemeModel.getALLRegisteredTheme(unitId);
    }

    /**
     * Register range theme style to the range.
     * @param {string} themeName The defined theme name.
     * @param {IRangeThemeRangeInfo} rangeInfo The range info to apply the theme style.
     */
    registerRangeThemeStyle(themeName: string, rangeInfo: IRangeThemeRangeInfo): void {
        this._sheetRangeThemeModel.registerRangeThemeRule(themeName, rangeInfo);
    }

    /**
     * Get applied range theme style name.
     * @param {IRangeThemeRangeInfo} rangeInfo The range info to get the applied theme style.
     * @returns {string | undefined} The applied theme style name or not exist.
     */
    getAppliedRangeThemeStyle(rangeInfo: IRangeThemeRangeInfo): string | undefined {
        return this._sheetRangeThemeModel.getRegisteredRangeThemeStyle(rangeInfo);
    }

    /**
     * Get registered build-in range theme style
     */
    getRegisteredRangeThemes() {
        return this._sheetRangeThemeModel.getRegisteredRangeThemes();
    }
}
