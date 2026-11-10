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

import type { DocumentDataModel, IDisposable, IDocumentBody, IDocumentData } from '@univerjs/core';
import { CustomRangeType, DocumentFlavor, toDisposable } from '@univerjs/core';

export interface IDocumentHeaderFooterReferencePage {
    start: number;
    end: number;
    label: string;
    number: number;
    headerId?: string;
    footerId?: string;
}

/** A synchronous, read-only field projection for an actual measured body page. */
export type DocumentHeaderFooterReferenceResolver = (
    document: IDocumentData,
    kind: 'headers' | 'footers',
    segmentId: string,
    page: IDocumentHeaderFooterReferencePage,
    pages: IDocumentHeaderFooterReferencePage[]
) => IDocumentBody | undefined;

const resolvers = new WeakMap<DocumentDataModel, { resolver: DocumentHeaderFooterReferenceResolver }>();

export function registerDocumentHeaderFooterReferenceResolver(model: DocumentDataModel, resolver: DocumentHeaderFooterReferenceResolver): IDisposable {
    const registration = { resolver };
    resolvers.set(model, registration);
    return toDisposable(() => {
        if (resolvers.get(model) === registration) {
            resolvers.delete(model);
        }
    });
}

export function getDocumentHeaderFooterReferenceResolver(model: DocumentDataModel): DocumentHeaderFooterReferenceResolver | undefined {
    return resolvers.get(model)?.resolver;
}

/** Host callbacks belong to the live model and cannot be copied into an isolated layout session. */
export function hasDocumentHeaderFooterReferenceLayout(model: DocumentDataModel): boolean {
    const document = model.getSnapshot();
    return document.documentStyle.documentFlavor === DocumentFlavor.TRADITIONAL && resolvers.has(model) &&
        [...Object.values(document.headers ?? {}), ...Object.values(document.footers ?? {})].some((story) =>
            story.body?.customRanges?.some((range) => range.rangeType === CustomRangeType.FIELD &&
                ['STYLEREF', 'REF', 'PAGEREF', 'NOTEREF', 'IF'].includes(range.properties?.fieldType)));
}

export function getHeaderFooterReferencePageKey(kind: 'headers' | 'footers', segmentId: string, page: { sectionId?: string; pageNumber: number }): string {
    return JSON.stringify([kind, segmentId, page.sectionId, page.pageNumber]);
}
