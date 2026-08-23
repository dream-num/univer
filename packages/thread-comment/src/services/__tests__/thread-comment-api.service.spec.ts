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
import { isThreadCommentDocumentBody, normalizeThreadCommentContent } from '../thread-comment-api.service';

describe('normalizeThreadCommentContent', () => {
    it('accepts agent-friendly plain text and normalizes document line endings', () => {
        expect(normalizeThreadCommentContent('First\nSecond')).toEqual({
            dataStream: 'First\rSecond\r\n',
        });
    });

    it('preserves an existing rich-text document body', () => {
        const body = { dataStream: 'Styled\r\n', textRuns: [{ st: 0, ed: 6, ts: { bl: 1 } }] };

        expect(normalizeThreadCommentContent(body)).toBe(body);
    });

    it('rejects malformed rich-text bodies at the facade boundary', () => {
        expect(() => normalizeThreadCommentContent({ unexpected: true } as never)).toThrow('Invalid thread comment content');
        expect(() => normalizeThreadCommentContent('  \n')).toThrow('Thread comment content cannot be empty');
        expect(() => normalizeThreadCommentContent({ dataStream: '\r\n' })).toThrow('Thread comment content cannot be empty');
    });

    it('rejects malformed optional document fields before they reach the editor', () => {
        expect(isThreadCommentDocumentBody({ dataStream: 'safe\r\n', customRanges: {} })).toBe(false);
        expect(isThreadCommentDocumentBody({ dataStream: 'safe\r\n', textRuns: 'bad' })).toBe(false);
        expect(isThreadCommentDocumentBody({ dataStream: 'safe\r\n', payloads: { key: 1 } })).toBe(false);
        expect(isThreadCommentDocumentBody({
            dataStream: '<img src=x onerror=alert(1)>\r\n',
            customRanges: [],
            payloads: { key: 'value' },
        })).toBe(true);
    });

    it('normalizes a large plain-text comment without truncating its content', () => {
        const content = 'x'.repeat(100_000);

        expect(normalizeThreadCommentContent(content).dataStream).toBe(`${content}\r\n`);
    });
});
