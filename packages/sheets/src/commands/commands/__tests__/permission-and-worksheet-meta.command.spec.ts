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
import type { IRangeProtectionRule } from '../../../models/range-protection-rule.model';
import type { IWorksheetProtectionRule } from '../../../services/permission/type';
import { BooleanNumber, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import { UnitObject } from '@univerjs/protocol';
import { describe, expect, it } from 'vitest';
import { EditStateEnum, RangeProtectionRuleModel, ViewStateEnum } from '../../../models/range-protection-rule.model';
import { AddRangeProtectionMutation } from '../../mutations/add-range-protection.mutation';
import { AddWorksheetProtectionMutation } from '../../mutations/add-worksheet-protection.mutation';
import { DeleteRangeProtectionMutation } from '../../mutations/delete-range-protection.mutation';
import { DeleteWorksheetProtectionMutation } from '../../mutations/delete-worksheet-protection.mutation';
import { SetRangeProtectionMutation } from '../../mutations/set-range-protection.mutation';
import { SetWorksheetColumnCountMutation } from '../../mutations/set-worksheet-column-count.mutation';
import { SetWorksheetHideMutation } from '../../mutations/set-worksheet-hide.mutation';
import { SetWorksheetPermissionPointsMutation } from '../../mutations/set-worksheet-permission-points.mutation';
import { SetWorksheetProtectionMutation } from '../../mutations/set-worksheet-protection.mutation';
import { SetWorksheetRightToLeftMutation } from '../../mutations/set-worksheet-right-to-left.mutation';
import { SetWorksheetRowCountMutation } from '../../mutations/set-worksheet-row-count.mutation';
import { SetWorksheetActiveOperation } from '../../operations/set-worksheet-active.operation';
import { AddRangeProtectionCommand } from '../add-range-protection.command';
import { AddWorksheetProtectionCommand } from '../add-worksheet-protection.command';
import { DeleteRangeProtectionCommand } from '../delete-range-protection.command';
import { DeleteWorksheetProtectionCommand } from '../delete-worksheet-protection.command';
import { SetProtectionCommand } from '../set-protection.command';
import { SetWorksheetColumnCountCommand } from '../set-worksheet-column-count.command';
import { SetWorksheetPermissionPointsCommand } from '../set-worksheet-permission-points.command';
import { SetWorksheetProtectionCommand } from '../set-worksheet-protection.command';
import { SetWorksheetRightToLeftCommand } from '../set-worksheet-right-to-left.command';
import { SetWorksheetRowCountCommand } from '../set-worksheet-row-count.command';
import { SetWorksheetShowCommand } from '../set-worksheet-show.command';

function createAccessor(records: Map<unknown, unknown>): IAccessor {
    return {
        get: (token: unknown) => records.get(token) as never,
        has: (token: unknown) => records.has(token),
    } as IAccessor;
}

function createCommandService(results: Record<string, boolean> = {}) {
    const calls: Array<{ id: string; params: unknown; async: boolean }> = [];
    return {
        calls,
        executeCommand: async (id: string, params: unknown) => {
            calls.push({ id, params, async: true });
            return results[id] ?? true;
        },
        syncExecuteCommand: (id: string, params: unknown) => {
            calls.push({ id, params, async: false });
            return results[id] ?? true;
        },
    };
}

function createUndoRedoService() {
    const records: unknown[] = [];
    return {
        records,
        pushUndoRedo: (record: unknown) => records.push(record),
    };
}

function createRangeRule(id: string, range: IRange = { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }): IRangeProtectionRule {
    return {
        id,
        permissionId: `permission-${id}`,
        ranges: [range],
        unitId: 'unit-1',
        subUnitId: 'sheet-1',
        unitType: UnitObject.SelectRange,
        viewState: ViewStateEnum.OthersCanView,
        editState: EditStateEnum.OnlyMe,
        description: 'financial input cells',
    };
}

function createWorksheetRule(permissionId = 'permission-sheet-1'): IWorksheetProtectionRule {
    return {
        permissionId,
        unitType: UnitObject.Worksheet,
        unitId: 'unit-1',
        subUnitId: 'sheet-1',
        viewState: ViewStateEnum.OthersCanView,
        editState: EditStateEnum.OnlyMe,
    };
}

function createWorkbookTarget() {
    const config = { hidden: BooleanNumber.TRUE, rightToLeft: BooleanNumber.FALSE };
    const worksheet = {
        rowCount: 100,
        columnCount: 20,
        config,
        getSheetId: () => 'sheet-1',
        getConfig: () => config,
        isSheetHidden: () => config.hidden,
        getRowCount() { return this.rowCount; },
        getColumnCount() { return this.columnCount; },
    };
    const workbook = {
        getUnitId: () => 'unit-1',
        getSheetBySheetId: (subUnitId: string) => subUnitId === 'sheet-1' ? worksheet : null,
        getActiveSheet: () => worksheet,
    };
    const univerInstanceService = {
        getUnit: (unitId: string) => unitId === 'unit-1' ? workbook : null,
        getCurrentUnitOfType: () => workbook,
        getUniverSheetInstance: (unitId: string) => unitId === 'unit-1' ? workbook : null,
    };
    return { worksheet, workbook, univerInstanceService };
}

describe('range protection commands', () => {
    it('adds a range protection rule and records undo/redo mutations when the mutation succeeds', async () => {
        const commandService = createCommandService();
        const undoRedoService = createUndoRedoService();
        const ruleModel = new RangeProtectionRuleModel();
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, commandService],
            [IUndoRedoService, undoRedoService],
            [RangeProtectionRuleModel, ruleModel],
        ]));
        const sourceRule = createRangeRule('source-rule');

        await expect(AddRangeProtectionCommand.handler(accessor, { permissionId: 'permission-new', rule: sourceRule })).resolves.toBe(true);

        const addCall = commandService.calls[0];
        expect(addCall.id).toBe(AddRangeProtectionMutation.id);
        expect(addCall.params).toMatchObject({ unitId: 'unit-1', subUnitId: 'sheet-1' });
        expect((addCall.params as { rules: IRangeProtectionRule[] }).rules[0]).toMatchObject({
            ranges: sourceRule.ranges,
            permissionId: 'permission-new',
            description: sourceRule.description,
            unitType: sourceRule.unitType,
            unitId: sourceRule.unitId,
            subUnitId: sourceRule.subUnitId,
            viewState: sourceRule.viewState,
            editState: sourceRule.editState,
        });
        expect(undoRedoService.records).toHaveLength(1);
        expect(undoRedoService.records[0]).toMatchObject({
            unitID: 'unit-1',
            redoMutations: [{ id: AddRangeProtectionMutation.id }],
            undoMutations: [{ id: DeleteRangeProtectionMutation.id }],
        });

        await expect(AddRangeProtectionCommand.handler(accessor, undefined as never)).resolves.toBe(false);
    });

    it('does not record undo when adding range protection fails', async () => {
        const commandService = createCommandService({ [AddRangeProtectionMutation.id]: false });
        const undoRedoService = createUndoRedoService();
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, commandService],
            [IUndoRedoService, undoRedoService],
            [RangeProtectionRuleModel, new RangeProtectionRuleModel()],
        ]));

        await expect(AddRangeProtectionCommand.handler(accessor, { permissionId: 'permission-new', rule: createRangeRule('source-rule') })).resolves.toBe(true);
        expect(undoRedoService.records).toEqual([]);
    });

    it('deletes a range protection rule and keeps the deleted rule for undo', async () => {
        const commandService = createCommandService();
        const undoRedoService = createUndoRedoService();
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, commandService],
            [IUndoRedoService, undoRedoService],
        ]));
        const rule = createRangeRule('rule-1');

        await expect(DeleteRangeProtectionCommand.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', rule })).resolves.toBe(true);
        expect(commandService.calls).toEqual([{ id: DeleteRangeProtectionMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', ruleIds: ['rule-1'] }, async: true }]);
        expect(undoRedoService.records[0]).toMatchObject({
            unitID: 'unit-1',
            redoMutations: [{ id: DeleteRangeProtectionMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', ruleIds: ['rule-1'] } }],
            undoMutations: [{ id: AddRangeProtectionMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', rules: [rule] } }],
        });
        await expect(DeleteRangeProtectionCommand.handler(accessor, undefined as never)).resolves.toBe(false);
    });
});

describe('worksheet protection commands', () => {
    it('adds, deletes, and updates worksheet protection through command mutations', async () => {
        const commandService = createCommandService();
        const undoRedoService = createUndoRedoService();
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, commandService],
            [IUndoRedoService, undoRedoService],
        ]));
        const rule = createWorksheetRule('permission-new');
        const oldRule = createWorksheetRule('permission-old');

        await expect(AddWorksheetProtectionCommand.handler(accessor, { unitId: 'unit-1', rule })).resolves.toBe(true);
        expect(commandService.calls[0]).toEqual({
            id: AddWorksheetProtectionMutation.id,
            params: { unitId: 'unit-1', rule, subUnitId: 'sheet-1' },
            async: true,
        });

        expect(DeleteWorksheetProtectionCommand.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', rule })).toBe(true);
        expect(commandService.calls[1]).toEqual({
            id: DeleteWorksheetProtectionMutation.id,
            params: { unitId: 'unit-1', subUnitId: 'sheet-1' },
            async: true,
        });

        await expect(SetWorksheetProtectionCommand.handler(accessor, { permissionId: 'permission-updated', rule, oldRule })).resolves.toBe(true);
        expect(commandService.calls[2]).toEqual({
            id: SetWorksheetProtectionMutation.id,
            params: { unitId: 'unit-1', subUnitId: 'sheet-1', newRule: { ...rule, permissionId: 'permission-updated' } },
            async: true,
        });
        expect(undoRedoService.records).toHaveLength(3);

        await expect(AddWorksheetProtectionCommand.handler(accessor, undefined as never)).resolves.toBe(false);
        expect(DeleteWorksheetProtectionCommand.handler(accessor, undefined as never)).toBe(false);
        await expect(SetWorksheetProtectionCommand.handler(accessor, undefined as never)).resolves.toBe(false);
    });

    it('does not record undo when worksheet protection add or set mutations fail', async () => {
        const commandService = createCommandService({
            [AddWorksheetProtectionMutation.id]: false,
            [SetWorksheetProtectionMutation.id]: false,
        });
        const undoRedoService = createUndoRedoService();
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, commandService],
            [IUndoRedoService, undoRedoService],
        ]));
        const rule = createWorksheetRule('permission-new');

        await expect(AddWorksheetProtectionCommand.handler(accessor, { unitId: 'unit-1', rule })).resolves.toBe(true);
        await expect(SetWorksheetProtectionCommand.handler(accessor, { permissionId: 'permission-updated', rule, oldRule: createWorksheetRule('permission-old') })).resolves.toBe(true);
        expect(undoRedoService.records).toEqual([]);
    });

    it('sets worksheet point permissions with the target unit and sheet ids', async () => {
        const commandService = createCommandService();
        const accessor = createAccessor(new Map<unknown, unknown>([[ICommandService, commandService]]));
        const rule = { unitId: 'unit-1', subUnitId: 'sheet-1', permissionId: 'permission-point-1' };

        await expect(SetWorksheetPermissionPointsCommand.handler(accessor, { rule })).resolves.toBe(true);
        expect(commandService.calls).toEqual([{ id: SetWorksheetPermissionPointsMutation.id, params: { rule, unitId: 'unit-1', subUnitId: 'sheet-1' }, async: true }]);
        await expect(SetWorksheetPermissionPointsCommand.handler(accessor, undefined as never)).resolves.toBe(false);
    });
});

describe('mixed protection command', () => {
    it('updates a range protection rule in place and records the previous rule for undo', async () => {
        const commandService = createCommandService();
        const undoRedoService = createUndoRedoService();
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, commandService],
            [IUndoRedoService, undoRedoService],
            [RangeProtectionRuleModel, new RangeProtectionRuleModel()],
        ]));
        const oldRule = createRangeRule('rule-1', { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 });
        const rule = {
            ...oldRule,
            ranges: [{ startRow: 2, endRow: 3, startColumn: 1, endColumn: 2 }],
            description: 'approved input cells',
        };

        await expect(SetProtectionCommand.handler(accessor, { rule, oldRule } as never)).resolves.toBe(true);

        expect(commandService.calls).toEqual([{
            id: SetRangeProtectionMutation.id,
            params: { unitId: 'unit-1', subUnitId: 'sheet-1', rule, ruleId: 'rule-1' },
            async: false,
        }]);
        expect(undoRedoService.records[0]).toMatchObject({
            unitID: 'unit-1',
            undoMutations: [{ id: SetRangeProtectionMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', ruleId: 'rule-1', rule: oldRule } }],
            redoMutations: [{ id: SetRangeProtectionMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', rule, ruleId: 'rule-1' } }],
        });
    });

    it('updates a worksheet protection rule in place and records the previous rule for undo', async () => {
        const commandService = createCommandService();
        const undoRedoService = createUndoRedoService();
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, commandService],
            [IUndoRedoService, undoRedoService],
            [RangeProtectionRuleModel, new RangeProtectionRuleModel()],
        ]));
        const oldRule = createWorksheetRule('worksheet-permission-old');
        const rule = { ...oldRule, permissionId: 'worksheet-permission-new' };

        await expect(SetProtectionCommand.handler(accessor, { rule, oldRule } as never)).resolves.toBe(true);

        expect(commandService.calls).toEqual([{
            id: SetWorksheetProtectionMutation.id,
            params: { unitId: 'unit-1', subUnitId: 'sheet-1', rule },
            async: false,
        }]);
        expect(undoRedoService.records[0]).toMatchObject({
            unitID: 'unit-1',
            undoMutations: [{ id: SetWorksheetProtectionMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', rule: oldRule } }],
            redoMutations: [{ id: SetWorksheetProtectionMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', rule } }],
        });
    });

    it('switches worksheet protection to range protection with reversible mutations', async () => {
        const commandService = createCommandService();
        const undoRedoService = createUndoRedoService();
        const ruleModel = new RangeProtectionRuleModel();
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, commandService],
            [IUndoRedoService, undoRedoService],
            [RangeProtectionRuleModel, ruleModel],
        ]));
        const oldRule = createWorksheetRule('worksheet-permission');
        const rule = createRangeRule('', { startRow: 4, endRow: 4, startColumn: 2, endColumn: 2 });

        await expect(SetProtectionCommand.handler(accessor, { rule, oldRule } as never)).resolves.toBe(true);

        expect(commandService.calls[0]).toMatchObject({
            id: DeleteWorksheetProtectionMutation.id,
            params: { unitId: 'unit-1', subUnitId: 'sheet-1' },
        });
        expect(commandService.calls[1]).toMatchObject({
            id: AddRangeProtectionMutation.id,
            params: { unitId: 'unit-1', subUnitId: 'sheet-1', rules: [rule] },
        });
        expect(rule.id).not.toBe('');
        expect(undoRedoService.records[0]).toMatchObject({
            unitID: 'unit-1',
            undoMutations: [
                { id: DeleteRangeProtectionMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', ruleIds: [rule.id] } },
                { id: AddWorksheetProtectionMutation.id, params: { unitId: 'unit-1', rule: oldRule, subUnitId: 'sheet-1' } },
            ],
            redoMutations: [
                { id: DeleteWorksheetProtectionMutation.id },
                { id: AddRangeProtectionMutation.id },
            ],
        });

        await expect(SetProtectionCommand.handler(accessor, undefined as never)).resolves.toBe(false);
    });

    it('switches range protection to worksheet protection with reversible mutations', async () => {
        const commandService = createCommandService();
        const undoRedoService = createUndoRedoService();
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, commandService],
            [IUndoRedoService, undoRedoService],
            [RangeProtectionRuleModel, new RangeProtectionRuleModel()],
        ]));
        const oldRule = createRangeRule('range-permission');
        const rule = createWorksheetRule('worksheet-permission');

        await expect(SetProtectionCommand.handler(accessor, { rule, oldRule } as never)).resolves.toBe(true);

        expect(commandService.calls).toEqual([
            {
                id: DeleteRangeProtectionMutation.id,
                params: { unitId: 'unit-1', subUnitId: 'sheet-1', ruleIds: ['range-permission'] },
                async: false,
            },
            {
                id: AddWorksheetProtectionMutation.id,
                params: { unitId: 'unit-1', rule, subUnitId: 'sheet-1' },
                async: false,
            },
        ]);
        expect(undoRedoService.records[0]).toMatchObject({
            unitID: 'unit-1',
            undoMutations: [
                { id: DeleteWorksheetProtectionMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1' } },
                { id: AddRangeProtectionMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', rules: [oldRule] } },
            ],
            redoMutations: [
                { id: DeleteRangeProtectionMutation.id },
                { id: AddWorksheetProtectionMutation.id },
            ],
        });
    });

    it('does not create an undo item when protection update mutations fail', async () => {
        const commandService = createCommandService({ [SetRangeProtectionMutation.id]: false });
        const undoRedoService = createUndoRedoService();
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, commandService],
            [IUndoRedoService, undoRedoService],
            [RangeProtectionRuleModel, new RangeProtectionRuleModel()],
        ]));
        const oldRule = createRangeRule('rule-1');
        const rule = { ...oldRule, description: 'changed description' };

        await expect(SetProtectionCommand.handler(accessor, { rule, oldRule } as never)).resolves.toBe(true);

        expect(undoRedoService.records).toEqual([]);
    });
});

describe('worksheet row, column, rtl and show commands', () => {
    it('sets row and column counts and records previous dimensions for undo', () => {
        const commandService = createCommandService();
        const undoRedoService = createUndoRedoService();
        const { univerInstanceService } = createWorkbookTarget();
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, commandService],
            [IUndoRedoService, undoRedoService],
            [IUniverInstanceService, univerInstanceService],
        ]));

        expect(SetWorksheetRowCountCommand.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', rowCount: 120 })).toBe(true);
        expect(SetWorksheetColumnCountCommand.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', columnCount: 40 })).toBe(true);
        expect(commandService.calls).toEqual([
            { id: SetWorksheetRowCountMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', rowCount: 120 }, async: false },
            { id: SetWorksheetColumnCountMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', columnCount: 40 }, async: false },
        ]);
        expect(undoRedoService.records).toMatchObject([
            {
                unitID: 'unit-1',
                undoMutations: [{ id: SetWorksheetRowCountMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', rowCount: 100 } }],
                redoMutations: [{ id: SetWorksheetRowCountMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', rowCount: 120 } }],
            },
            {
                unitID: 'unit-1',
                undoMutations: [{ id: SetWorksheetColumnCountMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', columnCount: 20 } }],
                redoMutations: [{ id: SetWorksheetColumnCountMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', columnCount: 40 } }],
            },
        ]);
    });

    it('returns false when worksheet count mutations cannot target or apply the sheet', () => {
        const { univerInstanceService } = createWorkbookTarget();
        const falseCommandService = createCommandService({
            [SetWorksheetRowCountMutation.id]: false,
            [SetWorksheetColumnCountMutation.id]: false,
        });
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, falseCommandService],
            [IUndoRedoService, createUndoRedoService()],
            [IUniverInstanceService, univerInstanceService],
        ]));

        expect(SetWorksheetRowCountCommand.handler(accessor, { unitId: 'missing', subUnitId: 'sheet-1', rowCount: 120 })).toBe(false);
        expect(SetWorksheetColumnCountCommand.handler(accessor, { unitId: 'unit-1', subUnitId: 'missing', columnCount: 40 })).toBe(false);
        expect(SetWorksheetRowCountCommand.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', rowCount: 120 })).toBe(false);
        expect(SetWorksheetColumnCountCommand.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', columnCount: 40 })).toBe(false);
    });

    it('sets worksheet right-to-left mode from explicit params or defaults to false', async () => {
        const commandService = createCommandService();
        const undoRedoService = createUndoRedoService();
        const { univerInstanceService } = createWorkbookTarget();
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, commandService],
            [IUndoRedoService, undoRedoService],
            [IUniverInstanceService, univerInstanceService],
        ]));

        await expect(SetWorksheetRightToLeftCommand.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', rightToLeft: BooleanNumber.TRUE })).resolves.toBe(true);
        await expect(SetWorksheetRightToLeftCommand.handler(accessor)).resolves.toBe(true);
        expect(commandService.calls).toEqual([
            { id: SetWorksheetRightToLeftMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', rightToLeft: BooleanNumber.TRUE }, async: false },
            { id: SetWorksheetRightToLeftMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', rightToLeft: BooleanNumber.FALSE }, async: false },
        ]);
        expect(undoRedoService.records).toHaveLength(2);
    });

    it('returns false when worksheet right-to-left cannot target or apply the sheet', async () => {
        const { univerInstanceService } = createWorkbookTarget();
        const accessorWithoutTarget = createAccessor(new Map<unknown, unknown>([
            [ICommandService, createCommandService()],
            [IUndoRedoService, createUndoRedoService()],
            [IUniverInstanceService, { ...univerInstanceService, getUnit: () => null, getCurrentUnitOfType: () => null }],
        ]));
        await expect(SetWorksheetRightToLeftCommand.handler(accessorWithoutTarget, { unitId: 'missing', subUnitId: 'sheet-1', rightToLeft: BooleanNumber.TRUE })).resolves.toBe(false);

        const falseCommandService = createCommandService({ [SetWorksheetRightToLeftMutation.id]: false });
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, falseCommandService],
            [IUndoRedoService, createUndoRedoService()],
            [IUniverInstanceService, univerInstanceService],
        ]));
        await expect(SetWorksheetRightToLeftCommand.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1', rightToLeft: BooleanNumber.TRUE })).resolves.toBe(false);
    });

    it('shows a hidden worksheet, activates it, and records undo for the hide state', () => {
        const commandService = createCommandService();
        const undoRedoService = createUndoRedoService();
        const { univerInstanceService, worksheet } = createWorkbookTarget();
        const accessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, commandService],
            [IUndoRedoService, undoRedoService],
            [IUniverInstanceService, univerInstanceService],
        ]));

        expect(SetWorksheetShowCommand.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1' })).toBe(true);
        expect(commandService.calls).toEqual([
            { id: SetWorksheetHideMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', hidden: BooleanNumber.FALSE }, async: false },
            { id: SetWorksheetActiveOperation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1' }, async: false },
        ]);
        expect(undoRedoService.records[0]).toMatchObject({
            unitID: 'unit-1',
            undoMutations: [{ id: SetWorksheetHideMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', hidden: BooleanNumber.TRUE } }],
            redoMutations: [{ id: SetWorksheetHideMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', hidden: BooleanNumber.FALSE } }],
        });

        worksheet.config.hidden = BooleanNumber.FALSE;
        expect(SetWorksheetShowCommand.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1' })).toBe(false);
    });

    it('does not show a worksheet when targeting, hide mutation, or activation fails', () => {
        const { univerInstanceService } = createWorkbookTarget();
        const noTargetAccessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, createCommandService()],
            [IUndoRedoService, createUndoRedoService()],
            [IUniverInstanceService, { ...univerInstanceService, getUnit: () => null }],
        ]));
        expect(SetWorksheetShowCommand.handler(noTargetAccessor, { unitId: 'missing', subUnitId: 'sheet-1' })).toBe(false);

        const failedHideAccessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, createCommandService({ [SetWorksheetHideMutation.id]: false })],
            [IUndoRedoService, createUndoRedoService()],
            [IUniverInstanceService, univerInstanceService],
        ]));
        expect(SetWorksheetShowCommand.handler(failedHideAccessor, { unitId: 'unit-1', subUnitId: 'sheet-1' })).toBe(false);

        const failedActiveAccessor = createAccessor(new Map<unknown, unknown>([
            [ICommandService, createCommandService({ [SetWorksheetActiveOperation.id]: false })],
            [IUndoRedoService, createUndoRedoService()],
            [IUniverInstanceService, univerInstanceService],
        ]));
        expect(SetWorksheetShowCommand.handler(failedActiveAccessor, { unitId: 'unit-1', subUnitId: 'sheet-1' })).toBe(false);
    });
});
