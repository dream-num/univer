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

import type { IAbsoluteTransform, Nullable } from '@univerjs/core';
import { ImageSourceType } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';

import type { IImageData } from '../models/image-model';
import { ImageModel } from '../models/image-model';


export interface IImageManagerSearchParam {
    unitId: string;
    subUnitId: string; //sheetId, pageId and so on, it has a default name in doc business
    imageId: string;
    transform?: Nullable<IAbsoluteTransform>;
}

export interface IImageManagerParam extends IImageManagerSearchParam {
    imageModel: ImageModel;
}

export interface IImageManagerDataParam extends IImageManagerSearchParam, IImageData {

}

export type ImageManagerInfo = Map<string, Map<string, Map<string, IImageManagerParam>>>;

export interface IImageManagerService {
    readonly remove$: Observable<IImageManagerParam[]>;
    readonly and$: Observable<IImageManagerParam[]>;
    readonly update$: Observable<IImageManagerParam[]>;

    dispose(): void;

    add(insertParam: IImageManagerDataParam): void;
    batchAdd(insertParams: IImageManagerDataParam[]): void;

    remove(searchParam: IImageManagerSearchParam): void;
    batchRemove(removeParams: IImageManagerSearchParam[]): void;

    update(updateParam: IImageManagerDataParam): void;
    batchUpdate(updateParams: IImageManagerDataParam[]): void;

    setCurrent(searchParam: Nullable<IImageManagerSearchParam>): void;
    getCurrent(): Nullable<IImageManagerParam>;

    getImageByParam(param: Nullable<IImageManagerSearchParam>): Nullable<IImageManagerParam>;

    getImageByOKey(oKey: string): Nullable<IImageManagerParam>;

    addImageSourceCache(imageData: ImageModel, imageSource: Nullable<HTMLImageElement>): void;
    getImageSourceCache(imageData: ImageModel): Nullable<HTMLImageElement>;
}

/**
 *
 */
export class ImageManagerService implements IDisposable, IImageManagerService {
    private _current: Nullable<IImageManagerSearchParam> = null;

    private _imageManagerInfo: ImageManagerInfo = new Map();

    private _imageSourceCache: Map<string, HTMLImageElement> = new Map();

    private readonly _remove$ = new Subject<IImageManagerParam[]>();
    readonly remove$ = this._remove$.asObservable();

    private readonly _add$ = new Subject<IImageManagerParam[]>();
    readonly and$ = this._add$.asObservable();

    private readonly _update$ = new Subject<IImageManagerParam[]>();
    readonly update$ = this._update$.asObservable();

    dispose(): void {
        this._remove$.complete();
        this._add$.complete();
        this._update$.complete();
        this._imageManagerInfo.clear();
    }

    add(insertParam: IImageManagerDataParam) {
        this._add$.next(this._addByParam(insertParam));
    }

    batchAdd(insertParams: IImageManagerDataParam[]) {
        const objects: IImageManagerParam[] = [];
        insertParams.forEach((insertParam) => {
            objects.push(...this._addByParam(insertParam));
        });

        this._add$.next(objects);
    }

    remove(searchParam: IImageManagerSearchParam) {
        this._remove$.next(this._removeByParam(searchParam));
    }

    batchRemove(removeParams: IImageManagerSearchParam[]) {
        const objects: IImageManagerParam[] = [];
        removeParams.forEach((removeParam) => {
            objects.push(...this._removeByParam(removeParam));
        });

        this._remove$.next(objects);
    }

    update(updateParam: IImageManagerDataParam) {
        this._update$.next(this._updateByParam(updateParam));
    }

    batchUpdate(updateParams: IImageManagerDataParam[]) {
        const objects: IImageManagerParam[] = [];
        updateParams.forEach((updateParam) => {
            objects.push(...this._updateByParam(updateParam));
        });

        this._update$.next(objects);
    }

    setCurrent(searchParam: Nullable<IImageManagerSearchParam>) {
        this._current = searchParam;
    }

    getCurrent(): Nullable<IImageManagerParam> {
        return this._getCurrentBySearch(this._current);
    }

    getImageByParam(param: Nullable<IImageManagerSearchParam>): Nullable<IImageManagerParam> {
        return this._getCurrentBySearch(param);
    }

    getImageByOKey(oKey: string): Nullable<IImageManagerParam> {
        const [unitId, subUnitId, imageId] = oKey.split('-');
        return this._getCurrentBySearch({ unitId, subUnitId, imageId });
    }

    addImageSourceCache(imageData: ImageModel, imageSource: Nullable<HTMLImageElement>) {
        const { source, sourceType } = imageData;
        if (sourceType === ImageSourceType.BASE64 || imageSource == null) {
            return;
        }

        this._imageSourceCache.set(source, imageSource);
    }

    getImageSourceCache(imageData: ImageModel): Nullable<HTMLImageElement> {
        const { source, sourceType } = imageData;

        if (sourceType === ImageSourceType.BASE64) {
            return;
        }

        return this._imageSourceCache.get(source);
    }

    private _getCurrentBySearch(searchParam: Nullable<IImageManagerSearchParam>): Nullable<IImageManagerParam> {
        if (searchParam == null) {
            return;
        }
        const { unitId, subUnitId, imageId } = searchParam;
        return this._imageManagerInfo.get(unitId)?.get(subUnitId)?.get(imageId);
    }

    private _addByParam(insertParam: IImageManagerDataParam): IImageManagerParam[] {
        const { unitId, subUnitId, imageId, transform, srcRect, prstGeom, imageSourceType, source } = insertParam;

        if (!this._imageManagerInfo.has(unitId)) {
            this._imageManagerInfo.set(unitId, new Map());
        }

        const subComponentData = this._imageManagerInfo.get(unitId)!;

        if (!subComponentData.has(subUnitId)) {
            subComponentData.set(subUnitId, new Map());
        }

        const model = new ImageModel({
            imageId,
            imageSourceType,
            source,
            srcRect,
            prstGeom,
        });

        const param = { unitId, subUnitId, imageId, transform, imageModel: model };

        subComponentData.get(subUnitId)!.set(imageId, param);

        return [param];
    }

    private _removeByParam(searchParam: IImageManagerSearchParam): IImageManagerParam[] {
        if (searchParam == null) {
            return [];
        }
        const { unitId, subUnitId, imageId } = searchParam;

        const subComponentObjects = this._imageManagerInfo.get(unitId)?.get(subUnitId);

        if (subComponentObjects == null) {
            return [];
        }

        const object = subComponentObjects.get(imageId);

        if (object == null) {
            return [];
        }

        subComponentObjects.delete(imageId);

        return [{ ...searchParam, imageModel: object.imageModel }];
    }

    private _updateByParam(updateParam: IImageManagerDataParam): IImageManagerParam[] {
        const { unitId, subUnitId, imageId, srcRect, prstGeom, transform } = updateParam;

        const subComponentObjects = this._imageManagerInfo.get(unitId)?.get(subUnitId);

        if (subComponentObjects == null) {
            return [];
        }

        const object = subComponentObjects.get(imageId);

        if (object == null) {
            return [];
        }

        const { imageModel } = object;

        imageModel.update({ srcRect, prstGeom });

        // const newObject = { ...object, ...updateParam };

        // subComponentObjects.set(imageId, newObject);

        return [{ unitId, subUnitId, imageId, transform, imageModel }];
    }
}

export const IImageManagerService = createIdentifier<IImageManagerService>('univer.plugin.image-manager.service');
