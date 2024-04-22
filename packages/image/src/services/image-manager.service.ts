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
import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';

import { type ImageModel, SourceType } from '../models/image-model';

export interface IImageManagerSearchParam {
    unitId: string;
    subUnitId: string; //sheetId, pageId and so on, it has a default name in doc business
    imageId: string;
}

export interface IImageManagerParam extends IImageManagerSearchParam {
    imageModel: ImageModel;
}

export type ImageManagerInfo = Map<string, Map<string, Map<string, IImageManagerParam>>>;

export interface IImageManagerService {
    readonly remove$: Observable<IImageManagerParam[]>;

    readonly andOrUpdate$: Observable<IImageManagerSearchParam[]>;

    dispose(): void;

    add(insertParam: IImageManagerParam): void;
    batchAdd(insertParams: IImageManagerParam[]): void;

    remove(searchParam: IImageManagerSearchParam): void;
    batchRemove(removeParams: IImageManagerSearchParam[]): void;

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

    private readonly _add$ = new Subject<IImageManagerSearchParam[]>();
    readonly andOrUpdate$ = this._add$.asObservable();

    dispose(): void {
        this._remove$.complete();
        this._add$.complete();
        this._imageManagerInfo.clear();
    }

    add(insertParam: IImageManagerParam) {
        this._add$.next(this._addByParam(insertParam));
    }

    batchAdd(insertParams: IImageManagerParam[]) {
        const objects: IImageManagerSearchParam[] = [];
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
        if (sourceType === SourceType.BASE64 || imageSource == null) {
            return;
        }

        this._imageSourceCache.set(source, imageSource);
    }

    getImageSourceCache(imageData: ImageModel): Nullable<HTMLImageElement> {
        const { source, sourceType } = imageData;

        if (sourceType === SourceType.BASE64) {
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

    private _addByParam(insertParam: IImageManagerParam): IImageManagerSearchParam[] {
        const { unitId, subUnitId, imageId, imageModel } = insertParam;

        if (!this._imageManagerInfo.has(unitId)) {
            this._imageManagerInfo.set(unitId, new Map());
        }

        const subComponentData = this._imageManagerInfo.get(unitId)!;

        if (!subComponentData.has(subUnitId)) {
            subComponentData.set(subUnitId, new Map());
        }

        subComponentData.get(subUnitId)!.set(imageId, insertParam);

        return [{ unitId, subUnitId, imageId }];
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
}

export const IImageManagerService = createIdentifier<IImageManagerService>('univer.plugin.image-manager.service');
