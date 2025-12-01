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

import type { ICellData, IDataValidationRule, Nullable } from '@univerjs/core';
import type { IOtherFormulaResult } from '@univerjs/sheets-formula';
import { Disposable, Inject, Injector, isFormulaString, numfmt } from '@univerjs/core';
import { DataValidationModel } from '@univerjs/data-validation';
import { isLegalFormulaResult } from '../utils/formula';
import { getCellValueOrigin } from '../utils/get-cell-data-origin';
import { deserializeListOptions } from '../validators/util';
import { DataValidationFormulaService } from './dv-formula.service';

export interface IListCacheItem {
    list: string[];
    listWithColor: Array<{ label: string; color: string }>;
    colorMap: Record<string, string>;
    set: Set<string>;
}

type UnitId = string;
type SubUnitId = string;
type RuleId = string;

/**
 * Service for caching data validation list results.
 * Cache is invalidated when formula results change (through markRuleDirty).
 */
export class DataValidationListCacheService extends Disposable {
    // Cache structure: unitId -> subUnitId -> ruleId -> cache item
    private _cache: Map<UnitId, Map<SubUnitId, Map<RuleId, IListCacheItem>>> = new Map();

    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(DataValidationModel) private readonly _dataValidationModel: DataValidationModel
    ) {
        super();

        this._initRuleChangeListener();
    }

    private _initRuleChangeListener(): void {
        this.disposeWithMe(
            this._dataValidationModel.ruleChange$.subscribe((change) => {
                if (change.type === 'remove' || change.type === 'update') {
                    this.markRuleDirty(change.unitId, change.subUnitId, change.rule.uid);
                }
            })
        );
    }

    /**
     * Get cached list data or compute and cache it if not exists.
     */
    getOrCompute(
        unitId: string,
        subUnitId: string,
        rule: IDataValidationRule
    ): IListCacheItem {
        // Check cache first
        const cached = this.getCache(unitId, subUnitId, rule.uid);
        if (cached) {
            return cached;
        }

        const formulaService = this._injector.get(DataValidationFormulaService);
        // Compute and cache
        const results = formulaService.getRuleFormulaResultSync(unitId, subUnitId, rule.uid);
        return this.computeAndCache(unitId, subUnitId, rule, results);
    }

    private _ensureCache(unitId: string, subUnitId: string): Map<RuleId, IListCacheItem> {
        let unitMap = this._cache.get(unitId);
        if (!unitMap) {
            unitMap = new Map();
            this._cache.set(unitId, unitMap);
        }

        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            subUnitMap = new Map();
            unitMap.set(subUnitId, subUnitMap);
        }

        return subUnitMap;
    }

    /**
     * Get cached list data for a rule. Returns undefined if not cached.
     */
    getCache(unitId: string, subUnitId: string, ruleId: string): IListCacheItem | undefined {
        return this._cache.get(unitId)?.get(subUnitId)?.get(ruleId);
    }

    /**
     * Set cache for a rule.
     */
    setCache(unitId: string, subUnitId: string, ruleId: string, item: IListCacheItem): void {
        const cache = this._ensureCache(unitId, subUnitId);
        cache.set(ruleId, item);
    }

    /**
     * Mark a rule's cache as dirty (invalidate it).
     * Called when formula results change.
     */
    markRuleDirty(unitId: string, subUnitId: string, ruleId: string): void {
        this._cache.get(unitId)?.get(subUnitId)?.delete(ruleId);
    }

    /**
     * Clear all caches.
     */
    clear(): void {
        this._cache.clear();
    }

    /**
     * Compute list data from formula result and cache it.
     */
    computeAndCache(
        unitId: string,
        subUnitId: string,
        rule: IDataValidationRule,
        formulaResult: Nullable<Nullable<IOtherFormulaResult>[]>
    ): IListCacheItem {
        const { formula1 = '', formula2 = '' } = rule;

        // Compute list
        const list = isFormulaString(formula1)
            ? this._getRuleFormulaResultSet(formulaResult?.[0]?.result?.[0]?.[0])
            : deserializeListOptions(formula1);

        // Compute listWithColor and colorMap
        const colorList = formula2.split(',');
        const listWithColor = list.map((label, i) => ({ label, color: colorList[i] || '' }));
        const colorMap: Record<string, string> = {};
        for (const item of listWithColor) {
            if (item.color) {
                colorMap[item.label] = item.color;
            }
        }
        const set = new Set(list);
        const cacheItem: IListCacheItem = { list, listWithColor, colorMap, set };
        this.setCache(unitId, subUnitId, rule.uid, cacheItem);

        return cacheItem;
    }

    /**
     * Extract string list from formula result cells.
     */
    private _getRuleFormulaResultSet(result: Nullable<Nullable<ICellData>[][]>): string[] {
        if (!result) {
            return [];
        }

        const resultSet = new Set<string>();
        for (let i = 0, rowLen = result.length; i < rowLen; i++) {
            const row = result[i];
            if (!row) continue;
            for (let j = 0, colLen = row.length; j < colLen; j++) {
                const cell = row[j];
                const value = getCellValueOrigin(cell);
                if (value !== null && value !== undefined) {
                    // Handle number format
                    if (typeof value !== 'string' && typeof cell?.s === 'object' && cell.s?.n?.pattern) {
                        resultSet.add(numfmt.format(cell.s.n.pattern, value, { throws: false }));
                        continue;
                    }

                    const valueStr = typeof value === 'string' ? value : String(value);
                    if (isLegalFormulaResult(valueStr)) {
                        resultSet.add(valueStr);
                    }
                }
            }
        }

        return [...resultSet];
    }
}
