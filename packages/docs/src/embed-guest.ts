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
import { DocumentDataModel, DocumentFlavor, UniverInstanceType } from '@univerjs/core';

export function registerDocsEmbedHostCapabilities(injector: Injector): void {
    void injector;
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
