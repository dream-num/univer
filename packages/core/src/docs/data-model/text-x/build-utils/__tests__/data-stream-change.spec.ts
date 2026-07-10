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

import type { IDocumentBody } from '../../../../../types/interfaces';
import { describe, expect, it } from 'vitest';
import { DocumentBlockRangeType } from '../../../../../types/interfaces';
import { DataStreamTreeTokenType } from '../../../types';
import { getSingleDataStreamChange } from '../data-stream-change';

describe('getSingleDataStreamChange', () => {
    it('anchors an inserted block before an adjacent identical start sentinel', () => {
        const T = DataStreamTreeTokenType;
        const previousBody: IDocumentBody = {
            dataStream: `${T.BLOCK_START}A${T.PARAGRAPH}${T.BLOCK_END}${T.BLOCK_START}B${T.PARAGRAPH}${T.BLOCK_END}`,
            blockRanges: [
                { blockId: 'code-1', blockType: DocumentBlockRangeType.CODE, startIndex: 0, endIndex: 3 },
                { blockId: 'quote-1', blockType: DocumentBlockRangeType.QUOTE, startIndex: 4, endIndex: 7 },
            ],
        };
        const nextBody: IDocumentBody = {
            dataStream: `${T.BLOCK_START}A${T.PARAGRAPH}${T.BLOCK_END}${T.BLOCK_START}${T.PARAGRAPH}${T.BLOCK_END}${T.BLOCK_START}B${T.PARAGRAPH}${T.BLOCK_END}`,
            blockRanges: [
                previousBody.blockRanges![0],
                { blockId: 'callout-1', blockType: DocumentBlockRangeType.CALLOUT, startIndex: 4, endIndex: 6 },
                { blockId: 'quote-1', blockType: DocumentBlockRangeType.QUOTE, startIndex: 7, endIndex: 10 },
            ],
        };

        expect(getSingleDataStreamChange(previousBody, nextBody)).toEqual({
            start: 4,
            deleteLength: 0,
            insertLength: 3,
        });
    });

    it('falls back to the minimal contiguous text change', () => {
        expect(getSingleDataStreamChange(
            { dataStream: 'Alpha\r' },
            { dataStream: 'AlXpha\r' }
        )).toEqual({ start: 2, deleteLength: 0, insertLength: 1 });
    });
});
