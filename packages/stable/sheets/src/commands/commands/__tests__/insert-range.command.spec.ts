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

import type { ICellData, Injector, IRange, IStyleData, IWorkbookData, Nullable, Univer } from '@univerjs/core';
import {
    ICommandService,
    IUniverInstanceService,
    LocaleType,
    RANGE_TYPE,
    Rectangle,
    RedoCommand,
    Tools,
    UndoCommand,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { MergeCellController } from '../../../controllers/merge-cell.controller';
import { RefRangeService } from '../../../services/ref-range/ref-range.service';
import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import { AddWorksheetMergeMutation } from '../../mutations/add-worksheet-merge.mutation';
import { InsertColMutation, InsertRowMutation } from '../../mutations/insert-row-col.mutation';
import { MoveRangeMutation } from '../../mutations/move-range.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../../mutations/remove-row-col.mutation';
import { RemoveWorksheetMergeMutation } from '../../mutations/remove-worksheet-merge.mutation';
import { SetRangeValuesMutation } from '../../mutations/set-range-values.mutation';
import { SetSelectionsOperation } from '../../operations/selection.operation';
import { InsertRangeMoveDownCommand } from '../insert-range-move-down.command';
import { InsertRangeMoveRightCommand } from '../insert-range-move-right.command';
import { createCommandTestBed } from './create-command-test-bed';

const mergeData = [
    {
        startRow: 0,
        endRow: 1,
        startColumn: 2,
        endColumn: 2,
    },
    {
        startRow: 1,
        endRow: 2,
        startColumn: 3,
        endColumn: 3,
    },
    {
        startRow: 1,
        endRow: 1,
        startColumn: 6,
        endColumn: 7,
    },
    {
        startRow: 1,
        endRow: 1,
        startColumn: 9,
        endColumn: 11,
    },
    {
        startRow: 2,
        endRow: 2,
        startColumn: 5,
        endColumn: 6,
    },
    {
        startRow: 2,
        endRow: 2,
        startColumn: 9,
        endColumn: 10,
    },
    {
        startRow: 4,
        endRow: 6,
        startColumn: 2,
        endColumn: 2,
    },
    {
        startRow: 5,
        endRow: 6,
        startColumn: 3,
        endColumn: 3,
    },
];
const WORKBOOK_DATA_DEMO: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                0: {
                    0: {
                        v: 'A1',
                    },
                    1: {
                        v: 'B1',
                    },
                    2: {
                        v: 'C1',
                    },
                },
                1: {
                    0: {
                        v: 'A2',
                    },
                    1: {
                        v: 'B2',
                    },
                    3: {
                        v: 'D2',
                    },
                    6: {
                        v: 'G2',
                    },
                    9: {
                        v: 'J2',
                    },
                },
                2: {
                    5: {
                        v: 'F3',
                    },
                    9: {
                        v: 'J3',
                    },
                },
                4: {
                    2: {
                        v: 'C5',
                    },
                },
                5: {
                    3: {
                        v: 'D6',
                    },
                },
            },
            mergeData,
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

describe('Test insert range commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let selectionManager: SheetsSelectionsService;
    let deduplicateRanges: (ranges: Array<Nullable<IRange>>) => IRange[];
    let getValueByPosition: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Nullable<ICellData>;
    let getStyleByPosition: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Nullable<IStyleData>;
    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<ICellData>>> | undefined;
    let getMergedCells: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => IRange[] | undefined;

    beforeEach(() => {
        const data = Tools.deepClone(WORKBOOK_DATA_DEMO);
        const testBed = createCommandTestBed(data, [[MergeCellController], [RefRangeService]]);
        univer = testBed.univer;
        get = testBed.get;
        get(MergeCellController);

        commandService = get(ICommandService);
        commandService.registerCommand(InsertRangeMoveDownCommand);
        commandService.registerCommand(InsertRangeMoveRightCommand);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
        commandService.registerCommand(InsertColMutation);
        commandService.registerCommand(RemoveColMutation);
        commandService.registerCommand(InsertRowMutation);
        commandService.registerCommand(RemoveRowMutation);
        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(MoveRangeMutation);

        selectionManager = get(SheetsSelectionsService);

        getValueByPosition = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<ICellData> => {
            const worksheet = get(IUniverInstanceService)?.getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
            const value = worksheet?.getRange(startRow, startColumn, endRow, endColumn);
            return value?.getValue();
        };

        getStyleByPosition = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<IStyleData> => {
            const value = getValueByPosition(startRow, startColumn, endRow, endColumn);
            const styles = get(IUniverInstanceService).getUniverSheetInstance('test')?.getStyles();
            if (value && styles) {
                return styles.getStyleByCell(value);
            }
        };

        deduplicateRanges = (ranges: Array<Nullable<IRange>>): IRange[] => {
            const deduplicated: IRange[] = [];

            for (const range of ranges) {
                if (range) {
                    const exists = deduplicated.some((existingRange) => Rectangle.equals(existingRange, range));

                    if (!exists) {
                        deduplicated.push(range);
                    }
                }
            }

            return deduplicated;
        };

        getValues = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Array<Array<Nullable<ICellData>>> | undefined =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValues();

        getMergedCells = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): IRange[] | undefined =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getMergeData()
                .filter((rect) => Rectangle.intersects({ startRow, startColumn, endRow, endColumn }, rect));
    });

    afterEach(() => {
        univer.dispose();
    });
    describe('Insert range move right', () => {
        describe('correct situations', () => {
            it('will insert range when there is a selected range, no merged cells', async () => {
                selectionManager.setSelections([
                    {
                        range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);
                expect(await commandService.executeCommand(InsertRangeMoveRightCommand.id)).toBeTruthy();
                expect(getValueByPosition(0, 0, 0, 0)).toStrictEqual(null);
                expect(getValueByPosition(0, 1, 0, 1)).toStrictEqual({
                    v: 'A1',
                });

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValueByPosition(0, 0, 0, 0)).toStrictEqual({
                    v: 'A1',
                });
                expect(getValueByPosition(0, 1, 0, 1)).toStrictEqual({
                    v: 'B1',
                });

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValueByPosition(0, 0, 0, 0)).toStrictEqual(null);
                expect(getValueByPosition(0, 1, 0, 1)).toStrictEqual({
                    v: 'A1',
                });

                // reset data for next test
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            });
            it('will insert range when there is a selected range, with merged cells of 2 rows and 1 column, break merged cells on the right', async () => {
                selectionManager.setSelections([
                    {
                        range: { startRow: 0, startColumn: 2, endRow: 1, endColumn: 2, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);
                expect(await commandService.executeCommand(InsertRangeMoveRightCommand.id)).toBeTruthy();

                // cell value
                expect(getValueByPosition(0, 2, 0, 2)).toStrictEqual(null);
                expect(getValueByPosition(0, 3, 0, 3)).toStrictEqual({
                    v: 'C1',
                });
                expect(getValueByPosition(1, 4, 1, 4)).toStrictEqual({
                    v: 'D2',
                });

                const mergedCells = deduplicateRanges(getMergedCells(0, 2, 2, 4)!);
                expect(mergedCells.length).toStrictEqual(1);

                // TODO@Dushusir: test undo redo after delete range completed

                // reset data for next test
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            });
            it('will insert range when there is a selected range, with merged cells of 3 rows and 1 column, will not break merged cells on the right', async () => {
                selectionManager.setSelections([
                    {
                        range: { startRow: 4, startColumn: 2, endRow: 6, endColumn: 2, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);
                expect(await commandService.executeCommand(InsertRangeMoveRightCommand.id)).toBeTruthy();

                // cell value
                expect(getValueByPosition(4, 2, 4, 2)).toStrictEqual(null);
                expect(getValueByPosition(4, 3, 4, 3)).toStrictEqual({
                    v: 'C5',
                });
                expect(getValueByPosition(5, 4, 5, 4)).toStrictEqual({
                    v: 'D6',
                });

                const mergedCells = deduplicateRanges(getMergedCells(4, 2, 6, 4)!);
                mergedCells.forEach((mergedCell) => {
                    expect(
                        [
                            {
                                startRow: 5,
                                startColumn: 4,
                                endRow: 6,
                                endColumn: 4,
                            },
                            {
                                startRow: 4,
                                startColumn: 3,
                                endRow: 6,
                                endColumn: 3,
                            },
                        ].some((rect) => Rectangle.intersects(rect, mergedCell))
                    ).toStrictEqual(true);
                });

                // reset data for next test
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                selectionManager.clearCurrentSelections();
                const result = await commandService.executeCommand(InsertRangeMoveRightCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });
    describe('Insert range move down', () => {
        describe('correct situations', () => {
            it('will insert range when there is a selected range, no merged cells', async () => {
                selectionManager.setSelections([
                    {
                        range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);

                expect(await commandService.executeCommand(InsertRangeMoveDownCommand.id)).toBeTruthy();
                expect(getValueByPosition(0, 0, 0, 0)).toStrictEqual(null);
                expect(getValueByPosition(1, 0, 1, 0)).toStrictEqual({
                    v: 'A1',
                });

                // undo
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
                expect(getValueByPosition(0, 0, 0, 0)).toStrictEqual({
                    v: 'A1',
                });
                expect(getValueByPosition(1, 0, 1, 0)).toStrictEqual({
                    v: 'A2',
                });

                // redo
                expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
                expect(getValueByPosition(0, 0, 0, 0)).toStrictEqual(null);
                expect(getValueByPosition(1, 0, 1, 0)).toStrictEqual({
                    v: 'A1',
                });

                // reset data for next test
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            });

            it('will insert range when there is a selected range, with merged cells of 1 row and 2 columns, break merged cells on the bottom', async () => {
                selectionManager.setSelections([
                    {
                        range: { startRow: 1, startColumn: 6, endRow: 1, endColumn: 7, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);
                expect(await commandService.executeCommand(InsertRangeMoveDownCommand.id)).toBeTruthy();

                // cell value
                expect(getValueByPosition(1, 6, 1, 6)).toStrictEqual(null);
                expect(getValueByPosition(2, 6, 2, 6)).toStrictEqual({
                    v: 'G2',
                });
                expect(getValueByPosition(2, 5, 2, 5)).toStrictEqual({
                    v: 'F3',
                });

                const mergedCells = getMergedCells(1, 5, 3, 7);
                expect(deduplicateRanges(mergedCells!)).toStrictEqual([
                    {
                        startRow: 2,
                        startColumn: 6,
                        endRow: 2,
                        endColumn: 7,
                    },
                ]);

                // reset data for next test
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            });
            it('will insert range when there is a selected range, with merged cells of 1 row and 3 columns, will not break merged cells on the bottom', async () => {
                selectionManager.setSelections([
                    {
                        range: { startRow: 1, startColumn: 9, endRow: 1, endColumn: 11, rangeType: RANGE_TYPE.NORMAL },
                        primary: null,
                        style: null,
                    },
                ]);
                expect(await commandService.executeCommand(InsertRangeMoveDownCommand.id)).toBeTruthy();

                // cell value
                expect(getValueByPosition(1, 9, 1, 9)).toStrictEqual(null);
                expect(getValueByPosition(2, 9, 2, 9)).toStrictEqual({
                    v: 'J2',
                });
                expect(getValueByPosition(3, 9, 3, 9)).toStrictEqual({
                    v: 'J3',
                });

                const mergedCells = deduplicateRanges(getMergedCells(1, 9, 3, 11)!);
                expect(mergedCells.length).toStrictEqual(2);
                mergedCells.forEach((mergedCell) => {
                    [
                        {
                            startRow: 3,
                            startColumn: 9,
                            endRow: 3,
                            endColumn: 10,
                        },
                        {
                            startRow: 2,
                            startColumn: 9,
                            endRow: 2,
                            endColumn: 11,
                        },
                    ].some((rect) => Rectangle.equals(rect, mergedCell));
                });

                // reset data for next test
                expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            });
        });

        describe('fault situations', () => {
            it('will not apply when there is no selected ranges', async () => {
                selectionManager.clearCurrentSelections();
                const result = await commandService.executeCommand(InsertRangeMoveDownCommand.id);
                expect(result).toBeFalsy();
            });
        });
    });
});
