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
import type { IRectRangeWithStyle } from '@univerjs/engine-render';
import {
    DataStreamTreeTokenType,
    DOC_RANGE_TYPE,
    ICommandService,
    IUniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation, SetTextSelectionsOperation } from '@univerjs/docs';
import { ImageSourceType } from '@univerjs/drawing';
import { IClipboardInterfaceService } from '@univerjs/ui';
import { describe, expect, it } from 'vitest';
import { createCommandTestBed } from '../../../commands/commands/__tests__/create-command-test-bed';
import { InnerPasteCommand } from '../../../commands/commands/clipboard.inner.command';
import { DocClipboardService, getTableClipboardBodySlice, IDocClipboardService } from '../clipboard.service';

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

        expect(copied).toBe(true);
        expect(clipboard.writes[0].text).toBe('Alpha');
        expect(clipboard.writes[0].html).toContain('data-copy-id=');
        expect(clipboard.writes[0].html).toContain('<!--univer-doc-fragment:');
        expect(clipboard.writes[0].custom).toHaveProperty('application/x-doc-fragment+json');

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
});
