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

import type { IDrawingParam } from '@univerjs/core';
import type { IDrawingGroupUpdateParam } from '@univerjs/drawing';
import { DrawingTypeEnum } from '@univerjs/core';
import { getGroupState, transformObjectOutOfGroup } from '@univerjs/engine-render';

export function ungroupToGroup(ungroupParams: IDrawingGroupUpdateParam[]) {
    const newGroupParams: IDrawingGroupUpdateParam[] = [];

    ungroupParams.forEach((ungroupParam) => {
        const { parent, children } = ungroupParam;
        const { unitId, subUnitId, drawingId: groupId } = parent;
        const groupTransform = getGroupState(0, 0, children.map((o) => o.transform || {}));

        const newChildren = children.map((drawing) => {
            const transform = drawing.transform || { left: 0, top: 0 };
            const { unitId, subUnitId, drawingId } = drawing;
            return {
                unitId,
                subUnitId,
                drawingId,
                transform: {
                    ...transform,
                    left: transform.left! - groupTransform.left,
                    top: transform.top! - groupTransform.top,
                },
                groupId,
            };
        }) as IDrawingParam[];

        const groupParam = {
            unitId,
            subUnitId,
            drawingId: groupId,
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
            transform: groupTransform,
        } as IDrawingParam;

        newGroupParams.push({
            parent: groupParam,
            children: newChildren,
        });
    });

    return newGroupParams;
}

export function groupToUngroup(groupParams: IDrawingGroupUpdateParam[]) {
    const newGroupParams: IDrawingGroupUpdateParam[] = [];

    groupParams.forEach((groupParam) => {
        const { parent, children } = groupParam;
        const { unitId, subUnitId, drawingId: groupId, transform: groupTransform = { width: 0, height: 0 } } = parent;
        if (groupTransform == null) {
            return;
        }
        const newChildren = children.map((object) => {
            const { transform } = object;
            const { unitId, subUnitId, drawingId } = object;
            const newTransform = transformObjectOutOfGroup(transform || {}, groupTransform, groupTransform.width || 0, groupTransform.height || 0);
            return {
                unitId,
                subUnitId,
                drawingId,
                transform: newTransform,
                groupId: undefined,
            };
        }) as IDrawingParam[];

        const ungroupParam = {
            unitId,
            subUnitId,
            drawingId: groupId,
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
            transform: {
                left: 0,
                top: 0,
            },
        } as IDrawingParam;

        newGroupParams.push({
            parent: ungroupParam,
            children: newChildren,
        });
    });

    return newGroupParams;
}
