/**
 * Copyright 2023-present DreamNum Inc.
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
import { ICommandService, ILogService, Inject, Injector, IUniverInstanceService, LocaleType, LogLevel, Plugin, Univer, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { CalculateFormulaService, DefinedNamesService, FormulaCurrentConfigService, FormulaDataModel, FormulaRuntimeService, ICalculateFormulaService, IDefinedNamesService, IFormulaCurrentConfigService, IFormulaRuntimeService, LexerTreeBuilder } from '@univerjs/engine-formula';
import { DefinedNameDataController, InsertColByRangeCommand, InsertColCommand, InsertRowByRangeCommand, IRefSelectionsService, MoveColsCommand, MoveRangeCommand, RangeProtectionRuleModel, RefRangeService, RemoveColByRangeCommand, RemoveColCommand, RemoveRowByRangeCommand, SheetInterceptorService, SheetsSelectionsService, WorkbookPermissionService, WorksheetPermissionService, WorksheetProtectionPointModel, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import { FormulaRefRangeService } from '../formula-ref-range.service';

const TEST_WORKBOOK_DATA_DEMO: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    0: {
                        v: 1,
                    },
                    1: {
                        f: '=SUM(A1)',
                    },
                },
                1: {
                    1: {
                        v: 1,
                    },
                },
            },
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

export interface ITestBed {
    univer: Univer;
    get: Injector['get'];
    sheet: Workbook;
}

// eslint-disable-next-line max-lines-per-function
export function createCommandTestBed(workbookData?: IWorkbookData, dependencies?: Dependency[]): ITestBed {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    class TestPlugin extends Plugin {
        static override pluginName = 'test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        private _formulaDataModel: FormulaDataModel | null = null;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            const injector = this._injector;
            // injector.add([ICommandService, { useClass: CommandService }]);
            injector.add([WorksheetPermissionService]);
            injector.add([WorksheetProtectionPointModel]);
            injector.add([RangeProtectionRuleModel]);
            injector.add([WorkbookPermissionService]);
            injector.add([WorksheetProtectionRuleModel]);
            injector.add([SheetsSelectionsService]);
            injector.add([SheetInterceptorService]);
            injector.add([ICalculateFormulaService, { useClass: CalculateFormulaService }]);
            injector.add([FormulaDataModel]);
            injector.add([LexerTreeBuilder]);
            injector.add([DocSelectionManagerService]);
            injector.add([IDefinedNamesService, { useClass: DefinedNamesService }]);
            injector.add([DefinedNameDataController]);
            injector.add([IFormulaRuntimeService, { useClass: FormulaRuntimeService }]);
            injector.add([IFormulaCurrentConfigService, { useClass: FormulaCurrentConfigService }]);
            injector.add([IRefSelectionsService, { useClass: SheetsSelectionsService }]);
            injector.add([RefRangeService]);
            injector.add([FormulaRefRangeService]);

            dependencies?.forEach((d) => injector.add(d));

            this._injector.get(SheetInterceptorService);
            this._injector.get(WorkbookPermissionService);
            this._injector.get(WorksheetPermissionService);
            this._injector.get(DefinedNameDataController);

            [
                MoveRangeCommand,
                RemoveColCommand,
                InsertColCommand,
                MoveColsCommand,
                RemoveColByRangeCommand,
                RemoveRowByRangeCommand,
                InsertColByRangeCommand,
                InsertRowByRangeCommand,
            ].forEach((command) => {
                this._injector.get(ICommandService).registerCommand(command);
            });
        }

        override onReady(): void {
            this._formulaDataModel = get(FormulaDataModel);
        }
    }

    univer.registerPlugin(TestPlugin);
    const sheet = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData || TEST_WORKBOOK_DATA_DEMO);

    const univerInstanceService = injector.get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');

    const logService = injector.get(ILogService);
    logService.setLogLevel(LogLevel.SILENT); // change this to `LogLevel.VERBOSE` to debug tests via logs

    return {
        univer,
        get,
        sheet,
    };
}
