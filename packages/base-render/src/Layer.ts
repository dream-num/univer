import { sortRules } from '@univerjs/core';

import { BaseObject } from './BaseObject';
import { RENDER_CLASS_TYPE } from './Basics/Const';
import { ThinScene } from './ThinScene';

export class Layer {
    private _objects: BaseObject[] = [];

    constructor(private _scene: ThinScene, objects: BaseObject[] = [], private _zIndex: number = 1) {
        this.addObjects(objects);
    }

    get scene() {
        return this._scene;
    }

    get zIndex() {
        return this._zIndex;
    }

    static create(scene: ThinScene, objects: BaseObject[] = [], zIndex: number = 1000) {
        return new this(scene, objects, zIndex);
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

    getObjectsByOrderForPick() {
        const objects: BaseObject[] = [];
        this._objects.sort(sortRules);
        for (const o of this._objects) {
            if (!(o.classType === RENDER_CLASS_TYPE.GROUP) && o.visible) {
                objects.push(o);
            }
        }
        return objects;
    }

    getObjects() {
        return this._objects;
    }

    addObject(o: BaseObject) {
        if (o.classType === RENDER_CLASS_TYPE.GROUP) {
            const objects = (o as BaseObject).getObjects();
            for (const object of objects) {
                if (this.scene.getObject(object.oKey)) {
                    continue;
                }
                this._objects.push(object);
                this.scene.setObjectBehavior(object);
            }
        }
        this._objects.push(o);
        this.scene.setObjectBehavior(o);
        this.scene.applyTransformer(o);

        return this;
    }

    removeObject(object: BaseObject | string) {
        const objects = this.getObjects();
        const objectsLength = objects.length;

        if (object instanceof BaseObject) {
            for (let i = 0; i < objectsLength; i++) {
                const o = objects[i];
                if (o === object) {
                    objects.splice(i, 1);
                    return;
                }
            }
        } else {
            for (let i = 0; i < objectsLength; i++) {
                const o = objects[i];
                if (o.oKey === object) {
                    objects.splice(i, 1);
                    return;
                }
            }
        }
    }

    addObjects(objects: BaseObject[]) {
        objects.forEach((o: BaseObject) => {
            this.addObject(o);
        });
        return this;
    }

    removeObjects(objects: BaseObject[] | string[]) {
        const allObjects = this.getObjects();
        const allObjectsLength = allObjects.length;

        for (let i = allObjectsLength - 1; i >= 0; i--) {
            let o: BaseObject | string = allObjects[i];
            const objectsLength = objects.length;

            if (objectsLength === 0) break;

            for (let j = 0; j < objectsLength; j++) {
                const object = objects[j];
                o = object instanceof BaseObject ? o : (o as BaseObject).oKey;
                if (o === object) {
                    allObjects.splice(i, 1);
                    // objects.splice(j, 1);
                    break;
                }
            }
        }
    }

    clear() {
        this._objects = [];
    }

    dispose() {
        this.getObjects().forEach((o) => {
            o.dispose();
        });
        this.clear();
    }
}
