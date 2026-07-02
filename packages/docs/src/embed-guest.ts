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

import type { IDocumentData, Injector } from '@univerjs/core';
import type { IEmbedCapability } from '@univerjs/embed';
import { DocumentDataModel, DocumentFlavor, UniverInstanceType } from '@univerjs/core';
import { registerEmbedCapabilities } from '@univerjs/embed';

const DOCS_HOST_EMBED_CAPABILITIES: readonly IEmbedCapability[] = [
    {
        hostType: UniverInstanceType.UNIVER_DOC,
        childType: UniverInstanceType.UNIVER_SHEET,
        entry: 'docs-custom-block',
        mode: 'float',
        layout: 'docs-sticky-sheet',
        menuBehavior: 'floating',
        nestedEmbed: false,
    },
    {
        hostType: UniverInstanceType.UNIVER_DOC,
        childType: UniverInstanceType.UNIVER_BASE,
        entry: 'docs-custom-block',
        mode: 'float',
        layout: 'docs-sticky-base',
        menuBehavior: 'floating',
        nestedEmbed: false,
    },
    {
        hostType: UniverInstanceType.UNIVER_DOC,
        childType: UniverInstanceType.UNIVER_SLIDE,
        entry: 'docs-custom-block',
        mode: 'float',
        layout: 'aspect-fit',
        menuBehavior: 'floating',
        nestedEmbed: false,
    },
];

export function registerDocsEmbedHostCapabilities(injector: Injector): void {
    registerEmbedCapabilities(injector, DOCS_HOST_EMBED_CAPABILITIES);
}

export function createDocsEmbedEmptySnapshot(config: Record<string, unknown> = {}): IDocumentData {
    const empty = new DocumentDataModel({}).getSnapshot();
    return {
        ...empty,
        ...config,
        id: typeof config.id === 'string' ? config.id : empty.id,
        title: typeof config.title === 'string' ? config.title : empty.title,
        documentStyle: {
            ...empty.documentStyle,
            ...(typeof config.documentStyle === 'object' && config.documentStyle ? config.documentStyle : {}),
            documentFlavor: DocumentFlavor.MODERN,
        },
    } as IDocumentData;
}
