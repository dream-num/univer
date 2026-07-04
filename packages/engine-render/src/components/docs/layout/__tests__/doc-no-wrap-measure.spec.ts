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
import { describe, expect, it, vi } from 'vitest';
import { FontCache } from '../shaping-engine/font-cache';
import { measureDocumentNoWrapTextWidth } from '../doc-no-wrap-measure';

function createDocument(dataStream: string): IDocumentData {
    return {
        id: 'doc-no-wrap-measure-test',
        body: {
            dataStream,
            textRuns: [],
            paragraphs: [],
        },
        documentStyle: {
            pageSize: {
                width: 4000,
                height: Infinity,
            },
        },
    };
}

describe('measureDocumentNoWrapTextWidth', () => {
    it('uses docs CJK-Latin spacing for mixed no-wrap text', () => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: Array.from(text).reduce((total, char) => total + (/[\u2E80-\u9FFF\uF900-\uFAFF]/u.test(char) ? 20 : 10), 0),
        }) as never);

        expect(measureDocumentNoWrapTextWidth(createDocument('A好B\r\n'))).toBe(50);
        expect(measureDocumentNoWrapTextWidth(createDocument('ABC\r\n'))).toBe(30);
        expect(measureDocumentNoWrapTextWidth(createDocument('你好\r\n'))).toBe(40);

        measureSpy.mockRestore();
    });

    it('keeps trailing whitespace local to the current line', () => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: text.length * 10,
        }) as never);

        expect(measureDocumentNoWrapTextWidth(createDocument('A  \r\nBBBB\r\n'))).toBe(40);

        measureSpy.mockRestore();
    });
});
