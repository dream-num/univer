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

import type { Injector, Univer, Workbook } from '@univerjs/core';
import type { IRangeProtectionRule } from '../range-protection-rule.model';
import { IPermissionService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { UnitAction, UnitObject } from '@univerjs/protocol';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestBase, TEST_WORKBOOK_DATA_DEMO } from '../../services/__tests__/util';
import { RangeProtectionPermissionEditPoint, RangeProtectionPermissionViewPoint } from '../../services/permission/permission-point';
import { RangeProtectionPermissionDeleteProtectionPoint } from '../../services/permission/permission-point/range/delete-protection';
import { RangeProtectionPermissionManageCollaPoint } from '../../services/permission/permission-point/range/manage-collaborator';
import { EditStateEnum, RangeProtectionRuleModel, ViewStateEnum } from '../range-protection-rule.model';
import { RangeProtectionCache } from '../range-protection.cache';

describe('RangeProtectionCache', () => {
    let univer: Univer;
    let get: Injector['get'];
    let unitId: string;
    let subUnitId: string;
    let cache: RangeProtectionCache;
    let ruleModel: RangeProtectionRuleModel;
    let permissionService: IPermissionService;
    let seed = 0;

    const getRule = (overrides?: Partial<IRangeProtectionRule>): IRangeProtectionRule => {
        seed += 1;
        return {
            id: `rule-${seed}`,
            permissionId: `permission-${seed}`,
            unitId,
            subUnitId,
            unitType: UnitObject.SelectRange,
            viewState: ViewStateEnum.OthersCanView,
            editState: EditStateEnum.DesignedUserCanEdit,
            ranges: [{ startRow: 1, endRow: 2, startColumn: 2, endColumn: 3 }],
            ...overrides,
        };
    };

    const setupRulePermission = (rule: IRangeProtectionRule, values?: Partial<Record<UnitAction, boolean>>) => {
        const points = [
            new RangeProtectionPermissionEditPoint(rule.unitId, rule.subUnitId, rule.permissionId),
            new RangeProtectionPermissionViewPoint(rule.unitId, rule.subUnitId, rule.permissionId),
            new RangeProtectionPermissionManageCollaPoint(rule.unitId, rule.subUnitId, rule.permissionId),
            new RangeProtectionPermissionDeleteProtectionPoint(rule.unitId, rule.subUnitId, rule.permissionId),
        ];

        points.forEach((point) => {
            if (!permissionService.getPermissionPoint(point.id)) {
                permissionService.addPermissionPoint(point);
            }
            permissionService.updatePermissionPoint(point.id, values?.[point.subType] ?? true);
        });
    };

    beforeEach(() => {
        const testBed = createTestBase(TEST_WORKBOOK_DATA_DEMO, [
            [RangeProtectionRuleModel],
            [RangeProtectionCache],
        ]);

        univer = testBed.univer;
        get = testBed.get;
        cache = get(RangeProtectionCache);
        ruleModel = get(RangeProtectionRuleModel);
        permissionService = get(IPermissionService);

        const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        unitId = workbook.getUnitId();
        subUnitId = workbook.getActiveSheet()!.getSheetId();
    });

    afterEach(() => {
        univer.dispose();
    });

    it('should rebuild cache and return permission info by row/col/cell', () => {
        const rule = getRule();
        setupRulePermission(rule, {
            [UnitAction.Edit]: false,
        });
        ruleModel.addRule(unitId, subUnitId, rule);

        cache.reBuildCache(unitId, subUnitId);

        expect(cache.getRowPermissionInfo(unitId, subUnitId, 1, [UnitAction.Edit])).toBe(false);
        expect(cache.getColPermissionInfo(unitId, subUnitId, 2, [UnitAction.View])).toBe(true);
        expect(cache.getRowPermissionInfo(unitId, subUnitId, 99, [UnitAction.Edit])).toBe(true);
        expect(cache.getCellInfo(unitId, subUnitId, 1, 2)).toEqual({
            [UnitAction.Edit]: false,
            [UnitAction.View]: true,
            [UnitAction.ManageCollaborator]: true,
            [UnitAction.Delete]: true,
            ruleId: rule.id,
            ranges: rule.ranges,
        });
    });

    it('should update cached cell and row permissions when permission point changes', () => {
        const rule = getRule();
        setupRulePermission(rule, {
            [UnitAction.Edit]: true,
        });
        ruleModel.addRule(unitId, subUnitId, rule);
        cache.reBuildCache(unitId, subUnitId);

        expect(cache.getCellInfo(unitId, subUnitId, 1, 2)?.[UnitAction.Edit]).toBe(true);

        const editPoint = new RangeProtectionPermissionEditPoint(unitId, subUnitId, rule.permissionId);
        permissionService.updatePermissionPoint(editPoint.id, false);

        expect(cache.getCellInfo(unitId, subUnitId, 1, 2)?.[UnitAction.Edit]).toBe(false);
        expect(cache.getRowPermissionInfo(unitId, subUnitId, 1, [UnitAction.Edit])).toBe(false);
    });

    it('should drop rule cache after deleting range rule', () => {
        const rule = getRule({
            ranges: [{ startRow: 4, endRow: 4, startColumn: 5, endColumn: 5 }],
        });
        setupRulePermission(rule);
        ruleModel.addRule(unitId, subUnitId, rule);
        cache.reBuildCache(unitId, subUnitId);

        expect(cache.getCellInfo(unitId, subUnitId, 4, 5)?.ruleId).toBe(rule.id);

        ruleModel.deleteRule(unitId, subUnitId, rule.id);

        expect(cache.getCellInfo(unitId, subUnitId, 4, 5)).toBeUndefined();
        expect(cache.getRowPermissionInfo(unitId, subUnitId, 4, [UnitAction.Edit])).toBe(true);
    });

    it('should clear per-unit caches on deleteUnit', () => {
        const rule = getRule({
            ranges: [{ startRow: 7, endRow: 7, startColumn: 7, endColumn: 7 }],
        });
        setupRulePermission(rule);
        ruleModel.addRule(unitId, subUnitId, rule);
        cache.reBuildCache(unitId, subUnitId);

        expect(cache.getCellInfo(unitId, subUnitId, 7, 7)?.ruleId).toBe(rule.id);

        cache.deleteUnit(unitId);

        expect(cache.getCellInfo(unitId, subUnitId, 7, 7)).toBeUndefined();
        expect((cache as any)._cellRuleCache.has(unitId)).toBe(false);
        expect((cache as any)._rowInfoCache.has(unitId)).toBe(false);
        expect((cache as any)._colInfoCache.has(unitId)).toBe(false);
    });
});
