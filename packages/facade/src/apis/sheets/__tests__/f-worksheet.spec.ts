/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICellData, Injector, IStyleData, Nullable, Workbook } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, RANGE_TYPE, UniverInstanceType } from '@univerjs/core';
import { InsertColCommand, InsertColMutation, InsertRowCommand, InsertRowMutation, MoveColsCommand, MoveColsMutation, MoveRowsCommand, MoveRowsMutation, RemoveColCommand, RemoveColMutation, RemoveRowCommand, RemoveRowMutation, SetColHiddenCommand, SetColHiddenMutation, SetColVisibleMutation, SetColWidthCommand, SetHorizontalTextAlignCommand, SetRangeValuesCommand, SetRangeValuesMutation, SetRowHeightCommand, SetRowHiddenCommand, SetRowHiddenMutation, SetRowVisibleMutation, SetSelectionsOperation, SetSpecificColsVisibleCommand, SetSpecificRowsVisibleCommand, SetStyleCommand, SetTextWrapCommand, SetVerticalTextAlignCommand, SetWorksheetColWidthMutation, SetWorksheetRowHeightMutation, SetWorksheetRowIsAutoHeightCommand, SetWorksheetRowIsAutoHeightMutation, SheetsSelectionsService } from '@univerjs/sheets';
import { beforeEach, describe, expect, it } from 'vitest';

import type { FUniver } from '../../facade';
import { createWorksheetTestBed } from './create-worksheet-test-bed';

describe('Test FWorksheet', () => {
    let get: Injector['get'];
    let commandService: ICommandService;
    let univerAPI: FUniver;
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
    let setSelection: (startRow: number, endRow: number, startColumn: number, endColumn: number) => void;

    beforeEach(() => {
        const testBed = createWorksheetTestBed();
        get = testBed.get;
        univerAPI = testBed.univerAPI;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetStyleCommand);
        commandService.registerCommand(SetVerticalTextAlignCommand);
        commandService.registerCommand(SetHorizontalTextAlignCommand);
        commandService.registerCommand(SetTextWrapCommand);

        // row
        commandService.registerCommand(InsertRowCommand);
        commandService.registerCommand(InsertRowMutation);
        commandService.registerCommand(RemoveRowCommand);
        commandService.registerCommand(RemoveRowMutation);
        commandService.registerCommand(MoveRowsCommand);
        commandService.registerCommand(MoveRowsMutation);
        commandService.registerCommand(SetRowHiddenCommand);
        commandService.registerCommand(SetRowHiddenMutation);
        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(SetSpecificRowsVisibleCommand);
        commandService.registerCommand(SetRowVisibleMutation);
        commandService.registerCommand(SetRowHeightCommand);
        commandService.registerCommand(SetWorksheetRowHeightMutation);
        commandService.registerCommand(SetWorksheetRowIsAutoHeightCommand);
        commandService.registerCommand(SetWorksheetRowIsAutoHeightMutation);

        // column
        commandService.registerCommand(InsertColCommand);
        commandService.registerCommand(InsertColMutation);
        commandService.registerCommand(RemoveColCommand);
        commandService.registerCommand(RemoveColMutation);
        commandService.registerCommand(MoveColsCommand);
        commandService.registerCommand(MoveColsMutation);
        commandService.registerCommand(SetColHiddenCommand);
        commandService.registerCommand(SetColHiddenMutation);
        commandService.registerCommand(SetSpecificColsVisibleCommand);
        commandService.registerCommand(SetColVisibleMutation);
        commandService.registerCommand(SetColWidthCommand);
        commandService.registerCommand(SetWorksheetColWidthMutation);

        getValueByPosition = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Nullable<ICellData> =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValue();

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

        setSelection = (startRow: number, endRow: number, startColumn: number, endColumn: number, rangeType: RANGE_TYPE = RANGE_TYPE.NORMAL) => {
            const selectionManagerService = get(SheetsSelectionsService);
            selectionManagerService.addSelections([
                {
                    range: { startRow, startColumn, endColumn, endRow, rangeType },
                    primary: {
                        startRow,
                        endRow: startRow,
                        startColumn,
                        endColumn: startColumn,
                        actualColumn: startColumn,
                        actualRow: startRow,
                        isMerged: false,
                        isMergedMainCell: false,
                    },
                    style: null,
                },
            ]);
        };
    });

    it('Worksheet getSheetId', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');
        expect(activeSheet?.getSheetId()).toBe('sheet1');
    });

    it('Worksheet getSheetName', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');
        expect(activeSheet?.getSheetName()).toBe('sheet1');
    });

    it('Worksheet getSelection', () => {
        setSelection(0, 0, 0, 0);
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');
        const range = activeSheet?.getSelection()?.getActiveRange()?.getRange();
        expect(range).toEqual({ startRow: 0, startColumn: 0, endRow: 0, endColumn: 0, rangeType: RANGE_TYPE.NORMAL });
    });

    it('Worksheet getRange', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');
        const range = activeSheet?.getRange(0, 3, 1, 1);
        expect(range).toBeDefined();
    });

    it('Worksheet getMaxColumns', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');
        expect(activeSheet?.getMaxColumns()).toBe(100);
    });

    it('Worksheet getMaxRows', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');
        expect(activeSheet?.getMaxRows()).toBe(100);
    });

    // #region Data Validation

    it('Worksheet getDataValidations', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');
        expect(activeSheet?.getDataValidations()).toBeDefined();
    });

    it('Worksheet getValidatorStatus', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');
        expect(activeSheet?.getValidatorStatus()).toBeDefined();
    });

    // #endregion

    // #region Filter

    it('Worksheet getFilter', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');
        expect(activeSheet?.getFilter()).toBeDefined();
    });

    // #endregion

    // #region Row

    it('Worksheet insertRowAfter', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.insertRowAfter(0);
        expect(sheet).toBeDefined();
        expect(sheet?.getMaxRows()).toBe(101);
    });

    it('Worksheet insertRowBefore', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.insertRowBefore(0);
        expect(sheet).toBeDefined();
        expect(sheet?.getMaxRows()).toBe(101);
    });

    it('Worksheet insertRows', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.insertRows(0, 2);
        expect(sheet).toBeDefined();
        expect(sheet?.getMaxRows()).toBe(102);
    });

    it('Worksheet insertRowsAfter', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.insertRowsAfter(0, 2);
        expect(sheet).toBeDefined();
        expect(sheet?.getMaxRows()).toBe(102);
    });

    it('Worksheet insertRowsBefore', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.insertRowsBefore(0, 2);
        expect(sheet).toBeDefined();
        expect(sheet?.getMaxRows()).toBe(102);
    });

    it('Worksheet deleteRow', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.deleteRow(0);
        expect(sheet).toBeDefined();
        expect(sheet?.getMaxRows()).toBe(99);
    });

    it('Worksheet deleteRows', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.deleteRows(0, 2);
        expect(sheet).toBeDefined();
        expect(sheet?.getMaxRows()).toBe(98);
    });

    it('Worksheet moveRows', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const range = activeSheet?.getRange(0, 0, 1, 1);
        if (!range) return;

        const sheet = await activeSheet?.moveRows(range, 10);
        expect(sheet).toBeDefined();
        expect(sheet?.getRange(9, 0, 1, 1).getValue()).toBe(1);
    });

    it('Worksheet hideRow/unhideRow', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const range = activeSheet?.getRange(0, 0, 1, 1);
        if (!range) return;

        const sheet = await activeSheet?.hideRow(range);
        expect(sheet).toBeDefined();

        const currentWorksheet = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
        const hiddenRows = currentWorksheet?.getHiddenRows();
        expect(hiddenRows).toStrictEqual([{
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 99,
            rangeType: RANGE_TYPE.ROW,
        }]);

        const sheet2 = await activeSheet?.unhideRow(range);
        expect(sheet2).toBeDefined();

        const hiddenRows2 = currentWorksheet?.getHiddenRows();
        expect(hiddenRows2).toStrictEqual([]);
    });

    it('Worksheet hideRows/showRows', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.hideRows(0, 2);
        expect(sheet).toBeDefined();

        const currentWorksheet = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
        const hiddenRows = currentWorksheet?.getHiddenRows();
        expect(hiddenRows).toStrictEqual([{
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 99,
            rangeType: RANGE_TYPE.ROW,
        }]);

        const sheet2 = await activeSheet?.showRows(0, 2);
        expect(sheet2).toBeDefined();

        const hiddenRows2 = currentWorksheet?.getHiddenRows();
        expect(hiddenRows2).toStrictEqual([]);
    });

    it('Worksheet setRowHeight', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.setRowHeight(0, 100);
        expect(sheet).toBeDefined();

        const currentWorksheet = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
        const currentRowHeight = currentWorksheet?.getRowManager().getRowHeight(0);
        expect(currentRowHeight).toBe(100);
    });

    it('Worksheet setRowHeights', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.setRowHeights(0, 2, 100);
        expect(sheet).toBeDefined();

        const currentWorksheet = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
        const currentRowHeight = currentWorksheet?.getRowManager().getRowHeight(0, 2);
        expect(currentRowHeight).toBe(200);
    });

    it('Worksheet setRowHeightsForced', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.setRowHeightsForced(0, 2, 100);
        expect(sheet).toBeDefined();

        const currentWorksheet = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
        const currentRowHeight = currentWorksheet?.getRowManager().getRowHeight(0, 2);
        expect(currentRowHeight).toBe(200);
    });

    // #endregion

    // #region Column

    it('Worksheet insertColumnAfter', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.insertColumnAfter(0);
        expect(sheet).toBeDefined();
        expect(sheet?.getMaxColumns()).toBe(101);
    });

    it('Worksheet insertColumnBefore', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.insertColumnBefore(0);
        expect(sheet).toBeDefined();
        expect(sheet?.getMaxColumns()).toBe(101);
    });

    it('Worksheet insertColumns', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.insertColumns(0, 2);
        expect(sheet).toBeDefined();
        expect(sheet?.getMaxColumns()).toBe(102);
    });

    it('Worksheet insertColumnsAfter', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.insertColumnsAfter(0, 2);
        expect(sheet).toBeDefined();
        expect(sheet?.getMaxColumns()).toBe(102);
    });

    it('Worksheet insertColumnsBefore', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.insertColumnsBefore(0, 2);
        expect(sheet).toBeDefined();
        expect(sheet?.getMaxColumns()).toBe(102);
    });

    it('Worksheet deleteColumn', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.deleteColumn(0);
        expect(sheet).toBeDefined();
        expect(sheet?.getMaxColumns()).toBe(99);
    });

    it('Worksheet deleteColumns', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.deleteColumns(0, 2);
        expect(sheet).toBeDefined();
        expect(sheet?.getMaxColumns()).toBe(98);
    });

    it('Worksheet moveColumns', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const range = activeSheet?.getRange(0, 0, 1, 1);
        if (!range) return;

        const sheet = await activeSheet?.moveColumns(range, 10);
        expect(sheet).toBeDefined();
        expect(sheet?.getRange(0, 9, 1, 1).getValue()).toBe(1);
    });

    it('Worksheet hideColumn/unhideColumn', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const range = activeSheet?.getRange(0, 0, 1, 1);
        if (!range) return;

        const sheet = await activeSheet?.hideColumn(range);
        expect(sheet).toBeDefined();

        const currentWorksheet = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
        const hiddenCols = currentWorksheet?.getHiddenCols();
        expect(hiddenCols).toStrictEqual([{
            startRow: 0,
            endRow: 99,
            startColumn: 0,
            endColumn: 0,
            rangeType: RANGE_TYPE.COLUMN,
        }]);

        const sheet2 = await activeSheet?.unhideColumn(range);
        expect(sheet2).toBeDefined();

        const hiddenCols2 = currentWorksheet?.getHiddenCols();
        expect(hiddenCols2).toStrictEqual([]);
    });

    it('Worksheet hideColumns/showColumns', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.hideColumns(0, 2);
        expect(sheet).toBeDefined();

        const currentWorksheet = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
        const hiddenCols = currentWorksheet?.getHiddenCols();
        expect(hiddenCols).toStrictEqual([{
            startRow: 0,
            endRow: 99,
            startColumn: 0,
            endColumn: 1,
            rangeType: RANGE_TYPE.COLUMN,
        }]);

        const sheet2 = await activeSheet?.showColumns(0, 2);
        expect(sheet2).toBeDefined();

        const hiddenCols2 = currentWorksheet?.getHiddenCols();
        expect(hiddenCols2).toStrictEqual([]);
    });

    it('Worksheet setColWidth', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.setColumnWidth(0, 100);
        expect(sheet).toBeDefined();

        const currentWorksheet = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
        const currentColWidth = currentWorksheet?.getColumnManager().getColumnWidth(0);
        expect(currentColWidth).toBe(100);
    });

    it('Worksheet setColWidths', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.setColumnWidths(0, 2, 100);
        expect(sheet).toBeDefined();

        const currentWorksheet = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
        const currentColWidth = currentWorksheet?.getColumnManager().getColumnWidth(0);
        expect(currentColWidth).toBe(100);
        const currentColWidth2 = currentWorksheet?.getColumnManager().getColumnWidth(1);
        expect(currentColWidth2).toBe(100);
    });

    // #endregion
});
