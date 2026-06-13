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
import type { FDocElementType } from './doc-element-registry';
import { FDocBlockRange } from './f-doc-block-range';
import { FDocCustomBlock } from './f-doc-custom-block';
import { FDocParagraph } from './f-doc-paragraph';
import { FDocTable } from './f-doc-table';

/**
 * A generic top-level document body element.
 *
 * Use this wrapper when you need to inspect an element type first, navigate to
 * neighboring elements, or cast the element to a more specific facade wrapper.
 *
 * Paragraph keys are persisted `paragraphId` values. Tables, block ranges, and
 * custom blocks use their persisted ids.
 *
 * @hideconstructor
 */
export class FDocElement {
    constructor(
        protected readonly _body: FDocBody,
        protected readonly _type: FDocElementType,
        protected readonly _key: string
    ) {}

    /**
     * Get the document element type.
     * @returns {FDocElementType} The element type, such as `paragraph`, `table`, `blockRange`, or `customBlock`.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const element = doc.getBody().getChild(0);
     * console.log(element.getType());
     * ```
     */
    getType(): FDocElementType {
        return this._type;
    }

    /**
     * Get the facade key used to resolve this element.
     * @returns {string} The paragraph `paragraphId` or persisted table/block/custom block id.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const body = doc.getBody();
     * const element = body.getChild(0);
     * console.log(element.getKey());
     * ```
     */
    getKey(): string {
        return this._key;
    }

    /**
     * Get the parent body facade that owns this element.
     * @returns {FDocBody} The document body facade.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const element = doc.getBody().getChild(0);
     * console.log(element.getParent().getNumChildren());
     * ```
     */
    getParent(): FDocBody {
        return this._body;
    }

    /**
     * Get the next sibling element in the current body order.
     * @returns {FDocElement | null} The next sibling wrapper, or `null` when this is the last child.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const first = doc.getBody().getChild(0);
     * const next = first.getNextSibling();
     * console.log(next?.getType());
     * ```
     */
    getNextSibling(): FDocElement | null {
        return this._body.createSibling(this._type, this._key, 1);
    }

    /**
     * Get the previous sibling element in the current body order.
     * @returns {FDocElement | null} The previous sibling wrapper, or `null` when this is the first child.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const second = doc.getBody().getChild(1);
     * const previous = second.getPreviousSibling();
     * console.log(previous?.getType());
     * ```
     */
    getPreviousSibling(): FDocElement | null {
        return this._body.createSibling(this._type, this._key, -1);
    }

    /**
     * Remove this element from its parent body.
     * @returns {boolean} `true` if the element content was removed.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const body = doc.getBody();
     * const element = body.getChild(0);
     * element.removeFromParent();
     * ```
     */
    removeFromParent(): boolean {
        if (this._type === 'paragraph') {
            return this._body.removeParagraph(this._key);
        }

        if (this._type === 'blockRange') {
            return this._body.removeBlockRange(this._key);
        }

        if (this._type === 'table') {
            return this._body.removeTable(this._key);
        }

        return this._body.removeCustomBlock(this._key);
    }

    /**
     * Cast this generic element to a paragraph facade.
     * @returns {FDocParagraph} The paragraph facade wrapper.
     * @throws {TypeError} If the element is not a paragraph.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const paragraph = doc.getBody().getChild(0).asParagraph();
     * console.log(paragraph.getText());
     * ```
     */
    asParagraph(): FDocParagraph {
        this._assertType('paragraph');
        return new FDocParagraph(this._body, this._key);
    }

    /**
     * Cast this generic element to a table facade.
     * @returns {FDocTable} The table facade wrapper.
     * @throws {TypeError} If the element is not a table.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const table = doc.getBody().getChild(0).asTable();
     * console.log(table.getTableId());
     * ```
     */
    asTable(): FDocTable {
        this._assertType('table');
        return new FDocTable(this._body, this._key);
    }

    /**
     * Cast this generic element to a callout, quote, or code block range facade.
     * @returns {FDocBlockRange} The block range facade wrapper.
     * @throws {TypeError} If the element is not a block range.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const blockRange = doc.getBody().getChild(0).asBlockRange();
     * console.log(blockRange.getBlockType());
     * ```
     */
    asBlockRange(): FDocBlockRange {
        this._assertType('blockRange');
        return new FDocBlockRange(this._body, this._key);
    }

    /**
     * Cast this generic element to a custom block facade.
     * @returns {FDocCustomBlock} The custom block facade wrapper.
     * @throws {TypeError} If the element is not a custom block.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const customBlock = doc.getBody().getChild(0).asCustomBlock();
     * console.log(customBlock.getBlockId());
     * ```
     */
    asCustomBlock(): FDocCustomBlock {
        this._assertType('customBlock');
        return new FDocCustomBlock(this._body, this._key);
    }

    private _assertType(type: FDocElementType): void {
        if (this._type !== type) {
            throw new TypeError(`Cannot cast ${this._type} to ${type}.`);
        }
    }
}
