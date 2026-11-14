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

import type { DocumentDataModel, IDisposable, IDocumentData } from '@univerjs/core';
import { DocumentFlavor, toDisposable } from '@univerjs/core';

export interface IDocumentReferenceLayoutPage {
    start: number;
    end: number;
    label: string;
    number: number;
    headerId?: string;
    footerId?: string;
    drawingIds?: string[];
    notes?: { noteId: string; start: number; end: number }[];
}

export interface IDocumentReferenceLayoutResolver {
    hasReferences(document: IDocumentData): boolean;
    project(document: IDocumentData, pages: IDocumentReferenceLayoutPage[]): IDocumentData | undefined;
}

const resolvers = new WeakMap<DocumentDataModel, IDocumentReferenceLayoutResolver>();

export function registerDocumentReferenceLayoutResolver(model: DocumentDataModel, resolver: IDocumentReferenceLayoutResolver): IDisposable {
    resolvers.set(model, resolver);
    return toDisposable(() => {
        if (resolvers.get(model) === resolver) {
            resolvers.delete(model);
        }
    });
}

export function getDocumentReferenceLayoutResolver(model: DocumentDataModel): IDocumentReferenceLayoutResolver | undefined {
    return resolvers.get(model);
}

export function hasDocumentReferenceLayout(model: DocumentDataModel): boolean {
    const resolver = resolvers.get(model);
    if (!resolver) {
        return false;
    }
    const document = model.getSnapshot();
    return document.documentStyle.documentFlavor === DocumentFlavor.TRADITIONAL && resolver.hasReferences(document);
}
