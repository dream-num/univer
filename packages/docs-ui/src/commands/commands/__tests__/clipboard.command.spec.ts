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

import type { ICommand, ICommandInfo, IDisposable, IDocumentData, Injector, IStyleBase, JSONXActions, Univer } from '@univerjs/core';
import type { IRectRangeWithStyle, ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IDocClipboardHook } from '../../../services/clipboard/clipboard.service';
import type { IInnerCutCommandParams, IInnerPasteCommandParams } from '../clipboard.inner.command';
import {
    BooleanNumber,
    CustomDecorationType,
    CustomRangeType,
    DataStreamTreeTokenType,
    DOC_RANGE_TYPE,
    DocumentBlockRangeType,
    DocumentDataModel,
    DrawingTypeEnum,
    EDITOR_ACTIVATED,
    FOCUSING_DOC,
    ICommandService,
    IContextService,
    IUniverInstanceService,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    RedoCommand,
    SliceBodyType,
    Tools,
    UndoCommand,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation, SetTextSelectionsOperation } from '@univerjs/docs';
import { IClipboardInterfaceService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IDocClipboardService } from '../../../services/clipboard/clipboard.service';
import {
    DocCopyCommand,
    DocCopyCurrentParagraphCommand,
    DocCutCommand,
    DocCutCurrentParagraphCommand,
    DocPasteCommand,
    whenDocOrEditor,
    whenFocusEditor,
} from '../clipboard.command';
import { CutContentCommand, InnerPasteCommand } from '../clipboard.inner.command';
import { genEmptyTable, genTableSource } from '../table/table';
import { createCommandTestBed } from './create-command-test-bed';

class TestDocClipboardService {
    readonly copies: Array<{ sliceType?: SliceBodyType; ranges?: ITextRangeWithStyle[] }> = [];
    readonly cuts: Array<{ ranges?: ITextRangeWithStyle[] }> = [];
    readonly pastes: ClipboardItem[][] = [];
    memoryPasteResult = false;
    memoryPastes = 0;

    async copy(sliceType?: SliceBodyType, ranges?: ITextRangeWithStyle[]): Promise<boolean> {
        this.copies.push({ sliceType, ranges });
        return true;
    }

    async cut(ranges?: ITextRangeWithStyle[]): Promise<boolean> {
        this.cuts.push({ ranges });
        return true;
    }

    async paste(items?: ClipboardItem[]): Promise<boolean> {
        if (!items?.length) {
            this.memoryPastes++;
            return this.memoryPasteResult;
        }

        this.pastes.push(items);
        return true;
    }

    async legacyPaste(): Promise<boolean> {
        return false;
    }

    addClipboardHook(_hook: IDocClipboardHook): IDisposable {
        return { dispose() {} };
    }
}

class TestClipboardInterfaceService {
    items: ClipboardItem[] = [{ types: ['text/plain'] } as unknown as ClipboardItem];
    supported = true;
    reads = 0;

    get supportClipboard(): boolean {
        return this.supported;
    }

    async writeText(): Promise<void> {}
    async write(): Promise<void> {}
    async readText(): Promise<string> { return ''; }
    async read(): Promise<ClipboardItem[]> {
        this.reads++;
        return this.items;
    }
}

function getDocumentData() {
    const TEST_DOCUMENT_DATA_EN: IDocumentData = {
        id: 'test-doc',
        body: {
            dataStream: 'What’s New in the 2022\r Gartner Hype Cycle for Emerging Technologies\r\n',
            textRuns: [
                {
                    st: 0,
                    ed: 22,
                    ts: {
                        bl: BooleanNumber.FALSE,
                        fs: 24,
                        cl: {
                            rgb: 'rgb(0, 40, 86)',
                        },
                    },
                },
                {
                    st: 23,
                    ed: 68,
                    ts: {
                        bl: BooleanNumber.TRUE,
                        fs: 24,
                        cl: {
                            rgb: 'rgb(0, 40, 86)',
                        },
                    },
                },
            ],
            paragraphs: [
                { paragraphId: 'para_docs_ui_fixture_2', startIndex: 22 },
                { paragraphId: 'para_docs_ui_fixture_3', startIndex: 68, paragraphStyle: {
                    spaceAbove: { v: 20 },
                    indentFirstLine: { v: 20 },
                } },
            ],
            sectionBreaks: [],
            customBlocks: [],
        },
        documentStyle: {
            pageSize: {
                width: 594.3,
                height: 840.51,
            },
            marginTop: 72,
            marginBottom: 72,
            marginRight: 90,
            marginLeft: 90,
        },
        tableSource: {},
        drawings: {},
        drawingsOrder: [],
    };

    return TEST_DOCUMENT_DATA_EN;
}

describe('test cases in clipboard', () => {
    let univer: Univer;
    let get: Injector['get'];
    let injector: Injector;
    let commandService: ICommandService;

    function getDocumentModel() {
        const univerInstanceService = get(IUniverInstanceService);
        return univerInstanceService.getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC);
    }

    function getDocumentSnapshot() {
        return getDocumentModel()?.getSnapshot();
    }

    function getRequiredDocumentSnapshot(): IDocumentData {
        const snapshot = getDocumentSnapshot();
        if (!snapshot) {
            throw new Error('Document snapshot not found');
        }
        return snapshot;
    }

    function registerInnerClipboardCommands() {
        commandService.registerCommand(InnerPasteCommand);
        commandService.registerCommand(CutContentCommand);
        commandService.registerCommand(SetTextSelectionsOperation);
        commandService.registerCommand(RichTextEditingMutation as unknown as ICommand);
    }

    function addDefaultSelections() {
        const selectionManager = get(DocSelectionManagerService);

        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: 'test-doc',
            subUnitId: '',
        });

        selectionManager.__TEST_ONLY_add([
            {
                startOffset: 0,
                endOffset: 5,
                collapsed: false,
            },
        ]);

        selectionManager.__TEST_ONLY_add([
            {
                startOffset: 10,
                endOffset: 15,
                collapsed: false,
            },
        ]);
    }

    function setupDocument(docData = getDocumentData()) {
        const testBed = createCommandTestBed(docData);
        univer = testBed.univer;
        get = testBed.get;
        injector = testBed.injector;

        commandService = get(ICommandService);
        registerInnerClipboardCommands();
        addDefaultSelections();
    }

    function replaceDocument(docData: IDocumentData) {
        univer.dispose();
        setupDocument(docData);
    }

    function createTableDocumentData(): IDocumentData {
        const tableData = genEmptyTable(2, 2);
        const tableSource = genTableSource(2, 2, 360);
        const prefix = 'Head\r';
        const tableOffset = prefix.length;
        const dataStream = `${prefix}${tableData.dataStream}Tail\r\n`;

        return {
            id: 'test-doc',
            body: {
                dataStream,
                textRuns: [{ st: 0, ed: dataStream.length - 2, ts: {} }],
                paragraphs: [
                    { paragraphId: 'para_docs_ui_clipboard_table_head', startIndex: prefix.length - 1 },
                    ...tableData.paragraphs.map((paragraph) => ({
                        ...paragraph,
                        startIndex: paragraph.startIndex + tableOffset,
                    })),
                    { paragraphId: 'para_docs_ui_clipboard_table_tail', startIndex: dataStream.length - 2 },
                ],
                sectionBreaks: [
                    ...tableData.sectionBreaks.map((sectionBreak) => ({
                        ...sectionBreak,
                        startIndex: sectionBreak.startIndex + tableOffset,
                    })),
                    { sectionId: 'section_fixture_203', startIndex: dataStream.length - 1 },
                ],
                tables: [{
                    startIndex: tableOffset,
                    endIndex: tableOffset + tableData.dataStream.length,
                    tableId: 'table-1',
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
                'table-1': {
                    ...tableSource,
                    tableId: 'table-1',
                },
            },
        };
    }

    function createCustomBlockDocumentData(): IDocumentData {
        const dataStream = `${DataStreamTreeTokenType.CUSTOM_BLOCK}\rBody\r\n`;

        return {
            id: 'test-doc',
            body: {
                dataStream,
                textRuns: [{ st: 0, ed: dataStream.length - 2, ts: {} }],
                paragraphs: [
                    { paragraphId: 'para_docs_ui_clipboard_block', startIndex: 1 },
                    { paragraphId: 'para_docs_ui_clipboard_block_tail', startIndex: dataStream.length - 2 },
                ],
                sectionBreaks: [{ sectionId: 'section_fixture_204', startIndex: dataStream.length - 1 }],
                customBlocks: [{ blockId: 'drawing-1', startIndex: 0 }],
            },
            drawings: {
                'drawing-1': { drawingId: 'drawing-1' } as never,
            },
            drawingsOrder: ['drawing-1'],
            documentStyle: {
                pageSize: { width: 540, height: 720 },
                marginTop: 72,
                marginBottom: 72,
                marginRight: 90,
                marginLeft: 90,
            },
        };
    }

    function getTableRowRanges(documentData: IDocumentData): Array<{ startOffset: number; endOffset: number }> {
        const body = documentData.body;
        const table = body?.tables?.[0];
        if (!body || !table) {
            throw new Error('Table body not found');
        }

        const ranges: Array<{ startOffset: number; endOffset: number }> = [];
        let rowStart = -1;
        for (let offset = table.startIndex; offset < table.endIndex; offset++) {
            if (body.dataStream[offset] === DataStreamTreeTokenType.TABLE_ROW_START) {
                rowStart = offset;
            } else if (body.dataStream[offset] === DataStreamTreeTokenType.TABLE_ROW_END && rowStart >= 0) {
                ranges.push({ startOffset: rowStart, endOffset: offset });
                rowStart = -1;
            }
        }

        return ranges;
    }

    function createStructuralDocumentData(includeListParagraph = false): IDocumentData {
        const T = DataStreamTreeTokenType;
        const dataStream = `P${T.PARAGRAPH}${T.BLOCK_START}A${T.PARAGRAPH}B${T.PARAGRAPH}${T.BLOCK_END}M${T.PARAGRAPH}${T.COLUMN_GROUP_START}${T.COLUMN_START}C${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_START}${T.CUSTOM_BLOCK}D${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}Z${T.PARAGRAPH}${T.SECTION_BREAK}`;

        return {
            id: 'test-doc',
            body: {
                dataStream,
                paragraphs: [
                    {
                        paragraphId: 'root-before',
                        startIndex: 1,
                        bullet: includeListParagraph
                            ? { listId: 'list-1', listType: 'BULLET_LIST', nestingLevel: 0 }
                            : undefined,
                    },
                    { paragraphId: 'block-first', startIndex: 4 },
                    { paragraphId: 'block-second', startIndex: 6 },
                    { paragraphId: 'root-middle', startIndex: 9 },
                    { paragraphId: 'column-first', startIndex: 13 },
                    { paragraphId: 'column-second', startIndex: 18 },
                    { paragraphId: 'root-after', startIndex: 22 },
                ],
                sectionBreaks: [{ sectionId: 'structural-section', startIndex: 23 }],
                blockRanges: [{
                    blockId: 'structural-block',
                    blockType: DocumentBlockRangeType.CALLOUT,
                    startIndex: 2,
                    endIndex: 7,
                }],
                columnGroups: [{ columnGroupId: 'structural-columns', startIndex: 10, endIndex: 20 }],
                customRanges: [{
                    rangeId: 'structural-custom-range',
                    rangeType: CustomRangeType.CUSTOM,
                    startIndex: 3,
                    endIndex: 5,
                }],
                customBlocks: [{ blockId: 'structural-drawing', startIndex: 16 }],
                customDecorations: [],
            },
            drawings: {
                'structural-drawing': {
                    drawingId: 'structural-drawing',
                    drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                    unitId: 'test-doc',
                    subUnitId: '',
                    layoutType: PositionedObjectLayoutType.INLINE,
                    docTransform: {
                        size: { width: 10, height: 10 },
                        positionH: { relativeFrom: ObjectRelativeFromH.CHARACTER, posOffset: 0 },
                        positionV: { relativeFrom: ObjectRelativeFromV.LINE, posOffset: 0 },
                        angle: 0,
                    },
                },
            },
            drawingsOrder: ['structural-drawing'],
            documentStyle: {
                pageSize: { width: 540, height: 720 },
                marginTop: 72,
                marginBottom: 72,
                marginRight: 90,
                marginLeft: 90,
            },
        };
    }

    function createTerminalColumnGroupDocumentData(includeCollapsedDuplicate = false): IDocumentData {
        const T = DataStreamTreeTokenType;
        const dataStream = `${T.COLUMN_GROUP_START}${T.COLUMN_START}A${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_START}B${T.PARAGRAPH}${T.COLUMN_END}${T.COLUMN_GROUP_END}${T.SECTION_BREAK}`;
        const columnGroup = {
            columnGroupId: 'terminal-columns',
            startIndex: 0,
            endIndex: 9,
            columns: [
                { columnId: 'terminal-column-1', widthRatio: 1 },
                { columnId: 'terminal-column-2', widthRatio: 1 },
            ],
        };

        return {
            id: 'test-doc',
            body: {
                dataStream,
                paragraphs: [
                    { paragraphId: 'terminal-column-first', startIndex: 3 },
                    { paragraphId: 'terminal-column-second', startIndex: 7 },
                ],
                sectionBreaks: [{ sectionId: 'terminal-column-section', startIndex: 10 }],
                columnGroups: includeCollapsedDuplicate
                    ? [columnGroup, { ...columnGroup, startIndex: 9, endIndex: 9 }]
                    : [columnGroup],
            },
            documentStyle: {
                pageSize: { width: 540, height: 720 },
                marginTop: 72,
                marginBottom: 72,
                marginRight: 90,
                marginLeft: 90,
            },
        };
    }

    function expectStructuralSnapshotRestored(actual: IDocumentData | null | undefined, expected: IDocumentData): void {
        expect(actual?.body?.dataStream).toBe(expected.body?.dataStream);
        expect(actual?.body?.paragraphs).toEqual(expected.body?.paragraphs);
        expect(actual?.body?.sectionBreaks).toEqual(expected.body?.sectionBreaks);
        expect(actual?.body?.blockRanges ?? []).toEqual(expected.body?.blockRanges ?? []);
        expect(actual?.body?.columnGroups ?? []).toEqual(expected.body?.columnGroups ?? []);
        expect(actual?.body?.customRanges ?? []).toEqual(expected.body?.customRanges ?? []);
        expect(actual?.body?.customBlocks ?? []).toEqual(expected.body?.customBlocks ?? []);
        expect(actual?.body?.tables ?? []).toEqual(expected.body?.tables ?? []);
        expect(actual?.drawings ?? {}).toEqual(expected.drawings ?? {});
        expect(actual?.drawingsOrder ?? []).toEqual(expected.drawingsOrder ?? []);
        expect(actual?.tableSource ?? {}).toEqual(expected.tableSource ?? {});
    }

    function getCollabActions(command: Readonly<ICommandInfo>): JSONXActions | null {
        if (command.id !== RichTextEditingMutation.id || command.params == null || !('actions' in command.params)) {
            return null;
        }

        return Array.isArray(command.params.actions) ? command.params.actions : null;
    }

    function createAnnotatedDocumentData(): IDocumentData {
        const documentData = getDocumentData();
        documentData.body!.customRanges = [{
            startIndex: 0,
            endIndex: 6,
            rangeId: 'range-1',
            rangeType: 0,
        }];
        documentData.body!.customDecorations = [{
            startIndex: 0,
            endIndex: 6,
            id: 'decoration-1',
            type: CustomDecorationType.COMMENT,
        }];

        return documentData;
    }

    function getTableClipboardDoc(): Partial<IDocumentData> {
        const tableData = genEmptyTable(1, 1);
        const tableSource = genTableSource(1, 1, 360);

        return {
            body: {
                ...tableData,
                tables: [{
                    startIndex: 0,
                    endIndex: tableData.dataStream.length,
                    tableId: 'clip-table',
                }],
            },
            tableSource: {
                'clip-table': {
                    ...tableSource,
                    tableId: 'clip-table',
                },
            },
        };
    }

    function getFormatValueAt(key: keyof IStyleBase, pos: number) {
        const docsModel = getDocumentModel();

        if (docsModel?.getBody()?.textRuns == null) {
            return;
        }

        for (const textRun of docsModel.getBody()?.textRuns ?? []) {
            const { st, ed, ts = {} } = textRun;

            if (st <= pos && ed >= pos) {
                return ts[key];
            }
        }
    }

    function getTextByPosition(start: number, end: number) {
        const docsModel = getDocumentModel();

        return docsModel?.getBody()?.dataStream.slice(start, end);
    }

    beforeEach(() => {
        setupDocument();
    });

    afterEach(() => univer.dispose());

    describe('Test paste in multiple ranges', () => {
        it('Should paste content to each selection ranges', async () => {
            expect(getTextByPosition(0, 5)).toBe('What’');
            expect(getFormatValueAt('bl', 0)).toBe(BooleanNumber.FALSE);

            const commandParams: IInnerPasteCommandParams = {
                segmentId: '',
                doc: {
                    body: {
                        dataStream: 'univer',
                        textRuns: [
                            {
                                st: 0,
                                ed: 6,
                                ts: {
                                    bl: BooleanNumber.TRUE,
                                },
                            },
                        ],
                    },
                },
                textRanges: [], // only used to eliminate TS type check error.
            };

            await commandService.executeCommand(InnerPasteCommand.id, commandParams);

            expect(getTextByPosition(0, 6)).toBe('univer');
            expect(getTextByPosition(11, 17)).toBe('univer');
            expect(getFormatValueAt('bl', 0)).toBe(BooleanNumber.TRUE);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        });

        it('creates independent Custom Range ids for every pasted selection', async () => {
            const sourceRange = {
                startIndex: 0,
                endIndex: 0,
                rangeId: 'source-range',
                rangeType: CustomRangeType.CUSTOM,
                wholeEntity: true,
            };
            const initialTargetRange = {
                ...sourceRange,
                rangeId: 'initial-target-range',
            };

            await commandService.executeCommand(InnerPasteCommand.id, {
                segmentId: '',
                doc: {
                    body: {
                        dataStream: 'x',
                        customRanges: [initialTargetRange],
                    },
                },
                customRangeMappings: [{
                    sourceRange,
                    targetRange: initialTargetRange,
                }],
                textRanges: [],
            } satisfies IInnerPasteCommandParams);

            const pastedRangeIds = getDocumentSnapshot()?.body?.customRanges?.map((range) => range.rangeId) ?? [];
            expect(pastedRangeIds).toHaveLength(2);
            expect(new Set(pastedRangeIds).size).toBe(2);
            expect(pastedRangeIds).not.toContain(sourceRange.rangeId);
            expect(pastedRangeIds).not.toContain(initialTargetRange.rangeId);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        });

        it('Should insert pasted content at a collapsed cursor without deleting nearby text', async () => {
            const selectionManager = get(DocSelectionManagerService);
            selectionManager.__TEST_ONLY_add([{
                startOffset: 20,
                endOffset: 20,
                collapsed: true,
                isActive: true,
                segmentId: '',
                style: null as never,
            }]);

            await commandService.executeCommand(InnerPasteCommand.id, {
                segmentId: '',
                doc: {
                    body: {
                        dataStream: 'cursor-paste',
                        textRuns: [{ st: 0, ed: 12, ts: { bl: BooleanNumber.TRUE } }],
                    },
                },
                textRanges: [],
            } satisfies IInnerPasteCommandParams);

            expect(getDocumentSnapshot()?.body?.dataStream.includes('cursor-paste')).toBe(true);
            expect(getDocumentSnapshot()?.body?.dataStream.includes('Gartner')).toBe(true);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        });

        it('Should inherit custom range and decoration metadata at the paste position', async () => {
            replaceDocument(createAnnotatedDocumentData());

            await commandService.executeCommand(InnerPasteCommand.id, {
                segmentId: '',
                doc: {
                    body: {
                        dataStream: 'note',
                        textRuns: [{ st: 0, ed: 4, ts: { bl: BooleanNumber.TRUE } }],
                    },
                },
                textRanges: [],
            } satisfies IInnerPasteCommandParams);

            const body = getDocumentSnapshot()?.body;

            expect(body?.dataStream.startsWith('note')).toBe(true);
            expect(body?.customRanges?.some((range) => range.rangeId === 'range-1')).toBe(true);
            expect(body?.customDecorations?.some((decoration) => decoration.id === 'decoration-1')).toBe(true);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        });

        it('Should paste a copied table with fresh table ids into document selections', async () => {
            const commandParams: IInnerPasteCommandParams = {
                segmentId: '',
                doc: getTableClipboardDoc(),
                textRanges: [],
            };

            await commandService.executeCommand(InnerPasteCommand.id, commandParams);

            const snapshot = getDocumentSnapshot();
            const tableIds = Object.keys(snapshot?.tableSource ?? {});

            expect(tableIds).toHaveLength(2);
            expect(tableIds).not.toContain('clip-table');
            expect(snapshot?.body?.dataStream.includes(DataStreamTreeTokenType.TABLE_START)).toBe(true);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        });

        it('Should reject table paste into header or footer segments', async () => {
            const beforeDataStream = getDocumentSnapshot()?.body?.dataStream;

            const result = await commandService.executeCommand(InnerPasteCommand.id, {
                segmentId: 'header-1',
                doc: getTableClipboardDoc(),
                textRanges: [],
            } satisfies IInnerPasteCommandParams);

            expect(result).toBe(false);
            expect(getDocumentSnapshot()?.body?.dataStream).toBe(beforeDataStream);
        });

        it('Should reject table paste when the active document selection is inside a table cell', async () => {
            const selectionManager = get(DocSelectionManagerService);
            selectionManager.__TEST_ONLY_add([{
                startOffset: 1,
                endOffset: 1,
                collapsed: true,
                startNodePosition: { path: ['body', 'tables', '0', 'cells', '0'] } as never,
            }]);
            const beforeDataStream = getDocumentSnapshot()?.body?.dataStream;

            const result = await commandService.executeCommand(InnerPasteCommand.id, {
                segmentId: '',
                doc: getTableClipboardDoc(),
                textRanges: [],
            } satisfies IInnerPasteCommandParams);

            expect(result).toBe(false);
            expect(getDocumentSnapshot()?.body?.dataStream).toBe(beforeDataStream);
        });

        it('Should paste custom block drawings with new ids for internal clipboard content', async () => {
            const blockDataStream = `${DataStreamTreeTokenType.CUSTOM_BLOCK}\r`;
            const commandParams: IInnerPasteCommandParams = {
                segmentId: '',
                doc: {
                    body: {
                        dataStream: blockDataStream,
                        paragraphs: [{ paragraphId: 'para_docs_ui_clipboard_pasted_block', startIndex: 1 }],
                        sectionBreaks: [],
                        customBlocks: [{ blockId: 'clip-drawing', startIndex: 0 }],
                    },
                    drawings: {
                        'clip-drawing': { drawingId: 'clip-drawing' } as never,
                    },
                },
                textRanges: [],
            };

            await commandService.executeCommand(InnerPasteCommand.id, commandParams);

            const snapshot = getDocumentSnapshot();
            const drawingIds = Object.keys(snapshot?.drawings ?? {});

            expect(snapshot?.drawingsOrder).toHaveLength(2);
            expect(snapshot?.drawingsOrder).not.toContain('clip-drawing');
            expect(drawingIds.sort()).toEqual([...(snapshot?.drawingsOrder ?? [])].sort());

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        });

        it('replaces a mixed whole-document table selection once and restores it through history', async () => {
            const originalData = createTableDocumentData();
            replaceDocument(originalData);
            const original = Tools.deepClone(getRequiredDocumentSnapshot());
            const body = original.body;
            const table = body?.tables?.[0];
            if (!body || !table) {
                throw new Error('Table not found');
            }

            const selectionManager = get(DocSelectionManagerService);
            const selectionInfo = selectionManager.getSelectionInfo();
            if (!selectionInfo) {
                throw new Error('Selection info not found');
            }
            const textRanges = [
                { startOffset: 0, endOffset: table.startIndex, collapsed: false, isActive: true, segmentId: '' },
                { startOffset: table.endIndex, endOffset: body.dataStream.length - 2, collapsed: false, segmentId: '' },
            ];
            const rectRange: IRectRangeWithStyle = {
                startOffset: table.startIndex,
                endOffset: table.endIndex - 1,
                collapsed: false,
                rangeType: DOC_RANGE_TYPE.RECT,
                tableId: table.tableId,
                startRow: 0,
                endRow: 1,
                startColumn: 0,
                endColumn: 1,
                spanEntireRow: true,
                spanEntireColumn: true,
                spanEntireTable: true,
            };
            selectionManager.__replaceTextRangesWithNoRefresh({
                ...selectionInfo,
                textRanges,
                rectRanges: [rectRange],
                options: { wholeDocument: true },
            }, { unitId: 'test-doc', subUnitId: '' });

            expect(await commandService.executeCommand(InnerPasteCommand.id, {
                segmentId: '',
                doc: { body: { dataStream: 'paste' } },
                textRanges: [],
            } satisfies IInnerPasteCommandParams)).toBe(true);

            const replaced = Tools.deepClone(getRequiredDocumentSnapshot());
            expect(replaced.body?.dataStream).toBe('paste\r\n');
            expect(replaced.body?.tables).toEqual([]);
            expect(replaced.tableSource ?? {}).toEqual({});

            expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
            expectStructuralSnapshotRestored(getDocumentSnapshot(), original);
            expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
            expect(getDocumentSnapshot()?.body).toEqual(expect.objectContaining({
                dataStream: 'paste\r\n',
                tables: [],
            }));
            expect(getDocumentSnapshot()?.tableSource ?? {}).toEqual({});
        });
    });

    describe('Test cut in multiple ranges', () => {
        it('Should cut content to each selection ranges', async () => {
            expect(getTextByPosition(0, 5)).toBe('What’');
            expect(getFormatValueAt('bl', 0)).toBe(BooleanNumber.FALSE);

            const commandParams: IInnerCutCommandParams = {
                segmentId: '',
                textRanges: [], // only used to eliminate TS type check error.
            };

            await commandService.executeCommand(CutContentCommand.id, commandParams);

            expect(getTextByPosition(0, 5)).toBe('s New');

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        });

        it('Should leave document unchanged when cut has no document ranges', async () => {
            const beforeDataStream = getDocumentSnapshot()?.body?.dataStream;

            const result = await commandService.executeCommand(CutContentCommand.id, {
                segmentId: '',
                textRanges: [],
                selections: [],
                rectRanges: [],
            } satisfies IInnerCutCommandParams);

            expect(result).toBe(false);
            expect(getDocumentSnapshot()?.body?.dataStream).toBe(beforeDataStream);
        });

        it('Should cut a custom block and remove its drawing payload from the document', async () => {
            replaceDocument(createCustomBlockDocumentData());

            await commandService.executeCommand(CutContentCommand.id, {
                segmentId: '',
                textRanges: [],
                selections: [{
                    startOffset: 0,
                    endOffset: 1,
                    collapsed: false,
                }],
                rectRanges: [],
            } satisfies IInnerCutCommandParams);

            const snapshot = getDocumentSnapshot();

            expect(snapshot?.body?.dataStream.startsWith(DataStreamTreeTokenType.CUSTOM_BLOCK)).toBe(false);
            expect(snapshot?.body?.customBlocks ?? []).toHaveLength(0);
            expect(snapshot?.drawings?.['drawing-1']).toBeUndefined();
            expect(snapshot?.drawingsOrder ?? []).toHaveLength(0);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
        });

        it('Should cut an entire selected table and remove the table source', async () => {
            replaceDocument(createTableDocumentData());
            const original = Tools.deepClone(getRequiredDocumentSnapshot());
            const body = original.body;
            const table = body?.tables?.[0];
            if (!body || !table) {
                throw new Error('Table not found');
            }
            let collabActions: JSONXActions = [];
            const collabListener = commandService.onMutationExecutedForCollab((command) => {
                const actions = getCollabActions(command);
                if (actions) {
                    collabActions = actions;
                }
            });
            const rectRange: IRectRangeWithStyle = {
                startOffset: table.startIndex,
                endOffset: table.endIndex - 1,
                collapsed: false,
                rangeType: DOC_RANGE_TYPE.RECT,
                tableId: 'table-1',
                startRow: 0,
                endRow: 1,
                startColumn: 0,
                endColumn: 1,
                spanEntireRow: true,
                spanEntireColumn: true,
                spanEntireTable: true,
            };

            await commandService.executeCommand(CutContentCommand.id, {
                segmentId: '',
                textRanges: [],
                selections: [],
                rectRanges: [rectRange],
            } satisfies IInnerCutCommandParams);

            const deleted = Tools.deepClone(getRequiredDocumentSnapshot());

            expect(deleted.body?.dataStream.includes(DataStreamTreeTokenType.TABLE_START)).toBe(false);
            expect(deleted.tableSource?.['table-1']).toBeUndefined();

            const remote = new DocumentDataModel(Tools.deepClone(original));
            remote.apply(collabActions);
            expect(remote.getSnapshot()).toEqual(deleted);
            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expectStructuralSnapshotRestored(getDocumentSnapshot(), original);
            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expectStructuralSnapshotRestored(getDocumentSnapshot(), deleted);
            collabListener.dispose();
        });

        it.each([
            ['upper half across its start boundary', 0, 'above'],
            ['lower half across its end boundary', 1, 'below'],
        ])('keeps the table balanced when deleting its %s and replays the mutation for collaboration', async (_name, rowIndex, position) => {
            replaceDocument(createTableDocumentData());
            const original = Tools.deepClone(getRequiredDocumentSnapshot());
            const body = original.body;
            const table = original.body?.tables?.[0];
            const rowRange = getTableRowRanges(original)[rowIndex];
            if (!body || !table || !rowRange) {
                throw new Error('Table row not found');
            }
            let collabActions: JSONXActions = [];
            const collabListener = commandService.onMutationExecutedForCollab((command) => {
                const actions = getCollabActions(command);
                if (actions) {
                    collabActions = actions;
                }
            });
            const rectRange: IRectRangeWithStyle = {
                ...rowRange,
                collapsed: false,
                rangeType: DOC_RANGE_TYPE.RECT,
                tableId: table.tableId,
                startRow: rowIndex,
                endRow: rowIndex,
                startColumn: 0,
                endColumn: 1,
                spanEntireRow: true,
                spanEntireColumn: false,
                spanEntireTable: false,
            };

            await commandService.executeCommand(CutContentCommand.id, {
                segmentId: '',
                textRanges: [],
                selections: position === 'above'
                    ? [{ startOffset: 0, endOffset: table.startIndex, collapsed: false }]
                    : [{ startOffset: table.endIndex, endOffset: body.dataStream.length - 2, collapsed: false }],
                rectRanges: [rectRange],
            } satisfies IInnerCutCommandParams);

            const deleted = Tools.deepClone(getRequiredDocumentSnapshot());
            expect(deleted.body?.tables).toHaveLength(1);
            expect(deleted.body?.dataStream).toContain(DataStreamTreeTokenType.TABLE_START);
            expect(deleted.body?.dataStream).toContain(DataStreamTreeTokenType.TABLE_END);
            expect(deleted.tableSource?.[table.tableId]?.tableRows).toHaveLength(1);

            const remote = new DocumentDataModel(Tools.deepClone(original));
            remote.apply(collabActions);
            expect(remote.getSnapshot()).toEqual(deleted);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expectStructuralSnapshotRestored(getDocumentSnapshot(), original);
            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expectStructuralSnapshotRestored(getDocumentSnapshot(), deleted);
            collabListener.dispose();
        });

        it.each(['above', 'below'])('keeps the table intact when deleting content immediately %s it', async (position) => {
            replaceDocument(createTableDocumentData());
            const original = Tools.deepClone(getRequiredDocumentSnapshot());
            const body = original.body;
            const table = body?.tables?.[0];
            if (!body || !table) {
                throw new Error('Table not found');
            }
            const selection = position === 'above'
                ? { startOffset: 0, endOffset: table.startIndex, collapsed: false }
                : { startOffset: table.endIndex, endOffset: body.dataStream.length - 2, collapsed: false };
            let collabActions: JSONXActions = [];
            const collabListener = commandService.onMutationExecutedForCollab((command) => {
                const actions = getCollabActions(command);
                if (actions) {
                    collabActions = actions;
                }
            });

            await commandService.executeCommand(CutContentCommand.id, {
                segmentId: '',
                textRanges: [],
                selections: [selection],
                rectRanges: [],
            } satisfies IInnerCutCommandParams);

            const deleted = Tools.deepClone(getRequiredDocumentSnapshot());
            expect(deleted.body?.tables).toHaveLength(1);
            expect(deleted.body?.dataStream).toContain(DataStreamTreeTokenType.TABLE_START);
            expect(deleted.body?.dataStream).toContain(DataStreamTreeTokenType.TABLE_END);
            expect(deleted.tableSource?.[table.tableId]).toBeDefined();

            const remote = new DocumentDataModel(Tools.deepClone(original));
            remote.apply(collabActions);
            expect(remote.getSnapshot()).toEqual(deleted);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expectStructuralSnapshotRestored(getDocumentSnapshot(), original);
            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expectStructuralSnapshotRestored(getDocumentSnapshot(), deleted);
            collabListener.dispose();
        });

        it('normalizes fragmented whole-body selection to an empty document and replays the same actions for collaboration', async () => {
            replaceDocument(createStructuralDocumentData(true));
            const original = Tools.deepClone(getRequiredDocumentSnapshot());
            let collabActions: JSONXActions = [];
            const collabListener = commandService.onMutationExecutedForCollab((command) => {
                const actions = getCollabActions(command);
                if (actions) {
                    collabActions = actions;
                }
            });

            await commandService.executeCommand(CutContentCommand.id, {
                segmentId: '',
                textRanges: [],
                selections: [
                    { startOffset: 0, endOffset: 1, collapsed: false },
                    { startOffset: 2, endOffset: 4, collapsed: false },
                    { startOffset: 5, endOffset: 9, collapsed: false },
                    { startOffset: 12, endOffset: 13, collapsed: false },
                    { startOffset: 16, endOffset: 18, collapsed: false },
                    { startOffset: 21, endOffset: 22, collapsed: false },
                ],
                rectRanges: [],
            } satisfies IInnerCutCommandParams);

            const deleted = Tools.deepClone(getRequiredDocumentSnapshot());
            expect(deleted.body).toEqual(expect.objectContaining({
                dataStream: '\r\n',
                paragraphs: [expect.objectContaining({ startIndex: 0 })],
                sectionBreaks: [expect.objectContaining({ startIndex: 1 })],
                blockRanges: [],
                columnGroups: [],
                customRanges: [],
                customBlocks: [],
            }));
            expect(deleted.body?.paragraphs?.[0].bullet).toBeUndefined();
            expect(deleted.drawings ?? {}).toEqual({});
            expect(deleted.drawingsOrder ?? []).toEqual([]);

            const remote = new DocumentDataModel(Tools.deepClone(original));
            remote.apply(collabActions);
            expect(remote.getSnapshot()).toEqual(deleted);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expectStructuralSnapshotRestored(getDocumentSnapshot(), original);
            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getDocumentSnapshot()).toEqual(deleted);
            collabListener.dispose();
        });

        it('normalizes a whole document ending in a column group to an empty document', async () => {
            replaceDocument(createTerminalColumnGroupDocumentData());
            const original = Tools.deepClone(getRequiredDocumentSnapshot());
            let collabActions: JSONXActions = [];
            const collabListener = commandService.onMutationExecutedForCollab((command) => {
                const actions = getCollabActions(command);
                if (actions) {
                    collabActions = actions;
                }
            });

            await commandService.executeCommand(CutContentCommand.id, {
                segmentId: '',
                textRanges: [],
                selections: [
                    { startOffset: 2, endOffset: 3, collapsed: false },
                    { startOffset: 6, endOffset: 7, collapsed: false },
                ],
                rectRanges: [],
            } satisfies IInnerCutCommandParams);

            const deleted = Tools.deepClone(getRequiredDocumentSnapshot());
            expect(deleted.body).toEqual(expect.objectContaining({
                dataStream: '\r\n',
                paragraphs: [expect.objectContaining({ startIndex: 0 })],
                sectionBreaks: [expect.objectContaining({ startIndex: 1 })],
                columnGroups: [],
            }));

            const remote = new DocumentDataModel(Tools.deepClone(original));
            remote.apply(collabActions);
            expect(remote.getSnapshot()).toEqual(deleted);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expectStructuralSnapshotRestored(getDocumentSnapshot(), original);
            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expectStructuralSnapshotRestored(getDocumentSnapshot(), deleted);
            collabListener.dispose();
        });

        it('deletes a whole collaborative document with a collapsed duplicate column-group range', async () => {
            replaceDocument(createTerminalColumnGroupDocumentData(true));
            const original = Tools.deepClone(getRequiredDocumentSnapshot());
            const normalizedOriginal = Tools.deepClone(original);
            if (normalizedOriginal.body) {
                normalizedOriginal.body.columnGroups = normalizedOriginal.body.columnGroups?.slice(0, 1);
            }
            let collabActions: JSONXActions = [];
            const collabListener = commandService.onMutationExecutedForCollab((command) => {
                const actions = getCollabActions(command);
                if (actions) {
                    collabActions = actions;
                }
            });

            await commandService.executeCommand(CutContentCommand.id, {
                segmentId: '',
                textRanges: [],
                selections: [
                    { startOffset: 2, endOffset: 3, collapsed: false },
                    { startOffset: 6, endOffset: 7, collapsed: false },
                ],
                rectRanges: [],
                wholeBodySelected: true,
            } satisfies IInnerCutCommandParams);

            const deleted = Tools.deepClone(getRequiredDocumentSnapshot());
            expect(deleted.body).toEqual(expect.objectContaining({
                dataStream: '\r\n',
                columnGroups: [],
            }));

            const remote = new DocumentDataModel(Tools.deepClone(original));
            remote.apply(collabActions);
            expect(remote.getSnapshot()).toEqual(deleted);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expectStructuralSnapshotRestored(getDocumentSnapshot(), normalizedOriginal);
            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expectStructuralSnapshotRestored(getDocumentSnapshot(), deleted);
            collabListener.dispose();
        });

        it('deletes fragmented full block and column-group selections atomically with undo and redo', async () => {
            replaceDocument(createStructuralDocumentData());
            const original = Tools.deepClone(getRequiredDocumentSnapshot());
            let collabActions: JSONXActions = [];
            const collabListener = commandService.onMutationExecutedForCollab((command) => {
                const actions = getCollabActions(command);
                if (actions) {
                    collabActions = actions;
                }
            });

            await commandService.executeCommand(CutContentCommand.id, {
                segmentId: '',
                textRanges: [],
                selections: [
                    { startOffset: 2, endOffset: 4, collapsed: false },
                    { startOffset: 5, endOffset: 8, collapsed: false },
                    { startOffset: 12, endOffset: 13, collapsed: false },
                    { startOffset: 16, endOffset: 18, collapsed: false },
                ],
                rectRanges: [],
            } satisfies IInnerCutCommandParams);

            const deleted = Tools.deepClone(getRequiredDocumentSnapshot());
            expect(deleted.body?.blockRanges).toEqual([]);
            expect(deleted.body?.columnGroups).toEqual([]);
            expect(deleted.body?.customRanges).toEqual([]);
            expect(deleted.body?.customBlocks).toEqual([]);
            expect(deleted.drawings ?? {}).toEqual({});
            expect(deleted.body?.dataStream).not.toContain(DataStreamTreeTokenType.BLOCK_START);
            expect(deleted.body?.dataStream).not.toContain(DataStreamTreeTokenType.COLUMN_GROUP_START);

            const remote = new DocumentDataModel(Tools.deepClone(original));
            remote.apply(collabActions);
            expect(remote.getSnapshot()).toEqual(deleted);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expectStructuralSnapshotRestored(getDocumentSnapshot(), original);
            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expectStructuralSnapshotRestored(getDocumentSnapshot(), deleted);
            collabListener.dispose();
        });

        it.each([
            ['above block boundary', [{ startOffset: 0, endOffset: 5, collapsed: false }]],
            ['below block boundary', [{ startOffset: 5, endOffset: 10, collapsed: false }]],
            ['above column-group boundary', [{ startOffset: 8, endOffset: 13, collapsed: false }]],
            ['below column-group boundary', [{ startOffset: 17, endOffset: 23, collapsed: false }]],
        ])('keeps partially selected structures balanced when deleting %s', async (_name, selections) => {
            replaceDocument(createStructuralDocumentData());
            const original = Tools.deepClone(getRequiredDocumentSnapshot());

            await commandService.executeCommand(CutContentCommand.id, {
                segmentId: '',
                textRanges: [],
                selections,
                rectRanges: [],
            } satisfies IInnerCutCommandParams);

            const deleted = Tools.deepClone(getRequiredDocumentSnapshot());
            expect(deleted.body?.blockRanges).toHaveLength(1);
            expect(deleted.body?.columnGroups).toHaveLength(1);
            expect(deleted.body?.dataStream).toContain(DataStreamTreeTokenType.BLOCK_START);
            expect(deleted.body?.dataStream).toContain(DataStreamTreeTokenType.BLOCK_END);
            expect(deleted.body?.dataStream).toContain(DataStreamTreeTokenType.COLUMN_GROUP_START);
            expect(deleted.body?.dataStream).toContain(DataStreamTreeTokenType.COLUMN_GROUP_END);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expectStructuralSnapshotRestored(getDocumentSnapshot(), original);
            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getDocumentSnapshot()).toEqual(deleted);
        });

        it.each([
            ['the custom block itself', { startOffset: 16, endOffset: 17, removed: true }],
            ['the content immediately above it', { startOffset: 12, endOffset: 13, removed: false }],
            ['the content immediately below it', { startOffset: 17, endOffset: 18, removed: false }],
        ])('handles deleting %s without crossing the custom-block point boundary', async (_name, range) => {
            replaceDocument(createStructuralDocumentData());
            const original = Tools.deepClone(getRequiredDocumentSnapshot());

            await commandService.executeCommand(CutContentCommand.id, {
                segmentId: '',
                textRanges: [],
                selections: [{ ...range, collapsed: false }],
                rectRanges: [],
            } satisfies IInnerCutCommandParams);

            const snapshot = getDocumentSnapshot();
            if (!snapshot) {
                throw new Error('Document snapshot not found');
            }
            expect(snapshot?.body?.customBlocks ?? []).toHaveLength(range.removed ? 0 : 1);
            expect(snapshot?.drawings?.['structural-drawing'] == null).toBe(range.removed);

            const deleted = Tools.deepClone(snapshot);
            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expectStructuralSnapshotRestored(getDocumentSnapshot(), original);
            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expect(getDocumentSnapshot()).toEqual(deleted);
        });

        it('normalizes whole-body selection containing an entire table and restores it through undo', async () => {
            replaceDocument(createTableDocumentData());
            const original = Tools.deepClone(getRequiredDocumentSnapshot());
            const body = original.body;
            const table = body?.tables?.[0];
            if (!body || !table) {
                throw new Error('Table not found');
            }
            let collabActions: JSONXActions = [];
            const collabListener = commandService.onMutationExecutedForCollab((command) => {
                const actions = getCollabActions(command);
                if (actions) {
                    collabActions = actions;
                }
            });
            const rectRange: IRectRangeWithStyle = {
                startOffset: table.startIndex,
                endOffset: table.endIndex - 1,
                collapsed: false,
                rangeType: DOC_RANGE_TYPE.RECT,
                tableId: table.tableId,
                startRow: 0,
                endRow: 1,
                startColumn: 0,
                endColumn: 1,
                spanEntireRow: true,
                spanEntireColumn: true,
                spanEntireTable: true,
            };

            await commandService.executeCommand(CutContentCommand.id, {
                segmentId: '',
                textRanges: [],
                selections: [
                    { startOffset: 0, endOffset: table.startIndex, collapsed: false },
                    { startOffset: table.endIndex, endOffset: body.dataStream.length - 2, collapsed: false },
                ],
                rectRanges: [rectRange],
            } satisfies IInnerCutCommandParams);

            const deleted = Tools.deepClone(getRequiredDocumentSnapshot());
            expect(deleted.body?.dataStream).toBe('\r\n');
            expect(deleted.body?.tables).toEqual([]);
            expect(deleted.tableSource ?? {}).toEqual({});

            const remote = new DocumentDataModel(Tools.deepClone(original));
            remote.apply(collabActions);
            expect(remote.getSnapshot()).toEqual(deleted);

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
            expectStructuralSnapshotRestored(getDocumentSnapshot(), original);
            expect(await commandService.executeCommand(RedoCommand.id)).toBeTruthy();
            expectStructuralSnapshotRestored(getDocumentSnapshot(), deleted);
            collabListener.dispose();
        });
    });

    describe('Test public doc clipboard commands', () => {
        beforeEach(() => {
            injector.add([IDocClipboardService, { useClass: TestDocClipboardService }]);
            injector.add([IClipboardInterfaceService, { useClass: TestClipboardInterfaceService }]);

            commandService.registerMultipleCommand(DocCopyCommand);
            commandService.registerMultipleCommand(DocCutCommand);
            commandService.registerMultipleCommand(DocPasteCommand);
            commandService.registerCommand(DocCopyCurrentParagraphCommand);
            commandService.registerCommand(DocCutCurrentParagraphCommand);
        });

        it('Should enable document clipboard commands only while a doc or editor is focused', () => {
            const contextService = get(IContextService);

            contextService.setContextValue(FOCUSING_DOC, false);
            contextService.setContextValue(EDITOR_ACTIVATED, false);
            expect(whenDocOrEditor(contextService)).toBe(false);
            expect(whenFocusEditor(contextService)).toBe(false);

            contextService.setContextValue(FOCUSING_DOC, true);
            expect(whenDocOrEditor(contextService)).toBe(true);
            expect(whenFocusEditor(contextService)).toBe(false);

            contextService.setContextValue(EDITOR_ACTIVATED, true);
            expect(whenDocOrEditor(contextService)).toBe(true);
            expect(whenFocusEditor(contextService)).toBe(true);
        });

        it('Should route document copy and cut commands to the docs clipboard service', async () => {
            const docClipboardService = get(IDocClipboardService) as unknown as TestDocClipboardService;

            await commandService.executeCommand(DocCopyCommand.id);
            await commandService.executeCommand(DocCutCommand.id);

            expect(docClipboardService.copies).toEqual([{ sliceType: undefined, ranges: undefined }]);
            expect(docClipboardService.cuts).toEqual([{ ranges: undefined }]);
        });

        it('Should route current paragraph copy and cut with paragraph document ranges', async () => {
            const selectionManager = get(DocSelectionManagerService);
            selectionManager.__TEST_ONLY_add([{
                startOffset: 3,
                endOffset: 3,
                collapsed: true,
                isActive: true,
                segmentId: '',
                style: null as never,
            }]);
            const docClipboardService = get(IDocClipboardService) as unknown as TestDocClipboardService;

            await commandService.executeCommand(DocCopyCurrentParagraphCommand.id);
            await commandService.executeCommand(DocCutCurrentParagraphCommand.id);

            expect(docClipboardService.copies[0].sliceType).toBe(SliceBodyType.copy);
            expect(docClipboardService.copies[0].ranges?.[0]).toMatchObject({
                startOffset: 0,
                endOffset: 23,
                collapsed: false,
            });
            expect(docClipboardService.cuts[0].ranges?.[0]).toMatchObject({
                startOffset: 0,
                endOffset: 23,
                collapsed: false,
                rangeType: DOC_RANGE_TYPE.TEXT,
            });
        });

        it('Should read browser clipboard items before pasting into the document', async () => {
            const docClipboardService = get(IDocClipboardService) as unknown as TestDocClipboardService;
            const clipboardInterfaceService = get(IClipboardInterfaceService) as unknown as TestClipboardInterfaceService;

            clipboardInterfaceService.items = [];
            const emptyResult = await commandService.executeCommand(DocPasteCommand.id);
            expect(emptyResult).toBe(false);
            expect(docClipboardService.pastes).toHaveLength(0);

            clipboardInterfaceService.items = [{ types: ['text/html'] } as unknown as ClipboardItem];
            await commandService.executeCommand(DocPasteCommand.id);

            expect(docClipboardService.pastes).toEqual([clipboardInterfaceService.items]);
        });

        it('Should paste the internal copy when browser clipboard reads are unsupported', async () => {
            const docClipboardService = get(IDocClipboardService) as unknown as TestDocClipboardService;
            const clipboardInterfaceService = get(IClipboardInterfaceService) as unknown as TestClipboardInterfaceService;
            docClipboardService.memoryPasteResult = true;
            clipboardInterfaceService.supported = false;

            expect(await commandService.executeCommand(DocPasteCommand.id)).toBe(true);
            expect(docClipboardService.memoryPastes).toBe(1);
            expect(clipboardInterfaceService.reads).toBe(0);
        });
    });
});
