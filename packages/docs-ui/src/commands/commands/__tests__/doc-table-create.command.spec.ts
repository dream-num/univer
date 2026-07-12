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

import type { ICommand, IDocumentData, Univer } from '@univerjs/core';
import { awaitTime, DataStreamTreeTokenType, DocumentBlockRangeType, ICommandService } from '@univerjs/core';
import {
    DocContentInsertService,
    DocSelectionManagerService,
    DocSkeletonManagerService,
    RichTextEditingMutation,
} from '@univerjs/docs';
import { afterEach, describe, expect, it } from 'vitest';
import {
    buildDocTableInsertBody,
    canInsertTableAtOffset,
    CreateDocTableCommand,
    normalizeTableInsertOffset,
    shouldCreateParagraphBeforeTable,
} from '../table/doc-table-create.command';
import {
    DocTableDeleteColumnsCommand,
    DocTableDeleteRowsCommand,
    DocTableDeleteTableCommand,
} from '../table/doc-table-delete.command';
import {
    DocTableInsertColumnCommand,
    DocTableInsertColumnLeftCommand,
    DocTableInsertColumnRightCommand,
    DocTableInsertRowAboveCommand,
    DocTableInsertRowBellowCommand,
    DocTableInsertRowCommand,
} from '../table/doc-table-insert.command';
import {
    CellPosition,
    genEmptyTable,
    genTableSource,
    getCellOffsets,
    getColumnWidths,
    getDeleteColumnsActionParams,
    getDeleteRowContentActionParams,
    getDeleteRowsActionsParams,
    getDeleteTableActionParams,
    getEmptyTableCell,
    getEmptyTableRow,
    getInsertColumnActionsParams,
    getInsertColumnBody,
    getInsertRowActionsParams,
    getInsertRowBody,
    getRangeInfoFromRanges,
    getTableColumn,
    INSERT_COLUMN_POSITION,
    INSERT_ROW_POSITION,
} from '../table/table';
import { createCommandTestBed } from './create-command-test-bed';

const TABLE_ID = 'table-1';
const TABLE_PREFIX = '';
const TABLE_SUFFIX = 'CD\r\n';

interface ITableFixture {
    documentData: IDocumentData;
    cellRanges: Array<{ startIndex: number; endIndex: number }>;
    rowRanges: Array<{ startIndex: number; endIndex: number }>;
    tableRange: { startIndex: number; endIndex: number };
}

let univer: Univer | undefined;

afterEach(() => {
    univer?.dispose();
    univer = undefined;
});

function createTableFixture(rowCount = 3, colCount = 3): ITableFixture {
    const tableData = genEmptyTable(rowCount, colCount);
    const tableSource = genTableSource(rowCount, colCount, 360);
    const dataStream = `${TABLE_PREFIX}${tableData.dataStream}${TABLE_SUFFIX}`;
    const tableStartIndex = TABLE_PREFIX.length;
    const tableEndIndex = tableStartIndex + tableData.dataStream.length;
    const documentData: IDocumentData = {
        id: 'test-doc',
        body: {
            dataStream,
            textRuns: [{
                st: 0,
                ed: dataStream.length - 2,
                ts: {},
            }],
            paragraphs: [
                ...tableData.paragraphs.map((paragraph) => ({
                    ...paragraph,
                    startIndex: paragraph.startIndex + tableStartIndex,
                })),
                { paragraphId: 'para_docs_ui_table_tail', startIndex: dataStream.length - 2 },
            ],
            sectionBreaks: [
                ...tableData.sectionBreaks.map((sectionBreak) => ({
                    ...sectionBreak,
                    startIndex: sectionBreak.startIndex + tableStartIndex,
                })),
                { sectionId: 'section_fixture_219', startIndex: dataStream.length - 1 },
            ],
            tables: [{
                startIndex: tableStartIndex,
                endIndex: tableEndIndex,
                tableId: TABLE_ID,
            }],
            customBlocks: [],
        },
        documentStyle: {
            pageSize: { width: 540, height: 720 },
            marginTop: 72,
            marginBottom: 72,
            marginRight: 90,
            marginLeft: 90,
        },
        tableSource: {
            [TABLE_ID]: {
                ...tableSource,
                tableId: TABLE_ID,
            },
        },
    };

    return {
        documentData,
        cellRanges: collectTokenRanges(dataStream, DataStreamTreeTokenType.TABLE_CELL_START, DataStreamTreeTokenType.TABLE_CELL_END, tableStartIndex, tableEndIndex),
        rowRanges: collectTokenRanges(dataStream, DataStreamTreeTokenType.TABLE_ROW_START, DataStreamTreeTokenType.TABLE_ROW_END, tableStartIndex, tableEndIndex),
        tableRange: { startIndex: tableStartIndex, endIndex: tableEndIndex - 1 },
    };
}

function collectTokenRanges(dataStream: string, startToken: string, endToken: string, from: number, to: number) {
    const ranges: Array<{ startIndex: number; endIndex: number }> = [];

    for (let i = from; i < to; i++) {
        if (dataStream[i] !== startToken) {
            continue;
        }

        const endIndex = dataStream.indexOf(endToken, i);
        ranges.push({ startIndex: i, endIndex });
        i = endIndex;
    }

    return ranges;
}

function createTableViewModel(fixture: ITableFixture) {
    const testBed = createCommandTestBed(fixture.documentData);
    univer = testBed.univer;

    return testBed.get(DocSkeletonManagerService).getViewModel();
}

function createTableCommandBed(fixture: ITableFixture) {
    const testBed = createCommandTestBed(fixture.documentData);
    univer = testBed.univer;

    const commandService = testBed.get(ICommandService);
    commandService.registerCommand(DocTableInsertRowAboveCommand);
    commandService.registerCommand(DocTableInsertRowBellowCommand);
    commandService.registerCommand(DocTableInsertRowCommand);
    commandService.registerCommand(DocTableInsertColumnLeftCommand);
    commandService.registerCommand(DocTableInsertColumnRightCommand);
    commandService.registerCommand(DocTableInsertColumnCommand);
    commandService.registerCommand(DocTableDeleteRowsCommand);
    commandService.registerCommand(DocTableDeleteColumnsCommand);
    commandService.registerCommand(DocTableDeleteTableCommand);
    commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

    return testBed;
}

function createTableCreationBed(documentData: IDocumentData) {
    const testBed = createCommandTestBed(documentData, [[DocContentInsertService]]);
    univer = testBed.univer;

    const commandService = testBed.get(ICommandService);
    commandService.registerCommand(CreateDocTableCommand);
    commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);

    return testBed;
}

function setActiveTableRange(testBed: ReturnType<typeof createCommandTestBed>, startOffset: number, endOffset = startOffset) {
    const selectionManager = testBed.get(DocSelectionManagerService);
    selectionManager.__TEST_ONLY_setCurrentSelection({
        unitId: 'test-doc',
        subUnitId: 'test-doc',
    });
    selectionManager.__TEST_ONLY_add([{
        startOffset,
        endOffset,
        collapsed: startOffset === endOffset,
        isActive: true,
        segmentId: '',
        style: null as never,
    }]);
}

function asRange(startOffset: number, endOffset = startOffset) {
    return {
        startOffset,
        endOffset,
        segmentId: '',
    } as never;
}

function getOutsideTableOffset(fixture: ITableFixture) {
    return fixture.documentData.body!.dataStream.length - 1;
}

describe('doc table create command helpers', () => {
    it('normalizes offset zero to keep the initial empty paragraph above the table', () => {
        expect(normalizeTableInsertOffset({ dataStream: '\r\n' }, 0)).toBe(1);
        expect(normalizeTableInsertOffset({ dataStream: 'Title\r\n' }, 0)).toBe(0);
    });

    it('does not create another before-table paragraph at an existing paragraph boundary', () => {
        expect(shouldCreateParagraphBeforeTable({ dataStream: '\r\n' }, 1)).toBe(false);
        expect(shouldCreateParagraphBeforeTable({ dataStream: 'Title\r\n' }, 6)).toBe(false);
    });

    it('creates a before-table paragraph when inserting inside paragraph text', () => {
        expect(shouldCreateParagraphBeforeTable({ dataStream: 'Title\r\n' }, 2)).toBe(true);
    });

    it('builds inserted table body with a normal paragraph after the table', () => {
        const tableData = genEmptyTable(1, 1);
        const body = buildDocTableInsertBody({
            tableDataStream: tableData.dataStream,
            tableParagraphs: tableData.paragraphs,
            sectionBreaks: tableData.sectionBreaks,
            tableId: 'table-1',
            textRun: { st: 0, ed: tableData.dataStream.length, ts: {} },
        });

        expect(body.dataStream).toBe(`${tableData.dataStream}${DataStreamTreeTokenType.PARAGRAPH}`);
        expect(body.tables).toEqual([{
            startIndex: 0,
            endIndex: tableData.dataStream.length,
            tableId: 'table-1',
        }]);
        expect(body.paragraphs.at(-1)).toMatchObject({
            startIndex: tableData.dataStream.length,
            paragraphId: expect.stringMatching(/^para_/),
        });
    });

    it('builds empty table source with matching row, column, and cell defaults', () => {
        const table = genTableSource(2, 3, 480);

        expect(table.tableRows).toHaveLength(2);
        expect(table.tableRows[0].tableCells).toEqual([
            getEmptyTableCell(),
            getEmptyTableCell(),
            getEmptyTableCell(),
        ]);
        expect(table.tableRows[0].trHeight).toMatchObject({
            val: { v: 30 },
        });
        expect(table.tableColumns.map((column) => column.size.width.v)).toEqual([160, 160, 160]);
        expect(getEmptyTableRow(2).tableCells).toEqual([getEmptyTableCell(), getEmptyTableCell()]);
        expect(getTableColumn(42).size.width.v).toBe(42);
    });

    it('gets range info from rectangular table ranges before falling back to text range', () => {
        expect(getRangeInfoFromRanges(null, null)).toBeNull();
        expect(getRangeInfoFromRanges(asRange(4, 9), [])).toEqual({
            startOffset: 4,
            endOffset: 9,
            segmentId: '',
        });
        expect(getRangeInfoFromRanges(asRange(100, 110), [
            asRange(25, 28),
            asRange(12, 18),
        ])).toEqual({
            startOffset: 12,
            endOffset: 28,
            segmentId: '',
        });
        expect(getRangeInfoFromRanges(asRange(1, 2), [{ startOffset: null, endOffset: 4, segmentId: '' } as never])).toBeUndefined();
    });

    it('builds insert row and column bodies with paragraph metadata inside new cells', () => {
        const rowBody = getInsertRowBody(3);
        const columnBody = getInsertColumnBody();
        const expectedCellStream = `${DataStreamTreeTokenType.TABLE_CELL_START}\r\n${DataStreamTreeTokenType.TABLE_CELL_END}`;

        expect(rowBody.dataStream).toBe(`${DataStreamTreeTokenType.TABLE_ROW_START}${expectedCellStream.repeat(3)}${DataStreamTreeTokenType.TABLE_ROW_END}`);
        expect(rowBody.paragraphs.map((paragraph) => paragraph.startIndex)).toEqual([2, 6, 10]);
        expect(rowBody.sectionBreaks.map((sectionBreak) => sectionBreak.startIndex)).toEqual([3, 7, 11]);
        expect(rowBody.paragraphs.map((paragraph) => paragraph.paragraphStyle)).toEqual([
            { spaceAbove: { v: 3 }, lineSpacing: 2, spaceBelow: { v: 0 } },
            { spaceAbove: { v: 3 }, lineSpacing: 2, spaceBelow: { v: 0 } },
            { spaceAbove: { v: 3 }, lineSpacing: 2, spaceBelow: { v: 0 } },
        ]);

        expect(columnBody.dataStream).toBe(expectedCellStream);
        expect(columnBody.paragraphs[0].startIndex).toBe(1);
        expect(columnBody.sectionBreaks[0].startIndex).toBe(2);
    });

    it('rescales existing table columns and the inserted column to keep the page width fixed', () => {
        const result = getColumnWidths(600, [
            getTableColumn(100),
            getTableColumn(200),
            getTableColumn(300),
        ], 1);

        expect(result).toEqual({
            widths: [75, 150, 225],
            newColWidth: 150,
        });
    });

    it('computes row insertion params from the selected table row', () => {
        const fixture = createTableFixture();
        const viewModel = createTableViewModel(fixture);
        const middleCell = fixture.cellRanges[4];

        expect(getInsertRowActionsParams(asRange(middleCell.startIndex + 1), INSERT_ROW_POSITION.ABOVE, viewModel)).toEqual({
            offset: fixture.rowRanges[1].startIndex,
            colCount: 3,
            tableId: TABLE_ID,
            insertRowIndex: 1,
        });
        expect(getInsertRowActionsParams(asRange(middleCell.startIndex + 1), INSERT_ROW_POSITION.BELLOW, viewModel)).toEqual({
            offset: fixture.rowRanges[1].endIndex + 1,
            colCount: 3,
            tableId: TABLE_ID,
            insertRowIndex: 2,
        });
        expect(getInsertRowActionsParams(asRange(getOutsideTableOffset(fixture)), INSERT_ROW_POSITION.ABOVE, viewModel)).toBeNull();
    });

    it('computes column insertion offsets for each selected table column cell', () => {
        const fixture = createTableFixture();
        const viewModel = createTableViewModel(fixture);
        const columnCells = [fixture.cellRanges[1], fixture.cellRanges[4], fixture.cellRanges[7]];

        expect(getInsertColumnActionsParams(asRange(columnCells[0].startIndex + 1), INSERT_COLUMN_POSITION.LEFT, viewModel)).toEqual({
            offsets: [
                columnCells[0].startIndex,
                columnCells[1].startIndex - columnCells[0].startIndex,
                columnCells[2].startIndex - columnCells[1].startIndex,
            ],
            tableId: TABLE_ID,
            columnIndex: 1,
            rowCount: 3,
        });
        expect(getInsertColumnActionsParams(asRange(columnCells[0].startIndex + 1), INSERT_COLUMN_POSITION.RIGHT, viewModel)).toEqual({
            offsets: [
                columnCells[0].endIndex + 1,
                columnCells[1].endIndex - columnCells[0].endIndex,
                columnCells[2].endIndex - columnCells[1].endIndex,
            ],
            tableId: TABLE_ID,
            columnIndex: 1,
            rowCount: 3,
        });
        expect(getInsertColumnActionsParams(asRange(getOutsideTableOffset(fixture)), INSERT_COLUMN_POSITION.LEFT, viewModel)).toBeNull();
    });

    it('computes delete row params and flags full-table row selections', () => {
        const fixture = createTableFixture();
        const viewModel = createTableViewModel(fixture);

        expect(getDeleteRowsActionsParams(asRange(fixture.rowRanges[1].startIndex, fixture.rowRanges[1].endIndex), viewModel)).toEqual({
            tableId: TABLE_ID,
            rowIndexes: [1],
            offset: fixture.rowRanges[1].startIndex,
            len: fixture.rowRanges[1].endIndex - fixture.rowRanges[1].startIndex + 1,
            cursor: fixture.tableRange.startIndex + 3,
            selectWholeTable: false,
        });
        expect(getDeleteRowsActionsParams(asRange(fixture.rowRanges[0].startIndex, fixture.rowRanges[2].endIndex), viewModel)).toEqual({
            tableId: TABLE_ID,
            rowIndexes: [0, 1, 2],
            offset: fixture.rowRanges[0].startIndex,
            len: fixture.rowRanges.reduce((total, row) => total + row.endIndex - row.startIndex + 1, 0),
            cursor: fixture.tableRange.startIndex + 3,
            selectWholeTable: true,
        });
        expect(getDeleteRowsActionsParams(asRange(getOutsideTableOffset(fixture)), viewModel)).toBeNull();
    });

    it('computes delete column params across rows and flags full-table column selections', () => {
        const fixture = createTableFixture();
        const viewModel = createTableViewModel(fixture);
        const columnCells = [fixture.cellRanges[1], fixture.cellRanges[4], fixture.cellRanges[7]];

        expect(getDeleteColumnsActionParams(asRange(columnCells[0].startIndex, columnCells[2].endIndex), viewModel)).toEqual({
            offsets: [
                { retain: columnCells[0].startIndex, delete: columnCells[0].endIndex - columnCells[0].startIndex + 1 },
                { retain: columnCells[1].startIndex - columnCells[0].endIndex - 1, delete: columnCells[1].endIndex - columnCells[1].startIndex + 1 },
                { retain: columnCells[2].startIndex - columnCells[1].endIndex - 1, delete: columnCells[2].endIndex - columnCells[2].startIndex + 1 },
            ],
            tableId: TABLE_ID,
            columnIndexes: [1],
            cursor: fixture.tableRange.startIndex + 3,
            selectWholeTable: false,
            rowCount: 3,
        });
        expect(getDeleteColumnsActionParams(asRange(fixture.cellRanges[0].startIndex, fixture.cellRanges[8].endIndex), viewModel)).toMatchObject({
            tableId: TABLE_ID,
            columnIndexes: [0, 1, 2],
            selectWholeTable: true,
            rowCount: 3,
        });
        expect(getDeleteColumnsActionParams(asRange(getOutsideTableOffset(fixture)), viewModel)).toBeNull();
    });

    it('computes delete table params from a range inside the table', () => {
        const fixture = createTableFixture();
        const viewModel = createTableViewModel(fixture);

        expect(getDeleteTableActionParams(asRange(fixture.cellRanges[4].startIndex + 1), viewModel)).toEqual({
            tableId: TABLE_ID,
            offset: fixture.tableRange.startIndex,
            len: fixture.tableRange.endIndex - fixture.tableRange.startIndex + 1,
            cursor: fixture.tableRange.startIndex,
        });
        expect(getDeleteTableActionParams(asRange(getOutsideTableOffset(fixture)), viewModel)).toBeNull();
    });

    it('computes delete row-content params for the selected cells in one row', () => {
        const fixture = createTableFixture();
        const viewModel = createTableViewModel(fixture);
        const selectedCells = [fixture.cellRanges[3], fixture.cellRanges[4]];

        expect(getDeleteRowContentActionParams(asRange(selectedCells[0].startIndex, selectedCells[1].endIndex), viewModel)).toEqual({
            offsets: [
                { retain: selectedCells[0].startIndex + 1, delete: selectedCells[0].endIndex - selectedCells[0].startIndex - 3 },
                { retain: selectedCells[1].startIndex + 1, delete: selectedCells[1].endIndex - selectedCells[1].startIndex - 3 },
            ],
            tableId: TABLE_ID,
            cursor: fixture.tableRange.startIndex + 3,
            rowCount: 3,
        });
        expect(getDeleteRowContentActionParams(asRange(getOutsideTableOffset(fixture)), viewModel)).toBeNull();
    });

    it('moves between neighboring table cells by returning editable cell content offsets', () => {
        const fixture = createTableFixture();
        const viewModel = createTableViewModel(fixture);

        expect(getCellOffsets(viewModel, asRange(fixture.cellRanges[1].startIndex + 1), CellPosition.NEXT)).toEqual({
            startOffset: fixture.cellRanges[2].startIndex + 1,
            endOffset: fixture.cellRanges[2].endIndex - 2,
        });
        expect(getCellOffsets(viewModel, asRange(fixture.cellRanges[3].startIndex + 1), CellPosition.PREV)).toEqual({
            startOffset: fixture.cellRanges[2].startIndex + 1,
            endOffset: fixture.cellRanges[2].endIndex - 2,
        });
        expect(getCellOffsets(viewModel, asRange(0), CellPosition.NEXT)).toBeNull();
    });

    it('executes row insertion through the registered table command chain', async () => {
        const fixture = createTableFixture();
        const testBed = createTableCommandBed(fixture);
        const commandService = testBed.get(ICommandService);
        setActiveTableRange(testBed, fixture.cellRanges[4].startIndex + 1);

        const result = await commandService.executeCommand(DocTableInsertRowAboveCommand.id);
        await awaitTime(0);

        expect(result).toBe(true);
        expect(testBed.doc.getSnapshot().tableSource?.[TABLE_ID].tableRows).toHaveLength(4);
        expect(testBed.doc.getSnapshot().tableSource?.[TABLE_ID].tableRows[1].tableCells).toEqual([
            getEmptyTableCell(),
            getEmptyTableCell(),
            getEmptyTableCell(),
        ]);
    });

    it('executes column insertion and keeps table width distributed across all columns', async () => {
        const fixture = createTableFixture();
        const testBed = createTableCommandBed(fixture);
        const commandService = testBed.get(ICommandService);
        setActiveTableRange(testBed, fixture.cellRanges[1].startIndex + 1);

        const result = await commandService.executeCommand(DocTableInsertColumnRightCommand.id);
        await awaitTime(0);

        const tableSource = testBed.doc.getSnapshot().tableSource?.[TABLE_ID];
        expect(result).toBe(true);
        expect(tableSource?.tableRows.map((row) => row.tableCells.length)).toEqual([4, 4, 4]);
        expect(tableSource?.tableColumns.map((column) => column.size.width.v)).toEqual([90, 90, 90, 90]);
    });

    it('preserves the current table width when inserting a column into a narrow table', async () => {
        const fixture = createTableFixture();
        fixture.documentData.tableSource![TABLE_ID].tableColumns.forEach((column) => {
            column.size.width.v = 80;
        });
        const testBed = createTableCommandBed(fixture);
        const commandService = testBed.get(ICommandService);
        setActiveTableRange(testBed, fixture.cellRanges[1].startIndex + 1);

        const result = await commandService.executeCommand(DocTableInsertColumnRightCommand.id);
        await awaitTime(0);

        const tableSource = testBed.doc.getSnapshot().tableSource?.[TABLE_ID];
        expect(result).toBe(true);
        expect(tableSource?.tableColumns.map((column) => column.size.width.v)).toEqual([60, 60, 60, 60]);
    });

    it('executes below-row and left-column insertion aliases', async () => {
        const rowFixture = createTableFixture();
        const rowTestBed = createTableCommandBed(rowFixture);
        let commandService = rowTestBed.get(ICommandService);
        setActiveTableRange(rowTestBed, rowFixture.cellRanges[4].startIndex + 1);

        expect(await commandService.executeCommand(DocTableInsertRowBellowCommand.id)).toBe(true);
        await awaitTime(0);
        expect(rowTestBed.doc.getSnapshot().tableSource?.[TABLE_ID].tableRows).toHaveLength(4);
        rowTestBed.univer.dispose();

        const columnFixture = createTableFixture();
        const columnTestBed = createTableCommandBed(columnFixture);
        commandService = columnTestBed.get(ICommandService);
        setActiveTableRange(columnTestBed, columnFixture.cellRanges[1].startIndex + 1);

        expect(await commandService.executeCommand(DocTableInsertColumnLeftCommand.id)).toBe(true);
        await awaitTime(0);
        expect(columnTestBed.doc.getSnapshot().tableSource?.[TABLE_ID].tableColumns).toHaveLength(4);
        expect(columnTestBed.doc.getSnapshot().tableSource?.[TABLE_ID].tableRows.map((row) => row.tableCells.length)).toEqual([4, 4, 4]);
    });

    it('executes row, column, and table deletion commands against table structure', async () => {
        const rowFixture = createTableFixture();
        const rowTestBed = createTableCommandBed(rowFixture);
        let commandService = rowTestBed.get(ICommandService);
        setActiveTableRange(rowTestBed, rowFixture.rowRanges[1].startIndex, rowFixture.rowRanges[1].endIndex);

        expect(await commandService.executeCommand(DocTableDeleteRowsCommand.id)).toBe(true);
        await awaitTime(0);
        expect(rowTestBed.doc.getSnapshot().tableSource?.[TABLE_ID].tableRows).toHaveLength(2);
        rowTestBed.univer.dispose();

        const columnFixture = createTableFixture();
        const columnTestBed = createTableCommandBed(columnFixture);
        commandService = columnTestBed.get(ICommandService);
        setActiveTableRange(columnTestBed, columnFixture.cellRanges[1].startIndex, columnFixture.cellRanges[7].endIndex);

        expect(await commandService.executeCommand(DocTableDeleteColumnsCommand.id)).toBe(true);
        await awaitTime(0);
        expect(columnTestBed.doc.getSnapshot().tableSource?.[TABLE_ID].tableColumns).toHaveLength(2);
        expect(columnTestBed.doc.getSnapshot().tableSource?.[TABLE_ID].tableRows.map((row) => row.tableCells.length)).toEqual([2, 2, 2]);
        columnTestBed.univer.dispose();

        const tableFixture = createTableFixture();
        const tableTestBed = createTableCommandBed(tableFixture);
        commandService = tableTestBed.get(ICommandService);
        setActiveTableRange(tableTestBed, tableFixture.cellRanges[4].startIndex + 1);

        expect(await commandService.executeCommand(DocTableDeleteTableCommand.id)).toBe(true);
        await awaitTime(0);
        expect(tableTestBed.doc.getBody()?.dataStream).toBe(TABLE_SUFFIX);
        expect(testBedSnapshotTableIds(tableTestBed)).toEqual([]);
    });

    it('creates a table at the current document selection and fits it to page content width', async () => {
        const testBed = createTableCreationBed(createParagraphDocument('Hello\r\n'));
        const commandService = testBed.get(ICommandService);
        setActiveTableRange(testBed, 5);
        setCommandSkeletonPage(testBed, 5, {
            pageWidth: 540,
            marginLeft: 90,
            marginRight: 90,
        });

        await expect(commandService.executeCommand(CreateDocTableCommand.id, {
            rowCount: 2,
            colCount: 3,
        })).resolves.toBe(true);
        await awaitTime(0);

        const snapshot = testBed.doc.getSnapshot();
        const tableId = Object.keys(snapshot.tableSource ?? {})[0];
        expect(snapshot.body?.dataStream).toContain(DataStreamTreeTokenType.TABLE_START);
        expect(snapshot.body?.dataStream).toContain(DataStreamTreeTokenType.TABLE_END);
        expect(snapshot.tableSource?.[tableId].tableRows).toHaveLength(2);
        expect(snapshot.tableSource?.[tableId].tableRows.map((row) => row.tableCells.length)).toEqual([3, 3]);
        expect(snapshot.tableSource?.[tableId].tableColumns.map((column) => column.size.width.v)).toEqual([120, 120, 120]);
    });

    it('creates a table from the paragraph menu insert range when there is no active selection', async () => {
        const testBed = createTableCreationBed(createParagraphDocument('Hello\r\n'));
        const commandService = testBed.get(ICommandService);
        testBed.get(DocContentInsertService).setInsertRange({
            unitId: 'test-doc',
            startOffset: 0,
            endOffset: 0,
        });
        setCommandSkeletonPage(testBed, 0, {
            pageWidth: 500,
            marginLeft: 70,
            marginRight: 70,
        });

        await expect(commandService.executeCommand(CreateDocTableCommand.id, {
            rowCount: 1,
            colCount: 2,
        })).resolves.toBe(true);
        await awaitTime(0);

        const snapshot = testBed.doc.getSnapshot();
        const tableId = Object.keys(snapshot.tableSource ?? {})[0];
        expect(snapshot.body?.dataStream).toContain(DataStreamTreeTokenType.TABLE_START);
        expect(snapshot.body?.dataStream).toContain(DataStreamTreeTokenType.TABLE_END);
        expect(snapshot.tableSource?.[tableId].tableRows).toHaveLength(1);
        expect(snapshot.tableSource?.[tableId].tableColumns.map((column) => column.size.width.v)).toEqual([180, 180]);
    });

    it('does not create a table inside a block range', async () => {
        const documentData = createParagraphDocument(`${DataStreamTreeTokenType.BLOCK_START}Callout\r${DataStreamTreeTokenType.BLOCK_END}\r\n`);
        const testBed = createTableCreationBed({
            ...documentData,
            body: {
                ...documentData.body!,
                paragraphs: [{ paragraphId: 'para_block_range', startIndex: 8 }],
                sectionBreaks: [{ sectionId: 'section_fixture_220', startIndex: 11 }],
                blockRanges: [{ blockId: 'callout-1', blockType: DocumentBlockRangeType.CALLOUT, startIndex: 0, endIndex: 9 }],
            },
        });
        const commandService = testBed.get(ICommandService);
        setActiveTableRange(testBed, 2);
        setCommandSkeletonPage(testBed, 2, {
            pageWidth: 540,
            marginLeft: 90,
            marginRight: 90,
        });

        await expect(commandService.executeCommand(CreateDocTableCommand.id, {
            rowCount: 1,
            colCount: 1,
        })).resolves.toBe(false);

        expect(testBed.doc.getSnapshot().body?.tables).toBeUndefined();
        expect(testBed.doc.getSnapshot().tableSource).toEqual({});
    });

    it('does not create a table inside an existing table range', async () => {
        const fixture = createTableFixture(1, 1);
        const testBed = createTableCreationBed(fixture.documentData);
        const commandService = testBed.get(ICommandService);
        const insertOffset = fixture.cellRanges[0].startIndex + 1;
        setActiveTableRange(testBed, insertOffset);
        setCommandSkeletonPage(testBed, insertOffset, {
            pageWidth: 540,
            marginLeft: 90,
            marginRight: 90,
        });

        await expect(commandService.executeCommand(CreateDocTableCommand.id, {
            rowCount: 1,
            colCount: 1,
        })).resolves.toBe(false);

        expect(testBedSnapshotTableIds(testBed)).toEqual([TABLE_ID]);
    });

    it('allows insertion immediately after an existing table range', () => {
        const fixture = createTableFixture(1, 1);
        const tableEndOffset = fixture.documentData.body!.tables![0].endIndex;

        expect(canInsertTableAtOffset(fixture.documentData.body!, tableEndOffset)).toBe(true);
    });

    it('allows insertion immediately before table and block start boundaries', () => {
        const fixture = createTableFixture(1, 1);
        const blockBody = {
            blockRanges: [{ blockId: 'block-1', blockType: DocumentBlockRangeType.CALLOUT, startIndex: 1, endIndex: 3 }],
            customBlocks: [],
            tables: [],
        };

        expect(canInsertTableAtOffset(fixture.documentData.body!, fixture.tableRange.startIndex)).toBe(true);
        expect(canInsertTableAtOffset(blockBody, 1)).toBe(true);
        expect(canInsertTableAtOffset(blockBody, 2)).toBe(false);
    });

    it('does not create a table on a custom block', async () => {
        const testBed = createTableCreationBed({
            ...createParagraphDocument('A\b\r\n'),
            body: {
                dataStream: 'A\b\r\n',
                textRuns: [{ st: 0, ed: 2, ts: {} }],
                paragraphs: [{ paragraphId: 'para_custom_block', startIndex: 2 }],
                sectionBreaks: [{ sectionId: 'section_fixture_221', startIndex: 3 }],
                customBlocks: [{ startIndex: 1, blockId: 'custom-block-1' }],
            },
        });
        const commandService = testBed.get(ICommandService);
        setActiveTableRange(testBed, 1);
        setCommandSkeletonPage(testBed, 1, {
            pageWidth: 540,
            marginLeft: 90,
            marginRight: 90,
        });

        await expect(commandService.executeCommand(CreateDocTableCommand.id, {
            rowCount: 1,
            colCount: 1,
        })).resolves.toBe(false);

        expect(testBed.doc.getSnapshot().body?.tables).toBeUndefined();
        expect(testBed.doc.getSnapshot().tableSource).toEqual({});
    });

    it('does not create a table without a render skeleton for the cursor', async () => {
        const testBed = createTableCreationBed(createParagraphDocument('Hello\r\n'));
        const commandService = testBed.get(ICommandService);
        setActiveTableRange(testBed, 5);
        const skeletonManager = testBed.get(DocSkeletonManagerService) as unknown as { getSkeleton: () => unknown };
        skeletonManager.getSkeleton = () => null;

        await expect(commandService.executeCommand(CreateDocTableCommand.id, {
            rowCount: 1,
            colCount: 1,
        })).resolves.toBe(false);

        expect(testBed.doc.getSnapshot().body?.tables).toBeUndefined();
        expect(testBed.doc.getSnapshot().tableSource).toEqual({});
    });
});

function testBedSnapshotTableIds(testBed: ReturnType<typeof createCommandTestBed>) {
    return Object.keys(testBed.doc.getSnapshot().tableSource ?? {});
}

function createParagraphDocument(dataStream: string): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream,
            textRuns: [{
                st: 0,
                ed: dataStream.length - 2,
                ts: {},
            }],
            paragraphs: [{ paragraphId: 'para_docs_ui_create_table', startIndex: dataStream.length - 2 }],
            sectionBreaks: [{ sectionId: 'section_fixture_222', startIndex: dataStream.length - 1 }],
            customBlocks: [],
        },
        documentStyle: {
            pageSize: { width: 540, height: 720 },
            marginTop: 72,
            marginBottom: 72,
            marginRight: 90,
            marginLeft: 90,
        },
        tableSource: {},
    };
}

function setCommandSkeletonPage(testBed: ReturnType<typeof createCommandTestBed>, offset: number, pageInfo: { pageWidth: number; marginLeft: number; marginRight: number }) {
    const page = { ...pageInfo };
    const pageChild = { parent: page };
    const paragraph = { parent: pageChild };
    const line = { parent: paragraph };
    const divide = { parent: line };
    const glyph = { parent: divide };
    const skeletonManager = testBed.get(DocSkeletonManagerService) as unknown as { getSkeleton: () => unknown };
    skeletonManager.getSkeleton = () => ({
        findNodeByCharIndex: (index: number) => index === offset ? glyph : null,
    });
}
