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
import {
    BooleanNumber,
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleType,
    LogLevel,
    Plugin,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';

const TEST_WORKBOOK_DATA_DEMO: () => IWorkbookData = () => ({
    id: 'workbook-01',
    sheetOrder: ['uE_mIgOi73GuLCvu577On'],
    name: 'UniverSheet Demo',
    appVersion: '3.0.0-alpha',
    locale: LocaleType.EN_US,
    styles: {},
    sheets: {
        uE_mIgOi73GuLCvu577On: {
            type: 0,
            name: '工作表11',
            id: 'uE_mIgOi73GuLCvu577On',
            tabColor: '',
            hidden: 0,
            rowCount: 1000,
            columnCount: 20,
            zoomRatio: 1,
            freeze: {
                xSplit: 0,
                ySplit: 0,
                startRow: -1,
                startColumn: -1,
            },
            scrollTop: 0,
            scrollLeft: 0,
            defaultColumnWidth: 73,
            defaultRowHeight: 19,
            mergeData: [],
            hideRow: [],
            hideColumn: [],
            cellData: {},
            rowData: {
                3: {
                    hd: 0,
                    h: 96.328125,
                    ia: BooleanNumber.FALSE,
                },
            },
            columnData: {
                4: {
                    w: 212.28515625,
                    hd: 0,
                },
            },
            status: 0,
            showGridlines: 1,
            rowHeader: {
                width: 46,
                hidden: 0,
            },
            columnHeader: {
                height: 20,
                hidden: 0,
            },
            selections: ['A1'],
            rightToLeft: 0,
        },
    },
    resources: [
        {
            name: 'SHEET_NUMFMT_PLUGIN',
            data: '{"model":{},"refModel":[]}',
        },
    ],
    __env__: {
        gitHash: '3511862e4',
        gitBranch: 'dev',
        buildTime: '2024-01-06T02:45:20.103Z',
    },
});

export interface ITestBed {
    univer: Univer;
    get: Injector['get'];
    has: Injector['has'];
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
            dependencies?.forEach((d) => this._injector.add(d));
        }
    }

    univer.registerPlugin(TestPlugin);
    const sheet = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, workbookData || TEST_WORKBOOK_DATA_DEMO());

    const univerInstanceService = injector.get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');
    const logService = injector.get(ILogService);

    logService.setLogLevel(LogLevel.SILENT); // change this to `LogLevel.VERBOSE` to debug tests via logs

    return {
        univer,
        get: injector.get.bind(injector),
        has: injector.has.bind(injector),
        sheet,
    };
}
