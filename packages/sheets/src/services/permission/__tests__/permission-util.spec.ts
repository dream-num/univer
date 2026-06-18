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

import type { IAccessor, IRange } from '@univerjs/core';
import { IPermissionService } from '@univerjs/core';
import { UnitAction, UnitObject } from '@univerjs/protocol';
import { describe, expect, it } from 'vitest';
import { EditStateEnum, RangeProtectionRuleModel, ViewStateEnum } from '../../../models/range-protection-rule.model';
import { WorkbookEditablePermission, WorksheetEditPermission } from '../permission-point';
import { RangeProtectionPermissionEditPoint } from '../permission-point/range/edit';
import { baseProtectionActions, getAllRangePermissionPoint, getDefaultRangePermission } from '../range-permission/util';
import { checkRangesEditablePermission } from '../util';

function createAccessor(records: Map<unknown, unknown>): IAccessor {
    return {
        get: (token: unknown) => records.get(token) as never,
        has: (token: unknown) => records.has(token),
    } as IAccessor;
}

describe('range permission util', () => {
    it('builds default permission values for every range protection action', () => {
        expect(getAllRangePermissionPoint().map((F) => new F('unit-1', 'sheet-1', 'permission-1').subType)).toEqual([
            UnitAction.View,
            UnitAction.Edit,
            UnitAction.ManageCollaborator,
            UnitAction.Delete,
        ]);
        expect(baseProtectionActions).toEqual([
            UnitAction.Edit,
            UnitAction.View,
            UnitAction.ManageCollaborator,
            UnitAction.Delete,
        ]);
        expect(getDefaultRangePermission('unit-1', 'sheet-1', 'permission-1')).toEqual({
            [UnitAction.View]: false,
            [UnitAction.Edit]: true,
            [UnitAction.ManageCollaborator]: true,
            [UnitAction.Delete]: true,
        });
    });
});

describe('checkRangesEditablePermission', () => {
    const targetRange: IRange = { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 };

    function setup(values: Record<string, boolean | undefined>) {
        const ruleModel = new RangeProtectionRuleModel();
        const permissionService = {
            getPermissionPoint: (id: string) => id in values ? { id, value: values[id] } : undefined,
        };
        const accessor = createAccessor(new Map<unknown, unknown>([
            [IPermissionService, permissionService],
            [RangeProtectionRuleModel, ruleModel],
        ]));
        return { accessor, ruleModel };
    }

    it('requires workbook and worksheet edit permissions before checking protected ranges', () => {
        const workbookPermissionId = new WorkbookEditablePermission('unit-1').id;
        const worksheetPermissionId = new WorksheetEditPermission('unit-1', 'sheet-1').id;

        expect(checkRangesEditablePermission(setup({ [workbookPermissionId]: false, [worksheetPermissionId]: true }).accessor, 'unit-1', 'sheet-1', [targetRange])).toBe(false);
        expect(checkRangesEditablePermission(setup({ [workbookPermissionId]: true, [worksheetPermissionId]: false }).accessor, 'unit-1', 'sheet-1', [targetRange])).toBe(false);
    });

    it('allows unprotected ranges and requires edit permission for intersecting protected rules', () => {
        const workbookPermissionId = new WorkbookEditablePermission('unit-1').id;
        const worksheetPermissionId = new WorksheetEditPermission('unit-1', 'sheet-1').id;
        const rangePermissionId = new RangeProtectionPermissionEditPoint('unit-1', 'sheet-1', 'permission-1').id;

        const noProtection = setup({ [workbookPermissionId]: true, [worksheetPermissionId]: true });
        expect(checkRangesEditablePermission(noProtection.accessor, 'unit-1', 'sheet-1', [targetRange])).toBe(true);

        const denied = setup({ [workbookPermissionId]: true, [worksheetPermissionId]: true, [rangePermissionId]: false });
        denied.ruleModel.addRule('unit-1', 'sheet-1', {
            id: 'rule-1',
            permissionId: 'permission-1',
            ranges: [targetRange],
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            unitType: UnitObject.SelectRange,
            viewState: ViewStateEnum.OthersCanView,
            editState: EditStateEnum.OnlyMe,
        });
        expect(checkRangesEditablePermission(denied.accessor, 'unit-1', 'sheet-1', [targetRange])).toBe(false);

        const allowed = setup({ [workbookPermissionId]: true, [worksheetPermissionId]: true, [rangePermissionId]: true });
        allowed.ruleModel.addRule('unit-1', 'sheet-1', {
            id: 'rule-1',
            permissionId: 'permission-1',
            ranges: [targetRange],
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            unitType: UnitObject.SelectRange,
            viewState: ViewStateEnum.OthersCanView,
            editState: EditStateEnum.OnlyMe,
        });
        expect(checkRangesEditablePermission(allowed.accessor, 'unit-1', 'sheet-1', [targetRange])).toBe(true);
        expect(checkRangesEditablePermission(allowed.accessor, 'unit-1', 'sheet-1', [{ startRow: 5, endRow: 5, startColumn: 5, endColumn: 5 }])).toBe(true);
    });
});
