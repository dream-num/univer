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

import type { Dependency, IWorkbookData, UnitModel } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
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
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import {
    DefinedNamesService,
    FormulaDataModel,
    FunctionService,
    IDefinedNamesService,
    IFunctionService,
    LexerTreeBuilder,
} from '@univerjs/engine-formula';
import { Engine, IRenderingEngine, IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { ISocketService, WebSocketService } from '@univerjs/network';
import {
    RangeProtectionRuleModel,
    RefRangeService,
    SheetInterceptorService,
    SheetLazyExecuteScheduleService,
    SheetsSelectionsService,
    WorkbookPermissionService,
    WorksheetPermissionService,
    WorksheetProtectionPointModel,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    SheetDeleteNoteCommand,
    SheetToggleNotePopupCommand,
    SheetUpdateNoteCommand,
} from '../../commands/commands/note.command';
import { SheetsNoteController } from '../../controllers/sheets.note.controller';
import { SheetsNoteModel } from '../../models/sheets-note.model';
import '@univerjs/sheets/facade';
import '../../facade';

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

function createFacadeTestBed(workbookData?: IWorkbookData, dependencies?: Dependency[]) {
    const univer = new Univer();
    const injector = univer.__getInjector();

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
            // Ensure undo/redo exists.
            this._injector.get(IUndoRedoService);

            (dependencies ?? []).forEach((d) => this._injector.add(d));

            // Minimal set of dependencies required by Sheets facade classes.
            this._injector.add([SheetsSelectionsService]);
            this._injector.add([SheetInterceptorService]);
            this._injector.add([IFunctionService, { useClass: FunctionService }]);
            this._injector.add([ISocketService, { useClass: WebSocketService }]);
            this._injector.add([IRenderingEngine, { useFactory: () => new Engine() }]);
            this._injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            this._injector.add([FormulaDataModel]);
            this._injector.add([LexerTreeBuilder]);
            this._injector.add([RefRangeService]);
            this._injector.add([WorksheetPermissionService]);
            this._injector.add([WorkbookPermissionService]);
            this._injector.add([WorksheetProtectionPointModel]);
            this._injector.add([RangeProtectionRuleModel]);
            this._injector.add([WorksheetProtectionRuleModel]);
            this._injector.add([IDefinedNamesService, { useClass: DefinedNamesService }]);
            this._injector.add([SheetLazyExecuteScheduleService]);

            ([
                [SheetsNoteModel],
                [SheetsNoteController],
            ] as Dependency[]).forEach((d) => this._injector.add(d));

            touchDependencies(this._injector, [
                [SheetsSelectionsService],
                [SheetInterceptorService],
                [SheetsNoteModel],
                [SheetsNoteController],
            ]);
        }
    }

    univer.registerPlugin(TestPlugin);
    const sheet = univer.createUnit<IWorkbookData, UnitModel<IWorkbookData>>(UniverInstanceType.UNIVER_SHEET, workbookData ?? TEST_WORKBOOK_DATA);
    const univerInstanceService = injector.get(IUniverInstanceService);
    univerInstanceService.focusUnit(unitId);

    const logService = injector.get(ILogService);
    logService.setLogLevel(LogLevel.SILENT);

    const univerAPI = FUniver.newAPI(injector);

    return {
        univer,
        injector,
        sheet,
        univerAPI,
    };
}

function setSingleCellSelection(injector: Injector, row: number, col: number) {
    const selection: ISelectionWithStyle = {
        range: {
            startRow: row,
            endRow: row,
            startColumn: col,
            endColumn: col,
            rangeType: RANGE_TYPE.NORMAL,
        },
        primary: {
            startRow: row,
            endRow: row,
            startColumn: col,
            endColumn: col,
            actualRow: row,
            actualColumn: col,
            isMerged: false,
            isMergedMainCell: false,
        },
        style: null,
    };

    injector.get(SheetsSelectionsService).setSelections([selection]);
}

describe('sheets-note facade mixins', () => {
    let univer: Univer;
    let injector: Injector;
    let univerAPI: FUniver;

    beforeEach(() => {
        const testBed = createFacadeTestBed();
        univer = testBed.univer;
        injector = testBed.injector;
        univerAPI = testBed.univerAPI;
    });

    afterEach(() => {
        univer.dispose();
    });

    it('creates/reads/deletes note through FRange and reads all notes via FWorksheet', () => {
        const workbook = univerAPI.getActiveWorkbook();
        expect(workbook).toBeTruthy();
        const sheet = workbook!.getActiveSheet();

        const range = sheet.getRange(1, 1, 1, 1);
        expect(range.getNote()).toBeUndefined();

        range.createOrUpdateNote({ width: 160, height: 72, note: 'hello', show: true });

        expect(range.getNote()).toMatchObject({
            col: 1,
            height: 72,
            note: 'hello',
            row: 1,
            show: true,
            width: 160,
        });
        expect(sheet.getNotes()).toHaveLength(1);

        range.deleteNote();
        expect(range.getNote()).toBeUndefined();
        expect(sheet.getNotes()).toHaveLength(0);
    });

    it('emits business events while notes are added, updated, shown, hidden and deleted', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const sheet = workbook.getActiveSheet();
        const commandService = injector.get(ICommandService);
        const events: string[] = [];
        const disposables = [
            univerAPI.addEvent(univerAPI.Event.BeforeSheetNoteAdd, (event) => events.push(`before-add:${event.row}:${event.col}:${event.note.note}`)),
            univerAPI.addEvent(univerAPI.Event.SheetNoteAdd, (event) => events.push(`add:${event.row}:${event.col}:${event.note.note}`)),
            univerAPI.addEvent(univerAPI.Event.BeforeSheetNoteUpdate, (event) => events.push(`before-update:${event.row}:${event.col}:${event.oldNote.note}->${event.note.note}`)),
            univerAPI.addEvent(univerAPI.Event.SheetNoteUpdate, (event) => events.push(`update:${event.row}:${event.col}:${event.oldNote.note}->${event.note.note}`)),
            univerAPI.addEvent(univerAPI.Event.BeforeSheetNoteShow, (event) => events.push(`before-show:${event.row}:${event.col}`)),
            univerAPI.addEvent(univerAPI.Event.SheetNoteShow, (event) => events.push(`show:${event.row}:${event.col}`)),
            univerAPI.addEvent(univerAPI.Event.BeforeSheetNoteHide, (event) => events.push(`before-hide:${event.row}:${event.col}`)),
            univerAPI.addEvent(univerAPI.Event.SheetNoteHide, (event) => events.push(`hide:${event.row}:${event.col}`)),
            univerAPI.addEvent(univerAPI.Event.BeforeSheetNoteDelete, (event) => events.push(`before-delete:${event.row}:${event.col}:${event.oldNote.note}`)),
            univerAPI.addEvent(univerAPI.Event.SheetNoteDelete, (event) => events.push(`delete:${event.row}:${event.col}:${event.oldNote.note}`)),
        ];

        expect(commandService.syncExecuteCommand(SheetUpdateNoteCommand.id, {
            unitId,
            sheetId: subUnitId,
            row: 1,
            col: 1,
            note: { id: 'note-1', row: 1, col: 1, width: 160, height: 72, note: 'hello', show: false },
        })).toBe(true);
        expect(commandService.syncExecuteCommand(SheetUpdateNoteCommand.id, {
            unitId,
            sheetId: subUnitId,
            row: 1,
            col: 1,
            note: { id: 'note-1', row: 1, col: 1, width: 160, height: 72, note: 'updated', show: false },
        })).toBe(true);

        setSingleCellSelection(injector, 1, 1);
        expect(commandService.syncExecuteCommand(SheetToggleNotePopupCommand.id)).toBe(true);
        expect(sheet.getRange(1, 1).getNote()?.show).toBe(true);

        expect(commandService.syncExecuteCommand(SheetToggleNotePopupCommand.id)).toBe(true);
        expect(sheet.getRange(1, 1).getNote()?.show).toBe(false);

        expect(commandService.syncExecuteCommand(SheetDeleteNoteCommand.id)).toBe(true);
        expect(sheet.getRange(1, 1).getNote()).toBeUndefined();

        expect(events).toEqual(expect.arrayContaining([
            'before-add:1:1:hello',
            'add:1:1:hello',
            'before-update:1:1:hello->updated',
            'update:1:1:hello->updated',
            'before-show:1:1',
            'show:1:1',
            'before-hide:1:1',
            'hide:1:1',
            'before-delete:1:1:updated',
            'delete:1:1:updated',
        ]));

        disposables.forEach((disposable) => disposable.dispose());
    });
});
