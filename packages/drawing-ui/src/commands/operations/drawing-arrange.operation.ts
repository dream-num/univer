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

import type { ArrangeTypeEnum, IDrawingParam, IOperation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';

export interface IDrawingArrangeOperationParams {
    arrangeType: ArrangeTypeEnum;
    drawings?: IDrawingParam[];
}

/**
 * Group the selected drawings into a new group. The selected drawings must be of type image, shape, or group, and there must be at least 2 drawings selected.
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
