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
import {
    buildPlainTextInsertBody,
    getNormalizedPlainTextCursorOffset,
    getRemovedLeadingParagraphBreakLength,
} from '../facade/utils';

describe('facade utils', () => {
    it('removes a leading paragraph break when plain text is inserted at the document start', () => {
        const body = buildPlainTextInsertBody('\r\nHello', { removeLeadingParagraphBreak: true });

        expect(body).toEqual({
            dataStream: 'Hello',
            customDecorations: [],
            customRanges: [],
            textRuns: [],
        });
    });

    it('keeps a leading paragraph break when the caller does not remove it', () => {
        const body = buildPlainTextInsertBody('\r\nHello');

        expect(body.dataStream).toBe('\rHello');
        expect(body.paragraphs).toEqual([{ startIndex: 0 }]);
    });

    it('normalizes plain text line feeds and adds paragraph metadata', () => {
        const body = buildPlainTextInsertBody('Hello\nWorld\rAgain');

        expect(body.dataStream).toBe('Hello\rWorld\rAgain');
        expect(body.paragraphs).toEqual([{ startIndex: 5 }, { startIndex: 11 }]);
    });

    it('adds paragraph metadata for a trailing paragraph break', () => {
        const body = buildPlainTextInsertBody('Hello\n');

        expect(body.dataStream).toBe('Hello\r');
        expect(body.paragraphs).toEqual([{ startIndex: 5 }]);
    });

    it('reports removed leading paragraph break length for cursor offsets', () => {
        expect(getRemovedLeadingParagraphBreakLength('\nHello', true)).toBe(1);
        expect(getRemovedLeadingParagraphBreakLength('\r\nHello', true)).toBe(1);
        expect(getRemovedLeadingParagraphBreakLength('\r\nHello')).toBe(0);
    });

    it('normalizes cursor offsets with collapsed paragraph breaks', () => {
        expect(getNormalizedPlainTextCursorOffset('Hello\r\n', 'Hello\r\n'.length)).toBe('Hello\r'.length);
        expect(getNormalizedPlainTextCursorOffset('\r\nHello', '\r\nHello'.length, true)).toBe('Hello'.length);
    });
});
