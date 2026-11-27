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
import { ICommandService, IUniverInstanceService, LocaleService, LocaleType, RedoCommand, UndoCommand } from '@univerjs/core';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { IAutoFillService } from '../../../services/auto-fill/auto-fill.service';
import { AUTO_FILL_APPLY_TYPE } from '../../../services/auto-fill/type';
import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import { SheetInterceptorService } from '../../../services/sheet-interceptor/sheet-interceptor.service';
import { SetRangeValuesMutation } from '../../mutations/set-range-values.mutation';
import { SetWorksheetNameMutation } from '../../mutations/set-worksheet-name.mutation';
import { SetSelectionsOperation } from '../../operations/selection.operation';
import { AutoClearContentCommand, AutoFillCommand, SheetCopyDownCommand, SheetCopyRightCommand } from '../auto-fill.command';
import { createCommandTestBed } from './create-command-test-bed';

function createAccessor(pairs: Array<[unknown, unknown]>): IAccessor {
    const map = new Map<unknown, unknown>(pairs);

    return {
        get(token: unknown) {
            if (!map.has(token)) {
                throw new Error(`Unknown token: ${String(token)}`);
            }

            return map.get(token);
        },
    } as IAccessor;
}

function createCommandAccessor(range?: { startRow: number; endRow: number; startColumn: number; endColumn: number }, executeResult = true) {
    const executeCommand = vi.fn(async () => executeResult);
    const setShowMenu = vi.fn();
    const worksheet = { getSheetId: () => 'sheet-1' };
    const workbook = {
        getUnitId: () => 'unit-1',
        getActiveSheet: () => worksheet,
    };

    const accessor = createAccessor([
        [SheetsSelectionsService, { getCurrentLastSelection: () => (range ? { range } : null) }],
        [IUniverInstanceService, { getCurrentUnitOfType: () => workbook }],
        [ICommandService, { executeCommand }],
        [IAutoFillService, { setShowMenu }],
    ]);

    return {
        accessor,
        executeCommand,
        setShowMenu,
    };
}

describe('Sheet copy fill commands', () => {
    it('copies down from the row above for a single-row selection', async () => {
        const { accessor, executeCommand, setShowMenu } = createCommandAccessor({
            startRow: 2,
            endRow: 2,
            startColumn: 1,
            endColumn: 3,
        });

        expect(await SheetCopyDownCommand.handler(accessor)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(AutoFillCommand.id, {
            sourceRange: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 3 },
            targetRange: { startRow: 1, endRow: 2, startColumn: 1, endColumn: 3 },
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            applyType: AUTO_FILL_APPLY_TYPE.COPY,
        });
        expect(setShowMenu).toHaveBeenCalledWith(false);
    });

    it('copies down from the first selected row for a multi-row selection', async () => {
        const { accessor, executeCommand } = createCommandAccessor({
            startRow: 1,
            endRow: 4,
            startColumn: 0,
            endColumn: 2,
        });

        expect(await SheetCopyDownCommand.handler(accessor)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(AutoFillCommand.id, {
            sourceRange: { startRow: 1, endRow: 1, startColumn: 0, endColumn: 2 },
            targetRange: { startRow: 1, endRow: 4, startColumn: 0, endColumn: 2 },
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            applyType: AUTO_FILL_APPLY_TYPE.COPY,
        });
    });

    it('copies right from the column to the left for a single-column selection', async () => {
        const { accessor, executeCommand, setShowMenu } = createCommandAccessor({
            startRow: 1,
            endRow: 3,
            startColumn: 2,
            endColumn: 2,
        });

        expect(await SheetCopyRightCommand.handler(accessor)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(AutoFillCommand.id, {
            sourceRange: { startRow: 1, endRow: 3, startColumn: 1, endColumn: 1 },
            targetRange: { startRow: 1, endRow: 3, startColumn: 1, endColumn: 2 },
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            applyType: AUTO_FILL_APPLY_TYPE.COPY,
        });
        expect(setShowMenu).toHaveBeenCalledWith(false);
    });

    it('copies right from the first selected column for a multi-column selection', async () => {
        const { accessor, executeCommand } = createCommandAccessor({
            startRow: 2,
            endRow: 4,
            startColumn: 1,
            endColumn: 3,
        });

        expect(await SheetCopyRightCommand.handler(accessor)).toBe(true);
        expect(executeCommand).toHaveBeenCalledWith(AutoFillCommand.id, {
            sourceRange: { startRow: 2, endRow: 4, startColumn: 1, endColumn: 1 },
            targetRange: { startRow: 2, endRow: 4, startColumn: 1, endColumn: 3 },
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            applyType: AUTO_FILL_APPLY_TYPE.COPY,
        });
    });

    it('returns false for top-row and leftmost-column no-op selections', async () => {
        const topRow = createCommandAccessor({
            startRow: 0,
            endRow: 0,
            startColumn: 1,
            endColumn: 1,
        });
        const leftColumn = createCommandAccessor({
            startRow: 1,
            endRow: 1,
            startColumn: 0,
            endColumn: 0,
        });

        expect(await SheetCopyDownCommand.handler(topRow.accessor)).toBe(false);
        expect(topRow.executeCommand).not.toHaveBeenCalled();
        expect(topRow.setShowMenu).not.toHaveBeenCalled();

        expect(await SheetCopyRightCommand.handler(leftColumn.accessor)).toBe(false);
        expect(leftColumn.executeCommand).not.toHaveBeenCalled();
        expect(leftColumn.setShowMenu).not.toHaveBeenCalled();
    });
});

describe('AutoClearContentCommand', () => {
    it('clears dragged content and restores cells, selection and companion mutations through undo/redo', async () => {
        const { univer, get, sheet } = createCommandTestBed();
        onTestFinished(() => univer.dispose());
        const locale = get(LocaleService);
        locale.load({ [LocaleType.EN_US]: enUS });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        const commands = get(ICommandService);
        for (const command of [AutoClearContentCommand, SetRangeValuesMutation, SetSelectionsOperation, SetWorksheetNameMutation]) {
            commands.registerCommand(command);
        }
        const worksheet = sheet.getActiveSheet()!;
        const target = { unitId: sheet.getUnitId(), subUnitId: worksheet.getSheetId() };
        expect(commands.syncExecuteCommand(SetRangeValuesMutation.id, {
            ...target,
            cellValue: { 2: { 2: { v: 'old' }, 3: { v: 'other' } } },
        })).toBe(true);
        const selections = get(SheetsSelectionsService);
        const oldRange = { startRow: 9, endRow: 9, startColumn: 9, endColumn: 9 };
        selections.setSelections(target.unitId, target.subUnitId, [{ range: oldRange, primary: null, style: null }]);
        const oldName = worksheet.getName();
        get(SheetInterceptorService).interceptAfterCommand({
            getMutations: ({ id }) => id === SetRangeValuesMutation.id
                ? {
                    redos: [{ id: SetWorksheetNameMutation.id, params: { ...target, name: 'Cleared' } }],
                    undos: [{ id: SetWorksheetNameMutation.id, params: { ...target, name: oldName } }],
                }
                : { redos: [], undos: [] },
        });
        const range = { startRow: 2, endRow: 2, startColumn: 2, endColumn: 3 };
        const values = () => [2, 3].map((column) => worksheet.getCellRaw(2, column)?.v ?? null);
        expect(await commands.executeCommand(AutoClearContentCommand.id, {
            ...target,
            clearRange: range,
            selectionRange: range,
        })).toBe(true);
        expect(values()).toEqual([null, null]);
        expect(selections.getCurrentLastSelection()?.range).toEqual(range);
        expect(worksheet.getName()).toBe('Cleared');
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(values()).toEqual(['old', 'other']);
        expect(selections.getCurrentLastSelection()?.range).toEqual(oldRange);
        expect(worksheet.getName()).toBe(oldName);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(values()).toEqual([null, null]);
        expect(selections.getCurrentLastSelection()?.range).toEqual(range);
        expect(worksheet.getName()).toBe('Cleared');
    });
});
