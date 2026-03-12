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

import type { IWorkbookData } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { ISheetNote } from '../../../models/sheets-note.model';
import {
    ICommandService,
    ILogService,
    Inject,
    Injector,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleType,
    LogLevel,
    Plugin,
    RANGE_TYPE,
    touchDependencies,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SheetsNoteModel } from '../../../models/sheets-note.model';
import { RemoveNoteMutation, ToggleNotePopupMutation, UpdateNoteMutation } from '../../mutations/note.mutation';
import { SheetDeleteNoteCommand, SheetToggleNotePopupCommand, SheetUpdateNoteCommand } from '../note.command';

const unitId = 'test';
const subUnitId = 'sheet1';

const TEST_WORKBOOK_DATA: IWorkbookData = {
    id: unitId,
    sheetOrder: [subUnitId],
    name: '',
    appVersion: '0.15.4',
    locale: LocaleType.EN_US,
    styles: {},
    sheets: {
        [subUnitId]: {
            id: subUnitId,
            name: 'Sheet1',
            rowCount: 10,
            columnCount: 10,
            cellData: {},
        },
    },
};

function createCommandTestBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    class TestPlugin extends Plugin {
        static override pluginName = 'test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            // Ensure undo/redo exists and registers commands.
            this._injector.get(IUndoRedoService);

            this._injector.add([SheetsSelectionsService]);
            this._injector.add([SheetsNoteModel]);

            touchDependencies(this._injector, [
                [SheetsSelectionsService],
                [SheetsNoteModel],
            ]);
        }
    }

    univer.registerPlugin(TestPlugin);
    univer.createUnit(UniverInstanceType.UNIVER_SHEET, TEST_WORKBOOK_DATA);
    get(IUniverInstanceService).focusUnit(unitId);

    const logService = get(ILogService);
    logService.setLogLevel(LogLevel.SILENT);

    const commandService = get(ICommandService);
    commandService.registerCommand(UpdateNoteMutation);
    commandService.registerCommand(RemoveNoteMutation);
    commandService.registerCommand(ToggleNotePopupMutation);
    commandService.registerCommand(SheetUpdateNoteCommand);
    commandService.registerCommand(SheetDeleteNoteCommand);
    commandService.registerCommand(SheetToggleNotePopupCommand);

    return {
        univer,
        get,
        injector,
        commandService,
    };
}

function setSingleCellSelection(get: Injector['get'], row: number, col: number) {
    const selections = get(SheetsSelectionsService);
    const selection: ISelectionWithStyle = {
        range: {
            startRow: row,
            endRow: row + 1,
            startColumn: col,
            endColumn: col + 1,
            rangeType: RANGE_TYPE.NORMAL,
        },
        primary: {
            startRow: row,
            endRow: row + 1,
            startColumn: col,
            endColumn: col + 1,
            actualRow: row,
            actualColumn: col,
            isMerged: false,
            isMergedMainCell: false,
        },
        style: null,
    };

    selections.setSelections([selection]);
}

describe('sheets-note commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;
        commandService = testBed.commandService;
    });

    afterEach(() => univer.dispose());

    it('SheetUpdateNoteCommand pushes undo correctly (new note -> undo removes)', async () => {
        const note: ISheetNote = { id: 'n1', row: 1, col: 2, width: 160, height: 72, note: 'hello' };

        const res = commandService.syncExecuteCommand(SheetUpdateNoteCommand.id, {
            unitId,
            sheetId: subUnitId,
            row: 1,
            col: 2,
            note,
        });
        expect(res).toBeTruthy();

        const model = get(SheetsNoteModel);
        expect(model.getNote(unitId, subUnitId, { row: 1, col: 2 })?.note).toBe('hello');

        // Undo should remove the note.
        expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        expect(model.getNote(unitId, subUnitId, { row: 1, col: 2 })).toBeUndefined();
    });

    it('SheetUpdateNoteCommand pushes undo correctly (existing note -> undo restores)', async () => {
        const model = get(SheetsNoteModel);
        model.updateNote(unitId, subUnitId, 1, 2, { id: 'n2', row: 1, col: 2, width: 160, height: 72, note: 'old' });

        const note: ISheetNote = { id: 'n2', row: 1, col: 2, width: 160, height: 72, note: 'new' };
        const res = commandService.syncExecuteCommand(SheetUpdateNoteCommand.id, {
            unitId,
            sheetId: subUnitId,
            row: 1,
            col: 2,
            note,
        });
        expect(res).toBeTruthy();
        expect(model.getNote(unitId, subUnitId, { row: 1, col: 2 })?.note).toBe('new');

        expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        expect(model.getNote(unitId, subUnitId, { row: 1, col: 2 })?.note).toBe('old');
    });

    it('SheetDeleteNoteCommand removes note at current selection and supports undo', async () => {
        const model = get(SheetsNoteModel);
        model.updateNote(unitId, subUnitId, 2, 3, { id: 'n3', row: 2, col: 3, width: 160, height: 72, note: 'to delete' });
        setSingleCellSelection(get, 2, 3);

        const res = commandService.syncExecuteCommand(SheetDeleteNoteCommand.id);
        expect(res).toBeTruthy();
        expect(model.getNote(unitId, subUnitId, { row: 2, col: 3 })).toBeUndefined();

        expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        expect(model.getNote(unitId, subUnitId, { row: 2, col: 3 })?.note).toBe('to delete');
    });

    it('SheetToggleNotePopupCommand toggles show state at current selection and supports undo', async () => {
        const model = get(SheetsNoteModel);
        model.updateNote(unitId, subUnitId, 4, 4, { id: 'n4', row: 4, col: 4, width: 160, height: 72, note: 'toggle', show: false });
        setSingleCellSelection(get, 4, 4);

        const res = commandService.syncExecuteCommand(SheetToggleNotePopupCommand.id);
        expect(res).toBeTruthy();
        expect(model.getNote(unitId, subUnitId, { row: 4, col: 4 })?.show).toBe(true);

        expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        expect(model.getNote(unitId, subUnitId, { row: 4, col: 4 })?.show).toBe(false);
    });

    // Avoid directly asserting pure exports without business value.
});
