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

import type { IRange } from '@univerjs/core';
import type { IRangePermissionPoint } from '../services/permission/range-permission/util';
import type { IRuleChange } from './range-protection-rule.model';
import { Disposable, Inject, IPermissionService, LRUMap, Range } from '@univerjs/core';
import { UnitAction, UnitObject } from '@univerjs/protocol';
import { filter, map } from 'rxjs';
import { RangeProtectionPermissionEditPoint, RangeProtectionPermissionViewPoint } from '../services/permission/permission-point';
import { RangeProtectionRuleModel } from './range-protection-rule.model';

export class RangeProtectionCache extends Disposable {
    private readonly _cellRuleCache: Map<string, Map<string, Map<string, string>>> = new Map();
    private readonly _permissionIdCache: Map<string, string> = new Map();
    private readonly _cellInfoCache = new LRUMap<string, Partial<Record<UnitAction, boolean>> & { ruleId?: string; ranges?: IRange[] }>(50000);

    constructor(
        @Inject(RangeProtectionRuleModel) private readonly _ruleModel: RangeProtectionRuleModel,
        @Inject(IPermissionService) private readonly _permissionService: IPermissionService
    ) {
        super();
        this._initUpdateCellRuleCache();
        this._initUpdateCellViewCache();
    }

    private _initUpdateCellViewCache() {
        this._permissionService.permissionPointUpdate$.pipe(
            filter((permission) => permission.type === UnitObject.SelectRange),
            map((permission) => permission as IRangePermissionPoint)
        ).subscribe((permission) => {
            const { subUnitId, unitId, permissionId } = permission;
            const ruleId = this._permissionIdCache.get(permissionId);
            if (!ruleId) {
                return;
            }
            const ruleInstance = this._ruleModel.getRule(unitId, subUnitId, ruleId);
            if (!ruleInstance) {
                return;
            }
            ruleInstance.ranges.forEach((range) => {
                const { startRow, endRow, startColumn, endColumn } = range;
                for (let i = startRow; i <= endRow; i++) {
                    for (let j = startColumn; j <= endColumn; j++) {
                        const key = this._createKey(unitId, subUnitId, i, j);
                        this._cellInfoCache.delete(key);
                    }
                }
            });
        });

        this._ruleModel.ruleChange$.subscribe((info) => {
            info.rule.ranges.forEach((range) => {
                Range.foreach(range, (row, col) => {
                    const key = this._createKey(info.unitId, info.subUnitId, row, col);
                    this._cellInfoCache.delete(key);
                });
            });
            if (info.type === 'set') {
                info.oldRule?.ranges.forEach((range) => {
                    Range.foreach(range, (row, col) => {
                        const key = this._createKey(info.unitId, info.subUnitId, row, col);
                        this._cellInfoCache.delete(key);
                    });
                });
            }
        });
    }

    private _initUpdateCellRuleCache() {
        this._ruleModel.ruleChange$.subscribe((ruleChange) => {
            const { type } = ruleChange;
            if (type === 'add') {
                this._addCellRuleCache(ruleChange);
            } else if (type === 'delete') {
                this._deleteCellRuleCache(ruleChange);
            } else {
                this._deleteCellRuleCache(ruleChange);
                this._addCellRuleCache(ruleChange);
            }
        });
    }

    private _ensureRuleMap(unitId: string, subUnitId: string) {
        let subUnitMap = this._cellRuleCache.get(unitId);
        if (!subUnitMap) {
            subUnitMap = new Map();
            this._cellRuleCache.set(unitId, subUnitMap);
        }
        let cellMap = subUnitMap.get(subUnitId);

        if (!cellMap) {
            cellMap = new Map<string, string>();
            subUnitMap.set(subUnitId, cellMap);
        }
        return cellMap;
    }

    private _addCellRuleCache(ruleChange: IRuleChange) {
        const { subUnitId, unitId, rule } = ruleChange;
        const cellMap = this._ensureRuleMap(unitId, subUnitId);
        rule.ranges.forEach((range) => {
            const { startRow, endRow, startColumn, endColumn } = range;
            for (let i = startRow; i <= endRow; i++) {
                for (let j = startColumn; j <= endColumn; j++) {
                    cellMap.set(`${i}-${j}`, rule.id);
                }
            }
        });
        this._permissionIdCache.set(rule.permissionId, rule.id);
    }

    private _deleteCellRuleCache(ruleChange: IRuleChange) {
        const { subUnitId, unitId, rule } = ruleChange;
        const cellMap = this._ensureRuleMap(unitId, subUnitId);
        rule.ranges.forEach((range) => {
            const { startRow, endRow, startColumn, endColumn } = range;
            for (let i = startRow; i <= endRow; i++) {
                for (let j = startColumn; j <= endColumn; j++) {
                    cellMap.delete(`${i}-${j}`);
                }
            }
        });
        this._permissionIdCache.delete(rule.permissionId);
    }

    public reBuildCache(unitId: string, subUnitId: string) {
        const cellMap = this._ensureRuleMap(unitId, subUnitId);
        cellMap.clear();
        this._ruleModel.getSubunitRuleList(unitId, subUnitId).forEach((rule) => {
            rule.ranges.forEach((range) => {
                const { startRow, endRow, startColumn, endColumn } = range;
                for (let i = startRow; i <= endRow; i++) {
                    for (let j = startColumn; j <= endColumn; j++) {
                        cellMap.set(`${i}-${j}`, rule.id);
                    }
                }
            });
        });
    }

    private _createKey(unitId: string, subUnitId: string, row: number, col: number) {
        return `${unitId}_${subUnitId}_${row}_${col}`;
    }

    public getCellInfo(unitId: string, subUnitId: string, row: number, col: number) {
        const key = this._createKey(unitId, subUnitId, row, col);
        const cacheValue = this._cellInfoCache.get(key);
        if (cacheValue) {
            return cacheValue;
        }

        let view = true;
        let edit = true;
        const ruleId = this._cellRuleCache.get(unitId)?.get(subUnitId)?.get(`${row}-${col}`);
        if (!ruleId) {
            return;
        }

        const rule = this._ruleModel.getRule(unitId, subUnitId, ruleId);
        if (rule) {
            view = this._permissionService.getPermissionPoint(new RangeProtectionPermissionViewPoint(unitId, subUnitId, rule.permissionId)?.id)?.value ?? true;
            edit = this._permissionService.getPermissionPoint(new RangeProtectionPermissionEditPoint(unitId, subUnitId, rule.permissionId)?.id)?.value ?? true;
            const selectionProtection = {
                [UnitAction.Edit]: edit,
                [UnitAction.View]: view,
                ruleId,
                ranges: rule.ranges,
            };
            this._cellInfoCache.set(key, selectionProtection);
            return selectionProtection;
        }
    }
}
