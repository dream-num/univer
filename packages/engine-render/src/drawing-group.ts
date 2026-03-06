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

import type { IGroupBaseBound } from '@univerjs/core';
import type { BaseObject } from './base-object';
import type { IViewportInfo, Vector2 } from './basics';
import type { UniverRenderingContext } from './context';
import { getDrawingGroupState, RENDER_CLASS_TYPE, Transform } from './basics';
import { Group } from './group';

export class DrawingGroupObject extends Group {
    protected override _selfSizeMode: boolean = true;
    /**
     * Corresponds to chOff (child offset) and chExt (child extent) in OOXML.
     * Describes the coordinate space of children within this group.
     * Children store their absolute positions in this coordinate space.
     * When rendering, positions are mapped from baseBound space to the group's current transform.
     */
    private _baseBound: IGroupBaseBound = {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
    };

    /**
     * Set the baseBound (chOff/chExt in OOXML) for this group.
     * This defines the coordinate space of children within the group.
     * When set, the group automatically enters selfSizeMode so its dimensions
     * are tracked independently of children.
     */
    setBaseBound(bound: IGroupBaseBound) {
        this._baseBound = { ...bound };
        // When baseBound is set, the group manages its own dimensions
        // this._selfSizeMode = true;
    }

    /**
     * Get the baseBound (chOff/chExt in OOXML) for this group.
     */
    getBaseBound(): IGroupBaseBound {
        return { ...this._baseBound };
    }

    /**
     * Override ancestorTransform to use the same render transform as render(),
     * which uses [m[0], m[1], m[2], m[3], centerX, centerY] from realBound
     * instead of the standard transform translation.
     * This ensures children (e.g., Image.isHit) that compose with
     * parent.ancestorTransform get the correct coordinate space.
     */
    override get ancestorTransform(): Transform {
        const realBound = this.getRealBound();
        const { left: realLeft, top: realTop, width: realWidth, height: realHeight } = realBound;
        const m = this.transform.getMatrix();
        const centerX = realLeft + realWidth / 2;
        const centerY = realTop + realHeight / 2;
        const renderTransform = new Transform([m[0], m[1], m[2], m[3], centerX, centerY]);

        const parent = this.getParent();
        if (this.isInGroup && parent?.classType === RENDER_CLASS_TYPE.GROUP) {
            return parent.ancestorTransform.multiply(renderTransform);
        }
        return renderTransform;
    }

    override getState() {
        return getDrawingGroupState(this.left, this.top, this._objects.map((o) => o.getState()));
    }

    override render(ctx: UniverRenderingContext, bounds: IViewportInfo): void {
        const realBound = this.getRealBound();
        const { left: realLeft, top: realTop, width: realWidth, height: realHeight } = realBound;
        ctx.save();
        const m = this.transform.getMatrix();
        const centerX = realLeft + realWidth / 2;
        const centerY = realTop + realHeight / 2;
        ctx.transform(m[0], m[1], m[2], m[3], centerX, centerY);
        const objects = this.getObjectsByOrder();

        // ctx.rect(0, 0, this.width, this.height);
        // ctx.strokeStyle = 'blue';
        // ctx.stroke();

        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];
            object.render(ctx, bounds);
        }

        ctx.restore();
    }

    override addObjects(...objects: BaseObject[]) {
        for (const object of objects) {
            this.addObject(object);
        }
    }

    override isHit(coord: Vector2): boolean {
        // Build the same render transform used in render():
        // [m[0], m[1], m[2], m[3], centerX, centerY]
        const realBound = this.getRealBound();
        const { left: realLeft, top: realTop, width: realWidth, height: realHeight } = realBound;
        const m = this.transform.getMatrix();
        const centerX = realLeft + realWidth / 2;
        const centerY = realTop + realHeight / 2;
        const renderTransform = new Transform([m[0], m[1], m[2], m[3], centerX, centerY]);

        // Account for parent group transforms if applicable
        const parent = this.getParent();
        const effectiveTransform = this.isInGroup && parent?.classType === RENDER_CLASS_TYPE.GROUP
            ? parent.ancestorTransform.multiply(renderTransform)
            : renderTransform;

        // Transform world coord to group's local space (center-based)
        const oCoord = effectiveTransform.invert().applyPoint(coord);
        const halfWidth = realWidth / 2;
        const halfHeight = realHeight / 2;

        // Check group bounding box first
        if (
            oCoord.x < -halfWidth ||
            oCoord.x > halfWidth ||
            oCoord.y < -halfHeight ||
            oCoord.y > halfHeight
        ) {
            return false;
        }

        // Check children - pass world coord since children compose with parent.ancestorTransform
        const objects = this.getObjectsByOrder();
        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];
            if (object.isHit(coord)) {
                return true;
            }
        }

        return false;
    }
}
