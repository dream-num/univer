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

import type { ICustomTable, Injector } from '@univerjs/core';
import type { FDocumentBody, IFDocumentBodyEdit } from './f-document-body';
import type { IFDocumentElementInfo } from './f-document-element';
import { DocumentBlockType } from '@univerjs/core';
import { FDocumentElement } from './f-document-element';

interface IFDocumentTableMixin {
    asTable(): FDocumentTable;
}

/**
 * A facade wrapper for document top-level tables.
 * @hideconstructor
 */
export class FDocumentTable extends FDocumentElement {
    constructor(
        protected readonly body: FDocumentBody,
        protected readonly bodyEdit: IFDocumentBodyEdit,
        protected readonly info: IFDocumentElementInfo,
        protected readonly injector: Injector
    ) {
        super(body, bodyEdit, info, injector);

        if (this.getType() !== DocumentBlockType.TABLE) {
            throw new Error(`Element type is not a table: ${this.getType()}`);
        }
    }

    /**
     * Get the table marker.
     * @returns {ICustomTable} The table marker.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     *
     * if (element?.isTable()) {
     *   const table = element.asTable();
     *   console.log(table.getTable());
     * }
     * ```
     */
    getTable(): ICustomTable {
        const { tables = [] } = this._body.getBody();
        const table = tables.find((item) => item.tableId === this.getKey());
        if (!table) {
            throw new Error('Doc table is stale');
        }
        return table;
    }
}

export class FDocumentTableMixin extends FDocumentElement {
    override asTable(): FDocumentTable {
        if (this.getType() !== DocumentBlockType.TABLE) {
            throw new Error(`Element type is not a table: ${this.getType()}`);
        }
        return this._injector.createInstance(FDocumentTable, this._body, this._bodyEdit, this.getResolvedInfo(), this._injector);
    }
}

FDocumentElement.extend(FDocumentTableMixin);
declare module '@univerjs/docs/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FDocumentElement extends IFDocumentTableMixin { }
}
