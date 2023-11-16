/* eslint-disable no-magic-numbers */
import {
    ICellData,
    ICommandService,
    IRange,
    IUniverInstanceService,
    IWorkbookConfig,
    LocaleType,
    Nullable,
    Rectangle,
    Tools,
    UndoCommand,
    Univer,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { MergeCellController } from '../../../controllers/merge-cell.controller';
import { RefRangeService } from '../../../services/ref-range.service';
import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../../services/selection-manager.service';
import { AddWorksheetMergeMutation } from '../../mutations/add-worksheet-merge.mutation';
import { MoveRangeMutation } from '../../mutations/move-range.mutation';
import { RemoveWorksheetMergeMutation } from '../../mutations/remove-worksheet-merge.mutation';
import { SetSelectionsOperation } from '../../operations/selection.operation';
import { MoveRangeCommand } from '../move-range.command';
import { SetRangeValuesCommand } from '../set-range-values.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test move range commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createInsertRowColTestBed();
        univer = testBed.univer;
        get = testBed.get;
        get(MergeCellController);
        commandService = get(ICommandService);

        [
            AddWorksheetMergeMutation,
            RemoveWorksheetMergeMutation,
            SetRangeValuesCommand,
            MoveRangeCommand,
            MoveRangeMutation,
            SetSelectionsOperation,
        ].forEach((c) => commandService.registerCommand(c));
        const selectionManagerService = get(SelectionManagerService);
        selectionManagerService.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: 'test',
            sheetId: 'sheet1',
        });
    });

    afterEach(() => univer.dispose());

    describe('move range', () => {
        const fromRange: IRange = {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        };
        const toRange: IRange = {
            startRow: 2,
            endRow: 2,
            startColumn: 2,
            endColumn: 2,
        };
        it('move a1 to b3', async () => {
            await commandService.executeCommand(MoveRangeCommand.id, { fromRange, toRange });
            const c3 = getCellInfo(2, 2);
            const a1 = getCellInfo(0, 0);
            expect(c3).toEqual({ v: 'A1', s: 's1' });
            expect(a1).toEqual(null);
        });

        it('undo move a1 to b3 ', async () => {
            const originA1 = getCellInfo(0, 0);

            await commandService.executeCommand(MoveRangeCommand.id, { fromRange, toRange });
            const c3 = getCellInfo(2, 2);
            const a1 = getCellInfo(0, 0);
            expect(c3).toEqual({ v: 'A1', s: 's1' });
            expect(a1).toEqual(null);
            await commandService.executeCommand(UndoCommand.id);
            const undoA1 = getCellInfo(0, 0);
            const undoC3 = getCellInfo(2, 2);
            expect(undoC3).toEqual(null);
            expect(undoA1).toEqual(originA1);
        });

        it('mergeCell be affected by move range ', async () => {
            const mergeDataB3Before = getMergedInfo(2, 2);
            expect(mergeDataB3Before).toEqual({ startRow: 2, endRow: 3, startColumn: 2, endColumn: 2 });
            await commandService.executeCommand(MoveRangeCommand.id, { fromRange, toRange });
            const mergeDataB3After = getMergedInfo(2, 2);
            expect(mergeDataB3After).toEqual(undefined);
            const mergeData = getMergeData();
            expect(mergeData.length).toEqual(1);
        });

        it('undo mergeCell be affected by move range ', async () => {
            const originMergeData = Tools.deepClone(getMergeData());
            expect(originMergeData.length).toEqual(2);
            await commandService.executeCommand(MoveRangeCommand.id, { fromRange, toRange });
            expect(getMergeData().length).toEqual(1);
            expect(getMergeData()[0]).toEqual({ startRow: 1, endRow: 1, startColumn: 2, endColumn: 3 });
            await commandService.executeCommand(UndoCommand.id);
            const mergeData = getMergeData();
            expect(mergeData.length).toEqual(2);
            mergeData.forEach((range) => {
                expect(originMergeData.some((item: IRange) => Rectangle.equals(item, range))).toBeTruthy();
            });
        });
    });

    function getCellInfo(row: number, col: number): Nullable<ICellData> {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet.getCellMatrix().getValue(row, col);
    }

    function getMergedInfo(row: number, col: number): Nullable<IRange> {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet.getMergedCells(row, col)?.[0];
    }
    function getMergeData() {
        const currentService = get(IUniverInstanceService);
        const workbook = currentService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        return worksheet.getConfig().mergeData;
    }
});

const TEST_ROW_COL_INSERTION_DEMO: IWorkbookConfig = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        // 1
        //  2-3-
        // 	4
        //  |
        sheet1: {
            id: 'sheet1',
            cellData: {
                '0': {
                    '0': {
                        v: 'A1',
                        s: 's1',
                    },
                },
                '1': {
                    '1': {
                        v: 'B2',
                        s: 's2',
                    },
                    '4': {
                        v: 'E2',
                        s: 's3',
                    },
                },
                '2': {
                    '1': {
                        v: 'B3',
                        s: 's4',
                    },
                },
            },
            mergeData: [
                { startRow: 1, endRow: 1, startColumn: 2, endColumn: 3 },
                {
                    startRow: 2,
                    endRow: 3,
                    startColumn: 2,
                    endColumn: 2,
                },
            ],
            rowCount: 20,
            columnCount: 20,
        },
    },
    createdTime: '',
    creator: '',
    lastModifiedBy: '',
    locale: LocaleType.EN_US,
    modifiedTime: '',
    name: '',
    sheetOrder: [],
    styles: {},
    timeZone: '',
};

function createInsertRowColTestBed() {
    return createCommandTestBed(Tools.deepClone(TEST_ROW_COL_INSERTION_DEMO), [
        [MergeCellController],
        [RefRangeService],
    ]);
}
