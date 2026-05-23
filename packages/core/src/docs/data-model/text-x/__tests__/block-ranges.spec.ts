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
import { describe, expect, it } from 'vitest';
import { DataStreamTreeTokenType } from '../../types';
import { deleteBlockRanges, insertBlockRanges } from '../apply-utils/common';
import { getPlainText } from '../build-utils/parse';
import { getBodySlice } from '../utils';

describe('document block ranges', () => {
    it('moves following block ranges when text is inserted before them', () => {
        const body: IDocumentBody = {
            dataStream: 'A\rB\r\n',
            blockRanges: [{ blockId: 'callout-1', blockType: 'callout', startIndex: 2, endIndex: 3 }],
        };

        insertBlockRanges(body, { dataStream: 'XX' }, 2, 1);

        expect(body.blockRanges).toEqual([
            { blockId: 'callout-1', blockType: 'callout', startIndex: 4, endIndex: 5 },
        ]);
    });

    it('expands containing block ranges when text is inserted inside them', () => {
        const body: IDocumentBody = {
            dataStream: `${DataStreamTreeTokenType.BLOCK_START}A\r${DataStreamTreeTokenType.BLOCK_END}\n`,
            blockRanges: [{ blockId: 'callout-1', blockType: 'callout', startIndex: 0, endIndex: 3 }],
        };

        insertBlockRanges(body, { dataStream: 'XX' }, 2, 2);

        expect(body.blockRanges).toEqual([
            { blockId: 'callout-1', blockType: 'callout', startIndex: 0, endIndex: 5 },
        ]);
    });

    it('cuts block ranges to the copied body with relative indexes', () => {
        const body: IDocumentBody = {
            dataStream: `A\r${DataStreamTreeTokenType.BLOCK_START}B\r${DataStreamTreeTokenType.BLOCK_END}C\r\n`,
            blockRanges: [{ blockId: 'callout-1', blockType: 'callout', startIndex: 2, endIndex: 5 }],
        };

        const slice = getBodySlice(body, 2, 6);

        expect(slice.dataStream).toBe(`${DataStreamTreeTokenType.BLOCK_START}B\r${DataStreamTreeTokenType.BLOCK_END}`);
        expect(slice.blockRanges).toEqual([
            { blockId: 'callout-1', blockType: 'callout', startIndex: 0, endIndex: 3 },
        ]);
    });

    it('removes fully deleted block ranges', () => {
        const body: IDocumentBody = {
            dataStream: `${DataStreamTreeTokenType.BLOCK_START}A\r${DataStreamTreeTokenType.BLOCK_END}\n`,
            blockRanges: [{ blockId: 'callout-1', blockType: 'callout', startIndex: 0, endIndex: 3 }],
        };

        const removed = deleteBlockRanges(body, 4, 0);

        expect(removed).toEqual([{ blockId: 'callout-1', blockType: 'callout', startIndex: 0, endIndex: 3 }]);
        expect(body.blockRanges).toEqual([]);
    });

    it('removes block tokens from plain text', () => {
        const stream = `${DataStreamTreeTokenType.BLOCK_START}Callout\r${DataStreamTreeTokenType.BLOCK_END}\n`;

        expect(getPlainText(stream)).toBe('Callout');
    });
});
