/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { ArrangeTypeEnum, IDisposable, IDrawingParam, IDrawingSearch, Nullable } from '@univerjs/core';
import type { Observable } from 'rxjs';
import { createIdentifier } from '@univerjs/core';

export interface IDrawingMap<T extends IDrawingParam> {
    [unitId: string]: IDrawingSubunitMap<T>;
}

export interface IDrawingSubunitMap<T extends IDrawingParam> {
    [subUnitId: string]: IDrawingMapItem<T>;
}

export interface IDrawingMapItemData<T> {
    [drawingId: string]: T;
}
export interface IDrawingMapItem<T extends IDrawingParam> {
    data: IDrawingMapItemData<T>;
    order: string[];
}

export interface IDrawingOrderMapParam {
    unitId: string;
    subUnitId: string;
    drawingIds: string[];
}

export interface IDrawingOrderUpdateParam extends IDrawingOrderMapParam {
    arrangeType: ArrangeTypeEnum;
}

export interface IDrawingGroupUpdateParam {
    parent: IDrawingParam;
    children: IDrawingParam[];
}

export interface IDrawingVisibleParam extends IDrawingSearch {
    visible: boolean;
}

/**
 * Responsible for operations related to drawing additions, deletions, and modifications,
 * including observers, events, broadcasting, and generating operations.
 */
export interface IUnitNormalDrawingService<T extends IDrawingParam> {
    readonly remove$: Observable<IDrawingSearch[]>;
    readonly add$: Observable<IDrawingSearch[]>;
    readonly update$: Observable<IDrawingSearch[]>;

    readonly refreshTransform$: Observable<T[]>;
    readonly visible$: Observable<IDrawingVisibleParam[]>;

    readonly featurePluginUpdate$: Observable<T[]>;

    refreshTransform(updateParams: T[]): void;

    removeNotification(removeParams: IDrawingSearch[]): void;
    addNotification(insertParams: IDrawingSearch[]): void;
    updateNotification(updateParams: IDrawingSearch[]): void;

    refreshTransformNotification(refreshParams: T[]): void;
    visibleNotification(visibleParams: IDrawingVisibleParam[]): void;

    getBatchAddOp(insertParams: T[]): unknown;
    getBatchRemoveOp(removeParams: IDrawingSearch[]): unknown;
    getBatchUpdateOp(updateParams: T[]): unknown;

    featurePluginUpdateNotification(updateParams: T[]): void;
}

/**
 * Responsible for operations related to drawing focus, including observers,broadcasting
 */
export interface IUnitFocusDrawingService {
    readonly focus$: Observable<IDrawingParam[]>;

    focusDrawing(params: Nullable<IDrawingSearch[]>): void;
    getFocusDrawings(): IDrawingParam[];
}

/**
 * Responsible for operations related to drawing grouping, including observers,broadcasting, and generating operations.
 */
export interface IUnitGroupDrawingService {
    readonly group$: Observable<IDrawingGroupUpdateParam[]>;
    readonly ungroup$: Observable<IDrawingGroupUpdateParam[]>;

    readonly featurePluginGroupUpdate$: Observable<IDrawingGroupUpdateParam[]>;
    readonly featurePluginUngroupUpdate$: Observable<IDrawingGroupUpdateParam[]>;

    getGroupDrawingOp(groupParams: IDrawingGroupUpdateParam[]): unknown;
    getUngroupDrawingOp(groupParams: IDrawingGroupUpdateParam[]): unknown;
    groupUpdateNotification(groupParams: IDrawingGroupUpdateParam[]): void;
    ungroupUpdateNotification(groupParams: IDrawingGroupUpdateParam[]): void;
    getDrawingsByGroup(groupParam: IDrawingSearch): IDrawingParam[];

    featurePluginGroupUpdateNotification(groupParams: IDrawingGroupUpdateParam[]): void;
    featurePluginUngroupUpdateNotification(groupParams: IDrawingGroupUpdateParam[]): void;
}

/**
 * Responsible for operations related to drawing order, including observers,broadcasting, and generating operations.
 */
export interface IUnitOrderDrawingService {

    readonly order$: Observable<IDrawingOrderMapParam>;

    readonly featurePluginOrderUpdate$: Observable<IDrawingOrderUpdateParam>;

    orderNotification(orderParams: IDrawingOrderMapParam): void;

    getForwardDrawingsOp(orderParams: IDrawingOrderMapParam): unknown;
    getBackwardDrawingOp(orderParams: IDrawingOrderMapParam): unknown;
    getFrontDrawingsOp(orderParams: IDrawingOrderMapParam): unknown;
    getBackDrawingsOp(orderParams: IDrawingOrderMapParam): unknown;
    // replaceDrawingOrder(unitId: string, subUnitId: string, drawingIds: string[]): void;
    getDrawingOrder(unitId: string, subUnitId: string): string[];
    setDrawingOrder(unitId: string, subUnitId: string, order: string[]): void;
    orderUpdateNotification(orderParams: IDrawingOrderMapParam): void;
    featurePluginOrderUpdateNotification(drawingOrderUpdateParam: IDrawingOrderUpdateParam): void;
}

export interface IUnitDrawingService<T extends IDrawingParam> extends IUnitNormalDrawingService<T>, IUnitFocusDrawingService, IUnitGroupDrawingService, IUnitOrderDrawingService, IDisposable {
    drawingManagerData: IDrawingMap<T>;

    dispose(): void;

    getDrawingDataForUnit(unitId: string): IDrawingSubunitMap<T>;
    removeDrawingDataForUnit(unitId: string): void;
    registerDrawingData(unitId: string, data: IDrawingSubunitMap<T>): void;

    initializeNotification(unitId: string): void;

    getDrawingData(unitId: string, subUnitId: string): IDrawingMapItemData<T>;
    setDrawingData(unitId: string, subUnitId: string, data: IDrawingMapItemData<T>): void;
    getDrawingByParam(param: Nullable<IDrawingSearch>): Nullable<T>;
    getOldDrawingByParam(param: Nullable<IDrawingSearch>): Nullable<T>;
    getDrawingOKey(oKey: string): Nullable<T>;
    applyJson1(unitId: string, subUnitId: string, jsonOp: unknown): void;
    getDrawingEditable(): boolean;
    getDrawingVisible(): boolean;
    setDrawingVisible(visible: boolean): void;
    setDrawingEditable(editable: boolean): void;
}

export interface IDrawingManagerService extends IUnitDrawingService<IDrawingParam> {}

export const IDrawingManagerService = createIdentifier<IUnitDrawingService<IDrawingParam>>('univer.drawing-manager.service');
