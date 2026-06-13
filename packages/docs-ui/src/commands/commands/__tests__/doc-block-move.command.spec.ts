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
import { BlockType, CustomRangeType, DocumentBlockRangeType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { buildMoveDocBlockActions } from '../doc-block-move.command';

describe('buildMoveDocBlockActions', () => {
    it('moves a paragraph and remaps paragraph indexes', () => {
        const documentData = createDocument('A\rB\rC\r\n', {
            paragraphs: [{ paragraphId: 'para_docs_ui_fixture_9', startIndex: 1 }, { paragraphId: 'para_docs_ui_fixture_10', startIndex: 3 }, { paragraphId: 'para_docs_ui_fixture_11', startIndex: 5 }],
            sectionBreaks: [{ startIndex: 6 }],
        });

        const { nextDocumentData, movedRange } = buildMoveDocBlockActions({
            documentData,
            sourceRange: { startOffset: 0, endOffset: 2 },
            targetOffset: 6,
        });

        expect(nextDocumentData.body?.dataStream).toBe('B\rC\rA\r\n');
        expect(nextDocumentData.body?.paragraphs?.map((item) => item.startIndex)).toEqual([1, 3, 5]);
        expect(movedRange).toEqual({ startOffset: 4, endOffset: 6 });
    });

    it('moves a block range as one unit', () => {
        const documentData = createDocument('aa\rBB\rcc\r\n', {
            paragraphs: [{ paragraphId: 'para_docs_ui_fixture_12', startIndex: 2 }, { paragraphId: 'para_docs_ui_fixture_13', startIndex: 5 }, { paragraphId: 'para_docs_ui_fixture_14', startIndex: 8 }],
            sectionBreaks: [{ startIndex: 9 }],
            blockRanges: [{ blockId: 'quote-1', blockType: DocumentBlockRangeType.QUOTE, startIndex: 3, endIndex: 5 }],
        });

        const { nextDocumentData, movedRange } = buildMoveDocBlockActions({
            documentData,
            sourceRange: { startOffset: 3, endOffset: 6 },
            targetOffset: 0,
        });

        expect(nextDocumentData.body?.dataStream).toBe('BB\raa\rcc\r\n');
        expect(nextDocumentData.body?.blockRanges?.[0]).toMatchObject({ startIndex: 0, endIndex: 2 });
        expect(nextDocumentData.body?.paragraphs?.map((item) => item.startIndex)).toEqual([2, 5, 8]);
        expect(movedRange).toEqual({ startOffset: 0, endOffset: 3 });
    });

    it('moves a table range and remaps custom ranges and text runs', () => {
        const documentData = createDocument('aa\rTT\rcc\r\n', {
            paragraphs: [{ paragraphId: 'para_docs_ui_fixture_15', startIndex: 2 }, { paragraphId: 'para_docs_ui_fixture_16', startIndex: 5 }, { paragraphId: 'para_docs_ui_fixture_17', startIndex: 8 }],
            sectionBreaks: [{ startIndex: 9 }],
            tables: [{ tableId: 'table-1', startIndex: 3, endIndex: 6 }],
            customRanges: [{ rangeId: 'comment-1', rangeType: CustomRangeType.COMMENT, startIndex: 6, endIndex: 7 }],
            textRuns: [{ st: 6, ed: 8, ts: {} }],
        });

        const { nextDocumentData } = buildMoveDocBlockActions({
            documentData,
            sourceRange: { startOffset: 3, endOffset: 6 },
            targetOffset: 0,
        });

        expect(nextDocumentData.body?.dataStream).toBe('TT\raa\rcc\r\n');
        expect(nextDocumentData.body?.tables?.[0]).toMatchObject({ startIndex: 0, endIndex: 3 });
        expect(nextDocumentData.body?.customRanges?.[0]).toMatchObject({ startIndex: 6, endIndex: 7 });
        expect(nextDocumentData.body?.textRuns?.[0]).toMatchObject({ st: 6, ed: 8 });
    });

    it('moves a custom block paragraph and keeps the custom block attached', () => {
        const documentData = createDocument('\b\raa\r\n', {
            paragraphs: [{ paragraphId: 'para_docs_ui_fixture_18', startIndex: 1 }, { paragraphId: 'para_docs_ui_fixture_19', startIndex: 4 }],
            sectionBreaks: [{ startIndex: 5 }],
            customBlocks: [{ blockId: 'custom-1', blockType: BlockType.CUSTOM, startIndex: 0 }],
        });

        const { nextDocumentData } = buildMoveDocBlockActions({
            documentData,
            sourceRange: { startOffset: 0, endOffset: 2 },
            targetOffset: 5,
        });

        expect(nextDocumentData.body?.dataStream).toBe('aa\r\b\r\n');
        expect(nextDocumentData.body?.customBlocks?.[0]).toMatchObject({ startIndex: 3 });
    });
});

function createDocument(dataStream: string, body: Partial<NonNullable<IDocumentData['body']>>): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream,
            customBlocks: [],
            ...body,
        },
        documentStyle: {
            pageSize: {
                width: 594.3,
                height: 840.51,
            },
            marginTop: 72,
            marginBottom: 72,
            marginLeft: 72,
            marginRight: 72,
        },
    };
}
