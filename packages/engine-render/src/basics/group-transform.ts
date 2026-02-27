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

/**
 * Corresponds to chOff (child offset) and chExt (child extent) in OOXML.
 * Describes the coordinate space of children within a group at group creation time.
 */
export interface IGroupBaseBound {
    left: number;
    top: number;
    width: number;
    height: number;
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

export function getGroupState(parentLeft: number, parentTop: number, objectStates: ITransformState[]) {
    let groupLeft = Number.MAX_SAFE_INTEGER;
    let groupTop = Number.MAX_SAFE_INTEGER;
    let groupRight = Number.MIN_SAFE_INTEGER;
    let groupBottom = Number.MIN_SAFE_INTEGER;

    objectStates.forEach((o) => {
        const { left = 0, top = 0, width = 0, height = 0, angle = 0 } = o;

        // Apply Excel's major axis switch to get the axis-aligned bound for rotated shapes
        const rotatedBound = getRotatedBoundInGroup({ left, top, width, height }, angle);

        groupLeft = Math.min(groupLeft, rotatedBound.left);
        groupTop = Math.min(groupTop, rotatedBound.top);
        groupRight = Math.max(groupRight, rotatedBound.left + rotatedBound.width);
        groupBottom = Math.max(groupBottom, rotatedBound.top + rotatedBound.height);
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

/**
 * Transform a child object out of a group to get its absolute position.
 *
 * In the Excel-like model (OOXML):
 * - Children store their positions in the baseBound (chOff/chExt) coordinate space,
 *   which are their absolute positions at the time the group was created.
 * - The group has a current transform (off/ext) and a baseBound (chOff/chExt).
 * - To compute the child's actual absolute position:
 *   relativePos = (childPos - baseBound.offset) * (groupSize / baseBound.size) + groupPos
 *
 * @param child - The child's transform state (positions in baseBound coordinate space)
 * @param parent - The group's current transform state
 * @param baseBound - The group's baseBound (chOff/chExt), describing the original coordinate space
 */
export function transformObjectOutOfGroup(
    child: ITransformState,
    parent: ITransformState,
    baseBound: IGroupBaseBound
) {
    const { left = 0, top = 0, width = 0, height = 0, angle = 0 } = child;
    const { left: groupLeft = 0, top: groupTop = 0, width: groupWidth = 0, height: groupHeight = 0, angle: groupAngle = 0 } = parent;

    // Scale ratio from baseBound (chExt) to current group size (ext)
    const scaleX = baseBound.width > 0 ? groupWidth / baseBound.width : 1;
    const scaleY = baseBound.height > 0 ? groupHeight / baseBound.height : 1;

    // Map from baseBound coordinate space to absolute position
    const relativeX = left - baseBound.left;
    const relativeY = top - baseBound.top;

    const objectX = groupLeft + relativeX * scaleX;
    const objectY = groupTop + relativeY * scaleY;

    const scaledWidth = width * scaleX;
    const scaledHeight = height * scaleY;

    const objectCenterX = objectX + scaledWidth / 2;
    const objectCenterY = objectY + scaledHeight / 2;

    const groupCenterX = groupLeft + groupWidth / 2;
    const groupCenterY = groupTop + groupHeight / 2;

    const finalPoint = offsetRotationAxis(new Vector2(groupCenterX, groupCenterY), groupAngle, new Vector2(objectX, objectY), new Vector2(objectCenterX, objectCenterY));

    return {
        left: finalPoint.x,
        top: finalPoint.y,
        width: scaledWidth,
        height: scaledHeight,
        angle: groupAngle + angle,
    };
}
