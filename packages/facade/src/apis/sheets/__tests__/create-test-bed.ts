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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import {
    ILogService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    PluginType,
    Univer,
} from '@univerjs/core';
import { FunctionService, IFunctionService } from '@univerjs/engine-formula';
import { ISocketService, WebSocketService } from '@univerjs/network';
import { SelectionManagerService, SheetInterceptorService } from '@univerjs/sheets';
import {
    DescriptionService,
    enUS,
    FormulaCustomFunctionService,
    IDescriptionService,
    IFormulaCustomFunctionService,
    IRegisterFunctionService,
    RegisterFunctionService,
    zhCN,
} from '@univerjs/sheets-formula';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { FUniver } from '../../facade';

function getTestWorkbookDataDemo(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'sheet1',
                cellData: {},
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
    sheet: Workbook;
    univerAPI: FUniver;
}

export function createTestBed(workbookData?: IWorkbookData, dependencies?: Dependency[]): ITestBed {
    const univer = new Univer();
    const injector = univer.__getInjector();

    class TestPlugin extends Plugin {
        static override type = PluginType.Sheet;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super('test-plugin');

            this._injector = _injector;
        }

        override onStarting(injector: Injector): void {
            injector.add([SelectionManagerService]);
            injector.add([SheetInterceptorService]);
            injector.add([IRegisterFunctionService, { useClass: RegisterFunctionService }]);
            injector.add([
                IDescriptionService,
                {
                    useFactory: () => this._injector.createInstance(DescriptionService, undefined),
                },
            ]);
            injector.add([IFunctionService, { useClass: FunctionService }]);
            injector.add([IFormulaCustomFunctionService, { useClass: FormulaCustomFunctionService }]);
            injector.add([ISocketService, { useClass: WebSocketService }]);

            dependencies?.forEach((d) => injector.add(d));
        }
    }

    injector.get(LocaleService).load({ zhCN, enUS });

    univer.registerPlugin(TestPlugin);
    const sheet = univer.createUniverSheet(workbookData || getTestWorkbookDataDemo());

    const univerInstanceService = injector.get(IUniverInstanceService);
    univerInstanceService.focusUniverInstance('test');
    const logService = injector.get(ILogService);

    logService.setLogLevel(LogLevel.SILENT); // change this to `LogLevel.VERBOSE` to debug tests via logs

    const univerAPI = FUniver.newAPI(injector);

    return {
        univer,
        get: injector.get.bind(injector),
        sheet,
        univerAPI,
    };
}
