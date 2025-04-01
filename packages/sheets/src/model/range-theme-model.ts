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

import type { ICellDataForSheetInterceptor, IRange, Nullable } from '@univerjs/core';
import type { IRangeThemeStyleItem, IRangeThemeStyleJSON } from './range-theme-util';
import { Disposable, generateRandomId, Inject, InterceptorEffectEnum, IResourceManagerService, RTree, UniverInstanceType } from '@univerjs/core';
import { Subject } from 'rxjs';
import { INTERCEPTOR_POINT, RangeThemeInterceptorId } from '../services/sheet-interceptor/interceptor-const';
import { SheetInterceptorService } from '../services/sheet-interceptor/sheet-interceptor.service';

import { RangeThemeStyle } from './range-theme-util';
import { buildInThemes } from './range-themes/build-in-theme.factory';
import { defaultRangeThemeStyle, defaultRangeThemeStyleJSONWithLastRowStyle } from './range-themes/default';

export interface IRangeThemeRangeInfo {
    range: IRange;
    unitId: string;
    subUnitId: string;
}

export interface IRangeThemeStyleRule {
    rangeInfo: IRangeThemeRangeInfo;
    themeName: string;
}

interface ISheetRangeThemeModelJSON {
    rangeThemeStyleRuleMap: Record<string, IRangeThemeStyleRule>;
    rangeThemeStyleMapJson: Record<string, IRangeThemeStyleJSON>;
}

const SHEET_RANGE_THEME_MODEL_PLUGIN = 'SHEET_RANGE_THEME_MODEL_PLUGIN';

export class SheetRangeThemeModel extends Disposable {
    private _rangeThemeStyleMap: Map<string, Map<string, RangeThemeStyle>> = new Map();
    private _rangeThemeStyleRuleMap: Map<string, Map<string, IRangeThemeStyleRule>> = new Map();
    private _rTreeCollection: Map<string, RTree> = new Map();
    private _defaultRangeThemeMap: Map<string, RangeThemeStyle> = new Map();

    private _rangeThemeMapChanged$ = new Subject<{ type: 'add' | 'remove'; styleName: string }>();
    public rangeThemeMapChange$ = this._rangeThemeMapChanged$.asObservable();

    constructor(
        @Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(IResourceManagerService) private _resourceManagerService: IResourceManagerService
    ) {
        super();
        this._registerIntercept();
        this._initSnapshot();
        this._initDefaultTheme();
    }

    private _initDefaultTheme() {
        this.registerDefaultRangeTheme(defaultRangeThemeStyle);
        this.registerDefaultRangeTheme(defaultRangeThemeStyleJSONWithLastRowStyle);
        for (const theme of buildInThemes) {
            this.registerDefaultRangeTheme(theme);
        }
    }

    private _ensureRangeThemeStyleMap(unitId: string) {
        if (!this._rangeThemeStyleMap.has(unitId)) {
            this._rangeThemeStyleMap.set(unitId, new Map());
        }
        return this._rangeThemeStyleMap.get(unitId)!;
    }

    private _ensureRangeThemeStyleRuleMap(unitId: string) {
        if (!this._rangeThemeStyleRuleMap.has(unitId)) {
            this._rangeThemeStyleRuleMap.set(unitId, new Map());
        }
        return this._rangeThemeStyleRuleMap.get(unitId)!;
    }

    private _ensureRTreeCollection(unitId: string) {
        if (!this._rTreeCollection.has(unitId)) {
            this._rTreeCollection.set(unitId, new RTree());
        }
        return this._rTreeCollection.get(unitId)!;
    }

    public getDefaultRangeThemeStyle(name: string): RangeThemeStyle {
        return this._defaultRangeThemeMap.get(name)!;
    }

    public getCustomRangeThemeStyle(unitId: string, name: string): RangeThemeStyle | undefined {
        return this._ensureRangeThemeStyleMap(unitId).get(name);
    }

    /**
     * Register range theme styles
     * @param {string} themeName
     * @param {IRangeThemeRangeInfo} rangeInfo
     */
    registerRangeThemeRule(themeName: string, rangeInfo: IRangeThemeRangeInfo): void {
        const { unitId, subUnitId, range } = rangeInfo;
        const id = generateRandomId();
        const ruleMap = this._ensureRangeThemeStyleRuleMap(unitId);
        const rTreeCollection = this._ensureRTreeCollection(unitId);
        ruleMap.set(id, { rangeInfo, themeName });
        rTreeCollection.insert({ unitId, sheetId: subUnitId, range, id });
    }

    getRegisteredRangeThemeStyle(rangeInfo: IRangeThemeRangeInfo): string | undefined {
        const { unitId, subUnitId, range } = rangeInfo;
        const rTreeCollection = this._ensureRTreeCollection(unitId);
        const themes = Array.from(rTreeCollection.bulkSearch([{ unitId, sheetId: subUnitId, range }]));
        if (themes[0]) {
            const themeRuleMap = this._ensureRangeThemeStyleRuleMap(unitId);
            const themeRule = themeRuleMap.get(themes[0] as string);
            if (themeRule) {
                return themeRule.themeName;
            }
        }
        return undefined;
    }

    removeRangeThemeRule(themeName: string, rangeInfo: IRangeThemeRangeInfo): void {
        const { unitId, subUnitId, range } = rangeInfo;
        const rTreeCollection = this._ensureRTreeCollection(unitId);
        const themes = Array.from(rTreeCollection.bulkSearch([{ unitId, sheetId: subUnitId, range }]));
        const themeRuleMap = this._ensureRangeThemeStyleRuleMap(unitId);
        for (let i = 0; i < themes.length; i++) {
            const themeRule = themeRuleMap.get(themes[i] as string);
            if (themeRule && themeRule.themeName === themeName) {
                themeRuleMap.delete(themes[i] as string);
                rTreeCollection.remove({ unitId, sheetId: subUnitId, range, id: themes[i] as string });
                break;
            }
        }
    }

    registerDefaultRangeTheme(rangeThemeStyle: RangeThemeStyle): void {
        this._defaultRangeThemeMap.set(rangeThemeStyle.getName(), rangeThemeStyle);
        this._rangeThemeMapChanged$.next({ type: 'add', styleName: rangeThemeStyle.getName() });
    }

    unRegisterDefaultRangeTheme(themeName: string): void {
        this._defaultRangeThemeMap.delete(themeName);
        this._rangeThemeMapChanged$.next({ type: 'remove', styleName: themeName });
    }

    getRegisteredRangeThemes(): string[] {
        return Array.from(this._defaultRangeThemeMap.keys());
    }

    /**
     * Register custom range theme style.
     * @param {string} unitId The unit id.
     * @param {RangeThemeStyle} rangeThemeStyle The range theme style.
     */
    registerRangeThemeStyle(unitId: string, rangeThemeStyle: RangeThemeStyle): void {
        this._ensureRangeThemeStyleMap(unitId).set(rangeThemeStyle.getName(), rangeThemeStyle);
        this._rangeThemeMapChanged$.next({ type: 'add', styleName: rangeThemeStyle.getName() });
    }

    /**
     *  Unregister custom range theme style.
     * @param {string} unitId The unit id.
     * @param {string} name The name of the range theme style.
     */
    unregisterRangeThemeStyle(unitId: string, name: string): void {
        this._ensureRangeThemeStyleMap(unitId).delete(name);
        this._rangeThemeMapChanged$.next({ type: 'remove', styleName: name });
    }

    /**
     * Gets all custom register themes
     * @param {string} unitId Which unit to register the range theme style.
     * @return {string[]} The array of all custom registered themes.
     */
    getALLRegisteredTheme(unitId: string): string[] {
        return Array.from(this._ensureRangeThemeStyleMap(unitId).keys());
    }

    getRangeThemeStyle(unitId: string, name: string): RangeThemeStyle {
        if (this._defaultRangeThemeMap.has(name)) {
            return this._defaultRangeThemeMap.get(name)!;
        }
        return this._ensureRangeThemeStyleMap(unitId).get(name)!;
    }

    public getCellStyle(unitId: string, subUnitId: string, row: number, col: number): Nullable<IRangeThemeStyleItem> {
        const range = { startRow: row, startColumn: col, endRow: row, endColumn: col };
        const rTreeCollection = this._ensureRTreeCollection(unitId);
        const themes = Array.from(rTreeCollection.bulkSearch([{ unitId, sheetId: subUnitId, range }]));
        if (themes[0]) {
            const themeRuleMap = this._ensureRangeThemeStyleRuleMap(unitId);
            const themeRule = themeRuleMap.get(themes[0] as string);
            if (themeRule) {
                const { rangeInfo, themeName } = themeRule;
                const offsetRow = row - rangeInfo.range.startRow;
                const offsetCol = col - rangeInfo.range.startColumn;
                const theme = this.getRangeThemeStyle(unitId, themeName);
                if (theme) {
                    return theme.getStyle(offsetRow, offsetCol, row === rangeInfo.range.endRow, col === rangeInfo.range.endColumn);
                }
            }
        }
        return undefined;
    }

    private _registerIntercept(): void {
        this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            id: RangeThemeInterceptorId,
            effect: InterceptorEffectEnum.Style,
            handler: (cell, context, next) => {
                const { row, col, unitId, subUnitId } = context;

                const style = this.getCellStyle(unitId, subUnitId, row, col);

                if (style) {
                    const newCell: ICellDataForSheetInterceptor = { ...cell };
                    newCell.themeStyle = style;
                    return next(newCell);
                }

                return next(cell);
            },
        }));
    }

    toJson(unitId: string) {
        // deserialize registered range theme style rule
        const ruleMap = this._ensureRangeThemeStyleRuleMap(unitId);
        // deserialize custom range theme style
        const rangeThemeStyleMap = this._ensureRangeThemeStyleMap(unitId);

        if (rangeThemeStyleMap.size === 0 && ruleMap.size === 0) {
            return '{}';
        }

        const rangeThemeStyleRuleMap: Record<string, IRangeThemeStyleRule> = {};
        ruleMap.forEach((value, key) => {
            rangeThemeStyleRuleMap[key] = value;
        });

        const rangeThemeStyleMapJson: Record<string, IRangeThemeStyleJSON> = {};
        rangeThemeStyleMap.forEach((value, key) => {
            rangeThemeStyleMapJson[key] = value.toJson();
        });

        return JSON.stringify({
            rangeThemeStyleRuleMap,
            rangeThemeStyleMapJson,
        });
    }

    fromJSON(unitId: string, json: ISheetRangeThemeModelJSON) {
        const { rangeThemeStyleRuleMap: rangeThemeStyleRuleMapJSON, rangeThemeStyleMapJson } = json;

        Object.keys(rangeThemeStyleRuleMapJSON).forEach((key) => {
            const ruleMap = rangeThemeStyleRuleMapJSON[key];
            const { themeName, rangeInfo } = ruleMap;
            // TODO Due to design issues, we will skip table-related theme registration.
            // Here the table needs to have its own rangeTheme to be independent
            if (!themeName.startsWith('table')) {
                this.registerRangeThemeRule(themeName, rangeInfo);
                const rTreeCollection = this._ensureRTreeCollection(rangeInfo.unitId);
                rTreeCollection.insert({ unitId: key, sheetId: rangeInfo.subUnitId, range: rangeInfo.range, id: key });
            }
        });

        if (rangeThemeStyleMapJson) {
            Object.keys(rangeThemeStyleMapJson).forEach((key) => {
                const styleMap = rangeThemeStyleMapJson[key];
                const style = new RangeThemeStyle(styleMap.name);
                style.fromJson(styleMap);
                this._ensureRangeThemeStyleMap(unitId).set(style.getName(), style);
            });
        }
    }

    deleteUnitId(unitId: string) {
        this._rangeThemeStyleMap.delete(unitId);
        this._rangeThemeStyleRuleMap.delete(unitId);
        this._rTreeCollection.delete(unitId);
    }

    private _initSnapshot(): void {
        this.disposeWithMe(this._resourceManagerService.registerPluginResource({
            toJson: (unitId: string) => {
                return this.toJson(unitId);
            },
            parseJson: (json: string) => {
                if (!json) {
                    return {};
                }
                try {
                    return JSON.parse(json);
                    // eslint-disable-next-line unused-imports/no-unused-vars
                } catch (error) {
                    return {};
                }
            },
            businesses: [UniverInstanceType.UNIVER_SHEET],
            pluginName: SHEET_RANGE_THEME_MODEL_PLUGIN,
            onLoad: (unitId, resources) => {
                this.fromJSON(unitId, resources);
            },
            onUnLoad: (unitId) => {
                this.deleteUnitId(unitId);
            },
        }));
    }

    override dispose(): void {
        super.dispose();
        this._rangeThemeStyleMap.clear();
        this._rangeThemeStyleRuleMap.clear();
        this._defaultRangeThemeMap.clear();
        this._rTreeCollection.clear();
    }
}
