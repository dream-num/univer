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

import { Disposable, Range, Tools } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { ConditionalFormatRuleModel } from '../models/conditional-format-rule-model';
import { ConditionalFormatViewModel } from '../models/conditional-format-view-model';
import { RuleType } from '../base/const';
import type { IConditionFormatRule, IHighlightCell } from '../models/type';

export class ConditionalFormatService extends Disposable {
    constructor(@Inject(ConditionalFormatRuleModel) private _conditionalFormatRuleModel: ConditionalFormatRuleModel,
        @Inject(ConditionalFormatViewModel) private _conditionalFormatViewModel: ConditionalFormatViewModel) {
        super();
    }

    handleHighlightCell(unitId: string, subUnitId: string, rule: IConditionFormatRule) {
        const check = () => true;
        const ruleConfig = rule.rule as IHighlightCell;
        rule.ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                if (check()) {
                    this._conditionalFormatViewModel.setCellCfRuleCache(unitId, subUnitId, row, col, rule.cfId, ruleConfig.style);
                }
            });
        });
    }

    composeStyle(unitId: string, subUnitId: string, row: number, col: number) {
        const cell = this._conditionalFormatViewModel.getCellCf(unitId, subUnitId, row, col);
        if (cell) {
            const ruleList = cell.cfList.map((item) => this._conditionalFormatRuleModel.getRule(unitId, subUnitId, item.cfId)!).filter((rule) => !!rule);
            const endIndex = ruleList.findIndex((rule) => rule?.stopIfTrue);
            if (endIndex > -1) {
                ruleList.splice(endIndex + 1);
            }
            const result = ruleList.reduce((pre, rule) => {
                const type = rule.rule.type;
                const ruleCache = cell.cfList.find((cache) => cache.cfId === rule.cfId);
                if (type === RuleType.highlightCell) {
                    if (!ruleCache?.ruleCache) {
                        this.handleHighlightCell(unitId, subUnitId, rule);
                    }
                    const result = ruleCache!.ruleCache;
                    Tools.deepMerge(pre, { style: result });
                } else if (type === RuleType.colorScale) {
                    if (!ruleCache?.ruleCache) {
                        this.handleHighlightCell(unitId, subUnitId, rule);
                    }
                    pre.colorScale = ruleCache!.ruleCache;
                } else if (type === RuleType.dataBar) {
                    if (!ruleCache?.ruleCache) {
                        this.handleHighlightCell(unitId, subUnitId, rule);
                    }
                    pre.dataBar = ruleCache!.ruleCache;
                }
                return pre;
            }, {} as Record<string, any>);
            this._conditionalFormatViewModel.setCellComposeCache(unitId, subUnitId, row, col, result);
            return cell;
        }
        return null;
    }
}
