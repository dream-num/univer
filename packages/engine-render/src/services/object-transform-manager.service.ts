/**
 * Copyright 2023-present DreamNum Inc.
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
import type { IDisposable } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

export interface ITransformObject {
    unitId: string;
    objectId: string;
    top?: number;
    left?: number;
    width?: number;
    height?: number;
    angle?: number;
    scaleX?: number;
    scaleY?: number;
    skewX?: number;
    skewY?: number;
    flipX?: number;
    flipY?: number;
    strokeWidth?: number;
}

export interface IObjectTransformManagerSearch {
    unitId: string;
    objectId: string;
}

export interface IObjectTransformManagerInsert extends IObjectTransformManagerSearch {
    object: ITransformObject;
}

/**
 * This service is for worksheet build sheet skeleton.
 */
export class ObjectTransformManagerService implements IDisposable {
    private _currentObject: IObjectTransformManagerSearch = {
        unitId: '',
        objectId: '',
    };

    private _objectParam: Map<string, Map<string, ITransformObject>> = new Map();

    private readonly _currentObject$ = new BehaviorSubject<Nullable<ITransformObject>>(null);

    readonly currentObject$ = this._currentObject$.asObservable();

    dispose(): void {
        this._currentObject$.complete();
        this._objectParam = new Map();
    }

    updateObject(transformObject: ITransformObject) {
        const {
            unitId,
            objectId,
            top,
            left,
            width,
            height,
            angle,
            scaleX,
            scaleY,
            skewX,
            skewY,
            flipX,
            flipY,
            strokeWidth,
        } = transformObject;

        const currentObject = this.getObjectBySearch({
            unitId,
            objectId,
        });

        if (currentObject == null) {
            return;
        }

        if (top != null) {
            currentObject.top = top;
        }

        if (left != null) {
            currentObject.top = top;
        }

        if (width != null) {
            currentObject.top = top;
        }

        if (height != null) {
            currentObject.top = top;
        }

        if (angle != null) {
            currentObject.top = top;
        }

        if (scaleX != null) {
            currentObject.top = top;
        }

        if (scaleY != null) {
            currentObject.top = top;
        }

        if (skewX != null) {
            currentObject.top = top;
        }

        if (skewY != null) {
            currentObject.top = top;
        }

        if (flipX != null) {
            currentObject.top = top;
        }

        if (flipY != null) {
            currentObject.top = top;
        }

        if (strokeWidth != null) {
            currentObject.top = top;
        }
    }

    setCurrent(searchParam: IObjectTransformManagerSearch) {
        const { unitId, objectId } = searchParam;
        this._currentObject = {
            unitId,
            objectId,
        };

        this._currentObject$.next(this.getObjectBySearch(this._currentObject));
    }

    getCurrentObject(): Nullable<ITransformObject> {
        return this.getObjectBySearch(this._currentObject);
    }

    setObject(insertParam: IObjectTransformManagerInsert): ITransformObject {
        const { unitId, object, objectId } = insertParam;

        if (!this._objectParam.has(unitId)) {
            this._objectParam.set(unitId, new Map());
        }

        const baseObjectData = this._objectParam.get(unitId)!;

        baseObjectData.set(objectId, object);

        this._currentObject = {
            unitId,
            objectId,
        };

        this._currentObject$.next(object);

        return object;
    }

    getObjectBySearch(searchParam: IObjectTransformManagerSearch): Nullable<ITransformObject> {
        const { unitId, objectId } = searchParam;
        return this._objectParam.get(unitId)?.get(objectId);
    }
}
