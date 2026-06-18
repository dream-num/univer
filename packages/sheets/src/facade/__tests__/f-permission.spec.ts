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

import type { ITestBed } from './create-test-bed';
import { ICommandService } from '@univerjs/core';
import {
    AddRangeProtectionMutation,
    AddWorksheetProtectionMutation,
    DeleteRangeProtectionMutation,
    DeleteWorksheetProtectionMutation,
    SetRangeProtectionMutation,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFacadeTestBed } from './create-test-bed';

describe('sheets facade permissions', () => {
    let testBed: ITestBed;

    beforeEach(() => {
        testBed = createFacadeTestBed();
        [
            AddWorksheetProtectionMutation,
            DeleteWorksheetProtectionMutation,
            AddRangeProtectionMutation,
            DeleteRangeProtectionMutation,
            SetRangeProtectionMutation,
        ].forEach((command) => testBed.get(ICommandService).registerCommand(command));
    });

    afterEach(() => {
        testBed.univer.dispose();
    });

    it('applies workbook modes and collaborator changes through the permission facade', async () => {
        const { univerAPI } = testBed;
        const workbookPermission = univerAPI.getActiveWorkbook()!.getWorkbookPermission();

        expect(workbookPermission.canEdit()).toBe(true);

        await workbookPermission.setReadOnly();
        expect(workbookPermission.canEdit()).toBe(false);
        expect(workbookPermission.getPoint(univerAPI.Enum.WorkbookPermissionPoint.View)).toBe(true);

        await workbookPermission.setEditable();
        expect(workbookPermission.canEdit()).toBe(true);
        expect(workbookPermission.getSnapshot()[univerAPI.Enum.WorkbookPermissionPoint.CreateSheet]).toBe(true);

        await workbookPermission.setPoint(univerAPI.Enum.WorkbookPermissionPoint.Print, false);
        expect(workbookPermission.getPoint(univerAPI.Enum.WorkbookPermissionPoint.Print)).toBe(false);
        await workbookPermission.setPoint(univerAPI.Enum.WorkbookPermissionPoint.Print, false);
        expect(workbookPermission.getPoint(univerAPI.Enum.WorkbookPermissionPoint.Print)).toBe(false);

        await workbookPermission.setCollaborators([
            { user: { userID: 'u-1', name: 'Editor', avatar: 'editor.png' }, role: univerAPI.Enum.UnitRole.Editor },
        ]);
        await workbookPermission.addCollaborator({ userID: 'u-2', name: 'Reader', avatar: '' }, univerAPI.Enum.UnitRole.Reader);
        await workbookPermission.updateCollaborator({ userID: 'u-2', name: 'Reader updated', avatar: 'reader.png' }, univerAPI.Enum.UnitRole.Editor);

        expect(await workbookPermission.listCollaborators()).toEqual([]);

        await workbookPermission.removeCollaborator('u-1');
        await workbookPermission.removeCollaborators(['u-2']);
        expect(await workbookPermission.listCollaborators()).toEqual([]);
    });

    it('protects a worksheet and range, then restores editing after unprotecting', async () => {
        const { univerAPI } = testBed;
        const worksheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const worksheetPermission = worksheet.getWorksheetPermission();
        const protectedRange = worksheet.getRange('A1:B2');
        const rangePermission = protectedRange.getRangePermission();

        expect(worksheetPermission.isProtected()).toBe(false);
        expect(rangePermission.isProtected()).toBe(false);
        expect(worksheetPermission.canEditCell(0, 0)).toBe(true);

        const worksheetPermissionId = await worksheetPermission.protect({ name: 'Quarter close sheet' });
        expect(worksheetPermissionId).toBeTruthy();
        expect(worksheetPermission.isProtected()).toBe(true);

        await worksheetPermission.setMode('readOnly');
        expect(worksheetPermission.canEdit()).toBe(false);
        expect(worksheetPermission.canView()).toBe(true);
        expect(worksheetPermission.canEditCell(3, 3)).toBe(false);
        expect(worksheetPermission.getSnapshot()[univerAPI.Enum.WorksheetPermissionPoint.View]).toBe(true);

        await worksheetPermission.setEditable();
        expect(worksheetPermission.canEdit()).toBe(true);

        const rule = await rangePermission.protect({
            name: 'Locked input cells',
            allowViewByOthers: false,
        });
        expect(rangePermission.isProtected()).toBe(true);
        expect(rule.options).toMatchObject({ name: 'Locked input cells', allowViewByOthers: false });
        expect(rule.ranges.map((range) => range.getA1Notation())).toEqual(['A1:B2']);

        await rule.setPoint(univerAPI.Enum.RangePermissionPoint.Edit, false);
        await rule.setPoint(univerAPI.Enum.RangePermissionPoint.View, true);
        await rule.setPoint(univerAPI.Enum.RangePermissionPoint.ManageCollaborator, false);
        await rule.setPoint(univerAPI.Enum.RangePermissionPoint.Delete, false);
        expect(rule.canEdit()).toBe(false);
        expect(rule.canView()).toBe(true);
        expect(rule.canManageCollaborator()).toBe(false);
        expect(rule.canDelete()).toBe(false);
        expect(rule.getSnapshot()[univerAPI.Enum.RangePermissionPoint.Edit]).toBe(false);
        expect(worksheetPermission.canEditCell(0, 0)).toBe(false);
        expect(worksheetPermission.canEditCell(5, 5)).toBe(true);

        await expect(rule.updateRanges([])).rejects.toThrow('Ranges cannot be empty');
        await rule.updateRanges([worksheet.getRange('C1:C2')]);
        expect(rule.ranges.map((range) => range.getA1Notation())).toEqual(['C1:C2']);
        expect((await worksheetPermission.listRangeProtectionRules({ ignoreCollaborators: true })).map((item) => item.id)).toEqual([rule.id]);
        expect((await rangePermission.listRules({ ignoreCollaborators: true }))).toEqual([]);
        expect((await worksheet.getRange('C1').getRangePermission().listRules({ ignoreCollaborators: true })).map((item) => item.id)).toEqual([rule.id]);

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const collaboratorRule = await worksheet.getRange('E1:E2').getRangePermission().protect({
            name: 'Missing collaborator range',
            allowedUsers: ['missing-user'],
        });
        consoleErrorSpy.mockRestore();
        expect(collaboratorRule.options.name).toBe('Missing collaborator range');

        await expect(rule.updateRanges([worksheet.getRange('E2:E3')]))
            .rejects
            .toThrow('Range protection cannot intersect with other protection rules');

        await expect(worksheet.getRange('C2:D3').getRangePermission().protect({ name: 'Overlapping range' }))
            .rejects
            .toThrow('Range is already protected');

        expect(await collaboratorRule.remove()).toBe(true);
        expect(await rule.remove()).toBe(true);
        expect(await rangePermission.unprotect()).toBe(true);
        expect(worksheet.getRange('C1').getRangePermission().isProtected()).toBe(false);

        expect(await worksheetPermission.unprotect()).toBe(true);
        expect(worksheetPermission.isProtected()).toBe(false);
    });

    it('applies worksheet protection config and manages range rules in batches', async () => {
        const { univerAPI } = testBed;
        const worksheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const worksheetPermission = worksheet.getWorksheetPermission();

        await expect(worksheetPermission.protectRanges([])).rejects.toThrow('Configs cannot be empty');
        await expect(worksheetPermission.setPoint(univerAPI.Enum.WorksheetPermissionPoint.Edit, false))
            .rejects
            .toThrow('worksheet protection does not exist');

        await worksheetPermission.protect({ name: 'Shared planning sheet' });
        await worksheetPermission.applyConfig({
            mode: 'filterOnly',
            points: {
                [univerAPI.Enum.WorksheetPermissionPoint.Edit]: true,
                [univerAPI.Enum.WorksheetPermissionPoint.InsertRow]: false,
            },
            rangeProtections: [
                {
                    rangeRefs: ['E1:E2'],
                    options: { name: 'Forecast totals', allowViewByOthers: false },
                },
            ],
        });

        expect(worksheetPermission.canEdit()).toBe(true);
        expect(worksheetPermission.getPoint(univerAPI.Enum.WorksheetPermissionPoint.Filter)).toBe(true);
        expect(worksheetPermission.getPoint(univerAPI.Enum.WorksheetPermissionPoint.InsertRow)).toBe(false);
        expect(worksheetPermission.canViewCell(0, 4)).toBe(false);
        expect(worksheetPermission.canViewCell(5, 5)).toBe(true);

        const budgetRules = await worksheetPermission.protectRanges([
            {
                ranges: [worksheet.getRange('A5:B6')],
                options: { name: 'Budget input' },
            },
            {
                ranges: [worksheet.getRange('D5:D6')],
                options: { name: 'Approval input', allowViewByOthers: true },
            },
        ]);

        expect(budgetRules.map((rule) => rule.options.name)).toEqual(['Budget input', 'Approval input']);
        expect((await worksheetPermission.listRangeProtectionRules({ ignoreCollaborators: true })).map((rule) => rule.options.name)).toEqual([
            'Forecast totals',
            'Budget input',
            'Approval input',
        ]);

        const debugBudgetCell = await worksheetPermission.debugCellPermission(4, 0);
        expect(debugBudgetCell?.options.name).toBe('Budget input');
        expect(await worksheetPermission.debugCellPermission(9, 9)).toBeUndefined();

        await expect(worksheetPermission.protectRanges([
            {
                ranges: [worksheet.getRange('A6:C7')],
                options: { name: 'Overlapping budget' },
            },
        ])).rejects.toThrow('The specified ranges overlap with existing protected ranges: A6:C7');

        expect(await worksheetPermission.unprotectRules(budgetRules.map((rule) => rule.id))).toBe(true);
        expect((await worksheetPermission.listRangeProtectionRules({ ignoreCollaborators: true })).map((rule) => rule.options.name)).toEqual(['Forecast totals']);
        expect(await worksheetPermission.unprotectRules([])).toBe(true);

        expect(await worksheetPermission.unprotect()).toBe(true);
        expect(worksheetPermission.isProtected()).toBe(false);
    });

    it('reports a failed range unprotect when the delete mutation cannot run', async () => {
        const { univerAPI, get } = testBed;
        const worksheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const rangePermission = worksheet.getRange('G1:G2').getRangePermission();

        await rangePermission.protect({ name: 'Locked scenario cells' });
        get(ICommandService).unregisterCommand(DeleteRangeProtectionMutation.id);

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        await expect(rangePermission.unprotect()).rejects.toThrow('is not registered');
        consoleErrorSpy.mockRestore();
        expect(rangePermission.isProtected()).toBe(true);
    });
});
