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

import type { Injector } from '@univerjs/core';
import type { FDocumentBody } from './f-document-body';
import { DocumentBlockType } from '@univerjs/core';
import { FBase } from '@univerjs/core/facade';

export interface IFDocumentElementInfo {
    type: DocumentBlockType;
    key: string;
    position: number;
    priority: number;
}

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
export class FDocumentElement extends FBase {
    constructor(
        protected readonly _body: FDocumentBody,
        protected readonly _info: IFDocumentElementInfo,
        protected readonly _injector: Injector
    ) {
        super();
    }

    /**
     * Get the document element type.
     * @returns {DocumentBlockType} The element type, such as `paragraph`, `table`, `blockRange`, or `customBlock`.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     * console.log(element?.getType());
     * ```
     */
    getType(): DocumentBlockType {
        return this._info.type;
    }

    /**
     * Whether this element is a paragraph.
     * @returns {boolean} `true` if this element is a paragraph.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     * console.log(element?.isParagraph());
     * ```
     */
    isParagraph(): boolean {
        return this._info.type === DocumentBlockType.PARAGRAPH;
    }

    /**
     * Whether this element is a table.
     * @returns {boolean} `true` if this element is a table.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     * console.log(element?.isTable());
     * ```
     */
    isTable(): boolean {
        return this._info.type === DocumentBlockType.TABLE;
    }

    /**
     * Whether this element is a block range, such as a callout, quote, or code block.
     * @returns {boolean} `true` if this element is a block range.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     * console.log(element?.isBlockRange());
     * ```
     */
    isBlockRange(): boolean {
        return this._info.type === DocumentBlockType.BLOCK_RANGE;
    }

    /**
     * Whether this element is a custom block.
     * @returns {boolean} `true` if this element is a custom block.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     * console.log(element?.isCustomBlock());
     * ```
     */
    isCustomBlock(): boolean {
        return this._info.type === DocumentBlockType.CUSTOM_BLOCK;
    }

    /**
     * Get the facade key used to resolve this element.
     * @returns {string} The paragraph `paragraphId` or persisted table/block/custom block id.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     * console.log(element?.getKey());
     * ```
     */
    getKey(): string {
        return this._info.key;
    }

    /**
     * Get the parent body facade that owns this element.
     * @returns {FDocumentBody} The document body facade.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     * console.log(element?.getParent());
     * ```
     */
    getParent(): FDocumentBody {
        return this._body;
    }

    /**
     * Get the resolved element info for this wrapper.
     * @returns {IFDocumentElementInfo} The resolved element info, including type, key, position, and priority.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     * console.log(element?.getResolvedInfo());
     * ```
     */
    getResolvedInfo(): IFDocumentElementInfo {
        return this._info;
    }

    /**
     * Get the next sibling element in the current body order.
     * @returns {FDocumentElement | null} The next sibling wrapper, or `null` when this is the last child.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     * console.log(element?.getNextSibling());
     * ```
     */
    getNextSibling(): FDocumentElement | null {
        return this._createSibling(1);
    }

    /**
     * Get the previous sibling element in the current body order.
     * @returns {FDocumentElement | null} The previous sibling wrapper, or `null` when this is the first child.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(1);
     * console.log(element?.getPreviousSibling());
     * ```
     */
    getPreviousSibling(): FDocumentElement | null {
        return this._createSibling(-1);
    }

    /**
     * Get the sibling element at a relative offset from this element.
     * @param {number} offset The relative offset from this element. Use `1` for the next sibling, `-1` for the previous sibling, and so on.
     * @returns {FDocumentElement | null} The sibling wrapper at the specified offset, or `null` when the offset is out of range.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     *
     * // Get the third sibling after this element
     * const nextThirdSibling = element?.getSibling(3);
     * console.log(nextThirdSibling?.getType());
     * ```
     */
    getSibling(offset: number): FDocumentElement | null {
        return this._createSibling(offset);
    }

    /**
     * Remove this element from its parent body.
     * @returns {boolean} `true` if the element content was removed.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     * const removed = element?.remove();
     * console.log(removed);
     * ```
     */
    remove(): boolean {
        if (this.isParagraph()) {
            return this._body.removeParagraph(this.asParagraph());
        }

        if (this.isBlockRange()) {
            return this._body.removeBlockRange(this.asBlockRange());
        }

        if (this.isTable()) {
            return this._body.removeTable(this.asTable());
        }

        return this._body.removeCustomBlock(this.asCustomBlock());
    }

    private _createSibling(offset: number): FDocumentElement | null {
        if (offset === 0) {
            throw new Error('Offset cannot be zero.');
        }

        const index = this._body.getElementIndex(this);
        return this._body.getElement(index + offset);
    }
}
