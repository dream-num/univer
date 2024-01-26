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

import { Inject } from '@wendellhu/redi';
import { Range } from '@univerjs/core';
import type { IConditionFormatRule } from './type';
import { ConditionalFormatViewModel } from './conditional-format-view-model';

export class ConditionalFormatRuleModel {
   //  Map<unitID ,<sheetId ,IConditionFormatRule[]>>
    private _model: Map<string, Map<string, IConditionFormatRule[]>> = new Map();

    constructor(@Inject(ConditionalFormatViewModel) private _conditionalFormatViewModel: ConditionalFormatViewModel) {

    }

    private _ensureList(unitId: string, subUnitId: string) {
        let list = this._model.get(unitId)?.get(subUnitId);
        if (!list) {
            list = [];
            let unitMap = this._model.get(unitId);
            if (!unitMap) {
                unitMap = new Map<string, IConditionFormatRule[]>();
                this._model.set(unitId, unitMap);
            }
            unitMap.set(subUnitId, list);
        }
        return list;
    }

    getRule(unitId: string, subUnitId: string, cfId: string) {
        const list = this._model.get(unitId)?.get(subUnitId);
        if (list) {
            return list.find((item) => item.cfId === cfId);
        }
        return null;
    }

    deleteRule(unitId: string, subUnitId: string, cfId: string) {
        const list = this._model.get(unitId)?.get(subUnitId);
        if (list) {
            const index = list.findIndex((e) => e.cfId === cfId);
            const rule = list[index];
            if (rule) {
                list.splice(index, 1);
                rule.ranges.forEach((range) => {
                    Range.foreach(range, (row, col) => {
                        this._conditionalFormatViewModel.deleteCellCf(unitId, subUnitId, row, col, rule.cfId);
                    });
                });
            }
            ;
        }
    }

    setRule(unitId: string, subUnitId: string, rule: IConditionFormatRule) {
        const list = this._ensureList(unitId, subUnitId);
        const oldRule = list.find((item) => item.cfId === rule.cfId);
        if (oldRule) {
            const cfIdList = list.map((item) => item.cfId);
            oldRule.ranges.forEach((range) => {
                Range.foreach(range, (row, col) => {
                    this._conditionalFormatViewModel.deleteCellCf(unitId, subUnitId, row, col, oldRule.cfId);
                });
            });
            Object.assign(oldRule, rule);
            rule.ranges.forEach((range) => {
                Range.foreach(range, (row, col) => {
                    this._conditionalFormatViewModel.pushCellCf(unitId, subUnitId, row, col, rule.cfId);
                    this._conditionalFormatViewModel.sortCellCf(unitId, subUnitId, row, col, cfIdList);
                });
            });
        }
    }

    addRule(unitId: string, subUnitId: string, rule: IConditionFormatRule) {
        const list = this._ensureList(unitId, subUnitId);
        const item = list.find((item) => item.cfId === rule.cfId);
        if (!item) {
            // The new conditional format has a higher priority
            list.unshift(rule);
        }
        const cfIdList = list.map((item) => item.cfId);
        rule.ranges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                this._conditionalFormatViewModel.pushCellCf(unitId, subUnitId, row, col, rule.cfId);
                this._conditionalFormatViewModel.sortCellCf(unitId, subUnitId, row, col, cfIdList);
            });
        });
    }

    moveRulePriority(unitId: string, subUnitId: string, cfId: string, preCfId: string) {
        const list = this._ensureList(unitId, subUnitId);
        const curIndex = list.findIndex((item) => item.cfId === cfId);
        const preCfIndex = list.findIndex((item) => item.cfId === preCfId);
        const rule = list[curIndex];
        if (rule && preCfIndex > -1) {
            list.splice(curIndex, 1);
            list.splice(preCfIndex, 0, rule);
            const cfIdList = list.map((item) => item.cfId);
            rule.ranges.forEach((range) => {
                Range.foreach(range, (row, col) => {
                    this._conditionalFormatViewModel.sortCellCf(unitId, subUnitId, row, col, cfIdList);
                });
            });
        }
    }

    createCfId(unitId: string, subUnitId: string) {
        const list = this._model.get(unitId)?.get(subUnitId);
        return (list?.length || 0) + 1;
    }
}
