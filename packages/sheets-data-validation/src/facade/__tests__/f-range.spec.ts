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

/* eslint-disable ts/no-non-null-asserted-optional-chain */

import type { Injector } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import { DataValidationType, ICommandService } from '@univerjs/core';
import { AddSheetDataValidationCommand } from '@univerjs/sheets-data-validation';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from './create-test-bed';

describe('Test FRange', () => {
    let get: Injector['get'];
    let commandService: ICommandService;
    let univerAPI: FUniver;

    beforeEach(() => {
        const testBed = createFacadeTestBed();
        get = testBed.get;

        univerAPI = testBed.univerAPI;

        commandService = get(ICommandService);
        commandService.registerCommand(AddSheetDataValidationCommand);
    });

    it('Range set data validation', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet()!;
        const range = activeSheet.getRange(0, 0, 10, 10);
        const range2 = activeSheet.getRange(11, 11, 2, 2);
        await range.setDataValidation(univerAPI.newDataValidation().requireCheckbox().build());
        await range2?.setDataValidation(univerAPI.newDataValidation().requireNumberEqualTo(1).build());
        const range3 = activeSheet.getRange(0, 0, 100, 100);

        expect(range.getDataValidation()).toBeTruthy();
        expect(range.getDataValidation()?.rule.ranges).toEqual([{
            unitId: univerAPI.getActiveWorkbook()?.getId(),
            sheetId: activeSheet.getSheetId(),
            startRow: 0,
            endRow: 9,
            startColumn: 0,
            endColumn: 9,
        }]);
        expect(range.getDataValidation()?.getCriteriaType()).toEqual(DataValidationType.CHECKBOX);
        expect(range.getDataValidations().length).toEqual(1);
        expect(range3?.getDataValidations().length).toEqual(2);

        expect(activeSheet?.getDataValidations().length).toEqual(2);
    });
});
