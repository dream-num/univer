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

import type { IDocumentSkeletonPage } from '@univerjs/engine-render';
import { describe, expect, it } from 'vitest';
import { resolveDocPageStatus } from '../DocPageStatus';

type PageGeometry = Pick<
    IDocumentSkeletonPage,
    'isLayoutPlaceholder' | 'isMaterializationPlaceholder' | 'pageHeight' | 'pageWidth'
>;

function createPages(count: number): PageGeometry[] {
    return Array.from({ length: count }, () => ({ pageHeight: 100, pageWidth: 80 }));
}

describe('resolveDocPageStatus', () => {
    it('resolves the page at the viewport center after layout completes', () => {
        expect(resolveDocPageStatus(createPages(5), 230, 10, true, {
            complete: true,
            publishedPageCount: 5,
        })).toEqual({ currentPage: 3, totalPages: 5 });
    });

    it('does not expose an unfinished total or a page beyond the published prefix', () => {
        const pages = createPages(5);
        const progress = { complete: false, publishedPageCount: 2 };

        expect(resolveDocPageStatus(pages, 150, 10, true, progress)).toEqual({
            currentPage: 2,
            totalPages: null,
        });
        expect(resolveDocPageStatus(pages, 260, 10, true, progress)).toEqual({
            currentPage: null,
            totalPages: null,
        });
    });

    it('does not expose a placeholder page as accurate', () => {
        const pages = createPages(3);
        pages[1].isMaterializationPlaceholder = true;

        expect(resolveDocPageStatus(pages, 150, 10, true, {
            complete: false,
            publishedPageCount: 2,
        })).toEqual({ currentPage: null, totalPages: null });
    });

    it('supports horizontal page layout', () => {
        expect(resolveDocPageStatus(createPages(3), 95, 10, false)).toEqual({
            currentPage: 2,
            totalPages: 3,
        });
    });
});
