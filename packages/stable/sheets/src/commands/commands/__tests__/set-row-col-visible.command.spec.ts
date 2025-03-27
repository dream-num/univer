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

import type { Injector, Univer, Workbook } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, RANGE_TYPE, RedoCommand, UndoCommand, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SheetsSelectionsService } from '../../../services/selections/selection.service';
import { SetColHiddenMutation, SetColVisibleMutation } from '../../mutations/set-col-visible.mutation';
import { SetRowHiddenMutation, SetRowVisibleMutation } from '../../mutations/set-row-visible.mutation';
import { SetSelectionsOperation } from '../../operations/selection.operation';
import {
    SetColHiddenCommand,
    SetSelectedColsVisibleCommand,
    SetSpecificColsVisibleCommand,
} from '../set-col-visible.command';
import {
    SetRowHiddenCommand,
    SetSelectedRowsVisibleCommand,
    SetSpecificRowsVisibleCommand,
} from '../set-row-visible.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test row col hide/unhine commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createCommandTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);

        [
            SetRowHiddenCommand,
            SetRowHiddenMutation,
            SetColHiddenCommand,
            SetColHiddenMutation,
            SetSelectedRowsVisibleCommand,
            SetSelectedColsVisibleCommand,
            SetRowVisibleMutation,
            SetColVisibleMutation,
            SetSpecificColsVisibleCommand,
            SetSpecificRowsVisibleCommand,
            SetSelectionsOperation,
        ].forEach((command) => {
            commandService.registerCommand(command);
        });
    });

    afterEach(() => univer.dispose());

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

    function getRowRawVisible(row: number): boolean {
        const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;
        return worksheet.getRowRawVisible(row);
    }

    function getColVisible(col: number): boolean {
        const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet()!;
        return worksheet.getColVisible(col);
    }

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

    describe('hide / unhide rows', () => {
        it('should work', async () => {
            expect(getRowRawVisible(0)).toBeTruthy();

            selectRow(0, 0);
            await commandService.executeCommand(SetRowHiddenCommand.id);
            expect(getRowRawVisible(0)).toBeFalsy();

            await commandService.executeCommand(UndoCommand.id);
            expect(getRowRawVisible(0)).toBeTruthy();

            await commandService.executeCommand(RedoCommand.id);
            expect(getRowRawVisible(0)).toBeFalsy();

            // Specify the parameter ranges as the third row
            await commandService.executeCommand(SetRowHiddenCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                ranges: [{ startRow: 2, startColumn: 2, endRow: 2, endColumn: 2, rangeType: RANGE_TYPE.ROW }],
            });
            expect(getRowRawVisible(2)).toBeFalsy();

            // select a range and invoke unhide command will unhide all
            // hidden rows in the selected range
            selectRow(0, 7);
            await commandService.executeCommand(SetSelectedRowsVisibleCommand.id);
            expect(getRowRawVisible(0)).toBeTruthy();
            expect(getRowRawVisible(2)).toBeTruthy();

            await commandService.executeCommand(UndoCommand.id);
            expect(getRowRawVisible(0)).toBeFalsy();
            expect(getRowRawVisible(2)).toBeFalsy();
        });

        it('should skip over already hidden rows', async () => {
            expect(getRowRawVisible(0)).toBeTruthy();

            selectRow(2, 2);
            await commandService.executeCommand(SetRowHiddenCommand.id);
            expect(getRowRawVisible(2)).toBeFalsy();

            selectRow(1, 4);
            await commandService.executeCommand(SetRowHiddenCommand.id);
            expect(getRowRawVisible(1)).toBeFalsy();
            expect(getRowRawVisible(2)).toBeFalsy();
            expect(getRowRawVisible(3)).toBeFalsy();

            await commandService.executeCommand(UndoCommand.id);
            expect(getRowRawVisible(1)).toBeTruthy();
            expect(getRowRawVisible(2)).toBeFalsy();
            expect(getRowRawVisible(3)).toBeTruthy();

            selectRow(1, 2);
            await commandService.executeCommand(SetRowHiddenCommand.id);
            expect(getRowRawVisible(1)).toBeFalsy();
            expect(getRowRawVisible(2)).toBeFalsy();

            await commandService.executeCommand(UndoCommand.id);
            expect(getRowRawVisible(1)).toBeTruthy();
            expect(getRowRawVisible(2)).toBeFalsy();
        });
    });

    describe('hide / unhide columns', () => {
        it('should work', async () => {
            expect(getColVisible(0)).toBeTruthy();

            selectColumn(0, 0);
            await commandService.executeCommand(SetColHiddenCommand.id);
            expect(getColVisible(0)).toBeFalsy();

            await commandService.executeCommand(UndoCommand.id);
            expect(getColVisible(0)).toBeTruthy();

            await commandService.executeCommand(RedoCommand.id);
            expect(getColVisible(0)).toBeFalsy();

            // Specify the parameter ranges as the third column
            await commandService.executeCommand(SetColHiddenCommand.id, {
                unitId: 'test',
                subUnitId: 'sheet1',
                ranges: [{ startRow: 2, startColumn: 2, endRow: 2, endColumn: 2, rangeType: RANGE_TYPE.COLUMN }],
            });
            expect(getColVisible(2)).toBeFalsy();

            // select a range and invoke unhide command will unhide all
            // hidden cols in the selected range
            selectColumn(0, 7);
            await commandService.executeCommand(SetSelectedColsVisibleCommand.id);
            expect(getColVisible(0)).toBeTruthy();
            expect(getColVisible(2)).toBeTruthy();

            await commandService.executeCommand(UndoCommand.id);
            expect(getColVisible(0)).toBeFalsy();
            expect(getColVisible(2)).toBeFalsy();
        });

        it('should skip over already hidden cols', async () => {
            expect(getColVisible(0)).toBeTruthy();

            selectColumn(2, 2);
            await commandService.executeCommand(SetColHiddenCommand.id);
            expect(getColVisible(2)).toBeFalsy();

            selectColumn(1, 4);
            await commandService.executeCommand(SetColHiddenCommand.id);
            expect(getColVisible(1)).toBeFalsy();
            expect(getColVisible(2)).toBeFalsy();
            expect(getColVisible(3)).toBeFalsy();

            await commandService.executeCommand(UndoCommand.id);
            expect(getColVisible(1)).toBeTruthy();
            expect(getColVisible(2)).toBeFalsy();
            expect(getColVisible(3)).toBeTruthy();

            selectColumn(1, 2);
            await commandService.executeCommand(SetColHiddenCommand.id);
            expect(getColVisible(1)).toBeFalsy();
            expect(getColVisible(2)).toBeFalsy();

            await commandService.executeCommand(UndoCommand.id);
            expect(getColVisible(1)).toBeTruthy();
            expect(getColVisible(2)).toBeFalsy();
        });
    });
});
