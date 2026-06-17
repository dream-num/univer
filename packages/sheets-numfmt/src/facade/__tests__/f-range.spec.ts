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
import { RemoveNumfmtMutation, SetNumfmtMutation, SetRangeValuesMutation } from '@univerjs/sheets';
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
            SetNumfmtMutation,
            RemoveNumfmtMutation,
            SetNumfmtCommand,
        ].forEach((command) => commandService.registerCommand(command));
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
});
