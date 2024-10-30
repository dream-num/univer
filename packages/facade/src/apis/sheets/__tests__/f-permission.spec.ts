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

import type { Injector } from '@univerjs/core';
import type { FUniver } from '../../everything';
import { ICommandService, IPermissionService } from '@univerjs/core';
import { AddRangeProtectionMutation, AddWorksheetProtectionMutation, DeleteRangeProtectionMutation, DeleteWorksheetProtectionMutation, RangeProtectionPermissionEditPoint, RangeProtectionRuleModel, SetRangeProtectionMutation, WorkbookEditablePermission, WorksheetEditPermission } from '@univerjs/sheets';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from '../../__tests__/create-test-bed';

describe('Test FPermission', () => {
    let get: Injector['get'];
    let commandService: ICommandService;
    let univerAPI: FUniver;
    let permissionService: IPermissionService;
    let rangeProtectionRuleModel: RangeProtectionRuleModel;

    beforeEach(() => {
        const testBed = createFacadeTestBed();
        get = testBed.get;
        univerAPI = testBed.univerAPI;

        commandService = get(ICommandService);
        commandService.registerCommand(AddWorksheetProtectionMutation);
        commandService.registerCommand(DeleteWorksheetProtectionMutation);
        commandService.registerCommand(AddRangeProtectionMutation);
        commandService.registerCommand(SetRangeProtectionMutation);
        commandService.registerCommand(DeleteRangeProtectionMutation);

        permissionService = get(IPermissionService);
        rangeProtectionRuleModel = get(RangeProtectionRuleModel);
    });

    it('set workbook edit point false', () => {
        const permission = univerAPI.getPermission();
        const unitId = univerAPI.getActiveWorkbook()?.getId();
        if (unitId) {
            permission.setWorkbookEditPermission(unitId, false);
            let editValue = permissionService.getPermissionPoint(new WorkbookEditablePermission(unitId).id)?.value;
            expect(editValue).toBe(false);
            permission.setWorkbookEditPermission(unitId, true);
            editValue = permissionService.getPermissionPoint(new WorkbookEditablePermission(unitId).id)?.value;
            expect(editValue).toBe(true);
        }
    });

    it('set worksheet edit point false', async () => {
        const permission = univerAPI.getPermission();
        const unitId = univerAPI.getActiveWorkbook()?.getId();
        const subUnitId = univerAPI.getActiveWorkbook()?.getActiveSheet().getSheetId();
        if (unitId && subUnitId) {
            await permission.addWorksheetBasePermission(unitId, subUnitId);
            await permission.setWorksheetPermissionPoint(unitId, subUnitId, WorksheetEditPermission, false);
            let editValue = permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id)?.value;
            expect(editValue).toBe(false);
            await permission.setWorksheetPermissionPoint(unitId, subUnitId, WorksheetEditPermission, true);
            editValue = permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id)?.value;
            expect(editValue).toBe(true);
            await permission.setWorksheetPermissionPoint(unitId, subUnitId, WorksheetEditPermission, false);
            editValue = permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id)?.value;
            expect(editValue).toBe(false);
            permission.removeWorksheetPermission(unitId, subUnitId);
            editValue = permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id)?.value;
            expect(editValue).toBe(true);
        }
    });

    it('set range protection point false', async () => {
        const permission = univerAPI.getPermission();
        const unitId = univerAPI.getActiveWorkbook()?.getId();
        const subUnitId = univerAPI.getActiveWorkbook()?.getActiveSheet().getSheetId();
        const ranges = [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }];
        const newRanges = [{ startRow: 0, endRow: 2, startColumn: 0, endColumn: 2 }];

        if (unitId && subUnitId) {
            const res = await permission.addRangeBaseProtection(unitId, subUnitId, ranges);
            if (!res?.permissionId || !res?.ruleId) {
                return;
            }
            permission.setRangeProtectionPermissionPoint(unitId, subUnitId, res.permissionId, RangeProtectionPermissionEditPoint, false);
            let editValue = permissionService.getPermissionPoint(new RangeProtectionPermissionEditPoint(unitId, subUnitId, res.permissionId).id)?.value;
            expect(editValue).toBe(false);
            permission.setRangeProtectionPermissionPoint(unitId, subUnitId, res.permissionId, RangeProtectionPermissionEditPoint, true);
            editValue = permissionService.getPermissionPoint(new RangeProtectionPermissionEditPoint(unitId, subUnitId, res.permissionId).id)?.value;
            expect(editValue).toBe(true);
            let catchErr = false;
            try {
                await permission.addWorksheetBasePermission(unitId, subUnitId);
            } catch (e) {
                catchErr = true;
            }
            expect(catchErr).toBe(true);
            permission.setRangeProtectionRanges(unitId, subUnitId, res.ruleId, newRanges);
            let rule = rangeProtectionRuleModel.getRule(unitId, subUnitId, res.ruleId);
            expect(rule?.ranges).toStrictEqual(newRanges);
            permission.removeRangeProtection(unitId, subUnitId, [res.ruleId]);
            rule = rangeProtectionRuleModel.getRule(unitId, subUnitId, res.ruleId);
            expect(rule).toBeUndefined();
        }
    });
});
