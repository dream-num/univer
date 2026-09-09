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

import type { Injector, IRange, IWorkbookData, Nullable, Univer, Workbook } from '@univerjs/core';
import {
    ICommandService,
    IUniverInstanceService,
    LocaleType,
    RedoCommand,
    Tools,
    UndoCommand,
    UniverInstanceType,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MergeCellController } from '../../../controllers/merge-cell.controller';
import { RefRangeService } from '../../../services/ref-range/ref-range.service';
import { SheetsSelectionsService } from '../../../services/selections';
import { AddWorksheetMergeMutation } from '../../mutations/add-worksheet-merge.mutation';
import { MoveRangeMutation } from '../../mutations/move-range.mutation';
import { RemoveWorksheetMergeMutation } from '../../mutations/remove-worksheet-merge.mutation';
import { SetSelectionsOperation } from '../../operations/selection.operation';
import { SetWorksheetActiveOperation } from '../../operations/set-worksheet-active.operation';
import { MoveRangeCommand } from '../move-range.command';
import { SetRangeValuesCommand } from '../set-range-values.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test move range commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let sheetsSelectionsService: SheetsSelectionsService;

    beforeEach(() => {
        const testBed = createInsertRowColTestBed();
        univer = testBed.univer;
        get = testBed.get;
        get(MergeCellController);
        commandService = get(ICommandService);
        sheetsSelectionsService = get(SheetsSelectionsService);

        [
            AddWorksheetMergeMutation,
            RemoveWorksheetMergeMutation,
            SetRangeValuesCommand,
            MoveRangeCommand,
            MoveRangeMutation,
            SetSelectionsOperation,
            SetWorksheetActiveOperation,
        ].forEach((c) => commandService.registerCommand(c));
    });

    afterEach(() => univer.dispose());

    describe('move range', () => {
        it('move c2:d2 to g5', async () => {
            const fromRange: IRange = {
                startRow: 1,
                endRow: 1,
                startColumn: 2,
                endColumn: 3,
            };
            const toRange: IRange = {
                startRow: 1,
                endRow: 1,
                startColumn: 6,
                endColumn: 6,
            };
            const result = await commandService.executeCommand(MoveRangeCommand.id, { fromRange, toRange });
            expect(result).toBeTruthy();
            const mergeCell = getMergedInfo(1, 6);
            expect(getMergeData().length).toBe(2);
            expect(mergeCell).toEqual({ startRow: 1, endRow: 1, startColumn: 6, endColumn: 7 });
        });

        it('move a1 to c2 ', async () => {
            const fromRange: IRange = {
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 0,
            };
            const toRange: IRange = {
                startRow: 1,
                endRow: 1,
                startColumn: 2,
                endColumn: 2,
            };
            const result = await commandService.executeCommand(MoveRangeCommand.id, { fromRange, toRange });
            expect(result).toBeFalsy();
        });

        it('move a1 to c2 ,should be stopped', async () => {
            const fromRange: IRange = {
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 0,
            };
            const toRange: IRange = {
                startRow: 1,
                endRow: 1,
                startColumn: 2,
                endColumn: 2,
            };
            const result = await commandService.executeCommand(MoveRangeCommand.id, { fromRange, toRange });
            expect(result).toBeFalsy();
        });

        it('move merged cells requires setting the correct selection', async () => {
            const fromRange: IRange = {
                startRow: 2,
                endRow: 3,
                startColumn: 2,
                endColumn: 2,
            };
            const toRange: IRange = {
                startRow: 5,
                endRow: 6,
                startColumn: 2,
                endColumn: 2,
            };
            const result = await commandService.executeCommand(MoveRangeCommand.id, { fromRange, toRange });
            expect(result).toBeTruthy();
            const selections = sheetsSelectionsService.getCurrentSelections();
            expect(selections.length).toBe(1);
            const selection = selections[0];
            expect(selection.range).toEqual(toRange);
        });

        it('keeps the source merge when moving it onto an equivalent target merge', async () => {
            const fromRange: IRange = {
                startRow: 2,
                endRow: 3,
                startColumn: 2,
                endColumn: 2,
            };
            const toRange: IRange = {
                startRow: 5,
                endRow: 6,
                startColumn: 2,
                endColumn: 2,
            };
            await commandService.executeCommand(AddWorksheetMergeMutation.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                ranges: [toRange],
            });

            expect(await commandService.executeCommand(MoveRangeCommand.id, { fromRange, toRange })).toBeTruthy();
            expect(getMergedInfo(toRange.startRow, toRange.startColumn)).toEqual(toRange);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getMergedInfo(fromRange.startRow, fromRange.startColumn)).toEqual(fromRange);
            expect(getMergedInfo(toRange.startRow, toRange.startColumn)).toEqual(toRange);

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getMergedInfo(fromRange.startRow, fromRange.startColumn)).toBeNull();
            expect(getMergedInfo(toRange.startRow, toRange.startColumn)).toEqual(toRange);
        });

        it('moves merged cells across worksheets and restores merges on undo and redo', async () => {
            const fromRange: IRange = {
                startRow: 2,
                endRow: 3,
                startColumn: 2,
                endColumn: 2,
            };
            const toRange: IRange = {
                startRow: 5,
                endRow: 6,
                startColumn: 2,
                endColumn: 2,
            };
            await commandService.executeCommand(SetWorksheetActiveOperation.id, {
                unitId: 'test',
                subUnitId: 'sheet2',
            });

            expect(await commandService.executeCommand(MoveRangeCommand.id, {
                fromRange,
                toRange,
                fromUnitId: 'test',
                fromSubUnitId: 'sheet1',
                toUnitId: 'test',
                toSubUnitId: 'sheet2',
            })).toBeTruthy();
            expect(getMergedInfo(fromRange.startRow, fromRange.startColumn, 'sheet1')).toBeNull();
            expect(getMergedInfo(toRange.startRow, toRange.startColumn, 'sheet2')).toEqual(toRange);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getMergedInfo(fromRange.startRow, fromRange.startColumn, 'sheet1')).toEqual(fromRange);
            expect(getMergedInfo(toRange.startRow, toRange.startColumn, 'sheet2')).toBeNull();

            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getMergedInfo(fromRange.startRow, fromRange.startColumn, 'sheet1')).toBeNull();
            expect(getMergedInfo(toRange.startRow, toRange.startColumn, 'sheet2')).toEqual(toRange);
        });

        it('move c1:d2 to c3 ,should be replace', async () => {
            const fromRange: IRange = {
                startRow: 0,
                endRow: 1,
                startColumn: 2,
                endColumn: 3,
            };
            const toRange: IRange = {
                startRow: 2,
                endRow: 3,
                startColumn: 2,
                endColumn: 3,
            };
            const result = await commandService.executeCommand(MoveRangeCommand.id, { fromRange, toRange });
            expect(result).toBeTruthy();
            const mergeData = getMergeData();
            expect(mergeData.length).toBe(1);
            expect(mergeData[0]).toEqual({ startRow: 3, endRow: 3, startColumn: 2, endColumn: 3 });
        });
    });

    function getMergedInfo(row: number, col: number, subUnitId?: string): Nullable<IRange> {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = subUnitId ? workbook.getSheetBySheetId(subUnitId)! : workbook.getActiveSheet()!;
        return worksheet.getMergedCell(row, col);
    }

    function getMergeData() {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;
        return worksheet.getConfig().mergeData;
    }
});

const TEST_ROW_COL_INSERTION_DEMO: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    0: {
                        v: 'A1',
                        s: 's1',
                    },
                },
                1: {
                    1: {
                        v: 'B2',
                        s: 's2',
                    },
                    4: {
                        v: 'E2',
                        s: 's3',
                    },
                },
                2: {
                    1: {
                        v: 'B3',
                        s: 's4',
                    },
                },
            },
            mergeData: [
                { startRow: 1, endRow: 1, startColumn: 2, endColumn: 3 },
                {
                    startRow: 2,
                    endRow: 3,
                    startColumn: 2,
                    endColumn: 2,
                },
            ],
            rowCount: 20,
            columnCount: 20,
        },
        sheet2: {
            id: 'sheet2',
            cellData: {},
            mergeData: [],
            rowCount: 20,
            columnCount: 20,
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: ['sheet1', 'sheet2'],
    styles: {},
};

function createInsertRowColTestBed() {
    return createCommandTestBed(Tools.deepClone(TEST_ROW_COL_INSERTION_DEMO), [
        [MergeCellController],
        [RefRangeService],
    ]);
}
