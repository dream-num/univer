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

import type { Dependency, IWorkbookData, Nullable, Workbook } from '@univerjs/core';
import type { IInsertColCommandParams, IInsertRowCommandParams, IRemoveColByRangeCommandParams, IRemoveRowByRangeCommandParams } from '@univerjs/sheets';
import type { ISheetNote } from '../../models/sheets-note.model';
import { Direction, ICommandService, ILogService, Inject, Injector, IUndoRedoService, IUniverInstanceService, LocaleType, LogLevel, Plugin, touchDependencies, UndoCommand, Univer, UniverInstanceType } from '@univerjs/core';
import {
    InsertColByRangeCommand,
    InsertColMutation,
    InsertRowByRangeCommand,
    InsertRowMutation,
    RefRangeService,
    RemoveColByRangeCommand,
    RemoveColMutation,
    RemoveRowByRangeCommand,
    RemoveRowMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SheetInterceptorService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SheetsNoteModel } from '../../models/sheets-note.model';
import { SheetsNoteRefRangeController } from '../sheets-note-ref-range.controller';
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
    resources: [
        {
            name: 'SHEET_NOTE_PLUGIN',
            data: '{"sheet1":{"1":{"1":{"width":160,"height":72,"note":"1","row":1,"col":1,"id":"cwvCsB"}},"2":{"2":{"width":160,"height":72,"note":"2","row":2,"col":2,"id":"URAqOO"}},"3":{"3":{"width":160,"height":72,"note":"3","row":3,"col":3,"id":"tCk4Qd"}},"4":{"4":{"width":160,"height":72,"note":"4","row":4,"col":4,"id":"nIasaz"}}}}',
        },
    ],
};

export function createRefRangeTestBed() {
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
            this._injector.get(IUndoRedoService);

            ([
                [SheetInterceptorService],
                [RefRangeService],
                [SheetsSelectionsService],
                [SheetsNoteModel],
                [SheetsNoteController],
                [SheetsNoteResourceController],
                [SheetsNoteRefRangeController],
            ] as Dependency[]).forEach((d) => this._injector.add(d));

            touchDependencies(this._injector, [
                [SheetsNoteModel],
                [SheetsNoteController],
                [SheetsNoteResourceController],
            ]);
        }

        override onReady(): void {
            touchDependencies(this._injector, [
                [SheetsNoteRefRangeController],
            ]);
        }
    }

    univer.registerPlugin(TestPlugin);
    const sheet = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, TEST_WORKBOOK_DATA);

    const univerInstanceService = get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');

    const logService = get(ILogService);
    logService.setLogLevel(LogLevel.SILENT);

    return {
        univer,
        get,
        sheet,
    };
}

describe('test note ref range controller', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let sheetsNoteModel: SheetsNoteModel;
    let getNoteByPosition: (row: number, col: number) => Nullable<ISheetNote>;

    beforeEach(() => {
        const testBed = createRefRangeTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(InsertRowByRangeCommand);
        commandService.registerCommand(InsertColByRangeCommand);
        commandService.registerCommand(RemoveRowByRangeCommand);
        commandService.registerCommand(RemoveColByRangeCommand);
        commandService.registerCommand(InsertRowMutation);
        commandService.registerCommand(InsertColMutation);
        commandService.registerCommand(RemoveRowMutation);
        commandService.registerCommand(RemoveColMutation);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetSelectionsOperation);

        sheetsNoteModel = get(SheetsNoteModel);

        getNoteByPosition = (row: number, col: number) => sheetsNoteModel.getNote(unitId, subUnitId, { row, col });
    });

    afterEach(() => univer.dispose());

    describe('test note ref range change', () => {
        it('test D4 cell note when insert row', async () => {
            const D4CellNote = {
                width: 160,
                height: 72,
                note: '3',
                row: 3,
                col: 3,
                id: 'tCk4Qd',
            };

            const params: IInsertRowCommandParams = {
                unitId,
                subUnitId,
                range: { startRow: 3, endRow: 3, startColumn: 0, endColumn: 9 },
                direction: Direction.DOWN,
            };
            expect(commandService.syncExecuteCommand(InsertRowByRangeCommand.id, params)).toBeTruthy();
            expect(getNoteByPosition(3, 3)).toBeUndefined();
            expect(getNoteByPosition(4, 3)).toStrictEqual({ ...D4CellNote, row: 4, col: 3 });

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getNoteByPosition(3, 3)).toStrictEqual(D4CellNote);
            expect(getNoteByPosition(4, 3)).toBeUndefined();
        });

        it('test D4 cell note when insert column', async () => {
            const D4CellNote = {
                width: 160,
                height: 72,
                note: '3',
                row: 3,
                col: 3,
                id: 'tCk4Qd',
            };

            const params: IInsertColCommandParams = {
                unitId,
                subUnitId,
                range: { startRow: 0, endRow: 9, startColumn: 3, endColumn: 3 },
                direction: Direction.RIGHT,
            };
            expect(commandService.syncExecuteCommand(InsertColByRangeCommand.id, params)).toBeTruthy();
            expect(getNoteByPosition(3, 3)).toBeUndefined();
            expect(getNoteByPosition(3, 4)).toStrictEqual({ ...D4CellNote, row: 3, col: 4 });

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getNoteByPosition(3, 3)).toStrictEqual(D4CellNote);
            expect(getNoteByPosition(3, 4)).toBeUndefined();
        });

        it('test D4 cell note when remove row', async () => {
            const D4CellNote = {
                width: 160,
                height: 72,
                note: '3',
                row: 3,
                col: 3,
                id: 'tCk4Qd',
            };

            const params: IRemoveRowByRangeCommandParams = {
                unitId,
                subUnitId,
                range: { startRow: 2, endRow: 2, startColumn: 0, endColumn: 9 },
            };
            expect(commandService.syncExecuteCommand(RemoveRowByRangeCommand.id, params)).toBeTruthy();
            expect(getNoteByPosition(3, 3)).toBeUndefined();
            expect(getNoteByPosition(2, 3)).toStrictEqual({ ...D4CellNote, row: 2, col: 3 });

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getNoteByPosition(3, 3)).toStrictEqual(D4CellNote);
            expect(getNoteByPosition(2, 3)).toBeUndefined();
        });

        it('test D4 cell note when remove column', async () => {
            const D4CellNote = {
                width: 160,
                height: 72,
                note: '3',
                row: 3,
                col: 3,
                id: 'tCk4Qd',
            };

            const params: IRemoveColByRangeCommandParams = {
                unitId,
                subUnitId,
                range: { startRow: 0, endRow: 9, startColumn: 2, endColumn: 2 },
            };
            expect(commandService.syncExecuteCommand(RemoveColByRangeCommand.id, params)).toBeTruthy();
            expect(getNoteByPosition(3, 3)).toBeUndefined();
            expect(getNoteByPosition(3, 2)).toStrictEqual({ ...D4CellNote, row: 3, col: 2 });

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getNoteByPosition(3, 3)).toStrictEqual(D4CellNote);
            expect(getNoteByPosition(3, 2)).toBeUndefined();
        });
    });
});
