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

import { describe, expect, it } from 'vitest';
import { transformDocumentTextRanges } from '../core-editing.mutation';

describe('transformDocumentTextRanges', () => {
    it('moves an active body caret through an insertion with right priority', () => {
        expect(transformDocumentTextRanges(['body', {
            et: 'text-x',
            e: [
                { t: 'r', len: 10 },
                { t: 'i', len: 6, body: { dataStream: 'REMOTE' } },
            ],
        }], [{
            startOffset: 14,
            endOffset: 14,
            collapsed: true,
            isActive: true,
            segmentId: '',
        }])).toEqual([expect.objectContaining({
            startOffset: 20,
            endOffset: 20,
            collapsed: true,
            isActive: true,
        })]);
    });

    it('treats an omitted segment id as the document body', () => {
        expect(transformDocumentTextRanges(['body', {
            et: 'text-x',
            e: [
                { t: 'i', len: 6, body: { dataStream: 'REMOTE' } },
            ],
        }], [{
            startOffset: 14,
            endOffset: 14,
            collapsed: true,
            isActive: true,
        }])).toEqual([expect.objectContaining({
            startOffset: 20,
            endOffset: 20,
            collapsed: true,
            isActive: true,
        })]);
    });

    it('does not move a body selection through a header mutation', () => {
        const range = {
            startOffset: 14,
            endOffset: 18,
            collapsed: false,
            segmentId: '',
        };
        expect(transformDocumentTextRanges(['header-1', 'body', {
            et: 'text-x',
            e: [{ t: 'i', len: 6, body: { dataStream: 'REMOTE' } }],
        }], [range])).toEqual([range]);
    });
});
