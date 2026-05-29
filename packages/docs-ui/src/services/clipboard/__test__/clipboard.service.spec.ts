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

import type { IDocumentBody, IDocumentData } from '@univerjs/core';
import type { IRectRangeWithStyle } from '@univerjs/engine-render';
import { DataStreamTreeTokenType, DOC_RANGE_TYPE } from '@univerjs/core';
import { ImageSourceType } from '@univerjs/drawing';
import { describe, expect, it, vi } from 'vitest';
import { DocClipboardService, getTableClipboardBodySlice } from '../clipboard.service';

describe('DocClipboardService table copy helpers', () => {
    it('should keep table metadata when copying an entire selected docs table', () => {
        const tokens = DataStreamTreeTokenType;
        const tableStream = tokens.TABLE_START +
            tokens.TABLE_ROW_START +
            tokens.TABLE_CELL_START +
            'A\r\n' +
            tokens.TABLE_CELL_END +
            tokens.TABLE_CELL_START +
            'B\r\n' +
            tokens.TABLE_CELL_END +
            tokens.TABLE_ROW_END +
            tokens.TABLE_END;
        const dataStream = `Intro\r${tableStream}Tail\r`;
        const tableStart = 'Intro\r'.length;
        const tableEnd = tableStart + tableStream.length;
        const body: IDocumentBody = {
            dataStream,
            paragraphs: [
                { startIndex: 5 },
                { startIndex: tableStart + tokens.TABLE_START.length + tokens.TABLE_ROW_START.length + tokens.TABLE_CELL_START.length + 1 },
                { startIndex: tableStart + tokens.TABLE_START.length + tokens.TABLE_ROW_START.length + tokens.TABLE_CELL_START.length + 'A\r\n'.length + tokens.TABLE_CELL_END.length + tokens.TABLE_CELL_START.length + 1 },
                { startIndex: dataStream.length - 1 },
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

    it('should upload base64 images embedded in pasted html before converting to docs drawings', async () => {
        let pastedDoc: Partial<IDocumentData> | undefined;
        const executeCommand = vi.fn(async (_id, params) => {
            pastedDoc = params.doc;
            return true;
        });
        const uploadImage = vi.fn(async (file: File) => {
            expect(file.type).toBe('image/png');

            return {
                imageSourceType: ImageSourceType.UUID,
                source: 'remote-file-id',
            };
        });
        const service = new DocClipboardService(
            { getCurrentUnitOfType: () => ({ getUnitId: () => 'doc-1' }) } as any,
            { error: vi.fn(), warn: vi.fn() } as any,
            { executeCommand } as any,
            {} as any,
            {
                getActiveTextRange: () => ({ segmentId: '', endOffset: 0 }),
                getTextRanges: () => [{ startOffset: 0, endOffset: 0 }],
            } as any
        ) as DocClipboardService;
        const source = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lz6N4wAAAABJRU5ErkJggg==';

        service.addClipboardHook({ onBeforePasteImage: uploadImage });
        await service.legacyPaste({
            html: `<p><img src="${source}" width="2" height="3"></p>`,
            files: [],
        });

        const block = pastedDoc?.body?.customBlocks?.[0];
        const drawing = block ? pastedDoc?.drawings?.[block.blockId] : undefined;

        expect(uploadImage).toHaveBeenCalledTimes(1);
        expect(drawing).toMatchObject({
            imageSourceType: ImageSourceType.UUID,
            source: 'remote-file-id',
        });
        expect(JSON.stringify(pastedDoc)).not.toContain('data:image');
    });
});
