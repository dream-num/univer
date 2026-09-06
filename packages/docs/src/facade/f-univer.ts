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

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { FDocument } from './f-document';

/**
 * @ignore
 */
export interface IFUniverDocsMixin {
    /**
     * Create a new document and get the API handler of that document.
     * @param {Partial<IDocumentData>} data The snapshot of the document.
     * @returns {FDocument} The document API instance.
     * @example
     * ```typescript
     * const fDocument = univerAPI.createUniverDoc({ id: 'document-01', title: 'Document1'  });
     * console.log(fDocument);
     * ```
     */
    createDocument(data: Partial<IDocumentData>): FDocument;

    /**
     * Get the currently focused Univer document.
     * @returns {FDocument | null} The currently focused Univer document API instance, or null if there is no focused Univer document.
     * @example
     * ```typescript
     * const fDocument = univerAPI.getActiveDocument();
     * console.log(fDocument);
     * ```
     */
    getActiveDocument(): FDocument | null;

    /**
     * Get the document API handler by the document id.
     * @param {string} id The document id.
     * @returns {FDocument | null} The document API instance corresponding to the document id, or null if not found.
     * @example
     * ```typescript
     * const fDocument = univerAPI.getDocument('document-01');
     * console.log(fDocument);
     * ```
     */
    getDocument(id: string): FDocument | null;
}

export class FUniverDocsMixin extends FUniver implements IFUniverDocsMixin {
    override createDocument(data: Partial<IDocumentData>): FDocument {
        const instanceService = this._injector.get(IUniverInstanceService);
        const document = instanceService.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, data);
        return this._injector.createInstance(FDocument, document);
    }

    override getActiveDocument(): FDocument | null {
        const document = this._univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!document) {
            return null;
        }

        return this._injector.createInstance(FDocument, document);
    }

    override getDocument(id: string): FDocument | null {
        const document = this._univerInstanceService.getUnit<DocumentDataModel>(id, UniverInstanceType.UNIVER_DOC);
        if (!document) {
            return null;
        }

        return this._injector.createInstance(FDocument, document);
    }
}

FUniver.extend(FUniverDocsMixin);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverDocsMixin {}
}
