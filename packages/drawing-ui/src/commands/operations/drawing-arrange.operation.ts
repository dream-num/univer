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
import { ArrangeTypeEnum, CommandType, ICommandService } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';

export interface IDrawingArrangeOperationParams {
    arrangeType: ArrangeTypeEnum;
    drawings?: IDrawingParam[];
}

/**
 * Set the layer of the drawing, including forward, backward, front, and back
 */
export const SetDrawingArrangeOperation: IOperation<IDrawingArrangeOperationParams> = {
    id: 'drawing.operation.set-drawing-arrange',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        const drawingManagerService = accessor.get(IDrawingManagerService);

        const { arrangeType } = params;
        const drawings = params.drawings || drawingManagerService.getFocusDrawings();

        const { unitId, subUnitId } = drawings[0];
        const drawingIds = drawings.map((drawing) => drawing.drawingId);

        drawingManagerService.featurePluginOrderUpdateNotification({ unitId, subUnitId, drawingIds, arrangeType });

        return true;
    },
};

export const SetDrawingArrangeFrontOperation: IOperation = {
    id: 'drawing.operation.set-drawing-arrange-front',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        return accessor.get(ICommandService).syncExecuteCommand(SetDrawingArrangeOperation.id, { arrangeType: ArrangeTypeEnum.front });
    },
};

export const SetDrawingArrangeForwardOperation: IOperation = {
    id: 'drawing.operation.set-drawing-arrange-forward',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        return accessor.get(ICommandService).syncExecuteCommand(SetDrawingArrangeOperation.id, { arrangeType: ArrangeTypeEnum.forward });
    },
};

export const SetDrawingArrangeBackOperation: IOperation = {
    id: 'drawing.operation.set-drawing-arrange-back',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        return accessor.get(ICommandService).syncExecuteCommand(SetDrawingArrangeOperation.id, { arrangeType: ArrangeTypeEnum.back });
    },
};

export const SetDrawingArrangeBackwardOperation: IOperation = {
    id: 'drawing.operation.set-drawing-arrange-backward',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        return accessor.get(ICommandService).syncExecuteCommand(SetDrawingArrangeOperation.id, { arrangeType: ArrangeTypeEnum.backward });
    },
};
