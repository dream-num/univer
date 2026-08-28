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

import type { DocumentDataModel, IDocumentBody, IDocumentData } from '@univerjs/core';
import type { IRectRangeWithStyle, ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IDocClipboardPasteAdapter } from '../doc-paste-mutation-adapter.service';
import {
    BooleanNumber,
    DataStreamTreeTokenType,
    DOC_RANGE_TYPE,
    DocumentBlockRangeType,
    ICommandService,
    ImageSourceType,
    IPermissionService,
    IUniverInstanceService,
    SliceBodyType,
    UniverInstanceType,
    validateDocBodyStructure,
} from '@univerjs/core';
import {
    DocSelectionManagerService,
    getDocumentParagraphPermissionObjectId,
    RichTextEditingMutation,
    setDocumentPermissionValue,
    SetTextSelectionsOperation,
} from '@univerjs/docs';
import { UnitAction } from '@univerjs/protocol';
import { IClipboardInterfaceService } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { createCommandTestBed } from '../../../commands/commands/__tests__/create-command-test-bed';
import { CutContentCommand, InnerPasteCommand } from '../../../commands/commands/clipboard.inner.command';
import {
    convertClipboardHtmlToDocumentData,
    DocClipboardService,
    getTableClipboardBodySlice,
    IDocClipboardService,
    removeClipboardHtmlImages,
} from '../clipboard.service';
import {
    DocClipboardPasteAdapterService,
    IDocClipboardPasteAdapterService,
} from '../doc-paste-mutation-adapter.service';
import { HtmlToUDMService } from '../html-to-udm/converter';
import {
    createInternalClipboardFragment,
    DOC_INTERNAL_FRAGMENT_MIME,
    parseInternalClipboardFragment,
} from '../internal-fragment';

class TestClipboardInterfaceService {
    readonly writes: Array<{ text: string; html: string; custom?: Record<string, string> }> = [];

    get supportClipboard(): boolean {
        return true;
    }

    async writeText(): Promise<void> {}
    async write(text: string, html: string, custom?: Record<string, string>): Promise<void> {
        this.writes.push({ text, html, custom });
    }

    async readText(): Promise<string> { return ''; }
    async read(): Promise<ClipboardItem[]> { return []; }
}

class RejectingClipboardInterfaceService extends TestClipboardInterfaceService {
    override async write(): Promise<void> {
        throw new Error('clipboard write failed');
    }
}

describe('clipboard HTML helpers', () => {
    it('creates a standalone rich-text document that can be opened by shape editors', () => {
        const documentData = convertClipboardHtmlToDocumentData('<p><strong>Rich</strong> text</p>');
        const body = documentData.body!;

        expect(body.dataStream).toBe('Rich text\r\n');
        expect(body.paragraphs?.some((paragraph) => paragraph.startIndex === body.dataStream.length - 2)).toBe(true);
        expect(body.sectionBreaks?.some((sectionBreak) => sectionBreak.startIndex === body.dataStream.length - 1)).toBe(true);
        expect(body.textRuns).toContainEqual(expect.objectContaining({ st: 0, ed: 4 }));
    });

    it('creates structurally valid quote and code blocks for shape editors', () => {
        const documentData = convertClipboardHtmlToDocumentData(`
            <blockquote><p>Quoted documentation</p></blockquote>
            <pre><code>const value = 1;</code></pre>
        `);

        expect(validateDocBodyStructure(documentData.body!)).toEqual([]);
    });

    it('falls back to plain text when converted HTML metadata is structurally invalid', () => {
        const convert = vi.spyOn(HtmlToUDMService.prototype, 'convert').mockReturnValue({
            id: 'invalid-html',
            body: {
                dataStream: 'Readable content',
                blockRanges: [{
                    blockId: 'broken-block',
                    blockType: DocumentBlockRangeType.QUOTE,
                    startIndex: 0,
                    endIndex: 15,
                }],
            },
            documentStyle: {},
        });

        try {
            const documentData = convertClipboardHtmlToDocumentData('<blockquote>Readable content</blockquote>');

            expect(documentData.body?.dataStream).toBe('Readable content\r\n');
            expect(documentData.body?.blockRanges).toBeUndefined();
            expect(validateDocBodyStructure(documentData.body!)).toEqual([]);
        } finally {
            convert.mockRestore();
        }
    });

    it('ignores HTML content hidden from the source page', () => {
        const documentData = convertClipboardHtmlToDocumentData(`
            <p>Visible content</p>
            <p aria-hidden="true">ARIA hidden</p>
            <p class="sr-only">Screen reader only</p>
            <p hidden>Hidden attribute</p>
            <p style="display: none !important">Display none</p>
            <p style="visibility: hidden">Visibility hidden</p>
        `);

        expect(documentData.body?.dataStream).toContain('Visible content');
        expect(documentData.body?.dataStream).not.toMatch(/ARIA hidden|Screen reader only|Hidden attribute|Display none|Visibility hidden/);
    });

    it('removes image elements without dropping Word style metadata', () => {
        const html = '<html><head><style>.word { font-weight: bold; }</style></head><body><p class="word">Text<img src="data:image/png;base64,AA=="></p></body></html>';
        const sanitized = removeClipboardHtmlImages(html);

        expect(sanitized).toContain('.word { font-weight: bold; }');
        expect(sanitized).toContain('<p class="word">Text</p>');
        expect(sanitized).not.toContain('<img');
    });

    it('keeps HTML fragments as fragments when removing images', () => {
        expect(removeClipboardHtmlImages('<b>Text</b><img src="data:image/png;base64,AA==">')).toBe('<b>Text</b>');
    });
});

describe('DocClipboardService table copy helpers', () => {
    it('should keep table metadata when copying an entire selected docs table', () => {
        const tokens = DataStreamTreeTokenType;
        const tableStream = `${tokens.TABLE_START}${tokens.TABLE_ROW_START}${tokens.TABLE_CELL_START}A\r\n${tokens.TABLE_CELL_END}${tokens.TABLE_CELL_START}B\r\n${tokens.TABLE_CELL_END}${tokens.TABLE_ROW_END}${tokens.TABLE_END}`;
        const dataStream = `Intro\r${tableStream}Tail\r`;
        const tableStart = 'Intro\r'.length;
        const tableEnd = tableStart + tableStream.length;
        const body: IDocumentBody = {
            dataStream,
            paragraphs: [
                { paragraphId: 'para_docs_ui_fixture_46', startIndex: 5 },
                { paragraphId: 'para_docs_ui_fixture_47', startIndex: tableStart + tokens.TABLE_START.length + tokens.TABLE_ROW_START.length + tokens.TABLE_CELL_START.length + 1 },
                { paragraphId: 'para_docs_ui_fixture_48', startIndex: tableStart + tokens.TABLE_START.length + tokens.TABLE_ROW_START.length + tokens.TABLE_CELL_START.length + 'A\r\n'.length + tokens.TABLE_CELL_END.length + tokens.TABLE_CELL_START.length + 1 },
                { paragraphId: 'para_docs_ui_fixture_49', startIndex: dataStream.length - 1 },
            ],
            sectionBreaks: [],
            tables: [{
                startIndex: tableStart,
                endIndex: tableEnd,
                tableId: 'table-1',
            }],
        };
        const range: IRectRangeWithStyle = {
            startOffset: tableStart,
            endOffset: tableEnd,
            collapsed: false,
            rangeType: DOC_RANGE_TYPE.RECT,
            tableId: 'table-1',
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 1,
            spanEntireRow: true,
            spanEntireColumn: true,
            spanEntireTable: true,
        };

        const slice = getTableClipboardBodySlice(body, range);

        expect(slice.dataStream).toBe(tableStream);
        expect(slice.tables).toEqual([{
            startIndex: 0,
            endIndex: tableStream.length,
            tableId: 'table-1',
        }]);
    });

    it('wraps a copied table cell as a standalone table fragment', () => {
        const tokens = DataStreamTreeTokenType;
        const tableStream = `${tokens.TABLE_START}${tokens.TABLE_ROW_START}${tokens.TABLE_CELL_START}A\r\n${tokens.TABLE_CELL_END}${tokens.TABLE_CELL_START}B\r\n${tokens.TABLE_CELL_END}${tokens.TABLE_ROW_END}${tokens.TABLE_END}`;
        const dataStream = `Intro\r${tableStream}Tail\r`;
        const cellStart = 'Intro\r'.length + tokens.TABLE_START.length + tokens.TABLE_ROW_START.length + tokens.TABLE_CELL_START.length;
        const body: IDocumentBody = {
            dataStream,
            paragraphs: [
                { paragraphId: 'para_docs_ui_clipboard_table_fixture_1', startIndex: cellStart + 1 },
                { paragraphId: 'para_docs_ui_clipboard_table_fixture_2', startIndex: dataStream.length - 1 },
            ],
            sectionBreaks: [],
            textRuns: [{ st: cellStart, ed: cellStart + 1, ts: { bl: BooleanNumber.TRUE } }],
            tables: [{
                startIndex: 'Intro\r'.length,
                endIndex: 'Intro\r'.length + tableStream.length,
                tableId: 'table-1',
            }],
        };
        const slice = getTableClipboardBodySlice(body, {
            startOffset: cellStart,
            endOffset: cellStart + 1,
            collapsed: false,
            rangeType: DOC_RANGE_TYPE.RECT,
            tableId: 'table-1',
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
            spanEntireRow: false,
            spanEntireColumn: false,
            spanEntireTable: false,
        });

        expect(slice.dataStream).toBe(`${tokens.TABLE_START}${tokens.TABLE_ROW_START}${tokens.TABLE_CELL_START}A\r\n${tokens.TABLE_CELL_END}${tokens.TABLE_ROW_END}${tokens.TABLE_END}`);
        expect(slice.textRuns?.[0]).toMatchObject({ st: 3, ed: 4, ts: { bl: BooleanNumber.TRUE } });
        expect(slice.paragraphs?.[0].startIndex).toBe(4);
    });

    it('copies the selected document text as plain text, html, and internal clipboard data', async () => {
        const documentData: IDocumentData = {
            id: 'copy-doc',
            body: {
                dataStream: 'Alpha\r\n',
                paragraphs: [{ paragraphId: 'para_docs_ui_clipboard_fixture_2', startIndex: 5 }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [],
            },
            documentStyle: {},
        };
        const testBed = createCommandTestBed(documentData, [
            [IClipboardInterfaceService, { useClass: TestClipboardInterfaceService }],
            [IDocClipboardService, { useClass: DocClipboardService }],
        ]);
        const selectionManager = testBed.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: 'copy-doc', subUnitId: '' });
        selectionManager.__TEST_ONLY_add([{
            startOffset: 0,
            endOffset: 5,
            collapsed: false,
            isActive: true,
            segmentId: '',
        }]);

        const service = testBed.get(IDocClipboardService);
        const copied = await service.copy();
        const clipboard = testBed.get(IClipboardInterfaceService) as unknown as TestClipboardInterfaceService;
        const internalDoc = parseInternalClipboardFragment(clipboard.writes[0].custom?.[DOC_INTERNAL_FRAGMENT_MIME]);

        expect(copied).toBe(true);
        expect(clipboard.writes[0].text).toBe('Alpha');
        expect(clipboard.writes[0].html).toContain('data-copy-id=');
        expect(clipboard.writes[0].html).toContain('<!--univer-doc-fragment:');
        expect(internalDoc?.body?.dataStream).toBe('Alpha');

        testBed.univer.dispose();
    });

    it('returns false when writing copied content to the clipboard fails', async () => {
        const documentData: IDocumentData = {
            id: 'failed-copy-doc',
            body: {
                dataStream: 'Alpha\r\n',
                paragraphs: [{ paragraphId: 'para_docs_ui_clipboard_fixture_failed_copy', startIndex: 5 }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [],
            },
            documentStyle: {},
        };
        const testBed = createCommandTestBed(documentData, [
            [IClipboardInterfaceService, { useClass: RejectingClipboardInterfaceService }],
            [IDocClipboardService, { useClass: DocClipboardService }],
        ]);
        const selectionManager = testBed.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: 'failed-copy-doc', subUnitId: '' });
        selectionManager.__TEST_ONLY_add([{
            startOffset: 0,
            endOffset: 5,
            collapsed: false,
            isActive: true,
            segmentId: '',
        }]);

        expect(await testBed.get(IDocClipboardService).copy()).toBe(false);

        testBed.univer.dispose();
    });

    it('does not expose document content when Unit Copy permission is denied', async () => {
        const documentData: IDocumentData = {
            id: 'denied-copy-doc',
            body: {
                dataStream: 'Secret\r\n',
                paragraphs: [{ paragraphId: 'denied-copy-paragraph', startIndex: 6 }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [],
            },
            documentStyle: {},
        };
        const testBed = createCommandTestBed(documentData, [
            [IClipboardInterfaceService, { useClass: TestClipboardInterfaceService }],
            [IDocClipboardService, { useClass: DocClipboardService }],
        ]);
        const selectionManager = testBed.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: documentData.id, subUnitId: '' });
        selectionManager.__TEST_ONLY_add([{
            startOffset: 0,
            endOffset: 6,
            collapsed: false,
            isActive: true,
            segmentId: '',
        }]);
        setDocumentPermissionValue(
            testBed.get(IPermissionService),
            documentData.id,
            documentData.id,
            UnitAction.Copy,
            false
        );

        expect(await testBed.get(IDocClipboardService).copy()).toBe(false);
        expect((testBed.get(IClipboardInterfaceService) as unknown as TestClipboardInterfaceService).writes).toEqual([]);

        testBed.univer.dispose();
    });

    it('copies multiple selected text ranges in document order', async () => {
        const documentData: IDocumentData = {
            id: 'multi-copy-doc',
            body: {
                dataStream: 'Alpha Beta\r\n',
                paragraphs: [{ paragraphId: 'para_docs_ui_clipboard_fixture_8', startIndex: 10 }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [],
            },
            documentStyle: {},
        };
        const testBed = createCommandTestBed(documentData, [
            [IClipboardInterfaceService, { useClass: TestClipboardInterfaceService }],
            [IDocClipboardService, { useClass: DocClipboardService }],
        ]);
        const ranges: ITextRangeWithStyle[] = [
            {
                startOffset: 0,
                endOffset: 5,
                collapsed: false,
                rangeType: DOC_RANGE_TYPE.TEXT,
                segmentId: '',
            },
            {
                startOffset: 6,
                endOffset: 10,
                collapsed: false,
                rangeType: DOC_RANGE_TYPE.TEXT,
                segmentId: '',
            },
        ];
        const service = testBed.get(IDocClipboardService);

        expect(await service.copy(undefined, ranges)).toBe(true);

        const clipboard = testBed.get(IClipboardInterfaceService) as unknown as TestClipboardInterfaceService;
        const internalDoc = parseInternalClipboardFragment(clipboard.writes[0].custom?.[DOC_INTERNAL_FRAGMENT_MIME]);

        expect(clipboard.writes[0].text).toBe('Alpha\nBeta');
        expect(internalDoc?.body?.dataStream).toBe('AlphaBeta');

        testBed.univer.dispose();
    });

    it('leaves the document and clipboard unchanged when cut has no selected content', async () => {
        const documentData: IDocumentData = {
            id: 'empty-cut-doc',
            body: {
                dataStream: 'Keep me\r\n',
                paragraphs: [{ paragraphId: 'para_docs_ui_clipboard_fixture_9', startIndex: 7 }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [],
            },
            documentStyle: {},
        };
        const testBed = createCommandTestBed(documentData, [
            [IClipboardInterfaceService, { useClass: TestClipboardInterfaceService }],
            [IDocClipboardService, { useClass: DocClipboardService }],
        ]);
        const service = testBed.get(IDocClipboardService);

        expect(await service.cut([])).toBe(false);

        const clipboard = testBed.get(IClipboardInterfaceService) as unknown as TestClipboardInterfaceService;
        const univerInstanceService = testBed.get(IUniverInstanceService);
        const documentModel = univerInstanceService.getUnit<DocumentDataModel>('empty-cut-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(clipboard.writes).toEqual([]);
        expect(documentModel.getBody()?.dataStream).toBe('Keep me\r\n');

        testBed.univer.dispose();
    });

    it('cuts the selected text and places that text on the clipboard', async () => {
        const documentData: IDocumentData = {
            id: 'cut-doc',
            body: {
                dataStream: 'Cut me now\r\n',
                paragraphs: [{ paragraphId: 'para_docs_ui_clipboard_fixture_5', startIndex: 10 }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [],
            },
            documentStyle: {},
        };
        const testBed = createCommandTestBed(documentData, [
            [IClipboardInterfaceService, { useClass: TestClipboardInterfaceService }],
            [IDocClipboardService, { useClass: DocClipboardService }],
        ]);
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(CutContentCommand);
        commandService.registerCommand(RichTextEditingMutation);
        commandService.registerCommand(SetTextSelectionsOperation);
        const selectionManager = testBed.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: 'cut-doc', subUnitId: '' });
        const ranges: ITextRangeWithStyle[] = [{
            startOffset: 0,
            endOffset: 3,
            collapsed: false,
            isActive: true,
            segmentId: '',
            rangeType: DOC_RANGE_TYPE.TEXT,
        }];
        selectionManager.__TEST_ONLY_add(ranges);

        const service = testBed.get(IDocClipboardService);
        expect(await service.cut(ranges)).toBe(true);

        const clipboard = testBed.get(IClipboardInterfaceService) as unknown as TestClipboardInterfaceService;
        const univerInstanceService = testBed.get(IUniverInstanceService);
        const documentModel = univerInstanceService.getUnit<DocumentDataModel>('cut-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(clipboard.writes[0].text).toBe('Cut');
        expect(documentModel.getBody()?.dataStream).toBe(' me now\r\n');

        testBed.univer.dispose();
    });

    it('does not write to the clipboard when Cut lacks Unit Edit permission', async () => {
        const documentData: IDocumentData = {
            id: 'copy-only-cut-doc',
            body: {
                dataStream: 'Keep me\r\n',
                paragraphs: [{ paragraphId: 'copy-only-cut-paragraph', startIndex: 7 }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [],
            },
            documentStyle: {},
        };
        const clipboard = new TestClipboardInterfaceService();
        const testBed = createCommandTestBed(documentData, [
            [IClipboardInterfaceService, { useValue: clipboard }],
            [IDocClipboardService, { useClass: DocClipboardService }],
        ]);
        const selectionManager = testBed.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: documentData.id, subUnitId: '' });
        const ranges: ITextRangeWithStyle[] = [{
            startOffset: 0,
            endOffset: 4,
            collapsed: false,
            isActive: true,
            segmentId: '',
            rangeType: DOC_RANGE_TYPE.TEXT,
        }];
        selectionManager.__TEST_ONLY_add(ranges);
        setDocumentPermissionValue(
            testBed.get(IPermissionService),
            documentData.id,
            documentData.id,
            UnitAction.Edit,
            false
        );

        expect(await testBed.get(IDocClipboardService).cut(ranges)).toBe(false);
        expect(clipboard.writes).toEqual([]);
        expect(testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>(documentData.id, UniverInstanceType.UNIVER_DOC)
            ?.getBody()
            ?.dataStream).toBe('Keep me\r\n');

        testBed.univer.dispose();
    });

    it('does not delete selected text when writing cut content to the clipboard fails', async () => {
        const documentData: IDocumentData = {
            id: 'failed-cut-doc',
            body: {
                dataStream: 'Keep me\r\n',
                paragraphs: [{ paragraphId: 'failed-cut-paragraph', startIndex: 7 }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [],
            },
            documentStyle: {},
        };
        const testBed = createCommandTestBed(documentData, [
            [IClipboardInterfaceService, { useClass: RejectingClipboardInterfaceService }],
            [IDocClipboardService, { useClass: DocClipboardService }],
        ]);
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(CutContentCommand);
        commandService.registerCommand(RichTextEditingMutation);
        commandService.registerCommand(SetTextSelectionsOperation);
        const selectionManager = testBed.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: documentData.id, subUnitId: '' });
        const ranges: ITextRangeWithStyle[] = [{
            startOffset: 0,
            endOffset: 4,
            collapsed: false,
            isActive: true,
            segmentId: '',
            rangeType: DOC_RANGE_TYPE.TEXT,
        }];
        selectionManager.__TEST_ONLY_add(ranges);

        expect(await testBed.get(IDocClipboardService).cut(ranges)).toBe(false);
        expect(testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>(documentData.id, UniverInstanceType.UNIVER_DOC)!
            .getBody()
            ?.dataStream).toBe('Keep me\r\n');

        testBed.univer.dispose();
    });

    it('pastes browser html clipboard content into the active document', async () => {
        const documentData: IDocumentData = {
            id: 'html-clipboard-doc',
            body: {
                dataStream: 'Body\r\n',
                paragraphs: [{ paragraphId: 'para_docs_ui_clipboard_fixture_13', startIndex: 4 }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [],
            },
            documentStyle: {},
        };
        const testBed = createCommandTestBed(documentData, [
            [IClipboardInterfaceService, { useClass: TestClipboardInterfaceService }],
            [IDocClipboardService, { useClass: DocClipboardService }],
        ]);
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(InnerPasteCommand);
        commandService.registerCommand(RichTextEditingMutation);
        commandService.registerCommand(SetTextSelectionsOperation);
        const selectionManager = testBed.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: 'html-clipboard-doc', subUnitId: '' });
        selectionManager.__TEST_ONLY_add([{
            startOffset: 4,
            endOffset: 4,
            collapsed: true,
            isActive: true,
            segmentId: '',
        }]);
        const clipboardItem = {
            types: ['text/html', 'text/plain'],
            presentationStyle: 'unspecified',
            getType: async (type: string) => new Blob([
                type === 'text/html' ? '<p>HTML clipboard</p>' : 'Plain clipboard',
            ], { type }),
        } as ClipboardItem;
        const service = testBed.get(IDocClipboardService);

        expect(await service.paste([clipboardItem])).toBe(true);

        const univerInstanceService = testBed.get(IUniverInstanceService);
        const documentModel = univerInstanceService.getUnit<DocumentDataModel>('html-clipboard-doc', UniverInstanceType.UNIVER_DOC)!;
        expect(documentModel.getBody()?.dataStream).toContain('HTML clipboard');

        testBed.univer.dispose();
    });

    it('keeps plain text pasted after a block range separate from the following paragraph', async () => {
        const tokens = DataStreamTreeTokenType;
        const blockStream = `${tokens.BLOCK_START}Callout${tokens.PARAGRAPH}${tokens.BLOCK_END}`;
        const documentData: IDocumentData = {
            id: 'block-boundary-paste-doc',
            body: {
                dataStream: `${blockStream}Quote${tokens.PARAGRAPH}${tokens.SECTION_BREAK}`,
                paragraphs: [
                    { paragraphId: 'para_docs_ui_clipboard_fixture_block', startIndex: blockStream.length - 2 },
                    { paragraphId: 'para_docs_ui_clipboard_fixture_quote', startIndex: blockStream.length + 5 },
                ],
                blockRanges: [{
                    blockId: 'callout-1',
                    blockType: DocumentBlockRangeType.CALLOUT,
                    startIndex: 0,
                    endIndex: blockStream.length - 1,
                }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [],
            },
            documentStyle: {},
        };
        const testBed = createCommandTestBed(documentData, [
            [IClipboardInterfaceService, { useClass: TestClipboardInterfaceService }],
            [IDocClipboardService, { useClass: DocClipboardService }],
        ]);
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(InnerPasteCommand);
        commandService.registerCommand(RichTextEditingMutation);
        commandService.registerCommand(SetTextSelectionsOperation);
        const selectionManager = testBed.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: 'block-boundary-paste-doc', subUnitId: '' });
        selectionManager.__TEST_ONLY_add([{
            startOffset: blockStream.length,
            endOffset: blockStream.length,
            collapsed: true,
            isActive: true,
            segmentId: '',
        }]);

        expect(await testBed.get(IDocClipboardService).legacyPaste({ text: 'Pasted', files: [] })).toBe(true);

        const documentModel = testBed.get(IUniverInstanceService).getUnit<DocumentDataModel>('block-boundary-paste-doc', UniverInstanceType.UNIVER_DOC)!;
        expect(documentModel.getBody()?.dataStream).toBe(`${blockStream}Pasted${tokens.PARAGRAPH}Quote${tokens.PARAGRAPH}${tokens.SECTION_BREAK}`);

        testBed.univer.dispose();
    });

    it('copies and pastes a complete block range after itself', async () => {
        const tokens = DataStreamTreeTokenType;
        const blockStream = `${tokens.BLOCK_START}Callout${tokens.PARAGRAPH}${tokens.BLOCK_END}`;
        const clipboard = new TestClipboardInterfaceService();
        const documentData: IDocumentData = {
            id: 'block-copy-paste-doc',
            body: {
                dataStream: `${blockStream}After${tokens.PARAGRAPH}${tokens.SECTION_BREAK}`,
                paragraphs: [
                    { paragraphId: 'para_docs_ui_clipboard_fixture_source_block', startIndex: blockStream.length - 2 },
                    { paragraphId: 'para_docs_ui_clipboard_fixture_after_block', startIndex: blockStream.length + 5 },
                ],
                blockRanges: [{
                    blockId: 'callout-1',
                    blockType: DocumentBlockRangeType.CALLOUT,
                    startIndex: 0,
                    endIndex: blockStream.length - 1,
                }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [],
            },
            documentStyle: {},
        };
        const testBed = createCommandTestBed(documentData, [
            [IClipboardInterfaceService, { useValue: clipboard }],
            [IDocClipboardService, { useClass: DocClipboardService }],
        ]);
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(InnerPasteCommand);
        commandService.registerCommand(RichTextEditingMutation);
        commandService.registerCommand(SetTextSelectionsOperation);
        const selectionManager = testBed.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: 'block-copy-paste-doc', subUnitId: '' });
        const service = testBed.get(IDocClipboardService);

        expect(await service.copy(SliceBodyType.copy, [{
            startOffset: 0,
            endOffset: blockStream.length,
            collapsed: false,
            segmentId: '',
        }])).toBe(true);

        selectionManager.__TEST_ONLY_add([{
            startOffset: blockStream.length,
            endOffset: blockStream.length,
            collapsed: true,
            isActive: true,
            segmentId: '',
        }]);

        expect(await service.paste()).toBe(true);

        const documentModel = testBed.get(IUniverInstanceService).getUnit<DocumentDataModel>('block-copy-paste-doc', UniverInstanceType.UNIVER_DOC)!;
        expect(documentModel.getBody()?.dataStream).toBe(`${blockStream}${blockStream}After${tokens.PARAGRAPH}${tokens.SECTION_BREAK}`);
        const blockRanges = documentModel.getBody()?.blockRanges ?? [];
        expect(blockRanges).toHaveLength(2);
        expect(blockRanges[0].blockId).toBe('callout-1');
        expect(blockRanges[1].blockId).not.toBe('callout-1');

        testBed.univer.dispose();
    });

    it('pastes Univer internal clipboard data with document styles preserved', async () => {
        const documentData: IDocumentData = {
            id: 'internal-paste-doc',
            body: {
                dataStream: 'Body\r\n',
                paragraphs: [{ paragraphId: 'para_docs_ui_clipboard_fixture_6', startIndex: 4 }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [],
            },
            documentStyle: {},
        };
        const testBed = createCommandTestBed(documentData, [
            [IClipboardInterfaceService, { useClass: TestClipboardInterfaceService }],
            [IDocClipboardService, { useClass: DocClipboardService }],
        ]);
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(InnerPasteCommand);
        commandService.registerCommand(RichTextEditingMutation);
        commandService.registerCommand(SetTextSelectionsOperation);
        const selectionManager = testBed.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: 'internal-paste-doc', subUnitId: '' });
        selectionManager.__TEST_ONLY_add([{
            startOffset: 4,
            endOffset: 4,
            collapsed: true,
            isActive: true,
            segmentId: '',
        }]);
        const internalJson = createInternalClipboardFragment({
            body: {
                dataStream: 'Styled\r\n',
                paragraphs: [{ paragraphId: 'para_docs_ui_clipboard_fixture_7', startIndex: 6 }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [{
                    st: 0,
                    ed: 6,
                    ts: { bl: BooleanNumber.TRUE },
                }],
            },
        });
        const clipboardItem = {
            types: [DOC_INTERNAL_FRAGMENT_MIME, 'text/plain'],
            presentationStyle: 'unspecified',
            getType: async (type: string) => new Blob([
                type === DOC_INTERNAL_FRAGMENT_MIME ? internalJson : 'Ignored',
            ], { type }),
        } as ClipboardItem;
        const service = testBed.get(IDocClipboardService);

        expect(await service.paste([clipboardItem])).toBe(true);

        const univerInstanceService = testBed.get(IUniverInstanceService);
        const documentModel = univerInstanceService.getUnit<DocumentDataModel>('internal-paste-doc', UniverInstanceType.UNIVER_DOC)!;
        const body = documentModel.getBody();
        let styledTextRunBold: BooleanNumber | undefined;
        for (const textRun of body?.textRuns ?? []) {
            if (textRun.st <= 4 && textRun.ed >= 10) {
                styledTextRunBold = textRun.ts?.bl;
                break;
            }
        }

        expect(body?.dataStream).toContain('BodyStyled');
        expect(styledTextRunBold).toBe(BooleanNumber.TRUE);

        testBed.univer.dispose();
    });

    it('uploads base64 images from pasted html and inserts remote drawings into the document', async () => {
        const documentData: IDocumentData = {
            id: 'test-doc',
            body: {
                dataStream: 'Body\r\n',
                paragraphs: [{ paragraphId: 'para_docs_ui_clipboard_fixture_1', startIndex: 4 }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [],
            },
            drawings: {},
            drawingsOrder: [],
            documentStyle: {},
        };
        const testBed = createCommandTestBed(documentData, [
            [IClipboardInterfaceService, { useClass: TestClipboardInterfaceService }],
            [IDocClipboardService, { useClass: DocClipboardService }],
        ]);
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(InnerPasteCommand);
        commandService.registerCommand(RichTextEditingMutation);
        commandService.registerCommand(SetTextSelectionsOperation);
        const selectionManager = testBed.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: 'test-doc', subUnitId: '' });
        selectionManager.__TEST_ONLY_add([{
            startOffset: 0,
            endOffset: 0,
            collapsed: true,
            isActive: true,
            segmentId: '',
        }]);
        const service = testBed.get(IDocClipboardService);
        const source = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lz6N4wAAAABJRU5ErkJggg==';

        service.addClipboardHook({
            async onBeforePasteImage(file: File) {
                expect(file.type).toBe('image/png');
                return {
                    imageSourceType: ImageSourceType.UUID,
                    source: 'remote-file-id',
                };
            },
        });
        await service.legacyPaste({
            html: `<p><img src="${source}" width="2" height="3"></p>`,
            files: [],
        });

        const univerInstanceService = testBed.get(IUniverInstanceService);
        const documentModel = univerInstanceService.getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;
        const snapshot = documentModel.getSnapshot();
        const blocks = snapshot.body?.customBlocks ?? [];
        let drawingSource = '';
        for (const block of blocks) {
            const drawing = snapshot.drawings?.[block.blockId];
            const imageDrawing = drawing as { source?: string } | undefined;
            if (imageDrawing?.source === 'remote-file-id') {
                drawingSource = imageDrawing.source;
            }
        }

        expect(drawingSource).toBe('remote-file-id');
        expect(JSON.stringify(snapshot)).not.toContain('data:image');

        testBed.univer.dispose();
    });

    it('does not upload pasted images when Document Edit is denied', async () => {
        const documentData: IDocumentData = {
            id: 'denied-image-paste-doc',
            body: {
                dataStream: 'Body\r\n',
                paragraphs: [{ paragraphId: 'denied-image-paragraph', startIndex: 4 }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [],
            },
            documentStyle: {},
        };
        const testBed = createCommandTestBed(documentData, [
            [IClipboardInterfaceService, { useClass: TestClipboardInterfaceService }],
            [IDocClipboardService, { useClass: DocClipboardService }],
        ]);
        const service = testBed.get(IDocClipboardService);
        const selectionManager = testBed.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: documentData.id, subUnitId: '' });
        selectionManager.__TEST_ONLY_add([{
            startOffset: 0,
            endOffset: 0,
            collapsed: true,
            isActive: true,
            segmentId: '',
        }]);
        const upload = vi.fn(async () => ({
            imageSourceType: ImageSourceType.UUID,
            source: 'must-not-upload',
        }));
        service.addClipboardHook({ onBeforePasteImage: upload });
        setDocumentPermissionValue(
            testBed.get(IPermissionService),
            documentData.id,
            getDocumentParagraphPermissionObjectId('', 'denied-image-paragraph'),
            UnitAction.Edit,
            false
        );

        await expect(service.legacyPaste({
            html: '<p><img src="data:image/png;base64,AA=="></p>',
            files: [],
        })).resolves.toBe(false);
        expect(upload).not.toHaveBeenCalled();

        testBed.univer.dispose();
    });

    it('does not paste an image when paragraph Edit is revoked during upload', async () => {
        const documentData: IDocumentData = {
            id: 'revoked-image-paste-doc',
            body: {
                dataStream: 'Body\r\n',
                paragraphs: [{ paragraphId: 'revoked-image-paragraph', startIndex: 4 }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [],
            },
            drawings: {},
            drawingsOrder: [],
            documentStyle: {},
        };
        const testBed = createCommandTestBed(documentData, [
            [IClipboardInterfaceService, { useClass: TestClipboardInterfaceService }],
            [IDocClipboardService, { useClass: DocClipboardService }],
        ]);
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(InnerPasteCommand);
        commandService.registerCommand(RichTextEditingMutation);
        commandService.registerCommand(SetTextSelectionsOperation);
        const selectionManager = testBed.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: documentData.id, subUnitId: '' });
        selectionManager.__TEST_ONLY_add([{
            startOffset: 0,
            endOffset: 0,
            collapsed: true,
            isActive: true,
            segmentId: '',
        }]);
        const service = testBed.get(IDocClipboardService);
        let finishUpload: ((value: { source: string; imageSourceType: ImageSourceType }) => void) | undefined;
        const upload = vi.fn(() => new Promise<{ source: string; imageSourceType: ImageSourceType }>((resolve) => {
            finishUpload = resolve;
        }));
        service.addClipboardHook({ onBeforePasteImage: upload });

        const paste = service.legacyPaste({
            html: '<p><img src="data:image/png;base64,AA=="></p>',
            files: [],
        });
        await vi.waitFor(() => expect(finishUpload).toBeDefined());
        setDocumentPermissionValue(
            testBed.get(IPermissionService),
            documentData.id,
            getDocumentParagraphPermissionObjectId('', 'revoked-image-paragraph'),
            UnitAction.Edit,
            false
        );
        finishUpload?.({ source: 'remote-file-id', imageSourceType: ImageSourceType.UUID });

        await expect(paste).resolves.toBe(false);
        const documentModel = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>(documentData.id, UniverInstanceType.UNIVER_DOC)!;
        expect(documentModel.getBody()?.dataStream).toBe('Body\r\n');

        testBed.univer.dispose();
    });

    it('does not paste into another Document after the active Unit changes during upload', async () => {
        const documentData: IDocumentData = {
            id: 'unit-switch-image-paste-doc',
            body: {
                dataStream: 'Body\r\n',
                paragraphs: [{ paragraphId: 'unit-switch-image-paragraph', startIndex: 4 }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [],
            },
            drawings: {},
            drawingsOrder: [],
            documentStyle: {},
        };
        const otherDocumentData: IDocumentData = {
            ...documentData,
            id: 'unit-switch-image-paste-other-doc',
            body: {
                ...documentData.body!,
                paragraphs: [{ paragraphId: 'unit-switch-image-other-paragraph', startIndex: 4 }],
            },
        };
        const testBed = createCommandTestBed(documentData, [
            [IClipboardInterfaceService, { useClass: TestClipboardInterfaceService }],
            [IDocClipboardService, { useClass: DocClipboardService }],
        ]);
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(InnerPasteCommand);
        commandService.registerCommand(RichTextEditingMutation);
        commandService.registerCommand(SetTextSelectionsOperation);
        const selectionManager = testBed.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: documentData.id, subUnitId: '' });
        selectionManager.__TEST_ONLY_add([{
            startOffset: 0,
            endOffset: 0,
            collapsed: true,
            isActive: true,
            segmentId: '',
        }]);
        const service = testBed.get(IDocClipboardService);
        let finishUpload: ((value: { source: string; imageSourceType: ImageSourceType }) => void) | undefined;
        service.addClipboardHook({
            onBeforePasteImage: vi.fn(() => new Promise<{ source: string; imageSourceType: ImageSourceType }>((resolve) => {
                finishUpload = resolve;
            })),
        });

        const paste = service.legacyPaste({
            html: '<p><img src="data:image/png;base64,AA=="></p>',
            files: [],
        });
        await vi.waitFor(() => expect(finishUpload).toBeDefined());
        testBed.univer.createUnit(UniverInstanceType.UNIVER_DOC, otherDocumentData);
        testBed.get(IUniverInstanceService).focusUnit(otherDocumentData.id);
        finishUpload?.({ source: 'remote-file-id', imageSourceType: ImageSourceType.UUID });

        await expect(paste).resolves.toBe(false);
        const instanceService = testBed.get(IUniverInstanceService);
        expect(instanceService.getUnit<DocumentDataModel>(documentData.id, UniverInstanceType.UNIVER_DOC)?.getBody()?.dataStream)
            .toBe('Body\r\n');
        expect(instanceService.getUnit<DocumentDataModel>(otherDocumentData.id, UniverInstanceType.UNIVER_DOC)?.getBody()?.dataStream)
            .toBe('Body\r\n');

        testBed.univer.dispose();
    });

    it('turns pasted image files into inline document drawings through the image paste hook', async () => {
        class TestImage {
            naturalWidth = 20;
            naturalHeight = 10;
            private _onload: (() => void) | null = null;

            get src(): string {
                return '';
            }

            set src(_value: string) {
                queueMicrotask(() => this._onload?.());
            }

            get onload(): (() => void) | null {
                return this._onload;
            }

            set onload(value: (() => void) | null) {
                this._onload = value;
            }
        }
        vi.stubGlobal('Image', TestImage);
        vi.stubGlobal('URL', { ...URL, createObjectURL: () => 'blob:local-image' });
        const documentData: IDocumentData = {
            id: 'file-image-paste-doc',
            body: {
                dataStream: 'Body\r\n',
                paragraphs: [{ paragraphId: 'para_docs_ui_clipboard_fixture_14', startIndex: 4 }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [],
            },
            drawings: {},
            drawingsOrder: [],
            documentStyle: {},
        };
        const testBed = createCommandTestBed(documentData, [
            [IClipboardInterfaceService, { useClass: TestClipboardInterfaceService }],
            [IDocClipboardService, { useClass: DocClipboardService }],
        ]);
        try {
            const commandService = testBed.get(ICommandService);
            commandService.registerCommand(InnerPasteCommand);
            commandService.registerCommand(RichTextEditingMutation);
            commandService.registerCommand(SetTextSelectionsOperation);
            const selectionManager = testBed.get(DocSelectionManagerService);
            selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: 'file-image-paste-doc', subUnitId: '' });
            selectionManager.__TEST_ONLY_add([{
                startOffset: 0,
                endOffset: 0,
                collapsed: true,
                isActive: true,
                segmentId: '',
            }]);
            const service = testBed.get(IDocClipboardService);
            service.addClipboardHook({
                async onBeforePasteImage(file: File) {
                    expect(file.name).toBe('local.png');
                    expect(file.type).toBe('image/png');
                    return {
                        imageSourceType: ImageSourceType.UUID,
                        source: 'remote-local-file-id',
                    };
                },
            });

            expect(await service.legacyPaste({
                files: [new File(['image'], 'local.png', { type: 'image/png' })],
            })).toBe(true);

            const univerInstanceService = testBed.get(IUniverInstanceService);
            const documentModel = univerInstanceService.getUnit<DocumentDataModel>('file-image-paste-doc', UniverInstanceType.UNIVER_DOC)!;
            const snapshot = documentModel.getSnapshot();
            let drawingSource = '';
            for (const drawing of Object.values(snapshot.drawings ?? {})) {
                const imageDrawing = drawing as { source?: string } | undefined;
                if (imageDrawing?.source === 'remote-local-file-id') {
                    drawingSource = imageDrawing.source;
                    break;
                }
            }

            expect(drawingSource).toBe('remote-local-file-id');
        } finally {
            testBed.univer.dispose();
            vi.unstubAllGlobals();
        }
    });

    it('applies before-paste hooks to plain text before inserting it into the document', async () => {
        const documentData: IDocumentData = {
            id: 'paste-hook-doc',
            body: {
                dataStream: 'Body\r\n',
                paragraphs: [{ paragraphId: 'para_docs_ui_clipboard_fixture_3', startIndex: 4 }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [],
            },
            documentStyle: {},
        };
        const testBed = createCommandTestBed(documentData, [
            [IClipboardInterfaceService, { useClass: TestClipboardInterfaceService }],
            [IDocClipboardService, { useClass: DocClipboardService }],
        ]);
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(InnerPasteCommand);
        commandService.registerCommand(RichTextEditingMutation);
        commandService.registerCommand(SetTextSelectionsOperation);
        const selectionManager = testBed.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: 'paste-hook-doc', subUnitId: '' });
        selectionManager.__TEST_ONLY_add([{
            startOffset: 0,
            endOffset: 0,
            collapsed: true,
            isActive: true,
            segmentId: '',
        }]);
        const service = testBed.get(IDocClipboardService);

        service.addClipboardHook({
            onBeforePaste: () => ({
                dataStream: 'Hooked\r\n',
                paragraphs: [{ paragraphId: 'para_docs_ui_clipboard_fixture_4', startIndex: 6 }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [],
            }),
        });

        expect(await service.legacyPaste({ text: 'Plain', files: [] })).toBe(true);

        const univerInstanceService = testBed.get(IUniverInstanceService);
        const documentModel = univerInstanceService.getUnit<DocumentDataModel>('paste-hook-doc', UniverInstanceType.UNIVER_DOC)!;
        expect(documentModel.getBody()?.dataStream).toContain('Hooked');
        expect(documentModel.getBody()?.dataStream).not.toContain('Plain');

        testBed.univer.dispose();
    });

    it('stops applying a paste hook after the hook disposable is released', async () => {
        const documentData: IDocumentData = {
            id: 'paste-dispose-doc',
            body: {
                dataStream: 'Body\r\n',
                paragraphs: [{ paragraphId: 'para_docs_ui_clipboard_fixture_10', startIndex: 4 }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [],
            },
            documentStyle: {},
        };
        const testBed = createCommandTestBed(documentData, [
            [IClipboardInterfaceService, { useClass: TestClipboardInterfaceService }],
            [IDocClipboardService, { useClass: DocClipboardService }],
        ]);
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(InnerPasteCommand);
        commandService.registerCommand(RichTextEditingMutation);
        commandService.registerCommand(SetTextSelectionsOperation);
        const selectionManager = testBed.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({ unitId: 'paste-dispose-doc', subUnitId: '' });
        selectionManager.__TEST_ONLY_add([{
            startOffset: 4,
            endOffset: 4,
            collapsed: true,
            isActive: true,
            segmentId: '',
        }]);
        const service = testBed.get(IDocClipboardService);
        const disposable = service.addClipboardHook({
            onBeforePaste: () => ({
                dataStream: 'Hooked\r\n',
                paragraphs: [{ paragraphId: 'para_docs_ui_clipboard_fixture_11', startIndex: 6 }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [],
            }),
        });
        disposable.dispose();

        expect(await service.legacyPaste({ text: 'Plain', files: [] })).toBe(true);

        const univerInstanceService = testBed.get(IUniverInstanceService);
        const documentModel = univerInstanceService.getUnit<DocumentDataModel>('paste-dispose-doc', UniverInstanceType.UNIVER_DOC)!;
        expect(documentModel.getBody()?.dataStream).toContain('Plain');
        expect(documentModel.getBody()?.dataStream).not.toContain('Hooked');

        testBed.univer.dispose();
    });

    it('does not paste when the clipboard payload is empty', async () => {
        const documentData: IDocumentData = {
            id: 'empty-paste-doc',
            body: {
                dataStream: 'Body\r\n',
                paragraphs: [{ paragraphId: 'para_docs_ui_clipboard_fixture_12', startIndex: 4 }],
                sectionBreaks: [],
                customBlocks: [],
                textRuns: [],
            },
            documentStyle: {},
        };
        const testBed = createCommandTestBed(documentData, [
            [IClipboardInterfaceService, { useClass: TestClipboardInterfaceService }],
            [IDocClipboardService, { useClass: DocClipboardService }],
        ]);
        const service = testBed.get(IDocClipboardService);

        expect(await service.legacyPaste({ files: [] })).toBe(false);

        const univerInstanceService = testBed.get(IUniverInstanceService);
        const documentModel = univerInstanceService.getUnit<DocumentDataModel>('empty-paste-doc', UniverInstanceType.UNIVER_DOC)!;
        expect(documentModel.getBody()?.dataStream).toBe('Body\r\n');

        testBed.univer.dispose();
    });
});

describe('DocClipboardService copy text hooks', () => {
    it('uses onCopyContent for plain text while preserving the internal document fragment', async () => {
        const clipboard = new TestClipboardInterfaceService();
        const documentData: IDocumentData = {
            id: 'copy-content-hook-doc',
            body: {
                dataStream: 'A\uFFFCC\r\n',
                paragraphs: [{
                    paragraphId: 'para_docs_ui_clipboard_copy_hook',
                    startIndex: 3,
                }],
                customRanges: [{
                    startIndex: 1,
                    endIndex: 1,
                    rangeId: 'formula-1',
                    rangeType: 0,
                    wholeEntity: true,
                }],
            },
            documentStyle: {},
        };
        const testBed = createCommandTestBed(documentData, [
            [IClipboardInterfaceService, { useValue: clipboard }],
            [IDocClipboardService, { useClass: DocClipboardService }],
        ]);
        const selectionManager = testBed.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: documentData.id,
            subUnitId: '',
        });
        const service = testBed.get(IDocClipboardService);
        service.addClipboardHook({
            onCopyContent: (start, end, context) => {
                expect([start, end]).toEqual([0, 3]);
                expect(context.unitId).toBe(documentData.id);
                expect(context.segmentId).toBe('');
                expect(context.body.dataStream).toBe(documentData.body?.dataStream);
                return 'A42C';
            },
        });

        expect(await service.copy(SliceBodyType.copy, [{
            startOffset: 0,
            endOffset: 3,
            collapsed: false,
            segmentId: '',
        }])).toBe(true);
        expect(clipboard.writes[0].text).toBe('A42C');
        const internalJson = clipboard.writes[0].custom?.[DOC_INTERNAL_FRAGMENT_MIME];
        expect(parseInternalClipboardFragment(internalJson)?.body?.dataStream)
            .toContain('\uFFFC');

        testBed.univer.dispose();
    });

    it('passes source-to-target Custom Range identity mappings to paste adapters', async () => {
        const clipboard = new TestClipboardInterfaceService();
        const documentData: IDocumentData = {
            id: 'custom-range-mapping-doc',
            body: {
                dataStream: '\uFFFC\r\n',
                paragraphs: [{
                    paragraphId: 'para_docs_ui_clipboard_mapping',
                    startIndex: 1,
                }],
                customRanges: [{
                    startIndex: 0,
                    endIndex: 0,
                    rangeId: 'source-range',
                    rangeType: 0,
                    wholeEntity: true,
                }],
            },
            documentStyle: {},
        };
        const testBed = createCommandTestBed(documentData, [
            [IClipboardInterfaceService, { useValue: clipboard }],
            [IDocClipboardService, { useClass: DocClipboardService }],
            [IDocClipboardPasteAdapterService, {
                useClass: DocClipboardPasteAdapterService,
            }],
        ]);
        const commandService = testBed.get(ICommandService);
        commandService.registerCommand(InnerPasteCommand);
        commandService.registerCommand(RichTextEditingMutation);
        commandService.registerCommand(SetTextSelectionsOperation);
        const mappings = vi.fn<
            NonNullable<IDocClipboardPasteAdapter['getPasteMutationInfos']>
        >(() => ({
            redoMutations: [],
            undoMutations: [],
        }));
        testBed.get(IDocClipboardPasteAdapterService).registerAdapter({
            getPasteMutationInfos: mappings,
        });
        const selectionManager = testBed.get(DocSelectionManagerService);
        selectionManager.__TEST_ONLY_setCurrentSelection({
            unitId: documentData.id,
            subUnitId: '',
        });
        const service = testBed.get(IDocClipboardService);

        expect(await service.copy(SliceBodyType.copy, [{
            startOffset: 0,
            endOffset: 1,
            collapsed: false,
            segmentId: '',
        }])).toBe(true);
        selectionManager.__TEST_ONLY_add([{
            startOffset: 1,
            endOffset: 1,
            collapsed: true,
            isActive: true,
            segmentId: '',
        }]);
        expect(await service.paste()).toBe(true);

        const firstCall = mappings.mock.calls[0];
        if (!firstCall) {
            throw new Error('Expected the paste adapter to be called.');
        }
        const mapping = firstCall[0].customRangeMappings?.[0];
        if (!mapping) {
            throw new Error('Expected one Custom Range mapping.');
        }
        expect(mapping.sourceRange.rangeId).toBe('source-range');
        expect(mapping.targetRange.rangeId).not.toBe('source-range');

        testBed.univer.dispose();
    });
});
