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

import { BooleanNumber } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getDocPageSectionContext } from '../section-header-footer';

describe('section header/footer context', () => {
    it('resolves the owning section and overlays it on document defaults', () => {
        const snapshot = {
            id: 'section-header-footer-doc',
            documentStyle: {
                defaultHeaderId: 'global-header',
                defaultFooterId: 'global-footer',
                marginHeader: 12,
                useFirstPageHeaderFooter: BooleanNumber.FALSE,
            },
            body: {
                dataStream: '\r\n',
                sectionBreaks: [{
                    sectionId: 'section_2',
                    startIndex: 1,
                    defaultHeaderId: 'section-header',
                    marginHeader: 24,
                    useFirstPageHeaderFooter: BooleanNumber.TRUE,
                }],
            },
        };

        expect(getDocPageSectionContext(snapshot, { sectionId: 'section_2' })).toMatchObject({
            sectionId: 'section_2',
            config: {
                defaultHeaderId: 'section-header',
                defaultFooterId: 'global-footer',
                marginHeader: 24,
                useFirstPageHeaderFooter: BooleanNumber.TRUE,
            },
        });
    });

    it('falls back to document defaults when a page has no owning section', () => {
        const snapshot = {
            id: 'global-header-footer-doc',
            documentStyle: { defaultHeaderId: 'global-header' },
        };

        expect(getDocPageSectionContext(snapshot)).toEqual({
            sectionId: undefined,
            sectionIndex: -1,
            sections: [],
            section: undefined,
            config: { defaultHeaderId: 'global-header' },
        });
    });

    it('inherits the previous section instead of falling back to the document default', () => {
        const snapshot = {
            id: 'inherited-header-footer-doc',
            documentStyle: { defaultHeaderId: 'global-header' },
            body: {
                dataStream: 'A\r\nB\r\n',
                paragraphs: [
                    { paragraphId: 'paragraph_a', startIndex: 1 },
                    { paragraphId: 'paragraph_b', startIndex: 4 },
                ],
                sectionBreaks: [
                    { sectionId: 'section_1', startIndex: 2, defaultHeaderId: 'section-header' },
                    { sectionId: 'section_2', startIndex: 5 },
                ],
            },
        };

        expect(getDocPageSectionContext(snapshot, { sectionId: 'section_2' })).toMatchObject({
            sectionIndex: 1,
            config: { defaultHeaderId: 'section-header' },
        });
    });
});
