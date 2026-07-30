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

import type { ITransformState } from '../types/interfaces/i-drawing';
import type { IGroupBaseBound } from './shape';
import type { Nullable } from './types';

interface IPoint {
    x: number;
    y: number;
}

function rotatePoint(point: IPoint, origin: IPoint, angle: number): IPoint {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    return {
        x: origin.x + (point.x - origin.x) * cos - (point.y - origin.y) * sin,
        y: origin.y + (point.x - origin.x) * sin + (point.y - origin.y) * cos,
    };
}

function offsetRotationAxis(reference: IPoint, angleDegree: number, vertex: IPoint, center: IPoint): IPoint {
    const angle = angleDegree * Math.PI / 180;
    const rotatedVertex = rotatePoint(vertex, reference, angle);
    const rotatedCenter = rotatePoint(center, reference, angle);

    return rotatePoint(rotatedVertex, rotatedCenter, -angle);
}

export function getGroupState(parentLeft: number, parentTop: number, objectStates: ITransformState[]) {
    let groupLeft = Number.MAX_SAFE_INTEGER;
    let groupTop = Number.MAX_SAFE_INTEGER;
    let groupRight = Number.MIN_SAFE_INTEGER;
    let groupBottom = Number.MIN_SAFE_INTEGER;

    objectStates.forEach((objectState) => {
        const { left = 0, top = 0, width = 0, height = 0 } = objectState;
        groupLeft = Math.min(groupLeft, left);
        groupTop = Math.min(groupTop, top);
        groupRight = Math.max(groupRight, left + width);
        groupBottom = Math.max(groupBottom, top + height);
    });

    return {
        left: groupLeft + parentLeft,
        top: groupTop + parentTop,
        width: groupRight - groupLeft,
        height: groupBottom - groupTop,
        angle: 0,
        scaleX: 1,
        scaleY: 1,
    };
}

export function getDrawingGroupState(parentLeft: number, parentTop: number, objectStates: ITransformState[]) {
    const groupState = getGroupState(parentLeft, parentTop, objectStates);

    return {
        ...groupState,
        left: groupState.left - parentLeft,
        top: groupState.top - parentTop,
    };
}

export function transformObjectOutOfGroup(
    child: ITransformState,
    parent: ITransformState,
    groupOriginWidth: number,
    groupOriginHeight: number,
    baseBound: Nullable<IGroupBaseBound>
) {
    const { left = 0, top = 0, width = 0, height = 0, angle = 0 } = child;
    const {
        left: groupLeft = 0,
        top: groupTop = 0,
        angle: groupAngle = 0,
        flipX: groupFlipX = false,
        flipY: groupFlipY = false,
    } = parent;

    let mappedLeft = left;
    let mappedTop = top;
    let mappedWidth = width;
    let mappedHeight = height;

    if (baseBound && baseBound.width > 0 && baseBound.height > 0) {
        const mapped = getRenderTransformBaseOnParentBound(
            baseBound,
            {
                left: groupLeft,
                top: groupTop,
                width: groupOriginWidth,
                height: groupOriginHeight,
            },
            { left, top, width, height }
        );
        mappedLeft = mapped.left;
        mappedTop = mapped.top;
        mappedWidth = mapped.width;
        mappedHeight = mapped.height;
    }

    const groupCenterX = groupLeft + groupOriginWidth / 2;
    const groupCenterY = groupTop + groupOriginHeight / 2;
    let flipX = child.flipX || false;
    let flipY = child.flipY || false;
    let objectX = mappedLeft;
    let objectY = mappedTop;

    if (groupFlipX) {
        objectX = 2 * groupCenterX - (objectX + mappedWidth / 2) - mappedWidth / 2;
        flipX = !flipX;
    }

    if (groupFlipY) {
        objectY = 2 * groupCenterY - (objectY + mappedHeight / 2) - mappedHeight / 2;
        flipY = !flipY;
    }

    const finalPoint = offsetRotationAxis(
        { x: groupCenterX, y: groupCenterY },
        groupAngle,
        { x: objectX, y: objectY },
        { x: objectX + mappedWidth / 2, y: objectY + mappedHeight / 2 }
    );

    return {
        left: finalPoint.x,
        top: finalPoint.y,
        width: mappedWidth,
        height: mappedHeight,
        angle: groupAngle + angle,
        flipX,
        flipY,
    };
}

export function getRenderTransformBaseOnParentBound(
    baseBound: IGroupBaseBound,
    parentBound: IGroupBaseBound,
    objectBound: IGroupBaseBound
): IGroupBaseBound {
    if (!baseBound) {
        return { ...objectBound };
    }

    const { left, top, width, height } = baseBound;
    const {
        left: parentLeft,
        top: parentTop,
        width: parentWidth,
        height: parentHeight,
    } = parentBound;

    return {
        left: parentLeft + (objectBound.left - left) / width * parentWidth,
        top: parentTop + (objectBound.top - top) / height * parentHeight,
        width: objectBound.width / width * parentWidth,
        height: objectBound.height / height * parentHeight,
    };
}

export function getRotatedBoundInGroup(bound: IGroupBaseBound, angle: number): IGroupBaseBound {
    const normalizedAngle = ((angle % 360) + 360) % 360;
    const isHorizontalLike =
        normalizedAngle >= 315 ||
        normalizedAngle < 45 ||
        (normalizedAngle >= 135 && normalizedAngle < 225);

    if (isHorizontalLike) {
        return { ...bound };
    }

    const centerX = bound.left + bound.width / 2;
    const centerY = bound.top + bound.height / 2;

    return {
        left: centerX - bound.height / 2,
        top: centerY - bound.width / 2,
        width: bound.height,
        height: bound.width,
    };
}
