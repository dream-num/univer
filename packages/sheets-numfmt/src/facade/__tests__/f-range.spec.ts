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

import type { FUniver } from '@univerjs/core/facade';
import { ICommandService } from '@univerjs/core';
import { RemoveNumfmtMutation, SetNumfmtMutation, SetRangeValuesCommand, SetRangeValuesMutation } from '@univerjs/sheets';
import { beforeEach, describe, expect, it } from 'vitest';
import { SetNumfmtCommand, SheetsNumfmtCellContentController } from '../../index';
import { createFacadeTestBed } from './create-test-bed';
import '../index';

describe('Test FRange', () => {
    let univerAPI: FUniver;
    let testBed: ReturnType<typeof createFacadeTestBed>;

    beforeEach(() => {
        testBed = createFacadeTestBed(undefined, [[SheetsNumfmtCellContentController]]);
        const commandService = testBed.injector.get(ICommandService);
        [
            SetRangeValuesMutation,
            SetRangeValuesCommand,
            SetNumfmtMutation,
            RemoveNumfmtMutation,
            SetNumfmtCommand,
        ].forEach((command) => commandService.registerCommand(command));
        testBed.injector.get(SheetsNumfmtCellContentController);
        univerAPI = testBed.univerAPI;
    });

    it('sets and reads number formats on a single range and a range grid', () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const singleCell = activeSheet.getRange('A1');

        expect(singleCell.setNumberFormat('#,##0.00')).toBe(singleCell);
        expect(singleCell.getNumberFormat()).toBe('#,##0.00');

        const range = activeSheet.getRange('A1:B2');
        range.setNumberFormats([
            ['#,##0.00', '0.00%'],
            ['yyyy-MM-DD', ''],
        ]);

        expect(range.getNumberFormats()).toEqual([
            ['#,##0.00', '0.00%'],
            ['yyyy-MM-DD', ''],
        ]);
    });

    it('sets workbook number format locale through the facade API', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        expect(workbook.setNumfmtLocal('fr')).toBe(workbook);
    });

    it('reads numeric cell values independently of their display formats', () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const range = activeSheet.getRange('A1:C2');
        activeSheet.getRange('A1:C1').setValues([[0.25, 1.23456, 45658]]);
        const hiddenCell = activeSheet.getRange('A2');
        hiddenCell.setValue(233628);
        range.setNumberFormats([
            ['0%', '0.00', 'yyyy-mm-dd'],
            [';;;', '', ''],
        ]);

        expect(range.getValue()).toBe(0.25);
        expect(range.getValue(true)).toBe(0.25);
        expect(range.getDisplayValue()).toBe('25%');
        expect(range.getValues()).toEqual([
            [0.25, 1.23456, 45658],
            [233628, null, null],
        ]);
        expect(range.getDisplayValues()).toEqual([
            ['25%', '1.23', '2025-01-01'],
            ['', '', ''],
        ]);

        expect(hiddenCell.getValue()).toBe(233628);
        expect(hiddenCell.getRawValue()).toBe(233628);
        expect(hiddenCell.getNumberFormat()).toBe(';;;');
    });
});
