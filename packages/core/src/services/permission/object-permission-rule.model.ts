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

import type { UnitObject } from '@univerjs/protocol';
import type { UniverInstanceType } from '../../common/unit';
import type { IResourceManagerService, IResourceName } from '../resource-manager/type';
import { Subject } from 'rxjs';
import { Disposable } from '../../shared/lifecycle';
import { Tools } from '../../shared/tools';

export interface IObjectPermissionRule {
    objectId: string;
    objectType: UnitObject;
    permissionId: string;
}

export interface ISetObjectPermissionRuleMutationParams {
    unitId: string;
    objectId: string;
    objectType: UnitObject;
    rule: IObjectPermissionRule | null;
}

export interface ISetObjectPermissionRulesMutationParams {
    unitId: string;
    rules: Omit<ISetObjectPermissionRuleMutationParams, 'unitId'>[];
}

/** Shared storage only; each product owns its rule type, resource name and mutation. */
export abstract class ObjectPermissionRuleModel<T extends IObjectPermissionRule = IObjectPermissionRule> extends Disposable {
    private readonly _rules = new Map<string, Map<string, T>>();
    private readonly _changes = new Subject<string>();
    readonly changed$ = this._changes.asObservable();

    protected constructor(resources: IResourceManagerService, name: IResourceName, business: UniverInstanceType, private readonly _objectTypes: readonly UnitObject[]) {
        super();
        this.disposeWithMe(resources.registerPluginResource<T[]>({
            pluginName: name,
            businesses: [business],
            toJson: (unitId) => JSON.stringify(this.getRules(unitId)),
            parseJson: (json) => {
                const rules: unknown = JSON.parse(json);
                if (!Array.isArray(rules) || rules.some((rule) => !rule || typeof rule.objectId !== 'string' ||
                    typeof rule.permissionId !== 'string' || !rule.permissionId || !this._objectTypes.includes(rule.objectType))) {
                    throw new Error('Invalid object permission resource.');
                }
                return rules;
            },
            onLoad: (unitId, rules) => {
                this._rules.set(unitId, new Map(rules.map((rule) => [this._key(rule.objectType, rule.objectId), Tools.deepClone(rule)])));
                this._changes.next(unitId);
            },
            onUnLoad: (unitId) => {
                this._rules.delete(unitId);
                this._changes.next(unitId);
            },
        }));
        this.disposeWithMe(() => {
            this._rules.clear();
            this._changes.complete();
        });
    }

    getRules(unitId: string): T[] {
        return [...(this._rules.get(unitId)?.values() ?? [])].map((rule) => Tools.deepClone(rule));
    }

    getRule(unitId: string, objectType: UnitObject, objectId: string): T | undefined {
        const rule = this._rules.get(unitId)?.get(this._key(objectType, objectId));
        return rule && Tools.deepClone(rule);
    }

    setRule(unitId: string, objectType: UnitObject, objectId: string, rule: T | null): boolean {
        return this.setRules(unitId, [{ objectId, objectType, rule }]);
    }

    /** Validate the whole batch before changing any binding or publishing a resource change. */
    setRules(unitId: string, updates: { objectId: string; objectType: UnitObject; rule: T | null }[]): boolean {
        if (typeof unitId !== 'string' || !unitId || !Array.isArray(updates) || updates.length === 0) {
            return false;
        }
        const keys = new Set<string>();
        for (const update of updates) {
            if (!update) {
                return false;
            }
            const { objectId, objectType, rule } = update;
            const key = this._key(objectType, objectId);
            if (typeof objectId !== 'string' || !objectId || !this._objectTypes.includes(objectType) || keys.has(key) || (rule !== null &&
                (!rule || rule.objectId !== objectId || rule.objectType !== objectType ||
                    typeof rule.permissionId !== 'string' || !rule.permissionId))) {
                return false;
            }
            keys.add(key);
        }
        const clonedUpdates = Tools.deepClone(updates);
        const rules = this._rules.get(unitId) ?? new Map<string, T>();
        for (const { objectId, objectType, rule } of clonedUpdates) {
            if (rule) {
                rules.set(this._key(objectType, objectId), rule);
            } else {
                rules.delete(this._key(objectType, objectId));
            }
        }
        this._rules.set(unitId, rules);
        this._changes.next(unitId);
        return true;
    }

    private _key(objectType: UnitObject, objectId: string): string {
        return `${objectType}/${objectId}`;
    }
}
