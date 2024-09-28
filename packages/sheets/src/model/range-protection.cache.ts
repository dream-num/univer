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

import type { IRange, Workbook } from '@univerjs/core';
import type { IRangePermissionPoint } from '../services/permission/range-permission/util';
import type { IRuleChange } from './range-protection-rule.model';
import { Disposable, Inject, IPermissionService, IUniverInstanceService, Range, UniverInstanceType } from '@univerjs/core';
import { UnitAction, UnitObject } from '@univerjs/protocol';
import { filter, map } from 'rxjs';
import { RangeProtectionPermissionEditPoint, RangeProtectionPermissionViewPoint } from '../services/permission/permission-point';
import { RangeProtectionRuleModel } from './range-protection-rule.model';

export class RangeProtectionCache extends Disposable {
    private readonly _cellRuleCache: Map<string, Map<string, Map<string, string>>> = new Map();
    private readonly _permissionIdCache: Map<string, string> = new Map();
    private readonly _cellInfoCache: Map<string, Map<string, Map<string, Partial<Record<UnitAction, boolean>> & { ruleId?: string; ranges?: IRange[] }>>> = new Map();

    constructor(
        @Inject(RangeProtectionRuleModel) private readonly _ruleModel: RangeProtectionRuleModel,
        @Inject(IPermissionService) private readonly _permissionService: IPermissionService,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();
        this._initUpdateCellRuleCache();
        this._initUpdateCellInfoCache();
        this._initCache();
    }

    private _initCache() {
        this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET).forEach((workbook) => {
            workbook.getSheets().forEach((sheet) => {
                const unitId = workbook.getUnitId();
                const subUnitId = sheet.getSheetId();
                this.reBuildCache(unitId, subUnitId);
            });
        });
    }

    private _initUpdateCellInfoCache() {
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

            const cellInfoMap = this._ensureCellInfoMap(unitId, subUnitId);
            ruleInstance.ranges.forEach((range) => {
                const { startRow, endRow, startColumn, endColumn } = range;
                for (let i = startRow; i <= endRow; i++) {
                    for (let j = startColumn; j <= endColumn; j++) {
                        cellInfoMap.delete(`${i}-${j}`);
                    }
                }
            });
        });

        this._ruleModel.ruleChange$.subscribe((info) => {
            const { unitId, subUnitId } = info;
            const cellInfoMap = this._ensureCellInfoMap(unitId, subUnitId);
            info.rule.ranges.forEach((range) => {
                Range.foreach(range, (row, col) => {
                    cellInfoMap.delete(`${row}-${col}`);
                });
            });
            if (info.type === 'set') {
                info.oldRule?.ranges.forEach((range) => {
                    Range.foreach(range, (row, col) => {
                        this._cellInfoCache.delete(`${row}-${col}`);
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

    private _ensureCellInfoMap(unitId: string, subUnitId: string) {
        let subUnitMap = this._cellInfoCache.get(unitId);
        if (!subUnitMap) {
            subUnitMap = new Map();
            this._cellInfoCache.set(unitId, subUnitMap);
        }
        let cellMap = subUnitMap.get(subUnitId);

        if (!cellMap) {
            cellMap = new Map<string, Partial<Record<UnitAction, boolean>> & { ruleId?: string; ranges?: IRange[] }>();
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
        const cellRuleMap = this._ensureRuleMap(unitId, subUnitId);
        const cellInfoMap = this._ensureCellInfoMap(unitId, subUnitId);
        cellRuleMap.clear();
        cellInfoMap.clear();
        this._ruleModel.getSubunitRuleList(unitId, subUnitId).forEach((rule) => {
            const edit = this._permissionService.getPermissionPoint(new RangeProtectionPermissionEditPoint(unitId, subUnitId, rule.permissionId)?.id)?.value ?? true;
            const view = this._permissionService.getPermissionPoint(new RangeProtectionPermissionViewPoint(unitId, subUnitId, rule.permissionId)?.id)?.value ?? true;
            const selectionProtection = {
                [UnitAction.Edit]: edit,
                [UnitAction.View]: view,
                ruleId: rule.id,
                ranges: rule.ranges,
            };
            rule.ranges.forEach((range) => {
                const { startRow, endRow, startColumn, endColumn } = range;
                for (let i = startRow; i <= endRow; i++) {
                    for (let j = startColumn; j <= endColumn; j++) {
                        cellRuleMap.set(`${i}-${j}`, rule.id);
                        cellInfoMap.set(`${i}-${j}`, selectionProtection);
                    }
                }
            });
        });
    }

    public getCellInfo(unitId: string, subUnitId: string, row: number, col: number) {
        const cellMap = this._ensureCellInfoMap(unitId, subUnitId);
        const cacheValue = cellMap.get(`${row}-${col}`);
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
            cellMap.set(`${row}-${col}`, selectionProtection);
            return selectionProtection;
        }
    }
}
