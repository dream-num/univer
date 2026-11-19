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

import type { IMutationInfo } from '@univerjs/core';
import {
    IAuthzIoService,
    ICommandService,
    IPermissionService,
    IUndoRedoService,
    RedoCommand,
    UndoCommand,
} from '@univerjs/core';
import { UnitAction, UnitObject } from '@univerjs/protocol';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCommandTestBed } from '../../../commands/commands/__tests__/create-command-test-bed';
import { AddRangeProtectionCommand } from '../../../commands/commands/add-range-protection.command';
import { AddWorksheetProtectionCommand } from '../../../commands/commands/add-worksheet-protection.command';
import { SetProtectionCommand } from '../../../commands/commands/set-protection.command';
import { SetRangeValuesCommand } from '../../../commands/commands/set-range-values.command';
import { AddRangeProtectionMutation } from '../../../commands/mutations/add-range-protection.mutation';
import { AddWorksheetProtectionMutation } from '../../../commands/mutations/add-worksheet-protection.mutation';
import { DeleteRangeProtectionMutation } from '../../../commands/mutations/delete-range-protection.mutation';
import { DeleteWorksheetProtectionMutation } from '../../../commands/mutations/delete-worksheet-protection.mutation';
import { SetRangeValuesMutation } from '../../../commands/mutations/set-range-values.mutation';
import { SetWorksheetPermissionPointsMutation } from '../../../commands/mutations/set-worksheet-permission-points.mutation';
import { SetSelectionsOperation } from '../../../commands/operations/selection.operation';
import { EditStateEnum, RangeProtectionRuleModel, ViewStateEnum } from '../../../models/range-protection-rule.model';
import { RangeProtectionPermissionEditPoint } from '../../../services/permission/permission-point/range/edit';
import { WorksheetEditPermission } from '../../../services/permission/permission-point/worksheet/edit';
import { WorksheetProtectionRuleModel } from '../../../services/permission/worksheet-permission/worksheet-permission-rule.model';
import { SheetPermissionInitController } from '../sheet-permission-init.controller';

const rangeRule = {
    id: 'protected-range',
    unitId: 'test',
    subUnitId: 'sheet1',
    permissionId: 'range-permission',
    unitType: UnitObject.SelectRange,
    ranges: [{ startRow: 2, endRow: 3, startColumn: 0, endColumn: 1 }],
    viewState: ViewStateEnum.OthersCanView,
    editState: EditStateEnum.OnlyMe,
};
const worksheetRule = { ...rangeRule, permissionId: 'sheet-permission', unitType: UnitObject.Worksheet };
const protectionMutations: IMutationInfo[] = [
    { id: AddRangeProtectionMutation.id, params: { unitId: 'test', subUnitId: 'sheet1', rules: [rangeRule] } },
    { id: AddWorksheetProtectionMutation.id, params: { unitId: 'test', subUnitId: 'sheet1', rule: worksheetRule } },
    {
        id: SetWorksheetPermissionPointsMutation.id,
        params: { unitId: 'test', subUnitId: 'sheet1', rule: worksheetRule },
    },
];

describe('protection history boundary', () => {
    const disposables: Array<{ dispose(): void }> = [];

    afterEach(() => {
        disposables.splice(0).forEach((disposable) => disposable.dispose());
    });

    function createTestBed() {
        const bed = createCommandTestBed(undefined, [[SheetPermissionInitController]]);
        disposables.push(bed.univer);
        const commands = bed.get(ICommandService);
        [
            AddRangeProtectionCommand,
            AddWorksheetProtectionCommand,
            SetProtectionCommand,
            AddRangeProtectionMutation,
            AddWorksheetProtectionMutation,
            SetWorksheetPermissionPointsMutation,
            DeleteRangeProtectionMutation,
            DeleteWorksheetProtectionMutation,
            SetRangeValuesMutation,
            SetRangeValuesCommand,
            SetSelectionsOperation,
        ].forEach((command) => commands.registerCommand(command));
        bed.get(SheetPermissionInitController);
        const history = bed.get(IUndoRedoService);
        const edit = (value: string) => commands.syncExecuteCommand(SetRangeValuesCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            value: { v: value },
        });
        edit('first');
        edit('second');
        expect(commands.syncExecuteCommand(UndoCommand.id)).toBe(true);
        expect(history.getUndoRedoStatus('test')).toEqual({ undos: 1, redos: 1 });
        return { ...bed, commands, history, edit };
    }

    describe.each([false, true])('fromCollab: %s', (fromCollab) => {
        it.each(protectionMutations)('clears both histories when $id takes effect', ({ id, params }) => {
            const { commands, history, sheet } = createTestBed();
            history.pushUndoRedo({ unitID: 'other-book', undoMutations: [], redoMutations: [] });
            expect(commands.syncExecuteCommand(id, { ...params }, { fromCollab })).toBe(true);
            expect(history.getUndoRedoStatus('test')).toEqual({ undos: 0, redos: 0 });
            expect(history.getUndoRedoStatus('other-book')).toEqual({ undos: 1, redos: 0 });
            expect(commands.syncExecuteCommand(UndoCommand.id)).toBe(false);
            expect(commands.syncExecuteCommand(RedoCommand.id)).toBe(false);
            expect(sheet.getSheetBySheetId('sheet1')!.getCell(0, 0)?.v).toBe('first');
        });
    });

    it.each([
        { id: AddRangeProtectionCommand.id, params: { rule: rangeRule, permissionId: rangeRule.permissionId } },
        { id: AddWorksheetProtectionCommand.id, params: { unitId: 'test', rule: worksheetRule } },
        { id: SetProtectionCommand.id, params: { rule: { ...rangeRule } } },
        { id: SetProtectionCommand.id, params: { rule: { ...rangeRule }, oldRule: worksheetRule } },
        { id: SetProtectionCommand.id, params: { rule: worksheetRule, oldRule: rangeRule } },
    ])('does not push newly applied protection back into history via $id', async ({ id, params }) => {
        const { commands, history } = createTestBed();
        await expect(commands.executeCommand(id, params)).resolves.toBe(true);
        expect(history.getUndoRedoStatus('test')).toEqual({ undos: 0, redos: 0 });
    });

    it('allows subsequent edits to build a new undo/redo history', () => {
        const { commands, history, edit, sheet } = createTestBed();
        commands.syncExecuteCommand(AddRangeProtectionMutation.id, { ...protectionMutations[0].params });
        expect(edit('after protection')).toBe(true);
        expect(history.getUndoRedoStatus('test')).toEqual({ undos: 1, redos: 0 });
        expect(commands.syncExecuteCommand(UndoCommand.id)).toBe(true);
        expect(sheet.getSheetBySheetId('sheet1')!.getCell(0, 0)?.v).toBe('first');
        expect(commands.syncExecuteCommand(RedoCommand.id)).toBe(true);
        expect(sheet.getSheetBySheetId('sheet1')!.getCell(0, 0)?.v).toBe('after protection');
    });

    it('does not clear history for an empty protection batch or rejected command', async () => {
        const { commands, history } = createTestBed();
        commands.syncExecuteCommand(AddRangeProtectionMutation.id, { unitId: 'test', subUnitId: 'sheet1', rules: [] });
        await expect(commands.executeCommand(AddRangeProtectionCommand.id)).resolves.toBe(false);
        expect(history.getUndoRedoStatus('test')).toEqual({ undos: 1, redos: 1 });
    });

    it('preserves undo/redo when restoring an existing protection range', () => {
        const { commands, history, get } = createTestBed();
        commands.syncExecuteCommand(AddRangeProtectionMutation.id, { ...protectionMutations[0].params });
        commands.syncExecuteCommand(DeleteRangeProtectionMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            ruleIds: [rangeRule.id],
        });
        history.pushUndoRedo({
            unitID: 'test',
            undoMutations: [{ ...protectionMutations[0], params: { ...protectionMutations[0].params } }],
            redoMutations: [{
                id: DeleteRangeProtectionMutation.id,
                params: { unitId: 'test', subUnitId: 'sheet1', ruleIds: [rangeRule.id] },
            }],
        });
        expect(commands.syncExecuteCommand(UndoCommand.id)).toBe(true);
        expect(get(RangeProtectionRuleModel).getRule('test', 'sheet1', rangeRule.id)).toEqual(rangeRule);
        expect(history.getUndoRedoStatus('test')).toEqual({ undos: 0, redos: 1 });
        expect(commands.syncExecuteCommand(RedoCommand.id)).toBe(true);
        expect(get(RangeProtectionRuleModel).getRule('test', 'sheet1', rangeRule.id)).toBeUndefined();
        expect(history.getUndoRedoStatus('test')).toEqual({ undos: 1, redos: 0 });
    });

    it('does not clear history when worksheet protection is removed', () => {
        const { commands, history, get, edit } = createTestBed();
        commands.syncExecuteCommand(AddWorksheetProtectionMutation.id, { ...protectionMutations[1].params });
        edit('allowed edit');
        commands.syncExecuteCommand(DeleteWorksheetProtectionMutation.id, { unitId: 'test', subUnitId: 'sheet1' });
        expect(get(WorksheetProtectionRuleModel).getRule('test', 'sheet1')).toBeUndefined();
        expect(history.getUndoRedoStatus('test')).toEqual({ undos: 1, redos: 0 });
    });

    describe.each([false, true])('existing protection permission changed: %s', (changed) => {
        it.each([rangeRule, worksheetRule])('handles the refreshed permissions for $permissionId', async (rule) => {
            const { commands, history, get, edit } = createTestBed();
            const isRange = rule.unitType === UnitObject.SelectRange;
            commands.syncExecuteCommand(
                isRange ? AddRangeProtectionMutation.id : AddWorksheetProtectionMutation.id,
                { unitId: 'test', subUnitId: 'sheet1', rule, rules: [rule] }
            );
            const point = isRange
                ? new RangeProtectionPermissionEditPoint('test', 'sheet1', rule.permissionId)
                : new WorksheetEditPermission('test', 'sheet1');
            const permissions = get(IPermissionService);
            permissions.addPermissionPoint(point);
            permissions.updatePermissionPoint(point.id, true);
            edit('before permission refresh');
            edit('pending redo');
            commands.syncExecuteCommand(UndoCommand.id);
            const authz = vi.spyOn(get(IAuthzIoService), 'allowed').mockResolvedValue([
                { action: UnitAction.Edit, allowed: !changed },
            ]);
            try {
                get(SheetPermissionInitController).refreshPermission('test', rule.permissionId);
                await Promise.resolve();
                expect(permissions.getPermissionPoint(point.id)?.value).toBe(!changed);
                expect(history.getUndoRedoStatus('test')).toEqual({
                    undos: changed ? 0 : 1,
                    redos: changed ? 0 : 1,
                });
            } finally {
                authz.mockRestore();
            }
        });
    });
});
