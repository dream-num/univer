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

import type { FDocBody } from './f-doc-body';

/**
 * A facade wrapper for a document table marker.
 *
 * Table identity is backed by the persisted `ICustomTable.tableId`, so the
 * wrapper can be re-resolved after text is inserted before the table.
 *
 * @hideconstructor
 */
export class FDocTable {
    constructor(
        protected readonly _body: FDocBody,
        protected readonly _key: string
    ) {}

    /**
     * Get the document element type.
     * @returns {'table'} The literal table element type.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const table = doc.getBody().getChild(0).asTable();
     * console.log(table.getType());
     * ```
     */
    getType(): 'table' {
        return 'table';
    }

    /**
     * Get the table key.
     * @returns {string} The persisted `tableId` for this table.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const table = doc.getBody().getChild(0).asTable();
     * console.log(table.getKey());
     * ```
     */
    getKey(): string {
        return this._key;
    }

    /**
     * Get the parent body facade that owns this table.
     * @returns {FDocBody} The document body facade.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const table = doc.getBody().getChild(0).asTable();
     * console.log(table.getParent().getChildIndex(table));
     * ```
     */
    getParent(): FDocBody {
        return this._body;
    }

    /**
     * Remove this table from the parent body.
     * @returns {boolean} `true` if the table range was removed.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const table = doc.getBody().getChild(0).asTable();
     * table.removeFromParent();
     * ```
     */
    removeFromParent(): boolean {
        return this._body.removeTable(this._key);
    }

    /**
     * Get the persisted table id.
     * @returns {string} The `ICustomTable.tableId` value.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const table = doc.getBody().getChild(0).asTable();
     * console.log(table.getTableId());
     * ```
     */
    getTableId(): string {
        return this._body.getTable(this._key).tableId;
    }
}
