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

import type { IRange } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { Subscription } from 'rxjs';
import type { ITestBed } from '../../commands/commands/__tests__/create-command-test-bed';
import {
    ICommandService,
    IUniverInstanceService,
    LocaleType,
    RANGE_TYPE,
    RedoCommand,
    UndoCommand,
} from '@univerjs/core';
import {
    AddWorksheetMergeMutation,
    ExclusiveRangeService,
    IExclusiveRangeService,
    MergeCellController,
    RefRangeService,
    RemoveWorksheetMergeCommand,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetActiveOperation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCommandTestBed } from '../../commands/commands/__tests__/create-command-test-bed';
import { CellMergeMenuItemFactory } from '../merge.menu';

describe('merge menu active state', () => {
    let testBed: ITestBed;
    let commandService: ICommandService;
    let selections: SheetsSelectionsService;
    let subscription: Subscription;
    let active: boolean;

    const mergedRange: IRange = {
        startRow: 1,
        endRow: 2,
        startColumn: 1,
        endColumn: 2,
        rangeType: RANGE_TYPE.NORMAL,
    };

    function selectCell(row: number, column: number, range?: IRange): ISelectionWithStyle {
        const cell = testBed.sheet.getActiveSheet().getCellInfoInMergeData(row, column);
        return {
            range: range ?? { startRow: row, endRow: row, startColumn: column, endColumn: column },
            primary: { ...cell, actualRow: row, actualColumn: column },
            style: null,
        };
    }

    function subscribe() {
        subscription = CellMergeMenuItemFactory(testBed.univer.__getInjector()).activated$!.subscribe((value) => {
            active = value;
        });
    }

    beforeEach(() => {
        testBed = createCommandTestBed({
            id: 'test',
            appVersion: '3.0.0-alpha',
            locale: LocaleType.EN_US,
            name: '',
            styles: {},
            sheetOrder: ['sheet1', 'sheet2'],
            sheets: {
                sheet1: { id: 'sheet1', mergeData: [mergedRange] },
                sheet2: { id: 'sheet2' },
            },
        }, [
            [IExclusiveRangeService, { useClass: ExclusiveRangeService }],
            [RefRangeService],
            [MergeCellController],
        ]);
        commandService = testBed.get(ICommandService);
        selections = testBed.get(SheetsSelectionsService);
        [
            AddWorksheetMergeMutation,
            RemoveWorksheetMergeMutation,
            RemoveWorksheetMergeCommand,
            SetRangeValuesMutation,
            SetSelectionsOperation,
            SetWorksheetActiveOperation,
        ].forEach((command) => commandService.registerCommand(command));
    });

    afterEach(() => {
        subscription?.unsubscribe();
        testBed.univer.dispose();
    });

    it('follows the focused cell, including the merge anchor and the last of multiple selections', () => {
        selections.setSelections([selectCell(1, 1, mergedRange)]);
        subscribe();
        expect(active).toBe(true);

        const ordinaryCell = selectCell(0, 0, { startRow: 0, endRow: 4, startColumn: 0, endColumn: 4 });
        selections.setSelections([ordinaryCell]);
        expect(active).toBe(false);

        const mergedCell = selectCell(2, 2, mergedRange);
        selections.setSelections([ordinaryCell, mergedCell]);
        expect(active).toBe(true);
        selections.setSelections([mergedCell, ordinaryCell]);
        expect(active).toBe(false);
        selections.setSelections([]);
        expect(active).toBe(false);
    });

    it('updates after unmerge, undo and redo without requiring another cell click', async () => {
        selections.setSelections([selectCell(1, 1, mergedRange)]);
        subscribe();
        expect(active).toBe(true);

        expect(await commandService.executeCommand(RemoveWorksheetMergeCommand.id)).toBe(true);
        expect(active).toBe(false);
        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(active).toBe(true);
        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(active).toBe(false);

        // The selection can still carry pre-mutation merge flags, so read the worksheet's merge model.
        expect(commandService.syncExecuteCommand(AddWorksheetMergeMutation.id, {
            unitId: testBed.sheet.getUnitId(),
            subUnitId: 'sheet1',
            ranges: [mergedRange],
        })).toBe(true);
        expect(active).toBe(true);
    });

    it('refreshes when switching sheets and when there is no current workbook', () => {
        selections.setSelections([selectCell(1, 1, mergedRange)]);
        selections.setSelections('test', 'sheet2', [selectCell(1, 1, mergedRange)]);
        subscribe();
        expect(active).toBe(true);

        expect(commandService.syncExecuteCommand(SetWorksheetActiveOperation.id, {
            unitId: 'test',
            subUnitId: 'sheet2',
        })).toBe(true);
        expect(active).toBe(false);
        expect(commandService.syncExecuteCommand(SetWorksheetActiveOperation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
        })).toBe(true);
        expect(active).toBe(true);

        testBed.get(IUniverInstanceService).disposeUnit('test');
        expect(active).toBe(false);
    });
});
