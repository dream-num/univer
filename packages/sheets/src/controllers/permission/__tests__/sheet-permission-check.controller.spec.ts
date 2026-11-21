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

import type { IPermissionPoint, IRange } from '@univerjs/core';
import { ICommandService, IPermissionService, RANGE_TYPE } from '@univerjs/core';
import {
    DefinedNamesService,
    FormulaDataModel,
    IDefinedNamesService,
    IFunctionService,
    LexerTreeBuilder,
} from '@univerjs/engine-formula';
import { UnitObject } from '@univerjs/protocol';
import { describe, expect, it } from 'vitest';
import { createCommandTestBed } from '../../../commands/commands/__tests__/create-command-test-bed';
import { AddRangeProtectionCommand } from '../../../commands/commands/add-range-protection.command';
import { AddWorksheetMergeCommand } from '../../../commands/commands/add-worksheet-merge.command';
import { AddWorksheetProtectionCommand } from '../../../commands/commands/add-worksheet-protection.command';
import { CopySheetCommand } from '../../../commands/commands/copy-worksheet.command';
import { DeleteRangeProtectionCommand } from '../../../commands/commands/delete-range-protection.command';
import { DeleteWorksheetProtectionCommand } from '../../../commands/commands/delete-worksheet-protection.command';
import { InsertSheetCommand } from '../../../commands/commands/insert-sheet.command';
import { RemoveSheetCommand } from '../../../commands/commands/remove-sheet.command';
import { RemoveWorksheetMergeCommand } from '../../../commands/commands/remove-worksheet-merge.command';
import { ReorderRangeCommand } from '../../../commands/commands/reorder-range.command';
import { SetColHiddenCommand } from '../../../commands/commands/set-col-visible.command';
import { SetProtectionCommand } from '../../../commands/commands/set-protection.command';
import { SetRowHiddenCommand } from '../../../commands/commands/set-row-visible.command';
import { SetTabColorCommand } from '../../../commands/commands/set-tab-color.command';
import { SetWorkbookNameCommand } from '../../../commands/commands/set-workbook-name.command';
import { SetWorksheetHideCommand } from '../../../commands/commands/set-worksheet-hide.command';
import { AddRangeProtectionMutation } from '../../../commands/mutations/add-range-protection.mutation';
import { AddWorksheetMergeMutation } from '../../../commands/mutations/add-worksheet-merge.mutation';
import { AddWorksheetProtectionMutation } from '../../../commands/mutations/add-worksheet-protection.mutation';
import { DeleteRangeProtectionMutation } from '../../../commands/mutations/delete-range-protection.mutation';
import { DeleteWorksheetProtectionMutation } from '../../../commands/mutations/delete-worksheet-protection.mutation';
import { RemoveWorksheetMergeMutation } from '../../../commands/mutations/remove-worksheet-merge.mutation';
import { ReorderRangeMutation } from '../../../commands/mutations/reorder-range.mutation';
import { SetColHiddenMutation } from '../../../commands/mutations/set-col-visible.mutation';
import { SetRangeValuesMutation } from '../../../commands/mutations/set-range-values.mutation';
import { SetRowHiddenMutation } from '../../../commands/mutations/set-row-visible.mutation';
import { SetTabColorMutation } from '../../../commands/mutations/set-tab-color.mutation';
import { SetWorkbookNameMutation } from '../../../commands/mutations/set-workbook-name.mutation';
import { SetWorksheetProtectionMutation } from '../../../commands/mutations/set-worksheet-protection.mutation';
import { SetSelectionsOperation } from '../../../commands/operations/selection.operation';
import { EditStateEnum, RangeProtectionRuleModel, ViewStateEnum } from '../../../models/range-protection-rule.model';
import { AutoFillService, IAutoFillService } from '../../../services/auto-fill/auto-fill.service';
import { RangeProtectionPermissionDeleteProtectionPoint } from '../../../services/permission/permission-point/range/delete-protection';
import { RangeProtectionPermissionEditPoint } from '../../../services/permission/permission-point/range/edit';
import { WorkbookCopySheetPermission } from '../../../services/permission/permission-point/workbook/copy-sheet';
import { WorkbookCreateProtectPermission } from '../../../services/permission/permission-point/workbook/create-permission';
import { WorkbookCreateSheetPermission } from '../../../services/permission/permission-point/workbook/create-sheet';
import { WorkbookDeleteSheetPermission } from '../../../services/permission/permission-point/workbook/delete-sheet';
import { WorkbookEditablePermission } from '../../../services/permission/permission-point/workbook/editable';
import { WorkbookHideSheetPermission } from '../../../services/permission/permission-point/workbook/hide-sheet';
import { WorksheetDeleteProtectionPermission } from '../../../services/permission/permission-point/worksheet/delete-protection';
import { WorksheetEditPermission } from '../../../services/permission/permission-point/worksheet/edit';
import { WorksheetManageCollaboratorPermission } from '../../../services/permission/permission-point/worksheet/manage-collaborator';
import { WorksheetSetColumnStylePermission } from '../../../services/permission/permission-point/worksheet/set-column-style';
import { WorksheetSetRowStylePermission } from '../../../services/permission/permission-point/worksheet/set-row-style';
import { WorksheetSortPermission } from '../../../services/permission/permission-point/worksheet/sort';
import { WorksheetProtectionRuleModel } from '../../../services/permission/worksheet-permission/worksheet-permission-rule.model';
import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import { SheetPermissionCheckController } from '../sheet-permission-check.controller';

describe('SheetPermissionCheckController sheet commands', () => {
    function createPermissionTestBed() {
        const testBed = createCommandTestBed(undefined, [
            [SheetPermissionCheckController],
            [IAutoFillService, { useClass: AutoFillService }],
            [LexerTreeBuilder],
            [FormulaDataModel],
            [IDefinedNamesService, { useClass: DefinedNamesService }],
            [IFunctionService, { useValue: {} as never }],
        ]);
        testBed.get(SheetPermissionCheckController);
        return testBed;
    }

    function setPoint(permissionService: IPermissionService, point: IPermissionPoint, value: boolean) {
        if (!permissionService.getPermissionPoint(point.id)) {
            permissionService.addPermissionPoint(point);
        }
        permissionService.updatePermissionPoint(point.id, value);
    }

    it('blocks sheet commands when their workbook permission point is false', async () => {
        const testBed = createPermissionTestBed();

        const commandService = testBed.get(ICommandService);
        const permissionService = testBed.get(IPermissionService);
        const unitId = testBed.sheet.getUnitId();
        const subUnitId = testBed.sheet.getActiveSheet().getSheetId();

        [SetTabColorCommand, SetWorksheetHideCommand, InsertSheetCommand, RemoveSheetCommand, CopySheetCommand, SetTabColorMutation]
            .forEach((command) => commandService.registerCommand(command));

        const cases = [
            { commandId: SetTabColorCommand.id, permission: new WorkbookEditablePermission(unitId), params: { value: '#ff0000' } },
            { commandId: SetWorksheetHideCommand.id, permission: new WorkbookHideSheetPermission(unitId), params: {} },
            { commandId: InsertSheetCommand.id, permission: new WorkbookCreateSheetPermission(unitId), params: {} },
            { commandId: RemoveSheetCommand.id, permission: new WorkbookDeleteSheetPermission(unitId), params: {} },
            { commandId: CopySheetCommand.id, permission: new WorkbookCopySheetPermission(unitId), params: {} },
        ];

        try {
            for (const { commandId, permission, params } of cases) {
                permissionService.updatePermissionPoint(permission.id, false);

                await expect(commandService.executeCommand(commandId, { unitId, subUnitId, ...params })).resolves.toBe(false);

                permissionService.updatePermissionPoint(permission.id, true);
            }

            await expect(commandService.executeCommand(SetTabColorCommand.id, {
                unitId,
                subUnitId,
                value: '#123456',
            })).resolves.toBe(true);
            expect(testBed.sheet.getActiveSheet().getTabColor()).toBe('#123456');
        } finally {
            testBed.univer.dispose();
        }
    });

    it('blocks hiding rows and columns while row or column style permission is false', async () => {
        const testBed = createPermissionTestBed();

        const commandService = testBed.get(ICommandService);
        const permissionService = testBed.get(IPermissionService);
        const unitId = testBed.sheet.getUnitId();
        const worksheet = testBed.sheet.getActiveSheet();
        const subUnitId = worksheet.getSheetId();

        [
            SetRowHiddenCommand,
            SetRowHiddenMutation,
            SetColHiddenCommand,
            SetColHiddenMutation,
            SetSelectionsOperation,
        ].forEach((command) => commandService.registerCommand(command));

        const rowRange: IRange = { startRow: 1, endRow: 1, startColumn: Number.NaN, endColumn: Number.NaN, rangeType: RANGE_TYPE.ROW };
        const colRange: IRange = { startRow: Number.NaN, endRow: Number.NaN, startColumn: 1, endColumn: 1, rangeType: RANGE_TYPE.COLUMN };

        try {
            const rowStylePoint = new WorksheetSetRowStylePermission(unitId, subUnitId);
            permissionService.updatePermissionPoint(rowStylePoint.id, false);

            await expect(commandService.executeCommand(SetRowHiddenCommand.id, { unitId, subUnitId, ranges: [rowRange] })).resolves.toBe(false);
            expect(worksheet.getRowVisible(1)).toBe(true);

            const selectionManager = testBed.get(SheetsSelectionsService);
            selectionManager.addSelections([{ range: rowRange, primary: null, style: null }]);
            await expect(commandService.executeCommand(SetRowHiddenCommand.id)).resolves.toBe(false);
            expect(worksheet.getRowVisible(1)).toBe(true);

            permissionService.updatePermissionPoint(rowStylePoint.id, true);
            await expect(commandService.executeCommand(SetRowHiddenCommand.id)).resolves.toBe(true);
            expect(worksheet.getRowVisible(1)).toBe(false);

            const colStylePoint = new WorksheetSetColumnStylePermission(unitId, subUnitId);
            permissionService.updatePermissionPoint(colStylePoint.id, false);

            await expect(commandService.executeCommand(SetColHiddenCommand.id, { unitId, subUnitId, ranges: [colRange] })).resolves.toBe(false);
            expect(worksheet.getColVisible(1)).toBe(true);

            permissionService.updatePermissionPoint(colStylePoint.id, true);
            await expect(commandService.executeCommand(SetColHiddenCommand.id, { unitId, subUnitId, ranges: [colRange] })).resolves.toBe(true);
            expect(worksheet.getColVisible(1)).toBe(false);
        } finally {
            testBed.univer.dispose();
        }
    });

    it('blocks hiding a row that overlaps a protected range in another column', async () => {
        const testBed = createPermissionTestBed();
        const commandService = testBed.get(ICommandService);
        const permissionService = testBed.get(IPermissionService);
        const ruleModel = testBed.get(RangeProtectionRuleModel);
        const unitId = testBed.sheet.getUnitId();
        const worksheet = testBed.sheet.getActiveSheet();
        const subUnitId = worksheet.getSheetId();

        [
            SetRowHiddenCommand,
            SetRowHiddenMutation,
            SetSelectionsOperation,
        ].forEach((command) => commandService.registerCommand(command));

        ruleModel.addRule(unitId, subUnitId, {
            id: 'protected-row',
            unitId,
            subUnitId,
            permissionId: 'row-permission',
            unitType: UnitObject.SelectRange,
            ranges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }],
            viewState: ViewStateEnum.OthersCanView,
            editState: EditStateEnum.OnlyMe,
        });
        const editPoint = new RangeProtectionPermissionEditPoint(unitId, subUnitId, 'row-permission');
        if (!permissionService.getPermissionPoint(editPoint.id)) {
            permissionService.addPermissionPoint(editPoint);
        }
        permissionService.updatePermissionPoint(editPoint.id, false);

        try {
            await expect(commandService.executeCommand(SetRowHiddenCommand.id, {
                unitId,
                subUnitId,
                ranges: [{ startRow: 1, endRow: 1, startColumn: 0, endColumn: 0, rangeType: RANGE_TYPE.ROW }],
            })).resolves.toBe(false);
            expect(worksheet.getRowVisible(1)).toBe(true);
        } finally {
            testBed.univer.dispose();
        }
    });

    it('blocks merge and unmerge when the worksheet or the protected range denies editing', async () => {
        const testBed = createPermissionTestBed();
        const commandService = testBed.get(ICommandService);
        const permissionService = testBed.get(IPermissionService);
        const ruleModel = testBed.get(RangeProtectionRuleModel);
        const unitId = testBed.sheet.getUnitId();
        const worksheet = testBed.sheet.getActiveSheet();
        const subUnitId = worksheet.getSheetId();
        const range: IRange = { startRow: 2, endRow: 2, startColumn: 0, endColumn: 1 };

        [
            AddWorksheetMergeCommand,
            RemoveWorksheetMergeCommand,
            AddWorksheetMergeMutation,
            RemoveWorksheetMergeMutation,
            SetRangeValuesMutation,
            SetSelectionsOperation,
        ].forEach((command) => commandService.registerCommand(command));

        try {
            const editPoint = new WorksheetEditPermission(unitId, subUnitId);
            setPoint(permissionService, editPoint, false);

            await expect(commandService.executeCommand(AddWorksheetMergeCommand.id, {
                unitId,
                subUnitId,
                selections: [range],
            })).resolves.toBe(false);
            expect(worksheet.getMergeData()).toHaveLength(0);

            setPoint(permissionService, editPoint, true);
            await expect(commandService.executeCommand(AddWorksheetMergeCommand.id, {
                unitId,
                subUnitId,
                selections: [range],
            })).resolves.toBe(true);
            expect(worksheet.getMergeData()).toHaveLength(1);

            ruleModel.addRule(unitId, subUnitId, {
                id: 'merge-protection',
                unitId,
                subUnitId,
                permissionId: 'merge-permission',
                unitType: UnitObject.SelectRange,
                ranges: [range],
                viewState: ViewStateEnum.OthersCanView,
                editState: EditStateEnum.OnlyMe,
            });
            const rangeEditPoint = new RangeProtectionPermissionEditPoint(unitId, subUnitId, 'merge-permission');
            setPoint(permissionService, rangeEditPoint, false);

            await expect(commandService.syncExecuteCommand(RemoveWorksheetMergeCommand.id, {
                unitId,
                subUnitId,
                ranges: [range],
            })).toBe(false);
            expect(worksheet.getMergeData()).toHaveLength(1);

            setPoint(permissionService, rangeEditPoint, true);
            await expect(commandService.syncExecuteCommand(RemoveWorksheetMergeCommand.id, {
                unitId,
                subUnitId,
                ranges: [range],
            })).toBe(true);
            expect(worksheet.getMergeData()).toHaveLength(0);
        } finally {
            testBed.univer.dispose();
        }
    });

    it('blocks reordering a range when the sort permission is denied', async () => {
        const testBed = createPermissionTestBed();
        const commandService = testBed.get(ICommandService);
        const permissionService = testBed.get(IPermissionService);
        const unitId = testBed.sheet.getUnitId();
        const subUnitId = testBed.sheet.getActiveSheet().getSheetId();
        const range: IRange = { startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 };
        const order = { 0: 1, 1: 0 };

        [
            ReorderRangeCommand,
            ReorderRangeMutation,
        ].forEach((command) => commandService.registerCommand(command));

        try {
            const sortPoint = new WorksheetSortPermission(unitId, subUnitId);
            setPoint(permissionService, sortPoint, false);

            await expect(commandService.executeCommand(ReorderRangeCommand.id, {
                unitId,
                subUnitId,
                range,
                order,
            })).resolves.toBe(false);

            setPoint(permissionService, sortPoint, true);
            await expect(commandService.executeCommand(ReorderRangeCommand.id, {
                unitId,
                subUnitId,
                range,
                order,
            })).resolves.toBe(true);
        } finally {
            testBed.univer.dispose();
        }
    });

    it('blocks renaming the workbook when the workbook edit permission is denied', () => {
        const testBed = createPermissionTestBed();
        const commandService = testBed.get(ICommandService);
        const permissionService = testBed.get(IPermissionService);
        const unitId = testBed.sheet.getUnitId();

        [
            SetWorkbookNameCommand,
            SetWorkbookNameMutation,
        ].forEach((command) => commandService.registerCommand(command));

        try {
            const editablePoint = new WorkbookEditablePermission(unitId);
            setPoint(permissionService, editablePoint, false);

            expect(commandService.syncExecuteCommand(SetWorkbookNameCommand.id, {
                unitId,
                name: 'blocked',
            })).toBe(false);
            expect(testBed.sheet.name).not.toBe('blocked');

            setPoint(permissionService, editablePoint, true);
            expect(commandService.syncExecuteCommand(SetWorkbookNameCommand.id, {
                unitId,
                name: 'renamed',
            })).toBe(true);
            expect(testBed.sheet.name).toBe('renamed');
        } finally {
            testBed.univer.dispose();
        }
    });

    it('blocks protection commands without their protection permission points', async () => {
        const testBed = createPermissionTestBed();
        const commandService = testBed.get(ICommandService);
        const permissionService = testBed.get(IPermissionService);
        const worksheetRuleModel = testBed.get(WorksheetProtectionRuleModel);
        const unitId = testBed.sheet.getUnitId();
        const subUnitId = testBed.sheet.getActiveSheet().getSheetId();
        const worksheetRule = {
            permissionId: 'sheet-protection',
            unitType: UnitObject.Worksheet,
            unitId,
            subUnitId,
            viewState: ViewStateEnum.OthersCanView,
            editState: EditStateEnum.OnlyMe,
        };
        const rangeRule = {
            id: 'range-rule',
            permissionId: 'range-protection',
            unitType: UnitObject.SelectRange,
            unitId,
            subUnitId,
            ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
            viewState: ViewStateEnum.OthersCanView,
            editState: EditStateEnum.OnlyMe,
        };

        [
            AddWorksheetProtectionCommand,
            AddWorksheetProtectionMutation,
            AddRangeProtectionCommand,
            AddRangeProtectionMutation,
            SetProtectionCommand,
            SetWorksheetProtectionMutation,
            DeleteWorksheetProtectionCommand,
            DeleteWorksheetProtectionMutation,
            DeleteRangeProtectionCommand,
            DeleteRangeProtectionMutation,
        ].forEach((command) => commandService.registerCommand(command));

        try {
            const createProtectPoint = new WorkbookCreateProtectPermission(unitId);
            setPoint(permissionService, createProtectPoint, false);

            await expect(commandService.executeCommand(AddWorksheetProtectionCommand.id, {
                unitId,
                rule: worksheetRule,
            })).resolves.toBe(false);
            await expect(commandService.executeCommand(AddRangeProtectionCommand.id, {
                permissionId: rangeRule.permissionId,
                rule: rangeRule,
            })).resolves.toBe(false);

            setPoint(permissionService, createProtectPoint, true);
            await expect(commandService.executeCommand(AddWorksheetProtectionCommand.id, {
                unitId,
                rule: worksheetRule,
            })).resolves.toBe(true);
            expect(worksheetRuleModel.getRule(unitId, subUnitId)).toBeDefined();

            const manageCollaboratorPoint = new WorksheetManageCollaboratorPermission(unitId, subUnitId);
            setPoint(permissionService, manageCollaboratorPoint, false);
            await expect(commandService.executeCommand(SetProtectionCommand.id, {
                rule: { ...worksheetRule, id: 'sheet-protection-next', ranges: [] },
                oldRule: { ...worksheetRule, id: 'sheet-protection', ranges: [] },
            })).resolves.toBe(false);

            setPoint(permissionService, manageCollaboratorPoint, true);
            await expect(commandService.executeCommand(SetProtectionCommand.id, {
                rule: { ...worksheetRule, id: 'sheet-protection-next', ranges: [] },
                oldRule: { ...worksheetRule, id: 'sheet-protection', ranges: [] },
            })).resolves.toBe(true);

            const deleteProtectionPoint = new WorksheetDeleteProtectionPermission(unitId, subUnitId);
            setPoint(permissionService, deleteProtectionPoint, false);
            await expect(commandService.executeCommand(DeleteWorksheetProtectionCommand.id, {
                unitId,
                subUnitId,
                rule: worksheetRule,
            })).resolves.toBe(false);

            setPoint(permissionService, deleteProtectionPoint, true);
            await expect(commandService.executeCommand(DeleteWorksheetProtectionCommand.id, {
                unitId,
                subUnitId,
                rule: worksheetRule,
            })).resolves.toBe(true);

            testBed.get(RangeProtectionRuleModel).addRule(unitId, subUnitId, rangeRule);
            const deleteRangeProtectionPoint = new RangeProtectionPermissionDeleteProtectionPoint(unitId, subUnitId, rangeRule.permissionId);
            setPoint(permissionService, deleteRangeProtectionPoint, false);
            await expect(commandService.executeCommand(DeleteRangeProtectionCommand.id, {
                unitId,
                subUnitId,
                rule: rangeRule,
            })).resolves.toBe(false);

            setPoint(permissionService, deleteRangeProtectionPoint, true);
            await expect(commandService.executeCommand(DeleteRangeProtectionCommand.id, {
                unitId,
                subUnitId,
                rule: rangeRule,
            })).resolves.toBe(true);
        } finally {
            testBed.univer.dispose();
        }
    });
});
