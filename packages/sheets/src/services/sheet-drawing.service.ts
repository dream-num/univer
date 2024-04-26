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

import type { IAbsoluteTransform, IOtherTransform, ISize, Nullable } from '@univerjs/core';
import { Disposable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';

interface ICellPosition {
    column: number; // column number
    columnOffset: number; // column offset, unit is EMUs
    row: number; // row number
    rowOffset: number; // row offset, unit is EMUs
}


export interface ISheetDrawingPosition extends IOtherTransform {
    from: ICellPosition;
    to: ICellPosition;
}

export interface ISheetDrawingParam {
    sheetTransform: ISheetDrawingPosition;
    originSize: ISize;
    zIndex: number;
    groupId?: string;
}

interface ISheetDrawingSearchParam {
    unitId: string;
    subUnitId: string;
    id: string;
}


export interface ISheetDrawingServiceParam extends ISheetDrawingSearchParam, ISheetDrawingParam {

}

export interface ISheetDrawingServiceUpdateParam extends ISheetDrawingSearchParam, Partial<ISheetDrawingParam> {

}


export interface ISheetDrawingMap {
    [unitId: string]: ISheetDrawingSubunitMap;
}

export interface ISheetDrawingSubunitMap {
    [subUnitId: string]: IISheetDrawingMapItem;
}

export interface IISheetDrawingMapItem {
    [id: string]: ISheetDrawingServiceParam;
}

export interface ISheetDrawingService {
    addDrawing(param: ISheetDrawingServiceParam): void;

    batchAddDrawing(params: ISheetDrawingServiceParam[]): void;

    removeDrawing(unitId: string, subUnitId: string, id: string): Nullable<ISheetDrawingServiceParam>;

    batchRemoveDrawing(unitId: string, subUnitId: string, ids: string[]): ISheetDrawingServiceParam[];

    focusDrawing(unitId: string, subUnitId: string, id: string): void;

    updateDrawing(param: ISheetDrawingServiceUpdateParam): void;

    batchUpdateDrawing(params: ISheetDrawingServiceUpdateParam[]): void;

    getDrawingMap(unitId: string, subUnitId: string): Nullable<IISheetDrawingMapItem>;

    add$: Observable<ISheetDrawingServiceParam[]>;

    remove$: Observable<ISheetDrawingServiceParam[]>;

    update$: Observable<ISheetDrawingServiceUpdateParam[]>;

}

export class SheetDrawingService extends Disposable implements ISheetDrawingService {
    private _drawingMap: ISheetDrawingMap = {};

    private _focusDrawings: ISheetDrawingServiceParam[] = [];

    private _add$ = new Subject<ISheetDrawingServiceParam[]>();
    add$: Observable<ISheetDrawingServiceParam[]> = this._add$.asObservable();

    private _remove$ = new Subject<ISheetDrawingServiceParam[]>();
    remove$: Observable<ISheetDrawingServiceParam[]> = this._remove$.asObservable();

    private _update$ = new Subject<ISheetDrawingServiceUpdateParam[]>();
    update$: Observable<ISheetDrawingServiceUpdateParam[]> = this._update$.asObservable();

    private _focus$ = new Subject<ISheetDrawingServiceParam[]>();
    focus$: Observable<ISheetDrawingServiceParam[]> = this._focus$.asObservable();


    getDrawingMap(unitId: string, subUnitId: string): Nullable<IISheetDrawingMapItem> {
        return this._drawingMap[unitId]?.[subUnitId];
    }

    addDrawing(param: ISheetDrawingServiceParam): void {
        this._addDrawing(param);
        this._add$.next([param]);
    }

    batchAddDrawing(params: ISheetDrawingServiceParam[]): void {
        params.forEach((param) => {
            this._addDrawing(param);
        });
        this._add$.next(params);
    }

    removeDrawing(unitId: string, subUnitId: string, id: string): Nullable<ISheetDrawingServiceParam> {
        const deleteItem = this._removeDrawing(unitId, subUnitId, id);

        deleteItem && this._remove$.next([deleteItem]);

        return deleteItem;
    }

    batchRemoveDrawing(unitId: string, subUnitId: string, ids: string[]): ISheetDrawingServiceParam[] {
        const deleteItems: ISheetDrawingServiceParam[] = [];
        ids.forEach((id) => {
            const deleteItem = this._removeDrawing(unitId, subUnitId, id);
            deleteItem && deleteItems.push(deleteItem);
        });
        return deleteItems;
    }

    updateDrawing(param: ISheetDrawingServiceUpdateParam): void {
        this._updateDrawing(param);
        this._update$.next([param]);
    }

    batchUpdateDrawing(params: ISheetDrawingServiceUpdateParam[]): void {
        params.forEach((param) => {
            this._updateDrawing(param);
        });
        this._update$.next(params);
    }

    focusDrawing(unitId: string, subUnitId: string, id: string): void {
        const item = this._drawingMap[unitId]?.[subUnitId]?.[id];
        if (item == null) {
            return;
        }
        this._focusDrawings.push(item);
        this._focus$.next([item]);
    }

    private _updateDrawing(param: ISheetDrawingServiceUpdateParam): void {
        const { unitId, subUnitId, id } = param;
        if (!this._drawingMap[unitId] || !this._drawingMap[unitId][subUnitId]) {
            return;
        }
        const item = this._drawingMap[unitId][subUnitId][id];
        if (item == null) {
            return;
        }
        this._drawingMap[unitId][subUnitId][id] = { ...item, ...param };
    }


    private _addDrawing(param: ISheetDrawingServiceParam): void {
        const { unitId, subUnitId } = param;
        if (!this._drawingMap[unitId]) {
            this._drawingMap[unitId] = {};
        }
        if (!this._drawingMap[unitId][subUnitId]) {
            this._drawingMap[unitId][subUnitId] = {};
        }
        this._drawingMap[unitId][subUnitId][param.id] = param;
    }

    private _removeDrawing(unitId: string, subUnitId: string, id: string): Nullable<ISheetDrawingServiceParam> {
        if (!this._drawingMap[unitId] || !this._drawingMap[unitId][subUnitId]) {
            return;
        }
        const deleteItem = this._drawingMap[unitId][subUnitId][id];
        delete this._drawingMap[unitId][subUnitId][id];
        return deleteItem;
    }
}

export const ISheetDrawingService = createIdentifier<SheetDrawingService>('univer.formula.sheet-drawing.service');
