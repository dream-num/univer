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

    registerRangeTheme(unitId: string, rangeThemeStyle: RangeThemeStyle): void {
        this._sheetRangeThemeModel.registerRangeThemeStyle(unitId, rangeThemeStyle);
    }

    getALLRegisterThemes(): string[] {
        return this._sheetRangeThemeModel.getALLRegisteredTheme();
    }

    registerRangeThemeStyle(themeName: string, rangeInfo: IRangeThemeRangeInfo): void {
        this._sheetRangeThemeModel.registerRangeThemeRule(themeName, rangeInfo);
    }

    getRegisteredRangeThemeStyle(rangeInfo: IRangeThemeRangeInfo): string | undefined {
        return this._sheetRangeThemeModel.getRegisteredRangeThemeStyle(rangeInfo);
    }

    getRegisteredRangeThemes() {
        return this._sheetRangeThemeModel.getRegisteredRangeThemes();
    }
}
