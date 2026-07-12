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

import type { IDocumentBody } from '../../../../types/interfaces';
import { DocumentBlockRangeType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { DataStreamTreeTokenType } from '../../types';
import { deleteBlockRanges, insertBlockRanges } from '../apply-utils/common';
import { BuildTextUtils } from '../build-utils';
import { getPlainText } from '../build-utils/parse';
import { validateDocBodyStructure } from '../structure-validator';
import { TextX } from '../text-x';
import { getBodySlice, getBodySliceForTextXAction, getParagraphsSlice, SliceBodyType } from '../utils';

describe('document block ranges', () => {
    it('moves following block ranges when text is inserted before them', () => {
        const body: IDocumentBody = {
            dataStream: 'A\rB\r\n',
            blockRanges: [{ blockId: 'callout-1', blockType: DocumentBlockRangeType.CALLOUT, startIndex: 2, endIndex: 3 }],
        };

        insertBlockRanges(body, { dataStream: 'XX' }, 2, 1);

        expect(body.blockRanges).toEqual([
            { blockId: 'callout-1', blockType: DocumentBlockRangeType.CALLOUT, startIndex: 4, endIndex: 5 },
        ]);
    });

    it('expands containing block ranges when text is inserted inside them', () => {
        const body: IDocumentBody = {
            dataStream: `${DataStreamTreeTokenType.BLOCK_START}A\r${DataStreamTreeTokenType.BLOCK_END}\n`,
            blockRanges: [{ blockId: 'callout-1', blockType: DocumentBlockRangeType.CALLOUT, startIndex: 0, endIndex: 3 }],
        };

        insertBlockRanges(body, { dataStream: 'XX' }, 2, 2);

        expect(body.blockRanges).toEqual([
            { blockId: 'callout-1', blockType: DocumentBlockRangeType.CALLOUT, startIndex: 0, endIndex: 5 },
        ]);
    });

    it('cuts block ranges to the copied body with relative indexes', () => {
        const body: IDocumentBody = {
            dataStream: `A\r${DataStreamTreeTokenType.BLOCK_START}B\r${DataStreamTreeTokenType.BLOCK_END}C\r\n`,
            blockRanges: [{ blockId: 'callout-1', blockType: DocumentBlockRangeType.CALLOUT, startIndex: 2, endIndex: 5 }],
        };

        const slice = getBodySlice(body, 2, 6);

        expect(slice.dataStream).toBe(`${DataStreamTreeTokenType.BLOCK_START}B\r${DataStreamTreeTokenType.BLOCK_END}`);
        expect(slice.blockRanges).toEqual([
            { blockId: 'callout-1', blockType: DocumentBlockRangeType.CALLOUT, startIndex: 0, endIndex: 3 },
        ]);
    });

    it('does not include partial block ranges in action bodies', () => {
        const body: IDocumentBody = {
            dataStream: `A\r${DataStreamTreeTokenType.BLOCK_START}B\r${DataStreamTreeTokenType.BLOCK_END}C\r\n`,
            blockRanges: [{ blockId: 'callout-1', blockType: DocumentBlockRangeType.CALLOUT, startIndex: 2, endIndex: 5 }],
        };

        const slice = getBodySliceForTextXAction(body, 3, 5, false);

        expect(slice.dataStream).toBe('B\r');
        expect(slice.blockRanges).toBeUndefined();
    });

    it('does not treat a block end sentinel as text in the following paragraph', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.BLOCK_START}A${T.PARAGRAPH}${T.BLOCK_END}B${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 2, paragraphId: 'inside-block' },
                { startIndex: 5, paragraphId: 'after-block' },
            ],
        };

        expect(getParagraphsSlice(body, 3, 4, SliceBodyType.copy)).toBeUndefined();
        expect(getParagraphsSlice(body, 4, 5, SliceBodyType.copy)).toEqual([{
            startIndex: 1,
            paragraphId: 'after-block',
        }]);
    });

    it('removes fully deleted block ranges', () => {
        const body: IDocumentBody = {
            dataStream: `${DataStreamTreeTokenType.BLOCK_START}A\r${DataStreamTreeTokenType.BLOCK_END}\n`,
            blockRanges: [{ blockId: 'callout-1', blockType: DocumentBlockRangeType.CALLOUT, startIndex: 0, endIndex: 3 }],
        };

        const removed = deleteBlockRanges(body, 4, 0);

        expect(removed).toEqual([{ blockId: 'callout-1', blockType: DocumentBlockRangeType.CALLOUT, startIndex: 0, endIndex: 3 }]);
        expect(body.blockRanges).toEqual([]);
    });

    it('keeps block sentinels and a paragraph when a deletion crosses one boundary', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.BLOCK_START}A${T.PARAGRAPH}${T.BLOCK_END}B${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 2, paragraphId: 'inside-block' },
                { startIndex: 5, paragraphId: 'after-block' },
            ],
            sectionBreaks: [{ sectionId: 'section_fixture_5', startIndex: 6 }],
            blockRanges: [{
                blockId: 'code-1',
                blockType: DocumentBlockRangeType.CODE,
                startIndex: 0,
                endIndex: 3,
            }],
        };

        const actions = BuildTextUtils.selection.delete([
            { startOffset: 1, endOffset: 5, collapsed: false },
        ], body);
        TextX.apply(body, actions);

        expect(body.dataStream).toBe(`${T.BLOCK_START}${T.PARAGRAPH}${T.BLOCK_END}${T.PARAGRAPH}${T.SECTION_BREAK}`);
        expect(body.blockRanges).toEqual([{
            blockId: 'code-1',
            blockType: DocumentBlockRangeType.CODE,
            startIndex: 0,
            endIndex: 2,
        }]);
        expect(validateDocBodyStructure(body)).toEqual([]);
    });

    it('allows deleting a fully selected block atomically', () => {
        const T = DataStreamTreeTokenType;
        const body: IDocumentBody = {
            dataStream: `${T.BLOCK_START}A${T.PARAGRAPH}${T.BLOCK_END}B${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [
                { startIndex: 2, paragraphId: 'inside-block' },
                { startIndex: 5, paragraphId: 'after-block' },
            ],
            sectionBreaks: [{ sectionId: 'section_fixture_6', startIndex: 6 }],
            blockRanges: [{
                blockId: 'code-1',
                blockType: DocumentBlockRangeType.CODE,
                startIndex: 0,
                endIndex: 3,
            }],
        };

        const actions = BuildTextUtils.selection.delete([
            { startOffset: 0, endOffset: 4, collapsed: false },
        ], body);
        TextX.apply(body, actions);

        expect(body.dataStream).toBe(`B${T.PARAGRAPH}${T.SECTION_BREAK}`);
        expect(body.blockRanges).toEqual([]);
        expect(validateDocBodyStructure(body)).toEqual([]);
    });

    it('removes block tokens from plain text', () => {
        const stream = `${DataStreamTreeTokenType.BLOCK_START}Callout\r${DataStreamTreeTokenType.BLOCK_END}\n`;

        expect(getPlainText(stream)).toBe('Callout');
    });
});
