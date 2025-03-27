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

import type { IDrawingSearch, IOperation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';

export const OpenImageCropOperation: IOperation<IDrawingSearch> = {
    id: 'sheet.operation.open-image-crop',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        return true;
    },
};

export const CloseImageCropOperation: IOperation<{ isAuto?: boolean }> = {
    id: 'sheet.operation.close-image-crop',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        return true;
    },
};

export enum CropType {
    FREE = '0',
    R1_1 = '1',
    R16_9 = '2',
    R9_16 = '3',
    R5_4 = '4',
    R4_5 = '5',
    R4_3 = '6',
    R3_4 = '7',
    R3_2 = '8',
    R2_3 = '9',
}

export interface IOpenImageCropOperationBySrcRectParams {
    cropType: CropType;
}

export const AutoImageCropOperation: IOperation<IOpenImageCropOperationBySrcRectParams> = {
    id: 'sheet.operation.Auto-image-crop',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        return true;
    },
};
