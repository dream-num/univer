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

import type { IModel, IObjectModel, IWorksheetProtectionRule } from '../type';
import { BehaviorSubject, Subject } from 'rxjs';

type IRuleChangeType = 'add' | 'set' | 'delete';

export class WorksheetProtectionRuleModel {
    /**
     *
     * Map<unitId, Map<subUnitId, Map<subUnitId, IWorksheetProtectionRule>>>
     */
    private _model: IModel = new Map();

    private _ruleChange = new Subject<{
        unitId: string;
        subUnitId: string;
        rule: IWorksheetProtectionRule;
        oldRule?: IWorksheetProtectionRule;
        type: IRuleChangeType;
    }>();

    private _ruleRefresh = new Subject<string>();
    private _resetOrder = new Subject();

    ruleChange$ = this._ruleChange.asObservable();

    ruleRefresh$ = this._ruleRefresh.asObservable();

    resetOrder$ = this._resetOrder.asObservable();

    private _worksheetRuleInitStateChange = new BehaviorSubject<boolean>(false);
    worksheetRuleInitStateChange$ = this._worksheetRuleInitStateChange.asObservable();

    changeRuleInitState(state: boolean) {
        this._worksheetRuleInitStateChange.next(state);
    }

    getSheetRuleInitState() {
        return this._worksheetRuleInitStateChange.value;
    }

    addRule(unitId: string, rule: IWorksheetProtectionRule) {
        const subUnitMap = this._ensureSubUnitMap(unitId);
        subUnitMap.set(rule.subUnitId, rule);
        this._ruleChange.next({ unitId, rule, type: 'add', subUnitId: rule.subUnitId });
    }

    deleteRule(unitId: string, subUnitId: string) {
        const rule = this._model?.get(unitId)?.get(subUnitId);
        if (rule) {
            this._model.get(unitId)?.delete(subUnitId);
            this._ruleChange.next({ unitId, rule, type: 'delete', subUnitId });
        }
    }

    setRule(unitId: string, subUnitId: string, rule: IWorksheetProtectionRule) {
        const oldRule = this.getRule(unitId, subUnitId);
        if (oldRule) {
            this._model?.get(unitId)?.set(subUnitId, rule);
            this._ruleChange.next({ unitId, oldRule, rule, type: 'set', subUnitId });
        }
    }

    getRule(unitId: string, subUnitId: string) {
        return this._model?.get(unitId)?.get(subUnitId);
    }

    toObject() {
        const result: IObjectModel = {};
        const unitKeys = [...this._model.keys()];
        unitKeys.forEach((unitId) => {
            const subUnitMap = this._model.get(unitId);
            if (subUnitMap?.size) {
                result[unitId] = [];
                const subUnitKeys = [...subUnitMap.keys()];
                subUnitKeys.forEach((subUnitId) => {
                    const rule = subUnitMap.get(subUnitId);
                    if (rule) {
                        result[unitId].push(rule);
                    }
                });
            }
        });
        return result;
    }

    fromObject(obj: IObjectModel) {
        const result: IModel = new Map();
        Object.keys(obj).forEach((unitId) => {
            const subUnitList = obj[unitId];
            if (subUnitList?.length) {
                const subUnitMap = new Map();
                subUnitList.forEach((rule) => {
                    subUnitMap.set(rule.subUnitId, rule);
                });
                result.set(unitId, subUnitMap);
            }
        });
        this._model = result;
    }

    deleteUnitModel(unitId: string) {
        this._model.delete(unitId);
    }

    private _ensureSubUnitMap(unitId: string) {
        let subUnitMap = this._model.get(unitId);
        if (!subUnitMap) {
            subUnitMap = new Map();
            this._model.set(unitId, subUnitMap);
        }
        return subUnitMap;
    }

    ruleRefresh(permissionId: string) {
        this._ruleRefresh.next(permissionId);
    }

    resetOrder() {
        this._resetOrder.next(Math.random());
    }

    getTargetByPermissionId(unitId: string, permissionId: string) {
        const subUnitMap = this._model.get(unitId);
        if (!subUnitMap) return null;
        for (const [subUnitId, rule] of subUnitMap) {
            if (rule.permissionId === permissionId) {
                return [unitId, subUnitId];
            }
        }
    }
}
