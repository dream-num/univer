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
import { sortRules, sortRulesByDesc } from '../../shared';
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


export interface IDrawingSearchAllType {
    unitId: string;
    subUnitId: string; //sheetId, pageId and so on, it has a default name in doc business
    drawingId: string;
}

export interface IDrawingSearch extends IDrawingSearchAllType {

}

export interface IDrawingParam extends IDrawingSearch {
    drawingType: DrawingType;
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


export interface IDrawingOrderMap {
    [unitId: string]: IDrawingSubunitOrderMap;
}

export interface IDrawingSubunitOrderMap {
    [subUnitId: string]: string[];
}

export interface IDrawingOrderMapParam {
    unitId: string;
    subUnitId: string;
    drawingIds: string[];
}


export interface IDrawingManagerService {
    readonly remove$: Observable<IDrawingParam[]>;
    readonly add$: Observable<IDrawingParam[]>;
    readonly update$: Observable<IDrawingParam[]>;
    readonly externalUpdate$: Observable<IDrawingParam[]>;
    readonly focus$: Observable<IDrawingParam[]>;
    readonly order$: Observable<IDrawingOrderMapParam>;

    dispose(): void;

    add<T extends IDrawingParam>(insertParam: T): void;
    batchAdd<T extends IDrawingParam>(insertParams: T[]): void;

    remove(searchParam: IDrawingSearch): void;
    batchRemove(removeParams: IDrawingSearch[]): void;

    update<T extends IDrawingParam>(updateParam: T): void;
    batchUpdate<T extends IDrawingParam>(updateParams: T[]): void;

    externalUpdateNotification<T extends IDrawingParam>(updateParams: T[]): void;

    getDrawingByParam<T extends IDrawingParam>(param: Nullable<IDrawingSearch>): Nullable<T>;

    getDrawingOKey<T extends IDrawingParam>(oKey: string): Nullable<T>;

    focusDrawing(params: Nullable<IDrawingSearch[]>): void;
    getFocusDrawings(): IDrawingParam[];

    forwardDrawings(unitId: string, subUnitId: string, drawingIds: string[]): void;
    backwardDrawing(unitId: string, subUnitId: string, drawingIds: string[]): void;
    frontDrawing(unitId: string, subUnitId: string, drawingIds: string[]): void;
    backDrawing(unitId: string, subUnitId: string, drawingIds: string[]): void;
    replaceDrawingOrder(unitId: string, subUnitId: string, drawingIds: string[]): void;
    getDrawingOrder(unitId: string, subUnitId: string): string[];
}

/**
 *
 */
export class DrawingManagerService implements IDisposable, IDrawingManagerService {
    private _drawingManagerInfo: IDrawingMap = {};

    private _drawingOrderMap: IDrawingOrderMap = {};

    private _focusDrawings: IDrawingParam[] = [];

    private readonly _remove$ = new Subject<IDrawingParam[]>();
    readonly remove$ = this._remove$.asObservable();

    private readonly _add$ = new Subject<IDrawingParam[]>();
    readonly add$ = this._add$.asObservable();

    private readonly _update$ = new Subject<IDrawingParam[]>();
    readonly update$ = this._update$.asObservable();

    private readonly _externalUpdate$ = new Subject<IDrawingParam[]>();
    readonly externalUpdate$ = this._externalUpdate$.asObservable();

    private _focus$ = new Subject<IDrawingParam[]>();
    focus$: Observable<IDrawingParam[]> = this._focus$.asObservable();

    private _order$ = new Subject<IDrawingOrderMapParam>();
    order$: Observable<IDrawingOrderMapParam> = this._order$.asObservable();

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

    externalUpdateNotification<T extends IDrawingParam>(updateParams: T[]) {
        this._externalUpdate$.next(updateParams);
    }

    getDrawingByParam<T extends IDrawingParam>(param: Nullable<IDrawingSearch>): Nullable<T> {
        return this._getCurrentBySearch<T>(param);
    }

    getDrawingOKey<T extends IDrawingParam>(oKey: string): Nullable<T> {
        const [unitId, subUnitId, drawingId] = oKey.split('#-#');
        return this._getCurrentBySearch<T>({ unitId, subUnitId, drawingId });
    }

    focusDrawing(params: Nullable<IDrawingSearch[]>): void {
        if (params == null) {
            this._focusDrawings = [];
            this._focus$.next([]);
            return;
        }

        const drawingParams: IDrawingParam[] = [];
        params.forEach((param) => {
            const { unitId, subUnitId, drawingId } = param;
            const item = this._drawingManagerInfo[unitId]?.[subUnitId]?.[drawingId];
            if (item != null) {
                drawingParams.push(item);
            }
        });

        if (drawingParams.length > 0) {
            this._focusDrawings = drawingParams;
            this._focus$.next(drawingParams);
        }
    }

    getFocusDrawings() {
        return this._focusDrawings;
    }

    getDrawingOrder(unitId: string, subUnitId: string) {
        return this._drawingOrderMap[unitId]?.[subUnitId] || [];
    }

    forwardDrawings(unitId: string, subUnitId: string, drawingIds: string[]) {
        drawingIds.forEach((drawingId) => {
            const index = this._hasDrawingOrder({ unitId, subUnitId, drawingId });
            if (index === -1) {
                return;
            }
            this._moveDrawingOrder(unitId, subUnitId, drawingId, index + 1);
        });
    }

    replaceDrawingOrder(unitId: string, subUnitId: string, drawingIds: string[]) {
        this._establishDrawingOrderMap(unitId, subUnitId);
        this._drawingOrderMap[unitId][subUnitId] = drawingIds;

        this._order$.next({ unitId, subUnitId, drawingIds });
    }

    backwardDrawing(unitId: string, subUnitId: string, drawingIds: string[]) {
        drawingIds.forEach((drawingId) => {
            const index = this._hasDrawingOrder({ unitId, subUnitId, drawingId });
            if (index === -1) {
                return;
            }
            this._moveDrawingOrder(unitId, subUnitId, drawingId, index - 1);
        });
    }

    frontDrawing(unitId: string, subUnitId: string, drawingIds: string[]) {
        const orderDrawingIds = this._getOrderFromSearchParams(unitId, subUnitId, drawingIds);
        orderDrawingIds.forEach((orderDrawingId) => {
            const { drawingId } = orderDrawingId;
            const index = this._getDrawingCount(unitId, subUnitId);
            this._moveDrawingOrder(unitId, subUnitId, drawingId, index + 1);
        });
    }

    backDrawing(unitId: string, subUnitId: string, drawingIds: string[]) {
        const orderSearchParams = this._getOrderFromSearchParams(unitId, subUnitId, drawingIds, true);
        orderSearchParams.forEach((orderSearchParam) => {
            const { drawingId } = orderSearchParam;
            this._moveDrawingOrder(unitId, subUnitId, drawingId, 0);
        });
    }

    private _getDrawingCount(unitId: string, subUnitId: string) {
        return this.getDrawingOrder(unitId, subUnitId).length || 0;
    }

    private _getOrderFromSearchParams(unitId: string, subUnitId: string, drawingIds: string[], isDesc = false) {
        return drawingIds.map((drawingId) => {
            const zIndex = this._hasDrawingOrder({ unitId, subUnitId, drawingId });
            return { drawingId, zIndex };
        }).sort(isDesc === false ? sortRules : sortRulesByDesc);
    }

    private _establishDrawingOrderMap(unitId: string, subUnitId: string) {
        if (!this._drawingOrderMap[unitId]) {
            this._drawingOrderMap[unitId] = {};
        }

        if (!this._drawingOrderMap[unitId][subUnitId]) {
            this._drawingOrderMap[unitId][subUnitId] = [];
        }
    }

    private _insertDrawingOrder(searchParam: Nullable<IDrawingSearchAllType>) {
        if (searchParam == null) {
            return;
        }

        const { unitId, subUnitId, drawingId } = searchParam;

        this._establishDrawingOrderMap(unitId, subUnitId);

        if (this._drawingOrderMap[unitId][subUnitId].includes(drawingId)) {
            return;
        }

        this._drawingOrderMap[unitId][subUnitId].push(drawingId);
    }

    private _removeDrawingOrder(searchParam: Nullable<IDrawingSearchAllType>) {
        if (searchParam == null) {
            return;
        }

        const { unitId, subUnitId, drawingId } = searchParam;

        this._establishDrawingOrderMap(unitId, subUnitId);

        const index = this._drawingOrderMap[unitId][subUnitId].indexOf(drawingId);
        if (index === -1) {
            return;
        }

        this._drawingOrderMap[unitId][subUnitId].splice(index, 1);
    }

    private _hasDrawingOrder(searchParam: Nullable<IDrawingSearchAllType>) {
        if (searchParam == null) {
            return -1;
        }

        const { unitId, subUnitId, drawingId } = searchParam;

        this._establishDrawingOrderMap(unitId, subUnitId);

        return this._drawingOrderMap[unitId][subUnitId].indexOf(drawingId);
    }

    private _moveDrawingOrder(unitId: string, subUnitId: string, drawingId: string, toIndex: number) {
        this._establishDrawingOrderMap(unitId, subUnitId);
        const index = this._drawingOrderMap[unitId][subUnitId].indexOf(drawingId);
        if (index === -1) {
            return;
        }

        this._drawingOrderMap[unitId][subUnitId].splice(index, 1);
        this._drawingOrderMap[unitId][subUnitId].splice(toIndex, 0, drawingId);
    }

    private _getCurrentBySearch<T extends IDrawingParam>(searchParam: Nullable<IDrawingSearch>): Nullable<T> {
        if (searchParam == null) {
            return;
        }
        const { unitId, subUnitId, drawingId } = searchParam;
        return this._drawingManagerInfo[unitId]?.[subUnitId]?.[drawingId] as T;
    }

    private _addByParam<T extends IDrawingParam>(insertParam: T): T[] {
        const { unitId, subUnitId, drawingId } = insertParam;


        if (!this._drawingManagerInfo[unitId]) {
            this._drawingManagerInfo[unitId] = {};
        }

        if (!this._drawingManagerInfo[unitId][subUnitId]) {
            this._drawingManagerInfo[unitId][subUnitId] = {};
        }

        this._drawingManagerInfo[unitId][subUnitId][drawingId] = insertParam;

        this._insertDrawingOrder({ unitId, subUnitId, drawingId });

        return [insertParam];
    }

    private _removeByParam<T extends IDrawingParam>(searchParam: Nullable<IDrawingSearch>): T[] {
        if (searchParam == null) {
            return [];
        }
        const { unitId, subUnitId, drawingId } = searchParam;

        const subComponentObjects = this._drawingManagerInfo[unitId]?.[subUnitId];

        if (subComponentObjects == null) {
            return [];
        }

        const object = subComponentObjects[drawingId] as T;

        if (object == null) {
            return [];
        }

        delete subComponentObjects[drawingId];

        this._removeDrawingOrder({ unitId, subUnitId, drawingId });

        return [object];
    }

    private _updateByParam<T extends IDrawingParam>(updateParam: T): T[] {
        const { unitId, subUnitId, drawingId } = updateParam;

        const subComponentObjects = this._drawingManagerInfo[unitId]?.[subUnitId];

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

