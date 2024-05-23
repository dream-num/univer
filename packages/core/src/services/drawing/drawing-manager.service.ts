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
import type { Nullable } from '../../common/type-util';
import type { ITransformState } from './drawing-interfaces';

export const DEFAULT_DOCUMENT_SUB_COMPONENT_ID = '__default_document_sub_component_id20231101__';

export enum ArrangeType {
    forward,
    backward,
    front,
    back,
}

export enum DrawingTypeEnum {
    UNRECOGNIZED = -1,
    DRAWING_IMAGE = 0,
    DRAWING_SHAPE = 1,
    DRAWING_CHART = 2,
    DRAWING_TABLE = 3,
    DRAWING_SMART_ART = 4,
    DRAWING_VIDEO = 5,
    DRAWING_GROUP = 6,
    DRAWING_UNIT = 7,
}

export type DrawingType = DrawingTypeEnum | number;

export interface IDrawingSpace {
    unitId: string;
    subUnitId: string; //sheetId, pageId and so on, it has a default name in doc business
}

export interface IDrawingSearch extends IDrawingSpace {
    drawingId: string;
}

export interface IDrawingParam extends IDrawingSearch {
    drawingType: DrawingType;
    transform?: Nullable<ITransformState>;
    groupId?: string;
}

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
    arrangeType: ArrangeType;
}

export interface IDrawingGroupUpdateParam {
    parent: IDrawingParam;
    children: IDrawingParam[];
}

export interface IDrawingVisibleParam extends IDrawingSearch {
    visible: boolean;
}

export interface IUnitDrawingService<T extends IDrawingParam> extends IDisposable {
    drawingManagerData: IDrawingMap<T>;

    readonly remove$: Observable<IDrawingSearch[]>;
    readonly add$: Observable<IDrawingSearch[]>;
    readonly update$: Observable<IDrawingSearch[]>;
    readonly order$: Observable<IDrawingOrderMapParam>;
    readonly focus$: Observable<IDrawingParam[]>;
    readonly group$: Observable<IDrawingGroupUpdateParam[]>;
    readonly ungroup$: Observable<IDrawingGroupUpdateParam[]>;
    readonly refreshTransform$: Observable<T[]>;
    readonly visible$: Observable<IDrawingVisibleParam[]>;

    readonly featurePluginUpdate$: Observable<T[]>;
    readonly featurePluginOrderUpdate$: Observable<IDrawingOrderUpdateParam>;
    readonly featurePluginGroupUpdate$: Observable<IDrawingGroupUpdateParam[]>;
    readonly featurePluginUngroupUpdate$: Observable<IDrawingGroupUpdateParam[]>;

    dispose(): void;

    refreshTransform(updateParams: T[]): void;

    getDrawingDataForUnit(unitId: string): IDrawingSubunitMap<T>;
    removeDrawingDataForUnit(unitId: string): void;
    registerDrawingData(unitId: string, data: IDrawingSubunitMap<T>): void;

    getDrawingData(unitId: string, subUnitId: string): IDrawingMapItemData<T>;

    getBatchAddOp(insertParams: T[]): unknown;
    getBatchRemoveOp(removeParams: IDrawingSearch[]): unknown;
    getBatchUpdateOp(updateParams: T[]): unknown;
    removeNotification(removeParams: IDrawingSearch[]): void;
    addNotification(insertParams: IDrawingSearch[]): void;
    updateNotification(updateParams: IDrawingSearch[]): void;
    orderNotification(orderParams: IDrawingOrderMapParam): void;
    refreshTransformNotification(refreshParams: T[]): void;
    visibleNotification(visibleParams: IDrawingVisibleParam[]): void;

    getDrawingByParam(param: Nullable<IDrawingSearch>): Nullable<T>;
    getOldDrawingByParam(param: Nullable<IDrawingSearch>): Nullable<T>;
    getDrawingOKey(oKey: string): Nullable<T>;

    focusDrawing(params: Nullable<IDrawingSearch[]>): void;
    getFocusDrawings(): IDrawingParam[];

    getGroupDrawingOp(groupParams: IDrawingGroupUpdateParam[]): unknown;
    getUngroupDrawingOp(groupParams: IDrawingGroupUpdateParam[]): unknown;
    groupUpdateNotification(groupParams: IDrawingGroupUpdateParam[]): void;
    ungroupUpdateNotification(groupParams: IDrawingGroupUpdateParam[]): void;
    getDrawingsByGroup(groupParam: IDrawingSearch): IDrawingParam[];

    getForwardDrawingsOp(orderParams: IDrawingOrderMapParam): unknown;
    getBackwardDrawingOp(orderParams: IDrawingOrderMapParam): unknown;
    getFrontDrawingsOp(orderParams: IDrawingOrderMapParam): unknown;
    getBackDrawingsOp(orderParams: IDrawingOrderMapParam): unknown;
    // replaceDrawingOrder(unitId: string, subUnitId: string, drawingIds: string[]): void;
    getDrawingOrder(unitId: string, subUnitId: string): string[];
    orderUpdateNotification(orderParams: IDrawingOrderMapParam): void;

    featurePluginUpdateNotification(updateParams: T[]): void;
    featurePluginOrderUpdateNotification(drawingOrderUpdateParam: IDrawingOrderUpdateParam): void;
    featurePluginGroupUpdateNotification(groupParams: IDrawingGroupUpdateParam[]): void;
    featurePluginUngroupUpdateNotification(groupParams: IDrawingGroupUpdateParam[]): void;
    // featurePluginAddNotification(insertParams: T[]): void;
    // featurePluginRemoveNotification(removeParams: IDrawingSearch[]): void;

    applyJson1(unitId: string, subUnitId: string, jsonOp: unknown): void;
}

export interface IDrawingManagerService extends IUnitDrawingService<IDrawingParam> {}

export const IDrawingManagerService = createIdentifier<IUnitDrawingService<IDrawingParam>>('univer.plugin.drawing-manager.service');
