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

import type { Nullable } from '../../common/type-utils';
import type { ITransformState } from './floating-object-interfaces';

export const DEFAULT_DOCUMENT_SUB_COMPONENT_ID = '__default_document_sub_component_id20231101__';

export interface IFloatingObjectManagerSearchParam {
    unitId: string;
    subUnitId: string; //sheetId, pageId and so on, it has a default name in doc business
}

export interface IFloatingObjectManagerSearchItemParam extends IFloatingObjectManagerSearchParam {
    floatingObjectId: string;
}

export interface IFloatingObjectManagerParam extends IFloatingObjectManagerSearchItemParam {
    floatingObject: ITransformState;
}

export type FloatingObjects = Map<string, ITransformState>;

//{ [unitId: string]: { [sheetId: string]: ISelectionWithCoord[] } }
export type IFloatingObjectManagerInfo = Map<string, Map<string, FloatingObjects>>;

export interface IFloatingObjectManagerService {
    readonly remove$: Observable<IFloatingObjectManagerParam[]>;

    readonly andOrUpdate$: Observable<IFloatingObjectManagerParam[]>;

    readonly pluginUpdate$: Observable<IFloatingObjectManagerParam[]>;

    getFloatObject(searchItem: IFloatingObjectManagerSearchItemParam): Nullable<ITransformState>;

    getFloatObjects(search: IFloatingObjectManagerSearchParam): Nullable<FloatingObjects>;

    dispose(): void;

    clear(search: IFloatingObjectManagerSearchParam): void;

    addOrUpdate(insertParam: IFloatingObjectManagerParam): void;

    remove(searchItem: IFloatingObjectManagerSearchItemParam): void;

    BatchAddOrUpdate(insertParam: IFloatingObjectManagerParam[]): void;

    remove(searchItem: IFloatingObjectManagerSearchItemParam): void;

    pluginUpdateRefresh(searchObjects: IFloatingObjectManagerParam[]): void;
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
export class FloatingObjectManagerService implements IDisposable, IFloatingObjectManagerService {
    private readonly _managerInfo: IFloatingObjectManagerInfo = new Map();

    /**
     * The deletion action is triggered and broadcasted within the core business plugin.
     * Upon receiving the deletion broadcast, the plugin executes the plugin command logic.
     */
    private readonly _remove$ = new Subject<IFloatingObjectManagerParam[]>();
    readonly remove$ = this._remove$.asObservable();

    /**
     * Addition and updates are also triggered and broadcasted within the core business plugin.
     * Upon receiving the update broadcast, the plugin updates the location of its business components.
     */
    private readonly _andOrUpdate$ = new Subject<IFloatingObjectManagerParam[]>();
    readonly andOrUpdate$ = this._andOrUpdate$.asObservable();

    /**
     * The position, width, and height of the plugin's business components can be changed by the user through interface operations.
     * Here, it is necessary to notify the core business plugin to update the relevant location model.
     * The logic converges in the core business plugin.
     */
    private readonly _pluginUpdate$ = new Subject<IFloatingObjectManagerParam[]>();
    readonly pluginUpdate$ = this._pluginUpdate$.asObservable();

    getFloatObject(searchItem: IFloatingObjectManagerSearchItemParam): Nullable<ITransformState> {
        return this._getFloatingObject(searchItem);
    }

    getFloatObjects(search: IFloatingObjectManagerSearchParam): Nullable<FloatingObjects> {
        return this._getFloatingObjects(search);
    }

    dispose(): void {
        this._remove$.complete();
        this._andOrUpdate$.complete();
        this._pluginUpdate$.complete();
        this._managerInfo.clear();
    }

    clear(search: IFloatingObjectManagerSearchParam): void {
        const searchObjects = this._clearByParam(search);
        this._remove$.next(searchObjects);
    }

    addOrUpdate(insertParam: IFloatingObjectManagerParam): void {
        const searchObjects = this._addByParam(insertParam);
        this._andOrUpdate$.next(searchObjects);
    }

    BatchAddOrUpdate(insertParams: IFloatingObjectManagerParam[]): void {
        const searchObjects: IFloatingObjectManagerParam[] = [];
        insertParams.forEach((insertParam) => {
            searchObjects.push(...this._addByParam(insertParam));
        });
        this._andOrUpdate$.next(searchObjects);
    }

    remove(searchItem: IFloatingObjectManagerSearchItemParam): void {
        const searchObjects = this._removeByParam(searchItem);
        this._remove$.next(searchObjects);
    }

    pluginUpdateRefresh(updateObjects: IFloatingObjectManagerParam[]) {
        this._pluginUpdate$.next(updateObjects);
    }

    private _getFloatingObjects(param: Nullable<IFloatingObjectManagerSearchParam>) {
        if (param == null) {
            return;
        }
        const { unitId, subUnitId } = param;
        return this._managerInfo.get(unitId)?.get(subUnitId);
    }

    private _getFloatingObject(param: Nullable<IFloatingObjectManagerSearchItemParam>) {
        if (param == null) {
            return;
        }
        const { unitId, subUnitId, floatingObjectId } = param;
        return this._managerInfo.get(unitId)?.get(subUnitId)?.get(floatingObjectId);
    }

    private _addByParam(insertParam: IFloatingObjectManagerParam): IFloatingObjectManagerParam[] {
        const { unitId, subUnitId, floatingObject, floatingObjectId } = insertParam;

        if (!this._managerInfo.has(unitId)) {
            this._managerInfo.set(unitId, new Map());
        }

        const subComponentData = this._managerInfo.get(unitId)!;

        if (!subComponentData.has(subUnitId)) {
            subComponentData.set(subUnitId, new Map());
        }

        subComponentData.get(subUnitId)!.set(floatingObjectId, floatingObject);

        return [{ unitId, subUnitId, floatingObjectId, floatingObject }];
    }

    private _clearByParam(param: IFloatingObjectManagerSearchParam): IFloatingObjectManagerParam[] {
        const floatingObjects = this._getFloatingObjects(param);

        const { unitId, subUnitId } = param;

        const refreshObjects: IFloatingObjectManagerParam[] = [];

        floatingObjects?.forEach((value, key) => {
            refreshObjects.push({
                unitId,
                subUnitId,
                floatingObjectId: key,
                floatingObject: value,
            });
        });

        floatingObjects?.clear();

        return refreshObjects;
    }

    private _removeByParam(param: IFloatingObjectManagerSearchItemParam): IFloatingObjectManagerParam[] {
        const floatingObjects = this._getFloatingObjects(param);
        const item = floatingObjects?.get(param.floatingObjectId);

        if (item == null) {
            return [];
        }

        floatingObjects?.delete(param.floatingObjectId);

        return [{ ...param, floatingObject: item }];
    }
}

export const IFloatingObjectManagerService = createIdentifier<IFloatingObjectManagerService>(
    'univer.floating-object.service'
);
