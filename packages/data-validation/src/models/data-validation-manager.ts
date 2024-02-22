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
import type { IUpdateRulePayload } from '../types/interfaces/i-update-rule-payload';
import { UpdateRuleType } from '..';

export class DataValidationManager<T extends IDataValidationRule> {
    private _dataValidations: T[];

    private _dataValidationMap = new Map<string, T>();

    readonly unitId: string;
    readonly subUnitId: string;

    constructor(unitId: string, subUnitId: string, dataValidations: T[] | undefined) {
        this.unitId = unitId;
        this.subUnitId = subUnitId;
        if (!dataValidations) {
            return;
        }

        this._insertRules(dataValidations);
    }

    private _insertRules(dataValidations: T[]) {
        this._dataValidations = dataValidations;
        dataValidations.forEach((validation) => {
            this._dataValidationMap.set(validation.uid, validation);
        });
    }

    getRuleById(id: string) {
        return this._dataValidationMap.get(id);
    }

    addRule(rule: T) {
        this._dataValidations.push(rule);
        this._dataValidationMap.set(rule.uid, rule);
    }

    removeRule(ruleId: string) {
        const index = this._dataValidations.findIndex((item) => item.uid === ruleId);
        this._dataValidations.splice(index, 1);
        this._dataValidationMap.delete(ruleId);
    }

    updateRule(ruleId: string, payload: IUpdateRulePayload) {
        const rule = this._dataValidationMap.get(ruleId);

        if (!rule) {
            throw new Error(`Data validation rule is not found, ruleId: ${ruleId}.`);
        }

        switch (payload.type) {
            case UpdateRuleType.RANGE: {
                rule.ranges = payload.payload;
                break;
            }
            case UpdateRuleType.SETTING: {
                Object.assign(rule, payload.payload);
                break;
            }

            case UpdateRuleType.OPTIONS: {
                Object.assign(rule, payload.payload);
                break;
            }
            default:
                break;
        }

        return rule;
    }

    removeAll() {
        this._dataValidations.splice(0, this._dataValidations.length);
        this._dataValidationMap.clear();
    }

    replaceAll(rules: T[]) {
        this.removeAll();
        this._insertRules(rules);
    }

    getDataValidations() {
        return this._dataValidations;
    }

    toJSON() {
        return this._dataValidations;
    }
}
