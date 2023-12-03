import type { Nullable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';

import type { ImageModel } from '../models/image-model';

export interface IImageManagerSearchParam {
    unitId: string;
    subComponentId: string; //sheetId, pageId and so on, it has a default name in doc business
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
}

/**
 *
 */
export class ImageManagerService implements IDisposable, IImageManagerService {
    private _current: Nullable<IImageManagerSearchParam> = null;

    private _imageManagerInfo: ImageManagerInfo = new Map();

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

    private _getCurrentBySearch(searchParam: Nullable<IImageManagerSearchParam>): Nullable<IImageManagerParam> {
        if (searchParam == null) {
            return;
        }
        const { unitId, subComponentId, imageId } = searchParam;
        return this._imageManagerInfo.get(unitId)?.get(subComponentId)?.get(imageId);
    }

    private _addByParam(insertParam: IImageManagerParam): IImageManagerSearchParam[] {
        const { unitId, subComponentId, imageId, imageModel } = insertParam;

        if (!this._imageManagerInfo.has(unitId)) {
            this._imageManagerInfo.set(unitId, new Map());
        }

        const subComponentData = this._imageManagerInfo.get(unitId)!;

        if (!subComponentData.has(subComponentId)) {
            subComponentData.set(subComponentId, new Map());
        }

        subComponentData.get(subComponentId)!.set(imageId, insertParam);

        return [{ unitId, subComponentId, imageId }];
    }

    private _removeByParam(searchParam: IImageManagerSearchParam): IImageManagerParam[] {
        if (searchParam == null) {
            return [];
        }
        const { unitId, subComponentId, imageId } = searchParam;

        const subComponentObjects = this._imageManagerInfo.get(unitId)?.get(subComponentId);

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
