import { Nullable, sortRules } from '@univerjs/core';

import { BaseObject } from './base-object';
import { CURSOR_TYPE, RENDER_CLASS_TYPE } from './basics/const';
import { isString } from './basics/tools';
import { IBoundRect, Vector2 } from './basics/vector2';
import { ThinScene } from './thin-scene';

export class Group extends BaseObject {
    private _objects: BaseObject[] = [];

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

    addObjects(...objects: BaseObject[]) {
        for (const object of objects) {
            this.addObject(object);
        }
    }

    addObject(o: BaseObject | string) {
        let object: Nullable<BaseObject | string> = o;
        if (isString(o)) {
            const scene = this.getScene() as ThinScene;
            object = scene?.getObject(o);
            if (!object) {
                console.info('No object be added');
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

    getObjectsByOrder() {
        const objects: BaseObject[] = [];
        this._objects.sort(sortRules);
        for (const o of this._objects) {
            if (!o.isInGroup && o.visible) {
                objects.push(o);
            }
        }
        return objects;
    }

    override getObjects() {
        return this._objects;
    }

    override render(ctx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        ctx.save();
        const m = this.transform.getMatrix();
        ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        this._objects.sort(sortRules);
        for (const object of this._objects) {
            object.render(ctx, this._transformBounds(bounds));
        }
        ctx.restore();
    }

    override resize(width?: number | string, height?: number | string) {
        return this;
    }

    override scale(scaleX?: number, scaleY?: number) {
        return this;
    }

    override skew(skewX?: number, skewY?: number) {
        return this;
    }

    override flip(flipX?: boolean, flipY?: boolean) {
        return this;
    }

    // 判断自己scope下的所有对象是否有被选中的
    override isHit(coord: Vector2) {
        return true;
    }

    // 判断被选中的唯一对象
    pick(coord: Vector2) {}

    override dispose() {
        this.getObjects().forEach((o) => {
            o.dispose();
        });
        super.dispose();
    }

    private _transformBounds(bounds?: IBoundRect) {
        return bounds;
    }
}
