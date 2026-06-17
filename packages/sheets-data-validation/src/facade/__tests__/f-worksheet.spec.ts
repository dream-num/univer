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

import type { Injector, IWorkbookData } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import {
    ICommandService,
    LocaleType,
} from '@univerjs/core';
import {
    AddSheetDataValidationCommand,
    ClearRangeDataValidationCommand,
    RemoveSheetAllDataValidationCommand,
    RemoveSheetDataValidationCommand,
    UpdateSheetDataValidationOptionsCommand,
    UpdateSheetDataValidationRangeCommand,
    UpdateSheetDataValidationSettingCommand,
} from '@univerjs/sheets-data-validation';
import { beforeEach, describe } from 'vitest';
import { createFacadeTestBed } from './create-test-bed';

function createWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: ['sheet1'],
        styles: {},
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'sheet1',
                rowCount: 100,
                columnCount: 100,
                cellData: {
                    0: { 0: { v: 1, t: 2 } },
                    1: { 0: { v: 2, t: 2 } },
                    2: { 0: { v: 3, t: 2 } },
                    3: { 0: { v: 4, t: 2 } },
                },
            },
        },
    };
}

describe('Test FWorksheet data validation facade', () => {
    let get: Injector['get'];
    let univerAPI: FUniver;

    beforeEach(() => {
        const testBed = createFacadeTestBed(createWorkbookData());
        get = testBed.get;
        univerAPI = testBed.univerAPI;

        const commandService = get(ICommandService);
        [
            AddSheetDataValidationCommand,
            ClearRangeDataValidationCommand,
            RemoveSheetAllDataValidationCommand,
            RemoveSheetDataValidationCommand,
            UpdateSheetDataValidationOptionsCommand,
            UpdateSheetDataValidationRangeCommand,
            UpdateSheetDataValidationSettingCommand,
        ].forEach((command) => commandService.registerCommand(command));
    });
});
