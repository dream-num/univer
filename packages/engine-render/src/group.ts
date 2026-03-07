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

import type { Nullable } from '@univerjs/core';
import type { CURSOR_TYPE } from './basics/const';
import type { IGroupBaseBound } from './basics/group-transform';

import type { IViewportInfo } from './basics/vector2';
import type { UniverRenderingContext } from './context';
import { sortRules } from '@univerjs/core';
import { BaseObject } from './base-object';
import { RENDER_CLASS_TYPE } from './basics/const';
import { getGroupState, transformObjectOutOfGroup } from './basics/group-transform';
import { isString } from './basics/tools';

export class Group extends BaseObject {
    private _objects: BaseObject[] = [];
    private _selfSizeMode = false;

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

    constructor(key?: string, ...objects: BaseObject[]) {
        super(key);
        this.addObjects(...objects);
    }

    override get classType() {
        return RENDER_CLASS_TYPE.GROUP;
    }

    override set cursor(val: CURSOR_TYPE) {
        this.setCursor(val);
    }

    override getState() {
        if (this._selfSizeMode) {
            return super.getState();
        }

        return getGroupState(this.left, this.top, this._objects.map((o) => o.getState()));
    }

    override get width(): number {
        if (this._selfSizeMode) {
            return super.width;
        }
        return this.getState().width || 0;
    }

    override get height(): number {
        if (this._selfSizeMode) {
            return super.height;
        }
        return this.getState().height || 0;
    }

    override set width(val: number) {
        if (this._selfSizeMode) {
            super.width = val;
            return;
        }
        const preWidth = this.width;
        const numDelta = val - preWidth;
        this._objects.forEach((o) => {
            o.resize(o.width + numDelta);
        });
    }

    override set height(val: number) {
        if (this._selfSizeMode) {
            super.height = val;
            return;
        }
        const preHeight = this.height;
        const numDelta = val - preHeight;
        this._objects.forEach((o) => {
            o.resize(undefined, o.height + numDelta);
        });
    }

    override get maxZIndex() {
        let maxZIndex = 0;
        for (const object of this._objects) {
            maxZIndex = Math.max(maxZIndex, object.zIndex);
        }
        return maxZIndex;
    }

    openSelfSizeMode() {
        this._selfSizeMode = true;
    }

    closeSelfSizeMode() {
        this._selfSizeMode = false;
    }

    /**
     * Set the baseBound (chOff/chExt in OOXML) for this group.
     * This defines the coordinate space of children within the group.
     * When set, the group automatically enters selfSizeMode so its dimensions
     * are tracked independently of children.
     */
    setBaseBound(bound: IGroupBaseBound) {
        this._baseBound = { ...bound };
        // When baseBound is set, the group manages its own dimensions
        this._selfSizeMode = true;
    }

    /**
     * Get the baseBound (chOff/chExt in OOXML) for this group.
     */
    getBaseBound(): IGroupBaseBound {
        return { ...this._baseBound };
    }

    /**
     * Check if a valid baseBound is set (non-zero dimensions).
     */
    hasBaseBound(): boolean {
        return this._baseBound.width > 0 && this._baseBound.height > 0;
    }

    reCalculateObjects() {
        if (this._selfSizeMode) {
            return;
        }
        const state = this.getState();
        const { left = 0, top = 0 } = state;
        for (const object of this._objects) {
            object.transformByState({
                left: object.left - left,
                top: object.top - top,
            });
        }

        this.transformByState({
            left,
            top,
        });
    }

    addObjects(...objects: BaseObject[]) {
        for (const object of objects) {
            this.addObject(object);
        }
    }

    addObject(o: BaseObject | string) {
        let object: Nullable<BaseObject | string> = o;
        if (isString(o)) {
            const scene = this.getScene();
            object = scene?.getObject(o);
            if (!object) {
                // console.info('No object be added');
                return;
            }

            object.parent = this;
            object.isInGroup = true;
            object.groupKey = this.oKey;
            this._objects.push(object);
        } else {
            o.parent = this;
            o.isInGroup = true;
            o.groupKey = this.oKey;
            this._objects.push(o);
        }
    }

    removeObject(object: BaseObject | string) {
        const objects = this.getObjects();
        const objectsLength = objects.length;

        if (isString(object)) {
            for (let i = 0; i < objectsLength; i++) {
                const o = objects[i];
                if (o.oKey === object) {
                    objects.splice(i, 1);
                    this.parent.removeObject(o);
                    return;
                }
            }
        } else {
            for (let i = 0; i < objectsLength; i++) {
                const o = objects[i];
                if (o === object) {
                    objects.splice(i, 1);
                    this.parent.removeObject(o);
                    return;
                }
            }
        }
    }

    removeSelfObjectAndTransform(oKey: string, width?: number, height?: number, isTransform = false) {
        const objects = [...this.getObjects()];
        const objectsLength = objects.length;

        if (width == null) {
            width = this.width;
        }

        if (height == null) {
            height = this.height;
        }

        for (let i = 0; i < objectsLength; i++) {
            const o = objects[i];
            if (o.oKey === oKey) {
                objects.splice(i, 1);
                isTransform && this._transformObject(o, width, height);
                o.parent = this.parent;
                o.groupKey = undefined;
                o.isInGroup = false;

                this._objects = objects;
                return;
            }
        }
    }

    private _transformObject(object: BaseObject, groupWidth: number, groupHeight: number) {
        const baseBound = this.hasBaseBound()
            ? this._baseBound
            : { left: 0, top: 0, width: groupWidth, height: groupHeight };
        const transform = transformObjectOutOfGroup(object.getState(), this.getState(), baseBound);
        if (object.classType === RENDER_CLASS_TYPE.GROUP) {
            object.transformByState({
                left: transform.left,
                top: transform.top,
            });
        } else {
            object.transformByState(transform);
        }
    }

    getObjectsByOrder() {
        const objects: BaseObject[] = [];
        this._objects.sort(sortRules);
        for (const o of this._objects) {
            if (o.visible) {
                objects.push(o);
            }
        }
        return objects;
    }

    override getObjects() {
        return this._objects;
    }

    override render(ctx: UniverRenderingContext, bounds: IViewportInfo) {
        ctx.save();

        // When this group is a child of another group with baseBound,
        // use the mapped render matrix instead of the raw transform.
        const groupBoundMatrix = this._getGroupBoundRenderMatrix();
        if (groupBoundMatrix) {
            ctx.transform(groupBoundMatrix[0], groupBoundMatrix[1], groupBoundMatrix[2], groupBoundMatrix[3], groupBoundMatrix[4], groupBoundMatrix[5]);
        } else {
            const m = this.transform.getMatrix();
            ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        }

        const objects = this.getObjectsByOrder();

        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];
            object.render(ctx, bounds);
        }

        ctx.restore();
    }

    // override resize(width?: number | string, height?: number | string) {
    //     return this;
    // }

    // override scale(scaleX?: number, scaleY?: number) {
    //     return this;
    // }

    // override skew(skewX?: number, skewY?: number) {
    //     return this;
    // }

    // override flip(flipX?: boolean, flipY?: boolean) {
    //     return this;
    // }

    // override isHit(coord: Vector2) {
    //     return true;
    // }

    private _clear() {
        this._objects = [];
    }

    override dispose() {
        const objects = [...this.getObjects()];
        objects.forEach((o) => {
            o.dispose();
        });
        this._clear();
        super.dispose();
    }
}
