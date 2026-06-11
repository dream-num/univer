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

import type { DocumentBlockRangeType } from '@univerjs/core';
import type { FDocBody } from './f-doc-body';

/**
 * A facade wrapper for document block ranges, such as callout, quote, and code blocks.
 *
 * Block range identity is backed by the persisted `IDocumentBlockRange.blockId`,
 * so wrappers can be re-resolved after text is inserted before the block range.
 *
 * @hideconstructor
 */
export class FDocBlockRange {
    constructor(
        protected readonly _body: FDocBody,
        protected readonly _key: string
    ) {}

    /**
     * Get the document element type.
     * @returns {'blockRange'} The literal block range element type.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const blockRange = doc.getBody().getChild(0).asBlockRange();
     * console.log(blockRange.getType());
     * ```
     */
    getType(): 'blockRange' {
        return 'blockRange';
    }

    /**
     * Get the block range key.
     * @returns {string} The persisted `blockId` for this block range.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const blockRange = doc.getBody().getChild(0).asBlockRange();
     * console.log(blockRange.getKey());
     * ```
     */
    getKey(): string {
        return this._key;
    }

    /**
     * Get the parent body facade that owns this block range.
     * @returns {FDocBody} The document body facade.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const blockRange = doc.getBody().getChild(0).asBlockRange();
     * console.log(blockRange.getParent().getChildIndex(blockRange));
     * ```
     */
    getParent(): FDocBody {
        return this._body;
    }

    /**
     * Remove this block range and its content from the parent body.
     * @returns {boolean} `true` if the block range content was removed.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const blockRange = doc.getBody().getChild(0).asBlockRange();
     * blockRange.removeFromParent();
     * ```
     */
    removeFromParent(): boolean {
        return this._body.removeBlockRange(this._key);
    }

    /**
     * Get the block range type.
     * @returns {DocumentBlockRangeType} The block type, such as callout, quote, or code.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const blockRange = doc.getBody().getChild(0).asBlockRange();
     * console.log(blockRange.getBlockType());
     * ```
     */
    getBlockType(): DocumentBlockRangeType {
        return this._body.getBlockRange(this._key).blockType;
    }

    /**
     * Get the plain text inside this block range.
     * @returns {string} The block range text.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const blockRange = doc.getBody().getChild(0).asBlockRange();
     * console.log(blockRange.getText());
     * ```
     */
    getText(): string {
        return this._body.getBlockRangeText(this._key);
    }

    /**
     * Replace the plain text inside this block range.
     * @param {string} text The replacement text.
     * @returns {boolean} `true` if the block range text was replaced.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const blockRange = doc.getBody().getChild(0).asBlockRange();
     * blockRange.setText('Updated block text');
     * ```
     */
    setText(text: string): boolean {
        return this._body.setBlockRangeText(this._key, text);
    }

    /**
     * Remove this block range wrapper from the body.
     *
     * This currently removes the block range and its content, matching
     * `removeFromParent()`.
     *
     * @returns {boolean} `true` if the block range content was removed.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const blockRange = doc.getBody().getChild(0).asBlockRange();
     * blockRange.unwrap();
     * ```
     */
    unwrap(): boolean {
        return this.removeFromParent();
    }
}
