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


export enum DrawingTypeEnum {
    UNRECOGNIZED = -1,
    DRAWING_IMAGE = 0,
    DRAWING_SHAPE = 1,
    DRAWING_CHART = 2,
    DRAWING_TABLE = 3,
    DRAWING_SMART_ART = 4,
    DRAWING_VIDEO = 5,
    DRAWING_UNIT = 6,
}

export type DrawingType = DrawingTypeEnum | number;


export interface IDrawingSearch {
    unitId: string;
    subUnitId: string; //sheetId, pageId and so on, it has a default name in doc business
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

export interface IDrawingMapItem<T extends IDrawingParam> {
    [drawingId: string]: T;
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

// export interface IDrawingManagerService {
//     readonly remove$: Observable<IDrawingParam[]>;
//     readonly add$: Observable<IDrawingParam[]>;
//     readonly update$: Observable<IDrawingParam[]>;
//     readonly externalUpdate$: Observable<IDrawingParam[]>;
//     readonly focus$: Observable<IDrawingParam[]>;
//     readonly order$: Observable<IDrawingOrderMapParam>;

//     dispose(): void;

//     add<T extends IDrawingParam>(insertParam: T): void;
//     batchAdd<T extends IDrawingParam>(insertParams: T[]): void;

//     remove(searchParam: IDrawingSearch): void;
//     batchRemove(removeParams: IDrawingSearch[]): void;

//     update<T extends IDrawingParam>(updateParam: T): void;
//     batchUpdate<T extends IDrawingParam>(updateParams: T[]): void;

//     externalUpdateNotification<T extends IDrawingParam>(updateParams: T[]): void;

//     getDrawingByParam<T extends IDrawingParam>(param: Nullable<IDrawingSearch>): Nullable<T>;

//     getDrawingOKey<T extends IDrawingParam>(oKey: string): Nullable<T>;

//     focusDrawing(params: Nullable<IDrawingSearch[]>): void;
//     getFocusDrawings(): IDrawingParam[];

//     forwardDrawings(unitId: string, subUnitId: string, drawingIds: string[]): void;
//     backwardDrawing(unitId: string, subUnitId: string, drawingIds: string[]): void;
//     frontDrawing(unitId: string, subUnitId: string, drawingIds: string[]): void;
//     backDrawing(unitId: string, subUnitId: string, drawingIds: string[]): void;
//     replaceDrawingOrder(unitId: string, subUnitId: string, drawingIds: string[]): void;
//     getDrawingOrder(unitId: string, subUnitId: string): string[];
// }

export interface IUnitDrawingService<T extends IDrawingParam> extends IDisposable {
    drawingManagerInfo: IDrawingMap<T>;
    drawingOrderMap: IDrawingOrderMap;

    readonly remove$: Observable<T[]>;
    readonly add$: Observable<T[]>;
    readonly update$: Observable<T[]>;
    readonly order$: Observable<IDrawingOrderMapParam>;
    readonly externalUpdate$: Observable<T[]>;
    readonly focus$: Observable<IDrawingParam[]>;

    dispose(): void;

    add(insertParam: T): void;
    batchAdd(insertParams: T[]): void;

    remove(searchParam: IDrawingSearch): void;
    batchRemove(removeParams: IDrawingSearch[]): void;

    update(updateParam: T): void;
    batchUpdate(updateParams: T[]): void;

    getDrawingByParam(param: Nullable<IDrawingSearch>): Nullable<T>;
    getDrawingOKey(oKey: string): Nullable<T>;

    focusDrawing(params: Nullable<IDrawingSearch[]>): void;
    getFocusDrawings(): IDrawingParam[];

    forwardDrawings(unitId: string, subUnitId: string, drawingIds: string[]): void;
    backwardDrawing(unitId: string, subUnitId: string, drawingIds: string[]): void;
    frontDrawing(unitId: string, subUnitId: string, drawingIds: string[]): void;
    backDrawing(unitId: string, subUnitId: string, drawingIds: string[]): void;
    replaceDrawingOrder(unitId: string, subUnitId: string, drawingIds: string[]): void;
    getDrawingOrder(unitId: string, subUnitId: string): string[];

    externalUpdateNotification(updateParams: T[]): void;
}

export interface IDrawingManagerService extends IUnitDrawingService<IDrawingParam> {}

export const IDrawingManagerService = createIdentifier<IUnitDrawingService<IDrawingParam>>('univer.plugin.drawing-manager.service');
