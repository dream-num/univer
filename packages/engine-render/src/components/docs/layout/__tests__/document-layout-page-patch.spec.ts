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

import { createDocumentModelWithStyle, DocumentFlavor, LocaleService, Univer } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { DocumentViewModel } from '../../view-model/document-view-model';
import { DocumentSkeleton } from '../doc-skeleton';
import { hydrateDocumentSkeletonPage, serializeDocumentSkeletonPage } from '../document-layout-page-patch';

function normalizeSkeleton(value: unknown): unknown {
    if (value instanceof Map) {
        return [...value].map(([key, item]) => [key, normalizeSkeleton(item)]);
    }

    if (Array.isArray(value)) {
        return value.map(normalizeSkeleton);
    }

    if (value != null && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value)
                .filter(([key]) => key !== 'parent')
                .map(([key, item]) => [key, normalizeSkeleton(item)])
        );
    }

    return value;
}

describe('document layout page patch', () => {
    it('survives structured clone and restores render parent links', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = createDocumentModelWithStyle(
            'Worker-safe page publication.\rSecond line.\r',
            {}
        );
        documentModel.updateDocumentStyle({ documentFlavor: DocumentFlavor.TRADITIONAL });
        documentModel.updateDocumentDataPageSize(240, 320);
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);
        skeleton.calculate();

        const page = skeleton.getSkeletonData()?.pages[0];
        if (page == null) {
            throw new Error('Expected the document to produce a page.');
        }
        page.isNaturalPageOverflow = true;

        const patch = structuredClone(serializeDocumentSkeletonPage(page));
        const hydrated = hydrateDocumentSkeletonPage(patch);
        const firstSection = hydrated.sections[0];
        const firstColumn = firstSection?.columns[0];
        const firstLine = firstColumn?.lines[0];
        const firstDivide = firstLine?.divides[0];
        const firstGlyph = firstDivide?.glyphGroup[0];

        expect(JSON.stringify(patch)).not.toContain('"parent"');
        expect(normalizeSkeleton(hydrated)).toEqual(normalizeSkeleton(page));
        expect(hydrated.isNaturalPageOverflow).toBe(true);
        expect(firstSection?.parent).toBe(hydrated);
        expect(firstColumn?.parent).toBe(firstSection);
        expect(firstLine?.parent).toBe(firstColumn);
        expect(firstDivide?.parent).toBe(firstLine);
        expect(firstGlyph?.parent).toBe(firstDivide);

        skeleton.dispose();
        univer.dispose();
    });
});
