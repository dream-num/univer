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

import type { DocumentDataModel, ICommand, IDisposable, IDocumentData, Injector, IStyleBase, Univer } from '@univerjs/core';
import type { IRectRangeWithStyle, ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IDocClipboardHook } from '../../../services/clipboard/clipboard.service';
import type { IInnerCutCommandParams, IInnerPasteCommandParams } from '../clipboard.inner.command';
import {
    BooleanNumber,
    CustomDecorationType,
    DataStreamTreeTokenType,
    DOC_RANGE_TYPE,
    EDITOR_ACTIVATED,
    FOCUSING_DOC,
    ICommandService,
    IContextService,
    IUniverInstanceService,
    SliceBodyType,
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

    async copy(sliceType?: SliceBodyType, ranges?: ITextRangeWithStyle[]): Promise<boolean> {
        this.copies.push({ sliceType, ranges });
        return true;
    }

    async cut(ranges?: ITextRangeWithStyle[]): Promise<boolean> {
        this.cuts.push({ ranges });
        return true;
    }

    async paste(items: ClipboardItem[]): Promise<boolean> {
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

    get supportClipboard(): boolean {
        return true;
    }

    async writeText(): Promise<void> {}
    async write(): Promise<void> {}
    async readText(): Promise<string> { return ''; }
    async read(): Promise<ClipboardItem[]> { return this.items; }
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
        const dataStream = `${tableData.dataStream}Tail\r\n`;

        return {
            id: 'test-doc',
            body: {
                dataStream,
                textRuns: [{ st: 0, ed: dataStream.length - 2, ts: {} }],
                paragraphs: [
                    ...tableData.paragraphs,
                    { paragraphId: 'para_docs_ui_clipboard_table_tail', startIndex: dataStream.length - 2 },
                ],
                sectionBreaks: [
                    ...tableData.sectionBreaks,
                    { sectionId: 'section_fixture_203', startIndex: dataStream.length - 1 },
                ],
                tables: [{
                    startIndex: 0,
                    endIndex: tableData.dataStream.length,
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
            const table = getDocumentSnapshot()?.body?.tables?.[0];
            if (!table) {
                throw new Error('Table not found');
            }
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

            const snapshot = getDocumentSnapshot();

            expect(snapshot?.body?.dataStream.includes(DataStreamTreeTokenType.TABLE_START)).toBe(false);
            expect(snapshot?.tableSource?.['table-1']).toBeUndefined();

            expect(await commandService.executeCommand(UndoCommand.id)).toBeTruthy();
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
    });
});
