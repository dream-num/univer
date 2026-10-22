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

import type { ICommand, IRange, Univer, Workbook } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IPermissionService,
    IUniverInstanceService,
    LocaleService,
    RANGE_TYPE,
} from '@univerjs/core';
import { UnitObject } from '@univerjs/protocol';
import { afterEach, describe, expect, it } from 'vitest';
import { createCommandTestBed } from '../../../commands/commands/__tests__/create-command-test-bed';
import { SetColHiddenCommand, SetSelectedColsVisibleCommand, SetSpecificColsVisibleCommand } from '../../../commands/commands/set-col-visible.command';
import { SetRangeValuesCommand } from '../../../commands/commands/set-range-values.command';
import { SetRowHiddenCommand, SetSelectedRowsVisibleCommand, SetSpecificRowsVisibleCommand } from '../../../commands/commands/set-row-visible.command';
import { EditStateEnum, RangeProtectionRuleModel, ViewStateEnum } from '../../../models/range-protection-rule.model';
import { RangeProtectionPermissionEditPoint } from '../../../services/permission/permission-point/range/edit';
import { WorksheetEditPermission } from '../../../services/permission/permission-point/worksheet/edit';
import { WorksheetSetColumnStylePermission } from '../../../services/permission/permission-point/worksheet/set-column-style';
import { WorksheetSetRowStylePermission } from '../../../services/permission/permission-point/worksheet/set-row-style';
import { WorksheetProtectionRuleModel } from '../../../services/permission/worksheet-permission';
import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import { SheetPermissionCheckController } from '../sheet-permission-check.controller';

const PROTECTED_CELL: IRange = { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 };

describe('SheetPermissionCheckController row and column visibility', () => {
    let univer: Univer;
    let controller: SheetPermissionCheckController;

    afterEach(() => {
        controller?.dispose();
        univer?.dispose();
    });

    function setup() {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        const { get, sheet } = testBed;
        const commandService = get(ICommandService);
        const permissionService = get(IPermissionService);
        const ruleModel = get(RangeProtectionRuleModel);
        const unitId = sheet.getUnitId();
        const worksheet = sheet.getActiveSheet();
        const subUnitId = worksheet.getSheetId();

        controller = new SheetPermissionCheckController(
            commandService,
            get(IUniverInstanceService),
            permissionService,
            get(SheetsSelectionsService),
            ruleModel,
            get(WorksheetProtectionRuleModel),
            get(LocaleService),
            {} as never,
            {} as never
        );

        for (const command of [
            SetSpecificColsVisibleCommand,
            SetSpecificRowsVisibleCommand,
            SetSelectedColsVisibleCommand,
            SetSelectedRowsVisibleCommand,
            SetColHiddenCommand,
            SetRowHiddenCommand,
            SetRangeValuesCommand,
        ] satisfies ICommand[]) {
            commandService.registerCommand({
                id: command.id,
                type: CommandType.COMMAND,
                handler: () => true,
            });
        }

        const permissionId = 'range-edit-lock';
        ruleModel.addRule(unitId, subUnitId, {
            id: 'rule-1',
            permissionId,
            ranges: [PROTECTED_CELL],
            unitId,
            subUnitId,
            unitType: UnitObject.SelectRange,
            viewState: ViewStateEnum.OthersCanView,
            editState: EditStateEnum.OnlyMe,
        });
        const editPoint = new RangeProtectionPermissionEditPoint(unitId, subUnitId, permissionId);
        editPoint.value = false;
        permissionService.addPermissionPoint(editPoint);

        return { commandService, permissionService, sheet, unitId, subUnitId };
    }

    function columnRange(sheet: Workbook): IRange {
        const worksheet = sheet.getActiveSheet();
        return {
            startRow: 0,
            endRow: worksheet.getRowCount() - 1,
            startColumn: 0,
            endColumn: 0,
            rangeType: RANGE_TYPE.COLUMN,
        };
    }

    function rowRange(sheet: Workbook): IRange {
        const worksheet = sheet.getActiveSheet();
        return {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: worksheet.getColumnCount() - 1,
            rangeType: RANGE_TYPE.ROW,
        };
    }

    it('shows columns and rows that intersect a range edit lock, while cell edits stay blocked', () => {
        const { commandService, sheet, unitId, subUnitId } = setup();

        expect(commandService.syncExecuteCommand(SetSpecificColsVisibleCommand.id, {
            unitId,
            subUnitId,
            ranges: [columnRange(sheet)],
        })).toBe(true);
        expect(commandService.syncExecuteCommand(SetColHiddenCommand.id, {
            unitId,
            subUnitId,
            ranges: [columnRange(sheet)],
        })).toBe(true);
        expect(commandService.syncExecuteCommand(SetSpecificRowsVisibleCommand.id, {
            unitId,
            subUnitId,
            ranges: [rowRange(sheet)],
        })).toBe(true);
        expect(commandService.syncExecuteCommand(SetRowHiddenCommand.id, {
            unitId,
            subUnitId,
            ranges: [rowRange(sheet)],
        })).toBe(true);
        expect(commandService.syncExecuteCommand(SetSelectedColsVisibleCommand.id)).toBe(true);
        expect(commandService.syncExecuteCommand(SetSelectedRowsVisibleCommand.id)).toBe(true);
        expect(commandService.syncExecuteCommand(SetRangeValuesCommand.id, {
            unitId,
            subUnitId,
            range: PROTECTED_CELL,
            value: { v: 1 },
        })).toBe(false);
    });

    it('still blocks showing a column or row when the sheet style permission is denied', () => {
        const { commandService, permissionService, sheet, unitId, subUnitId } = setup();
        permissionService.updatePermissionPoint(new WorksheetSetColumnStylePermission(unitId, subUnitId).id, false);
        permissionService.updatePermissionPoint(new WorksheetSetRowStylePermission(unitId, subUnitId).id, false);
        permissionService.updatePermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id, false);

        expect(commandService.syncExecuteCommand(SetSpecificColsVisibleCommand.id, {
            unitId,
            subUnitId,
            ranges: [columnRange(sheet)],
        })).toBe(false);
        expect(commandService.syncExecuteCommand(SetSpecificRowsVisibleCommand.id, {
            unitId,
            subUnitId,
            ranges: [rowRange(sheet)],
        })).toBe(false);
    });
});
