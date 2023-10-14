/* eslint-disable no-magic-numbers */
import { ICommandService, ICurrentUniverService, RANGE_TYPE, RedoCommand, UndoCommand, Univer } from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../../services/selection-manager.service';
import { SetColHiddenMutation, SetColVisibleMutation } from '../../mutations/set-col-visible.mutation';
import { SetRowHiddenMutation, SetRowVisibleMutation } from '../../mutations/set-row-visible.mutation';
import { SetColHiddenCommand, SetSelectedColsVisibleCommand } from '../set-col-visible.command';
import { SetRowHiddenCommand, SetSelectedRowsVisibleCommand } from '../set-row-visible.command';
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
        ].forEach((command) => {
            commandService.registerCommand(command);
        });

        const selectionManager = get(SelectionManagerService);
        selectionManager.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: 'test',
            sheetId: 'sheet1',
        });
    });

    afterEach(() => univer.dispose());

    function getRowCount(): number {
        const currentService = get(ICurrentUniverService);
        const workbook = currentService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet.getRowCount();
    }

    function getColCount(): number {
        const currentService = get(ICurrentUniverService);
        const workbook = currentService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet.getColumnCount();
    }

    function getRowVisible(row: number): boolean {
        const workbook = get(ICurrentUniverService).getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet.getRowVisible(row);
    }

    function getColVisible(col: number): boolean {
        const workbook = get(ICurrentUniverService).getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet.getColVisible(col);
    }

    function selectRow(rowStart: number, rowEnd: number): void {
        const selectionManagerService = get(SelectionManagerService);
        const endColumn = getColCount() - 1;
        selectionManagerService.add([
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
        const selectionManagerService = get(SelectionManagerService);
        const endRow = getRowCount() - 1;
        selectionManagerService.add([
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
            expect(getRowVisible(0)).toBeTruthy();

            selectRow(0, 0);
            await commandService.executeCommand(SetRowHiddenCommand.id);
            expect(getRowVisible(0)).toBeFalsy();

            await commandService.executeCommand(UndoCommand.id);
            expect(getRowVisible(0)).toBeTruthy();

            await commandService.executeCommand(RedoCommand.id);
            expect(getRowVisible(0)).toBeFalsy();

            selectRow(2, 2);
            await commandService.executeCommand(SetRowHiddenCommand.id);
            expect(getRowVisible(2)).toBeFalsy();

            // select a range and invoke unhide command will unhide all
            // hidden rows in the selected range
            selectRow(0, 7);
            await commandService.executeCommand(SetSelectedRowsVisibleCommand.id);
            expect(getRowVisible(0)).toBeTruthy();
            expect(getRowVisible(2)).toBeTruthy();

            await commandService.executeCommand(UndoCommand.id);
            expect(getRowVisible(0)).toBeFalsy();
            expect(getRowVisible(2)).toBeFalsy();
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

            selectColumn(2, 2);
            await commandService.executeCommand(SetColHiddenCommand.id);
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
    });
});
