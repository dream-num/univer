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
import { CustomRangeType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getDocHyperLinkTarget, getDocHyperLinkTargetLabel } from '../hyper-link-target';

describe('internal hyperlink target labels', () => {
    it('uses the referenced content for bookmarks and headings without changing the actual link target', () => {
        const body: IDocumentBody = {
            dataStream: 'Chapter 1\rBody\r\n',
            paragraphs: [{ paragraphId: 'heading', startIndex: 9 }, { paragraphId: 'body', startIndex: 14 }],
            customRanges: [{ rangeId: 'bookmark', rangeType: CustomRangeType.BOOKMARK, startIndex: 0, endIndex: 8, properties: { bookmarkId: '_UniverRef_123' } }],
        };
        const bookmark = { bookmarkId: '_UniverRef_123' };
        expect(getDocHyperLinkTargetLabel(bookmark, body)).toBe('Chapter 1');
        expect(getDocHyperLinkTarget(bookmark)).toBe('#_UniverRef_123');
        expect(getDocHyperLinkTargetLabel({ headingId: 'heading' }, body)).toBe('Chapter 1');
        expect(getDocHyperLinkTargetLabel({ bookmarkId: 'missing' }, body)).toBe('#missing');
        expect(getDocHyperLinkTargetLabel({ url: 'https://example.test' }, body)).toBe('https://example.test');
    });
});
