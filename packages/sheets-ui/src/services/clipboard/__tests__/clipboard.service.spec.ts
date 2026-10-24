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

import type { ICellData, IRange, IStyleData, Nullable, Univer, Workbook } from '@univerjs/core';
import type { IClipboardInterfaceService } from '@univerjs/ui';
import {
    BooleanNumber,
    CommandType,
    CustomCommandExecutionError,
    extractPureTextFromCell,
    FormulaType,
    ICommandService,
    Injector,
    IPermissionService,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
    RANGE_TYPE,
    Rectangle,
    RedoCommand,
    SheetTypes,
    Tools,
    UndoCommand,
    UniverInstanceType,
    WrapStrategy,
} from '@univerjs/core';
import {
    AddWorksheetMergeMutation,
    discreteRangeToRange,
    MergeCellController,
    MoveRangeCommand,
    MoveRangeMutation,
    RefRangeService,
    RemoveWorksheetMergeMutation,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetActiveOperation,
    SetWorksheetColWidthMutation,
    SetWorksheetNameMutation,
    SetWorksheetRowAutoHeightMutation,
    SetWorksheetRowHeightMutation,
    SheetInterceptorService,
    SheetsSelectionsService,
    WorkbookCopyPermission,
    WorkbookEditablePermission,
    WorksheetCopyPermission,
    WorksheetEditPermission,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import type { IClipboardItem } from './mock-clipboard';
import { SheetCopyCommand } from '../../../commands/commands/clipboard.command';
import {
    SheetPermissionInterceptorClipboardController,
} from '../../../controllers/permission/sheet-permission-interceptor-clipboard.controller';
import { SheetSkeletonManagerService } from '../../sheet-skeleton-manager.service';
import { ISheetClipboardService, PREDEFINED_HOOK_NAME_COPY, PREDEFINED_HOOK_NAME_PASTE } from '../clipboard.service';
import { COPY_TYPE } from '../type';
import { clipboardTestBed } from './clipboard-test-bed';
import { MockClipboard } from './mock-clipboard';

const EXPECTED_EXTERNAL_PASTE_STYLE = {
    bg: {
        rgb: 'rgb(255,0,0)',
    },
    ff: 'Arial',
    fs: 10,
    ht: 2,
    vt: 2,
};

describe('Test clipboard', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let sheetClipboardService: ISheetClipboardService;
    let clipboardItem: IClipboardItem;
    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number,
        subUnitId?: string
    ) => Array<Array<Nullable<ICellData>>> | undefined;
    let getMergedCells: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number,
        subUnitId?: string
    ) => IRange[] | undefined;

    let getStyles: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<IStyleData>>> | undefined;

    beforeEach(async () => {
        const testBed = clipboardTestBed(undefined, [
            [SheetPermissionInterceptorClipboardController],
            [MergeCellController],
            [RefRangeService],
        ]);
        univer = testBed.univer;
        get = testBed.get;
        testBed.sheet.addWorksheet('sheet2', 1, {
            id: 'sheet2',
            name: 'sheet2',
            cellData: {},
            mergeData: [],
        });
        get(MergeCellController);

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetWorksheetRowHeightMutation);
        commandService.registerCommand(SetWorksheetColWidthMutation);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
        commandService.registerCommand(SetSelectionsOperation);
        commandService.registerCommand(MoveRangeMutation);
        commandService.registerCommand(SetWorksheetRowAutoHeightMutation);
        commandService.registerCommand(SetWorksheetActiveOperation);

        sheetClipboardService = get(ISheetClipboardService);

        getValues = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number,
            subUnitId = 'sheet1'
        ): Array<Array<Nullable<ICellData>>> | undefined =>
            get(IUniverInstanceService)
                .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)
                ?.getSheetBySheetId(subUnitId)
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValues();

        getMergedCells = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number,
            subUnitId = 'sheet1'
        ): IRange[] | undefined => {
            return get(IUniverInstanceService)
                .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)
                ?.getSheetBySheetId(subUnitId)
                ?.getMergeData()
                .filter((rect) => Rectangle.intersects({ startRow, startColumn, endRow, endColumn }, rect));
        };

        getStyles = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Array<Array<Nullable<IStyleData>>> | undefined => {
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = get(IUniverInstanceService).getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)?.getStyles();
            if (values && styles) {
                return values.map((row) => row.map((cell) => styles.getStyleByCell(cell)));
            }
        };
        // read use mock
        const clipboardData = {
            'text/html': '<google-sheets-html-origin><table xmlns="http://www.w3.org/1999/xhtml" cellspacing="0" cellpadding="0" dir="ltr" border="1" style="table-layout:fixed;font-size:10pt;font-family:Arial;width:0px;border-collapse:collapse;border:none"><colgroup><col width="73"><col width="73"></colgroup><tbody><tr style="height: 81px;"><td rowspan="1" colspan="2" style="background: rgb(255,0,0); text-align: center; vertical-align: middle; text-decoration:none;">row1col2</td></tr></tbody></table></google-sheets-html-origin>',
        };
        const mockClipboard = new MockClipboard(clipboardData);
        const clipboardItems = await mockClipboard.read();

        if (clipboardItems.length !== 0) {
            clipboardItem = clipboardItems[0];
        }
    });

    afterEach(() => {
        univer?.dispose();
    });

    it('clears formula metadata on plain-text paste and restores it on undo', async () => {
        const previous = { f: '=A1', ft: FormulaType.ARRAY, fd: BooleanNumber.FALSE };
        commandService.syncExecuteCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: { 0: { 0: previous } },
        });
        get(SheetsSelectionsService).setSelections('test', 'sheet1', [{
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            primary: null,
            style: null,
        }]);
        expect(await sheetClipboardService.paste({
            presentationStyle: 'unspecified',
            types: ['text/plain'],
            getType: async () => new Blob(['=SUM(B1:B2)'], { type: 'text/plain' }),
        })).toBe(true);
        const assertReplaced = () => {
            const cell = getValues(0, 0, 0, 0)?.[0][0];
            expect(cell?.f).toBe('=SUM(B1:B2)');
            expect(cell?.ft).toBeUndefined();
            expect(cell?.fd).toBeUndefined();
        };
        assertReplaced();
        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getValues(0, 0, 0, 0)?.[0][0]).toMatchObject(previous);
        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        assertReplaced();
    });

    it('keeps the original selection while clipboard data is read asynchronously', async () => {
        const clipboardService = get(ISheetClipboardService);
        const selections = get(SheetsSelectionsService);
        const selectColumn = (column: number) => selections.setSelections('test', 'sheet1', [{
            range: { startRow: 0, endRow: 0, startColumn: column, endColumn: column },
            primary: null,
            style: null,
        }]);
        selectColumn(0);
        const originalSource = getValues(0, 0, 0, 0);
        const originalPeer = getValues(0, 1, 0, 1);
        let releaseRead = () => {};
        const readGate = new Promise<void>((resolve) => {
            releaseRead = resolve;
        });
        const item: IClipboardItem = {
            presentationStyle: 'unspecified',
            types: ['text/plain'],
            getType: async () => {
                await readGate;
                return new Blob(['DEFERRED_PASTE'], { type: 'text/plain' });
            },
        };
        const pendingPaste = clipboardService.paste(item);
        selectColumn(1);
        releaseRead();
        expect(await pendingPaste).toBe(true);
        expect(getValues(0, 0, 0, 0)?.[0][0]?.v).toBe('DEFERRED_PASTE');
        expect(getValues(0, 1, 0, 1)).toEqual(originalPeer);
        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(getValues(0, 0, 0, 0)).toEqual(originalSource);
        expect(getValues(0, 1, 0, 1)).toEqual(originalPeer);
    });

    it('recalculates auto height when pasting into a row that already has a measured auto height', async () => {
        const row = 30;
        const worksheet = get(IUniverInstanceService)
            .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)!
            .getSheetBySheetId('sheet1')!;
        worksheet.getRowManager().getRowOrCreate(row).ah = 24;
        const skeleton = get(SheetSkeletonManagerService).ensureSkeleton('sheet1')!;
        vi.spyOn(skeleton, 'calculateAutoHeightInRange').mockReturnValue([{ row, autoHeight: 34 }]);
        const copyId = 'existing-auto-height';
        sheetClipboardService.copyContentCache().set(copyId, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { rows: [0], cols: [0] },
            matrix: new ObjectMatrix({ 0: { 0: { v: 'line 1\nline 2' } } }),
            copyType: COPY_TYPE.COPY,
        });

        expect(await sheetClipboardService.pasteByCopyId(copyId, PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: row, endRow: row, startColumn: 0, endColumn: 0 },
        })).toBe(true);
        expect(worksheet.getRowManager().getRow(row)?.ah).toBe(34);
        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(worksheet.getRowManager().getRow(row)?.ah).toBe(24);
        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(worksheet.getRowManager().getRow(row)?.ah).toBe(34);
    });

    it.each([
        { name: 'explicit', row: 31, isLegacy: false },
        { name: 'legacy', row: 32, isLegacy: true },
    ])('preserves a $name manually sized row when pasting', async ({ row, isLegacy }) => {
        const worksheet = get(IUniverInstanceService)
            .getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)!
            .getSheetBySheetId('sheet1')!;
        const rowData = worksheet.getRowManager().getRowOrCreate(row);
        rowData.h = 40;
        if (!isLegacy) {
            rowData.ia = BooleanNumber.FALSE;
        }
        const skeleton = get(SheetSkeletonManagerService).ensureSkeleton('sheet1')!;
        const calculateAutoHeight = vi.spyOn(skeleton, 'calculateAutoHeightInRange');
        const copyId = 'manual-row-height';
        sheetClipboardService.copyContentCache().set(copyId, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { rows: [0], cols: [0] },
            matrix: new ObjectMatrix({ 0: { 0: { v: 'line 1\nline 2' } } }),
            copyType: COPY_TYPE.COPY,
        });

        expect(await sheetClipboardService.pasteByCopyId(copyId, PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE, {
            unitId: 'test',
            subUnitId: 'sheet1',
            range: { startRow: row, endRow: row, startColumn: 0, endColumn: 0 },
        })).toBe(true);
        expect(calculateAutoHeight).not.toHaveBeenCalled();
        expect(worksheet.getRowHeight(row)).toBe(40);
    });

    it.each(['disposed', 'read-only'] as const)('does not redirect a delayed paste when its source becomes %s', async (state) => {
        const clipboardService = get(ISheetClipboardService);
        get(SheetPermissionInterceptorClipboardController);
        const instances = get(IUniverInstanceService);
        const source = instances.getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)!;
        const snapshot = Tools.deepClone(source.getSnapshot());
        const peer = instances.createUnit(UniverInstanceType.UNIVER_SHEET, { ...snapshot, id: 'paste-peer' }, { makeCurrent: false });
        const peerBefore = Tools.deepClone(peer.getSnapshot());
        const selections = get(SheetsSelectionsService);
        const selection = [{
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            primary: null,
            style: null,
        }];
        selections.setSelections('test', 'sheet1', selection);
        let releaseRead = () => {};
        const readGate = new Promise<void>((resolve) => {
            releaseRead = resolve;
        });
        const pendingPaste = clipboardService.paste({
            presentationStyle: 'unspecified',
            types: ['text/plain'],
            getType: async () => {
                await readGate;
                return new Blob(['MUST_NOT_WRITE'], { type: 'text/plain' });
            },
        });
        if (state === 'disposed') {
            instances.disposeUnit('test');
        } else {
            const permissions = get(IPermissionService);
            const point = new WorkbookEditablePermission('test');
            if (!permissions.getPermissionPoint(point.id)) {
                permissions.addPermissionPoint(point);
            }
            permissions.updatePermissionPoint(point.id, false);
        }
        instances.setCurrentUnitForType('paste-peer');
        selections.setSelections('paste-peer', 'sheet1', selection);
        releaseRead();
        if (state === 'read-only') {
            await expect(pendingPaste).rejects.toThrow(CustomCommandExecutionError);
        } else {
            expect(await pendingPaste).toBe(false);
        }
        expect(peer.getSnapshot()).toEqual(peerBefore);
        if (state === 'read-only') {
            expect(source.getSnapshot()).toEqual(snapshot);
        }
    });

    describe('Test paste, the original data is a merged cell of 1 row and 2 columns, the current selection consists only of ordinary cells', () => {
        it('The current selection is a single cell in 1 row and 1 column', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to A1
            const startRow = 0;
            const startColumn = 0;
            const endRow = 0;
            const endColumn = 0;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);
            const columnManager = get(IUniverInstanceService).getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)?.getSheetBySheetId('sheet1')?.getColumnManager();
            const columnWidth = columnManager?.getColumnWidth(0);
            expect(columnWidth).toBe(88);
            expect(values && values[0][0]?.v).toBe('row1col2');
            expect(styles && styles[0][0]).toStrictEqual(EXPECTED_EXTERNAL_PASTE_STYLE);
            expect(mergedCells && mergedCells[0]).toStrictEqual({
                startRow: 0,
                startColumn: 0,
                endRow: 0,
                endColumn: 1,
            });
        });
        it('The current selection is a single cell in 1 row and 2 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to A2:B2
            const startRow = 1;
            const startColumn = 0;
            const endRow = 1;
            const endColumn = 1;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);
            expect(values && values[0][0]?.v).toBe('row1col2');
            expect(styles && styles[0][0]).toStrictEqual(EXPECTED_EXTERNAL_PASTE_STYLE);
            expect(mergedCells && mergedCells[0]).toStrictEqual({
                startRow,
                startColumn,
                endRow,
                endColumn,
            });
        });
        it('The current selection is a single cell in 1 row and 3 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to A3:C3
            const startRow = 2;
            const startColumn = 0;
            const endRow = 2;
            const endColumn = 2;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);
            expect(values && values[0][0]?.v).toBe('row1col2');
            expect(styles && styles[0][0]).toStrictEqual(EXPECTED_EXTERNAL_PASTE_STYLE);
            expect(values && values[0][2]?.v).toBe(undefined);
            expect(styles && styles[0][2]).toStrictEqual(undefined);
            expect(mergedCells && mergedCells[0]).toStrictEqual({
                startRow: 2,
                startColumn: 0,
                endRow: 2,
                endColumn: 1,
            });
        });
        it('The current selection is a single cell in 2 rows and 2 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to A4:B5
            const startRow = 3;
            const startColumn = 0;
            const endRow = 4;
            const endColumn = 1;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);
            expect(values && values[0][0]?.v).toBe('row1col2');
            expect(values && values[1][0]?.v).toBe('row1col2');

            expect(styles && styles[0][0]).toStrictEqual(EXPECTED_EXTERNAL_PASTE_STYLE);
            expect(styles && styles[1][0]).toStrictEqual(EXPECTED_EXTERNAL_PASTE_STYLE);
            expect(mergedCells).toStrictEqual([
                {
                    startRow: 3,
                    startColumn: 0,
                    endRow: 3,
                    endColumn: 1,
                },
                {
                    startRow: 4,
                    startColumn: 0,
                    endRow: 4,
                    endColumn: 1,
                },
            ]);
        });
        it('The current selection is a single cell in 4 rows and 4 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to A6:D9
            const startRow = 5;
            const startColumn = 0;
            const endRow = 8;
            const endColumn = 3;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            for (let i = 0; i < 4; i++) {
                expect(values && values[i][0]?.v).toBe('row1col2');
                expect(values && values[i][2]?.v).toBe('row1col2');
                expect(styles && styles[i][0]).toStrictEqual(EXPECTED_EXTERNAL_PASTE_STYLE);
                expect(styles && styles[i][2]).toStrictEqual(EXPECTED_EXTERNAL_PASTE_STYLE);
            }
            expect(mergedCells).toStrictEqual([
                {
                    startRow: 5,
                    startColumn: 0,
                    endRow: 5,
                    endColumn: 1,
                },
                {
                    startRow: 5,
                    startColumn: 2,
                    endRow: 5,
                    endColumn: 3,
                },
                {
                    startRow: 6,
                    startColumn: 0,
                    endRow: 6,
                    endColumn: 1,
                },
                {
                    startRow: 6,
                    startColumn: 2,
                    endRow: 6,
                    endColumn: 3,
                },
                {
                    startRow: 7,
                    startColumn: 0,
                    endRow: 7,
                    endColumn: 1,
                },
                {
                    startRow: 7,
                    startColumn: 2,
                    endRow: 7,
                    endColumn: 3,
                },
                {
                    startRow: 8,
                    startColumn: 0,
                    endRow: 8,
                    endColumn: 1,
                },
                {
                    startRow: 8,
                    startColumn: 2,
                    endRow: 8,
                    endColumn: 3,
                },
            ]);
        });
    });

    describe('Test paste, the original data is a merged cell of 1 row and 2 columns, the current selection contains merged cells and no content', () => {
        it('The current selection is a merged cell of 1 row and 2 columns.', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to F1:G2
            const startRow = 0;
            const startColumn = 5;
            const endRow = 0;
            const endColumn = 6;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            expect(values && values[0][0]?.v).toBe('row1col2');
            expect(styles && styles[0][0]).toStrictEqual(EXPECTED_EXTERNAL_PASTE_STYLE);
            expect(mergedCells && mergedCells[0]).toStrictEqual({
                startRow,
                startColumn,
                endRow,
                endColumn,
            });
        });

        it('The current selection is a merged cell of 1 row and 3 columns.', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to F3:H3
            const startRow = 2;
            const startColumn = 5;
            const endRow = 2;
            const endColumn = 7;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            const res = await sheetClipboardService.paste(clipboardItem);
            expect(res).toBeFalsy();
        });

        it('The current selection is a merged cell of 1 row and 4 columns.', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to F5:I5
            const startRow = 4;
            const startColumn = 5;
            const endRow = 4;
            const endColumn = 8;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            const res = await sheetClipboardService.paste(clipboardItem);
            expect(res).toBeFalsy();
        });

        it('The current selection is a merged cell of 2 rows and 2 columns.', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to F7:G8
            const startRow = 6;
            const startColumn = 5;
            const endRow = 7;
            const endColumn = 6;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            const res = await sheetClipboardService.paste(clipboardItem);
            expect(res).toBeFalsy();
        });

        it('The current selection is a merged cell of 1 row and 2 columns, with 1 ordinary cell', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to F10:H10
            const startRow = 9;
            const startColumn = 5;
            const endRow = 9;
            const endColumn = 7;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            expect(values && values[0][0]?.v).toBe('row1col2');
            expect(styles && styles[0][0]).toStrictEqual(EXPECTED_EXTERNAL_PASTE_STYLE);
            expect(mergedCells && mergedCells[0]).toStrictEqual({
                startRow: 9,
                startColumn: 5,
                endRow: 9,
                endColumn: 6,
            });
        });

        it('The current selection is a merged cell of 2 rows and 2 columns, with a merged cell of 2 rows and 1 column', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to F12:H13
            const startRow = 11;
            const startColumn = 5;
            const endRow = 12;
            const endColumn = 7;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            const res = await sheetClipboardService.paste(clipboardItem);
            expect(res).toBeFalsy();
        });
    });

    describe('Test paste, the original data is a merged cell of 1 row and 2 columns, the current selection contains merged cells with content and style', () => {
        it('The current selection is a merged cell of 1 row and 3 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to K4:M4
            const startRow = 3;
            const startColumn = 10;
            const endRow = 3;
            const endColumn = 12;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            const res = await sheetClipboardService.paste(clipboardItem);
            expect(res).toBeFalsy();
        });
        it('The current selection is a merged cell of 1 row and 2 columns, with a merged cell of 2 rows and 2 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to K7:M10
            const startRow = 6;
            const startColumn = 10;
            const endRow = 9;
            const endColumn = 12;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);

            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            // first merged cells changed
            expect(values && values[0][0]?.v).toBe('row1col2');
            expect(styles && styles[0][0]).toStrictEqual(EXPECTED_EXTERNAL_PASTE_STYLE);

            // second merged cells not changed
            expect(values && values[2][1]?.v).toBe('456');
            expect(styles && styles[2][1]).toStrictEqual({ bg: { rgb: '#ccc' }, ht: 2, vt: 2 });

            expect(mergedCells).toStrictEqual([
                {
                    startRow: 8,
                    startColumn: 11,
                    endRow: 9,
                    endColumn: 12,
                },
                {
                    startRow: 6,
                    startColumn: 10,
                    endRow: 6,
                    endColumn: 11,
                },
            ]);
        });
        it('The current selection is a merged cell of 1 row and 3 columns, with a merged cell of 2 rows and 2 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to K12:M15
            const startRow = 11;
            const startColumn = 10;
            const endRow = 14;
            const endColumn = 12;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);

            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            // first merged cells not changed
            expect(values && values[0][0]?.v).toBe('456');
            expect(styles && styles[0][0]).toStrictEqual({ bg: { rgb: '#ccc' }, ht: 3 });

            // second merged cells not changed
            expect(values && values[2][1]?.v).toBe('456');
            expect(styles && styles[2][1]).toStrictEqual({ bg: { rgb: '#ccc' } });

            expect(mergedCells).toStrictEqual([
                {
                    startRow: 11,
                    startColumn: 10,
                    endRow: 11,
                    endColumn: 12,
                },
                {
                    startRow: 13,
                    startColumn: 11,
                    endRow: 14,
                    endColumn: 12,
                },
            ]);
        });
        it('The current selection is a merged cell of 2 rows and 2 columns, with a merged cell of 1 row and 2 columns', async () => {
            const selectionManager = get(SheetsSelectionsService);

            // set selection to K22:M24
            const startRow = 21;
            const startColumn = 10;
            const endRow = 23;
            const endColumn = 12;

            selectionManager.addSelections([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);

            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            // first merged cells not changed
            expect(values && values[0][0]?.v).toBe('456');
            expect(styles && styles[0][0]).toStrictEqual({ bg: { rgb: '#ccc' } });

            // second merged cells not changed
            expect(values && values[2][1]?.v).toBe('456');
            expect(styles && styles[2][1]).toStrictEqual({ bg: { rgb: '#ccc' } });

            expect(mergedCells).toStrictEqual([
                {
                    startRow: 21,
                    startColumn: 10,
                    endRow: 22,
                    endColumn: 11,
                },
                {
                    startRow: 23,
                    startColumn: 11,
                    endRow: 23,
                    endColumn: 12,
                },
            ]);
        });
    });

    describe('Test internal copy and cut of merged cells', () => {
        it.each([
            { name: 'copies within the current sheet', copyType: COPY_TYPE.COPY, targetSubUnitId: 'sheet1' },
            { name: 'cuts within the current sheet', copyType: COPY_TYPE.CUT, targetSubUnitId: 'sheet1' },
            { name: 'copies across sheets', copyType: COPY_TYPE.COPY, targetSubUnitId: 'sheet2' },
            { name: 'cuts across sheets', copyType: COPY_TYPE.CUT, targetSubUnitId: 'sheet2' },
        ])('$name', async ({ copyType, targetSubUnitId }) => {
            const sourceRange = {
                startRow: 21,
                startColumn: 10,
                endRow: 22,
                endColumn: 11,
            };
            const targetRange = {
                startRow: 25,
                startColumn: 5,
                endRow: 26,
                endColumn: 6,
            };
            const selectionManager = get(SheetsSelectionsService);
            selectionManager.addSelections([{
                range: { ...sourceRange, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            }]);

            expect(await (copyType === COPY_TYPE.COPY ? sheetClipboardService.copy() : sheetClipboardService.cut())).toBe(true);
            const copyId = sheetClipboardService.copyContentCache().getLastCopyId();
            expect(copyId).not.toBeNull();

            if (targetSubUnitId !== 'sheet1') {
                expect(await commandService.executeCommand(SetWorksheetActiveOperation.id, {
                    unitId: 'test',
                    subUnitId: targetSubUnitId,
                })).toBe(true);
            }
            selectionManager.addSelections([{
                range: { ...targetRange, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            }]);

            expect(await sheetClipboardService.pasteByCopyId(copyId!)).toBe(true);
            expect(getValues(targetRange.startRow, targetRange.startColumn, targetRange.endRow, targetRange.endColumn, targetSubUnitId)?.[0][0]?.v).toBe(
                copyType === COPY_TYPE.COPY ? 456 : '456'
            );
            expect(getMergedCells(sourceRange.startRow, sourceRange.startColumn, sourceRange.endRow, sourceRange.endColumn)).toEqual(
                copyType === COPY_TYPE.COPY ? [sourceRange] : []
            );
            expect(getMergedCells(targetRange.startRow, targetRange.startColumn, targetRange.endRow, targetRange.endColumn, targetSubUnitId)).toEqual([targetRange]);

            expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
            expect(getMergedCells(sourceRange.startRow, sourceRange.startColumn, sourceRange.endRow, sourceRange.endColumn)).toEqual([sourceRange]);
            expect(getMergedCells(targetRange.startRow, targetRange.startColumn, targetRange.endRow, targetRange.endColumn, targetSubUnitId)).toEqual([]);

            expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
            expect(getMergedCells(sourceRange.startRow, sourceRange.startColumn, sourceRange.endRow, sourceRange.endColumn)).toEqual(
                copyType === COPY_TYPE.COPY ? [sourceRange] : []
            );
            expect(getMergedCells(targetRange.startRow, targetRange.startColumn, targetRange.endRow, targetRange.endColumn, targetSubUnitId)).toEqual([targetRange]);
        });
    });

    describe('Test cut command in single selection', () => {
        it('checks range movement before resource hooks and keeps a rejected cut available for retry', async () => {
            const workbook = get(IUniverInstanceService).getUnit<Workbook>('test')!;
            const snapshot = Tools.deepClone(workbook.getSnapshot());
            const history = get(IUndoRedoService).getUndoRedoStatus('test');
            const matrix = new ObjectMatrix<ICellData>();
            matrix.setValue(0, 0, { v: 'A25' });
            const copyId = 'rejected-cut';
            sheetClipboardService.copyContentCache().set(copyId, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { rows: [24], cols: [0] },
                matrix,
                copyType: COPY_TYPE.CUT,
            });
            let allowed = false;
            const checks: unknown[] = [];
            const validation = get(SheetInterceptorService).interceptBeforeCommand({
                performCheck: async (command) => {
                    checks.push(command);
                    return allowed;
                },
            });
            let hooksCalled = 0;
            const hook = sheetClipboardService.addClipboardHook({
                id: 'movement-preflight-resource',
                onBeforePaste: () => {
                    hooksCalled++;
                    return true;
                },
            });
            const target = {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { startRow: 24, endRow: 24, startColumn: 1, endColumn: 1 },
            };
            expect(await sheetClipboardService.pasteByCopyId(copyId, undefined, target)).toBe(false);
            expect(checks).toEqual([{
                id: MoveRangeCommand.id,
                params: {
                    fromUnitId: 'test',
                    fromSubUnitId: 'sheet1',
                    fromRange: { startRow: 24, endRow: 24, startColumn: 0, endColumn: 0 },
                    toUnitId: 'test',
                    toSubUnitId: 'sheet1',
                    toRange: target.range,
                },
            }]);
            expect(hooksCalled).toBe(0);
            expect(workbook.getSnapshot()).toEqual(snapshot);
            expect(get(IUndoRedoService).getUndoRedoStatus('test')).toEqual(history);
            expect(sheetClipboardService.copyContentCache().get(copyId)?.matrix).toBe(matrix);
            allowed = true;
            expect(await sheetClipboardService.pasteByCopyId(copyId, undefined, target)).toBe(true);
            expect(getValues(24, 0, 24, 1)?.[0].map((cell) => cell?.v ?? null)).toEqual([null, 'A25']);
            expect(hooksCalled).toBe(1);
            validation.dispose();
            hook.dispose();
        });

        it('rejects cross-workbook cuts before running resource hooks and retains the cut for a valid retry', async () => {
            const instances = get(IUniverInstanceService);
            const source = instances.getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)!;
            const sourceBefore = Tools.deepClone(source.getSnapshot());
            const peer = instances.createUnit(UniverInstanceType.UNIVER_SHEET, {
                ...Tools.deepClone(sourceBefore),
                id: 'cut-peer',
            }, { makeCurrent: false });
            const peerBefore = Tools.deepClone(peer.getSnapshot());
            const history = get(IUndoRedoService);
            const peerHistory = history.getUndoRedoStatus('cut-peer');
            const sourceHistory = history.getUndoRedoStatus('test');
            const copyId = 'cross-workbook-cut';
            const matrix = new ObjectMatrix<ICellData>();
            matrix.setValue(0, 0, { v: 'A25' });
            sheetClipboardService.copyContentCache().set(copyId, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { rows: [24], cols: [0] },
                matrix,
                copyType: COPY_TYPE.CUT,
            });
            let beforePasteCalls = 0;
            const hook = sheetClipboardService.addClipboardHook({
                id: 'cross-workbook-cut-resource-boundary',
                onBeforePaste: () => {
                    beforePasteCalls += 1;
                    return true;
                },
            });
            const range = { startRow: 24, endRow: 24, startColumn: 1, endColumn: 1 };
            expect(await sheetClipboardService.pasteByCopyId(copyId, undefined, {
                unitId: 'cut-peer',
                subUnitId: 'sheet1',
                range,
            })).toBe(false);
            expect(beforePasteCalls).toBe(0);
            expect(source.getSnapshot()).toEqual(sourceBefore);
            expect(peer.getSnapshot()).toEqual(peerBefore);
            expect(history.getUndoRedoStatus('test')).toEqual(sourceHistory);
            expect(history.getUndoRedoStatus('cut-peer')).toEqual(peerHistory);
            expect(sheetClipboardService.copyContentCache().get(copyId)?.matrix).toBe(matrix);
            hook.dispose();
            instances.setCurrentUnitForType('test');
            expect(await sheetClipboardService.pasteByCopyId(copyId, undefined, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range,
            })).toBe(true);
            expect(getValues(24, 0, 24, 1)?.[0].map((cell) => cell?.v ?? null)).toEqual([null, 'A25']);
            expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
            expect(getValues(24, 0, 24, 1)?.[0].map((cell) => cell?.v ?? null)).toEqual(['A25', 'B25']);
            expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
            expect(getValues(24, 0, 24, 1)?.[0].map((cell) => cell?.v ?? null)).toEqual([null, 'A25']);
            expect(peer.getSnapshot()).toEqual(peerBefore);
        });

        it.each([COPY_TYPE.COPY, COPY_TYPE.CUT])('delegates cross-workbook focused-object %s to its hook without moving cells', async (copyType) => {
            const instances = get(IUniverInstanceService);
            const source = instances.getUnit<Workbook>('test', UniverInstanceType.UNIVER_SHEET)!;
            const sourceBefore = Tools.deepClone(source.getSnapshot());
            const peer = instances.createUnit(UniverInstanceType.UNIVER_SHEET, {
                ...Tools.deepClone(sourceBefore),
                id: 'object-peer',
            }, { makeCurrent: false });
            const peerBefore = Tools.deepClone(peer.getSnapshot());
            const copyId = 'focused-object';
            sheetClipboardService.copyContentCache().set(copyId, {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { rows: [24], cols: [0] },
                matrix: new ObjectMatrix({ 0: { 0: { v: '' } } }),
                copyType,
                skipCellCopy: true,
            });
            const handled: Array<{ source: string | undefined; target: string; copyType: COPY_TYPE | undefined }> = [];
            const hook = sheetClipboardService.addClipboardHook({
                id: 'focused-object-owner',
                onBeforeCopyFocusedObject: () => true,
                onPasteCells: (from, to, _data, payload) => {
                    handled.push({ source: from?.unitId, target: to.unitId, copyType: payload.copyType });
                    return { redos: [], undos: [] };
                },
            });
            expect(await sheetClipboardService.pasteByCopyId(copyId, undefined, {
                unitId: 'object-peer',
                subUnitId: 'sheet1',
                range: { startRow: 24, endRow: 24, startColumn: 1, endColumn: 1 },
            })).toBe(true);
            expect(handled).toEqual([{ source: 'test', target: 'object-peer', copyType }]);
            expect(source.getSnapshot()).toEqual(sourceBefore);
            expect(peer.getSnapshot()).toEqual(peerBefore);
            hook.dispose();
        });

        it('cut value from A25 to B25', async () => {
            const unitId = 'test';
            const subUnitId = 'sheet1';
            const fromRange = { rows: [24], cols: [0] };
            const toRange = { startRow: 24, startColumn: 1, endRow: 24, endColumn: 1 };
            const copyContentCache = sheetClipboardService.copyContentCache();
            const { matrixFragment, copyId } = sheetClipboardService.generateCopyContent(
                unitId,
                subUnitId,
                discreteRangeToRange(fromRange)
            )!;

            // cache the copy content for internal paste
            copyContentCache.set(copyId, {
                unitId,
                subUnitId,
                range: fromRange,
                matrix: matrixFragment,
                copyType: COPY_TYPE.CUT,
            });

            const selectionManager = get(SheetsSelectionsService);

            selectionManager.addSelections([
                {
                    range: { ...toRange, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            expect(await sheetClipboardService.pasteByCopyId(copyId, PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE)).toBe(true);

            expect(getValues(24, 0, 24, 0)![0][0]).toBe(null);
            expect(getValues(24, 1, 24, 1)![0][0]!.v).toBe('A25');

            // undo
            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expect(getValues(24, 0, 24, 0)![0][0]!.v).toStrictEqual('A25');
            expect(getValues(24, 1, 24, 1)![0][0]!.v).toStrictEqual('B25');

            // redo
            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getValues(24, 0, 24, 0)![0][0]).toBe(null);
            expect(getValues(24, 1, 24, 1)![0][0]!.v).toBe('A25');
        });
    });
});

describe('CHART clipboard without grid selection', () => {
    let univer: Univer;
    let get: Injector['get'];
    let workbook: Workbook;
    let commands: ICommandService;
    let clipboard: ISheetClipboardService;
    let writes: Array<{ text: string; html: string }>;

    beforeEach(() => {
        writes = [];
        const boundary: IClipboardInterfaceService = {
            supportClipboard: true,
            write: async (text, html) => { writes.push({ text, html }); },
            writeText: async (text) => { writes.push({ text, html: '' }); },
            readText: async () => '',
            read: async () => [],
        };
        const bed = clipboardTestBed(undefined, [
            [SheetPermissionInterceptorClipboardController],
            [MergeCellController],
            [RefRangeService],
        ], boundary);
        univer = bed.univer;
        get = bed.get;
        workbook = bed.sheet;
        commands = get(ICommandService);
        for (const command of [
            SetRangeValuesMutation,
            SetWorksheetRowHeightMutation,
            SetWorksheetColWidthMutation,
            SetSelectionsOperation,
            SetWorksheetActiveOperation,
            SetWorksheetRowAutoHeightMutation,
            SetWorksheetNameMutation,
        ]) {
            commands.registerCommand(command);
        }
        get(MergeCellController);
        get(SheetPermissionInterceptorClipboardController);
        clipboard = get(ISheetClipboardService);
        workbook.addWorksheet('chart-host', 1, {
            id: 'chart-host',
            name: 'Chart Host',
            type: SheetTypes.CHART,
            cellData: {},
        });
        commands.syncExecuteCommand(SetWorksheetActiveOperation.id, { unitId: 'test', subUnitId: 'chart-host' });
        get(SheetsSelectionsService).setSelections('test', 'chart-host', []);
        get(IUndoRedoService).clearUndoRedo('test');
    });

    afterEach(() => univer.dispose());

    function seedObjectCache(copyId = 'chart-object') {
        clipboard.copyContentCache().set(copyId, {
            unitId: 'test',
            subUnitId: 'chart-host',
            range: { rows: [0], cols: [0] },
            matrix: new ObjectMatrix({ 0: { 0: {} } }),
            copyType: COPY_TYPE.COPY,
            skipCellCopy: true,
        });
        return copyId;
    }

    function trackMutations() {
        const executed: string[] = [];
        const listener = commands.onCommandExecuted((command) => {
            if (command.type === CommandType.MUTATION || command.id === SetSelectionsOperation.id) {
                executed.push(command.id);
            }
        });
        onTestFinished(() => listener.dispose());
        return executed;
    }

    it('copies only a claimed focused object through the real permission entry without creating a grid selection', async () => {
        let focusedCalls = 0;
        let cellCalls = 0;
        const hook = clipboard.addClipboardHook({
            id: 'chart-selectionless-object-copy',
            onBeforeCopyFocusedObject: (_unitId, _subUnitId, copyType) => {
                focusedCalls += 1;
                expect(copyType).toBe(COPY_TYPE.COPY);
                return true;
            },
            onBeforeCopy: () => { cellCalls += 1; },
        });
        onTestFinished(() => hook.dispose());
        const before = Tools.deepClone(workbook.getSnapshot());
        const executed = trackMutations();
        expect(get(SheetsSelectionsService).getCurrentSelections()).toEqual([]);
        expect(await SheetCopyCommand.handler(get(Injector))).toBe(true);
        const copyId = clipboard.copyContentCache().getLastCopyId();
        const cached = clipboard.copyContentCache().get(copyId!)!;
        expect(focusedCalls).toBe(1);
        expect(cellCalls).toBe(0);
        expect(cached.skipCellCopy).toBe(true);
        const content: string[] = [];
        cached.matrix!.forValue((_row, _column, cell) => {
            content.push(extractPureTextFromCell(cell));
        });
        expect(content.every((text) => text === '')).toBe(true);
        expect(writes).toHaveLength(1);
        expect(writes[0].text).toBe('');
        expect(get(SheetsSelectionsService).getCurrentSelections()).toEqual([]);
        expect(workbook.getSnapshot()).toEqual(before);
        expect(executed).toEqual([]);
        expect(get(IUndoRedoService).getUndoRedoStatus('test')).toEqual({ undos: 0, redos: 0 });
    });

    it('pastes an object cache through its extension plan without selection or autoheight side effects', async () => {
        const copyId = seedObjectCache();
        let pasted = false;
        const hook = clipboard.addClipboardHook({
            id: 'chart-selectionless-object-plan',
            onBeforeCopyFocusedObject: () => true,
            onPasteCells: (from, to, matrix) => {
                pasted = true;
                expect(from?.subUnitId).toBe('chart-host');
                expect(to.subUnitId).toBe('chart-host');
                matrix.forValue((_row, _column, cell) => expect(extractPureTextFromCell(cell)).toBe(''));
                // A real metadata mutation exercises the extension-plan contract; Drawing acceptance belongs to its consumer.
                return {
                    redos: [{ id: SetWorksheetNameMutation.id, params: { unitId: to.unitId, subUnitId: to.subUnitId, name: 'Pasted object metadata' } }],
                    undos: [{ id: SetWorksheetNameMutation.id, params: { unitId: to.unitId, subUnitId: to.subUnitId, name: 'Chart Host' } }],
                };
            },
        });
        onTestFinished(() => hook.dispose());
        const beforeCells = Tools.deepClone(workbook.getActiveSheet().getConfig().cellData);
        const executed = trackMutations();
        expect(await clipboard.pasteByCopyId(copyId)).toBe(true);
        expect(pasted).toBe(true);
        expect(executed).toEqual([SetWorksheetNameMutation.id]);
        expect(workbook.getActiveSheet().getName()).toBe('Pasted object metadata');
        expect(workbook.getActiveSheet().getConfig().cellData).toEqual(beforeCells);
        expect(get(SheetsSelectionsService).getCurrentSelections()).toEqual([]);
        expect(get(IUndoRedoService).getUndoRedoStatus('test')).toEqual({ undos: 1, redos: 0 });
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(workbook.getActiveSheet().getName()).toBe('Chart Host');
        expect(get(SheetsSelectionsService).getCurrentSelections()).toEqual([]);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(workbook.getActiveSheet().getName()).toBe('Pasted object metadata');
        expect(get(SheetsSelectionsService).getCurrentSelections()).toEqual([]);
    });

    it('pastes a CHART object into GRID without touching its selected text cell or autoheight row', async () => {
        const copyId = seedObjectCache();
        commands.syncExecuteCommand(SetWorksheetActiveOperation.id, { unitId: 'test', subUnitId: 'sheet1' });
        expect(commands.syncExecuteCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            cellValue: { 4: { 3: { v: 'A wrapped text line that must remain untouched.\n'.repeat(12), s: { tb: WrapStrategy.WRAP } } } },
        })).toBe(true);
        expect(commands.syncExecuteCommand(SetWorksheetRowAutoHeightMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            rowsAutoHeightInfo: [{ row: 4, autoHeight: 64 }],
        })).toBe(true);
        const selections = get(SheetsSelectionsService);
        selections.setSelections('test', 'sheet1', [{
            range: { startRow: 4, endRow: 4, startColumn: 3, endColumn: 3 },
            primary: null,
            style: null,
        }]);
        const grid = workbook.getActiveSheet();
        const beforeCells = Tools.deepClone(grid.getConfig().cellData);
        const beforeRows = Tools.deepClone(grid.getConfig().rowData);
        const beforeSelections = Tools.deepClone(selections.getCurrentSelections());
        const originalName = grid.getName();
        const skeleton = get(SheetSkeletonManagerService).ensureSkeleton('sheet1')!;
        const calculateAutoHeight = vi.spyOn(skeleton, 'calculateAutoHeightInRange');
        onTestFinished(() => calculateAutoHeight.mockRestore());
        const rowAndColumnHooks: string[] = [];
        const hook = clipboard.addClipboardHook({
            id: 'chart-to-grid-object-plan',
            onBeforeCopyFocusedObject: () => true,
            onPasteRows: () => {
                rowAndColumnHooks.push('row');
                return { redos: [], undos: [] };
            },
            onPasteColumns: () => {
                rowAndColumnHooks.push('column');
                return { redos: [], undos: [] };
            },
            onPasteCells: (from, to) => {
                expect(from?.subUnitId).toBe('chart-host');
                expect(to.subUnitId).toBe('sheet1');
                return {
                    redos: [{ id: SetWorksheetNameMutation.id, params: { unitId: to.unitId, subUnitId: to.subUnitId, name: 'GRID object metadata' } }],
                    undos: [{ id: SetWorksheetNameMutation.id, params: { unitId: to.unitId, subUnitId: to.subUnitId, name: originalName } }],
                };
            },
        });
        onTestFinished(() => hook.dispose());
        get(IUndoRedoService).clearUndoRedo('test');
        const executed = trackMutations();
        expect(await clipboard.pasteByCopyId(copyId)).toBe(true);
        expect(executed).toEqual([SetWorksheetNameMutation.id]);
        expect(rowAndColumnHooks).toEqual([]);
        expect(calculateAutoHeight).not.toHaveBeenCalled();
        expect(grid.getName()).toBe('GRID object metadata');
        expect(grid.getConfig().cellData).toEqual(beforeCells);
        expect(grid.getConfig().rowData).toEqual(beforeRows);
        expect(selections.getCurrentSelections()).toEqual(beforeSelections);
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(grid.getName()).toBe(originalName);
        expect(await commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(grid.getName()).toBe('GRID object metadata');
        expect(grid.getConfig().cellData).toEqual(beforeCells);
        expect(grid.getConfig().rowData).toEqual(beforeRows);
        expect(selections.getCurrentSelections()).toEqual(beforeSelections);
    });

    it.each(['success', 'empty plan', 'owner throws'])('finalizes before-only CHART paste observers exactly once after %s', async (outcome) => {
        const copyId = seedObjectCache();
        const observed: boolean[] = [];
        const ownerFinalized: boolean[] = [];
        let beforeCalls = 0;
        const observer = clipboard.addClipboardHook({
            id: 'chart-before-only-paste-observer',
            onBeforePaste: () => {
                beforeCalls += 1;
                return true;
            },
            onAfterPaste: (result) => { observed.push(result); },
        });
        const owner = clipboard.addClipboardHook({
            id: 'chart-object-paste-lifecycle-owner',
            onBeforeCopyFocusedObject: () => true,
            onPasteCells: (_from, to) => {
                if (outcome === 'owner throws') {
                    throw new Error('Object owner preparation failed');
                }
                if (outcome === 'empty plan') {
                    return { redos: [], undos: [] };
                }
                return {
                    redos: [{ id: SetWorksheetNameMutation.id, params: { unitId: to.unitId, subUnitId: to.subUnitId, name: 'Finalized object metadata' } }],
                    undos: [{ id: SetWorksheetNameMutation.id, params: { unitId: to.unitId, subUnitId: to.subUnitId, name: 'Chart Host' } }],
                };
            },
            onAfterPaste: (result) => { ownerFinalized.push(result); },
        });
        onTestFinished(() => {
            observer.dispose();
            owner.dispose();
        });
        const before = Tools.deepClone(workbook.getSnapshot());
        const executed = trackMutations();
        const paste = clipboard.pasteByCopyId(copyId);
        if (outcome === 'owner throws') {
            await expect(paste).rejects.toThrow('Object owner preparation failed');
        } else {
            expect(await paste).toBe(outcome === 'success');
        }
        expect(beforeCalls).toBe(1);
        expect(observed).toEqual([outcome === 'success']);
        expect(ownerFinalized).toEqual(observed);
        expect(get(SheetsSelectionsService).getCurrentSelections()).toEqual([]);
        if (outcome === 'success') {
            expect(executed).toEqual([SetWorksheetNameMutation.id]);
            expect(workbook.getActiveSheet().getName()).toBe('Finalized object metadata');
            expect(workbook.getActiveSheet().getConfig().cellData).toEqual(before.sheets['chart-host'].cellData);
            expect(get(IUndoRedoService).getUndoRedoStatus('test')).toEqual({ undos: 1, redos: 0 });
        } else {
            expect(executed).toEqual([]);
            expect(workbook.getSnapshot()).toEqual(before);
            expect(get(IUndoRedoService).getUndoRedoStatus('test')).toEqual({ undos: 0, redos: 0 });
        }
    });

    it.each(['error', 'undefined'])('finishes every CHART paste finalizer once and preserves the first after %s', async (failure) => {
        let afterCalls = 0;
        let ownerAfterCalls = 0;
        const firstFailure = failure === 'undefined' ? undefined : new Error('Paste finalizer failed');
        const observer = clipboard.addClipboardHook({
            id: 'chart-failing-finalizer',
            onBeforePaste: () => true,
            onAfterPaste: () => {
                afterCalls += 1;
                throw firstFailure;
            },
        });
        const owner = clipboard.addClipboardHook({
            id: 'chart-empty-plan-with-failing-finalizer',
            onBeforeCopyFocusedObject: () => true,
            onPasteCells: () => ({ redos: [], undos: [] }),
            onAfterPaste: () => {
                ownerAfterCalls += 1;
                throw new Error('Later finalizer failed');
            },
        });
        onTestFinished(() => {
            observer.dispose();
            owner.dispose();
        });
        const before = Tools.deepClone(workbook.getSnapshot());
        const executed = trackMutations();
        await expect(clipboard.pasteByCopyId(seedObjectCache())).rejects.toBe(firstFailure);
        expect(afterCalls).toBe(1);
        expect(ownerAfterCalls).toBe(1);
        expect(executed).toEqual([]);
        expect(workbook.getSnapshot()).toEqual(before);
        expect(get(IUndoRedoService).getUndoRedoStatus('test')).toEqual({ undos: 0, redos: 0 });
    });

    it.each(['owner error', 'owner undefined', 'before error', 'before undefined'])('preserves the original %s while completing failing CHART finalizers', async (failure) => {
        const originalFailure = failure.endsWith('undefined') ? undefined : new Error('Original paste preparation failed');
        const finalizers: string[] = [];
        const observer = clipboard.addClipboardHook({
            id: 'chart-original-error-observer',
            onBeforePaste: () => true,
            onAfterPaste: (result) => {
                expect(result).toBe(false);
                finalizers.push('observer');
                throw new Error('Observer finalization failed');
            },
        });
        const owner = clipboard.addClipboardHook({
            id: 'chart-original-error-owner',
            onBeforeCopyFocusedObject: () => true,
            onBeforePaste: () => {
                if (failure.startsWith('before')) {
                    throw originalFailure;
                }
                return true;
            },
            onPasteCells: () => { throw originalFailure; },
            onAfterPaste: (result) => {
                expect(result).toBe(false);
                finalizers.push('owner');
                throw new Error('Owner finalization failed');
            },
        });
        onTestFinished(() => {
            observer.dispose();
            owner.dispose();
        });
        const before = Tools.deepClone(workbook.getSnapshot());
        const executed = trackMutations();
        await expect(clipboard.pasteByCopyId(seedObjectCache())).rejects.toBe(originalFailure);
        expect(finalizers).toEqual(['observer', 'owner']);
        expect(executed).toEqual([]);
        expect(workbook.getSnapshot()).toEqual(before);
        expect(get(IUndoRedoService).getUndoRedoStatus('test')).toEqual({ undos: 0, redos: 0 });
    });

    it('rejects an unclaimed CHART copy instead of falling back to cell content', async () => {
        let focusedCalls = 0;
        let cellCalls = 0;
        const hook = clipboard.addClipboardHook({
            id: 'chart-no-focused-object',
            onBeforeCopyFocusedObject: () => {
                focusedCalls += 1;
                return false;
            },
            onBeforeCopy: () => { cellCalls += 1; },
        });
        onTestFinished(() => hook.dispose());
        expect(await clipboard.copy()).toBe(false);
        expect(focusedCalls).toBe(1);
        expect(cellCalls).toBe(0);
        expect(writes).toEqual([]);
        expect(clipboard.copyContentCache().getLastCopyId()).toBeNull();
        expect(get(SheetsSelectionsService).getCurrentSelections()).toEqual([]);
    });

    it.each(['cut', 'formula-only'])('does not allow CHART %s to use the selectionless object path', async (kind) => {
        let focusedCalls = 0;
        const hook = clipboard.addClipboardHook({
            id: 'chart-copy-only',
            onBeforeCopyFocusedObject: () => {
                focusedCalls += 1;
                return true;
            },
        });
        onTestFinished(() => hook.dispose());
        expect(await (kind === 'cut'
            ? clipboard.cut()
            : clipboard.copy({ copyHookType: PREDEFINED_HOOK_NAME_COPY.SPECIAL_COPY_FORMULA_ONLY }))).toBe(false);
        expect(focusedCalls).toBe(0);
        expect(writes).toEqual([]);
        expect(clipboard.copyContentCache().getLastCopyId()).toBeNull();
    });

    it.each(['workbook', 'worksheet'])('retains %s copy permission before invoking a focused CHART owner', async (scope) => {
        const permissions = get(IPermissionService);
        const point = scope === 'workbook' ? new WorkbookCopyPermission('test') : new WorksheetCopyPermission('test', 'chart-host');
        if (!permissions.getPermissionPoint(point.id)) {
            permissions.addPermissionPoint(point);
        }
        permissions.updatePermissionPoint(point.id, false);
        let focusedCalls = 0;
        const hook = clipboard.addClipboardHook({
            id: 'chart-denied-copy',
            onBeforeCopyFocusedObject: () => {
                focusedCalls += 1;
                return true;
            },
        });
        onTestFinished(() => hook.dispose());
        await expect(SheetCopyCommand.handler(get(Injector))).rejects.toThrow(CustomCommandExecutionError);
        expect(focusedCalls).toBe(0);
        expect(writes).toEqual([]);
        expect(clipboard.copyContentCache().getLastCopyId()).toBeNull();
    });

    it('runs paste permissions before a CHART object extension plan', async () => {
        const point = new WorksheetEditPermission('test', 'chart-host');
        const permissions = get(IPermissionService);
        if (!permissions.getPermissionPoint(point.id)) {
            permissions.addPermissionPoint(point);
        }
        permissions.updatePermissionPoint(point.id, false);
        let pasted = false;
        const hook = clipboard.addClipboardHook({
            id: 'chart-denied-paste',
            onBeforeCopyFocusedObject: () => true,
            onPasteCells: () => {
                pasted = true;
                return { redos: [], undos: [] };
            },
        });
        onTestFinished(() => hook.dispose());
        const before = Tools.deepClone(workbook.getSnapshot());
        const executed = trackMutations();
        await expect(clipboard.pasteByCopyId(seedObjectCache())).rejects.toThrow(CustomCommandExecutionError);
        expect(pasted).toBe(false);
        expect(executed).toEqual([]);
        expect(workbook.getSnapshot()).toEqual(before);
        expect(get(IUndoRedoService).getUndoRedoStatus('test')).toEqual({ undos: 0, redos: 0 });
    });

    it.each(['chart-host', 'sheet1'])('rejects an object paste to %s whose hooks contribute no mutation plan', async (targetSheet) => {
        let pasted = false;
        const hook = clipboard.addClipboardHook({
            id: 'chart-empty-object-plan',
            onBeforeCopyFocusedObject: () => true,
            onPasteCells: () => {
                pasted = true;
                return { redos: [], undos: [] };
            },
        });
        onTestFinished(() => hook.dispose());
        const before = Tools.deepClone(workbook.getSnapshot());
        const executed = trackMutations();
        expect(await clipboard.pasteByCopyId(seedObjectCache(), undefined, {
            unitId: 'test',
            subUnitId: targetSheet,
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
        })).toBe(false);
        expect(pasted).toBe(true);
        expect(executed).toEqual([]);
        expect(get(SheetsSelectionsService).getCurrentSelections()).toEqual([]);
        expect(workbook.getSnapshot()).toEqual(before);
        expect(get(IUndoRedoService).getUndoRedoStatus('test')).toEqual({ undos: 0, redos: 0 });
    });

    it.each(['chart-host', 'sheet1'])('rejects a retained CHART object CUT cache before hooks when pasting to %s', async (targetSheet) => {
        const copyId = seedObjectCache();
        const cached = clipboard.copyContentCache().get(copyId)!;
        clipboard.copyContentCache().set(copyId, { ...cached, copyType: COPY_TYPE.CUT });
        let pasted = false;
        const hook = clipboard.addClipboardHook({
            id: 'chart-cut-cache-rejected',
            onBeforeCopyFocusedObject: () => true,
            onPasteCells: () => {
                pasted = true;
                return { redos: [], undos: [] };
            },
        });
        onTestFinished(() => hook.dispose());
        const before = Tools.deepClone(workbook.getSnapshot());
        const executed = trackMutations();
        expect(await clipboard.pasteByCopyId(copyId, undefined, {
            unitId: 'test',
            subUnitId: targetSheet,
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
        })).toBe(false);
        expect(pasted).toBe(false);
        expect(executed).toEqual([]);
        expect(clipboard.copyContentCache().get(copyId)?.matrix).toBe(cached.matrix);
        expect(workbook.getSnapshot()).toEqual(before);
        expect(get(SheetsSelectionsService).getCurrentSelections()).toEqual([]);
        expect(get(IUndoRedoService).getUndoRedoStatus('test')).toEqual({ undos: 0, redos: 0 });
    });

    it.each(['internal cells', 'plain text', 'external html', 'external file'])('rejects %s pasted into CHART even with an explicit target', async (kind) => {
        const target = { unitId: 'test', subUnitId: 'chart-host', range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 } };
        const before = Tools.deepClone(workbook.getSnapshot());
        const executed = trackMutations();
        let result: boolean;
        if (kind === 'internal cells') {
            clipboard.copyContentCache().set('grid-cell', {
                unitId: 'test',
                subUnitId: 'sheet1',
                range: { rows: [24], cols: [0] },
                matrix: new ObjectMatrix({ 0: { 0: { v: 'A25' } } }),
                copyType: COPY_TYPE.COPY,
            });
            result = await clipboard.pasteByCopyId('grid-cell', undefined, target);
        } else if (kind === 'plain text') {
            result = await clipboard.legacyPaste(undefined, 'MUST_NOT_ENTER_CHART', undefined, undefined, target);
        } else if (kind === 'external html') {
            result = await clipboard.legacyPaste('<table><tr><td>MUST_NOT_ENTER_CHART</td></tr></table>', undefined, undefined, undefined, target);
        } else {
            result = await clipboard.legacyPaste(undefined, undefined, [new File(['cells'], 'clipboard.txt', { type: 'text/plain' })], undefined, target);
        }
        expect(result).toBe(false);
        expect(executed).toEqual([]);
        expect(workbook.getSnapshot()).toEqual(before);
        expect(get(SheetsSelectionsService).getCurrentSelections()).toEqual([]);
        expect(get(IUndoRedoService).getUndoRedoStatus('test')).toEqual({ undos: 0, redos: 0 });
    });

    it('keeps GRID cell copy and paste working while rejecting an empty GRID selection', async () => {
        commands.syncExecuteCommand(SetWorksheetActiveOperation.id, { unitId: 'test', subUnitId: 'sheet1' });
        const selections = get(SheetsSelectionsService);
        selections.setSelections('test', 'sheet1', [{
            range: { startRow: 24, endRow: 24, startColumn: 0, endColumn: 0 },
            primary: null,
            style: null,
        }]);
        expect(await clipboard.copy()).toBe(true);
        const copyId = clipboard.copyContentCache().getLastCopyId()!;
        selections.setSelections('test', 'sheet1', [{
            range: { startRow: 24, endRow: 24, startColumn: 1, endColumn: 1 },
            primary: null,
            style: null,
        }]);
        expect(await clipboard.pasteByCopyId(copyId)).toBe(true);
        expect(workbook.getActiveSheet().getCellRaw(24, 1)?.v).toBe('A25');
        expect(await commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(workbook.getActiveSheet().getCellRaw(24, 1)?.v).toBe('B25');
        selections.setSelections('test', 'sheet1', []);
        let focusedCalls = 0;
        const hook = clipboard.addClipboardHook({
            id: 'grid-selection-required',
            onBeforeCopyFocusedObject: () => {
                focusedCalls += 1;
                return true;
            },
        });
        onTestFinished(() => hook.dispose());
        const before = Tools.deepClone(workbook.getSnapshot());
        expect(await clipboard.copy()).toBe(false);
        expect(clipboard.capturePasteTarget()).toBeNull();
        expect(await clipboard.pasteByCopyId(copyId)).toBe(false);
        expect(focusedCalls).toBe(0);
        expect(workbook.getSnapshot()).toEqual(before);
    });
});
