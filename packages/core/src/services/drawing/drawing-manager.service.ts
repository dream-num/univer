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
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';

import type { Nullable } from '../../common/type-util';
import type { ITransformState } from './drawing-interfaces';

export const DEFAULT_DOCUMENT_SUB_COMPONENT_ID = '__default_document_sub_component_id20231101__';

export interface IDrawingManagerSearchParam {
    unitId: string;
    subUnitId: string; //sheetId, pageId and so on, it has a default name in doc business
}

export interface IDrawingManagerSearchItemParam extends IDrawingManagerSearchParam {
    drawingId: string;
}

export interface IDrawingManagerParam extends IDrawingManagerSearchItemParam {
    drawing: ITransformState;
}

export type Drawings = Map<string, ITransformState>;

//{ [unitId: string]: { [sheetId: string]: ISelectionWithCoord[] } }
export type IDrawingManagerInfo = Map<string, Map<string, Drawings>>;

export interface IDrawingManagerService {
    readonly remove$: Observable<IDrawingManagerParam[]>;

    readonly andOrUpdate$: Observable<IDrawingManagerParam[]>;

    readonly pluginUpdate$: Observable<IDrawingManagerParam[]>;

    getDrawing(searchItem: IDrawingManagerSearchItemParam): Nullable<ITransformState>;

    getDrawings(search: IDrawingManagerSearchParam): Nullable<Drawings>;

    dispose(): void;

    clear(search: IDrawingManagerSearchParam): void;

    addOrUpdate(insertParam: IDrawingManagerParam): void;

    remove(searchItem: IDrawingManagerSearchItemParam): void;

    BatchAddOrUpdate(insertParam: IDrawingManagerParam[]): void;

    remove(searchItem: IDrawingManagerSearchItemParam): void;

    pluginUpdateRefresh(searchObjects: IDrawingManagerParam[]): void;
}

/**
 * This service is primarily used for the management of 'univer' floating objects,
 * decoupling common configurations such as position, volume,
 * and rotation of the floating objects from the core business.
 * This allows plugins to be reused across multiple core businesses.
 *
 * Floating elements in spreadsheets need to stay synchronized with the grid layout,
 * and inserting rows and columns will change their position;
 * Floating elements in documents need to stay synchronized with the text layout and can affect the text layout;
 * Floating elements in slides are more flexible but support settings such as animations.
 *
 * Please open the architecture diagram with TLDraw.
 * https://github.com/dream-num/univer/blob/db227563b4df65572dd4fceebecdbd9f27fa7a39/docs/selection%20architecture%20design.tldr
 */
export class DrawingManagerService implements IDisposable, IDrawingManagerService {
    private readonly _managerInfo: IDrawingManagerInfo = new Map();

    /**
     * The deletion action is triggered and broadcasted within the core business plugin.
     * Upon receiving the deletion broadcast, the plugin executes the plugin command logic.
     */
    private readonly _remove$ = new Subject<IDrawingManagerParam[]>();
    readonly remove$ = this._remove$.asObservable();

    /**
     * Addition and updates are also triggered and broadcasted within the core business plugin.
     * Upon receiving the update broadcast, the plugin updates the location of its business components.
     */
    private readonly _andOrUpdate$ = new Subject<IDrawingManagerParam[]>();
    readonly andOrUpdate$ = this._andOrUpdate$.asObservable();

    /**
     * The position, width, and height of the plugin's business components can be changed by the user through interface operations.
     * Here, it is necessary to notify the core business plugin to update the relevant location model.
     * The logic converges in the core business plugin.
     */
    private readonly _pluginUpdate$ = new Subject<IDrawingManagerParam[]>();
    readonly pluginUpdate$ = this._pluginUpdate$.asObservable();

    getDrawing(searchItem: IDrawingManagerSearchItemParam): Nullable<ITransformState> {
        return this._getDrawing(searchItem);
    }

    getDrawings(search: IDrawingManagerSearchParam): Nullable<Drawings> {
        return this._getDrawings(search);
    }

    dispose(): void {
        this._remove$.complete();
        this._andOrUpdate$.complete();
        this._pluginUpdate$.complete();
        this._managerInfo.clear();
    }

    clear(search: IDrawingManagerSearchParam): void {
        const searchObjects = this._clearByParam(search);
        this._remove$.next(searchObjects);
    }

    addOrUpdate(insertParam: IDrawingManagerParam): void {
        const searchObjects = this._addByParam(insertParam);
        this._andOrUpdate$.next(searchObjects);
    }

    BatchAddOrUpdate(insertParams: IDrawingManagerParam[]): void {
        const searchObjects: IDrawingManagerParam[] = [];
        insertParams.forEach((insertParam) => {
            searchObjects.push(...this._addByParam(insertParam));
        });
        this._andOrUpdate$.next(searchObjects);
    }

    remove(searchItem: IDrawingManagerSearchItemParam): void {
        const searchObjects = this._removeByParam(searchItem);
        this._remove$.next(searchObjects);
    }

    pluginUpdateRefresh(updateObjects: IDrawingManagerParam[]) {
        this._pluginUpdate$.next(updateObjects);
    }

    private _getDrawings(param: Nullable<IDrawingManagerSearchParam>) {
        if (param == null) {
            return;
        }
        const { unitId, subUnitId } = param;
        return this._managerInfo.get(unitId)?.get(subUnitId);
    }

    private _getDrawing(param: Nullable<IDrawingManagerSearchItemParam>) {
        if (param == null) {
            return;
        }
        const { unitId, subUnitId, drawingId } = param;
        return this._managerInfo.get(unitId)?.get(subUnitId)?.get(drawingId);
    }

    private _addByParam(insertParam: IDrawingManagerParam): IDrawingManagerParam[] {
        const { unitId, subUnitId, drawing, drawingId } = insertParam;

        if (!this._managerInfo.has(unitId)) {
            this._managerInfo.set(unitId, new Map());
        }

        const subComponentData = this._managerInfo.get(unitId)!;

        if (!subComponentData.has(subUnitId)) {
            subComponentData.set(subUnitId, new Map());
        }

        subComponentData.get(subUnitId)!.set(drawingId, drawing);

        return [{ unitId, subUnitId, drawingId, drawing }];
    }

    private _clearByParam(param: IDrawingManagerSearchParam): IDrawingManagerParam[] {
        const drawings = this._getDrawings(param);

        const { unitId, subUnitId } = param;

        const refreshObjects: IDrawingManagerParam[] = [];

        drawings?.forEach((value, key) => {
            refreshObjects.push({
                unitId,
                subUnitId,
                drawingId: key,
                drawing: value,
            });
        });

        drawings?.clear();

        return refreshObjects;
    }

    private _removeByParam(param: IDrawingManagerSearchItemParam): IDrawingManagerParam[] {
        const drawings = this._getDrawings(param);
        const item = drawings?.get(param.drawingId);

        if (item == null) {
            return [];
        }

        drawings?.delete(param.drawingId);

        return [{ ...param, drawing: item }];
    }
}

export const IDrawingManagerService = createIdentifier<IDrawingManagerService>(
    'univer.drawing.service'
);
