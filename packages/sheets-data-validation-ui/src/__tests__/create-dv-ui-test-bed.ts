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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import type { ISheetClipboardHook } from '@univerjs/sheets-ui';
import {
    Disposable,
    ICommandService,
    ILogService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    toDisposable,
    Tools,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { UniverDataValidationPlugin } from '@univerjs/data-validation';
import { IAutoFillService, UniverSheetsPlugin } from '@univerjs/sheets';
import { SheetDataValidationModel, UniverSheetsDataValidationPlugin } from '@univerjs/sheets-data-validation';
import { ISheetClipboardService } from '@univerjs/sheets-ui';
import enUS from '@univerjs/sheets/locale/en-US';

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
            rowCount: 200_000,
            columnCount: 2_000,
            cellData: {},
        },
        sheet2: {
            id: 'sheet2',
            name: 'Sheet2',
            rowCount: 100,
            columnCount: 100,
            cellData: {},
        },
    },
};

class TestSheetClipboardService extends Disposable {
    private _hooks: ISheetClipboardHook[] = [];

    addClipboardHook(hook: ISheetClipboardHook) {
        this._hooks.push(hook);
        return toDisposable(() => {
            this._hooks = this._hooks.filter((item) => item !== hook);
        });
    }

    getHooks() {
        return this._hooks;
    }
}

export function createDvUiTestBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const get = injector.get.bind(injector);

    univer.registerPlugin(UniverDataValidationPlugin);
    univer.registerPlugin(UniverSheetsPlugin, { notExecuteFormula: true });
    univer.registerPlugin(UniverSheetsDataValidationPlugin);

    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, Tools.deepClone(TEST_WORKBOOK_DATA));
    get(IUniverInstanceService).focusUnit(workbook.getUnitId());
    get(ILogService).setLogLevel(LogLevel.SILENT);
    get(LocaleService).load({ enUS });
    get(LocaleService).setLocale(LocaleType.EN_US);

    injector.add([ISheetClipboardService, { useClass: TestSheetClipboardService as never }]);
    const clipboardService = get(ISheetClipboardService) as unknown as TestSheetClipboardService;

    return {
        univer,
        injector,
        workbook,
        commandService: get(ICommandService),
        dataValidationModel: get(SheetDataValidationModel),
        autoFillService: get(IAutoFillService),
        getClipboardHook: () => clipboardService.getHooks()[0],
        unitId: 'test',
        subUnitId: 'sheet1',
    };
}
