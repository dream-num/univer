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

import { type CellValue, type DataValidationStatus, Disposable, type IDataValidationRule, ILogService, type Nullable } from '@univerjs/core';
import { debounceTime, Subject } from 'rxjs';
import type { IUpdateRulePayload } from '../types/interfaces/i-update-rule-payload';
import { DataValidationManager } from './data-validation-manager';

type ManagerCreator<T extends IDataValidationRule> = (unitId: string, subUnitId: string) => DataValidationManager<T>;
type RuleChangeType = 'update' | 'add' | 'remove';

export interface IRuleChange<T extends IDataValidationRule> {
    rule?: T;
    type: RuleChangeType;
    unitId: string;
    subUnitId: string;
}

export interface IValidStatusChange {
    unitId: string;
    subUnitId: string;
    ruleId: string;
    status: DataValidationStatus;
}

export class DataValidationModel<T extends IDataValidationRule = IDataValidationRule> extends Disposable {
    private readonly _model = new Map<string, Map<string, DataValidationManager<T>>>();
    private _managerCreator: ManagerCreator<T> = (unitId: string, subUnitId: string) => new DataValidationManager<T>(unitId, subUnitId, []);
    private readonly _ruleChange$ = new Subject<IRuleChange<T>>();
    private readonly _validStatusChange$ = new Subject<IValidStatusChange>();

    ruleChange$ = this._ruleChange$.asObservable();
    ruleChangeDebounce$ = this.ruleChange$.pipe(debounceTime(20));
    validStatusChange$ = this._validStatusChange$.asObservable().pipe(debounceTime(20));

    constructor(
        @ILogService private readonly _logService: ILogService
    ) {
        super();

        this.disposeWithMe({
            dispose: () => {
                this._ruleChange$.complete();
                this._validStatusChange$.complete();
            },
        });
    }

    setManagerCreator(creator: (unitId: string, subUnitId: string) => DataValidationManager<T>) {
        this._managerCreator = creator;
    }

    ensureManager(unitId: string, subUnitId: string) {
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

    private _addRuleSideEffect(unitId: string, subUnitId: string, rule: T) {
        const manager = this.ensureManager(unitId, subUnitId);
        const oldRule = manager.getRuleById(rule.uid);
        if (oldRule) {
            return;
        }
        this._ruleChange$.next({
            rule,
            type: 'add',
            unitId,
            subUnitId,
        });
    }

    addRule(unitId: string, subUnitId: string, rule: T | T[], index?: number) {
        try {
            const manager = this.ensureManager(unitId, subUnitId);
            const rules = Array.isArray(rule) ? rule : [rule];
            rules.forEach((item) => {
                this._addRuleSideEffect(unitId, subUnitId, item);
            });

            manager.addRule(rule, index);
        } catch (error) {
            this._logService.error(error);
        }
    }

    updateRule(unitId: string, subUnitId: string, ruleId: string, payload: IUpdateRulePayload) {
        try {
            const manager = this.ensureManager(unitId, subUnitId);
            const rule = manager.updateRule(ruleId, payload);

            this._ruleChange$.next({
                rule,
                type: 'update',
                unitId,
                subUnitId,
            });
        } catch (error) {
            this._logService.error(error);
        }
    }

    removeRule(unitId: string, subUnitId: string, ruleId: string) {
        try {
            const manager = this.ensureManager(unitId, subUnitId);
            const oldRule = manager.getRuleById(ruleId);
            if (oldRule) {
                manager.removeRule(ruleId);
                this._ruleChange$.next({
                    rule: oldRule,
                    type: 'remove',
                    unitId,
                    subUnitId,
                });
            }
        } catch (error) {
            this._logService.error(error);
        }
    }

    getRuleById(unitId: string, subUnitId: string, ruleId: string) {
        const manager = this.ensureManager(unitId, subUnitId);
        return manager.getRuleById(ruleId);
    }

    getRuleIndex(unitId: string, subUnitId: string, ruleId: string) {
        const manager = this.ensureManager(unitId, subUnitId);
        return manager.getRuleIndex(ruleId);
    }

    getRules(unitId: string, subUnitId: string) {
        const manager = this.ensureManager(unitId, subUnitId);
        return manager.getDataValidations();
    }

    validator(content: Nullable<CellValue>, rule: T, pos: any) {
        const { unitId, subUnitId } = pos;
        const manager = this.ensureManager(unitId, subUnitId);
        return manager.validator(content, rule, pos, (status, changed) => {
            if (changed) {
                this._validStatusChange$.next({
                    unitId,
                    subUnitId,
                    ruleId: rule.uid,
                    status,
                });
            }
        });
    }

    getUnitRules(unitId: string) {
        const unitMap = this._model.get(unitId);
        if (!unitMap) {
            return [];
        }
        const res = [] as [string, IDataValidationRule[]][];

        unitMap.forEach((manager) => {
            res.push([manager.subUnitId, manager.getDataValidations()]);
        });

        return res;
    }

    deleteUnitRules(unitId: string) {
        this._model.delete(unitId);
    }

    getSubUnitIds(unitId: string) {
        return Array.from(this._model.get(unitId)?.keys() ?? []);
    }
}
