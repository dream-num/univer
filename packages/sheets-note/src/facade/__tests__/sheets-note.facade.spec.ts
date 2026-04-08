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
import type { FUniver } from '@univerjs/core/facade';
import type { ISheetNote } from '../../models/sheets-note.model';
import {
    ILogService,
    Inject,
    Injector,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleType,
    LogLevel,
    Plugin,
    touchDependencies,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FUniver as FUniverFactory } from '@univerjs/core/facade';
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
import { beforeEach, describe, expect, it } from 'vitest';
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

    const univerAPI = FUniverFactory.newAPI(injector);

    return {
        univer,
        injector,
        sheet,
        univerAPI,
    };
}

describe('sheets-note facade mixins', () => {
    let univerAPI: FUniver;

    beforeEach(() => {
        const testBed = createFacadeTestBed();
        univerAPI = testBed.univerAPI;
    });

    it('creates/reads/deletes note through FRange and reads all notes via FWorksheet', () => {
        const workbook = univerAPI.getActiveWorkbook();
        expect(workbook).toBeTruthy();
        const sheet = workbook!.getActiveSheet();

        const range = sheet.getRange(1, 1, 1, 1);
        expect(range.getNote()).toBeUndefined();

        const note: ISheetNote = { id: 'ignored-id', row: 1, col: 1, width: 160, height: 72, note: 'hello', show: true };
        range.createOrUpdateNote(note);

        expect(range.getNote()?.note).toBe('hello');
        expect(sheet.getNotes()).toHaveLength(1);

        range.deleteNote();
        expect(range.getNote()).toBeUndefined();
        expect(sheet.getNotes()).toHaveLength(0);
    });
});
