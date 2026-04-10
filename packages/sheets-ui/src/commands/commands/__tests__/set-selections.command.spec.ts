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
    IMoveSelectionEnterAndTabCommandParams,
    ISelectAllCommandParams,
} from '../set-selection.command';
import { Direction, ICommandService, IUniverInstanceService, RANGE_TYPE, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import {
    SetColHiddenCommand,
    SetColHiddenMutation,
    SetColVisibleMutation,
    SetRowHiddenCommand,
    SetRowHiddenMutation,
    SetRowVisibleMutation,
    SetSelectedColsVisibleCommand,
    SetSelectedRowsVisibleCommand,
    SheetInterceptorService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { KeyCode } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SelectAllService } from '../../../services/select-all/select-all.service';
import { ISheetSelectionRenderService } from '../../../services/selection/base-selection-render.service';
import { ExpandSelectionCommand, JumpOver, MoveSelectionCommand, MoveSelectionEnterAndTabCommand, SelectAllCommand } from '../set-selection.command';
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

    describe('Formula editor movement semantics', () => {
        it('should use merged range bounds when moving in formula editor without a primary cell', async () => {
            prepareSelectionsTestBed(SELECTION_WITH_MERGED_CELLS_DATA);

            selectionManagerService.clear();
            selectionManagerService.setSelections([
                {
                    range: { startRow: 1, startColumn: 1, endRow: 1, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.RIGHT,
                extra: 'formula-editor',
            });

            expectSelectionToBe(0, 2, 0, 2);
        });

        it('should reuse remembered primary cell in formula editor for move and expand', async () => {
            prepareSelectionsTestBed();

            selectionManagerService.setSelections([
                {
                    range: { startRow: 1, startColumn: 1, endRow: 1, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
                    primary: {
                        startRow: 1,
                        startColumn: 1,
                        endRow: 1,
                        endColumn: 1,
                        actualRow: 1,
                        actualColumn: 1,
                        isMerged: false,
                        isMergedMainCell: false,
                    },
                    style: null,
                },
            ]);

            selectionManagerService.setSelections([
                {
                    range: { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.RIGHT,
                extra: 'formula-editor',
            });
            expectSelectionToBe(1, 2, 1, 2);

            selectionManagerService.setSelections([
                {
                    range: { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
                extra: 'formula-editor',
            });
            expectSelectionToBe(0, 0, 1, 2);
        });

        it('should expand from merged bounds in formula editor', async () => {
            prepareSelectionsTestBed(SELECTION_WITH_MERGED_CELLS_DATA);

            selectionManagerService.clear();
            selectionManagerService.setSelections([
                {
                    range: { startRow: 1, startColumn: 1, endRow: 1, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
                extra: 'formula-editor',
            });

            const selection = selectionManagerService.getCurrentLastSelection()!.range;
            expect(selection.startRow).toBe(0);
            expect(selection.startColumn).toBe(1);
            expect(selection.endColumn).toBe(2);
        });

        it('should preserve remembered primary when expanding a merged formula reference', async () => {
            prepareSelectionsTestBed(SELECTION_WITH_MERGED_CELLS_DATA);

            selectionManagerService.setSelections([
                {
                    range: { startRow: 1, startColumn: 1, endRow: 1, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
                    primary: {
                        startRow: 1,
                        startColumn: 1,
                        endRow: 1,
                        endColumn: 1,
                        actualRow: 1,
                        actualColumn: 1,
                        isMerged: false,
                        isMergedMainCell: false,
                    },
                    style: null,
                },
            ]);

            selectionManagerService.setSelections([
                {
                    range: { startRow: 0, startColumn: 1, endRow: 1, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
                extra: 'formula-editor',
            });

            expectSelectionToBe(0, 1, 1, 2);
        });
    });

    describe('Guard branches', () => {
        beforeEach(() => {
            prepareSelectionsTestBed();
            commandService.registerCommand(MoveSelectionEnterAndTabCommand);
        });

        it('should return false for movement commands when params are missing', async () => {
            await expect(commandService.executeCommand(MoveSelectionCommand.id, undefined)).resolves.toBe(false);
            await expect(commandService.executeCommand(ExpandSelectionCommand.id, undefined)).resolves.toBe(false);
            await expect(commandService.executeCommand(MoveSelectionEnterAndTabCommand.id, undefined)).resolves.toBe(false);
        });

        it('should return false when there is no current selection', async () => {
            selectionManagerService.clear();

            await expect(commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.RIGHT,
            })).resolves.toBe(false);
            await expect(commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
            })).resolves.toBe(false);
            await expect(commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: false,
                expandToGapFirst: true,
            })).resolves.toBe(false);
        });

        it('should return false when there is no active workbook target', async () => {
            const univerInstanceService = get(IUniverInstanceService);
            vi.spyOn(univerInstanceService, 'getCurrentUnitForType').mockReturnValue(null as never);

            await expect(commandService.executeCommand<IMoveSelectionCommandParams>(MoveSelectionCommand.id, {
                direction: Direction.RIGHT,
            })).resolves.toBe(false);
            await expect(commandService.executeCommand<IMoveSelectionEnterAndTabCommandParams>(MoveSelectionEnterAndTabCommand.id, {
                direction: Direction.RIGHT,
                keycode: KeyCode.TAB,
            })).resolves.toBe(false);
            await expect(commandService.executeCommand<IExpandSelectionCommandParams>(ExpandSelectionCommand.id, {
                direction: Direction.RIGHT,
            })).resolves.toBe(false);
            await expect(commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: true,
                expandToGapFirst: true,
            })).resolves.toBe(false);
        });

        it('should return false when enter/tab flow has no active primary selection', async () => {
            selectionManagerService.setSelections([
                {
                    range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await expect(commandService.executeCommand<IMoveSelectionEnterAndTabCommandParams>(MoveSelectionEnterAndTabCommand.id, {
                direction: Direction.RIGHT,
                keycode: KeyCode.TAB,
            })).resolves.toBe(false);
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

    describe('Move selection for enter/tab in editing flow', () => {
        beforeEach(() => {
            prepareSelectionsTestBed();
            commandService.registerCommand(MoveSelectionEnterAndTabCommand);
        });

        it('should move active cell inside multi-selections and wrap to the next selection', async () => {
            const refreshSelectionMoveEnd = vi.fn();
            const renderManagerService = get(IRenderManagerService);
            vi.spyOn(renderManagerService, 'getRenderById').mockReturnValue({
                with: (identifier: unknown) => {
                    if (identifier === ISheetSelectionRenderService) {
                        return { refreshSelectionMoveEnd };
                    }

                    return null;
                },
            } as never);

            selectionManagerService.setSelections([
                {
                    range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
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
                {
                    range: { startRow: 1, startColumn: 0, endRow: 1, endColumn: 1, rangeType: RANGE_TYPE.NORMAL },
                    primary: {
                        startRow: 1,
                        startColumn: 0,
                        endRow: 1,
                        endColumn: 0,
                        actualRow: 1,
                        actualColumn: 0,
                        isMerged: false,
                        isMergedMainCell: false,
                    },
                    style: null,
                },
            ]);

            await commandService.executeCommand<IMoveSelectionEnterAndTabCommandParams>(MoveSelectionEnterAndTabCommand.id, {
                direction: Direction.RIGHT,
                keycode: KeyCode.TAB,
            });

            let activeSelection = selectionManagerService.getCurrentSelections().find((selection) => selection.primary);
            expect(activeSelection?.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 0,
                endColumn: 1,
                rangeType: RANGE_TYPE.NORMAL,
            });
            expect(activeSelection?.primary?.startColumn).toBe(1);

            await commandService.executeCommand<IMoveSelectionEnterAndTabCommandParams>(MoveSelectionEnterAndTabCommand.id, {
                direction: Direction.RIGHT,
                keycode: KeyCode.TAB,
            });

            activeSelection = selectionManagerService.getCurrentSelections().find((selection) => selection.primary);
            expect(activeSelection?.range).toEqual({
                startRow: 1,
                startColumn: 0,
                endRow: 1,
                endColumn: 1,
                rangeType: RANGE_TYPE.NORMAL,
            });
            expect(activeSelection?.primary?.startRow).toBe(1);
            expect(activeSelection?.primary?.startColumn).toBe(0);

            await commandService.executeCommand<IMoveSelectionEnterAndTabCommandParams>(MoveSelectionEnterAndTabCommand.id, {
                direction: Direction.LEFT,
                keycode: KeyCode.TAB,
            });

            activeSelection = selectionManagerService.getCurrentSelections().find((selection) => selection.primary);
            expect(activeSelection?.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 0,
                endColumn: 1,
                rangeType: RANGE_TYPE.NORMAL,
            });
            expect(activeSelection?.primary?.startRow).toBe(0);
            expect(activeSelection?.primary?.startColumn).toBe(1);
            expect(refreshSelectionMoveEnd).toHaveBeenCalledTimes(3);
        });

        it('should remember tab origin for enter and stop at sheet boundaries', async () => {
            selectTopLeft();

            await commandService.executeCommand<IMoveSelectionEnterAndTabCommandParams>(MoveSelectionEnterAndTabCommand.id, {
                direction: Direction.RIGHT,
                keycode: KeyCode.TAB,
            });
            expectSelectionToBe(0, 1, 0, 1);

            await commandService.executeCommand<IMoveSelectionEnterAndTabCommandParams>(MoveSelectionEnterAndTabCommand.id, {
                direction: Direction.DOWN,
                keycode: KeyCode.ENTER,
            });
            expectSelectionToBe(1, 0, 1, 0);

            selectionManagerService.setSelections([
                {
                    range: { startRow: 19, startColumn: 19, endRow: 19, endColumn: 19, rangeType: RANGE_TYPE.NORMAL },
                    primary: {
                        startRow: 19,
                        startColumn: 19,
                        endRow: 19,
                        endColumn: 19,
                        actualRow: 19,
                        actualColumn: 19,
                        isMerged: false,
                        isMergedMainCell: false,
                    },
                    style: null,
                },
            ]);

            await expect(commandService.executeCommand<IMoveSelectionEnterAndTabCommandParams>(MoveSelectionEnterAndTabCommand.id, {
                direction: Direction.RIGHT,
                keycode: KeyCode.TAB,
            })).resolves.toBe(false);
            expectSelectionToBe(19, 19, 19, 19);

            await expect(commandService.executeCommand<IMoveSelectionEnterAndTabCommandParams>(MoveSelectionEnterAndTabCommand.id, {
                direction: Direction.DOWN,
                keycode: KeyCode.ENTER,
            })).resolves.toBe(false);
            expectSelectionToBe(19, 19, 19, 19);
        });

        it('should keep the original tab anchor across repeated tab moves before enter', async () => {
            selectTopLeft();

            await commandService.executeCommand<IMoveSelectionEnterAndTabCommandParams>(MoveSelectionEnterAndTabCommand.id, {
                direction: Direction.RIGHT,
                keycode: KeyCode.TAB,
            });
            await commandService.executeCommand<IMoveSelectionEnterAndTabCommandParams>(MoveSelectionEnterAndTabCommand.id, {
                direction: Direction.RIGHT,
                keycode: KeyCode.TAB,
            });
            await commandService.executeCommand<IMoveSelectionEnterAndTabCommandParams>(MoveSelectionEnterAndTabCommand.id, {
                direction: Direction.DOWN,
                keycode: KeyCode.ENTER,
            });

            expectSelectionToBe(1, 0, 1, 0);
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

        it('should use default select-all params when none are provided', async () => {
            selectTopLeft();

            await commandService.executeCommand(SelectAllCommand.id);
            expect(selectionManagerService.getCurrentLastSelection()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 1,
                endColumn: 1,
                rangeType: RANGE_TYPE.NORMAL,
            });

            await commandService.executeCommand(SelectAllCommand.id);
            expect(selectionManagerService.getCurrentLastSelection()!.range).toEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 19,
                endColumn: 19,
                rangeType: RANGE_TYPE.ALL,
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

        it('should append interceptor redos to select-all execution', async () => {
            selectTopLeft();

            get(SheetInterceptorService).interceptCommand({
                getMutations: (command) => {
                    if (command.id !== SelectAllCommand.id) {
                        return { undos: [], redos: [] };
                    }

                    return {
                        undos: [],
                        redos: [
                            {
                                id: 'sheet.operation.set-selections',
                                params: {
                                    unitId: 'test',
                                    subUnitId: 'sheet1',
                                    reveal: true,
                                    selections: [
                                        {
                                            range: {
                                                startRow: 2,
                                                startColumn: 2,
                                                endRow: 2,
                                                endColumn: 2,
                                                rangeType: RANGE_TYPE.NORMAL,
                                            },
                                            primary: {
                                                startRow: 2,
                                                startColumn: 2,
                                                endRow: 2,
                                                endColumn: 2,
                                                actualRow: 2,
                                                actualColumn: 2,
                                                isMerged: false,
                                                isMergedMainCell: false,
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    };
                },
            });

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: false,
                expandToGapFirst: false,
            });

            expect(selectionManagerService.getCurrentLastSelection()!.range).toEqual({
                startRow: 2,
                startColumn: 2,
                endRow: 2,
                endColumn: 2,
                rangeType: RANGE_TYPE.NORMAL,
            });
        });

        it('should stop looping when the current whole-sheet selection is not the last stacked range', async () => {
            const selectAllService = get(SelectAllService);

            selectTopLeft();

            await commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: true,
                expandToGapFirst: false,
            });

            selectAllService.rangesStack.push({
                startRow: 0,
                startColumn: 0,
                endRow: 0,
                endColumn: 0,
                rangeType: RANGE_TYPE.NORMAL,
            });

            await expect(commandService.executeCommand<ISelectAllCommandParams>(SelectAllCommand.id, {
                loop: true,
                expandToGapFirst: false,
            })).resolves.toBe(false);

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
