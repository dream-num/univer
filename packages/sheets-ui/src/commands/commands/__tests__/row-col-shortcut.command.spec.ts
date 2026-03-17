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

import type { Injector, IRange, Univer } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { Direction, ICommandService, IConfirmService, IUniverInstanceService, LocaleService, RANGE_TYPE, TestConfirmService } from '@univerjs/core';
import {
    InsertColByRangeCommand,
    InsertColCommand,
    InsertColMutation,
    InsertRowByRangeCommand,
    InsertRowCommand,
    InsertRowMutation,
    RemoveColByRangeCommand,
    RemoveColCommand,
    RemoveColMutation,
    RemoveRowByRangeCommand,
    RemoveRowCommand,
    RemoveRowMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ShortcutExperienceService } from '../../../services/shortcut-experience.service';
import { RemoveColConfirmCommand, RemoveRowConfirmCommand } from '../remove-row-col-confirm.command';
import {
    DeleteSelectedRowsOrColsByShortcutCommand,
    InsertSelectedRowsOrColsByShortcutCommand,
    SelectColumnsByShortcutCommand,
    SelectRowsByShortcutCommand,
} from '../row-col-shortcut.command';
import { MoveSelectionCommand } from '../set-selection.command';
import { createCommandTestBed } from './create-command-test-bed';

function toSelection(range: IRange): ISelectionWithStyle {
    return {
        range,
        primary: null,
        style: null,
    };
}

function toSingleCellSelection(row: number, column: number): ISelectionWithStyle {
    return {
        range: {
            startRow: row,
            endRow: row,
            startColumn: column,
            endColumn: column,
            rangeType: RANGE_TYPE.NORMAL,
        },
        primary: {
            startRow: row,
            endRow: row,
            startColumn: column,
            endColumn: column,
            actualRow: row,
            actualColumn: column,
            isMerged: false,
            isMergedMainCell: false,
        },
        style: null,
    };
}

function toRowSelection(
    rowStart: number,
    rowEnd: number,
    endColumn: number,
    primaryRow?: number,
    primaryColumn?: number
): ISelectionWithStyle {
    const hasPrimary = primaryRow != null && primaryColumn != null;

    return {
        range: {
            startRow: rowStart,
            endRow: rowEnd,
            startColumn: 0,
            endColumn,
            rangeType: RANGE_TYPE.ROW,
        },
        primary: hasPrimary
            ? {
                startRow: primaryRow,
                endRow: primaryRow,
                startColumn: primaryColumn,
                endColumn: primaryColumn,
                actualRow: primaryRow,
                actualColumn: primaryColumn,
                isMerged: false,
                isMergedMainCell: false,
            }
            : null,
        style: null,
    };
}

function toColumnSelection(
    columnStart: number,
    columnEnd: number,
    endRow: number,
    primaryRow?: number,
    primaryColumn?: number
): ISelectionWithStyle {
    const hasPrimary = primaryRow != null && primaryColumn != null;

    return {
        range: {
            startRow: 0,
            endRow,
            startColumn: columnStart,
            endColumn: columnEnd,
            rangeType: RANGE_TYPE.COLUMN,
        },
        primary: hasPrimary
            ? {
                startRow: primaryRow,
                endRow: primaryRow,
                startColumn: primaryColumn,
                endColumn: primaryColumn,
                actualRow: primaryRow,
                actualColumn: primaryColumn,
                isMerged: false,
                isMergedMainCell: false,
            }
            : null,
        style: null,
    };
}

function getWorksheet(get: Injector['get']) {
    const worksheet = get(IUniverInstanceService).getUniverSheetInstance('test')?.getSheetBySheetId('sheet1');
    if (!worksheet) {
        throw new Error('Worksheet "sheet1" not found');
    }

    return worksheet;
}

describe('row col shortcut command', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let selectionService: SheetsSelectionsService;

    beforeEach(() => {
        const testBed = createCommandTestBed(undefined, [
            [IConfirmService, { useClass: TestConfirmService }],
            [ShortcutExperienceService],
        ]);

        univer = testBed.univer;
        get = testBed.get;
        commandService = get(ICommandService);
        selectionService = get(SheetsSelectionsService);

        [
            SetSelectionsOperation,
            SetRangeValuesMutation,
            InsertRowCommand,
            InsertRowByRangeCommand,
            InsertRowMutation,
            RemoveRowMutation,
            InsertColCommand,
            InsertColByRangeCommand,
            InsertColMutation,
            RemoveColMutation,
            RemoveRowCommand,
            RemoveRowByRangeCommand,
            RemoveColCommand,
            RemoveColByRangeCommand,
            RemoveRowConfirmCommand,
            RemoveColConfirmCommand,
            MoveSelectionCommand,
            SelectColumnsByShortcutCommand,
            SelectRowsByShortcutCommand,
            InsertSelectedRowsOrColsByShortcutCommand,
            DeleteSelectedRowsOrColsByShortcutCommand,
        ].forEach((command) => commandService.registerCommand(command));

        get(LocaleService).load({});
    });

    afterEach(() => {
        univer.dispose();
    });

    describe('selection conversion', () => {
        it('should toggle columns selection back to the original active cell', async () => {
            selectionService.setSelections([toSingleCellSelection(5, 3)]);

            expect(await commandService.executeCommand(SelectColumnsByShortcutCommand.id)).toBeTruthy();
            let selection = selectionService.getCurrentLastSelection();
            expect(selection?.range.rangeType).toBe(RANGE_TYPE.COLUMN);
            expect(selection?.primary?.actualRow).toBe(5);
            expect(selection?.primary?.actualColumn).toBe(3);

            expect(await commandService.executeCommand(SelectColumnsByShortcutCommand.id)).toBeTruthy();
            selection = selectionService.getCurrentLastSelection();
            expect(selection?.range).toMatchObject({
                startRow: 5,
                endRow: 5,
                startColumn: 3,
                endColumn: 3,
                rangeType: RANGE_TYPE.NORMAL,
            });
            expect(selection?.primary?.actualRow).toBe(5);
            expect(selection?.primary?.actualColumn).toBe(3);
        });

        it('should preserve active cell for navigation after selecting columns', async () => {
            selectionService.setSelections([toSingleCellSelection(5, 3)]);
            expect(await commandService.executeCommand(SelectColumnsByShortcutCommand.id)).toBeTruthy();

            expect(await commandService.executeCommand(MoveSelectionCommand.id, { direction: Direction.RIGHT })).toBeTruthy();
            const moved = selectionService.getCurrentLastSelection();
            expect(moved?.range).toMatchObject({
                startRow: 5,
                endRow: 5,
                startColumn: 4,
                endColumn: 4,
                rangeType: RANGE_TYPE.NORMAL,
            });
        });

        it('should preserve active cell for navigation after selecting rows', async () => {
            selectionService.setSelections([toSingleCellSelection(7, 4)]);
            expect(await commandService.executeCommand(SelectRowsByShortcutCommand.id)).toBeTruthy();

            expect(await commandService.executeCommand(MoveSelectionCommand.id, { direction: Direction.DOWN })).toBeTruthy();
            const moved = selectionService.getCurrentLastSelection();
            expect(moved?.range).toMatchObject({
                startRow: 8,
                endRow: 8,
                startColumn: 4,
                endColumn: 4,
                rangeType: RANGE_TYPE.NORMAL,
            });
        });

        it('should toggle rows selection back to the original active cell', async () => {
            selectionService.setSelections([toSingleCellSelection(7, 4)]);

            expect(await commandService.executeCommand(SelectRowsByShortcutCommand.id)).toBeTruthy();
            let selection = selectionService.getCurrentLastSelection();
            expect(selection?.range.rangeType).toBe(RANGE_TYPE.ROW);
            expect(selection?.primary?.actualRow).toBe(7);
            expect(selection?.primary?.actualColumn).toBe(4);

            expect(await commandService.executeCommand(SelectRowsByShortcutCommand.id)).toBeTruthy();
            selection = selectionService.getCurrentLastSelection();
            expect(selection?.range).toMatchObject({
                startRow: 7,
                endRow: 7,
                startColumn: 4,
                endColumn: 4,
                rangeType: RANGE_TYPE.NORMAL,
            });
            expect(selection?.primary?.actualRow).toBe(7);
            expect(selection?.primary?.actualColumn).toBe(4);
        });

        it('should convert multiple ranges to column selections', async () => {
            const worksheet = getWorksheet(get);
            const maxRow = worksheet.getRowCount() - 1;

            selectionService.setSelections([
                toSelection({
                    startRow: 1,
                    endRow: 2,
                    startColumn: 1,
                    endColumn: 3,
                    rangeType: RANGE_TYPE.NORMAL,
                }),
                toSelection({
                    startRow: 5,
                    endRow: 9,
                    startColumn: 6,
                    endColumn: 7,
                    rangeType: RANGE_TYPE.NORMAL,
                }),
            ]);

            expect(await commandService.executeCommand(SelectColumnsByShortcutCommand.id)).toBeTruthy();

            const selections = selectionService.getCurrentSelections();
            expect(selections.length).toBe(2);
            expect(selections[0].range).toMatchObject({
                startRow: 0,
                endRow: maxRow,
                startColumn: 1,
                endColumn: 3,
                rangeType: RANGE_TYPE.COLUMN,
            });
            expect(selections[1].range).toMatchObject({
                startRow: 0,
                endRow: maxRow,
                startColumn: 6,
                endColumn: 7,
                rangeType: RANGE_TYPE.COLUMN,
            });
        });

        it('should convert multiple ranges to row selections', async () => {
            const worksheet = getWorksheet(get);
            const maxColumn = worksheet.getColumnCount() - 1;

            selectionService.setSelections([
                toSelection({
                    startRow: 2,
                    endRow: 4,
                    startColumn: 3,
                    endColumn: 4,
                    rangeType: RANGE_TYPE.NORMAL,
                }),
                toSelection({
                    startRow: 8,
                    endRow: 10,
                    startColumn: 6,
                    endColumn: 9,
                    rangeType: RANGE_TYPE.NORMAL,
                }),
            ]);

            expect(await commandService.executeCommand(SelectRowsByShortcutCommand.id)).toBeTruthy();

            const selections = selectionService.getCurrentSelections();
            expect(selections.length).toBe(2);
            expect(selections[0].range).toMatchObject({
                startRow: 2,
                endRow: 4,
                startColumn: 0,
                endColumn: maxColumn,
                rangeType: RANGE_TYPE.ROW,
            });
            expect(selections[1].range).toMatchObject({
                startRow: 8,
                endRow: 10,
                startColumn: 0,
                endColumn: maxColumn,
                rangeType: RANGE_TYPE.ROW,
            });
        });
    });

    describe('insert via shortcut', () => {
        it('should insert selected row ranges with merged counts for multi-selections', async () => {
            const worksheet = getWorksheet(get);
            const maxColumn = worksheet.getColumnCount() - 1;
            const before = worksheet.getRowCount();

            selectionService.setSelections([
                toSelection({
                    startRow: 1,
                    endRow: 2,
                    startColumn: 0,
                    endColumn: maxColumn,
                    rangeType: RANGE_TYPE.ROW,
                }),
                toSelection({
                    startRow: 2,
                    endRow: 4,
                    startColumn: 0,
                    endColumn: maxColumn,
                    rangeType: RANGE_TYPE.ROW,
                }),
                toSelection({
                    startRow: 8,
                    endRow: 8,
                    startColumn: 0,
                    endColumn: maxColumn,
                    rangeType: RANGE_TYPE.ROW,
                }),
            ]);

            expect(await commandService.executeCommand(InsertSelectedRowsOrColsByShortcutCommand.id)).toBeTruthy();
            // merged rows: [1..4] + [8..8] => 5
            expect(worksheet.getRowCount()).toBe(before + 5);
            const selections = selectionService.getCurrentSelections();
            expect(selections[0].range).toMatchObject({
                startRow: 1,
                endRow: 4,
                startColumn: 0,
                endColumn: maxColumn,
                rangeType: RANGE_TYPE.ROW,
            });
            expect(selections[1].range).toMatchObject({
                startRow: 12,
                endRow: 12,
                startColumn: 0,
                endColumn: maxColumn,
                rangeType: RANGE_TYPE.ROW,
            });
        });

        it('should keep row highlight after row insertion', async () => {
            const worksheet = getWorksheet(get);
            const maxColumn = worksheet.getColumnCount() - 1;

            selectionService.setSelections([
                toRowSelection(6, 6, maxColumn, 6, 4),
            ]);

            expect(await commandService.executeCommand(InsertSelectedRowsOrColsByShortcutCommand.id)).toBeTruthy();
            const selection = selectionService.getCurrentLastSelection();
            expect(selection?.range).toMatchObject({
                startRow: 6,
                endRow: 6,
                startColumn: 0,
                endColumn: maxColumn,
                rangeType: RANGE_TYPE.ROW,
            });
            expect(selection?.primary?.actualRow).toBe(6);
            expect(selection?.primary?.actualColumn).toBe(4);
        });

        it('should insert selected column ranges with merged counts for multi-selections', async () => {
            const worksheet = getWorksheet(get);
            const maxRow = worksheet.getRowCount() - 1;
            const before = worksheet.getColumnCount();

            selectionService.setSelections([
                toSelection({
                    startRow: 0,
                    endRow: maxRow,
                    startColumn: 1,
                    endColumn: 2,
                    rangeType: RANGE_TYPE.COLUMN,
                }),
                toSelection({
                    startRow: 0,
                    endRow: maxRow,
                    startColumn: 2,
                    endColumn: 3,
                    rangeType: RANGE_TYPE.COLUMN,
                }),
                toSelection({
                    startRow: 0,
                    endRow: maxRow,
                    startColumn: 6,
                    endColumn: 6,
                    rangeType: RANGE_TYPE.COLUMN,
                }),
            ]);

            expect(await commandService.executeCommand(InsertSelectedRowsOrColsByShortcutCommand.id)).toBeTruthy();
            // merged cols: [1..3] + [6..6] => 4
            expect(worksheet.getColumnCount()).toBe(before + 4);
            const selections = selectionService.getCurrentSelections();
            expect(selections[0].range).toMatchObject({
                startRow: 0,
                endRow: maxRow,
                startColumn: 1,
                endColumn: 3,
                rangeType: RANGE_TYPE.COLUMN,
            });
            expect(selections[1].range).toMatchObject({
                startRow: 0,
                endRow: maxRow,
                startColumn: 9,
                endColumn: 9,
                rangeType: RANGE_TYPE.COLUMN,
            });
        });

        it('should keep column highlight after column insertion', async () => {
            const worksheet = getWorksheet(get);
            const maxRow = worksheet.getRowCount() - 1;

            selectionService.setSelections([
                toColumnSelection(4, 4, maxRow, 6, 4),
            ]);

            expect(await commandService.executeCommand(InsertSelectedRowsOrColsByShortcutCommand.id)).toBeTruthy();
            const selection = selectionService.getCurrentLastSelection();
            expect(selection?.range).toMatchObject({
                startRow: 0,
                endRow: maxRow,
                startColumn: 4,
                endColumn: 4,
                rangeType: RANGE_TYPE.COLUMN,
            });
            expect(selection?.primary?.actualRow).toBe(6);
            expect(selection?.primary?.actualColumn).toBe(4);
        });

        it('should allow repeated row insertion without re-highlighting', async () => {
            const worksheet = getWorksheet(get);
            const maxColumn = worksheet.getColumnCount() - 1;
            const before = worksheet.getRowCount();

            selectionService.setSelections([
                toRowSelection(6, 7, maxColumn, 6, 4),
            ]);

            expect(await commandService.executeCommand(InsertSelectedRowsOrColsByShortcutCommand.id)).toBeTruthy();
            expect(await commandService.executeCommand(InsertSelectedRowsOrColsByShortcutCommand.id)).toBeTruthy();

            expect(worksheet.getRowCount()).toBe(before + 4);
            const selection = selectionService.getCurrentLastSelection();
            expect(selection?.range).toMatchObject({
                startRow: 6,
                endRow: 7,
                startColumn: 0,
                endColumn: maxColumn,
                rangeType: RANGE_TYPE.ROW,
            });
        });

        it('should allow repeated column insertion without re-highlighting', async () => {
            const worksheet = getWorksheet(get);
            const maxRow = worksheet.getRowCount() - 1;
            const before = worksheet.getColumnCount();

            selectionService.setSelections([
                toColumnSelection(4, 5, maxRow, 6, 4),
            ]);

            expect(await commandService.executeCommand(InsertSelectedRowsOrColsByShortcutCommand.id)).toBeTruthy();
            expect(await commandService.executeCommand(InsertSelectedRowsOrColsByShortcutCommand.id)).toBeTruthy();

            expect(worksheet.getColumnCount()).toBe(before + 4);
            const selection = selectionService.getCurrentLastSelection();
            expect(selection?.range).toMatchObject({
                startRow: 0,
                endRow: maxRow,
                startColumn: 4,
                endColumn: 5,
                rangeType: RANGE_TYPE.COLUMN,
            });
        });

        it('should noop when selection type is not row or column', async () => {
            const worksheet = getWorksheet(get);
            const beforeRows = worksheet.getRowCount();
            const beforeCols = worksheet.getColumnCount();

            selectionService.setSelections([
                toSelection({
                    startRow: 1,
                    endRow: 1,
                    startColumn: 1,
                    endColumn: 1,
                    rangeType: RANGE_TYPE.NORMAL,
                }),
            ]);

            expect(await commandService.executeCommand(InsertSelectedRowsOrColsByShortcutCommand.id)).toBeFalsy();
            expect(worksheet.getRowCount()).toBe(beforeRows);
            expect(worksheet.getColumnCount()).toBe(beforeCols);
        });
    });

    describe('delete via shortcut', () => {
        it('should delete selected row ranges for multi-selections', async () => {
            const worksheet = getWorksheet(get);
            const maxColumn = worksheet.getColumnCount() - 1;
            const before = worksheet.getRowCount();

            selectionService.setSelections([
                toSelection({
                    startRow: 1,
                    endRow: 1,
                    startColumn: 0,
                    endColumn: maxColumn,
                    rangeType: RANGE_TYPE.ROW,
                }),
                toSelection({
                    startRow: 3,
                    endRow: 4,
                    startColumn: 0,
                    endColumn: maxColumn,
                    rangeType: RANGE_TYPE.ROW,
                }),
                toSelection({
                    startRow: 4,
                    endRow: 5,
                    startColumn: 0,
                    endColumn: maxColumn,
                    rangeType: RANGE_TYPE.ROW,
                }),
            ]);

            expect(await commandService.executeCommand(DeleteSelectedRowsOrColsByShortcutCommand.id)).toBeTruthy();
            // merged rows: [1..1] + [3..5] => 4
            expect(worksheet.getRowCount()).toBe(before - 4);
            const selections = selectionService.getCurrentSelections();
            expect(selections[0].range).toMatchObject({
                startRow: 1,
                endRow: 4,
                startColumn: 0,
                endColumn: maxColumn,
                rangeType: RANGE_TYPE.ROW,
            });
            expect(selections.length).toBe(1);
        });

        it('should keep row highlight after row deletion', async () => {
            const worksheet = getWorksheet(get);
            const maxColumn = worksheet.getColumnCount() - 1;

            selectionService.setSelections([
                toRowSelection(6, 6, maxColumn, 6, 4),
            ]);

            expect(await commandService.executeCommand(DeleteSelectedRowsOrColsByShortcutCommand.id)).toBeTruthy();
            const selection = selectionService.getCurrentLastSelection();
            expect(selection?.range).toMatchObject({
                startRow: 6,
                endRow: 6,
                startColumn: 0,
                endColumn: maxColumn,
                rangeType: RANGE_TYPE.ROW,
            });
            expect(selection?.primary?.actualRow).toBe(6);
            expect(selection?.primary?.actualColumn).toBe(4);
        });

        it('should delete selected column ranges for multi-selections', async () => {
            const worksheet = getWorksheet(get);
            const maxRow = worksheet.getRowCount() - 1;
            const before = worksheet.getColumnCount();

            selectionService.setSelections([
                toSelection({
                    startRow: 0,
                    endRow: maxRow,
                    startColumn: 1,
                    endColumn: 1,
                    rangeType: RANGE_TYPE.COLUMN,
                }),
                toSelection({
                    startRow: 0,
                    endRow: maxRow,
                    startColumn: 3,
                    endColumn: 4,
                    rangeType: RANGE_TYPE.COLUMN,
                }),
                toSelection({
                    startRow: 0,
                    endRow: maxRow,
                    startColumn: 4,
                    endColumn: 5,
                    rangeType: RANGE_TYPE.COLUMN,
                }),
            ]);

            expect(await commandService.executeCommand(DeleteSelectedRowsOrColsByShortcutCommand.id)).toBeTruthy();
            // merged cols: [1..1] + [3..5] => 4
            expect(worksheet.getColumnCount()).toBe(before - 4);
            const selections = selectionService.getCurrentSelections();
            expect(selections[0].range).toMatchObject({
                startRow: 0,
                endRow: maxRow,
                startColumn: 1,
                endColumn: 4,
                rangeType: RANGE_TYPE.COLUMN,
            });
            expect(selections.length).toBe(1);
        });

        it('should keep column highlight after column deletion', async () => {
            const worksheet = getWorksheet(get);
            const maxRow = worksheet.getRowCount() - 1;

            selectionService.setSelections([
                toColumnSelection(4, 4, maxRow, 6, 4),
            ]);

            expect(await commandService.executeCommand(DeleteSelectedRowsOrColsByShortcutCommand.id)).toBeTruthy();
            const selection = selectionService.getCurrentLastSelection();
            expect(selection?.range).toMatchObject({
                startRow: 0,
                endRow: maxRow,
                startColumn: 4,
                endColumn: 4,
                rangeType: RANGE_TYPE.COLUMN,
            });
            expect(selection?.primary?.actualRow).toBe(6);
            expect(selection?.primary?.actualColumn).toBe(4);
        });

        it('should allow repeated row deletion without re-highlighting', async () => {
            const worksheet = getWorksheet(get);
            const maxColumn = worksheet.getColumnCount() - 1;
            const before = worksheet.getRowCount();

            selectionService.setSelections([
                toRowSelection(6, 7, maxColumn, 6, 4),
            ]);

            expect(await commandService.executeCommand(DeleteSelectedRowsOrColsByShortcutCommand.id)).toBeTruthy();
            expect(await commandService.executeCommand(DeleteSelectedRowsOrColsByShortcutCommand.id)).toBeTruthy();

            expect(worksheet.getRowCount()).toBe(before - 4);
            const selection = selectionService.getCurrentLastSelection();
            expect(selection?.range).toMatchObject({
                startRow: 6,
                endRow: 7,
                startColumn: 0,
                endColumn: maxColumn,
                rangeType: RANGE_TYPE.ROW,
            });
        });

        it('should allow repeated column deletion without re-highlighting', async () => {
            const worksheet = getWorksheet(get);
            const maxRow = worksheet.getRowCount() - 1;
            const before = worksheet.getColumnCount();

            selectionService.setSelections([
                toColumnSelection(4, 5, maxRow, 6, 4),
            ]);

            expect(await commandService.executeCommand(DeleteSelectedRowsOrColsByShortcutCommand.id)).toBeTruthy();
            expect(await commandService.executeCommand(DeleteSelectedRowsOrColsByShortcutCommand.id)).toBeTruthy();

            expect(worksheet.getColumnCount()).toBe(before - 4);
            const selection = selectionService.getCurrentLastSelection();
            expect(selection?.range).toMatchObject({
                startRow: 0,
                endRow: maxRow,
                startColumn: 4,
                endColumn: 5,
                rangeType: RANGE_TYPE.COLUMN,
            });
        });

        it('should not delete all rows when multi-selections cover all rows', async () => {
            const worksheet = getWorksheet(get);
            const maxColumn = worksheet.getColumnCount() - 1;
            const maxRow = worksheet.getRowCount() - 1;
            const before = worksheet.getRowCount();
            const middle = Math.floor(maxRow / 2);

            selectionService.setSelections([
                toSelection({
                    startRow: 0,
                    endRow: middle,
                    startColumn: 0,
                    endColumn: maxColumn,
                    rangeType: RANGE_TYPE.ROW,
                }),
                toSelection({
                    startRow: middle + 1,
                    endRow: maxRow,
                    startColumn: 0,
                    endColumn: maxColumn,
                    rangeType: RANGE_TYPE.ROW,
                }),
            ]);

            expect(await commandService.executeCommand(DeleteSelectedRowsOrColsByShortcutCommand.id)).toBeFalsy();
            expect(worksheet.getRowCount()).toBe(before);
        });
    });
});
