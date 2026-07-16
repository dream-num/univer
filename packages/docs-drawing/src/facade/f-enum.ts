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

import { ObjectRelativeFromH, ObjectRelativeFromV } from '@univerjs/core';
import { FEnum } from '@univerjs/core/facade';
import { TextWrappingStyle } from '@univerjs/docs-drawing';

/**
 * @ignore
 */
export interface IFDocumentImageEnumMixin {
    /**
     * Represents the wrapping styles used by docs image operations.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = await fDocument.insertImage({
     *   source: 'https://avatars.githubusercontent.com/u/61444807?s=48&v=4',
     *   imageSourceType: univerAPI.Enum.ImageSourceType.URL,
     *   width: 320,
     *   wrappingStyle: univerAPI.Enum.DocsImageWrappingStyle.WRAP_SQUARE,
     *   textRange: {
     *     startOffset: 30,
     *   },
     * });
     * console.log(image);
     * ```
     */
    DocsImageWrappingStyle: typeof TextWrappingStyle;

    /**
     * Represents the horizontal position types used by docs image operations.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = fDocument.getImages()[0];
     *
     * if (image) {
     *   const success = image.setPositionH({
     *     relativeFrom: univerAPI.Enum.DocsImageRelativeFromH.MARGIN,
     *     posOffset: 100
     *   });
     *   console.log(success);
     * }
     * ```
     */
    DocsImageRelativeFromH: typeof ObjectRelativeFromH;

    /**
     * Represents the vertical position types used by docs image operations.
     * @example
     * ```ts
     * const fDocument = univerAPI.getActiveDocument();
     * const image = fDocument.getImages()[0];
     *
     * if (image) {
     *   const success = image.setPositionV({
     *     relativeFrom: univerAPI.Enum.DocsImageRelativeFromV.MARGIN,
     *     posOffset: 100
     *   });
     *   console.log(success);
     * }
     * ```
     */
    DocsImageRelativeFromV: typeof ObjectRelativeFromV;
}

export class FDocumentImageEnumMixin extends FEnum implements IFDocumentImageEnumMixin {
    override get DocsImageWrappingStyle(): typeof TextWrappingStyle {
        return TextWrappingStyle;
    }

    override get DocsImageRelativeFromH(): typeof ObjectRelativeFromH {
        return ObjectRelativeFromH;
    }

    override get DocsImageRelativeFromV(): typeof ObjectRelativeFromV {
        return ObjectRelativeFromV;
    }
}

FEnum.extend(FDocumentImageEnumMixin);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FEnum extends IFDocumentImageEnumMixin {}
}
