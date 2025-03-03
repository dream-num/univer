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

import type { IDataValidationRule } from '@univerjs/core';
import type { IUpdateRulePayload } from '../types/interfaces/i-update-rule-payload';
import { Disposable, ILogService, Tools } from '@univerjs/core';
import { debounceTime, Subject } from 'rxjs';
import { getRuleOptions, getRuleSetting } from '../common/util';
import { UpdateRuleType } from '../types/enum/update-rule-type';

export type DataValidationChangeType = 'update' | 'add' | 'remove';
export type DataValidationChangeSource = 'command' | 'patched';

export interface IRuleChange {
    rule: IDataValidationRule;
    type: DataValidationChangeType;
    unitId: string;
    subUnitId: string;
    source: DataValidationChangeSource;
    updatePayload?: IUpdateRulePayload;
    oldRule?: IDataValidationRule;
}

interface ISubUnitDataValidation {
    map: Map<string, IDataValidationRule>;
    list: IDataValidationRule[];
}

export class DataValidationModel extends Disposable {
    private readonly _model = new Map<string, Map<string, ISubUnitDataValidation>>();
    private readonly _ruleChange$ = new Subject<IRuleChange>();

    ruleChange$ = this._ruleChange$.asObservable();
    ruleChangeDebounce$ = this.ruleChange$.pipe(debounceTime(20));

    constructor(
        @ILogService private readonly _logService: ILogService
    ) {
        super();

        this.disposeWithMe({
            dispose: () => {
                this._ruleChange$.complete();
            },
        });
    }

    private _ensureMap(unitId: string, subUnitId: string) {
        if (!this._model.has(unitId)) {
            this._model.set(unitId, new Map());
        }
        const unitMap = this._model.get(unitId)!;

        if (unitMap.has(subUnitId)) {
            return unitMap.get(subUnitId)!;
        }

        const map = { map: new Map<string, IDataValidationRule>(), list: [] as IDataValidationRule[] };
        unitMap.set(subUnitId, map);

        return map;
    }

    private _addSubUnitRule(subUnit: ISubUnitDataValidation, rule: IDataValidationRule | IDataValidationRule[], index?: number) {
        const { map: dataValidationMap, list: dataValidations } = subUnit;
        const _rules = Array.isArray(rule) ? rule : [rule];
        const rules = _rules.filter((item) => !dataValidationMap.has(item.uid));

        if (typeof index === 'number' && index < dataValidations.length) {
            dataValidations.splice(index, 0, ...rules);
        } else {
            dataValidations.push(...rules);
        }

        rules.forEach((item) => {
            dataValidationMap.set(item.uid, item);
        });
    }

    private _removeSubUnitRule(subUnit: ISubUnitDataValidation, ruleId: string) {
        const { map: dataValidationMap, list: dataValidations } = subUnit;
        const index = dataValidations.findIndex((item) => item.uid === ruleId);
        if (index > -1) {
            dataValidations.splice(index, 1);
            dataValidationMap.delete(ruleId);
        }
    }

    private _updateSubUnitRule(subUnit: ISubUnitDataValidation, ruleId: string, payload: IUpdateRulePayload): IDataValidationRule {
        const { map: dataValidationMap, list: dataValidations } = subUnit;
        const oldRule = dataValidationMap.get(ruleId);
        const index = dataValidations.findIndex((rule) => ruleId === rule.uid);

        if (!oldRule) {
            throw new Error(`Data validation rule is not found, ruleId: ${ruleId}.`);
        }

        const rule = { ...oldRule };

        switch (payload.type) {
            case UpdateRuleType.RANGE: {
                rule.ranges = payload.payload;
                break;
            }
            case UpdateRuleType.SETTING: {
                Object.assign(rule, getRuleSetting(payload.payload));
                break;
            }

            case UpdateRuleType.OPTIONS: {
                Object.assign(rule, getRuleOptions(payload.payload));
                break;
            }

            case UpdateRuleType.ALL: {
                Object.assign(rule, payload.payload);
                break;
            }
            default:
                break;
        }

        dataValidations[index] = rule;
        dataValidationMap.set(ruleId, rule);
        return rule;
    }

    private _addRuleSideEffect(unitId: string, subUnitId: string, rule: IDataValidationRule, source: DataValidationChangeSource) {
        const subUnitMap = this._ensureMap(unitId, subUnitId);
        const oldRule = subUnitMap.map.get(rule.uid);
        if (oldRule) {
            return;
        }

        return {
            rule,
            type: 'add',
            unitId,
            subUnitId,
            source,
        } as const;
    }

    addRule(unitId: string, subUnitId: string, rule: IDataValidationRule | IDataValidationRule[], source: DataValidationChangeSource, index?: number) {
        try {
            const subUnitMap = this._ensureMap(unitId, subUnitId);
            const rules = Array.isArray(rule) ? rule : [rule];
            const effects = rules.map((item) => this._addRuleSideEffect(unitId, subUnitId, item, source));

            this._addSubUnitRule(subUnitMap, rule, index);
            effects.forEach((effect) => {
                if (effect) {
                    this._ruleChange$.next(effect);
                }
            });
        } catch (error) {
            this._logService.error(error);
        }
    }

    updateRule(unitId: string, subUnitId: string, ruleId: string, payload: IUpdateRulePayload, source: DataValidationChangeSource) {
        try {
            const subUnitMap = this._ensureMap(unitId, subUnitId);
            const oldRule = Tools.deepClone(subUnitMap.map.get(ruleId));
            if (!oldRule) {
                throw new Error(`Data validation rule is not found, ruleId: ${ruleId}.`);
            }
            const rule = this._updateSubUnitRule(subUnitMap, ruleId, payload);
            this._ruleChange$.next({
                rule,
                type: 'update',
                unitId,
                subUnitId,
                source,
                updatePayload: payload,
                oldRule,
            });
        } catch (error) {
            this._logService.error(error);
        }
    }

    removeRule(unitId: string, subUnitId: string, ruleId: string, source: DataValidationChangeSource) {
        try {
            const map = this._ensureMap(unitId, subUnitId);
            const oldRule = map.map.get(ruleId);
            if (oldRule) {
                this._removeSubUnitRule(map, ruleId);
                this._ruleChange$.next({
                    rule: oldRule,
                    type: 'remove',
                    unitId,
                    subUnitId,
                    source,
                });
            }
        } catch (error) {
            this._logService.error(error);
        }
    }

    getRuleById(unitId: string, subUnitId: string, ruleId: string) {
        const map = this._ensureMap(unitId, subUnitId);
        return map.map.get(ruleId);
    }

    getRuleIndex(unitId: string, subUnitId: string, ruleId: string) {
        const map = this._ensureMap(unitId, subUnitId);
        return map.list.findIndex((rule) => rule.uid === ruleId);
    }

    getRules(unitId: string, subUnitId: string) {
        const manager = this._ensureMap(unitId, subUnitId);
        return [...manager.list];
    }

    getUnitRules(unitId: string) {
        const unitMap = this._model.get(unitId);
        if (!unitMap) {
            return [];
        }
        const res = [] as [string, IDataValidationRule[]][];

        unitMap.forEach((manager, subUnitId) => {
            res.push([subUnitId, manager.list]);
        });

        return res;
    }

    deleteUnitRules(unitId: string) {
        this._model.delete(unitId);
    }

    getSubUnitIds(unitId: string) {
        return Array.from(this._model.get(unitId)?.keys() ?? []);
    }

    getAll() {
        return Array.from(this._model.keys()).map((unitId) => [unitId, this.getUnitRules(unitId)] as const);
    }
}
