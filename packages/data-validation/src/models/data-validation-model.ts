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

import type { IDataValidationRule } from '@univerjs/core';
import { Subject } from 'rxjs';
import type { IUpdateRulePayload } from '../types/interfaces/i-update-rule-payload';
import type { DataValidationManager } from './data-validation-manager';

type ManagerCreator<T extends IDataValidationRule> = (unitId: string, subUnitId: string) => DataValidationManager<T>;
type RuleChangeType = 'update' | 'add' | 'remove' | 'removeAll' | 'replaceAll';

export interface IRuleChange<T extends IDataValidationRule> {
    rule?: T;
    type: RuleChangeType;
    unitId: string;
    subUnitId: string;
}

export class DataValidationModel<T extends IDataValidationRule = IDataValidationRule> {
    private _model = new Map<string, Map<string, DataValidationManager<T>>>();
    private _managerCreator: ManagerCreator<T>;
    private _ruleChange$ = new Subject<IRuleChange<T>>();

    ruleChange$ = this._ruleChange$.asObservable();

    constructor() {}

    setManagerCreator(creator: (unitId: string, subUnitId: string) => DataValidationManager<T>) {
        this._managerCreator = creator;
    }

    getOrCreateManager(unitId: string, subUnitId: string) {
        if (!this._model.has(unitId)) {
            this._model.set(unitId, new Map());
        }
        const unitMap = this._model.get(unitId)!;

        if (unitMap.has(subUnitId)) {
            return unitMap.get(subUnitId)!;
        }

        const manager = this._managerCreator(unitId, subUnitId);
        unitMap.set(subUnitId, manager);
        return manager;
    }

    addRule(unitId: string, subUnitId: string, rule: T) {
        const manager = this.getOrCreateManager(unitId, subUnitId);
        manager.addRule(rule);
        this._ruleChange$.next({
            rule,
            type: 'add',
            unitId,
            subUnitId,
        });
    }

    updateRule(unitId: string, subUnitId: string, ruleId: string, payload: IUpdateRulePayload) {
        const manager = this.getOrCreateManager(unitId, subUnitId);
        const rule = manager.updateRule(ruleId, payload);
        this._ruleChange$.next({
            rule,
            type: 'update',
            unitId,
            subUnitId,
        });
    }

    removeRule(unitId: string, subUnitId: string, ruleId: string) {
        const manager = this.getOrCreateManager(unitId, subUnitId);
        const oldRule = manager.getRuleById(ruleId);
        manager.removeRule(ruleId);
        this._ruleChange$.next({
            rule: oldRule,
            type: 'remove',
            unitId,
            subUnitId,
        });
    }

    getRuleById(unitId: string, subUnitId: string, ruleId: string) {
        const manager = this.getOrCreateManager(unitId, subUnitId);
        return manager.getRuleById(ruleId);
    }

    removeAll(unitId: string, subUnitId: string) {
        const manager = this.getOrCreateManager(unitId, subUnitId);
        manager.removeAll();
        this._ruleChange$.next({
            type: 'removeAll',
            unitId,
            subUnitId,
        });
    }

    replaceAll(unitId: string, subUnitId: string, rules: T[]) {
        const manager = this.getOrCreateManager(unitId, subUnitId);
        manager.replaceAll(rules);
        this._ruleChange$.next({
            type: 'replaceAll',
            unitId,
            subUnitId,
        });
    }

    getRules(unitId: string, subUnitId: string) {
        const manager = this.getOrCreateManager(unitId, subUnitId);
        return manager.getDataValidations();
    }
}
