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

import { UpdateDocsAttributeType } from '@univerjs/core';
import { FEnum } from '@univerjs/core/facade';

/**
 * @ignore
 */
export interface IFDocsEnumMixin {
    /**
     * Update document attribute types. These types define how document attributes are updated.
     * - `COVER`: If the attribute is not present, it will be added. If it is present, it will be overwritten while retaining the original properties.
     * - `REPLACE`: The original properties will be replaced entirely.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const fDocumentBody = fDocument.getBody();
     *
     * // Retain a range with a new body and cover type
     * const newBody = univerAPI.newRichText().insertText(0, 'Retained text', { bl: 1 });
     * fDocumentBody.retainRange({ startOffset: 0, endOffset: 5 }, newBody, univerAPI.Enum.UpdateDocsAttributeType.COVER);
     * ```
     */
    UpdateDocsAttributeType: typeof UpdateDocsAttributeType;
}

export class FDocsEnumMixin extends FEnum implements IFDocsEnumMixin {
    override get UpdateDocsAttributeType(): typeof UpdateDocsAttributeType {
        return UpdateDocsAttributeType;
    }
}

FEnum.extend(FDocsEnumMixin);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    export interface FEnum extends IFDocsEnumMixin {
    }
}
