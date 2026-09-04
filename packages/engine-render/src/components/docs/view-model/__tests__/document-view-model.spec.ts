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

import type { DataStreamTreeNode } from '../data-stream-tree-node';
import { DataStreamTreeNodeType, DataStreamTreeTokenType, DocumentDataModel, JSONX, TextX, TextXActionType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { DocumentEditArea, DocumentViewModel, parseDataStreamToTree } from '../document-view-model';

interface ITreeNodeSnapshot {
    blocks: number[];
    children: ITreeNodeSnapshot[];
    content: string | undefined;
    endIndex: number;
    nodeType: DataStreamTreeNodeType;
    startIndex: number;
}

function snapshotTreeNode(node: DataStreamTreeNode): ITreeNodeSnapshot {
    return {
        blocks: [...node.blocks],
        children: node.children.map(snapshotTreeNode),
        content: node.content,
        endIndex: node.endIndex,
        nodeType: node.nodeType,
        startIndex: node.startIndex,
    };
}

function createPlainTextActions(offset: number, deleteCount: number, insertText: string) {
    const textX = new TextX();
    if (offset > 0) {
        textX.push({ t: TextXActionType.RETAIN, len: offset });
    }
    if (deleteCount > 0) {
        textX.push({ t: TextXActionType.DELETE, len: deleteCount });
    }
    if (insertText.length > 0) {
        textX.push({
            t: TextXActionType.INSERT,
            len: insertText.length,
            body: { dataStream: insertText },
        });
    }
    return JSONX.getInstance().editOp(textX.serialize(), ['body']);
}

function createDocumentDataModel(overrides?: {
    body?: Record<string, unknown>;
    snapshot?: Record<string, unknown>;
    headerModelMap?: Map<string, any>;
    footerModelMap?: Map<string, any>;
}) {
    const body = {
        dataStream: `A${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`,
        textRuns: [],
        paragraphs: [],
        sectionBreaks: [],
        customBlocks: [],
        customRanges: [],
        customDecorations: [],
        tables: [],
        ...overrides?.body,
    };
    const snapshot = {
        tableSource: {},
        ...overrides?.snapshot,
    };

    return {
        getBody: vi.fn(() => body),
        getSnapshot: vi.fn(() => snapshot),
        headerModelMap: overrides?.headerModelMap ?? new Map(),
        footerModelMap: overrides?.footerModelMap ?? new Map(),
    } as any;
}

function findFirstNodeByType(node: any, type: DataStreamTreeNodeType): any | null {
    if (!node) return null;
    if (node.nodeType === type) return node;
    for (const child of node.children ?? []) {
        const found = findFirstNodeByType(child, type);
        if (found) return found;
    }
    return null;
}

describe('DocumentViewModel', () => {
    describe('parseDataStreamToTree', () => {
        it('should handle empty section correctly', () => {
            const dataStream = DataStreamTreeTokenType.SECTION_BREAK;
            const { sectionList } = parseDataStreamToTree(dataStream);

            expect(sectionList.length).toBe(1);
            const section = sectionList[0];
            expect(section.nodeType).toBe(DataStreamTreeNodeType.SECTION_BREAK);
            expect(section.children.length).toBe(1);
            expect(section.children[0].nodeType).toBe(DataStreamTreeNodeType.PARAGRAPH);
            expect(section.children[0].content).toBe('');
        });

        it('should handle consecutive section breaks correctly', () => {
            const dataStream = `Hello${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}${DataStreamTreeTokenType.SECTION_BREAK}`;
            const { sectionList } = parseDataStreamToTree(dataStream);

            expect(sectionList.length).toBe(2);

            // First section
            expect(sectionList[0].children.length).toBe(1);
            expect(sectionList[0].children[0].content).toBe(`Hello${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`);

            // Second section (empty)
            expect(sectionList[1].children.length).toBe(1);
            expect(sectionList[1].children[0].content).toBe('');
        });

        it('projects legacy custom blocks after a paragraph terminator into a renderable paragraph', () => {
            const T = DataStreamTreeTokenType;
            const dataStream = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}${T.PARAGRAPH}${T.CUSTOM_BLOCK}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}${T.PARAGRAPH}${T.SECTION_BREAK}`;
            const { sectionList } = parseDataStreamToTree(dataStream);
            const tableCell = findFirstNodeByType(sectionList[0], DataStreamTreeNodeType.TABLE_CELL);
            expect(tableCell).not.toBeNull();
            if (!tableCell) {
                throw new Error('Expected a table-cell node');
            }
            const paragraphs = tableCell.children[0].children;

            expect(paragraphs.map((paragraph: DataStreamTreeNode) => paragraph.content)).toEqual([
                T.PARAGRAPH,
                `${T.CUSTOM_BLOCK}${T.SECTION_BREAK}`,
            ]);
            expect(paragraphs[1].startIndex).toBe(4);
            expect(paragraphs[1].endIndex).toBe(4);
            expect(paragraphs[1].blocks).toEqual([4]);
        });

        it('should parse table/custom-block and build table node cache', () => {
            const ds = [
                'A',
                DataStreamTreeTokenType.PARAGRAPH,
                DataStreamTreeTokenType.TABLE_START,
                DataStreamTreeTokenType.TABLE_ROW_START,
                DataStreamTreeTokenType.TABLE_CELL_START,
                'B',
                DataStreamTreeTokenType.PARAGRAPH,
                DataStreamTreeTokenType.SECTION_BREAK,
                DataStreamTreeTokenType.TABLE_CELL_END,
                DataStreamTreeTokenType.TABLE_ROW_END,
                DataStreamTreeTokenType.TABLE_END,
                DataStreamTreeTokenType.CUSTOM_BLOCK,
                DataStreamTreeTokenType.PARAGRAPH,
                DataStreamTreeTokenType.SECTION_BREAK,
            ].join('');

            const first = parseDataStreamToTree(ds);
            const tableNode = findFirstNodeByType(first.sectionList[0], DataStreamTreeNodeType.TABLE)!;
            expect(tableNode).toBeTruthy();
            expect(tableNode.children.length).toBe(1);

            const withTables = parseDataStreamToTree(ds, [{
                tableId: 'table-1',
                startIndex: tableNode.startIndex,
                endIndex: tableNode.endIndex + 1,
            } as any]);

            expect(withTables.tableNodeCache.get('table-1')?.table.nodeType).toBe(DataStreamTreeNodeType.TABLE);
            const paragraphWithCustomBlock = withTables.sectionList
                .flatMap((section) => section.children)
                .find((paragraph) => paragraph.blocks.length > 0);
            expect(paragraphWithCustomBlock?.blocks.length).toBe(1);
        });

        it('keeps outer-cell paragraphs outside a nested table cell', () => {
            const T = DataStreamTreeTokenType;
            const nestedTable = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Inner${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
            const dataStream = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Before${T.PARAGRAPH}${nestedTable}${T.PARAGRAPH}After${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}${T.PARAGRAPH}${T.SECTION_BREAK}`;

            const outerStart = 0;
            const innerStart = dataStream.indexOf(T.TABLE_START, 1);
            const innerEnd = dataStream.indexOf(T.TABLE_END, innerStart) + 1;
            const outerEnd = dataStream.lastIndexOf(T.TABLE_END) + 1;
            const { sectionList, tableNodeCache } = parseDataStreamToTree(dataStream, [
                { tableId: 'outer', startIndex: outerStart, endIndex: outerEnd } as any,
                { tableId: 'inner', startIndex: innerStart, endIndex: innerEnd } as any,
            ]);
            const outerTable = findFirstNodeByType(sectionList[0], DataStreamTreeNodeType.TABLE)!;
            const outerCell = outerTable.children[0].children[0];
            const outerParagraphs = outerCell.children[0].children;
            const nestedTableNode = findFirstNodeByType(outerCell, DataStreamTreeNodeType.TABLE)!;
            const nestedParagraphs = nestedTableNode.children[0].children[0].children[0].children;

            expect(outerParagraphs.map((paragraph: DataStreamTreeNode) => paragraph.content)).toEqual([
                `Before${T.PARAGRAPH}`,
                T.PARAGRAPH,
                `After${T.PARAGRAPH}${T.SECTION_BREAK}`,
            ]);
            expect(nestedParagraphs.map((paragraph: DataStreamTreeNode) => paragraph.content)).toEqual([
                `Inner${T.PARAGRAPH}${T.SECTION_BREAK}`,
            ]);
            expect(outerTable.startIndex).toBe(outerStart);
            expect(nestedTableNode.startIndex).toBe(innerStart);
            expect(tableNodeCache.get('outer')?.table).toBe(outerTable);
            expect(tableNodeCache.get('inner')?.table).toBe(nestedTableNode);
        });

        it('should ignore block range tokens while preserving inner paragraphs', () => {
            const ds = [
                DataStreamTreeTokenType.BLOCK_START,
                'Callout',
                DataStreamTreeTokenType.PARAGRAPH,
                'Content',
                DataStreamTreeTokenType.PARAGRAPH,
                DataStreamTreeTokenType.BLOCK_END,
                DataStreamTreeTokenType.SECTION_BREAK,
            ].join('');

            const { sectionList } = parseDataStreamToTree(ds);
            const paragraphs = sectionList[0].children;

            expect(paragraphs.map((paragraph) => paragraph.content)).toEqual([
                `${DataStreamTreeTokenType.BLOCK_START}Callout${DataStreamTreeTokenType.PARAGRAPH}`,
                `Content${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.BLOCK_END}${DataStreamTreeTokenType.SECTION_BREAK}`,
            ]);
        });

        it('keeps hidden block tokens in paragraph content so following offsets stay aligned', () => {
            const ds = [
                'A',
                DataStreamTreeTokenType.PARAGRAPH,
                DataStreamTreeTokenType.BLOCK_START,
                'B',
                DataStreamTreeTokenType.PARAGRAPH,
                DataStreamTreeTokenType.BLOCK_END,
                'C',
                DataStreamTreeTokenType.PARAGRAPH,
                DataStreamTreeTokenType.SECTION_BREAK,
            ].join('');

            const { sectionList } = parseDataStreamToTree(ds);
            const paragraphs = sectionList[0].children;

            expect(paragraphs.map((paragraph) => ({
                content: paragraph.content,
                startIndex: paragraph.startIndex,
                endIndex: paragraph.endIndex,
            }))).toEqual([
                {
                    content: `A${DataStreamTreeTokenType.PARAGRAPH}`,
                    startIndex: 0,
                    endIndex: 1,
                },
                {
                    content: `${DataStreamTreeTokenType.BLOCK_START}B${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.BLOCK_END}`,
                    startIndex: 2,
                    endIndex: 4,
                },
                {
                    content: `C${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`,
                    startIndex: 6,
                    endIndex: 7,
                },
            ]);
        });

        it('parses column group tokens into column nodes', () => {
            const ds = [
                DataStreamTreeTokenType.COLUMN_GROUP_START,
                DataStreamTreeTokenType.COLUMN_START,
                'A',
                DataStreamTreeTokenType.PARAGRAPH,
                DataStreamTreeTokenType.COLUMN_END,
                DataStreamTreeTokenType.COLUMN_START,
                'B',
                DataStreamTreeTokenType.PARAGRAPH,
                DataStreamTreeTokenType.COLUMN_END,
                DataStreamTreeTokenType.COLUMN_GROUP_END,
                DataStreamTreeTokenType.SECTION_BREAK,
            ].join('');

            const { sectionList } = parseDataStreamToTree(ds);
            const columnGroup = findFirstNodeByType(sectionList[0], DataStreamTreeNodeType.COLUMN_GROUP)!;

            expect(columnGroup).toBeTruthy();
            expect(columnGroup.startIndex).toBe(0);
            expect(columnGroup.children.map((column: any) => column.nodeType)).toEqual([
                DataStreamTreeNodeType.COLUMN,
                DataStreamTreeNodeType.COLUMN,
            ]);
            expect(columnGroup.children.map((column: any) => column.children[0].content)).toEqual([
                `A${DataStreamTreeTokenType.PARAGRAPH}`,
                `B${DataStreamTreeTokenType.PARAGRAPH}`,
            ]);
        });

        it('keeps section break nodes inside columns', () => {
            const ds = [
                DataStreamTreeTokenType.COLUMN_GROUP_START,
                DataStreamTreeTokenType.COLUMN_START,
                'A',
                DataStreamTreeTokenType.PARAGRAPH,
                DataStreamTreeTokenType.SECTION_BREAK,
                DataStreamTreeTokenType.COLUMN_END,
                DataStreamTreeTokenType.COLUMN_START,
                'B',
                DataStreamTreeTokenType.PARAGRAPH,
                DataStreamTreeTokenType.SECTION_BREAK,
                DataStreamTreeTokenType.COLUMN_END,
                DataStreamTreeTokenType.COLUMN_GROUP_END,
                DataStreamTreeTokenType.SECTION_BREAK,
            ].join('');

            const { sectionList } = parseDataStreamToTree(ds);
            const columnGroup = findFirstNodeByType(sectionList[0], DataStreamTreeNodeType.COLUMN_GROUP)!;
            const firstColumnSection = columnGroup.children[0].children[0];

            expect(firstColumnSection.nodeType).toBe(DataStreamTreeNodeType.SECTION_BREAK);
            expect(firstColumnSection.children[0].content).toBe(`A${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`);
        });
    });

    describe('DocumentViewModel class', () => {
        it('updates the data stream tree incrementally for plain text edits', () => {
            const model = createDocumentDataModel({
                body: {
                    dataStream: `AB${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`,
                    textRuns: [{ st: 0, ed: 2, ts: { fs: 10 } }],
                    paragraphs: [{ startIndex: 0, paragraphId: 'plain-edit-paragraph' }],
                    sectionBreaks: [{ sectionId: 'plain-edit-section', startIndex: 3 }],
                },
            });
            const viewModel = new DocumentViewModel(model);
            const insertTextX = new TextX();
            insertTextX.push({ t: TextXActionType.RETAIN, len: 1 });
            insertTextX.push({
                t: TextXActionType.INSERT,
                len: 1,
                body: { dataStream: 'X' },
            });
            const insertActions = JSONX.getInstance().editOp(insertTextX.serialize(), ['body']);
            const body = model.getBody();
            body.dataStream = `AXB${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
            body.textRuns = [{ st: 0, ed: 3, ts: { fs: 10 } }];
            body.sectionBreaks = [{ sectionId: 'plain-edit-section', startIndex: 4 }];

            expect(viewModel.resetByValidatedTextMutation(model, insertActions)).toBe(true);
            expect(viewModel.getChildren()[0].children[0].content).toBe(`AXB${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`);
            expect(viewModel.getChildren()[0].endIndex).toBe(4);
            expect(viewModel.getTextRun(2)?.ed).toBe(3);
            expect(viewModel.getSectionBreak(4)?.sectionId).toBe('plain-edit-section');
            expect(viewModel.getSectionBreak(3)).toBeUndefined();

            const deleteTextX = new TextX();
            deleteTextX.push({ t: TextXActionType.RETAIN, len: 1 });
            deleteTextX.push({ t: TextXActionType.DELETE, len: 1 });
            const deleteActions = JSONX.getInstance().editOp(deleteTextX.serialize(), ['body']);
            body.dataStream = `AB${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
            body.textRuns = [{ st: 0, ed: 2, ts: { fs: 10 } }];
            body.sectionBreaks = [{ sectionId: 'plain-edit-section', startIndex: 3 }];

            expect(viewModel.resetByValidatedTextMutation(model, deleteActions)).toBe(true);
            expect(viewModel.getChildren()[0].children[0].content).toBe(`AB${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`);
            expect(viewModel.getChildren()[0].endIndex).toBe(3);
            expect(viewModel.getTextRun(2)).toBeUndefined();
            expect(viewModel.getSectionBreak(3)?.sectionId).toBe('plain-edit-section');
            expect(viewModel.getSectionBreak(4)).toBeUndefined();
        });

        it('refreshes table metadata without rebuilding the document tree', () => {
            const model = createDocumentDataModel({
                body: {
                    tables: [{ tableId: 'table-1', startIndex: 0, endIndex: 1 }],
                },
                snapshot: {
                    tableSource: {
                        'table-1': { id: 'before' },
                    },
                },
            });
            const viewModel = new DocumentViewModel(model);
            const children = viewModel.getChildren();
            const snapshot = model.getSnapshot();
            snapshot.tableSource['table-1'] = { id: 'after' };
            const actions = JSONX.getInstance().replaceOp(
                ['tableSource', 'table-1', 'id'],
                'before',
                'after'
            );

            expect(viewModel.resetByValidatedMetadataMutation(model, actions)).toBe(true);
            expect(viewModel.getChildren()).toBe(children);
            expect(viewModel.getTableByStartIndex(0)?.tableSource).toEqual({ id: 'after' });
        });

        it('refreshes named styles without rebuilding the document tree', () => {
            const model = createDocumentDataModel({
                snapshot: {
                    styles: {
                        'heading-1': {
                            name: 'Heading 1',
                            type: 1,
                            paragraphStyle: { spaceBelow: { v: 0 } },
                        },
                    },
                },
            });
            const viewModel = new DocumentViewModel(model);
            const children = viewModel.getChildren();
            const snapshot = model.getSnapshot();
            snapshot.styles!['heading-1'].paragraphStyle!.spaceBelow = { v: 12 };
            const actions = JSONX.getInstance().replaceOp(
                ['styles', 'heading-1', 'paragraphStyle', 'spaceBelow', 'v'],
                0,
                12
            );

            expect(viewModel.resetByValidatedMetadataMutation(model, actions)).toBe(true);
            expect(viewModel.getChildren()).toBe(children);
            expect(viewModel.getSnapshot()?.styles?.['heading-1'].paragraphStyle?.spaceBelow).toEqual({ v: 12 });
        });

        it('updates nested table-cell and column-group paragraphs without rebuilding their element trees', () => {
            const T = DataStreamTreeTokenType;
            const tableStream = [
                T.TABLE_START,
                T.TABLE_ROW_START,
                T.TABLE_CELL_START,
                'AB',
                T.PARAGRAPH,
                T.SECTION_BREAK,
                T.TABLE_CELL_END,
                T.TABLE_ROW_END,
                T.TABLE_END,
                T.PARAGRAPH,
                T.SECTION_BREAK,
            ].join('');
            const tableModel = createDocumentDataModel({
                body: {
                    dataStream: tableStream,
                    paragraphs: [
                        { startIndex: tableStream.indexOf(T.PARAGRAPH), paragraphId: 'table-cell-paragraph' },
                        { startIndex: tableStream.lastIndexOf(T.PARAGRAPH), paragraphId: 'after-table-paragraph' },
                    ],
                    sectionBreaks: [
                        { startIndex: tableStream.indexOf(T.SECTION_BREAK), sectionId: 'table-cell-section' },
                        { startIndex: tableStream.lastIndexOf(T.SECTION_BREAK), sectionId: 'table-body-section' },
                    ],
                },
            });
            const tableViewModel = new DocumentViewModel(tableModel);
            const tableInsertOffset = tableStream.indexOf('B');
            const tableInsert = new TextX();
            tableInsert.push({ t: TextXActionType.RETAIN, len: tableInsertOffset });
            tableInsert.push({ t: TextXActionType.INSERT, len: 1, body: { dataStream: 'X' } });
            const tableActions = JSONX.getInstance().editOp(tableInsert.serialize(), ['body']);
            const tableBody = tableModel.getBody();
            tableBody.dataStream = `${tableStream.slice(0, tableInsertOffset)}X${tableStream.slice(tableInsertOffset)}`;
            tableBody.paragraphs = [
                { startIndex: tableStream.indexOf(T.PARAGRAPH) + 1, paragraphId: 'table-cell-paragraph' },
                { startIndex: tableStream.lastIndexOf(T.PARAGRAPH) + 1, paragraphId: 'after-table-paragraph' },
            ];
            tableBody.sectionBreaks = [
                { startIndex: tableStream.indexOf(T.SECTION_BREAK) + 1, sectionId: 'table-cell-section' },
                { startIndex: tableStream.lastIndexOf(T.SECTION_BREAK) + 1, sectionId: 'table-body-section' },
            ];

            expect(tableViewModel.resetByValidatedTextMutation(tableModel, tableActions)).toBe(true);
            const tableCell = findFirstNodeByType(tableViewModel.getChildren()[0], DataStreamTreeNodeType.TABLE_CELL);
            const tableCellParagraph = findFirstNodeByType(tableCell, DataStreamTreeNodeType.PARAGRAPH);
            expect(tableCellParagraph?.content).toBe(`AXB${T.PARAGRAPH}${T.SECTION_BREAK}`);
            expect(tableCell?.endIndex).toBe(tableStream.indexOf(T.TABLE_CELL_END) + 1);
            expect(tableViewModel.getParagraph(tableStream.indexOf(T.PARAGRAPH) + 1)?.paragraphId)
                .toBe('table-cell-paragraph');

            const columnStream = [
                T.COLUMN_GROUP_START,
                T.COLUMN_START,
                `Left${T.PARAGRAPH}`,
                T.COLUMN_END,
                T.COLUMN_START,
                `Right${T.PARAGRAPH}`,
                T.COLUMN_END,
                T.COLUMN_GROUP_END,
                T.SECTION_BREAK,
            ].join('');
            const columnModel = createDocumentDataModel({
                body: {
                    dataStream: columnStream,
                    paragraphs: [
                        { startIndex: columnStream.indexOf(T.PARAGRAPH), paragraphId: 'left-column-paragraph' },
                        { startIndex: columnStream.lastIndexOf(T.PARAGRAPH), paragraphId: 'right-column-paragraph' },
                    ],
                    sectionBreaks: [{
                        startIndex: columnStream.lastIndexOf(T.SECTION_BREAK),
                        sectionId: 'column-body-section',
                    }],
                },
            });
            const columnViewModel = new DocumentViewModel(columnModel);
            const columnInsertOffset = columnStream.indexOf('Right') + 2;
            const columnInsert = new TextX();
            columnInsert.push({ t: TextXActionType.RETAIN, len: columnInsertOffset });
            columnInsert.push({ t: TextXActionType.INSERT, len: 1, body: { dataStream: 'X' } });
            const columnActions = JSONX.getInstance().editOp(columnInsert.serialize(), ['body']);
            const columnBody = columnModel.getBody();
            columnBody.dataStream = `${columnStream.slice(0, columnInsertOffset)}X${columnStream.slice(columnInsertOffset)}`;
            columnBody.paragraphs = [
                { startIndex: columnStream.indexOf(T.PARAGRAPH), paragraphId: 'left-column-paragraph' },
                { startIndex: columnStream.lastIndexOf(T.PARAGRAPH) + 1, paragraphId: 'right-column-paragraph' },
            ];
            columnBody.sectionBreaks = [{
                startIndex: columnStream.lastIndexOf(T.SECTION_BREAK) + 1,
                sectionId: 'column-body-section',
            }];

            expect(columnViewModel.resetByValidatedTextMutation(columnModel, columnActions)).toBe(true);
            const columnGroup = findFirstNodeByType(
                columnViewModel.getChildren()[0],
                DataStreamTreeNodeType.COLUMN_GROUP
            );
            const rightColumnParagraph = findFirstNodeByType(
                columnGroup?.children[1],
                DataStreamTreeNodeType.PARAGRAPH
            );
            expect(rightColumnParagraph?.content).toBe(`RiXght${T.PARAGRAPH}`);
            expect(columnGroup?.endIndex).toBe(columnStream.indexOf(T.COLUMN_GROUP_END) + 1);
            expect(columnViewModel.getParagraph(columnStream.lastIndexOf(T.PARAGRAPH) + 1)?.paragraphId)
                .toBe('right-column-paragraph');
        });

        it('matches a fresh Main view model after sequential edits in body, table, columns, and trailing content', () => {
            const T = DataStreamTreeTokenType;
            const tableId = 'incremental-differential-table';
            const columnGroupId = 'incremental-differential-columns';
            const tableStream = [
                T.TABLE_START,
                T.TABLE_ROW_START,
                T.TABLE_CELL_START,
                `Table cell text${T.PARAGRAPH}${T.SECTION_BREAK}`,
                T.TABLE_CELL_END,
                T.TABLE_ROW_END,
                T.TABLE_END,
            ].join('');
            const columnGroupStream = [
                T.COLUMN_GROUP_START,
                T.COLUMN_START,
                `Left column${T.PARAGRAPH}`,
                T.COLUMN_END,
                T.COLUMN_START,
                `Right column${T.PARAGRAPH}`,
                T.COLUMN_END,
                T.COLUMN_GROUP_END,
            ].join('');
            const dataStream = [
                `Top paragraph${T.PARAGRAPH}`,
                tableStream,
                T.PARAGRAPH,
                columnGroupStream,
                T.PARAGRAPH,
                `Tail paragraph${T.PARAGRAPH}${T.SECTION_BREAK}`,
            ].join('');
            const tableStart = dataStream.indexOf(T.TABLE_START);
            const columnGroupStart = dataStream.indexOf(T.COLUMN_GROUP_START);
            const model = new DocumentDataModel({
                id: 'incremental-differential-document',
                body: {
                    dataStream,
                    paragraphs: [...dataStream.matchAll(new RegExp(T.PARAGRAPH, 'g'))].map((match, index) => ({
                        startIndex: match.index,
                        paragraphId: `incremental-differential-paragraph-${index}`,
                    })),
                    sectionBreaks: [
                        {
                            sectionId: 'incremental-differential-table-section',
                            startIndex: tableStart + tableStream.indexOf(T.SECTION_BREAK),
                        },
                        {
                            sectionId: 'incremental-differential-body-section',
                            startIndex: dataStream.length - 1,
                        },
                    ],
                    tables: [{
                        startIndex: tableStart,
                        endIndex: tableStart + tableStream.length,
                        tableId,
                    }],
                    columnGroups: [{
                        startIndex: columnGroupStart,
                        endIndex: columnGroupStart + columnGroupStream.length - 1,
                        columnGroupId,
                        columns: [
                            { columnId: 'incremental-differential-left', widthRatio: 1 },
                            { columnId: 'incremental-differential-right', widthRatio: 1 },
                        ],
                    }],
                    textRuns: [
                        { st: 0, ed: dataStream.indexOf(T.PARAGRAPH), ts: { fs: 12 } },
                        {
                            st: dataStream.indexOf('Table cell text'),
                            ed: dataStream.indexOf('Table cell text') + 'Table cell text'.length,
                            ts: { fs: 14 },
                        },
                    ],
                },
                documentStyle: {},
            });
            const incrementalViewModel = new DocumentViewModel(model);
            const operations = [
                { deleteCount: 0, insertText: ' inserted', locate: (stream: string) => stream.indexOf(' paragraph') },
                { deleteCount: 5, insertText: '', locate: (stream: string) => stream.indexOf('cell text') },
                { deleteCount: 0, insertText: '宽字符', locate: (stream: string) => stream.indexOf('Right column') + 5 },
                { deleteCount: 4, insertText: 'ending', locate: (stream: string) => stream.indexOf('Tail paragraph') + 5 },
            ];

            for (const operation of operations) {
                const body = model.getBody();
                if (body == null) {
                    throw new Error('Expected the differential document body');
                }
                const offset = operation.locate(body.dataStream);
                expect(offset).toBeGreaterThanOrEqual(0);
                const actions = createPlainTextActions(offset, operation.deleteCount, operation.insertText);
                model.apply(actions);

                expect(incrementalViewModel.resetByValidatedTextMutation(model, actions)).toBe(true);
                const rebuiltViewModel = new DocumentViewModel(model);
                expect(incrementalViewModel.getChildren().map(snapshotTreeNode)).toEqual(
                    rebuiltViewModel.getChildren().map(snapshotTreeNode)
                );
                const incrementalTableNode = incrementalViewModel.findTableNodeById(tableId);
                const rebuiltTableNode = rebuiltViewModel.findTableNodeById(tableId);
                if (incrementalTableNode == null || rebuiltTableNode == null) {
                    throw new Error('Expected both differential table nodes');
                }
                expect(snapshotTreeNode(incrementalTableNode)).toEqual(snapshotTreeNode(rebuiltTableNode));
                const currentBody = model.getBody();
                if (currentBody == null) {
                    throw new Error('Expected the mutated differential document body');
                }
                const currentColumnGroupStart = currentBody.columnGroups?.[0]?.startIndex;
                if (currentColumnGroupStart == null) {
                    throw new Error('Expected the differential column group metadata');
                }
                expect(incrementalViewModel.getColumnGroupByStartIndex(currentColumnGroupStart)?.columnGroup).toEqual(
                    rebuiltViewModel.getColumnGroupByStartIndex(currentColumnGroupStart)?.columnGroup
                );
                for (let index = 0; index < currentBody.dataStream.length; index++) {
                    expect(incrementalViewModel.getParagraph(index)).toEqual(rebuiltViewModel.getParagraph(index));
                    expect(incrementalViewModel.getSectionBreak(index)).toEqual(rebuiltViewModel.getSectionBreak(index));
                    expect(incrementalViewModel.getTextRun(index)).toEqual(rebuiltViewModel.getTextRun(index));
                }
                rebuiltViewModel.dispose();
            }

            incrementalViewModel.dispose();
            model.dispose();
        });

        it('matches a fresh Main view model for disjoint edits and falls back across paragraph boundaries', () => {
            const T = DataStreamTreeTokenType;
            const dataStream = `Alpha${T.PARAGRAPH}Beta${T.PARAGRAPH}${T.SECTION_BREAK}`;
            const model = new DocumentDataModel({
                id: 'incremental-disjoint-document',
                body: {
                    dataStream,
                    paragraphs: [
                        { startIndex: dataStream.indexOf(T.PARAGRAPH), paragraphId: 'incremental-disjoint-first' },
                        { startIndex: dataStream.lastIndexOf(T.PARAGRAPH), paragraphId: 'incremental-disjoint-second' },
                    ],
                    sectionBreaks: [{
                        startIndex: dataStream.length - 1,
                        sectionId: 'incremental-disjoint-section',
                    }],
                },
                documentStyle: {},
            });
            const incrementalViewModel = new DocumentViewModel(model);
            const disjointTextX = new TextX();
            disjointTextX.push({ t: TextXActionType.RETAIN, len: 2 });
            disjointTextX.push({ t: TextXActionType.INSERT, len: 1, body: { dataStream: 'X' } });
            disjointTextX.push({ t: TextXActionType.RETAIN, len: 6 });
            disjointTextX.push({ t: TextXActionType.INSERT, len: 1, body: { dataStream: 'Y' } });
            const disjointActions = JSONX.getInstance().editOp(disjointTextX.serialize(), ['body']);
            model.apply(disjointActions);
            expect(incrementalViewModel.resetByValidatedTextMutation(model, disjointActions)).toBe(true);

            const rebuiltAfterDisjoint = new DocumentViewModel(model);
            expect(incrementalViewModel.getChildren().map(snapshotTreeNode)).toEqual(
                rebuiltAfterDisjoint.getChildren().map(snapshotTreeNode)
            );
            rebuiltAfterDisjoint.dispose();

            const currentDataStream = model.getBody()?.dataStream;
            if (currentDataStream == null) {
                throw new Error('Expected the disjoint document body');
            }
            const paragraphBoundary = currentDataStream.indexOf(T.PARAGRAPH);
            const crossingActions = createPlainTextActions(paragraphBoundary - 1, 3, 'Z');
            model.apply(crossingActions);
            expect(incrementalViewModel.resetByValidatedTextMutation(model, crossingActions)).toBe(false);
            incrementalViewModel.reset(model);

            const rebuiltAfterFallback = new DocumentViewModel(model);
            expect(incrementalViewModel.getChildren().map(snapshotTreeNode)).toEqual(
                rebuiltAfterFallback.getChildren().map(snapshotTreeNode)
            );
            rebuiltAfterFallback.dispose();
            incrementalViewModel.dispose();
            model.dispose();
        });

        it('resolves shifted paragraph metadata without rebuilding whole-document caches', () => {
            const model = createDocumentDataModel({
                body: {
                    dataStream: `A${DataStreamTreeTokenType.PARAGRAPH}B${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`,
                    paragraphs: [
                        { startIndex: 0, paragraphId: 'first' },
                        { startIndex: 2, paragraphId: 'second' },
                    ],
                    sectionBreaks: [{ sectionId: 'section', startIndex: 4 }],
                },
            });
            const viewModel = new DocumentViewModel(model);
            const insertTextX = new TextX();
            insertTextX.push({ t: TextXActionType.RETAIN, len: 1 });
            insertTextX.push({
                t: TextXActionType.INSERT,
                len: 1,
                body: { dataStream: 'X' },
            });
            const actions = JSONX.getInstance().editOp(insertTextX.serialize(), ['body']);
            const body = model.getBody();
            body.dataStream = `AX${DataStreamTreeTokenType.PARAGRAPH}B${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
            body.paragraphs = [
                { startIndex: 0, paragraphId: 'first' },
                { startIndex: 3, paragraphId: 'second' },
            ];
            body.sectionBreaks = [{ sectionId: 'section', startIndex: 5 }];

            expect(viewModel.resetByValidatedTextMutation(model, actions)).toBe(true);
            expect(viewModel.getParagraph(3)?.paragraphId).toBe('second');
            expect(viewModel.getParagraph(2)).toBeUndefined();
            expect(viewModel.getSectionBreak(5)?.sectionId).toBe('section');
        });

        it('indexes long and overlapping text runs by range buckets', () => {
            const content = 'A'.repeat(2005);
            const model = createDocumentDataModel({
                body: {
                    dataStream: `${content}${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`,
                    textRuns: [
                        { st: 0, ed: content.length, ts: { fs: 10 } },
                        { st: 995, ed: 1005, ts: { fs: 20 } },
                        { st: 1500, ed: 1500, ts: { fs: 30 } },
                    ],
                },
            });

            const viewModel = new DocumentViewModel(model);
            expect(viewModel.getTextRun(0)?.ts?.fs).toBe(10);
            expect(viewModel.getTextRun(994)?.ts?.fs).toBe(10);
            expect(viewModel.getTextRun(995)?.ts?.fs).toBe(20);
            expect(viewModel.getTextRun(1004)?.ts?.fs).toBe(20);
            expect(viewModel.getTextRun(1005)?.ts?.fs).toBe(10);
            expect(viewModel.getTextRun(2004)?.ts?.fs).toBe(10);
            expect(viewModel.getTextRun(2005)).toBeUndefined();
        });

        it('covers cache/interceptor/reset/header-footer flows', () => {
            const headerModel = createDocumentDataModel({
                body: {
                    dataStream: `${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`,
                },
            });
            const footerModel = createDocumentDataModel({
                body: {
                    dataStream: `${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`,
                },
            });

            const bodyStream = `X${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
            const model = createDocumentDataModel({
                body: {
                    dataStream: bodyStream,
                    textRuns: [{ st: 0, ed: 2, ts: {} }],
                    paragraphs: [{ startIndex: 0, paragraphId: 'para_view_model_header' }],
                    sectionBreaks: [{ sectionId: 'section_fixture_1001', startIndex: 2 }],
                    customBlocks: [{ startIndex: 1, blockId: 'b1' }],
                    customRanges: [{ startIndex: 0, endIndex: 1, rangeId: 'r1' }],
                    customDecorations: [{ startIndex: 1, endIndex: 2, id: 'd1' }],
                    tables: [{ tableId: 't1', startIndex: 3, endIndex: 5 }],
                },
                snapshot: {
                    tableSource: {
                        t1: { id: 'source-1' },
                    },
                },
                headerModelMap: new Map([['h1', headerModel]]),
                footerModelMap: new Map([['f1', footerModel]]),
            });

            const viewModel = new DocumentViewModel(model);
            expect(viewModel.getBody()).toEqual(model.getBody());
            expect(viewModel.getSnapshot()).toEqual(model.getSnapshot());
            expect(viewModel.getDataModel()).toBe(model);
            expect(viewModel.getChildren().length).toBe(1);
            expect(viewModel.getParagraph(0)?.startIndex).toBe(0);
            expect(viewModel.getSectionBreak(2)?.startIndex).toBe(2);
            expect(viewModel.getTextRun(0)?.st).toBe(0);
            expect(viewModel.getCustomBlock(1)?.startIndex).toBe(1);
            expect(viewModel.getCustomBlockWithoutSetCurrentIndex(1)?.startIndex).toBe(1);
            expect(viewModel.getCustomRangeRaw(1)?.rangeId).toBe('r1');
            expect(viewModel.getCustomDecorationRaw(1)?.id).toBe('d1');
            expect(viewModel.getTableByStartIndex(3)?.tableSource).toEqual({ id: 'source-1' });

            const byHeader = viewModel.getSelfOrHeaderFooterViewModel('h1');
            const byFooter = viewModel.getSelfOrHeaderFooterViewModel('f1');
            expect(byHeader).not.toBe(viewModel);
            expect(byFooter).not.toBe(viewModel);
            expect(viewModel.getSelfOrHeaderFooterViewModel('unknown')).toBe(viewModel);

            const editAreaEvents: DocumentEditArea[] = [];
            viewModel.editAreaChange$.subscribe((v) => {
                if (v) editAreaEvents.push(v);
            });
            viewModel.setEditArea(DocumentEditArea.HEADER);
            viewModel.setEditArea(DocumentEditArea.HEADER);
            viewModel.setEditArea(DocumentEditArea.FOOTER);
            expect(editAreaEvents).toEqual([DocumentEditArea.HEADER, DocumentEditArea.FOOTER]);
            expect(viewModel.getEditArea()).toBe(DocumentEditArea.FOOTER);

            const interceptor = {
                getCustomRange: vi.fn(() => ({ startIndex: 9, endIndex: 9, rangeId: 'ir' })),
                getCustomDecoration: vi.fn(() => ({ startIndex: 8, endIndex: 8, id: 'id' })),
            };
            const disposable = viewModel.registerCustomRangeInterceptor(interceptor as any);
            expect(viewModel.getCustomRange(0)?.rangeId).toBe('ir');
            expect(viewModel.getCustomDecoration(0)?.id).toBe('id');
            disposable.dispose();
            expect(viewModel.getCustomRange(0)?.rangeId).toBe('r1');

            const newModel = createDocumentDataModel({
                body: {
                    dataStream: `Z${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`,
                    textRuns: [{ st: 0, ed: 1, ts: { fs: 14 } }],
                    paragraphs: [{ startIndex: 0, paragraphId: 'para_view_model_footer' }],
                    sectionBreaks: [{ sectionId: 'section_fixture_1002', startIndex: 1 }],
                    customBlocks: [],
                    customRanges: [],
                    customDecorations: [],
                    tables: [],
                },
                snapshot: { tableSource: {} },
            });
            viewModel.reset(newModel);
            expect(viewModel.getDataModel()).toBe(newModel);
            expect(viewModel.getTextRun(0)?.ed).toBe(1);
            expect(viewModel.getSectionBreak(2)).toBeUndefined();
            expect(viewModel.getCustomBlock(1)).toBeUndefined();
            expect(viewModel.getTableByStartIndex(3)).toBeUndefined();

            expect(viewModel.findTableNodeById('not-exists')).toBeUndefined();
            const maps = viewModel.getHeaderFooterTreeMap();
            expect(maps.headerTreeMap.size).toBeGreaterThan(0);
            expect(maps.footerTreeMap.size).toBeGreaterThan(0);

            viewModel.dispose();
            expect(viewModel.getChildren().length).toBeGreaterThanOrEqual(0);
        });

        it('handles missing body and null arrays safely', () => {
            const emptyModel = {
                getBody: vi.fn(() => null),
                getSnapshot: vi.fn(() => ({ tableSource: {} })),
                headerModelMap: new Map(),
                footerModelMap: new Map(),
            } as any;

            const vm = new DocumentViewModel(emptyModel);
            expect(vm.getChildren()).toEqual([]);
            expect(vm.getParagraph(0)).toBeUndefined();
            expect(vm.getSectionBreak(0)).toBeUndefined();
            expect(vm.getTextRun(0)).toBeUndefined();
            expect(() => vm.getCustomRangeRaw(0)).toThrow();
            expect(() => vm.getCustomDecorationRaw(0)).toThrow();
            expect(() => vm.getCustomBlockWithoutSetCurrentIndex(0)).toThrow();
            vm.dispose();
        });

        it('uses root table source when building header and footer table caches', () => {
            const tableDataStream = `${DataStreamTreeTokenType.TABLE_START}${DataStreamTreeTokenType.TABLE_ROW_START}${DataStreamTreeTokenType.TABLE_CELL_START}H${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}${DataStreamTreeTokenType.TABLE_CELL_END}${DataStreamTreeTokenType.TABLE_ROW_END}${DataStreamTreeTokenType.TABLE_END}`;
            const headerModel = createDocumentDataModel({
                body: {
                    dataStream: `${tableDataStream}${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`,
                    tables: [{ tableId: 'header-table', startIndex: 0, endIndex: tableDataStream.length }],
                },
            });
            const tableSource = { tableId: 'header-table' };
            const model = createDocumentDataModel({
                snapshot: {
                    tableSource: {
                        'header-table': tableSource,
                    },
                },
                headerModelMap: new Map([['h1', headerModel]]),
            });

            const viewModel = new DocumentViewModel(model);
            const headerViewModel = viewModel.getSelfOrHeaderFooterViewModel('h1');

            expect(headerViewModel.getTableByStartIndex(0)?.tableSource).toBe(tableSource);
        });

        it('prefers a segment table source when its id also exists in the document body', () => {
            const tableDataStream = `${DataStreamTreeTokenType.TABLE_START}${DataStreamTreeTokenType.TABLE_ROW_START}${DataStreamTreeTokenType.TABLE_CELL_START}F${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}${DataStreamTreeTokenType.TABLE_CELL_END}${DataStreamTreeTokenType.TABLE_ROW_END}${DataStreamTreeTokenType.TABLE_END}`;
            const footerTableSource = { tableId: 'table-1', tableRows: [{ tableCells: [{ margin: {} }] }] };
            const footerModel = createDocumentDataModel({
                body: {
                    dataStream: `${tableDataStream}${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`,
                    tables: [{ tableId: 'table-1', startIndex: 0, endIndex: tableDataStream.length }],
                },
                snapshot: {
                    tableSource: {
                        'table-1': footerTableSource,
                    },
                },
            });
            const bodyTableSource = { tableId: 'table-1', tableRows: [{ tableCells: [] }] };
            const model = createDocumentDataModel({
                snapshot: {
                    tableSource: {
                        'table-1': bodyTableSource,
                    },
                },
                footerModelMap: new Map([['f1', footerModel]]),
            });

            const viewModel = new DocumentViewModel(model);
            const footerViewModel = viewModel.getSelfOrHeaderFooterViewModel('f1');

            expect(footerViewModel.getTableByStartIndex(0)?.tableSource).toBe(footerTableSource);
        });
    });
});
