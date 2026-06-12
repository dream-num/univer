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
 * A facade wrapper for a document custom block, such as an embedded drawing or widget.
 *
 * Custom block identity is backed by the persisted `ICustomBlock.blockId`, so the
 * wrapper can be re-resolved after text is inserted before the custom block.
 *
 * @hideconstructor
 */
export class FDocCustomBlock {
    constructor(
        protected readonly _body: FDocBody,
        protected readonly _key: string
    ) {}

    /**
     * Get the document element type.
     * @returns {'customBlock'} The literal custom block element type.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const customBlock = doc.getBody().getChild(0).asCustomBlock();
     * console.log(customBlock.getType());
     * ```
     */
    getType(): 'customBlock' {
        return 'customBlock';
    }

    /**
     * Get the custom block key.
     * @returns {string} The persisted `blockId` for this custom block.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const customBlock = doc.getBody().getChild(0).asCustomBlock();
     * console.log(customBlock.getKey());
     * ```
     */
    getKey(): string {
        return this._key;
    }

    /**
     * Get the parent body facade that owns this custom block.
     * @returns {FDocBody} The document body facade.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const customBlock = doc.getBody().getChild(0).asCustomBlock();
     * console.log(customBlock.getParent().getChildIndex(customBlock));
     * ```
     */
    getParent(): FDocBody {
        return this._body;
    }

    /**
     * Remove this custom block from the parent body.
     * @returns {boolean} `true` if the custom block placeholder was removed.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const customBlock = doc.getBody().getChild(0).asCustomBlock();
     * customBlock.removeFromParent();
     * ```
     */
    removeFromParent(): boolean {
        return this._body.removeCustomBlock(this._key);
    }

    /**
     * Get the persisted custom block id.
     * @returns {string} The `ICustomBlock.blockId` value.
     * @example
     * ```ts
     * const doc = univerAPI.getActiveDocument();
     * if (!doc) throw new Error('No active document');
     *
     * const customBlock = doc.getBody().getChild(0).asCustomBlock();
     * console.log(customBlock.getBlockId());
     * ```
     */
    getBlockId(): string {
        return this._body.getCustomBlock(this._key).blockId;
    }
}
