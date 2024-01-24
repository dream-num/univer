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

import type { IConditionFormatRule } from './type';

export class ConditionalFormatRuleModel {
   //  Map<unitID ,<sheetId ,IConditionFormatRule[]>>
    private _model: Map<string, Map<string, IConditionFormatRule[]>> = new Map();
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

    deleteRule(unitId: string, subUnitId: string, cfId: string) {
        const list = this._model.get(unitId)?.get(subUnitId);
        if (list) {
            const index = list.findIndex((e) => e.cfId === cfId);
            list.splice(index, 1);
        }
    }

    getRule(unitId: string, subUnitId: string, cfId: string) {
        const list = this._model.get(unitId)?.get(subUnitId);
        if (list) {
            return list.find((item) => item.cfId === cfId);
        }
        return null;
    }

    setRule(unitId: string, subUnitId: string, rule: IConditionFormatRule) {
        const list = this._ensureList(unitId, subUnitId);
        const item = list.find((item) => item.cfId === rule.cfId);
        if (item) {
            Object.assign(item, rule);
        }
    }

    addRule(unitId: string, subUnitId: string, rule: IConditionFormatRule) {
        const list = this._ensureList(unitId, subUnitId);
        const item = list.find((item) => item.cfId === rule.cfId);
        if (!item) {
            // The new conditional format has a higher priority
            list.unshift(rule);
        }
    }

    moveRulePriority(unitId: string, subUnitId: string, cfId: string, preCfId: string) {
        const list = this._ensureList(unitId, subUnitId);
        const curIndex = list.findIndex((item) => item.cfId === cfId);
        const preCfIndex = list.findIndex((item) => item.cfId === preCfId);
        const rule = list[curIndex];
        if (rule && preCfIndex > -1) {
            list.splice(curIndex, 1);
            list.splice(preCfIndex, 0, rule);
        }
    }

    createCfId(unitId: string, subUnitId: string) {
        const list = this._model.get(unitId)?.get(subUnitId);
        return (list?.length || 0) + 1;
    }
}
