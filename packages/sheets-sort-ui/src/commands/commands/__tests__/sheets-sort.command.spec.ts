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

import type { ICellData, Injector, Nullable, Univer } from '@univerjs/core';
import { ICommandService, IConfirmService, RANGE_TYPE, TestConfirmService } from '@univerjs/core';
import { ReorderRangeCommand, ReorderRangeMutation, SetRangeValuesMutation, SheetsSelectionsService } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SortRangeAscCommand, SortRangeDescCommand } from '../sheets-sort.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Sheets sort commands integration', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<ICellData>>> | undefined;

    beforeEach(() => {
        const testBed = createCommandTestBed(undefined, [
            [IConfirmService, { useClass: TestConfirmService }],
        ]);

        univer = testBed.univer;
        get = testBed.get;
        commandService = get(ICommandService);

        [
            ReorderRangeCommand,
            ReorderRangeMutation,
            SetRangeValuesMutation,
            SortRangeAscCommand,
            SortRangeDescCommand,
        ].forEach((command) => commandService.registerCommand(command));

        getValues = (startRow, startColumn, endRow, endColumn) =>
            testBed.sheet
                .getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValues();
    });

    afterEach(() => {
        univer.dispose();
    });

    it('sorts the selected range ascending through executeCommand', async () => {
        get(SheetsSelectionsService).addSelections([{
            range: {
                startRow: 0,
                startColumn: 9,
                endRow: 6,
                endColumn: 11,
                rangeType: RANGE_TYPE.NORMAL,
            },
            primary: {
                actualRow: 0,
                actualColumn: 9,
                startRow: 0,
                startColumn: 9,
                endRow: 6,
                endColumn: 11,
                isMerged: false,
                isMergedMainCell: false,
            },
            style: null,
        }]);

        expect(await commandService.executeCommand(SortRangeAscCommand.id)).toBe(true);

        expect(getValues(0, 9, 0, 9)?.[0]?.[0]?.v).toBe(1);
        expect(getValues(6, 9, 6, 9)?.[0]?.[0]?.v).toBe(7);
        expect(getValues(0, 11, 0, 11)?.[0]?.[0]?.f).toBe('=J1/K1');
        expect(getValues(6, 11, 6, 11)?.[0]?.[0]?.f).toBe('=SUM(J7:K8)');
    });

    it('sorts the selected range descending through executeCommand and rewrites formulas', async () => {
        get(SheetsSelectionsService).addSelections([{
            range: {
                startRow: 0,
                startColumn: 9,
                endRow: 6,
                endColumn: 11,
                rangeType: RANGE_TYPE.NORMAL,
            },
            primary: {
                actualRow: 0,
                actualColumn: 9,
                startRow: 0,
                startColumn: 9,
                endRow: 6,
                endColumn: 11,
                isMerged: false,
                isMergedMainCell: false,
            },
            style: null,
        }]);

        expect(await commandService.executeCommand(SortRangeDescCommand.id)).toBe(true);

        expect(getValues(0, 9, 0, 9)?.[0]?.[0]?.v).toBe(7);
        expect(getValues(6, 9, 6, 9)?.[0]?.[0]?.v).toBe(1);
        expect(getValues(0, 11, 0, 11)?.[0]?.[0]?.f).toBe('=SUM(J1:K2)');
        expect(getValues(6, 11, 6, 11)?.[0]?.[0]?.f).toBe('=J7/K7');
    });
});
