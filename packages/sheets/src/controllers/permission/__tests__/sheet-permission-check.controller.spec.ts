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

import { ICommandService, IPermissionService } from '@univerjs/core';
import {
    DefinedNamesService,
    FormulaDataModel,
    IDefinedNamesService,
    IFunctionService,
    LexerTreeBuilder,
} from '@univerjs/engine-formula';
import { describe, expect, it } from 'vitest';
import { createCommandTestBed } from '../../../commands/commands/__tests__/create-command-test-bed';
import { CopySheetCommand } from '../../../commands/commands/copy-worksheet.command';
import { InsertSheetCommand } from '../../../commands/commands/insert-sheet.command';
import { RemoveSheetCommand } from '../../../commands/commands/remove-sheet.command';
import { SetTabColorCommand } from '../../../commands/commands/set-tab-color.command';
import { SetWorksheetHideCommand } from '../../../commands/commands/set-worksheet-hide.command';
import { SetTabColorMutation } from '../../../commands/mutations/set-tab-color.mutation';
import { AutoFillService, IAutoFillService } from '../../../services/auto-fill/auto-fill.service';
import { WorkbookCopySheetPermission } from '../../../services/permission/permission-point/workbook/copy-sheet';
import { WorkbookCreateSheetPermission } from '../../../services/permission/permission-point/workbook/create-sheet';
import { WorkbookDeleteSheetPermission } from '../../../services/permission/permission-point/workbook/delete-sheet';
import { WorkbookEditablePermission } from '../../../services/permission/permission-point/workbook/editable';
import { WorkbookHideSheetPermission } from '../../../services/permission/permission-point/workbook/hide-sheet';
import { SheetPermissionCheckController } from '../sheet-permission-check.controller';

describe('SheetPermissionCheckController sheet commands', () => {
    it('blocks sheet commands when their workbook permission point is false', async () => {
        const testBed = createCommandTestBed(undefined, [
            [SheetPermissionCheckController],
            [IAutoFillService, { useClass: AutoFillService }],
            [LexerTreeBuilder],
            [FormulaDataModel],
            [IDefinedNamesService, { useClass: DefinedNamesService }],
            [IFunctionService, { useValue: {} as never }],
        ]);
        testBed.get(SheetPermissionCheckController);

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
});
