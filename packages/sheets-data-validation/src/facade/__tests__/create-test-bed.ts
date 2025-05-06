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
import {
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    set,
    ThemeService,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { UniverDataValidationPlugin } from '@univerjs/data-validation';
import { ActiveDirtyManagerService, DefinedNamesService, FormulaDataModel, IActiveDirtyManagerService, IDefinedNamesService, ISheetRowFilteredService, LexerTreeBuilder, SheetRowFilteredService } from '@univerjs/engine-formula';
import {
    RefRangeService,
    SheetInterceptorService,
    SheetSkeletonService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { DataValidationCacheService, DataValidationCustomFormulaService, DataValidationFormulaService, SheetDataValidationModel, SheetsDataValidationValidatorService } from '@univerjs/sheets-data-validation';
import { RegisterOtherFormulaService } from '@univerjs/sheets-formula';
import enUS from '@univerjs/sheets/locale/en-US';
import zhCN from '@univerjs/sheets/locale/zh-CN';

import '@univerjs/sheets/facade';
import '@univerjs/sheets-data-validation/facade';

function getTestWorkbookDataDemo(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'sheet1',
                cellData: {
                    0: {
                        3: {
                            f: '=SUM(A1)',
                            si: '3e4r5t',
                        },
                        4: {
                            v: 123,
                            t: 2,
                        },
                    },
                    1: {
                        3: {
                            f: '=SUM(A2)',
                            si: 'OSPtzm',
                        },
                    },
                    2: {
                        3: {
                            si: 'OSPtzm',
                        },
                    },
                    3: {
                        3: {
                            si: 'OSPtzm',
                        },
                    },
                },
                rowCount: 100,
                columnCount: 100,
            },
        },
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: [],
        styles: {},
    };
}

export interface ITestBed {
    univer: Univer;
    get: Injector['get'];
    sheet: UnitModel<IWorkbookData>;
    univerAPI: FUniver;
    injector: Injector;
}

export function createFacadeTestBed(workbookData?: IWorkbookData, dependencies?: Dependency[]): ITestBed {
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
            const injector = this._injector;
            injector.add([SheetsSelectionsService]);
            injector.add([SheetInterceptorService]);
            injector.add([SheetSkeletonService]);
            injector.add([FormulaDataModel]);
            injector.add([LexerTreeBuilder]);
            injector.add([RefRangeService]);
            injector.add([IDefinedNamesService, { useClass: DefinedNamesService }]);

            // register feature modules
            ([
                // data validation
                [DataValidationCacheService],
                [DataValidationFormulaService],
                [DataValidationCustomFormulaService],
                [RegisterOtherFormulaService],
                [IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }],
                [ISheetRowFilteredService, { useClass: SheetRowFilteredService }],
                [SheetsDataValidationValidatorService],
                [SheetDataValidationModel],
            ] as Dependency[]).forEach((d) => {
                injector.add(d);
            });

            dependencies?.forEach((d) => injector.add(d));

            this._injector.get(SheetInterceptorService);
        }

        override onReady(): void {

        }
    }

    // load i18n
    injector.get(LocaleService).load({ zhCN, enUS });

    // load theme service
    const themeService = injector.get(ThemeService);
    const theme = themeService.getCurrentTheme();
    const newTheme = set(theme, 'black', '#35322b');
    themeService.setTheme(newTheme);

    // register builtin plugins
    // note that UI plugins are not registered here, because the unit test environment does not have a UI
    univer.registerPlugin(TestPlugin);
    univer.registerPlugin(UniverDataValidationPlugin);

    const sheet = univer.createUnit<IWorkbookData, UnitModel<IWorkbookData>>(UniverInstanceType.UNIVER_SHEET, workbookData || getTestWorkbookDataDemo());
    const univerInstanceService = injector.get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');

    // set log level
    const logService = injector.get(ILogService);
    logService.setLogLevel(LogLevel.SILENT); // NOTE: change this to `LogLevel.VERBOSE` to debug tests via logs

    // init data validation
    const univerAPI = FUniver.newAPI(injector);

    return {
        univer,
        get: injector.get.bind(injector),
        sheet,
        univerAPI,
        injector,
    };
}
