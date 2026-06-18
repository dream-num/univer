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

import type { IDocumentBody } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import {
    buildPlainTextInsertBody,
    getNormalizedPlainTextCursorOffset,
    getParagraphStyleAtOffset,
    getRemovedLeadingParagraphBreakLength,
} from '../utils';

describe('doc facade utils', () => {
    it('should build normalized paragraph insert bodies with independent paragraph styles', () => {
        const paragraphStyle = { horizontalAlign: 2 };
        const body = buildPlainTextInsertBody('\nTitle\nBody\r\n', {
            paragraphStyle,
            removeLeadingParagraphBreak: true,
        });

        paragraphStyle.horizontalAlign = 1;

        expect(body.dataStream).toBe('Title\rBody\r');
        expect(body.paragraphs?.map((paragraph) => paragraph.startIndex)).toEqual([5, 10]);
        expect(body.paragraphs?.[0].paragraphId).toMatch(/^para_/);
        expect(body.paragraphs?.[1].paragraphId).toMatch(/^para_/);
        expect(body.paragraphs?.[0].paragraphId).not.toBe(body.paragraphs?.[1].paragraphId);
        expect(body.paragraphs?.[0].paragraphStyle?.horizontalAlign).toBe(2);
    });

    it('should calculate cursor offsets after line ending normalization and leading break removal', () => {
        expect(getRemovedLeadingParagraphBreakLength('\nTitle', true)).toBe(1);
        expect(getRemovedLeadingParagraphBreakLength('\nTitle', false)).toBe(0);
        expect(getNormalizedPlainTextCursorOffset('\nA\r\nB', 4, true)).toBe(2);
    });

    it('should reuse the paragraph style surrounding an insertion offset', () => {
        const body: IDocumentBody = {
            dataStream: 'A\rB\r\n',
            paragraphs: [
                { startIndex: 1, paragraphId: 'para_a', paragraphStyle: { horizontalAlign: 1 } },
                { startIndex: 3, paragraphId: 'para_b', paragraphStyle: { horizontalAlign: 2 } },
            ],
        };

        expect(getParagraphStyleAtOffset(body, 0)?.horizontalAlign).toBe(1);
        expect(getParagraphStyleAtOffset(body, 2)?.horizontalAlign).toBe(2);
        expect(getParagraphStyleAtOffset({ dataStream: '' }, 0)).toBeUndefined();
    });
});
