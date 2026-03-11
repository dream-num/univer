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

import type { IAccessor, IDrawingParam } from '@univerjs/core';
import type { IDrawingGroupUpdateParam } from '@univerjs/drawing';
import { CommandType, DrawingTypeEnum, generateRandomId } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { getGroupState, transformObjectOutOfGroup } from '@univerjs/engine-render';

export const SetDrawingGroupOperation = {
    id: 'drawing.operation.set-drawing-group',
    type: CommandType.OPERATION,
    handler: (accessor: IAccessor) => {
        const drawingManagerService = accessor.get(IDrawingManagerService);

        const focusDrawings = drawingManagerService.getFocusDrawings();
        const { unitId, subUnitId } = focusDrawings[0];

        const groupId = generateRandomId(10);
        const groupTransform = getGroupState(0, 0, focusDrawings.map((o) => o.transform || {}));
        const groupParam = {
            unitId,
            subUnitId,
            drawingId: groupId,
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
            transform: groupTransform,
            groupBaseBound: {
                left: groupTransform.left,
                top: groupTransform.top,
                width: groupTransform.width,
                height: groupTransform.height,
            },
        } as IDrawingParam;

        const children = focusDrawings.map((drawing) => {
            const transform = drawing.transform || { left: 0, top: 0 };
            const { unitId, subUnitId, drawingId } = drawing;
            return {
                unitId,
                subUnitId,
                drawingId,
                transform: {
                    ...transform,
                    // left: transform.left! - groupTransform.left,
                    // top: transform.top! - groupTransform.top,
                },
                groupId,
            };
        }) as IDrawingParam[];

        drawingManagerService.featurePluginGroupUpdateNotification([{
            parent: groupParam,
            children,
        }]);

        return true;
    },
};

export const CancelDrawingGroupOperation = {
    id: 'drawing.operation.cancel-drawing-group',
    type: CommandType.OPERATION,
    handler: (accessor: IAccessor) => {
        const drawingManagerService = accessor.get(IDrawingManagerService);

        const focusDrawings = drawingManagerService.getFocusDrawings();
        const params = focusDrawings
            .map((drawing) => {
                if (drawing.drawingType !== DrawingTypeEnum.DRAWING_GROUP) return null;

                const { unitId, subUnitId, drawingId, transform: groupTransform = { width: 0, height: 0 }, groupBaseBound } = drawing;
                if (groupTransform === null) return null;

                const objects = drawingManagerService.getDrawingsByGroup({ unitId, subUnitId, drawingId });
                if (objects.length === 0) return null;

                const children = objects.map((object) => {
                    const { transform } = object;
                    const { unitId, subUnitId, drawingId } = object;
                    const newTransform = transformObjectOutOfGroup(transform || {}, groupTransform, groupTransform.width || 0, groupTransform.height || 0, groupBaseBound);
                    return {
                        unitId,
                        subUnitId,
                        drawingId,
                        transform: {
                            ...transform,
                            ...newTransform,
                        },
                        groupId: undefined,
                    };
                });

                return {
                    parent: drawing,
                    children,
                } as IDrawingGroupUpdateParam;
            })
            .filter((o) => o !== null) as IDrawingGroupUpdateParam[];

        if (params.length === 0) return false;

        drawingManagerService.featurePluginUngroupUpdateNotification(params);

        return true;
    },
};
