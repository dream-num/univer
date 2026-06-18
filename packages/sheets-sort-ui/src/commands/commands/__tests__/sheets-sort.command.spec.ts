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
import { ReorderRangeCommand, ReorderRangeMutation, SetRangeValuesMutation, SetSelectionsOperation, SheetsSelectionsService } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SheetsSortUIService } from '../../../services/sheets-sort-ui.service';
import {
    SortRangeAscCommand,
    SortRangeAscExtCommand,
    SortRangeAscExtInCtxMenuCommand,
    SortRangeAscInCtxMenuCommand,
    SortRangeCustomCommand,
    SortRangeCustomInCtxMenuCommand,
    SortRangeDescCommand,
    SortRangeDescExtCommand,
    SortRangeDescExtInCtxMenuCommand,
    SortRangeDescInCtxMenuCommand,
} from '../sheets-sort.command';
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
            SetSelectionsOperation,
            SortRangeAscCommand,
            SortRangeAscExtCommand,
            SortRangeAscInCtxMenuCommand,
            SortRangeAscExtInCtxMenuCommand,
            SortRangeCustomCommand,
            SortRangeDescCommand,
            SortRangeDescExtCommand,
            SortRangeDescInCtxMenuCommand,
            SortRangeDescExtInCtxMenuCommand,
            SortRangeCustomInCtxMenuCommand,
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

    function selectSortRange() {
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
    }

    function expectAscendingSortResult() {
        expect(getValues(0, 9, 0, 9)?.[0]?.[0]?.v).toBe(1);
        expect(getValues(6, 9, 6, 9)?.[0]?.[0]?.v).toBe(7);
        expect(getValues(0, 11, 0, 11)?.[0]?.[0]?.f).toBe('=J1/K1');
        expect(getValues(6, 11, 6, 11)?.[0]?.[0]?.f).toBe('=SUM(J7:K8)');
    }

    function expectDescendingSortResult() {
        expect(getValues(0, 9, 0, 9)?.[0]?.[0]?.v).toBe(7);
        expect(getValues(6, 9, 6, 9)?.[0]?.[0]?.v).toBe(1);
        expect(getValues(0, 11, 0, 11)?.[0]?.[0]?.f).toBe('=SUM(J1:K2)');
        expect(getValues(6, 11, 6, 11)?.[0]?.[0]?.f).toBe('=J7/K7');
    }

    function expectAscendingExtendedSortResult() {
        expect(getValues(0, 9, 0, 9)?.[0]?.[0]?.v).toBe(1);
        expect(getValues(1, 9, 1, 9)?.[0]?.[0]?.v).toBe(1);
        expect(getValues(7, 9, 7, 9)?.[0]?.[0]?.v).toBe(7);
        expect(get(SheetsSelectionsService).getCurrentLastSelection()?.range).toMatchObject({
            startRow: 0,
            startColumn: 9,
            endRow: 7,
            endColumn: 11,
        });
    }

    function expectDescendingExtendedSortResult() {
        expect(getValues(0, 9, 0, 9)?.[0]?.[0]?.v).toBe(7);
        expect(getValues(6, 9, 6, 9)?.[0]?.[0]?.v).toBe(1);
        expect(getValues(7, 9, 7, 9)?.[0]?.[0]?.v).toBe(1);
        expect(get(SheetsSelectionsService).getCurrentLastSelection()?.range).toMatchObject({
            startRow: 0,
            startColumn: 9,
            endRow: 7,
            endColumn: 11,
        });
    }

    it('sorts the selected range ascending through executeCommand', async () => {
        selectSortRange();

        expect(await commandService.executeCommand(SortRangeAscCommand.id)).toBe(true);
        expectAscendingSortResult();
    });

    it('sorts the selected range descending through executeCommand and rewrites formulas', async () => {
        selectSortRange();

        expect(await commandService.executeCommand(SortRangeDescCommand.id)).toBe(true);
        expectDescendingSortResult();
    });

    it('sorts ascending from the extended range menu command', async () => {
        selectSortRange();

        expect(await commandService.executeCommand(SortRangeAscExtCommand.id)).toBe(true);
        expectAscendingExtendedSortResult();
    });

    it('sorts descending from the extended range menu command', async () => {
        selectSortRange();

        expect(await commandService.executeCommand(SortRangeDescExtCommand.id)).toBe(true);
        expectDescendingExtendedSortResult();
    });

    it('sorts ascending from the context menu command', async () => {
        selectSortRange();

        expect(await commandService.executeCommand(SortRangeAscInCtxMenuCommand.id)).toBe(true);
        expectAscendingSortResult();
    });

    it('sorts descending from the context menu command', async () => {
        selectSortRange();

        expect(await commandService.executeCommand(SortRangeDescInCtxMenuCommand.id)).toBe(true);
        expectDescendingSortResult();
    });

    it('sorts ascending from the extended context menu command', async () => {
        selectSortRange();

        expect(await commandService.executeCommand(SortRangeAscExtInCtxMenuCommand.id)).toBe(true);
        expectAscendingExtendedSortResult();
    });

    it('sorts descending from the extended context menu command', async () => {
        selectSortRange();

        expect(await commandService.executeCommand(SortRangeDescExtInCtxMenuCommand.id)).toBe(true);
        expectDescendingExtendedSortResult();
    });

    it('opens custom sort panel for the selected range', async () => {
        selectSortRange();

        expect(await commandService.executeCommand(SortRangeCustomCommand.id)).toBe(true);

        const customSortState = get(SheetsSortUIService).customSortState();
        expect(customSortState?.show).toBe(true);
        expect(customSortState?.location).toMatchObject({
            unitId: 'test',
            subUnitId: 'sheet1',
            colIndex: 9,
            range: {
                startRow: 0,
                startColumn: 9,
                endRow: 6,
                endColumn: 11,
            },
        });
    });

    it('opens custom sort panel from the context menu command', async () => {
        selectSortRange();

        expect(await commandService.executeCommand(SortRangeCustomInCtxMenuCommand.id)).toBe(true);

        const customSortState = get(SheetsSortUIService).customSortState();
        expect(customSortState?.show).toBe(true);
        expect(customSortState?.location?.range).toMatchObject({
            startRow: 0,
            startColumn: 9,
            endRow: 6,
            endColumn: 11,
        });
    });
});
