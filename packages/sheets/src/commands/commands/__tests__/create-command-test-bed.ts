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
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    Tools,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import enUS from '../../../locale/en-US';
import { RangeProtectionRuleModel } from '../../../model/range-protection-rule.model';
import { BorderStyleManagerService } from '../../../services/border-style-manager.service';
import { WorkbookPermissionService } from '../../../services/permission/workbook-permission/workbook-permission.service';
import { WorksheetProtectionPointModel, WorksheetProtectionRuleModel } from '../../../services/permission/worksheet-permission';
import { WorksheetPermissionService } from '../../../services/permission/worksheet-permission/worksheet-permission.service';
import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import { SheetInterceptorService } from '../../../services/sheet-interceptor/sheet-interceptor.service';

const TEST_WORKBOOK_DATA_DEMO: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            name: 'sheet1',
            cellData: {
                0: {
                    0: {
                        v: 'A1',
                    },
                    1: {
                        v: 'A2',
                    },
                },
            },
            columnData: {
                1: {
                    hd: BooleanNumber.FALSE,
                },
            },
            rowData: {
                1: {
                    hd: BooleanNumber.FALSE,
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
            injector.add([WorksheetPermissionService]);
            injector.add([WorksheetProtectionPointModel]);
            injector.add([RangeProtectionRuleModel]);
            injector.add([WorkbookPermissionService]);
            injector.add([WorksheetProtectionRuleModel]);
            injector.add([SheetsSelectionsService]);
            injector.add([BorderStyleManagerService]);
            injector.add([SheetInterceptorService]);

            dependencies?.forEach((d) => injector.add(d));

            this._injector.get(SheetInterceptorService);
            this._injector.get(WorkbookPermissionService);
            this._injector.get(WorksheetPermissionService);
        }
    }

    univer.registerPlugin(TestPlugin);
    const sheet = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, Tools.deepClone(workbookData || TEST_WORKBOOK_DATA_DEMO));

    const univerInstanceService = injector.get(IUniverInstanceService);
    univerInstanceService.focusUnit('test');
    const logService = injector.get(ILogService);

    logService.setLogLevel(LogLevel.SILENT); // change this to `LogLevel.VERBOSE` to debug tests via logs

    const localeService = injector.get(LocaleService);
    localeService.load({ enUS });

    return {
        univer,
        get: injector.get.bind(injector),
        sheet,
    };
}
