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

import { Inject } from '@wendellhu/redi';
import { filter, map } from 'rxjs/operators';
import { IPermissionService, LifecycleStages, LRUMap, OnLifecycle, Range } from '@univerjs/core';
import type { UnitAction } from '@univerjs/protocol';
import { UnitObject } from '@univerjs/protocol';

import type { IRange } from '@univerjs/core';
import type { getDefaultRangePermission, IRangePermissionPoint } from '../services/permission/range-permission/util';
import { getAllRangePermissionPoint } from '../services/permission/range-permission/util';

import { RangeProtectionRuleModel } from './range-protection-rule.model';

export type ICellPermission = Record<UnitAction, boolean> & { ruleId?: string; ranges?: IRange[] };

@OnLifecycle(LifecycleStages.Ready, RangeProtectionRenderModel)
export class RangeProtectionRenderModel {
    private _cache = new LRUMap<string, ICellPermission[]>(10000);
    constructor(
        @Inject(RangeProtectionRuleModel) private _selectionProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(IPermissionService) private _permissionService: IPermissionService
    ) {
        this.init();
    }

    init() {
        this._permissionService.permissionPointUpdate$.pipe(
            filter((permission) => permission.type === UnitObject.SelectRange),
            filter((permission) => getAllRangePermissionPoint().some((F) => permission instanceof F)),
            map((permission) => permission as IRangePermissionPoint)
        )
            .subscribe((permission) => {
                const ruleMap = this._selectionProtectionRuleModel.getSubunitRuleList(permission.unitId, permission.subUnitId);
                for (const rule of ruleMap) {
                    if (rule.permissionId === permission.permissionId) {
                        rule.ranges.forEach((range) => {
                            Range.foreach(range, (row, col) => {
                                const key = this._createKey(permission.unitId, permission.subUnitId, row, col);
                                this._cache.delete(key);
                            });
                        });
                    }
                }
            });

        this._selectionProtectionRuleModel.ruleChange$.subscribe((info) => {
            info.rule.ranges.forEach((range) => {
                Range.foreach(range, (row, col) => {
                    const key = this._createKey(info.unitId, info.subUnitId, row, col);
                    this._cache.delete(key);
                });
            });
            if (info.type === 'set') {
                info.oldRule?.ranges.forEach((range) => {
                    Range.foreach(range, (row, col) => {
                        const key = this._createKey(info.unitId, info.subUnitId, row, col);
                        this._cache.delete(key);
                    });
                });
            }
        });
    }

    getCellInfo(unitId: string, subUnitId: string, row: number, col: number) {
        const key = this._createKey(unitId, subUnitId, row, col);
        const cacheValue = this._cache.get(key);
        if (cacheValue) {
            return cacheValue;
        }
        const ruleMap = this._selectionProtectionRuleModel.getSubunitRuleList(unitId, subUnitId);
        const defaultV: ICellPermission[] = [];
        if (!ruleMap || !ruleMap.length) {
            return defaultV;
        }
        const result: ICellPermission[] = [];
        for (const rule of ruleMap) {
            if (rule.ranges.some((range) => range.startRow <= row && range.endRow >= row && range.startColumn <= col && range.endColumn >= col)) {
                const permissionMap = getAllRangePermissionPoint().reduce((result, F) => {
                    const instance = new F(unitId, subUnitId, rule.permissionId);
                    const permission = this._permissionService.getPermissionPoint(instance.id);
                    result[instance.subType] = permission?.value ?? instance.value;
                    return result;
                }, {} as ReturnType<typeof getDefaultRangePermission>);
                result.push({ ...permissionMap, ruleId: rule.id, ranges: rule.ranges });
            }
        }
        this._cache.set(key, result);
        return result;
    }

    _createKey(unitId: string, subUnitId: string, row: number, col: number) {
        return `${unitId}_${subUnitId}_${row}_${col}`;
    }

    clear() {
        this._cache.clear();
    }
}
