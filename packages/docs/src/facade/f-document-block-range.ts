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

import type { DocumentBlockRangeType, IDocumentBlockRange, Injector } from '@univerjs/core';
import type { FDocumentBody } from './f-document-body';
import type { IFDocumentElementInfo } from './f-document-element';
import { DocumentBlockType } from '@univerjs/core';
import { FDocumentElement } from './f-document-element';
import { buildPlainTextInsertBody } from './utils';

interface IFDocumentBlockRangeMixin {
    asBlockRange(): FDocumentBlockRange;
}

/**
 * A facade wrapper for document block ranges, such as callout, quote, and code blocks.
 *
 * Block range identity is backed by the persisted `IDocumentBlockRange.blockId`,
 * so wrappers can be re-resolved after text is inserted before the block range.
 *
 * @hideconstructor
 */
export class FDocumentBlockRange extends FDocumentElement {
    constructor(
        protected readonly body: FDocumentBody,
        protected readonly info: IFDocumentElementInfo,
        protected readonly injector: Injector
    ) {
        super(body, info, injector);

        if (this.getType() !== DocumentBlockType.BLOCK_RANGE) {
            throw new Error(`Element type is not a block range: ${this.getType()}`);
        }
    }

    /**
     * Get the top-level block range data model.
     * @returns {IDocumentBlockRange} The block range data model.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     *
     * if (element?.isBlockRange()) {
     *   const blockRange = element.asBlockRange();
     *   console.log(blockRange.getBlockRange());
     * }
     * ```
     */
    getBlockRange(): IDocumentBlockRange {
        const { blockRanges = [] } = this._body.getBody();
        const blockRange = blockRanges.find((blockRange) => blockRange.blockId === this.getKey());
        if (!blockRange) {
            throw new Error(`Block range not found: ${this.getKey()}`);
        }
        return blockRange;
    }

    /**
     * Get the block range type.
     * @returns {DocumentBlockRangeType} The block type, such as callout, quote, or code.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     *
     * if (element?.isBlockRange()) {
     *   const blockRange = element.asBlockRange();
     *   console.log(blockRange.getBlockType());
     * }
     * ```
     */
    getBlockType(): DocumentBlockRangeType {
        const blockRange = this.getBlockRange();
        return blockRange.blockType;
    }

    /**
     * Get the plain text inside this block range.
     * @returns {string} The block range text.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     *
     * if (element?.isBlockRange()) {
     *   const blockRange = element.asBlockRange();
     *   console.log(blockRange.getText());
     * }
     * ```
     */
    getText(): string {
        const { dataStream } = this._body.getBody();
        const { startIndex, endIndex } = this.getBlockRange();
        return dataStream.slice(startIndex, endIndex);
    }

    /**
     * Replace the plain text inside this block range.
     * @param {string} text The replacement text.
     * @returns {boolean} `true` if the block range text was replaced.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     *
     * if (element?.isBlockRange()) {
     *   const blockRange = element.asBlockRange();
     *   blockRange.setText('Updated block text');
     *   console.log(blockRange.getText());
     * }
     * ```
     */
    setText(text: string): boolean {
        const blockRange = this.getBlockRange();
        const { startIndex, endIndex } = blockRange;
        const updateBody = buildPlainTextInsertBody(`${text}\r`);
        updateBody.blockRanges = [{
            ...blockRange,
            startIndex: 0,
            endIndex: text.length,
        }];

        return this._body.replaceRange({ startOffset: startIndex, endOffset: endIndex + 1 }, updateBody);
    }

    /**
     * Remove this block range wrapper from the body.
     *
     * This currently removes the block range and its content, matching
     * `remove()`.
     *
     * @returns {boolean} `true` if the block range content was removed.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     *
     * if (element?.isBlockRange()) {
     *   const blockRange = element.asBlockRange();
     *   const removed = blockRange.unwrap();
     *   console.log(removed ? 'Block range removed' : 'Failed to remove block range');
     * }
     * ```
     */
    unwrap(): boolean {
        return this.remove();
    }
}

export class FDocumentBlockRangeMixin extends FDocumentElement {
    override asBlockRange(): FDocumentBlockRange {
        if (this.getType() !== DocumentBlockType.BLOCK_RANGE) {
            throw new Error(`Element type is not a block range: ${this.getType()}`);
        }
        return this._injector.createInstance(FDocumentBlockRange, this._body, this.getResolvedInfo(), this._injector);
    }
}

FDocumentElement.extend(FDocumentBlockRangeMixin);
declare module '@univerjs/docs/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FDocumentElement extends IFDocumentBlockRangeMixin { }
}
