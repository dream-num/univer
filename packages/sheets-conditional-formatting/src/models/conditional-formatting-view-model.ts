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

import type { Workbook } from '@univerjs/core';
import type { BaseCalculateUnit, IContext } from './calculate-unit-v2/base-calculate-unit';
import type { IConditionFormattingRule } from './type';
import { Disposable, Inject, Injector, IUniverInstanceService, LRUMap, RTree } from '@univerjs/core';
import { Subject } from 'rxjs';
import { bufferTime, filter, map } from 'rxjs/operators';
import { CFRuleType, CFSubRuleType } from '../base/const';
import { ConditionalFormattingFormulaService } from '../services/conditional-formatting-formula.service';
import { ColorScaleCalculateUnit } from './calculate-unit-v2/color-scale-calculate-unit';
import { DataBarCalculateUnit } from './calculate-unit-v2/data-bar-calculate-unit';
import { HighlightCellCalculateUnit } from './calculate-unit-v2/highlight-cell-calculate-unit';
import { IconSetCalculateUnit } from './calculate-unit-v2/icon-set-calculate-unit';
import { ConditionalFormattingRuleModel } from './conditional-formatting-rule-model';

// The default is a 50-row,20-column viewable area.
export const CONDITIONAL_FORMATTING_VIEWPORT_CACHE_LENGTH = 50 * 20 * 3 * 3;
export class ConditionalFormattingViewModel extends Disposable {
    //  Map<unitID ,<sheetId ,ObjectMatrix>>
    private _calculateUnitManagers: Map<string, Map<string, Map<string, BaseCalculateUnit>>> = new Map();
    private _rTreeManager: RTree = new RTree();

    /**
     * 1nd-level cache
     */
    private _cellCache = new LRUMap<string, { cfId: string; result: any; priority: number }[]>(CONDITIONAL_FORMATTING_VIEWPORT_CACHE_LENGTH);

    private _markDirty$ = new Subject<{ cfId: string; unitId: string; subUnitId: string; isImmediately?: boolean }>();
    /**
     * The rendering layer listens to this variable to determine whether a reRender is necessary.
     * @memberof ConditionalFormattingViewModel
     */
    public markDirty$ = this._markDirty$.asObservable();
    constructor(
        @Inject(Injector) private _injector: Injector,
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel,
        @Inject(ConditionalFormattingFormulaService) private _conditionalFormattingFormulaService: ConditionalFormattingFormulaService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._initRuleListener();
        this._handleCustomFormulasSeparately();
        this._initCFFormulaListener();
    }

    private _initCFFormulaListener() {
        // If a conditional format depends on multiple formula results,removing the 2nd level cache when a single result is returned can cause screen flickering.
        // It is necessary to wait until all results are ready before removing the cache.
        this.disposeWithMe(
            this._conditionalFormattingFormulaService.result$.subscribe(({ unitId, subUnitId, cfId, isAllFinished }) => {
                if (isAllFinished) {
                    this._markRuleDirtyAtOnce(unitId, subUnitId, cfId, isAllFinished);
                }
            })
        );
    }

    public getCellCfs(unitId: string, subUnitId: string, row: number, col: number) {
        const key = this._createCacheKey(unitId, subUnitId, row, col);
        if (this._cellCache.has(key)) {
            return this._cellCache.get(key);
        }
        const result = this._getCellCfs(unitId, subUnitId, row, col);
        if (result.length) {
            this._cellCache.set(key, result);
        }
        return result;
    }

    private _getCellCfs(unitId: string, subUnitId: string, row: number, col: number) {
        const subunitRules = this._conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId) ?? [];
        const _calculateUnitManagers = this._ensureCalculateUnitManager(unitId, subUnitId);
        const list = this._rTreeManager.bulkSearch([{ unitId, sheetId: subUnitId, range: { startColumn: col, endColumn: col, startRow: row, endRow: row } }]);
        const rules = subunitRules.filter((rule) => list.has(rule.cfId));
        if (!rules.length) {
            return [];
        }
        const result = rules.map((rule) => {
            const calculateUnit = _calculateUnitManagers.get(rule.cfId);
            if (!calculateUnit) {
                return null;
            }
            return {
                cfId: rule.cfId,
                result: calculateUnit.getCell(row, col),
            };
        }).filter((e) => !!e).map((e, index) => ({ ...e, priority: index }));
        return result;
    }

    /**
     `isNeedResetPreComputingCache` indicates whether it is necessary to remove the 2nd-level cache for each rule individually.
     Generally, when the logic of a rule calculation is modified, the cache for that rule needs to be removed.
     Changes in style/priority do not require the clearing of the 2nd-level cache.
     Rule changes/region changes require the removal of the 2nd-level cache.
     There is also a situation where preComputing is asynchronously calculated.
     After the calculation is finished, it is only for marking as dirty, and the 2nd-level cache need to be cleared.
     * @param {boolean} [isNeedResetPreComputingCache]
     */
    private _markRuleDirtyAtOnce = (unitId: string, subUnitId: string, cfId: string, isNeedResetPreComputingCache: boolean = true) => {
        this._cellCache.clear();
        if (isNeedResetPreComputingCache) {
            const _calculateUnitManagers = this._ensureCalculateUnitManager(unitId, subUnitId);
            const calculateUnit = _calculateUnitManagers.get(cfId);
            if (calculateUnit) {
                calculateUnit.resetPreComputingCache();
            }
        }

        this._markDirty$.next({
            unitId,
            subUnitId,
            cfId,
        });
    };

    /**
     * For the same condition format being marked dirty multiple times at the same time,
     * it will cause the style cache to be cleared, thereby causing the screen to flicker.
     * Here,multiple dirties are merged into one..
     */
    public markRuleDirty = (() => {
        const rxItem = new Subject<{ unitId: string; subUnitId: string; cfId: string; isNeedResetPreComputingCache: boolean }>();
        this.disposeWithMe(rxItem.pipe(bufferTime(100), filter((e) => !!e.length), map((list) => {
            const set = new Set();
            const result: typeof list = [];
            list.forEach((item) => {
                const kye = `${item.unitId}_${item.subUnitId}_${item.cfId}`;
                if (set.has(kye)) {
                    if (item.isNeedResetPreComputingCache) {
                        const i = result.find((e) => e.cfId === item.cfId)!;
                        i.isNeedResetPreComputingCache = true;
                    }
                    return;
                }
                set.add(kye);
                result.push({ ...item });
            });
            return result;
        })).subscribe((list) => {
            list.forEach((item) => {
                this._markRuleDirtyAtOnce(item.unitId, item.subUnitId, item.cfId, item.isNeedResetPreComputingCache);
            });
        }));
        return (unitId: string, subUnitId: string, cfId: string, isNeedResetPreComputingCache: boolean = true) => {
            rxItem.next({ unitId, subUnitId, cfId, isNeedResetPreComputingCache });
        };
    })();

    private _handleCustomFormulasSeparately() {
        this.disposeWithMe(
            this._conditionalFormattingRuleModel.$ruleChange.subscribe((e) => {
                if (e.type === 'set') {
                    const { unitId, subUnitId } = e;
                    const oldRule = e.oldRule!;
                    // If the range of a custom formula is modified,then the cached formulas must be cleared and recalculated.
                    if (oldRule.rule.type === CFRuleType.highlightCell && oldRule.rule.subType === CFSubRuleType.formula) {
                        this._conditionalFormattingFormulaService.deleteCache(unitId, subUnitId, oldRule.cfId);
                    }
                }
            })
        );
    }

    private _initRuleListener() {
        this.disposeWithMe(
            this._conditionalFormattingRuleModel.$ruleChange.subscribe((e) => {
                const { unitId, subUnitId, rule } = e;
                const { cfId, ranges } = rule;
                const calculateUnitManager = this._ensureCalculateUnitManager(unitId, subUnitId);
                this.markRuleDirty(unitId, subUnitId, cfId);
                switch (e.type) {
                    case 'add': {
                        this._rTreeManager.bulkInsert(ranges.map((r) => ({ unitId, sheetId: subUnitId, id: cfId, range: r })));
                        const instance = this._createRuleCalculateUnitInstance(unitId, subUnitId, rule);
                        if (!instance) {
                            return;
                        }
                        calculateUnitManager.set(rule.cfId, instance);
                        break;
                    }
                    case 'delete': {
                        this._rTreeManager.bulkRemove(ranges.map((r) => ({ unitId, sheetId: subUnitId, id: cfId, range: r })));
                        calculateUnitManager.delete(rule.cfId);
                        break;
                    }
                    case 'set': {
                        const oldRule = e.oldRule!;

                        this._rTreeManager.bulkRemove(oldRule.ranges.map((r) => ({ unitId, sheetId: subUnitId, id: oldRule.cfId, range: r })));
                        this._rTreeManager.bulkInsert(ranges.map((r) => ({ unitId, sheetId: subUnitId, id: cfId, range: r })));
                        if (oldRule.rule.type !== rule.rule.type) {
                            const instance = this._createRuleCalculateUnitInstance(unitId, subUnitId, rule);
                            if (!instance) {
                                return;
                            }
                            calculateUnitManager.delete(oldRule.cfId);
                            calculateUnitManager.set(rule.cfId, instance);
                        } else {
                            const instance = calculateUnitManager.get(oldRule.cfId);
                            if (!instance) {
                                return;
                            }
                            instance.updateRule(rule);
                        }
                    }
                }
            })
        );
    }

    private _ensureCalculateUnitManager(unitId: string, subUnitId: string) {
        let unitMap = this._calculateUnitManagers.get(unitId);
        if (!unitMap) {
            unitMap = new Map();
            this._calculateUnitManagers.set(unitId, unitMap);
        }
        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            subUnitMap = new Map();
            unitMap.set(subUnitId, subUnitMap);
        }
        return subUnitMap;
    }

    private _createRuleCalculateUnitInstance(unitId: string, subUnitId: string, rule: IConditionFormattingRule) {
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId);
        const worksheet = workbook?.getSheetBySheetId(subUnitId);
        if (!workbook || !worksheet) {
            return;
        }
        const context: IContext = {
            workbook,
            worksheet,
            unitId,
            subUnitId,
            accessor: this._injector,
            rule,
            limit: CONDITIONAL_FORMATTING_VIEWPORT_CACHE_LENGTH,
            getCellValue: (row: number, col: number) => worksheet.getCellRaw(row, col) || {},
        };
        switch (rule.rule.type) {
            case CFRuleType.colorScale: {
                return new ColorScaleCalculateUnit(context);
            }
            case CFRuleType.dataBar: {
                return new DataBarCalculateUnit(context);
            }
            case CFRuleType.highlightCell: {
                return new HighlightCellCalculateUnit(context);
            }
            case CFRuleType.iconSet: {
                return new IconSetCalculateUnit(context);
            }
        }
    }

    private _createCacheKey(unitId: string, subUnitId: string, row: number, col: number) {
        return `${unitId}_${subUnitId}_${row}_${col}`;
    }

    public setCacheLength(length: number = CONDITIONAL_FORMATTING_VIEWPORT_CACHE_LENGTH) {
        if (this._cellCache.limit === length) {
            return;
        }
        this._cellCache.limit = length;
        this._calculateUnitManagers.forEach((subunitMap) => {
            subunitMap.forEach((unitMap) => {
                unitMap.forEach((unit) => {
                    unit.setCacheLength(length);
                });
            });
        });
    }
}
