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

import { BehaviorSubject, Subject } from 'rxjs';
import type { IRange } from '@univerjs/core';
import { LifecycleStages, OnLifecycle, Tools } from '@univerjs/core';

import type { UnitObject } from '@univerjs/protocol';

export interface IRangeProtectionRule {
    ranges: IRange[];
    permissionId: string;
    id: string;
    name: string;
    description?: string;
    unitType: UnitObject;
    unitId: string;
    subUnitId: string;
}
export type IObjectModel = Record<string, Record<string, IRangeProtectionRule[]>>;

export type IModel = Map<string, Map<string, Map<string, IRangeProtectionRule>>>;

type IRuleChangeType = 'add' | 'set' | 'delete';
@OnLifecycle(LifecycleStages.Starting, RangeProtectionRuleModel)

export class RangeProtectionRuleModel {
    /**
     *
     * Map<unitId, Map<subUnitId, Map<ruleId, IRangeProtectionRule>>>
     */
    private _model: IModel = new Map();

    private _ruleChange = new Subject<{
        unitId: string;
        subUnitId: string;
        rule: IRangeProtectionRule;
        oldRule?: IRangeProtectionRule;
        type: IRuleChangeType;
    }>();

    ruleChange$ = this._ruleChange.asObservable();

    private _ruleRefresh = new Subject();
    ruleRefresh$ = this._ruleRefresh.asObservable();

    ruleRefresh(id: string) {
        this._ruleRefresh.next(id);
    }

    private _rangeRuleInitStateChange = new BehaviorSubject<boolean>(false);
    rangeRuleInitStateChange$ = this._rangeRuleInitStateChange.asObservable();

    changeRuleInitState(state: boolean) {
        this._rangeRuleInitStateChange.next(state);
    }

    addRule(unitId: string, subUnitId: string, rule: IRangeProtectionRule) {
        const ruleMap = this._ensureRuleMap(unitId, subUnitId);
        ruleMap.set(rule.id, rule);
        this._ruleChange.next({ unitId, subUnitId, rule, type: 'add' });
    }

    deleteRule(unitId: string, subUnitId: string, id: string) {
        const rule = this._model.get(unitId)?.get(subUnitId)?.get(id);
        if (rule) {
            this._model.get(unitId)?.get(subUnitId)?.delete(id);
            this._ruleChange.next({ unitId, subUnitId, rule, type: 'delete' });
        }
    }

    setRule(unitId: string, subUnitId: string, id: string, rule: IRangeProtectionRule) {
        const oldRule = this.getRule(unitId, subUnitId, id);
        if (oldRule) {
            this._model.get(unitId)?.get(subUnitId)?.set(id, rule);
            this._ruleChange.next({ unitId, subUnitId, oldRule, rule, type: 'set' });
        }
    }

    getRule(unitId: string, subUnitId: string, id: string) {
        return this._model.get(unitId)?.get(subUnitId)?.get(id);
    }

    getSubunitRuleList(unitId: string, subUnitId: string) {
        const map = this._model.get(unitId)?.get(subUnitId) || new Map();
        return [...map.values()] as IRangeProtectionRule[];
    }

    private _ensureRuleMap(unitId: string, subUnitId: string) {
        let subUnitMap = this._model.get(unitId);
        if (!subUnitMap) {
            subUnitMap = new Map();
            this._model.set(unitId, subUnitMap);
        }
        let ruleMap = subUnitMap.get(subUnitId);

        if (!ruleMap) {
            ruleMap = new Map<string, IRangeProtectionRule>();
            subUnitMap.set(subUnitId, ruleMap);
        }
        return ruleMap;
    }

    toObject() {
        const result: IObjectModel = {};
        const unitKeys = [...this._model.keys()];
        unitKeys.forEach((unitId) => {
            const submitMap = this._model.get(unitId)!;
            const subUnitKeys = [...submitMap.keys()];
            result[unitId] = {};
            subUnitKeys.forEach((subunitId) => {
                const ruleMap = submitMap.get(subunitId)!;
                result[unitId][subunitId] = [...ruleMap.values()];
            });
        });
        return result;
    }

    fromObject(obj: IObjectModel) {
        const result: IModel = new Map();
        Object.keys(obj).forEach((unitId) => {
            const subUnitObj = obj[unitId];
            const map = new Map<string, Map<string, IRangeProtectionRule>>();
            Object.keys(subUnitObj).forEach((subunitId) => {
                const ruleMap = subUnitObj[subunitId].reduce((result, cur) => {
                    result.set(cur.id, cur);
                    return result;
                }, new Map<string, IRangeProtectionRule>());
                map.set(subunitId, ruleMap);
            });
            result.set(unitId, map);
        });
        this._model = result;
    }

    deleteUnitModel() {
        this._model.clear();
    }

    createRuleId(unitId: string, subUnitId: string) {
        let id = Tools.generateRandomId(4);
        const ruleMap = this._ensureRuleMap(unitId, subUnitId);
        while (ruleMap.has(id)) {
            id = Tools.generateRandomId(4);
        }
        return id;
    }
}
