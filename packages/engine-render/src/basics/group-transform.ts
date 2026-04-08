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

import type { IGroupBaseBound, ITransformState, Nullable } from '@univerjs/core';
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

/**
 * Transform a child object out of a group, computing its absolute position, angle, and flip state.
 *
 * When a DrawingGroup has a baseBound (chOff/chExt in OOXML), children store their positions
 * in the baseBound coordinate space. This method first maps the child's position from baseBound
 * space to the actual parent bound space, then applies group flip mirroring and rotation.
 *
 * @param child - The child's transform state (position in baseBound space if baseBound is provided)
 * @param parent - The parent group's transform state (absolute position, angle, flip)
 * @param groupOriginWidth - The original width of the group (used to compute group center)
 * @param groupOriginHeight - The original height of the group (used to compute group center)
 * @param baseBound - Optional. The group's baseBound (chOff/chExt). If provided, child coordinates
 *                    are mapped from this space to the parent's actual bound space before transforming.
 *
 * @example
 * // in excel, the group off & ext is the real position and size of the group, and the child position is relative to the group chOff/chExt. For example:
 * ```xml
 *   <a:xfrm>
 *        <a:off x="1212850" y="889000"/>
 *        <a:ext cx="6813550" cy="4883150"/>
 *        <a:chOff x="1212850" y="889000"/>
 *        <a:chExt cx="6813550" cy="4883150"/>
 *    </a:xfrm>
 * ```
 */
export function transformObjectOutOfGroup(
    child: ITransformState,
    parent: ITransformState,
    groupOriginWidth: number,
    groupOriginHeight: number,
    baseBound: Nullable<IGroupBaseBound>
) {
    const { left = 0, top = 0, width = 0, height = 0, angle = 0 } = child;
    const { left: groupLeft = 0, top: groupTop = 0, angle: groupAngle = 0, flipX: groupFlipX = false, flipY: groupFlipY = false } = parent;

    // Map child position from baseBound space to actual parent bound space
    let mappedLeft = left;
    let mappedTop = top;
    let mappedWidth = width;
    let mappedHeight = height;

    if (baseBound && baseBound.width > 0 && baseBound.height > 0) {
        const parentBound: IGroupBaseBound = {
            left: groupLeft,
            top: groupTop,
            width: groupOriginWidth,
            height: groupOriginHeight,
        };
        const objectBound: IGroupBaseBound = { left, top, width, height };
        const mapped = getRenderTransformBaseOnParentBound(baseBound, parentBound, objectBound);
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
        const objectCenterX = objectX + mappedWidth / 2;
        const mirroredCenterX = 2 * groupCenterX - objectCenterX;
        objectX = mirroredCenterX - mappedWidth / 2;
        flipX = !flipX;
    }

    if (groupFlipY) {
        const objectCenterY = objectY + mappedHeight / 2;
        const mirroredCenterY = 2 * groupCenterY - objectCenterY;
        objectY = mirroredCenterY - mappedHeight / 2;
        flipY = !flipY;
    }

    const objectCenterX = objectX + mappedWidth / 2;
    const objectCenterY = objectY + mappedHeight / 2;

    const finalPoint = offsetRotationAxis(
        new Vector2(groupCenterX, groupCenterY),
        groupAngle,
        new Vector2(objectX, objectY),
        new Vector2(objectCenterX, objectCenterY)
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
