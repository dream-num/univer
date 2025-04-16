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

import type { ITransformState } from '@univerjs/core';
import { offsetRotationAxis } from './offset-rotation-axis';
import { Vector2 } from './vector2';

export function getGroupState(parentLeft: number, parentTop: number, objectStates: ITransformState[]) {
    let groupLeft = Number.MAX_SAFE_INTEGER;
    let groupTop = Number.MAX_SAFE_INTEGER;
    let groupRight = Number.MIN_SAFE_INTEGER;
    let groupBottom = Number.MIN_SAFE_INTEGER;

    objectStates.forEach((o) => {
        const { left = 0, top = 0, width = 0, height = 0 } = o;
        groupLeft = Math.min(groupLeft, left);
        groupTop = Math.min(groupTop, top);
        groupRight = Math.max(groupRight, left + width);
        groupBottom = Math.max(groupBottom, top + height);
    });

    const groupWidth = groupRight - groupLeft;
    const groupHeight = groupBottom - groupTop;

    return {
        left: groupLeft + parentLeft,
        top: groupTop + parentTop,
        width: groupWidth,
        height: groupHeight,
        angle: 0,
        scaleX: 1,
        scaleY: 1,
    };
}

export function transformObjectOutOfGroup(child: ITransformState, parent: ITransformState, groupOriginWidth: number, groupOriginHeight: number) {
    const { left = 0, top = 0, width = 0, height = 0, angle = 0 } = child;
    const { left: groupLeft = 0, top: groupTop = 0, angle: groupAngle = 0 } = parent;

    const groupCenterX = groupLeft + groupOriginWidth / 2;
    const groupCenterY = groupTop + groupOriginHeight / 2;

    const objectX = left + groupLeft;
    const objectY = top + groupTop;

    const objectCenterX = objectX + width / 2;
    const objectCenterY = objectY + height / 2;

    const finalPoint = offsetRotationAxis(new Vector2(groupCenterX, groupCenterY), groupAngle, new Vector2(objectX, objectY), new Vector2(objectCenterX, objectCenterY));

    return {
        left: finalPoint.x,
        top: finalPoint.y,
        angle: groupAngle + angle,
    };
}
