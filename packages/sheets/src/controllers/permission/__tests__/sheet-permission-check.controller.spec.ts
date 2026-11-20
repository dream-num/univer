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

import type { IRange } from '@univerjs/core';
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
import { CopySheetCommand } from '../../../commands/commands/copy-worksheet.command';
import { InsertSheetCommand } from '../../../commands/commands/insert-sheet.command';
import { RemoveSheetCommand } from '../../../commands/commands/remove-sheet.command';
import { SetColHiddenCommand } from '../../../commands/commands/set-col-visible.command';
import { SetRowHiddenCommand } from '../../../commands/commands/set-row-visible.command';
import { SetTabColorCommand } from '../../../commands/commands/set-tab-color.command';
import { SetWorksheetHideCommand } from '../../../commands/commands/set-worksheet-hide.command';
import { SetColHiddenMutation } from '../../../commands/mutations/set-col-visible.mutation';
import { SetRowHiddenMutation } from '../../../commands/mutations/set-row-visible.mutation';
import { SetTabColorMutation } from '../../../commands/mutations/set-tab-color.mutation';
import { SetSelectionsOperation } from '../../../commands/operations/selection.operation';
import { EditStateEnum, RangeProtectionRuleModel, ViewStateEnum } from '../../../models/range-protection-rule.model';
import { AutoFillService, IAutoFillService } from '../../../services/auto-fill/auto-fill.service';
import { RangeProtectionPermissionEditPoint } from '../../../services/permission/permission-point/range/edit';
import { WorkbookCopySheetPermission } from '../../../services/permission/permission-point/workbook/copy-sheet';
import { WorkbookCreateSheetPermission } from '../../../services/permission/permission-point/workbook/create-sheet';
import { WorkbookDeleteSheetPermission } from '../../../services/permission/permission-point/workbook/delete-sheet';
import { WorkbookEditablePermission } from '../../../services/permission/permission-point/workbook/editable';
import { WorkbookHideSheetPermission } from '../../../services/permission/permission-point/workbook/hide-sheet';
import { WorksheetSetColumnStylePermission } from '../../../services/permission/permission-point/worksheet/set-column-style';
import { WorksheetSetRowStylePermission } from '../../../services/permission/permission-point/worksheet/set-row-style';
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
});
