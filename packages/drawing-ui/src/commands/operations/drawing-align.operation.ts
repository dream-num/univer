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

import type { IOperation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';

export enum AlignType {
    default = '0',
    left = '1',
    center = '2',
    right = '3',
    top = '4',
    middle = '5',
    bottom = '6',
    horizon = '7',
    vertical = '8',
}

export interface ISetDrawingAlignOperationParams {
    alignType: AlignType;
}

export const SetDrawingAlignOperation: IOperation<ISetDrawingAlignOperationParams> = {
    id: 'sheet.operation.set-image-align',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        return true;
    },
};
