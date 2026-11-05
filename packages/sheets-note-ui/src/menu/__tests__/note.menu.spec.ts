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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import {
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    RedoCommand,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import {
    RemoveNoteMutation,
    SheetsNoteModel,
    SheetToggleNotePopupCommand,
    ToggleNotePopupMutation,
    UpdateNoteMutation,
} from '@univerjs/sheets-note';
import { describe, expect, it, onTestFinished } from 'vitest';
import { sheetNoteToggleMenuFactory } from '../note.menu';

describe('note visibility menu', () => {
    it('follows the selected note through toggles, undo/redo, deletion, and sheet changes', async () => {
        const univer = new Univer();
        onTestFinished(() => univer.dispose());
        const injector = univer.__getInjector();
        injector.add([SheetsSelectionsService]);
        injector.add([SheetsNoteModel]);
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'workbook',
            sheetOrder: ['sheet-1', 'sheet-2'],
            sheets: { 'sheet-1': { id: 'sheet-1' }, 'sheet-2': { id: 'sheet-2' } },
        });
        injector.get(IUniverInstanceService).focusUnit('workbook');
        const commands = injector.get(ICommandService);
        injector.get(IUndoRedoService);
        for (const command of [UpdateNoteMutation, RemoveNoteMutation, ToggleNotePopupMutation, SheetToggleNotePopupCommand]) {
            commands.registerCommand(command);
        }
        const selections = injector.get(SheetsSelectionsService);
        const select = (column: number) => selections.setSelections([{
            range: { startRow: 0, endRow: 0, startColumn: column, endColumn: column },
            primary: {
                startRow: 0,
                endRow: 0,
                startColumn: column,
                endColumn: column,
                actualRow: 0,
                actualColumn: column,
                isMerged: false,
                isMergedMainCell: false,
            },
            style: null,
        }]);
        select(0);
        const menu = sheetNoteToggleMenuFactory(injector);
        let activated: boolean | undefined;
        let hidden: boolean | undefined;
        const activeSubscription = menu.activated$?.subscribe((value) => {
            activated = value;
        });
        const hiddenSubscription = menu.hidden$?.subscribe((value) => {
            hidden = value;
        });
        onTestFinished(() => {
            activeSubscription?.unsubscribe();
            hiddenSubscription?.unsubscribe();
        });
        expect(activated).toBe(false);
        expect(hidden).toBe(true);

        commands.syncExecuteCommand(UpdateNoteMutation.id, {
            unitId: 'workbook',
            sheetId: 'sheet-1',
            row: 0,
            col: 0,
            note: { id: 'note', row: 0, col: 0, width: 100, height: 100, note: 'A note', show: true },
        });
        expect(activated).toBe(true);
        expect(hidden).toBe(false);

        commands.syncExecuteCommand(menu.id);
        expect(activated).toBe(false);
        await commands.executeCommand(UndoCommand.id);
        expect(activated).toBe(true);
        await commands.executeCommand(RedoCommand.id);
        expect(activated).toBe(false);
        commands.syncExecuteCommand(menu.id);

        select(1);
        expect(activated).toBe(false);
        expect(hidden).toBe(true);
        select(0);
        expect(activated).toBe(true);

        workbook.setActiveSheet(workbook.getSheetBySheetId('sheet-2')!);
        expect(activated).toBe(false);
        workbook.setActiveSheet(workbook.getSheetBySheetId('sheet-1')!);
        expect(activated).toBe(true);

        commands.syncExecuteCommand(RemoveNoteMutation.id, { unitId: 'workbook', sheetId: 'sheet-1', noteId: 'note' });
        expect(activated).toBe(false);
        expect(hidden).toBe(true);
        injector.get(IUniverInstanceService).disposeUnit('workbook');
        expect(activated).toBe(false);
    });
});
