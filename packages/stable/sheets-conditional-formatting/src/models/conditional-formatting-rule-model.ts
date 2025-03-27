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

import type { IAnchor } from '../utils/anchor';
import type { IConditionFormattingRule, IRuleModel } from './type';
import { Tools } from '@univerjs/core';
import { Subject } from 'rxjs';
import { findIndexByAnchor, moveByAnchor } from '../utils/anchor';

import { createCfId } from '../utils/create-cf-id';

type RuleOperatorType = 'delete' | 'set' | 'add' | 'sort';

export class ConditionalFormattingRuleModel {
    //  Map<unitID ,<sheetId ,IConditionFormattingRule[]>>
    private _model: IRuleModel = new Map();
    private _ruleChange$ = new Subject<{ rule: IConditionFormattingRule; oldRule?: IConditionFormattingRule; unitId: string; subUnitId: string; type: RuleOperatorType }>();
    public $ruleChange = this._ruleChange$.asObservable();

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
