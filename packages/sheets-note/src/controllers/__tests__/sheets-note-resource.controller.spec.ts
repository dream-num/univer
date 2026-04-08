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

import type { Dependency, IWorkbookData, Workbook } from '@univerjs/core';
import type { ICopySheetCommandParams, IRemoveSheetCommandParams } from '@univerjs/sheets';
import type { ISheetNote } from '../../models/sheets-note.model';
import {
    ICommandService,
    ILogService,
    Inject,
    Injector,
    IResourceManagerService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    touchDependencies,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    CopySheetCommand,
    CopyWorksheetEndMutation,
    InsertColByRangeCommand,
    InsertColMutation,
    InsertRowByRangeCommand,
    InsertRowMutation,
    InsertSheetMutation,
    RemoveColByRangeCommand,
    RemoveColMutation,
    RemoveRowByRangeCommand,
    RemoveRowMutation,
    RemoveSheetCommand,
    RemoveSheetMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetActivateCommand,
    SetWorksheetActiveOperation,
    SheetInterceptorService,
    SheetLazyExecuteScheduleService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import enUS from '@univerjs/sheets/locale/en-US';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
// Note mutations are registered by SheetsNoteController.
import { PLUGIN_NAME } from '../../const';
import { SheetsNoteModel } from '../../models/sheets-note.model';
import { SheetsNoteResourceController } from '../sheets-note-resource.controller';
import { SheetsNoteController } from '../sheets.note.controller';

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

function createTestBed(resources?: Array<{ name: string; data: string }>) {
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

            ([
                [SheetInterceptorService],
                [SheetsSelectionsService],
                [SheetLazyExecuteScheduleService],
                [SheetsNoteModel],
                [SheetsNoteController],
                [SheetsNoteResourceController],
            ] as Dependency[]).forEach((d) => this._injector.add(d));

            touchDependencies(this._injector, [
                [SheetsNoteModel],
                [SheetsNoteController],
                [SheetsNoteResourceController],
            ]);
        }
    }

    univer.registerPlugin(TestPlugin);
    univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
        ...TEST_WORKBOOK_DATA,
        resources: resources ?? [],
    });

    get(IUniverInstanceService).focusUnit(unitId);

    const logService = get(ILogService);
    logService.setLogLevel(LogLevel.SILENT);

    const localeService = get(LocaleService);
    localeService.load({ enUS });
    localeService.setLocale(LocaleType.EN_US);

    const commandService = get(ICommandService);
    // Register sheet structure commands/mutations that resource controller intercepts.
    commandService.registerCommand(RemoveSheetCommand);
    commandService.registerCommand(CopySheetCommand);
    commandService.registerCommand(RemoveSheetMutation);
    commandService.registerCommand(InsertSheetMutation);
    commandService.registerCommand(CopyWorksheetEndMutation);
    commandService.registerCommand(SetRangeValuesMutation);
    commandService.registerCommand(SetSelectionsOperation);
    commandService.registerCommand(SetWorksheetActivateCommand);
    commandService.registerCommand(SetWorksheetActiveOperation);
    // Keep parity with existing ref-range test bed (some sheet commands expect these).
    commandService.registerCommand(InsertRowByRangeCommand);
    commandService.registerCommand(InsertColByRangeCommand);
    commandService.registerCommand(RemoveRowByRangeCommand);
    commandService.registerCommand(RemoveColByRangeCommand);
    commandService.registerCommand(InsertRowMutation);
    commandService.registerCommand(InsertColMutation);
    commandService.registerCommand(RemoveRowMutation);
    commandService.registerCommand(RemoveColMutation);
    // Note mutations are registered by SheetsNoteController.

    return {
        univer,
        get,
        injector,
        commandService,
    };
}

describe('SheetsNoteResourceController', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        // Create empty bed by default.
        const testBed = createTestBed();
        univer = testBed.univer;
        get = testBed.get;
        commandService = testBed.commandService;
    });

    afterEach(() => univer.dispose());

    it('loads notes from snapshot resources', () => {
        univer.dispose();
        const note: ISheetNote = { id: 'n1', row: 1, col: 1, width: 160, height: 72, note: 'from snapshot' };
        const resources = [{
            name: PLUGIN_NAME,
            data: JSON.stringify({ [subUnitId]: { 1: { 1: note } } }),
        }];

        const testBed = createTestBed(resources);
        univer = testBed.univer;
        get = testBed.get;

        const model = get(SheetsNoteModel);
        expect(model.getNote(unitId, subUnitId, { row: 1, col: 1 })?.note).toBe('from snapshot');
    });

    it('clears unit notes on resource unload', () => {
        const model = get(SheetsNoteModel);
        model.updateNote(unitId, subUnitId, 2, 2, { id: 'n2', row: 2, col: 2, width: 160, height: 72, note: 'note' });
        expect(model.getSheetNotes(unitId, subUnitId)?.size).toBe(1);

        const resourceManager = get(IResourceManagerService);
        resourceManager.unloadResources(unitId, UniverInstanceType.UNIVER_SHEET);
        expect(model.getUnitNotes(unitId)).toBeUndefined();
    });

    it('intercepts RemoveSheetCommand to remove notes and supports undo', async () => {
        const model = get(SheetsNoteModel);
        model.updateNote(unitId, subUnitId, 3, 4, { id: 'n3', row: 3, col: 4, width: 160, height: 72, note: 'note' });

        // Need at least 2 sheets for RemoveSheetCommand to pass.
        const workbook = get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        workbook.addWorksheet('sheet2', 1, { id: 'sheet2', name: 'Sheet2', rowCount: 10, columnCount: 10, cellData: {} });

        expect(await commandService.executeCommand(SetWorksheetActivateCommand.id, { unitId, subUnitId })).toBeTruthy();

        const params: IRemoveSheetCommandParams = { unitId, subUnitId };
        expect(commandService.syncExecuteCommand(RemoveSheetCommand.id, params)).toBeTruthy();
        expect(model.getSheetNotes(unitId, subUnitId)?.size).toBe(0);

        // Undo should restore the sheet and its notes via UpdateNoteMutation in undo list.
        expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        expect(model.getNote(unitId, subUnitId, { row: 3, col: 4 })?.id).toBe('n3');
    });

    it('intercepts CopySheetCommand to copy notes to target sheet and supports undo', async () => {
        const model = get(SheetsNoteModel);
        model.updateNote(unitId, subUnitId, 1, 2, { id: 'n4', row: 1, col: 2, width: 160, height: 72, note: 'note' });

        // Need at least 2 sheets for RemoveSheetCommand used by undo in CopySheetCommand to pass.
        const workbook = get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        workbook.addWorksheet('sheet2', 1, { id: 'sheet2', name: 'Sheet2', rowCount: 10, columnCount: 10, cellData: {} });

        expect(await commandService.executeCommand(SetWorksheetActivateCommand.id, { unitId, subUnitId })).toBeTruthy();

        const params: ICopySheetCommandParams = { unitId, subUnitId };
        expect(commandService.syncExecuteCommand(CopySheetCommand.id, params)).toBeTruthy();

        const copiedSheetId = workbook.getSheets()[1].getSheetId();
        expect(copiedSheetId).not.toBe(subUnitId);

        expect(model.getSheetNotes(unitId, copiedSheetId)?.size).toBe(1);

        const copiedNotes = Array.from(model.getSheetNotes(unitId, copiedSheetId)!.values());
        expect(copiedNotes[0].row).toBe(1);
        expect(copiedNotes[0].col).toBe(2);
        expect(copiedNotes[0].note).toBe('note');
        // Copied note should have a new id.
        expect(copiedNotes[0].id).not.toBe('n4');

        expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        expect(model.getSheetNotes(unitId, copiedSheetId)?.size).toBe(0);
    });
});
