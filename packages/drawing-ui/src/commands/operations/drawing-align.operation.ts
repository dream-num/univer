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

import type { IDrawingParam, IOperation } from '@univerjs/core';
import { CommandType, ICommandService } from '@univerjs/core';

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
    drawings?: IDrawingParam[];
}

/**
 * Set drawing align operation, including left, center, right, top, middle, bottom, horizon and vertical align.
 */
export const SetDrawingAlignOperation: IOperation<ISetDrawingAlignOperationParams> = {
    id: 'sheet.operation.set-image-align',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        return true;
    },
};

export const SetDrawingAlignLeftOperation: IOperation = {
    id: 'sheet.operation.set-drawing-align-left',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        return accessor.get(ICommandService).syncExecuteCommand(SetDrawingAlignOperation.id, { alignType: AlignType.left });
    },
};

export const SetDrawingAlignCenterOperation: IOperation = {
    id: 'sheet.operation.set-drawing-align-center',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        return accessor.get(ICommandService).syncExecuteCommand(SetDrawingAlignOperation.id, { alignType: AlignType.center });
    },
};

export const SetDrawingAlignRightOperation: IOperation = {
    id: 'sheet.operation.set-drawing-align-right',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        return accessor.get(ICommandService).syncExecuteCommand(SetDrawingAlignOperation.id, { alignType: AlignType.right });
    },
};

export const SetDrawingAlignTopOperation: IOperation = {
    id: 'sheet.operation.set-drawing-align-top',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        return accessor.get(ICommandService).syncExecuteCommand(SetDrawingAlignOperation.id, { alignType: AlignType.top });
    },
};

export const SetDrawingAlignMiddleOperation: IOperation = {
    id: 'sheet.operation.set-drawing-align-middle',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        return accessor.get(ICommandService).syncExecuteCommand(SetDrawingAlignOperation.id, { alignType: AlignType.middle });
    },
};

export const SetDrawingAlignBottomOperation: IOperation = {
    id: 'sheet.operation.set-drawing-align-bottom',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        return accessor.get(ICommandService).syncExecuteCommand(SetDrawingAlignOperation.id, { alignType: AlignType.bottom });
    },
};

export const SetDrawingAlignHorizonOperation: IOperation = {
    id: 'sheet.operation.set-drawing-align-horizon',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        return accessor.get(ICommandService).syncExecuteCommand(SetDrawingAlignOperation.id, { alignType: AlignType.horizon });
    },
};

export const SetDrawingAlignVerticalOperation: IOperation = {
    id: 'sheet.operation.set-drawing-align-vertical',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        return accessor.get(ICommandService).syncExecuteCommand(SetDrawingAlignOperation.id, { alignType: AlignType.vertical });
    },
};
