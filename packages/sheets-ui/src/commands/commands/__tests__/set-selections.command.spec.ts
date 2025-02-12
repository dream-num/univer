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

import type { Injector, IWorkbookData, Univer, Workbook } from '@univerjs/core';
import type {
    IExpandSelectionCommandParams,
    IMoveSelectionCommandParams,
    ISelectAllCommandParams,
} from '../set-selection.command';
import { Direction, ICommandService, IUniverInstanceService, RANGE_TYPE, UniverInstanceType } from '@univerjs/core';
import {
    SetColHiddenCommand,
    SetColHiddenMutation,
    SetColVisibleMutation,
    SetRowHiddenCommand,
    SetRowHiddenMutation,
    SetRowVisibleMutation,
    SetSelectedColsVisibleCommand,
    SetSelectedRowsVisibleCommand,
    SheetsSelectionsService,
} from '@univerjs/sheets';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ExpandSelectionCommand, JumpOver, MoveSelectionCommand, SelectAllCommand } from '../set-selection.command';
import {
    createSelectionCommandTestBed,
    SELECTION_WITH_EMPTY_CELLS_DATA,
    SELECTION_WITH_MERGED_CELLS_DATA,
} from './create-selection-command-test-bed';

describe('Test commands used for change selections', () => {
    let univer: Univer | null = null;
    let get: Injector['get'];
    let commandService: ICommandService;
    let selectionManagerService: SheetsSelectionsService;

    function selectTopLeft() {
        selectionManagerService.setSelections([
            {
                range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
                primary: {
                    startRow: 0,
                    startColumn: 0,
                    endRow: 0,
                    endColumn: 0,
                    actualRow: 0,
                    actualColumn: 0,
                    isMerged: false,
                    isMergedMainCell: false,
                },
                style: null,
            },
        ]);
    }

    function select(
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number,
        actualRow: number,
        actualColumn: number,
        isMerged: boolean,
        isMergedMainCell: boolean
    ) {
        selectionManagerService.addSelections([
            {
                range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                primary: {
                    startRow,
                    startColumn,
                    endRow,
                    endColumn,
                    actualRow,
                    actualColumn,
                    isMerged,
                    isMergedMainCell,
                },
                style: null,
            },
        ]);
    }

    function expectSelectionToBe(startRow: number, startColumn: number, endRow: number, endColumn: number) {
        expect(selectionManagerService.getCurrentLastSelection()!.range).toEqual({
            startRow,
            startColumn,
            endRow,
            endColumn,
            rangeType: RANGE_TYPE.NORMAL,
        });
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

    function disposeTestBed() {
        univer?.dispose();
        univer = null;
    }

    function prepareSelectionsTestBed(snapshot?: IWorkbookData) {
        const testBed = createSelectionCommandTestBed(snapshot);
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        selectionManagerService = get(SheetsSelectionsService);
    }

    afterEach(disposeTestBed);

    describe('Simple movement to next cell', () => {
        beforeEach(() => prepareSelectionsTestBed());

        it('Should move selection with command', async () => {
            selectTopLeft();

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(19, 19, 19, 19);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.RIGHT,
            });
            expectSelectionToBe(0, 0, 0, 0);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.DOWN,
            });
            expectSelectionToBe(1, 0, 1, 0);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(0, 19, 0, 19);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.UP,
            });
            expectSelectionToBe(19, 18, 19, 18);
        });

        it('Should skip cells in hidden rows / cols', async () => {
            [
                SetRowHiddenCommand,
                SetRowHiddenMutation,
                SetColHiddenCommand,
                SetColHiddenMutation,
                SetSelectedRowsVisibleCommand,
                SetSelectedColsVisibleCommand,
                SetRowVisibleMutation,
                SetColVisibleMutation,
            ].forEach((command) => {
                commandService.registerCommand(command);
            });

            selectRow(1, 1);
            expect(await commandService.executeCommand(SetRowHiddenCommand.id)).toBeTruthy();
            selectColumn(1, 1);
            expect(await commandService.executeCommand(SetColHiddenCommand.id)).toBeTruthy();

            selectTopLeft();

            expect(await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.RIGHT,
            })).toBeTruthy();
            expectSelectionToBe(0, 2, 0, 2);

            expect(await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.DOWN,
            })).toBeTruthy();
            expectSelectionToBe(2, 2, 2, 2);

            expect(await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.LEFT,
            })).toBeTruthy();
            expectSelectionToBe(2, 0, 2, 0);

            expect(await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.UP,
            })).toBeTruthy();
            expectSelectionToBe(0, 0, 0, 0);
        });
    });

    describe('Move cell to/through merged cells', () => {
        beforeEach(() => prepareSelectionsTestBed(SELECTION_WITH_MERGED_CELLS_DATA));

        /**
         * A1 | B1 | C1
         * ---|    |----
         * A2 |    | C2
         *
         * When user clicks on C2 and move cursor left twice, A2 should not selected not A1.
         */
        it('Should select merged cell and move to next cell', async () => {
            selectTopLeft();

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(999, 19, 999, 19);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.RIGHT,
            });
            expectSelectionToBe(0, 0, 0, 0);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.RIGHT,
            });
            expectSelectionToBe(0, 1, 1, 1);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.DOWN,
            });
            expectSelectionToBe(2, 1, 2, 1);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(2, 0, 2, 0);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(1, 19, 1, 19);
        });
    });

    describe('Move to next cell that has value (skip cell)', () => {
        beforeEach(() => prepareSelectionsTestBed(SELECTION_WITH_EMPTY_CELLS_DATA));

        it('Works on move', async () => {
            selectTopLeft();

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.RIGHT,
                jumpOver: JumpOver.moveGap,
            });
            expectSelectionToBe(0, 2, 0, 2);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.RIGHT,
                jumpOver: JumpOver.moveGap,
            });
            expectSelectionToBe(0, 5, 1, 6);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.RIGHT,
                jumpOver: JumpOver.moveGap,
            });
            expectSelectionToBe(0, 19, 0, 19);
        });

        it('Should jump over cells in hidden rows / cols no matter if there are empty', async () => {
            [
                SetRowHiddenCommand,
                SetRowHiddenMutation,
                SetColHiddenCommand,
                SetColHiddenMutation,
                SetSelectedRowsVisibleCommand,
                SetSelectedColsVisibleCommand,
                SetRowVisibleMutation,
                SetColVisibleMutation,
            ].forEach((command) => {
                commandService.registerCommand(command);
            });

            selectColumn(3, 10);
            await commandService.executeCommand(SetColHiddenCommand.id);

            selectTopLeft();

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.RIGHT,
                jumpOver: JumpOver.moveGap,
            });
            expectSelectionToBe(0, 2, 0, 2);

            // skip over hidden columns and jump to the last column
            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.RIGHT,
                jumpOver: JumpOver.moveGap,
            });
            expectSelectionToBe(0, 19, 0, 19);
        });
    });

    describe('Expand to next selection or shrink to previous selection', () => {
        beforeEach(() => prepareSelectionsTestBed(SELECTION_WITH_EMPTY_CELLS_DATA));

        it('Works on expand', async () => {
            selectTopLeft();

            // expand

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
            });
            expectSelectionToBe(0, 0, 0, 1); // A1:B1

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
            });
            expectSelectionToBe(0, 0, 0, 2); // A1:C1

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
            });
            expectSelectionToBe(0, 0, 0, 3); // A1:D1

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
            });
            expectSelectionToBe(0, 0, 0, 4); // A1:E1

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
            });
            expectSelectionToBe(0, 0, 1, 6); // A1:G2, because that is a merged cell

            // shrink
            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(0, 0, 1, 4); // A1:E2

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(0, 0, 1, 3); // A1:D2

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(0, 0, 1, 2); // A1:C2

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(0, 0, 1, 1); // A1:B2

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(0, 0, 1, 0); // A1:A2

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(0, 0, 1, 0); // A1:A2, remain unchanged when hitting boundary

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.UP,
            });
            expectSelectionToBe(0, 0, 0, 0); // A1:A1
        });
    });

    /**
     * A1 | B1 | C1
     * ---|    |----
     * A2 |    | C2
     *
     * When A1:C1 is selected and B2 is the primary cell, shrink should only shrink to one side.
     */
    describe('Shrink edge case', () => {
        beforeEach(() => prepareSelectionsTestBed(SELECTION_WITH_MERGED_CELLS_DATA));

        it('Should shrink on side when primary is in the middle of selections', async () => {
            select(0, 0, 1, 2, 1, 1, true, false);

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.LEFT,
            });
            expectSelectionToBe(0, 0, 1, 1);

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
            });
            expectSelectionToBe(0, 1, 1, 1);
        });
    });

    describe('Expand to next gap position or shrink to previous gap', () => {
        beforeEach(() => prepareSelectionsTestBed(SELECTION_WITH_EMPTY_CELLS_DATA));

        it('Works on gap expand', async () => {
            selectTopLeft();

            // expand

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
                jumpOver: JumpOver.moveGap,
            });
            expectSelectionToBe(0, 0, 0, 2); // A1:C1

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
                jumpOver: JumpOver.moveGap,
            });
            expectSelectionToBe(0, 0, 1, 6); // A1:G2, because that is a merged cell

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
                jumpOver: JumpOver.moveGap,
            });
            expectSelectionToBe(0, 0, 1, 19);

            // shrink

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.LEFT,
                jumpOver: JumpOver.moveGap,
            });
            expectSelectionToBe(0, 0, 1, 6); // A1:G2

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.LEFT,
                jumpOver: JumpOver.moveGap,
            });
            expectSelectionToBe(0, 0, 1, 2); // A1:C2

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.LEFT,
                jumpOver: JumpOver.moveGap,
            });
            expectSelectionToBe(0, 0, 1, 0); // A1:A2
        });
    });

    describe('Select all', () => {
        beforeEach(() => prepareSelectionsTestBed());

        it('Should first select all neighbor cells, and then the whole sheet', async () => {
            selectTopLeft();

            const unchangedPrimaryInfo = {
                startRow: 0,
                startColumn: 0,
                endRow: 0,
                endColumn: 0,
                actualRow: 0,
                actualColumn: 0,
                isMerged: false,
                isMergedMainCell: false,
            };

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: true,
                expandToGapFirst: true,
            });
            expect(selectionManagerService.getCurrentLastSelection()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 1,
                endColumn: 1,
                rangeType: RANGE_TYPE.NORMAL,
            });
            expect(selectionManagerService.getCurrentLastSelection()!.primary).toEqual(unchangedPrimaryInfo);

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: true,
                expandToGapFirst: true,
            });
            expect(selectionManagerService.getCurrentLastSelection()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 19,
                endColumn: 19,
                rangeType: RANGE_TYPE.ALL,
            });
            expect(selectionManagerService.getCurrentLastSelection()!.primary).toEqual(unchangedPrimaryInfo);

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: true,
                expandToGapFirst: true,
            });
            expect(selectionManagerService.getCurrentLastSelection()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 0,
                endColumn: 0,
                rangeType: RANGE_TYPE.NORMAL,
            });
            expect(selectionManagerService.getCurrentLastSelection()!.primary).toEqual(unchangedPrimaryInfo);
        });

        it('Should directly select all if `expandToGapFirst` is false', async () => {
            selectTopLeft();

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: true,
                expandToGapFirst: false,
            });
            expect(selectionManagerService.getCurrentLastSelection()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 19,
                endColumn: 19,
                rangeType: RANGE_TYPE.ALL,
            });

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: true,
                expandToGapFirst: false,
            });
            expect(selectionManagerService.getCurrentLastSelection()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 0,
                endColumn: 0,
                rangeType: RANGE_TYPE.NORMAL,
            });
        });

        it('Should not loop selection when `loop` is false', async () => {
            selectTopLeft();

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: false,
                expandToGapFirst: false,
            });
            expect(selectionManagerService.getCurrentLastSelection()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 19,
                endColumn: 19,
                rangeType: RANGE_TYPE.ALL,
            });

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: false,
                expandToGapFirst: false,
            });
            expect(selectionManagerService.getCurrentLastSelection()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 19,
                endColumn: 19,
                rangeType: RANGE_TYPE.ALL,
            });
        });

        describe('Expand to different directions', () => {
            it('Should expand to left', async () => {
                select(0, 1, 0, 1, 0, 1, false, false);

                await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                    loop: true,
                    expandToGapFirst: true,
                });
                expect(selectionManagerService.getCurrentLastSelection()!.range).toEqual({
                    startRow: 0,
                    startColumn: 0,
                    endRow: 1,
                    endColumn: 1,
                    rangeType: RANGE_TYPE.NORMAL,
                });
            });
        });
    });
});
