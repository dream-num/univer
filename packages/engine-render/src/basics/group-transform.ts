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

import type { IGroupBaseBound, ITransformState } from '@univerjs/core';
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

export function getDrawingGroupState(parentLeft: number, parentTop: number, objectStates: ITransformState[]) {
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
        left: groupLeft,
        top: groupTop,
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

/**
 * Get the rendered position and size of an object based on the group's baseBound and the parent's bound.
 * @param baseBound The group's baseBound defining the coordinate space for its children,In Excel, this corresponds to chOff (child offset) and chExt (child extent) in OOXML.
 * @param parentBound The bounding box of the parent context (e.g., the group or canvas) within which the object is rendered.
 * @param objectBound The original bounding box of the object in the group's coordinate space.
 * @returns {IGroupBaseBound} The transformed bound for rendering the object within the group context
 */
export function getRenderTransformBaseOnParentBound(baseBound: IGroupBaseBound, parentBound: IGroupBaseBound, objectBound: IGroupBaseBound): IGroupBaseBound {
    if (!baseBound) {
        return {
            left: objectBound.left,
            top: objectBound.top,
            width: objectBound.width,
            height: objectBound.height,
        };
    }
    const { left, top, width, height } = baseBound;
    const { left: parentLeft, top: parentTop, width: parentWidth, height: parentHeight } = parentBound;

    const objectRelativeLeft = parentLeft + (objectBound.left - left) / width * parentWidth;
    const objectRelativeTop = parentTop + (objectBound.top - top) / height * parentHeight;
    const objectRelativeWidth = objectBound.width / width * parentWidth;
    const objectRelativeHeight = objectBound.height / height * parentHeight;
    return {
        left: objectRelativeLeft,
        top: objectRelativeTop,
        width: objectRelativeWidth,
        height: objectRelativeHeight,
    };
}

/**
 * In Excel, a rotated shape's bounding box for group calculations uses major axis switching.
 * The axis-aligned bound depends on which 90° increment the rotation angle is closest to:
 *
 * [-45°, 45°)   → 0°   horizontal (original width/height)
 * [45°, 135°)   → 90°  vertical   (width/height swapped)
 * [135°, 225°)  → 180° horizontal (original width/height)
 * [225°, 315°)  → 270° vertical   (width/height swapped)
 *
 * @param bound - The original axis-aligned bound { left, top, width, height }
 * @param angle - The rotation angle in degrees
 */
export function getRotatedBoundInGroup(bound: IGroupBaseBound, angle: number): IGroupBaseBound {
    const normalizedAngle = ((angle % 360) + 360) % 360;

    const cx = bound.left + bound.width / 2;
    const cy = bound.top + bound.height / 2;

    const isHorizontalLike =
        (normalizedAngle >= 315 || normalizedAngle < 45) ||
        (normalizedAngle >= 135 && normalizedAngle < 225);

    let width: number;
    let height: number;

    if (isHorizontalLike) {
        width = bound.width;
        height = bound.height;
    } else {
        // Major axis switch: swap width/height
        width = bound.height;
        height = bound.width;
    }

    return {
        left: cx - width / 2,
        top: cy - height / 2,
        width,
        height,
    };
}
