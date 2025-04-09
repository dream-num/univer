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
import { ILogService, Inject, Injector, IUniverInstanceService, LocaleService, LocaleType, LogLevel, Plugin, Tools, Univer, UniverInstanceType } from '@univerjs/core';
import { FormulaCurrentConfigService, FormulaDataModel, FormulaRuntimeService, IFormulaCurrentConfigService, IFormulaRuntimeService, LexerTreeBuilder } from '@univerjs/engine-formula';
import { SheetInterceptorService, SheetsSelectionsService } from '@univerjs/sheets';
import { FormulaReorderController } from '@univerjs/sheets-formula-ui';
import { SheetsSortService } from '@univerjs/sheets-sort';
import { SheetsSortController } from '@univerjs/sheets-sort/controllers/sheets-sort.controller.js';
import zhCN from '../../../locale/zh-CN';
import { SheetsSortUIService } from '../../../services/sheets-sort-ui.service';

const TEST_WORKBOOK_DATA_DEMO: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            name: 'sheet1',
            cellData: {
                0: {
                    9: { // J1
                        v: 1,
                    },
                    10: { // K1
                        v: 2,
                    },
                    11: { // L1
                        f: '=J1/K1',
                    },
                },
                1: {
                    9: { // J2
                        v: 2,
                    },
                    10: { // K2
                        v: 2,
                    },
                    11: { // L2
                        f: '=J2/K2',
                    },
                },
                2: {
                    9: { // J3
                        v: 3,
                    },
                    10: { // K3
                        v: 2,
                    },
                    11: { // L3
                        f: '=J3/K3',
                    },
                },
                3: {
                    9: { // J4
                        v: 4,
                    },
                    10: { // K4
                        v: 2,
                    },
                    11: { // L4
                        f: '=J4/K4',
                    },
                },
                4: {
                    9: { // J5
                        v: 5,
                    },
                    10: { // K5
                        v: 2,
                    },
                    11: { // L5
                        f: '=J5/K5',
                    },
                },
                5: {
                    9: { // J6
                        v: 6,
                    },
                    10: { // K6
                        v: 2,
                    },
                    11: { // L6
                        f: '=J6/K6',
                    },
                },
                6: {
                    9: { // J7
                        v: 7,
                    },
                    10: { // K7
                        v: 2,
                    },
                    11: { // L7
                        f: '=SUM(J7:K8)',
                    },
                },
                7: {
                    9: { // J8
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

export function createCommandTestBed(workbookData?: IWorkbookData, dependencies?: Dependency[]): ITestBed {
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
            injector.add([FormulaDataModel]);
            injector.add([LexerTreeBuilder]);
            injector.add([IFormulaRuntimeService, { useClass: FormulaRuntimeService }]);
            injector.add([IFormulaCurrentConfigService, { useClass: FormulaCurrentConfigService }]);
            injector.add([SheetsSortController]);
            injector.add([SheetsSortService]);
            injector.add([SheetsSortUIService]);
            injector.add([FormulaReorderController]);

            dependencies?.forEach((d) => injector.add(d));
        }

        override onReady(): void {
            this._injector.get(SheetsSortController);
            this._injector.get(FormulaReorderController);
        }
    }

    univer.registerPlugin(TestPlugin);
    const sheet = univer.createUniverSheet(Tools.deepClone(workbookData || TEST_WORKBOOK_DATA_DEMO));

    const univerInstanceService = injector.get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');
    const logService = injector.get(ILogService);

    logService.setLogLevel(LogLevel.SILENT); // change this to `LogLevel.VERBOSE` to debug tests via logs

    const localeService = injector.get(LocaleService);
    localeService.load({ zhCN });

    return {
        univer,
        get: injector.get.bind(injector),
        sheet,
    };
}
