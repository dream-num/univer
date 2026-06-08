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

import type { IConditionFormattingRule, IHighlightCell } from '../models/type';
import type { IDataBarCellData, IDataBarRenderParams, IIconSetCellData, IIconSetRenderParams } from '../render/type';
import { Inject, merge } from '@univerjs/core';
import { CFRuleType } from '../base/const';
import { ConditionalFormattingRuleModel } from '../models/conditional-formatting-rule-model';
import { ConditionalFormattingViewModel } from '../models/conditional-formatting-view-model';

export class ConditionalFormattingStyleComposer {
    constructor(
        @Inject(ConditionalFormattingRuleModel) private _conditionalFormattingRuleModel: ConditionalFormattingRuleModel,
        @Inject(ConditionalFormattingViewModel) private _conditionalFormattingViewModel: ConditionalFormattingViewModel
    ) {
        // empty
    }

    // Conditional formats need to be evaluated in priority order.
    // Evaluation of subsequent rules stops only if the current rule is matched and stopIfTrue=true.
    composeStyle(unitId: string, subUnitId: string, row: number, col: number) {
        const cellCfs = this._conditionalFormattingViewModel.getCellCfs(unitId, subUnitId, row, col);

        if (!cellCfs?.length) {
            return null;
        }

        const matchedRules: Array<{
            rule: IConditionFormattingRule;
            cacheItem: (typeof cellCfs)[number];
        }> = [];

        let stopIfTrueIndex = -1;
        for (const cacheItem of cellCfs) {
            const rule = this._conditionalFormattingRuleModel.getRule(unitId, subUnitId, cacheItem.cfId);
            if (!rule) {
                continue;
            }

            matchedRules.push({ rule, cacheItem });

            if (stopIfTrueIndex === -1 && rule.stopIfTrue && this._isRuleMatched(rule, cacheItem.result)) {
                stopIfTrueIndex = matchedRules.length - 1;
            }
        }

        if (!matchedRules.length) {
            return null;
        }

        const effectiveRules = stopIfTrueIndex > -1
            ? matchedRules.slice(0, stopIfTrueIndex + 1)
            : matchedRules;

        const result = {} as { style?: IHighlightCell['style'] } & IDataBarCellData & IIconSetCellData & { isShowValue: boolean };

        for (let i = effectiveRules.length - 1; i >= 0; i--) {
            const { rule, cacheItem } = effectiveRules[i];
            this._mergeComposeResult(result, rule, cacheItem.result);
        }

        return result;
    }

    private _mergeComposeResult(
        result: { style?: IHighlightCell['style'] } & IDataBarCellData & IIconSetCellData & { isShowValue: boolean },
        rule: IConditionFormattingRule,
        ruleResult: unknown
    ) {
        const type = rule.rule.type;

        if (type === CFRuleType.highlightCell) {
            ruleResult && merge(result, { style: ruleResult });
            return;
        }

        if (type === CFRuleType.colorScale) {
            if (ruleResult && typeof ruleResult === 'string') {
                const preStyle = result.style || {};
                result.style = { ...preStyle, bg: { rgb: ruleResult } };
            }
            return;
        }

        if (type === CFRuleType.dataBar) {
            const ruleCache = ruleResult as IDataBarRenderParams;
            if (ruleCache) {
                result.dataBar = ruleCache;
                result.isShowValue = ruleCache.isShowValue;
            }
            return;
        }

        if (type === CFRuleType.iconSet) {
            const ruleCache = ruleResult as IIconSetRenderParams;
            if (ruleCache) {
                result.iconSet = ruleCache;
                result.isShowValue = ruleCache.isShowValue;
            }
        }
    }

    private _isRuleMatched(rule: IConditionFormattingRule, ruleResult: unknown) {
        if (rule.rule.type === CFRuleType.highlightCell) {
            return !!ruleResult && typeof ruleResult === 'object' && Object.keys(ruleResult as object).length > 0;
        }

        return !!ruleResult;
    }
}
