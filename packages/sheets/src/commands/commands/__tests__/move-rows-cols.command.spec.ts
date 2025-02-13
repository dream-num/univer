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

import type { ICellData, Injector, IRange, IWorkbookData, Nullable, Univer, Workbook } from '@univerjs/core';
import type { IMoveColsCommandParams, IMoveRowsCommandParams } from '../move-rows-cols.command';
import {
    cellToRange,
    ICommandService,
    IUniverInstanceService,
    LocaleType,
    RANGE_TYPE,
    RedoCommand,
    Tools,
    UndoCommand,
    UniverInstanceType,
} from '@univerjs/core';

import { beforeEach, describe, expect, it } from 'vitest';
import { MergeCellController } from '../../../controllers/merge-cell.controller';
import { RefRangeService } from '../../../services/ref-range/ref-range.service';
import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import { AddWorksheetMergeMutation } from '../../mutations/add-worksheet-merge.mutation';
import { MoveColsMutation, MoveRowsMutation } from '../../mutations/move-rows-cols.mutation';
import { RemoveWorksheetMergeMutation } from '../../mutations/remove-worksheet-merge.mutation';
import { SetSelectionsOperation } from '../../operations/selection.operation';
import { MoveColsCommand, MoveRowsCommand } from '../move-rows-cols.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test move rows cols', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createMoveRowsColsTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);

        [
            MoveRowsCommand,
            MoveColsCommand,
            MoveRowsMutation,
            MoveColsMutation,
            RemoveWorksheetMergeMutation,
            AddWorksheetMergeMutation,
            SetSelectionsOperation,
        ].forEach((c) => commandService.registerCommand(c));
        get(MergeCellController);
    });

    function selectRow(rowStart: number, rowEnd: number): void {
        const selectionManagerService = get(SheetsSelectionsService);
        const endColumn = getColCount() - 1;
        selectionManagerService.addSelections([
            {
                range: { startRow: rowStart, startColumn: 0, endColumn, endRow: rowEnd, rangeType: RANGE_TYPE.ROW },
                primary: {
                    startRow: rowStart,
                    endRow: rowEnd,
                    startColumn: 0,
                    endColumn,
                    actualColumn: 0,
                    actualRow: rowStart,
                    isMerged: false,
                    isMergedMainCell: false,
                },
                style: null,
            },
        ]);
    }

    function selectColumn(columnStart: number, columnEnd: number): void {
        const selectionManagerService = get(SheetsSelectionsService);
        const endRow = getRowCount() - 1;
        selectionManagerService.addSelections([
            {
                range: {
                    startRow: 0,
                    startColumn: columnStart,
                    endColumn: columnEnd,
                    endRow,
                    rangeType: RANGE_TYPE.COLUMN,
                },
                primary: {
                    startRow: 0,
                    endRow,
                    startColumn: columnStart,
                    endColumn: columnEnd,
                    actualColumn: columnStart,
                    actualRow: 0,
                    isMerged: false,
                    isMergedMainCell: false,
                },
                style: null,
            },
        ]);
    }

    function getRowCount(): number {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;
        return worksheet.getRowCount();
    }

    function getColCount(): number {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;
        return worksheet.getColumnCount();
    }

    function getCellInfo(row: number, col: number): Nullable<ICellData> {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;
        return worksheet.getCellMatrix().getValue(row, col);
    }

    function getMergedInfo(row: number, col: number): Nullable<IRange> {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;
        return worksheet.getMergedCell(row, col);
    }

    function getRowHeight(row: number): number {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;
        return worksheet.getRowHeight(row);
    }

    function getColWidth(col: number): number {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;
        return worksheet.getColumnWidth(col);
    }

    function getCurrentSelection(): IRange {
        const selectionManagerService = get(SheetsSelectionsService);
        const currentSelection = selectionManagerService.getCurrentSelections();
        if (!currentSelection) {
            throw new Error('No current selection');
        }
        return currentSelection[0].range;
    }

    describe('Move rows', () => {
        it('Should move forward works', async () => {
            selectRow(18, 19);

            const result = await commandService.executeCommand<IMoveRowsCommandParams>(MoveRowsCommand.id, {
                fromRange: { ...cellToRange(18, 1), endRow: 19 },
                toRange: { ...cellToRange(1, 1), endRow: 2 },
            });
            expect(result).toEqual(true);
            expect(getCellInfo(0, 0)?.v).toEqual('A1');
            expect(getCellInfo(3, 1)?.v).toEqual('B2');
            expect(getMergedInfo(3, 1)).toEqual({ startRow: 3, endRow: 3, startColumn: 1, endColumn: 2 });
            expect(getMergedInfo(4, 1)).toEqual({ startRow: 4, endRow: 5, startColumn: 1, endColumn: 1 });
            expect(getRowHeight(1)).toBe(24);
            expect(getRowHeight(3)).toBe(30);
            expect(getCurrentSelection()).toEqual({
                startRow: 1,
                endRow: 2,
                startColumn: 0,
                endColumn: 19,
                rangeType: RANGE_TYPE.ROW,
            });

            const undoResult = await commandService.executeCommand(UndoCommand.id);
            expect(undoResult).toEqual(true);
            expect(getCellInfo(0, 0)?.v).toEqual('A1');
            expect(getCellInfo(1, 1)?.v).toEqual('B2');
            expect(getMergedInfo(1, 1)).toEqual({ startRow: 1, endRow: 1, startColumn: 1, endColumn: 2 });
            expect(getMergedInfo(2, 1)).toEqual({ startRow: 2, endRow: 3, startColumn: 1, endColumn: 1 });
            expect(getRowHeight(1)).toBe(30);
            expect(getCurrentSelection()).toEqual({
                startRow: 18,
                endRow: 19,
                startColumn: 0,
                endColumn: 19,
                rangeType: RANGE_TYPE.ROW,
            });

            const redoResult = await commandService.executeCommand(RedoCommand.id);
            expect(redoResult).toEqual(true);
            expect(getCellInfo(0, 0)?.v).toEqual('A1');
            expect(getCellInfo(3, 1)?.v).toEqual('B2');
            expect(getMergedInfo(3, 1)).toEqual({ startRow: 3, endRow: 3, startColumn: 1, endColumn: 2 });
            expect(getMergedInfo(4, 1)).toEqual({ startRow: 4, endRow: 5, startColumn: 1, endColumn: 1 });
            expect(getRowHeight(1)).toBe(24);
            expect(getRowHeight(3)).toBe(30);
            expect(getCurrentSelection()).toEqual({
                startRow: 1,
                endRow: 2,
                startColumn: 0,
                endColumn: 19,
                rangeType: RANGE_TYPE.ROW,
            });
        });

        it('Should move forward works with range', async () => {
            selectRow(2, 2);

            const result = await commandService.executeCommand<IMoveRowsCommandParams>(MoveRowsCommand.id, {
                fromRange: { ...cellToRange(18, 1), endRow: 19 },
                toRange: { ...cellToRange(1, 1), endRow: 2 },
                range: { startRow: 18, startColumn: 0, endRow: 19, endColumn: 19, rangeType: RANGE_TYPE.ROW },
            });
            expect(result).toEqual(true);
            expect(getCellInfo(0, 0)?.v).toEqual('A1');
            expect(getCellInfo(3, 1)?.v).toEqual('B2');
            expect(getMergedInfo(3, 1)).toEqual({ startRow: 3, endRow: 3, startColumn: 1, endColumn: 2 });
            expect(getMergedInfo(4, 1)).toEqual({ startRow: 4, endRow: 5, startColumn: 1, endColumn: 1 });
            expect(getRowHeight(1)).toBe(24);
            expect(getRowHeight(3)).toBe(30);
            expect(getCurrentSelection()).toEqual({
                startRow: 2,
                endRow: 2,
                startColumn: 0,
                endColumn: 19,
                rangeType: RANGE_TYPE.ROW,
            });
        });

        it('Should forbidding moving when parts of merged cells are selected', async () => {
            selectRow(2, 2);

            const result = await commandService.executeCommand<IMoveRowsCommandParams>(MoveRowsCommand.id, {
                fromRange: cellToRange(2, 1),
                toRange: cellToRange(1, 1),
            });
            expect(result).toBeFalsy();
        });

        it('Should forbidding moving when rows are moved across a merged cell', async () => {
            selectRow(18, 19);

            const result = await commandService.executeCommand<IMoveRowsCommandParams>(MoveRowsCommand.id, {
                fromRange: cellToRange(18, 1),
                toRange: cellToRange(3, 1),
            });
            expect(result).toBeFalsy();

            const result2 = await commandService.executeCommand<IMoveRowsCommandParams>(MoveRowsCommand.id, {
                fromRange: cellToRange(18, 1),
                toRange: cellToRange(4, 1),
            });
            expect(result2).toBeTruthy();
        });
    });

    describe('Move cols', () => {
        it('Should move forward works', async () => {
            selectColumn(18, 19);

            const result = await commandService.executeCommand<IMoveColsCommandParams>(MoveColsCommand.id, {
                fromRange: { ...cellToRange(1, 18), endColumn: 19 },
                toRange: { ...cellToRange(1, 1), endColumn: 2 },
            });
            expect(result).toEqual(true);
            expect(getCellInfo(0, 0)?.v).toEqual('A1');
            expect(getCellInfo(1, 3)?.v).toEqual('B2');
            expect(getMergedInfo(1, 3)).toEqual({ startRow: 1, endRow: 1, startColumn: 3, endColumn: 4 });
            expect(getMergedInfo(2, 3)).toEqual({ startRow: 2, endRow: 3, startColumn: 3, endColumn: 3 });
            expect(getColWidth(1)).toBe(88);
            expect(getColWidth(3)).toBe(30);
            expect(getCurrentSelection()).toEqual({
                startRow: 0,
                endRow: 19,
                startColumn: 1,
                endColumn: 2,
                rangeType: RANGE_TYPE.COLUMN,
            });

            const undoResult = await commandService.executeCommand(UndoCommand.id);
            expect(undoResult).toEqual(true);
            expect(getCellInfo(0, 0)?.v).toEqual('A1');
            expect(getCellInfo(1, 1)?.v).toEqual('B2');
            expect(getMergedInfo(1, 1)).toEqual({ startRow: 1, endRow: 1, startColumn: 1, endColumn: 2 });
            expect(getMergedInfo(2, 1)).toEqual({ startRow: 2, endRow: 3, startColumn: 1, endColumn: 1 });
            expect(getColWidth(1)).toBe(30);
            expect(getCurrentSelection()).toEqual({
                startRow: 0,
                endRow: 19,
                startColumn: 18,
                endColumn: 19,
                rangeType: RANGE_TYPE.COLUMN,
            });

            const redoResult = await commandService.executeCommand(RedoCommand.id);
            expect(redoResult).toEqual(true);
            expect(getCellInfo(0, 0)?.v).toEqual('A1');
            expect(getCellInfo(1, 3)?.v).toEqual('B2');
            expect(getMergedInfo(1, 3)).toEqual({ startRow: 1, endRow: 1, startColumn: 3, endColumn: 4 });
            expect(getMergedInfo(2, 3)).toEqual({ startRow: 2, endRow: 3, startColumn: 3, endColumn: 3 });
            expect(getColWidth(1)).toBe(88);
            expect(getColWidth(3)).toBe(30);
            expect(getCurrentSelection()).toEqual({
                startRow: 0,
                endRow: 19,
                startColumn: 1,
                endColumn: 2,
                rangeType: RANGE_TYPE.COLUMN,
            });
        });

        it('Should move forward works with range', async () => {
            selectColumn(2, 2);

            const result = await commandService.executeCommand<IMoveColsCommandParams>(MoveColsCommand.id, {
                fromRange: { ...cellToRange(1, 18), endColumn: 19 },
                toRange: { ...cellToRange(1, 1), endColumn: 2 },
                range: { startRow: 0, startColumn: 18, endRow: 19, endColumn: 19, rangeType: RANGE_TYPE.COLUMN },
            });
            expect(result).toEqual(true);
            expect(getCellInfo(0, 0)?.v).toEqual('A1');
            expect(getCellInfo(1, 3)?.v).toEqual('B2');
            expect(getMergedInfo(1, 3)).toEqual({ startRow: 1, endRow: 1, startColumn: 3, endColumn: 4 });
            expect(getMergedInfo(2, 3)).toEqual({ startRow: 2, endRow: 3, startColumn: 3, endColumn: 3 });
            expect(getColWidth(1)).toBe(88);
            expect(getColWidth(3)).toBe(30);
            expect(getCurrentSelection()).toEqual({
                startRow: 0,
                endRow: 19,
                startColumn: 2,
                endColumn: 2,
                rangeType: RANGE_TYPE.COLUMN,
            });
        });

        it('Should forbidding moving when parts of merged cells are selected', async () => {
            selectColumn(2, 2);

            const result = await commandService.executeCommand<IMoveColsCommandParams>(MoveColsCommand.id, {
                fromRange: cellToRange(1, 2),
                toRange: cellToRange(1, 1),
            });
            expect(result).toBeFalsy();
        });

        it('Should forbidding moving when columns are moved across a merged cell', async () => {
            selectColumn(18, 19);

            const result = await commandService.executeCommand<IMoveColsCommandParams>(MoveColsCommand.id, {
                fromRange: cellToRange(1, 18),
                toRange: cellToRange(1, 2),
            });
            expect(result).toBeFalsy();

            const result2 = await commandService.executeCommand<IMoveColsCommandParams>(MoveColsCommand.id, {
                fromRange: cellToRange(1, 18),
                toRange: cellToRange(1, 3),
            });
            expect(result2).toBeTruthy();
        });
    });
});

const TEST_ROWS_COLS_MOVE_DEMO: IWorkbookData = {
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
                { startRow: 1, endRow: 1, startColumn: 1, endColumn: 2 },
                {
                    startRow: 1,
                    endRow: 1,
                    startColumn: 3,
                    endColumn: 4,
                },
                {
                    startRow: 2,
                    endRow: 3,
                    startColumn: 1,
                    endColumn: 1,
                },
            ],
            rowData: { 1: { h: 30 } },
            columnData: { 1: { w: 30 } },
            rowCount: 20,
            columnCount: 20,
        },
    },
    locale: LocaleType.ZH_CN,
    name: '',
    sheetOrder: [],
    styles: {},
};

function createMoveRowsColsTestBed() {
    return createCommandTestBed(Tools.deepClone(TEST_ROWS_COLS_MOVE_DEMO), [[MergeCellController], [RefRangeService]]);
}
