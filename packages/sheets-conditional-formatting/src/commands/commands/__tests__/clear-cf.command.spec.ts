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

import type { IAccessor } from '@univerjs/core';
import { ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import { getSheetCommandTarget, SheetsSelectionsService } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { ConditionalFormattingRuleModel } from '../../../models/conditional-formatting-rule-model';
import { DeleteConditionalRuleMutation } from '../../mutations/delete-conditional-rule.mutation';
import { SetConditionalRuleMutation } from '../../mutations/set-conditional-rule.mutation';
import { ClearRangeCfCommand } from '../clear-range-cf.command';
import { ClearWorksheetCfCommand } from '../clear-worksheet-cf.command';

vi.mock('@univerjs/sheets', async (importActual) => {
    const actual = await importActual<typeof import('@univerjs/sheets')>();

    return {
        ...actual,
        getSheetCommandTarget: vi.fn(),
    };
});

const mockedGetSheetCommandTarget = vi.mocked(getSheetCommandTarget);

function createRuleModel() {
    const ruleModel = new ConditionalFormattingRuleModel();

    ruleModel.addRule('unit-1', 'sheet-1', {
        cfId: 'rule-keep',
        ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 2 }],
        stopIfTrue: false,
        rule: {
            type: 'highlightCell',
            subType: 'text',
            operator: 'containsText',
            style: {},
            value: 'todo',
        },
    } as never);

    ruleModel.addRule('unit-1', 'sheet-1', {
        cfId: 'rule-delete',
        ranges: [{ startRow: 0, endRow: 0, startColumn: 2, endColumn: 2 }],
        stopIfTrue: false,
        rule: {
            type: 'highlightCell',
            subType: 'text',
            operator: 'containsText',
            style: {},
            value: 'todo',
        },
    } as never);

    return ruleModel;
}

function createAccessor(ruleModel: ConditionalFormattingRuleModel) {
    const commandService = {
        syncExecuteCommand: vi.fn(() => true),
    };
    const undoRedoService = {
        pushUndoRedo: vi.fn(),
    };
    const selectionManagerService = {
        getCurrentSelections: vi.fn(() => [{
            range: { startRow: 0, endRow: 0, startColumn: 2, endColumn: 2 },
        }]),
    };
    const univerInstanceService = {};

    const accessor = {
        get(token: unknown) {
            if (token === ConditionalFormattingRuleModel) {
                return ruleModel;
            }

            if (token === ICommandService) {
                return commandService;
            }

            if (token === IUndoRedoService) {
                return undoRedoService;
            }

            if (token === SheetsSelectionsService) {
                return selectionManagerService;
            }

            if (token === IUniverInstanceService) {
                return univerInstanceService;
            }

            throw new Error(`Unknown dependency: ${String(token)}`);
        },
    } as IAccessor;

    return {
        accessor,
        commandService,
        undoRedoService,
        selectionManagerService,
    };
}

describe('clear conditional formatting commands', () => {
    it('clears the selected range, updates overlapping rules, and records undo/redo', () => {
        mockedGetSheetCommandTarget.mockReturnValue({ unitId: 'unit-1', subUnitId: 'sheet-1' } as never);

        const ruleModel = createRuleModel();
        const { accessor, commandService, undoRedoService } = createAccessor(ruleModel);

        expect(ClearRangeCfCommand.handler(accessor, { ranges: [{ startRow: 0, endRow: 0, startColumn: 2, endColumn: 2 }] })).toBe(true);

        expect(commandService.syncExecuteCommand).toHaveBeenCalledTimes(2);
        expect(commandService.syncExecuteCommand).toHaveBeenNthCalledWith(1, DeleteConditionalRuleMutation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            cfId: 'rule-delete',
        }, undefined);
        expect(commandService.syncExecuteCommand).toHaveBeenNthCalledWith(2, SetConditionalRuleMutation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            rule: {
                cfId: 'rule-keep',
                ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 }],
                stopIfTrue: false,
                rule: {
                    type: 'highlightCell',
                    subType: 'text',
                    operator: 'containsText',
                    style: {},
                    value: 'todo',
                },
            },
        }, undefined);
        expect(undoRedoService.pushUndoRedo).toHaveBeenCalledWith(expect.objectContaining({
            unitID: 'unit-1',
            redoMutations: expect.arrayContaining([
                expect.objectContaining({ id: DeleteConditionalRuleMutation.id }),
                expect.objectContaining({ id: SetConditionalRuleMutation.id }),
            ]),
        }));
    });

    it('clears every rule on the worksheet and records one delete per rule', () => {
        mockedGetSheetCommandTarget.mockReturnValue({ unitId: 'unit-1', subUnitId: 'sheet-1' } as never);

        const ruleModel = createRuleModel();
        const { accessor, commandService, undoRedoService } = createAccessor(ruleModel);

        expect(ClearWorksheetCfCommand.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1' })).toBe(true);
        expect(commandService.syncExecuteCommand).toHaveBeenNthCalledWith(1, DeleteConditionalRuleMutation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            cfId: 'rule-delete',
        }, undefined);
        expect(commandService.syncExecuteCommand).toHaveBeenNthCalledWith(2, DeleteConditionalRuleMutation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            cfId: 'rule-keep',
        }, undefined);
        expect(undoRedoService.pushUndoRedo).toHaveBeenCalledWith(expect.objectContaining({
            unitID: 'unit-1',
            redoMutations: [
                { id: DeleteConditionalRuleMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', cfId: 'rule-delete' } },
                { id: DeleteConditionalRuleMutation.id, params: { unitId: 'unit-1', subUnitId: 'sheet-1', cfId: 'rule-keep' } },
            ],
        }));
    });

    it('returns false when the target, selection, or rules are missing', () => {
        const ruleModel = new ConditionalFormattingRuleModel();
        const { accessor, commandService, selectionManagerService } = createAccessor(ruleModel);

        mockedGetSheetCommandTarget.mockReturnValue(null as never);
        expect(ClearRangeCfCommand.handler(accessor, { ranges: [] })).toBe(false);
        expect(ClearWorksheetCfCommand.handler(accessor, { unitId: 'unit-1', subUnitId: 'sheet-1' })).toBe(false);

        mockedGetSheetCommandTarget.mockReturnValue({ unitId: 'unit-1', subUnitId: 'sheet-1' } as never);
        selectionManagerService.getCurrentSelections.mockReturnValue([]);
        expect(ClearRangeCfCommand.handler(accessor, { ranges: [] })).toBe(false);
        expect(commandService.syncExecuteCommand).not.toHaveBeenCalled();
    });
});
