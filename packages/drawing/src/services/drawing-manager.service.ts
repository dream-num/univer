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

import { type Observable, Subject } from 'rxjs';
import type { IDrawingMap, IDrawingOrderMap, IDrawingOrderMapParam, IDrawingParam, IDrawingSearch, IUnitDrawingService, Nullable } from '@univerjs/core';
import { sortRules, sortRulesByDesc } from '@univerjs/core';


/**
 * unitId -> subUnitId -> drawingId -> drawingParam
 */
export class UnitDrawingService<T extends IDrawingParam> implements IUnitDrawingService<T> {
    drawingManagerInfo: IDrawingMap<T> = {};

    drawingOrderMap: IDrawingOrderMap = {};

    private _focusDrawings: T[] = [];

    private readonly _remove$ = new Subject<T[]>();
    readonly remove$ = this._remove$.asObservable();

    private readonly _add$ = new Subject<T[]>();
    readonly add$ = this._add$.asObservable();

    private readonly _update$ = new Subject<T[]>();
    readonly update$ = this._update$.asObservable();

    private readonly _externalUpdate$ = new Subject<T[]>();
    readonly externalUpdate$ = this._externalUpdate$.asObservable();

    private _focus$ = new Subject<T[]>();
    focus$: Observable<T[]> = this._focus$.asObservable();

    private _order$ = new Subject<IDrawingOrderMapParam>();
    order$: Observable<IDrawingOrderMapParam> = this._order$.asObservable();

    dispose(): void {
        this._remove$.complete();
        this._add$.complete();
        this._update$.complete();
        this.drawingManagerInfo = {};
    }

    add(insertParam: T) {
        this._add$.next(this._addByParam(insertParam));
    }

    batchAdd(insertParams: T[]) {
        const objects: T[] = [];
        insertParams.forEach((insertParam) => {
            objects.push(...this._addByParam(insertParam));
        });

        this._add$.next(objects);
    }

    remove(searchParam: IDrawingSearch) {
        this._remove$.next(this._removeByParam(searchParam));
    }

    batchRemove(removeParams: IDrawingSearch[]) {
        const objects: T[] = [];
        removeParams.forEach((removeParam) => {
            objects.push(...this._removeByParam(removeParam));
        });

        this._remove$.next(objects);
    }

    update(updateParam: T) {
        this._update$.next(this._updateByParam(updateParam));
    }

    batchUpdate(updateParams: T[]) {
        const objects: T[] = [];
        updateParams.forEach((updateParam) => {
            objects.push(...this._updateByParam(updateParam));
        });

        this._update$.next(objects);
    }

    externalUpdateNotification(updateParams: T[]) {
        this._externalUpdate$.next(updateParams);
    }

    getDrawingByParam(param: Nullable<IDrawingSearch>): Nullable<T> {
        return this._getCurrentBySearch(param);
    }

    getDrawingOKey(oKey: string): Nullable<T> {
        const [unitId, subUnitId, drawingId] = oKey.split('#-#');
        return this._getCurrentBySearch({ unitId, subUnitId, drawingId });
    }

    focusDrawing(params: Nullable<IDrawingSearch[]>): void {
        if (params == null) {
            this._focusDrawings = [];
            this._focus$.next([]);
            return;
        }

        const drawingParams: T[] = [];
        params.forEach((param) => {
            const { unitId, subUnitId, drawingId } = param;
            const item = this.drawingManagerInfo[unitId]?.[subUnitId]?.[drawingId];
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
        return this.drawingOrderMap[unitId]?.[subUnitId] || [];
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
        this.drawingOrderMap[unitId][subUnitId] = drawingIds;

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
        if (!this.drawingOrderMap[unitId]) {
            this.drawingOrderMap[unitId] = {};
        }

        if (!this.drawingOrderMap[unitId][subUnitId]) {
            this.drawingOrderMap[unitId][subUnitId] = [];
        }
    }

    private _insertDrawingOrder(searchParam: Nullable<IDrawingSearch>) {
        if (searchParam == null) {
            return;
        }

        const { unitId, subUnitId, drawingId } = searchParam;

        this._establishDrawingOrderMap(unitId, subUnitId);

        if (this.drawingOrderMap[unitId][subUnitId].includes(drawingId)) {
            return;
        }

        this.drawingOrderMap[unitId][subUnitId].push(drawingId);
    }

    private _removeDrawingOrder(searchParam: Nullable<IDrawingSearch>) {
        if (searchParam == null) {
            return;
        }

        const { unitId, subUnitId, drawingId } = searchParam;

        this._establishDrawingOrderMap(unitId, subUnitId);

        const index = this.drawingOrderMap[unitId][subUnitId].indexOf(drawingId);
        if (index === -1) {
            return;
        }

        this.drawingOrderMap[unitId][subUnitId].splice(index, 1);
    }

    private _hasDrawingOrder(searchParam: Nullable<IDrawingSearch>) {
        if (searchParam == null) {
            return -1;
        }

        const { unitId, subUnitId, drawingId } = searchParam;

        this._establishDrawingOrderMap(unitId, subUnitId);

        return this.drawingOrderMap[unitId][subUnitId].indexOf(drawingId);
    }

    private _moveDrawingOrder(unitId: string, subUnitId: string, drawingId: string, toIndex: number) {
        this._establishDrawingOrderMap(unitId, subUnitId);
        const index = this.drawingOrderMap[unitId][subUnitId].indexOf(drawingId);
        if (index === -1) {
            return;
        }

        this.drawingOrderMap[unitId][subUnitId].splice(index, 1);
        this.drawingOrderMap[unitId][subUnitId].splice(toIndex, 0, drawingId);
    }

    private _getCurrentBySearch(searchParam: Nullable<IDrawingSearch>): Nullable<T> {
        if (searchParam == null) {
            return;
        }
        const { unitId, subUnitId, drawingId } = searchParam;
        return this.drawingManagerInfo[unitId]?.[subUnitId]?.[drawingId] as T;
    }

    private _addByParam(insertParam: T): T[] {
        const { unitId, subUnitId, drawingId } = insertParam;


        if (!this.drawingManagerInfo[unitId]) {
            this.drawingManagerInfo[unitId] = {};
        }

        if (!this.drawingManagerInfo[unitId][subUnitId]) {
            this.drawingManagerInfo[unitId][subUnitId] = {};
        }

        this.drawingManagerInfo[unitId][subUnitId][drawingId] = insertParam;

        this._insertDrawingOrder({ unitId, subUnitId, drawingId });

        return [insertParam];
    }

    private _removeByParam(searchParam: Nullable<IDrawingSearch>): T[] {
        if (searchParam == null) {
            return [];
        }
        const { unitId, subUnitId, drawingId } = searchParam;

        const subComponentObjects = this.drawingManagerInfo[unitId]?.[subUnitId];

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

    private _updateByParam(updateParam: T): T[] {
        const { unitId, subUnitId, drawingId } = updateParam;

        const subComponentObjects = this.drawingManagerInfo[unitId]?.[subUnitId];

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

export class DrawingManagerService extends UnitDrawingService<IDrawingParam> {}
