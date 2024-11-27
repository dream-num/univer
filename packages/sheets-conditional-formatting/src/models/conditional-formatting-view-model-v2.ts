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

import type { Workbook } from '@univerjs/core';
import type { BaseCalculateUnit, IContext } from './calculate-unit-v2/base-calculate-unit';
import type { IConditionFormattingRule } from './type';
import { Inject, Injector, IUniverInstanceService, LRUMap, RTree } from '@univerjs/core';
import { Subject } from 'rxjs';
import { bufferTime, filter } from 'rxjs/operators';
import { CFRuleType } from '../base/const';
import { ConditionalFormattingFormulaService } from '../services/conditional-formatting-formula.service';
import { ColorScaleCalculateUnit } from './calculate-unit-v2/color-scale-calculate-unit';
import { DataBarCalculateUnit } from './calculate-unit-v2/data-bar-calculate-unit';
import { HighlightCellCalculateUnit } from './calculate-unit-v2/highlight-cell-calculate-unit';
import { IconSetCalculateUnit } from './calculate-unit-v2/icon-set-calculate-unit';
import { ConditionalFormattingRuleModel } from './conditional-formatting-rule-model';

export class ConditionalFormattingViewModelV2 {
    //  Map<unitID ,<sheetId ,ObjectMatrix>>
    private _calculateUnitManagers: Map<string, Map<string, Map<string, BaseCalculateUnit>>> = new Map();
    private _rTreeManager: RTree = new RTree();

    /**
     * 1nd-level cache
     */
    private _cellCache = new LRUMap<string, { cfId: string; result: any; priority: number }[]>(50 * 20 * 9);

    private _markDirty$ = new Subject<{ cfId: string; unitId: string; subUnitId: string }>();
    /**
     * The rendering layer listens to this variable to determine whether a reRender is necessary.
     * @memberof ConditionalFormattingViewModelV2
     */
    public markDirty$ = this._markDirty$.asObservable();
    constructor(
        @Inject(Injector) private _injector: Injector,
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel,
        @Inject(ConditionalFormattingFormulaService) private _conditionalFormattingFormulaService: ConditionalFormattingFormulaService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService) {
        this._initRuleListener();
        this._initCFFormulaListener();
    }

    private _initCFFormulaListener() {
        this._conditionalFormattingFormulaService.result$.pipe(bufferTime(16), filter((e) => !!e.length)).subscribe((list) => {
            list.forEach(({ cfId, unitId, subUnitId }) => {
                this.markRuleDirty(unitId, subUnitId, cfId, true);
            });
        });
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
    public markRuleDirty(unitId: string, subUnitId: string, cfId: string, isNeedResetPreComputingCache: boolean = true) {
        this._cellCache.clear();
        if (isNeedResetPreComputingCache) {
            const _calculateUnitManagers = this._ensureCalculateUnitManager(unitId, subUnitId);
            const calculateUnit = _calculateUnitManagers.get(cfId);
            if (calculateUnit) {
                calculateUnit.resetPreComputingCache();
            }
        }

        this._markDirty$.next({
            unitId, subUnitId, cfId,
        });
    }

    private _initRuleListener() {
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
        });
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
}
