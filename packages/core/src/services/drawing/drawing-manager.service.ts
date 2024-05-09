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

import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';
import { type Observable, Subject } from 'rxjs';
import type { Nullable } from '../../common/type-util';
import type { ITransformState } from './drawing-interfaces';

export const DEFAULT_DOCUMENT_SUB_COMPONENT_ID = '__default_document_sub_component_id20231101__';


export enum DrawingTypeEnum {
    UNRECOGNIZED = -1,
    DRAWING_IMAGE = 0,
    DRAWING_SHAPE = 1,
    DRAWING_CHART = 2,
    DRAWING_TABLE = 3,
    DRAWING_UNIT = 4,
}

export type DrawingType = DrawingTypeEnum | number;

export interface IDrawingSearch {
    drawingType: DrawingType;
    unitId: string;
    subUnitId: string; //sheetId, pageId and so on, it has a default name in doc business
    drawingId: string;
}

export interface IDrawingParam extends IDrawingSearch {
    transform?: Nullable<ITransformState>;
    zIndex?: number;
    groupId?: string;
}


export interface IDrawingMap {
    [unitId: string]: IDrawingSubunitMap;
}

export interface IDrawingSubunitMap {
    [subUnitId: string]: IDrawingMapItem;
}

export interface IDrawingMapItem {
    [drawingId: string]: IDrawingParam;
}


export interface IDrawingManagerService {
    readonly remove$: Observable<IDrawingParam[]>;
    readonly add$: Observable<IDrawingParam[]>;
    readonly update$: Observable<IDrawingParam[]>;
    readonly extraUpdate$: Observable<IDrawingParam[]>;
    readonly focus$: Observable<IDrawingParam[]>;

    dispose(): void;

    add<T extends IDrawingParam>(insertParam: T): void;
    batchAdd<T extends IDrawingParam>(insertParams: T[]): void;

    remove(searchParam: IDrawingSearch): void;
    batchRemove(removeParams: IDrawingSearch[]): void;

    update<T extends IDrawingParam>(updateParam: T): void;
    batchUpdate<T extends IDrawingParam>(updateParams: T[]): void;

    extraUpdateNotification<T extends IDrawingParam>(updateParams: T[]): void;

    getDrawingByParam<T extends IDrawingParam>(param: Nullable<IDrawingSearch>): Nullable<T>;

    getDrawingOKey<T extends IDrawingParam>(oKey: string): Nullable<T>;

    focusDrawing(param: Nullable<IDrawingSearch>): void;
    getFocusDrawings(): IDrawingParam[];
}

/**
 *
 */
export class DrawingManagerService implements IDisposable, IDrawingManagerService {
    private _drawingManagerInfo: { [drawingType: DrawingType]: IDrawingMap } = {};

    private _focusDrawings: IDrawingParam[] = [];

    private readonly _remove$ = new Subject<IDrawingParam[]>();
    readonly remove$ = this._remove$.asObservable();

    private readonly _add$ = new Subject<IDrawingParam[]>();
    readonly add$ = this._add$.asObservable();

    private readonly _update$ = new Subject<IDrawingParam[]>();
    readonly update$ = this._update$.asObservable();

    private readonly _extraUpdate$ = new Subject<IDrawingParam[]>();
    readonly extraUpdate$ = this._extraUpdate$.asObservable();

    private _focus$ = new Subject<IDrawingParam[]>();
    focus$: Observable<IDrawingParam[]> = this._focus$.asObservable();


    dispose(): void {
        this._remove$.complete();
        this._add$.complete();
        this._update$.complete();
        this._drawingManagerInfo = {};
    }

    add<T extends IDrawingParam>(insertParam: T) {
        this._add$.next(this._addByParam(insertParam));
    }

    batchAdd<T extends IDrawingParam>(insertParams: T[]) {
        const objects: T[] = [];
        insertParams.forEach((insertParam) => {
            objects.push(...this._addByParam(insertParam));
        });

        this._add$.next(objects);
    }

    remove<T extends IDrawingParam>(searchParam: IDrawingSearch) {
        this._remove$.next(this._removeByParam<T>(searchParam));
    }

    batchRemove<T extends IDrawingParam>(removeParams: IDrawingSearch[]) {
        const objects: IDrawingParam[] = [];
        removeParams.forEach((removeParam) => {
            objects.push(...this._removeByParam<T>(removeParam));
        });

        this._remove$.next(objects);
    }

    update<T extends IDrawingParam>(updateParam: T) {
        this._update$.next(this._updateByParam<T>(updateParam));
    }

    batchUpdate<T extends IDrawingParam>(updateParams: T[]) {
        const objects: T[] = [];
        updateParams.forEach((updateParam) => {
            objects.push(...this._updateByParam<T>(updateParam));
        });

        this._update$.next(objects);
    }

    extraUpdateNotification<T extends IDrawingParam>(updateParams: T[]) {
        this._extraUpdate$.next(updateParams);
    }

    getDrawingByParam<T extends IDrawingParam>(param: Nullable<IDrawingSearch>): Nullable<T> {
        return this._getCurrentBySearch<T>(param);
    }

    getDrawingOKey<T extends IDrawingParam>(oKey: string): Nullable<T> {
        const [unitId, subUnitId, drawingId, drawingType] = oKey.split('#-#');
        return this._getCurrentBySearch<T>({ unitId, subUnitId, drawingId, drawingType: Number.parseInt(drawingType) });
    }

    focusDrawing(param: Nullable<IDrawingSearch>): void {
        if (param == null) {
            this._focusDrawings = [];
            this._focus$.next([]);
            return;
        }
        const { unitId, subUnitId, drawingId, drawingType } = param;
        const item = this._drawingManagerInfo[drawingType]?.[unitId]?.[subUnitId]?.[drawingId];
        if (item == null) {
            this._focusDrawings = [];
            this._focus$.next([]);
            return;
        }
        this._focusDrawings.push(item);
        this._focus$.next([item]);
    }

    getFocusDrawings() {
        return this._focusDrawings;
    }

    private _getCurrentBySearch<T extends IDrawingParam>(searchParam: Nullable<IDrawingSearch>): Nullable<T> {
        if (searchParam == null) {
            return;
        }
        const { unitId, subUnitId, drawingId, drawingType } = searchParam;
        return this._drawingManagerInfo[drawingType]?.[unitId]?.[subUnitId]?.[drawingId] as T;
    }

    private _addByParam<T extends IDrawingParam>(insertParam: T): T[] {
        const { unitId, subUnitId, drawingId, drawingType } = insertParam;

        if (!this._drawingManagerInfo[drawingType]) {
            this._drawingManagerInfo[drawingType] = {};
        }

        if (!this._drawingManagerInfo[drawingType][unitId]) {
            this._drawingManagerInfo[drawingType][unitId] = {};
        }

        if (!this._drawingManagerInfo[drawingType][unitId][subUnitId]) {
            this._drawingManagerInfo[drawingType][unitId][subUnitId] = {};
        }

        this._drawingManagerInfo[drawingType][unitId][subUnitId][drawingId] = insertParam;

        return [insertParam];
    }

    private _removeByParam<T extends IDrawingParam>(searchParam: Nullable<IDrawingSearch>): T[] {
        if (searchParam == null) {
            return [];
        }
        const { unitId, subUnitId, drawingId, drawingType } = searchParam;

        const subComponentObjects = this._drawingManagerInfo[drawingType]?.[unitId]?.[subUnitId];

        if (subComponentObjects == null) {
            return [];
        }

        const object = subComponentObjects[drawingId] as T;

        if (object == null) {
            return [];
        }

        delete subComponentObjects[drawingId];

        return [object];
    }

    private _updateByParam<T extends IDrawingParam>(updateParam: T): T[] {
        const { unitId, subUnitId, drawingId, drawingType } = updateParam;

        const subComponentObjects = this._drawingManagerInfo[drawingType]?.[unitId]?.[subUnitId];

        if (subComponentObjects == null) {
            return [];
        }

        const object = subComponentObjects[drawingId] as T;

        if (object == null) {
            return [];
        }

        const newObject = { ...object, ...updateParam };

        subComponentObjects[drawingId] = newObject;

        return [newObject];
    }
}

export const IDrawingManagerService = createIdentifier<IDrawingManagerService>('univer.plugin.drawing-manager.service');

