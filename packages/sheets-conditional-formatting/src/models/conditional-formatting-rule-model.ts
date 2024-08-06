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

import { Inject, Injector, Tools } from '@univerjs/core';
import { Observable, Subject } from 'rxjs';
import { bufferTime, filter } from 'rxjs/operators';
import { createCfId } from '../utils/create-cf-id';
import type { IAnchor } from '../utils/anchor';
import { findIndexByAnchor, moveByAnchor } from '../utils/anchor';

import type { IConditionFormattingRule, IRuleModel } from './type';

type RuleOperatorType = 'delete' | 'set' | 'add' | 'sort';

export class ConditionalFormattingRuleModel {
    //  Map<unitID ,<sheetId ,IConditionFormattingRule[]>>
    private _model: IRuleModel = new Map();
    private _ruleChange$ = new Subject<{ rule: IConditionFormattingRule; oldRule?: IConditionFormattingRule; unitId: string; subUnitId: string; type: RuleOperatorType }>();
    $ruleChange = this._ruleChange$.asObservable().pipe(
        bufferTime(16),
        filter((list) => !!list.length),
        // Operations for aggregated conditional formatting
        // Adding and then deleting the same conditional format for multiple times will not result in any changes being propagated externally
        // When multiple settings are applied to the same conditional format, only the last setting will be propagated externally.
        (source) => new Observable<{ rule: IConditionFormattingRule; oldRule?: IConditionFormattingRule; unitId: string; subUnitId: string; type: RuleOperatorType }>((observer) => {
            source.subscribe({
                next: (ruleList) => {
                    type Item = (typeof ruleList)[0];
                    const createKey = (item: Item) => `${item.unitId}_${item.subUnitId}_${item.rule.cfId}`;
                    // Adding and then deleting the same conditional format for multiple times will not result in any changes being propagated externally
                    const handleCreateAndDelete = (list: Item[]) => {
                        //Between the operation can be nullified, do not have to carry out.
                        const createIndex = list.findIndex((rule) => rule.type === 'add');
                        const deleteIndex = list.findIndex((rule) => rule.type === 'delete');
                        if (createIndex !== -1 && deleteIndex !== -1 && deleteIndex > createIndex) {
                            list.splice(createIndex, deleteIndex - createIndex + 1);
                        }
                    };
                    // When multiple settings are applied to the same conditional format, only the last setting will be propagated externally.
                    const handleSetAndSet = (list: Item[]) => {
                        const setList = list.filter((item) => item.type === 'set');
                        if (setList.length < 2) {
                            return;
                        }
                        const theLast = setList[setList.length - 1];
                        let index = list.length - 1;
                        while (index >= 0) {
                            const item = list[index];
                            if (item.type === 'set' && item !== theLast) {
                                list.splice(index, 1);
                            }
                            index--;
                        }
                    };

                    const result = ruleList.reduce((a, b, index) => {
                        const key = createKey(b);
                        if (!a[key]) {
                            a[key] = [];
                        }
                        const list = a[key];
                        list.push({ ...b, _index: index });
                        return a;
                    }, {} as Record<string, (Item & { _index: number })[]>);

                    for (const key in result) {
                        const list = result[key];
                        if (list.length >= 2) {
                            handleCreateAndDelete(list);
                            // handleSetAndSet(list)
                        }
                    }

                    const resultList = Object.keys(result).reduce((a, key) => {
                        const list = result[key];
                        a.push(...list);
                        return a;
                    }, [] as (Item & { _index: number })[]).sort((a, b) => a._index - b._index).map((item) => {
                        return item;
                    });

                    resultList.forEach((item) => {
                        observer.next(item);
                    });
                },
                error: (err) => observer.error(err),
                complete: () => observer.complete(),
            });
        }));

    constructor(
        @Inject(Injector) private _injector: Injector
    ) {
        // empty
    }

    private _ensureList(unitId: string, subUnitId: string) {
        let list = this.getSubunitRules(unitId, subUnitId);
        if (!list) {
            list = [];
            let unitMap = this._model.get(unitId);
            if (!unitMap) {
                unitMap = new Map<string, IConditionFormattingRule[]>();
                this._model.set(unitId, unitMap);
            }
            unitMap.set(subUnitId, list);
        }
        return list;
    }

    getRule(unitId: string, subUnitId: string, cfId?: string) {
        const list = this.getSubunitRules(unitId, subUnitId);
        if (list) {
            return list.find((item) => item.cfId === cfId);
        }
        return null;
    }

    getUnitRules(unitId: string) {
        const map = this._model.get(unitId);
        return map || null;
    }

    getSubunitRules(unitId: string, subUnitId: string) {
        const list = this._model.get(unitId)?.get(subUnitId);
        return list || null;
    }

    deleteRule(unitId: string, subUnitId: string, cfId: string) {
        const list = this.getSubunitRules(unitId, subUnitId);
        if (list) {
            const index = list.findIndex((e) => e.cfId === cfId);
            const rule = list[index];
            if (rule) {
                list.splice(index, 1);
                this._ruleChange$.next({ rule, subUnitId, unitId, type: 'delete' });
            }
        }
    }

    setRule(unitId: string, subUnitId: string, rule: IConditionFormattingRule, oldCfId: string) {
        const list = this._ensureList(unitId, subUnitId);
        const oldRule = list.find((item) => item.cfId === oldCfId);
        if (oldRule) {
            const cloneRule = Tools.deepClone(oldRule);
            Object.assign(oldRule, rule);
            this._ruleChange$.next({ rule: oldRule, subUnitId, unitId, type: 'set', oldRule: cloneRule });
        }
    }

    addRule(unitId: string, subUnitId: string, rule: IConditionFormattingRule) {
        const list = this._ensureList(unitId, subUnitId);
        const item = list.find((item) => item.cfId === rule.cfId);
        if (!item) {
            // The new conditional formatting has a higher priority
            list.unshift(rule);
        }
        this._ruleChange$.next({ rule, subUnitId, unitId, type: 'add' });
    }

    /**
     * example [1,2,3,4,5,6],if you move behind 5 to 2, then cfId=5,targetId=2.
     * if targetId does not exist, it defaults to top
     */
    moveRulePriority(unitId: string, subUnitId: string, start: IAnchor, end: IAnchor) {
        const list = this._ensureList(unitId, subUnitId);
        const curIndex = findIndexByAnchor(start, list, (rule) => rule.cfId);
        const targetCfIndex = findIndexByAnchor(end, list, (rule) => rule.cfId);
        if (targetCfIndex === null || curIndex === null || targetCfIndex === curIndex) {
            return;
        }
        const rule = list[curIndex];
        if (rule) {
            moveByAnchor(start, end, list, (rule) => rule.cfId);
            this._ruleChange$.next({ rule, subUnitId, unitId, type: 'sort' });
        }
    }

    createCfId(_unitId: string, _subUnitId: string) {
        return createCfId();
    }

    deleteUnitId(unitId: string) {
        this._model.delete(unitId);
    }
}
