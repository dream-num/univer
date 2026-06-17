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
    ICommandService,
    ILogService,
    Inject,
    Injector,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    Tools,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import {
    UniverSheetsPlugin,
} from '@univerjs/sheets';
import enUS from '@univerjs/sheets/locale/en-US';
import { UniverSheetsDrawingPlugin } from '../plugin';

const TEST_WORKBOOK_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    locale: LocaleType.EN_US,
    name: '',
    sheetOrder: ['sheet1', 'sheet2'],
    styles: {},
    sheets: {
        sheet1: {
            id: 'sheet1',
            name: 'Sheet1',
            rowCount: 20,
            columnCount: 20,
            cellData: {},
        },
        sheet2: {
            id: 'sheet2',
            name: 'Sheet2',
            rowCount: 20,
            columnCount: 20,
            cellData: {},
        },
    },
};

export interface ISheetsDrawingTestBed {
    univer: Univer;
    get: Injector['get'];
    injector: Injector;
    workbook: Workbook;
    commandService: ICommandService;
}

export function createSheetsDrawingTestBed(workbookData?: IWorkbookData, dependencies?: Dependency[]): ISheetsDrawingTestBed {
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
                [IRenderManagerService, { useClass: RenderManagerService }],
            ] as Dependency[]).forEach((dependency) => this._injector.add(dependency));

            dependencies?.forEach((dependency) => this._injector.add(dependency));
        }
    }

    univer.registerPlugin(TestPlugin);
    univer.registerPlugin(UniverSheetsPlugin);
    univer.registerPlugin(UniverDrawingPlugin);
    univer.registerPlugin(UniverSheetsDrawingPlugin);

    const workbook = univer.createUnit<IWorkbookData, Workbook>(
        UniverInstanceType.UNIVER_SHEET,
        Tools.deepClone(workbookData ?? TEST_WORKBOOK_DATA)
    );

    get(IUniverInstanceService).focusUnit(workbook.getUnitId());
    get(ILogService).setLogLevel(LogLevel.SILENT);

    const localeService = get(LocaleService);
    localeService.load({ enUS });
    localeService.setLocale(LocaleType.EN_US);

    return {
        univer,
        get,
        injector,
        workbook,
        commandService: get(ICommandService),
    };
}
