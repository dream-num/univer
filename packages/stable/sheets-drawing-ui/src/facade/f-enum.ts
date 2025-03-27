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

import { DrawingTypeEnum, ImageSourceType } from '@univerjs/core';
import { FEnum } from '@univerjs/core/facade';
import { SheetDrawingAnchorType } from '@univerjs/sheets-drawing';

/**
 * @ignore
 */
export interface IFDrawingEnumMixin {
    /** Please refer to {@link DrawingTypeEnum}. */
    DrawingType: typeof DrawingTypeEnum;

    /** Please refer to {@link ImageSourceType}. */
    ImageSourceType: Omit<typeof ImageSourceType, 'UUID'>;

    /** Please refer to {@link SheetDrawingAnchorType}. */
    SheetDrawingAnchorType: typeof SheetDrawingAnchorType;
}

export class FDrawingEnumMixin extends FEnum implements IFDrawingEnumMixin {
    override get DrawingType(): typeof DrawingTypeEnum { return DrawingTypeEnum; };

    override get ImageSourceType(): Omit<typeof ImageSourceType, 'UUID'> { return ImageSourceType; };

    override get SheetDrawingAnchorType(): typeof SheetDrawingAnchorType { return SheetDrawingAnchorType; };
}

FEnum.extend(FDrawingEnumMixin);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FEnum extends IFDrawingEnumMixin { }
}
