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
import { Disposable, Inject, IUniverInstanceService, LifecycleStages, OnLifecycle, Range, UniverInstanceType } from '@univerjs/core';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { bufferTime, filter } from 'rxjs/operators';
import type { ISheetFontRenderExtension } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ConditionalFormattingRuleModel, ConditionalFormattingService, ConditionalFormattingViewModel, DEFAULT_PADDING, DEFAULT_WIDTH } from '@univerjs/sheets-conditional-formatting';
import type { IConditionalFormattingCellData, IConditionFormattingRule } from '@univerjs/sheets-conditional-formatting';

@OnLifecycle(LifecycleStages.Starting, SheetsCfRenderController)
export class SheetsCfRenderController extends Disposable {
    /**
     * When a set operation is triggered multiple times over a short period of time, it may result in some callbacks not being disposed,and caused a render cache exception.
     * The solution here is to store all the asynchronous tasks and focus on processing after the last callback
     */
    private _ruleChangeCacheMap: Map<string, Array<{ oldRule: IConditionFormattingRule; rule: IConditionFormattingRule; dispose: () => boolean }>> = new Map();
    constructor(@Inject(SheetInterceptorService) private _sheetInterceptorService: SheetInterceptorService,
        @Inject(ConditionalFormattingService) private _conditionalFormattingService: ConditionalFormattingService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService,
        @Inject(IRenderManagerService) private _renderManagerService: IRenderManagerService,
        @Inject(ConditionalFormattingViewModel) private _conditionalFormattingViewModel: ConditionalFormattingViewModel,
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel
    ) {
        super();

        this._initViewModelInterceptor();
        this._initViewModel();
        this._initSkeleton();
        this._initVmEffectByRule();
        this.disposeWithMe(() => {
            this._ruleChangeCacheMap.clear();
        });
    }

    public markDirtySkeleton() {
        const unitId = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
        this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService).reCalculate();
        this._renderManagerService.getRenderById(unitId)?.mainComponent?.makeDirty();
    }

    private _initSkeleton() {
        // After the conditional formatting is marked dirty to drive a rendering, to trigger the window within the conditional formatting recalculation
        this.disposeWithMe(this._conditionalFormattingViewModel.markDirty$.pipe(bufferTime(16), filter((v) => {
            const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            if (!workbook) return false;

            const worksheet = workbook.getActiveSheet();
            if (!worksheet) return false;

            return v.filter((item) => item.unitId === workbook.getUnitId() && item.subUnitId === worksheet.getSheetId()).length > 0;
        })).subscribe(() => this.markDirtySkeleton()));

        // Sort and delete does not mark dirty.
        this.disposeWithMe(this._conditionalFormattingRuleModel.$ruleChange.pipe(bufferTime(16), filter((v) => {
            const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            if (!workbook) return false;

            const worksheet = workbook.getActiveSheet();
            if (!worksheet) return false;

            return v.filter((item) => ['sort', 'delete'].includes(item.type) && item.unitId === workbook.getUnitId() && item.subUnitId === worksheet.getSheetId()).length > 0;
        })).subscribe(() => this.markDirtySkeleton()));

        // Once the calculation is complete, a view update is triggered
        // This rendering does not trigger conditional formatting recalculation,because the rule is not mark dirty
        this.disposeWithMe(this._conditionalFormattingService.ruleComputeStatus$.pipe(bufferTime(16), filter((v) => {
            const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            if (!workbook) return false;

            const worksheet = workbook.getActiveSheet();
            if (!worksheet) return false;

            return v.filter((item) => item.unitId === workbook.getUnitId() && item.subUnitId === worksheet.getSheetId()).length > 0;
        })).subscribe(() => this.markDirtySkeleton()));
    }

    private _initVmEffectByRule() {
        this.disposeWithMe(
            this._conditionalFormattingRuleModel.$ruleChange.subscribe((config) => {
                const { rule, unitId, subUnitId } = config;
                switch (config.type) {
                    case 'add': {
                        this._handleRuleAdd(unitId, subUnitId, rule);
                        return;
                    }
                    case 'delete': {
                        rule.ranges.forEach((range) => {
                            Range.foreach(range, (row, col) => {
                                this._conditionalFormattingViewModel.deleteCellCf(unitId, subUnitId, row, col, rule.cfId);
                            });
                        });
                        this._conditionalFormattingViewModel.markRuleDirty(unitId, subUnitId, rule);
                        return;
                    }
                    case 'set': {
                        this._handleRuleChange(unitId, subUnitId, rule, config.oldRule!);
                        return;
                    }
                    case 'sort': {
                        const list = this._conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId)!;
                        const cfPriorityMap = list.map((item) => item.cfId).reduce((map, cur, index) => {
                            map.set(cur, index);
                            return map;
                        }, new Map<string, number>());
                        rule.ranges.forEach((range) => {
                            Range.foreach(range, (row, col) => {
                                this._conditionalFormattingViewModel.sortCellCf(unitId, subUnitId, row, col, cfPriorityMap);
                            });
                        });
                    }
                }
            }));
    }

    private _initViewModel() {
        let isNeedMark = false;
        const workbookList = this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        workbookList.forEach((workbook) => {
            const unitId = workbook.getUnitId();
            const subRuleMap = this._conditionalFormattingRuleModel.getUnitRules(unitId);
            if (subRuleMap) {
                [...subRuleMap.keys()].forEach((subUnitId) => {
                    const ruleList = subRuleMap.get(subUnitId)!;
                    ruleList.forEach((rule) => {
                        this._handleRuleAdd(unitId, subUnitId, rule);
                        isNeedMark = true;
                    });
                });
            }
        });
        isNeedMark && this.markDirtySkeleton();
    }

    private _handleRuleAdd(
        unitId: string,
        subUnitId: string,
        rule: IConditionFormattingRule) {
        const list = this._conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId)!;
        const cfPriorityMap = list.map((item) => item.cfId).reduce((map, cur, index) => {
            map.set(cur, index);
            return map;
        }, new Map<string, number>());
        rule.ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                this._conditionalFormattingViewModel.pushCellCf(unitId, subUnitId, row, col, rule.cfId);
                this._conditionalFormattingViewModel.sortCellCf(unitId, subUnitId, row, col, cfPriorityMap);
            });
        });
        this._conditionalFormattingViewModel.markRuleDirty(unitId, subUnitId, rule);
    }

    private _handleRuleChange(
        unitId: string,
        subUnitId: string,
        rule: IConditionFormattingRule,
        oldRule: IConditionFormattingRule
    ) {
        const list = this._conditionalFormattingRuleModel.getSubunitRules(unitId, subUnitId)!;
        const cfPriorityMap = list.map((item) => item.cfId).reduce((map, cur, index) => {
            map.set(cur, index);
            return map;
        }, new Map<string, number>());

        // After each setting, the cache needs to be cleared,
        // and this cleanup is deferred until the end of the calculation.
        // Otherwise the render will flash once
        const handleChange = (oldRule: IConditionFormattingRule, newRule: IConditionFormattingRule) => {
            oldRule.ranges.forEach((range) => {
                Range.foreach(range, (row, col) => {
                    this._conditionalFormattingViewModel.deleteCellCf(unitId, subUnitId, row, col, oldRule.cfId);
                });
            });
            newRule.ranges.forEach((range) => {
                Range.foreach(range, (row, col) => {
                    this._conditionalFormattingViewModel.pushCellCf(unitId, subUnitId, row, col, oldRule.cfId);
                    this._conditionalFormattingViewModel.sortCellCf(unitId, subUnitId, row, col, cfPriorityMap);
                });
            });
        };
        const dispose = this._conditionalFormattingService.interceptorManager.intercept(this._conditionalFormattingService.interceptorManager.getInterceptPoints().beforeUpdateRuleResult, {
            handler: (config, _, next) => {
                if (unitId === config?.unitId && subUnitId === config.subUnitId && oldRule.cfId === config.cfId) {
                    const list = this._ruleChangeCacheMap.get(config.cfId) || [];
                    list.forEach((config) => {
                        handleChange(config.oldRule, config.rule);
                        config.dispose();
                    });
                    this._ruleChangeCacheMap.delete(config.cfId);
                    return;
                }
                next(config);
            },
        });

        if (oldRule.cfId === rule.cfId) {
            let list = this._ruleChangeCacheMap.get(oldRule.cfId);
            if (!list) {
                list = [];
                this._ruleChangeCacheMap.set(oldRule.cfId, list);
            }
            list.push({ oldRule, rule, dispose });
        }

        rule.ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                this._conditionalFormattingViewModel.pushCellCf(unitId, subUnitId, row, col, oldRule.cfId);
            });
        });

        this._conditionalFormattingViewModel.markRuleDirty(unitId, subUnitId, rule);
    }

    private _initViewModelInterceptor() {
        this.disposeWithMe(this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            handler: (cell, context, next) => {
                const result = this._conditionalFormattingService.composeStyle(context.unitId, context.subUnitId, context.row, context.col);
                if (!result) {
                    return next(cell);
                }
                const styleMap = context.workbook.getStyles();
                const defaultStyle = (typeof cell?.s === 'string' ? styleMap.get(cell?.s) : cell?.s) || {};
                const s = { ...defaultStyle };
                const cloneCell = { ...cell, s } as IConditionalFormattingCellData & ISheetFontRenderExtension;
                if (result.style) {
                    Object.assign(s, result.style);
                }
                if (!cloneCell.fontRenderExtension) {
                    cloneCell.fontRenderExtension = {};
                    if (result.isShowValue !== undefined) {
                        cloneCell.fontRenderExtension.isSkip = !result.isShowValue;
                    }
                }
                if (result.dataBar) {
                    cloneCell.dataBar = result.dataBar;
                }
                if (result.iconSet) {
                    cloneCell.iconSet = result.iconSet;
                    cloneCell.fontRenderExtension.leftOffset = DEFAULT_PADDING + DEFAULT_WIDTH;
                }

                return next(cloneCell);
            },
            priority: 10,
        }));
    }
}
