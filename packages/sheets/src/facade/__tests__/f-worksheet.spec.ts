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

import type { Workbook } from '@univerjs/core';
import {
    BooleanNumber,
    BorderStyleTypes,
    BorderType,
    CommandType,
    Dimension,
    Direction,
    ICommandService,
    IConfirmService,
    ILogService,
    Injector,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleType,
    PresetListType,
    RANGE_TYPE,
    RedoCommand,
    SheetTypes,
    TestConfirmService,
    Tools,
    UndoCommand,
    Univer,
    UniverInstanceType,
    WorksheetHiddenState,
} from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import { AddWorksheetMergeCommand } from '../../commands/commands/add-worksheet-merge.command';
import { SetWorksheetRangeThemeStyleCommand } from '../../commands/commands/add-worksheet-range-theme.command';
import { AppendRowCommand } from '../../commands/commands/append-row.command';
import { AutoFillCommand } from '../../commands/commands/auto-fill.command';
import { ClearSelectionAllCommand } from '../../commands/commands/clear-selection-all.command';
import { ClearSelectionContentCommand } from '../../commands/commands/clear-selection-content.command';
import { ClearSelectionFormatCommand } from '../../commands/commands/clear-selection-format.command';
import { DeleteRangeMoveLeftCommand } from '../../commands/commands/delete-range-move-left.command';
import { DeleteRangeMoveUpCommand } from '../../commands/commands/delete-range-move-up.command';
import { InsertRangeMoveDownCommand } from '../../commands/commands/insert-range-move-down.command';
import { InsertRangeMoveRightCommand } from '../../commands/commands/insert-range-move-right.command';
import {
    InsertColByRangeCommand,
    InsertColCommand,
    InsertRowByRangeCommand,
    InsertRowCommand,
} from '../../commands/commands/insert-row-col.command';
import { MoveRangeCommand } from '../../commands/commands/move-range.command';
import { MoveColsCommand, MoveRowsCommand } from '../../commands/commands/move-rows-cols.command';
import { RefillCommand } from '../../commands/commands/refill.command';
import {
    RemoveColByRangeCommand,
    RemoveColCommand,
    RemoveRowByRangeCommand,
    RemoveRowCommand,
} from '../../commands/commands/remove-row-col.command';
import { RemoveWorksheetMergeCommand } from '../../commands/commands/remove-worksheet-merge.command';
import { ReorderRangeCommand } from '../../commands/commands/reorder-range.command';
import {
    SetBorderBasicCommand,
    SetBorderColorCommand,
    SetBorderPositionCommand,
    SetBorderStyleCommand,
} from '../../commands/commands/set-border.command';
import { SetColDataCommand } from '../../commands/commands/set-col-data.command';
import { SetColHiddenCommand, SetSpecificColsVisibleCommand } from '../../commands/commands/set-col-visible.command';
import { CancelFrozenCommand, SetFrozenCommand } from '../../commands/commands/set-frozen.command';
import { SetRangeValuesCommand } from '../../commands/commands/set-range-values.command';
import { SetRowDataCommand } from '../../commands/commands/set-row-data.command';
import { SetRowHiddenCommand, SetSpecificRowsVisibleCommand } from '../../commands/commands/set-row-visible.command';
import {
    SetHorizontalTextAlignCommand,
    SetStyleCommand,
    SetTextWrapCommand,
    SetVerticalTextAlignCommand,
} from '../../commands/commands/set-style.command';
import { SetColWidthCommand } from '../../commands/commands/set-worksheet-col-width.command';
import { SetWorksheetColumnCountCommand } from '../../commands/commands/set-worksheet-column-count.command';
import { SetWorksheetDefaultStyleCommand } from '../../commands/commands/set-worksheet-default-style.command';
import { SetWorksheetHideCommand } from '../../commands/commands/set-worksheet-hide.command';
import { SetWorksheetNameCommand } from '../../commands/commands/set-worksheet-name.command';
import { SetWorksheetOrderCommand } from '../../commands/commands/set-worksheet-order.command';
import { SetWorksheetRowCountCommand } from '../../commands/commands/set-worksheet-row-count.command';
import {
    SetRowHeightCommand,
    SetWorksheetRowIsAutoHeightCommand,
} from '../../commands/commands/set-worksheet-row-height.command';
import { SetWorksheetShowCommand } from '../../commands/commands/set-worksheet-show.command';
import { SplitTextToColumnsCommand } from '../../commands/commands/split-text-to-columns.command';
import { TextToNumberCommand } from '../../commands/commands/text-to-number.command';
import { ToggleCellCheckboxCommand } from '../../commands/commands/toggle-checkbox.command';
import { ToggleGridlinesCommand } from '../../commands/commands/toggle-gridlines.command';
import { AddWorksheetMergeMutation } from '../../commands/mutations/add-worksheet-merge.mutation';
import { InsertColMutation, InsertRowMutation } from '../../commands/mutations/insert-row-col.mutation';
import { MoveColsMutation, MoveRowsMutation } from '../../commands/mutations/move-rows-cols.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../../commands/mutations/remove-row-col.mutation';
import { RemoveWorksheetMergeMutation } from '../../commands/mutations/remove-worksheet-merge.mutation';
import { SetColDataMutation } from '../../commands/mutations/set-col-data.mutation';
import { SetColHiddenMutation, SetColVisibleMutation } from '../../commands/mutations/set-col-visible.mutation';
import { SetFrozenMutation } from '../../commands/mutations/set-frozen.mutation';
import { SetRangeValuesMutation } from '../../commands/mutations/set-range-values.mutation';
import { SetRowDataMutation } from '../../commands/mutations/set-row-data.mutation';
import { SetRowHiddenMutation, SetRowVisibleMutation } from '../../commands/mutations/set-row-visible.mutation';
import { SetWorksheetColWidthMutation } from '../../commands/mutations/set-worksheet-col-width.mutation';
import { SetWorksheetColumnCountMutation } from '../../commands/mutations/set-worksheet-column-count.mutation';
import { SetWorksheetDefaultStyleMutation } from '../../commands/mutations/set-worksheet-default-style.mutation';
import { SetWorksheetHideMutation } from '../../commands/mutations/set-worksheet-hide.mutation';
import { SetWorksheetNameMutation } from '../../commands/mutations/set-worksheet-name.mutation';
import { SetWorksheetRowCountMutation } from '../../commands/mutations/set-worksheet-row-count.mutation';
import {
    SetWorksheetRowHeightMutation,
    SetWorksheetRowIsAutoHeightMutation,
} from '../../commands/mutations/set-worksheet-row-height.mutation';
import { SetSelectionsOperation } from '../../commands/operations/selection.operation';
import { SetWorksheetActiveOperation } from '../../commands/operations/set-worksheet-active.operation';
import enUS from '../../locale/en-US';
import { UniverSheetsPlugin } from '../../plugin';
import { IAutoFillService } from '../../services/auto-fill/auto-fill.service';
import { AUTO_FILL_APPLY_TYPE } from '../../services/auto-fill/type';
import { BorderStyleManagerService } from '../../services/border-style-manager.service';
import { SheetsSelectionsService } from '../../services/selections/selection.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { SheetSkeletonService } from '../../skeleton/skeleton.service';
import { SHEETS_CUSTOM_FIELD_WARNING_MESSAGE } from '../const';
import { createWorksheetTestBed } from './create-worksheet-test-bed';

describe('Test FWorksheet', () => {
    let get: Injector['get'];
    let commandService: ICommandService;
    let univerAPI: FUniver;

    let setSelection: (startRow: number, endRow: number, startColumn: number, endColumn: number) => void;

    beforeEach(() => {
        const testBed = createWorksheetTestBed(undefined, [
            [IConfirmService, { useClass: TestConfirmService }],
        ]);
        get = testBed.get;
        univerAPI = testBed.univerAPI;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesCommand);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetStyleCommand);
        commandService.registerCommand(SetVerticalTextAlignCommand);
        commandService.registerCommand(SetHorizontalTextAlignCommand);
        commandService.registerCommand(SetTextWrapCommand);
        commandService.registerCommand(AppendRowCommand);
        commandService.registerCommand(ClearSelectionAllCommand);
        commandService.registerCommand(ClearSelectionContentCommand);
        commandService.registerCommand(ClearSelectionFormatCommand);
        commandService.registerCommand(SetWorksheetDefaultStyleMutation);
        commandService.registerCommand(SetWorksheetRowCountCommand);
        commandService.registerCommand(SetWorksheetRowCountMutation);
        commandService.registerCommand(SetWorksheetColumnCountCommand);
        commandService.registerCommand(SetWorksheetColumnCountMutation);
        commandService.registerCommand(SetWorksheetHideCommand);
        commandService.registerCommand(SetWorksheetHideMutation);
        commandService.registerCommand(SetWorksheetShowCommand);
        commandService.registerCommand(SetWorksheetActiveOperation);
        commandService.registerCommand(SetWorksheetNameCommand);
        commandService.registerCommand(SetWorksheetNameMutation);
        get(SheetSkeletonService).ensureSkeleton('test', 'sheet1');

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
        commandService.registerCommand(SetRowDataCommand);
        commandService.registerCommand(SetRowDataMutation);
        commandService.registerCommand(SetColDataCommand);
        commandService.registerCommand(SetColDataMutation);

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

        // merge cells
        commandService.registerCommand(AddWorksheetMergeCommand);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(RemoveWorksheetMergeCommand);
        commandService.registerCommand(RemoveWorksheetMergeMutation);

        // freeze
        commandService.registerCommand(SetFrozenCommand);
        commandService.registerCommand(SetFrozenMutation);
        commandService.registerCommand(CancelFrozenCommand);

        [
            RemoveColByRangeCommand,
            RemoveRowByRangeCommand,
            InsertRowByRangeCommand,
            InsertColByRangeCommand,
        ].forEach((command) => {
            commandService.registerCommand(command);
        });

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

    it('Worksheet manages sheet-level styles and clears content or formats independently', () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getSheetByName('sheet1')!;

        expect(activeSheet.getSheet().getSheetId()).toBe('sheet1');
        expect(activeSheet.getWorkbook().getUnitId()).toBe('test');
        expect(activeSheet.getInject()).toBe(get(Injector));

        activeSheet.setDefaultStyle({ ff: 'Inter', fs: 13 });
        activeSheet.setRowDefaultStyle(4, { fs: 16, bg: { rgb: '#fff2cc' } });
        activeSheet.setColumnDefaultStyle(2, { ff: 'Mono', cl: { rgb: '#3366ff' } });

        expect(activeSheet.getDefaultStyle()).toMatchObject({ ff: 'Inter', fs: 13 });
        expect(activeSheet.getRowDefaultStyle(4)).toMatchObject({ fs: 16, bg: { rgb: '#fff2cc' } });
        expect(activeSheet.getColumnDefaultStyle(2)).toMatchObject({ ff: 'Mono', cl: { rgb: '#3366ff' } });
        expect(activeSheet.getRowDefaultStyle(4, true)).toMatchObject({ fs: 16, bg: { rgb: '#fff2cc' } });
        expect(activeSheet.getColumnDefaultStyle(2, true)).toMatchObject({ ff: 'Mono', cl: { rgb: '#3366ff' } });

        const cell = activeSheet.getRange('A1');
        cell.setValue('Budget').setBackground('#ddeeff');
        activeSheet.clear({ contentsOnly: true });
        expect(cell.getValue()).toBeNull();
        expect(cell.getBackground()).toBe('#ddeeff');

        cell.setValue('Budget');
        activeSheet.clear({ formatOnly: true });
        expect(cell.getValue()).toBe('Budget');
        expect(cell.getBackground()).not.toBe('#ddeeff');

        cell.setValue('Budget').setBackground('#ddeeff');
        activeSheet.clear();
        expect(cell.getValue()).toBeNull();
        expect(cell.getBackground()).not.toBe('#ddeeff');
    });

    it('Worksheet getMaxColumns', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');
        expect(activeSheet?.getMaxColumns()).toBe(100);
    });

    it('Worksheet getMaxRows', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');
        expect(activeSheet?.getMaxRows()).toBe(100);
    });

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

    it('Worksheet inserts rows after the last valid row index', () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getSheetByName('sheet1')!;
        const rowCount = activeSheet.getMaxRows();

        activeSheet.insertRowsAfter(rowCount - 1, 30);

        expect(activeSheet.getMaxRows()).toBe(rowCount + 30);
    });

    it('Worksheet rejects invalid row insertion indexes with actionable errors', () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getSheetByName('sheet1')!;
        const rowCount = activeSheet.getMaxRows();
        const executeCommand = vi.spyOn(commandService, 'syncExecuteCommand');

        expect(() => activeSheet.insertRows(rowCount, 30)).toThrowError(
            `insertRows(): row index ${rowCount} is out of bounds. ` +
            `The worksheet has ${rowCount} rows; expected an integer from 0 to ${rowCount - 1}. ` +
            `To insert 30 row(s) at the bottom, use insertRowsAfter(${rowCount - 1}, 30). ` +
            `To resize the worksheet directly, use setRowCount(${rowCount + 30}).`
        );
        expect(() => activeSheet.insertRowsAfter(-1, 1)).toThrowError(/expected an integer from 0 to 99/);
        expect(() => activeSheet.insertRowAfter(rowCount)).toThrowError(/insertRowsAfter\(\): row index 100/);
        expect(() => activeSheet.insertRowBefore(-1)).toThrowError(/insertRowsBefore\(\): row index -1/);
        expect(executeCommand).not.toHaveBeenCalled();
    });

    it('Worksheet rejects invalid row insertion counts', () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getSheetByName('sheet1')!;
        const executeCommand = vi.spyOn(commandService, 'syncExecuteCommand');

        expect(() => activeSheet.insertRows(0, 0)).toThrowError('insertRows(): row count 0 must be a positive integer.');
        expect(() => activeSheet.insertRowsBefore(0, -1)).toThrowError('insertRowsBefore(): row count -1 must be a positive integer.');
        expect(() => activeSheet.insertRowsAfter(0, 1.5)).toThrowError('insertRowsAfter(): row count 1.5 must be a positive integer.');
        expect(executeCommand).not.toHaveBeenCalled();
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

        const currentWorksheet = get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
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

        const currentWorksheet = get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
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

        const currentWorksheet = get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
        const currentRowHeight = currentWorksheet?.getRowManager().getRowHeight(0);
        expect(currentRowHeight).toBe(100);
    });

    it('Worksheet setRowHeights', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.setRowHeights(0, 2, 100);
        expect(sheet).toBeDefined();

        const currentWorksheet = get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
        const currentRowHeight = currentWorksheet?.getRowManager().getRowHeight(0, 2);
        expect(currentRowHeight).toBe(200);
    });

    it('Worksheet setRowHeightsForced', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.setRowHeightsForced(0, 2, 100);
        expect(sheet).toBeDefined();

        const currentWorksheet = get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
        const currentRowHeight = currentWorksheet?.getRowManager().getRowHeight(0, 2);
        expect(currentRowHeight).toBe(200);
    });

    it('Worksheet setRowCustom', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.setRowCustom({
            0: {
                color: 'red',
            },
        });
        expect(sheet).toBeDefined();

        const currentWorksheet = get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
        const currentRowCustom = currentWorksheet?.getRowManager().getRow(0)?.custom;
        expect(currentRowCustom).toEqual({ color: 'red' });
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

        const currentWorksheet = get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
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

        const currentWorksheet = get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
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

        const currentWorksheet = get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
        const currentColWidth = currentWorksheet?.getColumnManager().getColumnWidth(0);
        expect(currentColWidth).toBe(100);
    });

    it('Worksheet setColWidths', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.setColumnWidths(0, 2, 100);
        expect(sheet).toBeDefined();

        const currentWorksheet = get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
        const currentColWidth = currentWorksheet?.getColumnManager().getColumnWidth(0);
        expect(currentColWidth).toBe(100);
        const currentColWidth2 = currentWorksheet?.getColumnManager().getColumnWidth(1);
        expect(currentColWidth2).toBe(100);
    });

    it('Worksheet setColumnCustom', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        const sheet = await activeSheet?.setColumnCustom({
            0: {
                color: 'red',
            },
        });
        expect(sheet).toBeDefined();

        const currentWorksheet = get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getActiveSheet();
        const currentColCustom = currentWorksheet?.getColumnManager().getColumn(0)?.custom;
        expect(currentColCustom).toEqual({ color: 'red' });
    });

    it('Worksheet custom APIs should warn about custom field usage', () => {
        const logService = get(ILogService);
        Object.defineProperty(logService, 'warn', { configurable: true, value: vi.fn() });
        const warnSpy = vi.spyOn(logService, 'warn');
        const activeSheet = univerAPI.getActiveWorkbook()?.getSheetByName('sheet1');

        activeSheet?.setRowCustom({ 0: { color: 'red' } });
        activeSheet?.setColumnCustom({ 0: { color: 'blue' } });
        activeSheet?.setCustomMetadata({ sheet: 'metadata' });
        activeSheet?.getCustomMetadata();
        activeSheet?.setRowCustomMetadata(1, { row: 'metadata' });
        activeSheet?.getRowCustomMetadata(1);
        activeSheet?.setColumnCustomMetadata(1, { column: 'metadata' });
        activeSheet?.getColumnCustomMetadata(1);

        expect(warnSpy).toHaveBeenCalledTimes(8);
        for (let index = 1; index <= 8; index++) {
            expect(warnSpy).toHaveBeenNthCalledWith(index, SHEETS_CUSTOM_FIELD_WARNING_MESSAGE);
        }

        warnSpy.mockRestore();
    });

    it('Worksheet appends rows and updates sheet dimensions through facade APIs', () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();

        const initialMaxRows = activeSheet.getMaxRows();
        const initialLastRow = activeSheet.getLastRow();
        activeSheet.appendRow(['North', 100, true]);
        expect(activeSheet.getRange(initialLastRow + 1, 0, 1, 3).getValues()).toEqual([['North', 100, 1]]);
        expect(activeSheet.getDataRange().getA1Notation()).toBe(`A1:C${initialLastRow + 2}`);
        expect(activeSheet.getMaxRows()).toBe(initialMaxRows);

        activeSheet.getRange(initialMaxRows - 1, 0).setValue('at capacity');
        activeSheet.appendRow(['expanded']);
        expect(activeSheet.getMaxRows()).toBe(initialMaxRows + 1);
        expect(activeSheet.getRange(initialMaxRows, 0).getValue()).toBe('expanded');

        activeSheet.setRowCount(120);
        activeSheet.setColumnCount(80);
        expect(activeSheet.getMaxRows()).toBe(120);
        expect(activeSheet.getMaxColumns()).toBe(80);
    });

    it('Worksheet exposes merge, active range, visibility, name, and equality state', () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const activeSheet = workbook.getActiveSheet();
        const sameSheet = workbook.getSheetByName(activeSheet.getSheetName())!;

        expect(activeSheet.equalTo(sameSheet)).toBe(true);
        activeSheet.getRange('J1:K2').merge();
        expect(activeSheet.getMergeData().map((range) => range.getA1Notation())).toContain('J1:K2');
        expect(activeSheet.getMergedRanges().map((range) => range.getA1Notation())).toContain('J1:K2');
        expect(activeSheet.getCellMergeData(0, 9)?.getA1Notation()).toBe('J1:K2');

        activeSheet.setActiveRange(activeSheet.getRange('C3:D4'));
        expect(activeSheet.getActiveRange()?.getA1Notation()).toBe('C3:D4');
        expect(activeSheet.getActiveCell()?.getA1Notation()).toBe('C3');

        expect(() => activeSheet.hideSheet()).toThrow('Cannot hide the only visible sheet');
        expect(() => activeSheet.setHiddenState(WorksheetHiddenState.VERY_HIDDEN)).toThrow('Cannot hide the only visible sheet');
        expect(activeSheet.isSheetHidden()).toBe(false);

        const workbookModel = get(IUniverInstanceService).getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        workbookModel.addWorksheet('sheet2', 1, { id: 'sheet2', name: 'Second' });
        expect(univerAPI.Enum.WorksheetHiddenState.VERY_HIDDEN).toBe(2);
        activeSheet.setHiddenState(univerAPI.Enum.WorksheetHiddenState.VERY_HIDDEN);
        expect(activeSheet.isSheetHidden()).toBe(true);
        expect(activeSheet.getHiddenState()).toBe(WorksheetHiddenState.VERY_HIDDEN);
        expect(workbookModel.getSheetBySheetId(activeSheet.getSheetId())!.getSnapshot()).toMatchObject({ hidden: 2 });
        activeSheet.hideSheet();
        expect(activeSheet.getHiddenState()).toBe(WorksheetHiddenState.VERY_HIDDEN);
        activeSheet.showSheet();
        expect(activeSheet.getHiddenState()).toBe(WorksheetHiddenState.VISIBLE);
        activeSheet.setHiddenState(WorksheetHiddenState.HIDDEN);
        expect(activeSheet.getHiddenState()).toBe(WorksheetHiddenState.HIDDEN);
        activeSheet.setHiddenState(WorksheetHiddenState.VISIBLE);
        expect(activeSheet.isSheetHidden()).toBe(false);

        activeSheet.setName('Renamed');
        expect(activeSheet.getSheetName()).toBe('Renamed');
        expect(activeSheet.getIndex()).toBe(0);
    });

    // #endregion

    it('Worksheet freeze', async () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();

        const freeze = activeSheet?.getFreeze();
        expect(freeze).toEqual({ startRow: -1, startColumn: -1, xSplit: 0, ySplit: 0 });

        activeSheet?.setFreeze({ startRow: 1, startColumn: 1, xSplit: 1, ySplit: 1 });
        const freeze2 = activeSheet?.getFreeze();
        expect(freeze2).toEqual({ startRow: 1, startColumn: 1, xSplit: 1, ySplit: 1 });

        activeSheet?.cancelFreeze();
        const freeze3 = activeSheet?.getFreeze();
        expect(freeze3).toEqual({ startRow: -1, startColumn: -1, xSplit: 0, ySplit: 0 });
    });

    it('Worksheet setFrozenColumns and getFrozenColumns', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();

        activeSheet?.setFrozenColumns(2);
        expect(activeSheet?.getFrozenColumns()).toBe(2);

        const freeze = activeSheet?.getFreeze();
        expect(freeze).toEqual({ startRow: -1, startColumn: 2, xSplit: 2, ySplit: 0 });

        activeSheet?.cancelFreeze();
        activeSheet?.setFrozenColumns(2, 3);
        expect(activeSheet?.getFreeze()).toEqual({ startRow: -1, startColumn: 4, xSplit: 2, ySplit: 0 });
        expect(activeSheet?.getFrozenColumnRange()).toEqual({ startColumn: 2, endColumn: 3 });
    });

    it('Worksheet setFrozenRows and getFrozenRows', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();

        activeSheet?.setFrozenRows(3);
        expect(activeSheet?.getFrozenRows()).toBe(3);

        const freeze = activeSheet?.getFreeze();
        expect(freeze).toEqual({ startRow: 3, startColumn: -1, xSplit: 0, ySplit: 3 });

        activeSheet?.cancelFreeze();
        activeSheet?.setFrozenRows(2, 3);
        expect(activeSheet?.getFreeze()).toEqual({ startRow: 4, startColumn: -1, xSplit: 0, ySplit: 2 });
        expect(activeSheet?.getFrozenRowRange()).toEqual({ startRow: 2, endRow: 3 });
    });

    it('Worksheet combined frozen rows and columns', () => {
        const activeSheet = univerAPI.getActiveWorkbook()?.getActiveSheet();

        activeSheet?.setFrozenColumns(2);
        activeSheet?.setFrozenRows(3);

        expect(activeSheet?.getFrozenColumns()).toBe(2);
        expect(activeSheet?.getFrozenRows()).toBe(3);

        const freeze = activeSheet?.getFreeze();
        expect(freeze).toEqual({ startRow: 3, startColumn: 2, xSplit: 2, ySplit: 3 });

        activeSheet?.setFreeze({ startRow: 21, startColumn: 9, ySplit: 16, xSplit: 4 });
        expect(activeSheet?.getFrozenRows()).toBe(21);
        expect(activeSheet?.getFrozenColumns()).toBe(9);
    });
});

describe('Chart Sheet grid editing entry boundaries', () => {
    function createBed() {
        const univer = new Univer({ locale: LocaleType.EN_US, locales: { enUS } });
        univer.registerPlugin(UniverSheetsPlugin);
        const injector = univer.__getInjector();
        const bed = { univer, injector, get: injector.get.bind(injector), univerAPI: FUniver.newAPI(injector) };
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
            id: 'test',
            appVersion: '3.0.0-alpha',
            locale: LocaleType.EN_US,
            name: 'Chart Sheet guards',
            sheetOrder: ['grid', 'chart', 'other-grid'],
            styles: {},
            sheets: {
                grid: { id: 'grid', name: 'Grid', rowCount: 10, columnCount: 10, cellData: { 0: { 0: { v: 'source' } } } },
                chart: { id: 'chart', name: 'Chart', type: SheetTypes.CHART, rowCount: 10, columnCount: 10, cellData: {} },
                'other-grid': { id: 'other-grid', name: 'Other grid', rowCount: 10, columnCount: 10, cellData: {} },
            },
        });
        onTestFinished(() => bed.univer.dispose());
        const commands = bed.get(ICommandService);
        const workbook = bed.get(IUniverInstanceService).getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)!;
        workbook.setActiveSheet(workbook.getSheetBySheetId('grid')!);
        bed.get(IUniverInstanceService).focusUnit('test');
        const facade = bed.univerAPI.getActiveWorkbook()!;
        const chart = facade.getSheetBySheetId('chart')!;
        return { ...bed, commands, workbook, facade, chart };
    }

    it('keeps Chart Sheet enumeration and legal range reads stable while refusing explicit value, formula and style writes', () => {
        const { chart, facade, workbook, commands, get } = createBed();
        const before = Tools.deepClone(workbook.getSheetBySheetId('chart')!.getSnapshot());
        const mutations: string[] = [];
        const subscription = commands.onCommandExecuted((command) => {
            if (command.type === CommandType.MUTATION) mutations.push(command.id);
        });
        onTestFinished(() => subscription.dispose());
        expect(facade.getSheets().map((sheet) => sheet.getSheetId())).toContain('chart');
        expect(chart.getRange('A1:B2').getValues()).toEqual([[null, null], [null, null]]);
        expect(chart.getRange('A1').setValue('blocked')).toBeDefined();
        chart.getRange('A1').setValue('=SUM(A2:A3)');
        chart.getRange('A1').setFontWeight('bold');
        chart.getRange('A1').setCustomMetaData({ note: 'blocked' });
        expect(workbook.getSheetBySheetId('chart')!.getSnapshot()).toEqual(before);
        expect(mutations).toEqual([]);
        expect(get(IUndoRedoService).getUndoRedoStatus('test').undos).toBe(0);
    });

    it('rejects direct facade default-style and automatic-row-height mutation producers before any model change', () => {
        const { chart, workbook, commands } = createBed();
        const before = Tools.deepClone(workbook.getSheetBySheetId('chart')!.getSnapshot());
        const mutations: string[] = [];
        const subscription = commands.onCommandExecuted((command) => {
            if (command.type === CommandType.MUTATION) mutations.push(command.id);
        });
        onTestFinished(() => subscription.dispose());
        expect(chart.setDefaultStyle({ fs: 18 })).toBe(chart);
        expect(chart.autoFitRow(0, BooleanNumber.TRUE)).toBe(chart);
        expect(workbook.getSheetBySheetId('chart')!.getSnapshot()).toEqual(before);
        expect(mutations).toEqual([]);
    });

    it.each([
        ['range reorder', ReorderRangeCommand, { range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 }, order: { 0: 1, 1: 0 } }],
        ['worksheet default style', SetWorksheetDefaultStyleCommand, { defaultStyle: { fs: 18 } }],
        ['split text into columns', SplitTextToColumnsCommand, { range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 } }],
        ['text conversion', TextToNumberCommand, { ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }] }],
        ['insert row', InsertRowCommand, { range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 9 }, direction: Direction.UP }],
        ['insert column', InsertColByRangeCommand, { range: { startRow: 0, endRow: 9, startColumn: 0, endColumn: 0 }, direction: Direction.LEFT }],
        ['remove row', RemoveRowByRangeCommand, { range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 9 } }],
        ['remove column', RemoveColByRangeCommand, { range: { startRow: 0, endRow: 9, startColumn: 0, endColumn: 0 } }],
        ['move row', MoveRowsCommand, { range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 9, rangeType: RANGE_TYPE.ROW }, fromRange: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 9 }, toRange: { startRow: 2, endRow: 2, startColumn: 0, endColumn: 9 } }],
        ['move column', MoveColsCommand, { range: { startRow: 0, endRow: 9, startColumn: 0, endColumn: 0, rangeType: RANGE_TYPE.COLUMN }, fromRange: { startRow: 0, endRow: 9, startColumn: 0, endColumn: 0 }, toRange: { startRow: 0, endRow: 9, startColumn: 2, endColumn: 2 } }],
        ['append row', AppendRowCommand, { cellValue: { 0: { 0: { v: 'blocked' } } } }],
        ['row data and size', SetRowDataCommand, { rowData: { 0: { s: { fs: 18 } } } }],
        ['column data and size', SetColDataCommand, { columnData: { 0: { s: { fs: 18 } } } }],
        ['row height', SetRowHeightCommand, { ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }], value: 42 }],
        ['column width', SetColWidthCommand, { ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }], value: 42 }],
        ['row visibility', SetRowHiddenCommand, { ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }] }],
        ['column visibility', SetColHiddenCommand, { ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }] }],
        ['row count', SetWorksheetRowCountCommand, { rowCount: 20 }],
        ['column count', SetWorksheetColumnCountCommand, { columnCount: 20 }],
        ['frozen pane', SetFrozenCommand, { startRow: 0, startColumn: 0, xSplit: 1, ySplit: 1 }],
        ['gridlines', ToggleGridlinesCommand, {}],
        ['range theme', SetWorksheetRangeThemeStyleCommand, { range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }, themeName: 'blocked' }],
        ['merge', AddWorksheetMergeCommand, { selections: [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }] }],
        ['unmerge', RemoveWorksheetMergeCommand, { ranges: [{ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 }] }],
        ['clear', ClearSelectionContentCommand, { ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }] }],
        ['autofill', AutoFillCommand, { sourceRange: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }, targetRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 } }],
    ])('refuses %s on an explicit Chart Sheet before mutation or undo notifications', async (_name, command, params) => {
        const { commands, workbook, get } = createBed();
        const before = Tools.deepClone(workbook.getSheetBySheetId('chart')!.getSnapshot());
        const mutations: string[] = [];
        const subscription = commands.onCommandExecuted((event) => {
            if (event.type === CommandType.MUTATION) mutations.push(event.id);
        });
        onTestFinished(() => subscription.dispose());
        const collaborationMutations: string[] = [];
        const collaboration = commands.onMutationExecutedForCollab((event) => collaborationMutations.push(event.id));
        onTestFinished(() => collaboration.dispose());
        expect(await commands.executeCommand(command.id, { ...params, unitId: 'test', subUnitId: 'chart' })).toBe(false);
        expect(collaborationMutations).toEqual([]);
        expect(workbook.getSheetBySheetId('chart')!.getSnapshot()).toEqual(before);
        expect(mutations).toEqual([]);
        expect(get(IUndoRedoService).getUndoRedoStatus('test').undos).toBe(0);
    });

    it('refuses implicit active Chart Sheet command targets while the generic target and active-sheet Facade remain available', () => {
        const { commands, workbook, facade } = createBed();
        workbook.setActiveSheet(workbook.getSheetBySheetId('chart')!);
        expect(facade.getActiveSheet().getSheetId()).toBe('chart');
        expect(commands.syncExecuteCommand(SetRangeValuesCommand.id, {
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            value: 'blocked',
        })).toBe(false);
        expect(commands.syncExecuteCommand(SetStyleCommand.id, { style: { type: 'fs', value: 18 } })).toBe(false);
        expect(workbook.getActiveSheet()!.getCell(0, 0)).toBeUndefined();
    });

    it.each(['chart-source', 'chart-destination'])('rejects cross-sheet grid moves with %s before source or destination changes', async (direction) => {
        const { commands, workbook, get } = createBed();
        const before = Tools.deepClone(workbook.getSnapshot());
        expect(await commands.executeCommand(MoveRangeCommand.id, {
            fromUnitId: 'test',
            toUnitId: 'test',
            fromSubUnitId: direction === 'chart-source' ? 'chart' : 'grid',
            toSubUnitId: direction === 'chart-source' ? 'grid' : 'chart',
            fromRange: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            toRange: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
        })).toBe(false);
        expect(workbook.getSnapshot()).toEqual(before);
        expect(get(IUndoRedoService).getUndoRedoStatus('test').undos).toBe(0);
    });

    it('keeps omitted-type GRID commands, canonical mutations and undo/redo working', async () => {
        const { commands, facade, workbook } = createBed();
        const grid = facade.getSheetBySheetId('grid')!;
        grid.getRange('A1').setValue('new');
        expect(grid.getRange('A1').getValue()).toBe('new');
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(grid.getRange('A1').getValue()).toBe('source');
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(grid.getRange('A1').getValue()).toBe('new');
        expect(commands.syncExecuteCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'grid',
            cellValue: { 0: { 0: { v: 'historical replay' } } },
        })).toBe(true);
        expect(workbook.getSheetBySheetId('grid')!.getCell(0, 0)?.v).toBe('historical replay');
    });

    it('allows Chart Sheet name, tab color, visibility and order metadata actions', async () => {
        const { chart, commands, workbook } = createBed();
        chart.setName('Renamed chart').setTabColor('#ff0000').hideSheet().showSheet();
        expect(await commands.executeCommand(SetWorksheetOrderCommand.id, { unitId: 'test', subUnitId: 'chart', order: 0 })).toBe(true);
        const config = workbook.getSheetBySheetId('chart')!.getConfig();
        expect(config.name).toBe('Renamed chart');
        expect(config.tabColor).toBe('#ff0000');
        expect(config.hidden).toBe(WorksheetHiddenState.VISIBLE);
        expect(workbook.getSheetIndex(workbook.getSheetBySheetId('chart')!)).toBe(0);
    });

    it.each([
        ['insert rows', Dimension.ROWS, true],
        ['insert columns', Dimension.COLUMNS, true],
        ['delete rows', Dimension.ROWS, false],
        ['delete columns', Dimension.COLUMNS, false],
    ])('keeps explicit Chart Sheet %s from redirecting edits to the active GRID', async (_name, dimension, insert) => {
        const { chart, commands, workbook, get } = createBed();
        const before = Tools.deepClone(workbook.getSnapshot());
        const command = insert
            ? (dimension === Dimension.ROWS ? InsertRangeMoveDownCommand : InsertRangeMoveRightCommand)
            : (dimension === Dimension.ROWS ? DeleteRangeMoveUpCommand : DeleteRangeMoveLeftCommand);
        const completed = new Promise<void>((complete) => {
            const subscription = commands.onCommandExecuted((event) => {
                if (event.id === command.id) {
                    complete();
                }
            });
            onTestFinished(() => subscription.dispose());
        });
        const range = chart.getRange('A1');
        if (insert) {
            range.insertCells(dimension);
        } else {
            range.deleteCells(dimension);
        }
        await completed;
        expect(workbook.getSnapshot()).toEqual(before);
        expect(get(IUndoRedoService).getUndoRedoStatus('test').undos).toBe(0);
    });

    it('routes new Facade range inserts to the explicit nonactive GRID and retains undo/redo ownership', async () => {
        const { facade, commands, workbook } = createBed();
        const other = facade.getSheetBySheetId('other-grid')!;
        other.getRange('A1').setValue('other source');
        let emittedTarget: object | undefined;
        const completed = new Promise<void>((complete) => {
            const subscription = commands.onCommandExecuted((event) => {
                if (event.id === InsertRangeMoveDownCommand.id) {
                    emittedTarget = event.params;
                    complete();
                }
            });
            onTestFinished(() => subscription.dispose());
        });
        other.getRange('A1').insertCells(Dimension.ROWS);
        await completed;
        expect(emittedTarget).toMatchObject({ unitId: 'test', subUnitId: 'other-grid' });
        expect(other.getRange('A2').getValue()).toBe('other source');
        expect(workbook.getSheetBySheetId('grid')!.getCell(0, 0)?.v).toBe('source');
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(other.getRange('A1').getValue()).toBe('other source');
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(other.getRange('A2').getValue()).toBe('other source');
    });

    it('replays historical range commands with omitted targets on active GRID and retains their undo/redo', async () => {
        const { commands, facade } = createBed();
        const grid = facade.getSheetBySheetId('grid')!;
        expect(await commands.executeCommand(InsertRangeMoveDownCommand.id, {
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
        })).toBe(true);
        expect(grid.getRange('A2').getValue()).toBe('source');
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(grid.getRange('A1').getValue()).toBe('source');
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(grid.getRange('A2').getValue()).toBe('source');
    });

    it('checks the saved Refill target when a different GRID is active and leaves filling state unchanged on rejection', async () => {
        const { commands, get, workbook } = createBed();
        const service = get(IAutoFillService);
        service.autoFillLocation = {
            unitId: 'test',
            subUnitId: 'chart',
            source: { rows: [0], cols: [0] },
            target: { rows: [1], cols: [0] },
        };
        const before = Tools.deepClone(workbook.getSnapshot());
        const applyType = service.applyType;
        expect(await commands.executeCommand(RefillCommand.id, { type: AUTO_FILL_APPLY_TYPE.NO_FORMAT })).toBe(false);
        expect(service.applyType).toBe(applyType);
        expect(workbook.getSnapshot()).toEqual(before);
    });

    it('rechecks the actual implicit move target after an asynchronous interceptor changes the active sheet', async () => {
        const { commands, workbook, get } = createBed();
        let resume: ((value: boolean) => void) | undefined;
        const registration = get(SheetInterceptorService).interceptBeforeCommand({
            performCheck: (info) => info.id === MoveRangeCommand.id
                ? new Promise<boolean>((complete) => { resume = complete; })
                : Promise.resolve(true),
        });
        onTestFinished(() => registration.dispose());
        const result = commands.executeCommand(MoveRangeCommand.id, {
            fromRange: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            toRange: { startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 },
        });
        expect(resume).toBeDefined();
        workbook.setActiveSheet(workbook.getSheetBySheetId('chart')!);
        const before = Tools.deepClone(workbook.getSnapshot());
        resume!(true);
        expect(await result).toBe(false);
        expect(workbook.getSnapshot()).toEqual(before);
        expect(get(IUndoRedoService).getUndoRedoStatus('test').undos).toBe(0);
    });

    it('rejects a Chart Sheet border edit before changing the shared border settings', () => {
        const { commands, get } = createBed();
        const manager = get(BorderStyleManagerService);
        const before = { ...manager.getBorderInfo() };
        expect(commands.syncExecuteCommand(SetBorderBasicCommand.id, {
            unitId: 'test',
            subUnitId: 'chart',
            ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }],
            value: { type: BorderType.TOP, color: '#ff0000', style: BorderStyleTypes.DOUBLE, activeBorderType: true },
        })).toBe(false);
        expect(manager.getBorderInfo()).toEqual(before);
    });

    it.each([
        ['position', SetBorderPositionCommand, { value: BorderType.TOP }],
        ['style', SetBorderStyleCommand, { value: BorderStyleTypes.DOUBLE }],
        ['color', SetBorderColorCommand, { value: '#ff0000' }],
    ])('rejects the implicit Chart Sheet border %s entry before changing shared settings', (_name, command, params) => {
        const { commands, get, workbook } = createBed();
        workbook.setActiveSheet(workbook.getSheetBySheetId('chart')!);
        const manager = get(BorderStyleManagerService);
        const settings = { ...manager.getBorderInfo() };
        const snapshot = Tools.deepClone(workbook.getSnapshot());
        expect(commands.syncExecuteCommand(command.id, params)).toBe(false);
        expect(manager.getBorderInfo()).toEqual(settings);
        expect(workbook.getSnapshot()).toEqual(snapshot);
        expect(get(IUndoRedoService).getUndoRedoStatus('test').undos).toBe(0);
    });

    it('retains historic mutation replay but refuses a new rich-text checkbox write to the Chart Sheet', () => {
        const { commands, workbook, get } = createBed();
        expect(commands.syncExecuteCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'chart',
            cellValue: { 0: { 0: { p: {
                id: 'historical-checklist',
                documentStyle: {},
                body: {
                    dataStream: 'Alpha\rBeta\r\n',
                    paragraphs: [
                        { startIndex: 5, paragraphId: 'first' },
                        { startIndex: 10, paragraphId: 'second', bullet: {
                            listId: 'checklist',
                            listType: PresetListType.CHECK_LIST,
                            nestingLevel: 0,
                        } },
                    ],
                },
            } } } },
        })).toBe(true);
        const before = Tools.deepClone(workbook.getSheetBySheetId('chart')!.getSnapshot());
        expect(commands.syncExecuteCommand(ToggleCellCheckboxCommand.id, {
            unitId: 'test',
            subUnitId: 'chart',
            row: 0,
            col: 0,
            paragraphIndex: 10,
        })).toBe(false);
        expect(workbook.getSheetBySheetId('chart')!.getSnapshot()).toEqual(before);
        expect(get(IUndoRedoService).getUndoRedoStatus('test').undos).toBe(0);
    });
});
