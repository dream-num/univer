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
import type { IRender } from '@univerjs/engine-render';
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
import { ActiveDirtyManagerService, DefinedNamesService, FormulaDataModel, FunctionService, IActiveDirtyManagerService, IDefinedNamesService, IFunctionService, ISheetRowFilteredService, LexerTreeBuilder, SheetRowFilteredService } from '@univerjs/engine-formula';
import { Engine, IRenderingEngine, IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { ISocketService, WebSocketService } from '@univerjs/network';
import {
    RangeProtectionRuleModel,
    RefRangeService,
    SheetInterceptorService,
    SheetSkeletonService,
    SheetsSelectionsService,
    WorkbookPermissionService,
    WorksheetPermissionService,
    WorksheetProtectionPointModel,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import enUS from '@univerjs/sheets/locale/en-US';
import zhCN from '@univerjs/sheets/locale/zh-CN';

import '@univerjs/sheets/facade';

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
                        0: {
                            v: 1,
                        },
                    },
                    1: {
                        0: {
                            v: 2,
                        },
                    },
                    2: {
                        0: {
                            v: 3,
                        },
                    },
                    3: {
                        0: {
                            v: 4,
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

class RenderManagerServiceTestBed extends RenderManagerService {
    override createRender(unitId: string): IRender {
        const renderer = this._createRender(unitId, new Engine('', { elementHeight: 100, elementWidth: 100 }));
        return renderer;
    }
}

export function createWorksheetTestBed(workbookData?: IWorkbookData, dependencies?: Dependency[]): ITestBed {
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

            injector.add([IFunctionService, { useClass: FunctionService }]);
            injector.add([ISocketService, { useClass: WebSocketService }]);
            injector.add([IRenderingEngine, { useFactory: () => new Engine() }]);
            injector.add([IRenderManagerService, { useClass: RenderManagerServiceTestBed }]);
            injector.add([SheetSkeletonService]);
            injector.add([FormulaDataModel]);
            injector.add([LexerTreeBuilder]);
            injector.add([RefRangeService]);
            injector.add([WorksheetPermissionService]);
            injector.add([WorkbookPermissionService]);
            injector.add([WorksheetProtectionPointModel]);
            injector.add([RangeProtectionRuleModel]);
            injector.add([WorksheetProtectionRuleModel]);
            injector.add([IDefinedNamesService, { useClass: DefinedNamesService }]);

            // register feature modules
            ([
                [IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }],
                [ISheetRowFilteredService, { useClass: SheetRowFilteredService }],
            ] as Dependency[]).forEach((d) => {
                injector.add(d);
            });

            dependencies?.forEach((d) => injector.add(d));
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

    const sheet = univer.createUnit<IWorkbookData, UnitModel<IWorkbookData>>(UniverInstanceType.UNIVER_SHEET, workbookData || getTestWorkbookDataDemo());
    const univerInstanceService = injector.get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');

    // set log level
    const logService = injector.get(ILogService);
    logService.setLogLevel(LogLevel.SILENT); // NOTE: change this to `LogLevel.VERBOSE` to debug tests via logs

    const univerAPI = FUniver.newAPI(injector);

    return {
        univer,
        get: injector.get.bind(injector),
        sheet,
        univerAPI,
        injector,
    };
}
