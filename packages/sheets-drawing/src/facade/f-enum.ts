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

import { DrawingTypeEnum } from '@univerjs/core';
import { FEnum } from '@univerjs/core/facade';
import { SheetDrawingAnchorType } from '@univerjs/sheets-drawing';

/**
 * @ignore
 */
export interface IFSheetsDrawingEnumMixin {
    /** Please refer to {@link DrawingTypeEnum}. */
    DrawingType: typeof DrawingTypeEnum;

    /** Please refer to {@link SheetDrawingAnchorType}. */
    SheetDrawingAnchorType: typeof SheetDrawingAnchorType;
}

export class FSheetsDrawingEnumMixin extends FEnum implements IFSheetsDrawingEnumMixin {
    override get DrawingType(): typeof DrawingTypeEnum { return DrawingTypeEnum; };

    override get SheetDrawingAnchorType(): typeof SheetDrawingAnchorType { return SheetDrawingAnchorType; };
}

FEnum.extend(FSheetsDrawingEnumMixin);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FEnum extends IFSheetsDrawingEnumMixin { }
}
