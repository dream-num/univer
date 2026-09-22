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

import type { IDocumentData } from '@univerjs/core';
import { BooleanNumber, DataStreamTreeTokenType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { applyDocPasteMode, getClipboardPlainText } from '../paste-options';

describe('document paste format conversion', () => {
    it('converts table cells to tabs and rows to newlines without carrying table resources', () => {
        const t = DataStreamTreeTokenType;
        const row = (cells: string[]) => t.TABLE_ROW_START + cells.map((text) => `${t.TABLE_CELL_START}${text}\r\n${t.TABLE_CELL_END}`).join('') + t.TABLE_ROW_END;
        const source: Partial<IDocumentData> = {
            body: {
                dataStream: t.TABLE_START + row(['A', 'B']) + row(['C', 'D']) + t.TABLE_END,
                tables: [{ startIndex: 0, endIndex: 30, tableId: 'table' }],
            },
            tableSource: {},
        };
        expect(getClipboardPlainText(source)).toBe('A\tB\nC\tD');
        const converted = applyDocPasteMode(source, 'text', { textStyle: { fs: 12 } }, 'ABCD');
        expect(converted.body?.dataStream).toBe('A\tB\rC\tD');
        expect(converted.body?.tables).toBeUndefined();
        expect(converted.tableSource).toBeUndefined();
    });

    it('keeps structure and emphasis while matching destination fonts and paragraph spacing', () => {
        const source: Partial<IDocumentData> = {
            body: {
                dataStream: 'Bold and italic\r',
                textRuns: [
                    { st: 0, ed: 4, ts: { bl: BooleanNumber.TRUE, fs: 30, ff: 'Georgia' } },
                    { st: 9, ed: 15, ts: { it: BooleanNumber.TRUE, fs: 30 } },
                ],
                paragraphs: [{ startIndex: 15, paragraphId: 'source', paragraphStyle: { spaceAbove: { v: 40 } } }],
            },
        };
        const converted = applyDocPasteMode(source, 'destination', {
            textStyle: { ff: 'Arial', fs: 12 },
            paragraphStyle: { spaceAbove: { v: 6 }, headingId: 'target-heading' },
        });
        expect(converted.body?.dataStream).toBe(source.body?.dataStream);
        expect(converted.body?.textRuns).toContainEqual({ st: 0, ed: 4, ts: { ff: 'Arial', fs: 12, bl: BooleanNumber.TRUE } });
        expect(converted.body?.textRuns).toContainEqual({ st: 4, ed: 9, ts: { ff: 'Arial', fs: 12 } });
        expect(converted.body?.textRuns).toContainEqual({ st: 9, ed: 15, ts: { ff: 'Arial', fs: 12, it: BooleanNumber.TRUE } });
        expect(converted.body?.paragraphs?.[0].paragraphStyle).toEqual({ spaceAbove: { v: 6 } });
        expect(source.body?.textRuns?.[0].ts?.fs).toBe(30);
    });

    it('removes hyperlinks and images in text-only mode without losing line breaks', () => {
        const source: Partial<IDocumentData> = {
            body: { dataStream: `First\rSecond${DataStreamTreeTokenType.CUSTOM_BLOCK}\r\n`, customBlocks: [{ startIndex: 12, blockId: 'image' }] },
            drawings: {},
        };
        const converted = applyDocPasteMode(source, 'text', { textStyle: {} });
        expect(converted.body?.dataStream).toBe('First\rSecond');
        expect(converted.body?.customBlocks).toBeUndefined();
        expect(converted.drawings).toBeUndefined();
        const link = applyDocPasteMode({ body: { dataStream: 'https://example.com' } }, 'text', { textStyle: {} });
        expect(link.body?.customRanges).toBeUndefined();
    });
});
