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

import type { CellValue, IDataValidationRule, Nullable } from '@univerjs/core';
import { DataValidationStatus, Disposable } from '@univerjs/core';
import { Subject } from 'rxjs';
import type { IUpdateRulePayload } from '../types/interfaces/i-update-rule-payload';
import { UpdateRuleType } from '../types/enum/update-rule-type';
import { getRuleOptions, getRuleSetting } from '../common/util';

export class DataValidationManager<T extends IDataValidationRule> extends Disposable {
    private _dataValidations: T[];
    private _dataValidationMap = new Map<string, T>();
    private _dataValidations$ = new Subject<T[]>();

    readonly unitId: string;
    readonly subUnitId: string;
    readonly dataValidations$ = this._dataValidations$.asObservable();

    constructor(unitId: string, subUnitId: string, dataValidations: T[] | undefined) {
        super();
        this.unitId = unitId;
        this.subUnitId = subUnitId;
        if (!dataValidations) {
            return;
        }

        this._insertRules(dataValidations);
        this._notice();

        this.disposeWithMe({
            dispose: () => {
                this._dataValidations$.complete();
            },
        });
    }

    private _notice() {
        this._dataValidations$.next(this._dataValidations);
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

    getRuleIndex(id: string) {
        return this._dataValidations.findIndex((rule) => rule.uid === id);
    }

    addRule(rule: T | T[], index?: number) {
        const _rules = Array.isArray(rule) ? rule : [rule];
        const rules = _rules.filter((item) => !this._dataValidationMap.has(item.uid));

        if (typeof index === 'number' && index < this._dataValidations.length) {
            this._dataValidations.splice(index, 0, ...rules);
        } else {
            this._dataValidations.push(...rules);
        }

        rules.forEach((item) => {
            this._dataValidationMap.set(item.uid, item);
        });

        this._notice();
    }

    removeRule(ruleId: string) {
        const index = this._dataValidations.findIndex((item) => item.uid === ruleId);
        if (index > -1) {
            this._dataValidations.splice(index, 1);
            this._dataValidationMap.delete(ruleId);
            this._notice();
        }
    }

    updateRule(ruleId: string, payload: IUpdateRulePayload) {
        const oldRule = this._dataValidationMap.get(ruleId);
        const index = this._dataValidations.findIndex((rule) => ruleId === rule.uid);

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
            default:
                break;
        }

        this._dataValidations[index] = rule;
        this._dataValidationMap.set(ruleId, rule);
        this._notice();
        return rule;
    }

    getDataValidations() {
        return this._dataValidations;
    }

    toJSON() {
        return this._dataValidations;
    }

    validator(_content: Nullable<CellValue>, _rule: IDataValidationRule, _pos: any, _onComplete: (status: DataValidationStatus, changed: boolean) => void) {
        return DataValidationStatus.VALID;
    }
}
