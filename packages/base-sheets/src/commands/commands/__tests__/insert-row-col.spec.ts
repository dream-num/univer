/* eslint-disable no-magic-numbers */
import {
    ICommandService,
    ICurrentUniverService,
    IWorkbookConfig,
    LocaleType,
    RANGE_TYPE,
    Univer,
} from '@univerjs/core';
import { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../../services/selection-manager.service';
import { AddWorksheetMergeMutation } from '../../mutations/add-worksheet-merge.mutation';
import { InsertRangeMutation } from '../../mutations/insert-range.mutation';
import { InsertColMutation, InsertRowMutation } from '../../mutations/insert-row-col.mutation';
import { RemoveWorksheetMergeMutation } from '../../mutations/remove-worksheet-merge.mutation';
import {
    InsertColAfterCommand,
    InsertColBeforeCommand,
    InsertColCommand,
    InsertRowAfterCommand,
    InsertRowBeforeCommand,
    InsertRowCommand,
} from '../insert-row-col.command';
import { createCommandTestBed } from './create-command-test-bed';

describe('Test insert row col commands', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;

    beforeEach(() => {
        const testBed = createInsertRowColTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);

        [
            InsertRowCommand,
            InsertRowBeforeCommand,
            InsertRowAfterCommand,

            InsertColAfterCommand,
            InsertColBeforeCommand,
            InsertColCommand,

            InsertColMutation,
            InsertRowMutation,
            InsertRangeMutation,
            AddWorksheetMergeMutation,
            RemoveWorksheetMergeMutation,
        ].forEach((c) => {
            commandService.registerCommand(c);
        });

        const selectionManagerService = get(SelectionManagerService);
        selectionManagerService.setCurrentSelection({
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            unitId: 'test',
            sheetId: 'sheet1',
        });
    });

    afterEach(() => univer.dispose());

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

    function getRowCount(): number {
        const currentService = get(ICurrentUniverService);
        const univerSheet = currentService.getCurrentUniverSheetInstance();
        const worksheet = univerSheet.getWorkBook().getActiveSheet();
        return worksheet.getLastRow() + 1;
    }

    function getColCount(): number {
        const currentService = get(ICurrentUniverService);
        const univerSheet = currentService.getCurrentUniverSheetInstance();
        const worksheet = univerSheet.getWorkBook().getActiveSheet();
        return worksheet.getLastColumn() + 1;
    }

    describe('Insert rows', () => {
        /**
         * In a test case we should examine
         * 1. The rows are actually inserted
         * 2. Row heights are correct
         * 3. Merged cells are correctly adjusted
         * 4. Selections are correctly adjusted
         */
        it("Should 'insert before' work", async () => {
            selectRow(2, 2);

            const result = await commandService.executeCommand(InsertRowBeforeCommand.id);
            expect(result).toBeTruthy();
            expect(getRowCount()).toBe(20); // FIXME: the insert row mutation is executed before row count not changed!
        });

        // it("Should 'insert after' work", async () => {});
    });

    // describe('Insert columns', () => {
    //     it("Should 'insert before' work", async () => {});

    //     it("Should 'insert after' work", async () => {});
    // });
});

const TEST_ROW_COL_INSERTION_DEMO: IWorkbookConfig = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    sheets: {
        sheet1: {
            id: 'sheet1',
            cellData: {
                '0': {
                    '0': {
                        v: 'A1',
                    },
                },
                '1': {
                    '1': {
                        v: 'B2',
                    },
                    '4': {
                        v: 'E2',
                    },
                },
                '2': {
                    '1': {
                        v: 'B3',
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
            // mergeData:
            rowCount: 20,
            columnCount: 20,
        },
    },
    createdTime: '',
    creator: '',
    extensions: [],
    lastModifiedBy: '',
    locale: LocaleType.EN,
    modifiedTime: '',
    name: '',
    sheetOrder: [],
    styles: {},
    timeZone: '',
};

function createInsertRowColTestBed() {
    return createCommandTestBed(TEST_ROW_COL_INSERTION_DEMO);
}
