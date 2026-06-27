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

import type { ICustomBlock, Injector } from '@univerjs/core';
import type { FDocumentBody } from './f-document-body';
import type { IFDocumentElementInfo } from './f-document-element';
import { DocumentBlockType } from '@univerjs/core';
import { FDocumentElement } from './f-document-element';

interface IFDocumentCustomBlockMixin {
    asCustomBlock(): FDocumentCustomBlock;
}

/**
 * A facade wrapper for document top-level custom blocks.
 * @hideconstructor
 */
export class FDocumentCustomBlock extends FDocumentElement {
    constructor(
        protected readonly body: FDocumentBody,
        protected readonly info: IFDocumentElementInfo,
        protected readonly injector: Injector
    ) {
        super(body, info, injector);

        if (this.getType() !== DocumentBlockType.CUSTOM_BLOCK) {
            throw new Error(`Element type is not a custom block: ${this.getType()}`);
        }
    }

    /**
     * Get the custom block marker.
     * @returns {ICustomBlock} The custom block marker.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     * const element = fDocumentBody.getElement(0);
     *
     * if (element?.isCustomBlock()) {
     *   const customBlock = element.asCustomBlock();
     *   console.log(customBlock.getCustomBlock());
     * }
     * ```
     */
    getCustomBlock(): ICustomBlock {
        const { customBlocks = [] } = this._body.getBody();
        const block = customBlocks.find((item) => item.blockId === this.getKey());
        if (!block) {
            throw new Error('Doc custom block is stale');
        }
        return block;
    }
}

export class FDocumentCustomBlockMixin extends FDocumentElement {
    override asCustomBlock(): FDocumentCustomBlock {
        if (this.getType() !== DocumentBlockType.CUSTOM_BLOCK) {
            throw new Error(`Element type is not a custom block: ${this.getType()}`);
        }
        return this._injector.createInstance(FDocumentCustomBlock, this._body, this.getResolvedInfo(), this._injector);
    }
}

FDocumentElement.extend(FDocumentCustomBlockMixin);
declare module '@univerjs/docs/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FDocumentElement extends IFDocumentCustomBlockMixin { }
}
