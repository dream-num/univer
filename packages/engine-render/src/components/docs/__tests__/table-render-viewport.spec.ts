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

import { DocumentFlavor, TableTextWrapType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { DocumentSkeletonPageType } from '../../../basics/i-document-skeleton-cached';
import { getDocsTableLayoutViewportWidth } from '../table-render-viewport';

describe('table layout viewport width', () => {
    const page = { pageWidth: 794, marginLeft: 53, marginRight: 60 };
    const importedTable = { size: { width: { v: 788 } } };

    it('keeps a page-anchored imported cover table visible across both margins', () => {
        expect(getDocsTableLayoutViewportWidth(page, -53, importedTable, DocumentFlavor.TRADITIONAL)).toBe(794);
    });

    it('allows a traditional model-width table to extend into the right margin', () => {
        expect(getDocsTableLayoutViewportWidth(page, 0, importedTable, DocumentFlavor.TRADITIONAL)).toBe(741);
    });

    it.each([DocumentFlavor.MODERN, undefined])('keeps ordinary content bounds for flavor %s', (flavor) => {
        expect(getDocsTableLayoutViewportWidth(page, 0, importedTable, flavor)).toBe(681);
    });

    it('does not infer margin overflow for tables without a model width', () => {
        expect(getDocsTableLayoutViewportWidth(page, 0, {}, DocumentFlavor.TRADITIONAL)).toBe(681);
    });

    it('never returns a negative visible width', () => {
        expect(getDocsTableLayoutViewportWidth(page, 800, importedTable, DocumentFlavor.TRADITIONAL)).toBe(0);
    });

    it.each([DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN].flatMap((flavor) =>
        [TableTextWrapType.NONE, TableTextWrapType.WRAP].map((textWrap) => ({ flavor, textWrap }))
    ))('keeps a floating nested grid wider than its anchor cell without changing flow bounds: %j', ({ flavor, textWrap }) => {
        const cell = { pageWidth: 51.4, marginLeft: 0, marginRight: 0, type: DocumentSkeletonPageType.CELL };
        const table = {
            size: { width: { v: 57.6 } },
            tableColumns: [{ size: { width: { v: 57.6 } } }],
            textWrap,
        };
        const actual = getDocsTableLayoutViewportWidth(cell, 0, table, flavor);
        expect(actual).toBe(flavor === DocumentFlavor.TRADITIONAL && textWrap === TableTextWrapType.WRAP ? 57.6 : 51.4);
    });
});
