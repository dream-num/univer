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

import type { ICellDataForSheetInterceptor, IRange, Nullable } from '@univerjs/core';
import type { IRangeThemeStyleItem, RangeThemeStyle } from './range-theme-util';
import { Disposable, generateRandomId, Inject, InterceptorEffectEnum, RTree } from '@univerjs/core';
import { INTERCEPTOR_POINT } from '../sheet-interceptor/interceptor-const';
import { SheetInterceptorService } from '../sheet-interceptor/sheet-interceptor.service';
import defaultRangeThemeStyle from './range-themes/default';

interface IRangeThemeRangeInfo {
    range: IRange;
    unitId: string;
    subUnitId: string;
}
interface IRangeThemeStyleRule {
    rangeInfo: IRangeThemeRangeInfo;
    themeName: string;
}
export class SheetRangeThemeService extends Disposable {
    private _rangeThemeStyleMap: Map<string, RangeThemeStyle> = new Map();
    private _rTreeCollection: RTree = new RTree();
    private _rangeThemeStyleRuleMap: Map<string, IRangeThemeStyleRule> = new Map();
    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService
    ) {
        super();
        this.registerRangeThemeStyle(defaultRangeThemeStyle);
        this._registerIntercept();
    }

    private _registerIntercept(): void {
        this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            effect: InterceptorEffectEnum.Style,
            handler: (cell, context, next) => {
                const { row, col, unitId, subUnitId } = context;
                const style = this.getCellStyle(unitId, subUnitId, row, col);
                if (style) {
                    const newCell: ICellDataForSheetInterceptor = { ...cell };
                    newCell.s = style;
                    return next(newCell);
                }
                return next(cell);
            },
        }));
    }

    registerRangeThemeStyle(rangeThemeStyle: RangeThemeStyle): void {
        this._rangeThemeStyleMap.set(rangeThemeStyle.getName(), rangeThemeStyle);
    }

    getALLRegisterThemeStyle(): string[] {
        return Array.from(this._rangeThemeStyleMap.keys());
    }

    /**
     * Register range theme styles
     * @param {string} themeName
     * @param {IRangeThemeRangeInfo} rangeInfo
     */
    registerRangeThemeStyles(themeName: string, rangeInfo: IRangeThemeRangeInfo): void {
        const { unitId, subUnitId, range } = rangeInfo;
        const id = generateRandomId();
        this._rangeThemeStyleRuleMap.set(id, { rangeInfo, themeName });
        this._rTreeCollection.insert({ unitId, sheetId: subUnitId, range, id });
    }

    getRangeThemeStyle(name: string): RangeThemeStyle {
        return this._rangeThemeStyleMap.get(name)!;
    }

    getCellStyle(unitId: string, subUnitId: string, row: number, col: number): Nullable<IRangeThemeStyleItem> {
        const range = { startRow: row, startColumn: col, endRow: row, endColumn: col };
        const themes = Array.from(this._rTreeCollection.bulkSearch([{ unitId, sheetId: subUnitId, range }]));
        if (themes[0]) {
            const themeRule = this._rangeThemeStyleRuleMap.get(themes[0] as string);
            if (themeRule) {
                const { rangeInfo, themeName } = themeRule;
                const offsetRow = row - rangeInfo.range.startRow;
                const offsetCol = col - rangeInfo.range.startColumn;
                const theme = this.getRangeThemeStyle(themeName);
                return theme.getStyle(offsetRow, offsetCol);
            }
        }
        return undefined;
    }

    override dispose(): void {
        this._rangeThemeStyleMap.clear();
        this._rTreeCollection.clear();
    }
}
