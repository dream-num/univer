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

import type { IDisposable, IDocumentData } from '@univerjs/core';
import { Disposable, remove, toDisposable } from '@univerjs/core';

export type DocHtmlExportTransformer = (documentData: IDocumentData) => IDocumentData;

export class DocHtmlExportService extends Disposable {
    private readonly _transformers: DocHtmlExportTransformer[] = [];

    registerTransformer(transformer: DocHtmlExportTransformer): IDisposable {
        this._transformers.push(transformer);

        return this.disposeWithMe(toDisposable(() => remove(this._transformers, transformer)));
    }

    transformDocumentForHtmlExport(documentData: IDocumentData): IDocumentData {
        return this._transformers.reduce((doc, transformer) => transformer(doc), documentData);
    }
}
