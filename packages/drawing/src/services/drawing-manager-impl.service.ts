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

import type { IDrawingGroupNestedIds, IDrawingGroupNestedParam, IDrawingParam, IDrawingSearch, Nullable } from '@univerjs/core';
import type { JSONOp, JSONOpList } from 'ot-json1';
import type { Observable } from 'rxjs';
import type { IDrawingGroupUpdateParam, IDrawingMap, IDrawingMapItemData, IDrawingOrderMapParam, IDrawingOrderUpdateParam, IDrawingSubunitMap, IDrawingVisibleParam, IUnitDrawingService } from './drawing-manager.service';
import { DrawingTypeEnum, sortRules, sortRulesByDesc } from '@univerjs/core';
import * as json1 from 'ot-json1';
import { Subject } from 'rxjs';

export interface IDrawingJsonUndo1 {
    undo: JSONOp;
    redo: JSONOp;
    unitId: string;
    subUnitId: string;
    objects: IDrawingSearch[] | IDrawingOrderMapParam | IDrawingGroupUpdateParam | IDrawingGroupUpdateParam[];
}

export interface IDrawingJson1Type {
    op: JSONOp | JSONOpList;
    unitId: string;
    subUnitId: string;
    objects: IDrawingSearch[] | IDrawingOrderMapParam | IDrawingGroupUpdateParam | IDrawingGroupUpdateParam[];
}

enum DrawingMapItemType {
    data = 'data',
    order = 'order',
}

function isNonEmptyOp(op: JSONOp): boolean {
    return Array.isArray(op) && op.length > 0;
}

function isJsonValueEqual(left: unknown, right: unknown): boolean {
    if (left === right) {
        return true;
    }

    if (left == null || right == null || typeof left !== 'object' || typeof right !== 'object') {
        return false;
    }

    if (Array.isArray(left) || Array.isArray(right)) {
        if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
            return false;
        }

        return left.every((item, index) => isJsonValueEqual(item, right[index]));
    }

    const leftRecord = left as Record<string, unknown>;
    const rightRecord = right as Record<string, unknown>;
    const leftKeys = Object.keys(leftRecord);
    const rightKeys = Object.keys(rightRecord);
    if (leftKeys.length !== rightKeys.length) {
        return false;
    }

    return leftKeys.every((key) => Object.prototype.hasOwnProperty.call(rightRecord, key) && isJsonValueEqual(leftRecord[key], rightRecord[key]));
}

interface IDrawingRefreshMetadata {
    behindText?: unknown;
}

/**
 * unitId -> subUnitId -> drawingId -> drawingParam
 */
export class UnitDrawingService<T extends IDrawingParam> implements IUnitDrawingService<T> {
    drawingManagerData: IDrawingMap<T> = {};

    private _oldDrawingManagerData: IDrawingMap<T> = {};

    private _focusDrawings: T[] = [];

    private readonly _remove$ = new Subject<IDrawingSearch[]>();
    readonly remove$ = this._remove$.asObservable();

    private readonly _add$ = new Subject<IDrawingSearch[]>();
    readonly add$ = this._add$.asObservable();

    private readonly _update$ = new Subject<IDrawingSearch[]>();
    readonly update$ = this._update$.asObservable();

    private _order$ = new Subject<IDrawingOrderMapParam>();
    readonly order$ = this._order$.asObservable();

    private _group$ = new Subject<IDrawingGroupUpdateParam[]>();
    readonly group$ = this._group$.asObservable();

    private _ungroup$ = new Subject<IDrawingGroupUpdateParam[]>();
    readonly ungroup$ = this._ungroup$.asObservable();

    private _refreshTransform$ = new Subject<T[]>();
    readonly refreshTransform$ = this._refreshTransform$.asObservable();

    private _visible$ = new Subject<IDrawingVisibleParam[]>();
    readonly visible$ = this._visible$.asObservable();

    // private readonly _externalUpdate$ = new Subject<T[]>();
    // readonly externalUpdate$ = this._externalUpdate$.asObservable();

    private _focus$ = new Subject<T[]>();
    focus$: Observable<T[]> = this._focus$.asObservable();

    private readonly _featurePluginUpdate$ = new Subject<T[]>();
    readonly featurePluginUpdate$: Observable<T[]> = this._featurePluginUpdate$.asObservable();

    private readonly _featurePluginAdd$ = new Subject<T[]>();
    readonly featurePluginAdd$: Observable<T[]> = this._featurePluginAdd$.asObservable();

    private readonly _featurePluginRemove$ = new Subject<IDrawingSearch[]>();
    readonly featurePluginRemove$: Observable<IDrawingSearch[]> = this._featurePluginRemove$.asObservable();

    private readonly _featurePluginOrderUpdate$ = new Subject<IDrawingOrderUpdateParam>();
    readonly featurePluginOrderUpdate$: Observable<IDrawingOrderUpdateParam> = this._featurePluginOrderUpdate$.asObservable();

    private readonly _featurePluginGroupUpdate$ = new Subject<IDrawingGroupUpdateParam[]>();
    readonly featurePluginGroupUpdate$: Observable<IDrawingGroupUpdateParam[]> = this._featurePluginGroupUpdate$.asObservable();

    private readonly _featurePluginUngroupUpdate$ = new Subject<IDrawingGroupUpdateParam[]>();
    readonly featurePluginUngroupUpdate$: Observable<IDrawingGroupUpdateParam[]> = this._featurePluginUngroupUpdate$.asObservable();

    private _visible: boolean = true;
    private _editable: boolean = true;

    dispose(): void {
        this._remove$.complete();
        this._add$.complete();
        this._update$.complete();
        this._order$.complete();
        this._focus$.complete();
        this._featurePluginUpdate$.complete();
        this._featurePluginAdd$.complete();
        this._featurePluginRemove$.complete();
        this._featurePluginOrderUpdate$.complete();

        this.drawingManagerData = {};
        this._oldDrawingManagerData = {};
    }

    visibleNotification(visibleParams: IDrawingVisibleParam[]) {
        this._visible$.next(visibleParams);
    }

    refreshTransform(updateParams: T[]) {
        updateParams.forEach((updateParam) => {
            const param = this._getCurrentBySearch(updateParam);
            if (param == null) {
                return;
            }

            param.transform = updateParam.transform;
            param.transforms = updateParam.transforms;
            param.isMultiTransform = updateParam.isMultiTransform;

            if ('behindText' in updateParam) {
                (param as T & IDrawingRefreshMetadata).behindText = (updateParam as T & IDrawingRefreshMetadata).behindText;
            }
            if ('hidden' in updateParam) {
                param.hidden = updateParam.hidden;
            }
        });

        this.refreshTransformNotification(updateParams);
    }

    getDrawingDataForUnit(unitId: string) {
        return this.drawingManagerData[unitId] || {};
    }

    removeDrawingDataForUnit(unitId: string) {
        const subUnits = this.drawingManagerData[unitId];

        if (subUnits == null) {
            return;
        }

        delete this.drawingManagerData[unitId];

        const drawings: IDrawingSearch[] = [];

        Object.keys(subUnits).forEach((subUnitId) => {
            const subUnit = subUnits[subUnitId];
            if (subUnit?.data == null) {
                return;
            }
            Object.keys(subUnit.data).forEach((drawingId) => {
                drawings.push({ unitId, subUnitId, drawingId });
            });
        });
        if (drawings.length > 0) {
            this.removeNotification(drawings);
        }
    }

    registerDrawingData(unitId: string, data: IDrawingSubunitMap<T>) {
        this.drawingManagerData[unitId] = data;
    }

    initializeNotification(unitId: string) {
        const drawings: T[] = [];
        const data = this.drawingManagerData[unitId];

        if (data == null) {
            return;
        }

        Object.keys(data).forEach((subUnitId) => {
            this._establishDrawingMap(unitId, subUnitId);

            const subUnitData = data[subUnitId];
            if (subUnitData?.data == null) {
                return;
            }

            Object.keys(subUnitData.data).forEach((drawingId) => {
                const drawing = subUnitData.data[drawingId];
                drawing.unitId = unitId;
                drawing.subUnitId = subUnitId;
                drawings.push(drawing);
            });
        });

        if (drawings.length > 0) {
            this.addNotification(drawings);
        }
    }

    getDrawingData(unitId: string, subUnitId: string) {
        return this._getDrawingData(unitId, subUnitId);
    }

    // Use in doc only.
    setDrawingData(unitId: string, subUnitId: string, data: IDrawingMapItemData<T>) {
        this.drawingManagerData[unitId][subUnitId].data = data;
    }

    getBatchAddOp(insertParams: T[]): IDrawingJsonUndo1 {
        const objects: IDrawingSearch[] = [];
        const ops: JSONOp[] = [];
        const invertOps: JSONOp[] = [];
        insertParams.forEach((insertParam) => {
            const { op, invertOp } = this._addByParam(insertParam);
            objects.push({ unitId: insertParam.unitId, subUnitId: insertParam.subUnitId, drawingId: insertParam.drawingId });
            ops.push(op);
            invertOps.push(invertOp);
        });

        const op = ops.reduce(json1.type.compose, null);
        const invertOp = invertOps.reduce(json1.type.compose, null);

        // this._add$.next(objects);

        const { unitId, subUnitId } = insertParams[0];

        return { undo: invertOp, redo: op, unitId, subUnitId, objects };
    }

    getBatchRemoveOpInOder(removeParams: IDrawingSearch[]): IDrawingJsonUndo1 {
        if (removeParams.length === 0) {
            return { undo: null as unknown as JSONOp, redo: null as unknown as JSONOp, unitId: '', subUnitId: '', objects: [] };
        }
        const orders = this.getDrawingOrder(removeParams[0].unitId, removeParams[0].subUnitId);
        const orderIndexMap = new Map<string, number>();
        orders.forEach((drawingId, index) => {
            orderIndexMap.set(drawingId, index);
        });
        removeParams.sort((a, b) => {
            const indexA = orderIndexMap.get(a.drawingId) ?? Number.NEGATIVE_INFINITY;
            const indexB = orderIndexMap.get(b.drawingId) ?? Number.NEGATIVE_INFINITY;
            return indexA - indexB;
        });

        return this.getBatchRemoveOp(removeParams);
    }

    private _getExpandedBatchRemoveParams(removeParams: IDrawingSearch[]): IDrawingSearch[] {
        const seenIds = new Set<string>();
        const allToRemove: IDrawingSearch[] = [];
        const addDrawing = (drawing: IDrawingParam) => {
            if (seenIds.has(drawing.drawingId)) {
                return;
            }

            seenIds.add(drawing.drawingId);
            allToRemove.push({ unitId: drawing.unitId, subUnitId: drawing.subUnitId, drawingId: drawing.drawingId });
        };
        const addSearch = (search: IDrawingSearch) => {
            if (seenIds.has(search.drawingId)) {
                return;
            }

            seenIds.add(search.drawingId);
            allToRemove.push(search);
        };
        removeParams.forEach((removeParam) => {
            const drawing = this.getDrawingByParam(removeParam);
            if (drawing?.drawingType === DrawingTypeEnum.DRAWING_GROUP) {
                const nested = this.getDrawingsByGroupNested(removeParam);
                if (nested) {
                    const { flatChildren, groups } = nested;
                    [...(flatChildren ?? []), ...groups].forEach((d) => {
                        addDrawing(d);
                    });
                } else {
                    addDrawing(drawing);
                }
            } else if (drawing) {
                addDrawing(drawing);
            } else {
                addSearch(removeParam);
            }
        });

        return allToRemove;
    }

    getBatchRemoveOp(removeParams: IDrawingSearch[]): IDrawingJsonUndo1 {
        // Expand group drawings to include all nested group nodes and leaf children.
        // Non-group drawings are kept as-is.
        const allToRemove = this._getExpandedBatchRemoveParams(removeParams);
        const { unitId, subUnitId } = allToRemove[0] ?? removeParams[0] ?? { unitId: '', subUnitId: '' };
        if (allToRemove.length === 0) {
            return { undo: null as unknown as JSONOp, redo: null as unknown as JSONOp, unitId, subUnitId, objects: [] };
        }

        // Sort ascending by order index so that, with the unshift trick below,
        // composition applies removals from highest index to lowest (back-to-front).
        // This handles nested groups layer-by-layer: inner groups sit at higher order
        // positions than their parents and are therefore removed first.
        const orderArr = this._getDrawingOrder(unitId, subUnitId);
        const orderIndexMap = new Map<string, number>();
        orderArr.forEach((id, idx) => orderIndexMap.set(id, idx));
        allToRemove.sort((a, b) => {
            const ia = orderIndexMap.get(a.drawingId) ?? Number.NEGATIVE_INFINITY;
            const ib = orderIndexMap.get(b.drawingId) ?? Number.NEGATIVE_INFINITY;
            return ia - ib;
        });

        const ops: JSONOp[] = [];
        const invertOps: JSONOp[] = [];

        allToRemove.forEach((removeParam) => {
            const { op, invertOp } = this._removeByParam(removeParam);
            /**
             * ot-json compose case
             * two remove ops to does composition
             * ops: [[unit, sheetUnit, order, 0, { r: true }], [unit, sheetUnit, order, 1, { r: true }]]
             * We expected them to composed as [unit, sheetUnit, order, [0, { r: true }], [1, { r: true }]]
             * But extremely confusing to get [unit, sheetUnit, order, 0, { r: true }, 2, { r: true }]
             * And We apply this composed op to data, it's no item with index 2 can be removed.
             * So use unshift api instead of push here.
             */
            ops.unshift(op);
            invertOps.push(invertOp);
        });
        const op = ops.reduce(json1.type.compose, null);
        const invertOp = invertOps.reduce(json1.type.compose, null);

        // this._remove$.next(objects);

        return { undo: invertOp, redo: op, unitId, subUnitId, objects: allToRemove };
    }

    getBatchUpdateOp(updateParams: T[]): IDrawingJsonUndo1 {
        const objects: IDrawingSearch[] = [];
        const ops: JSONOp[] = [];
        const invertOps: JSONOp[] = [];
        updateParams.forEach((updateParam) => {
            const { op, invertOp } = this._updateByParam(updateParam);
            if (!isNonEmptyOp(op)) {
                return;
            }

            objects.push({ unitId: updateParam.unitId, subUnitId: updateParam.subUnitId, drawingId: updateParam.drawingId });
            ops.push(op);
            invertOps.push(invertOp);
        });

        if (ops.length === 0) {
            const { unitId, subUnitId } = updateParams[0];
            return { undo: null as unknown as JSONOp, redo: null as unknown as JSONOp, unitId, subUnitId, objects };
        }

        const op = ops.reduce(json1.type.compose, null);
        const invertOp = invertOps.reduce(json1.type.compose, null);

        // this._update$.next(objects);

        const { unitId, subUnitId } = updateParams[0];

        return { undo: invertOp, redo: op, unitId, subUnitId, objects };
    }

    removeNotification(removeParams: IDrawingSearch[]) {
        this._remove$.next(removeParams);
    }

    addNotification(insertParams: IDrawingSearch[]) {
        this._add$.next(insertParams);
    }

    updateNotification(updateParams: IDrawingSearch[]) {
        this._update$.next(updateParams);
    }

    orderNotification(orderParams: IDrawingOrderMapParam) {
        this._order$.next(orderParams);
    }

    groupUpdateNotification(groupParams: IDrawingGroupUpdateParam[]): void {
        this._group$.next(groupParams);
    }

    ungroupUpdateNotification(groupParams: IDrawingGroupUpdateParam[]): void {
        this._ungroup$.next(groupParams);
    }

    refreshTransformNotification(refreshParams: T[]) {
        this._refreshTransform$.next(refreshParams);
    }

    getGroupDrawingOp(groupParams: IDrawingGroupUpdateParam[]): IDrawingJsonUndo1 {
        const ops: JSONOp[] = [];
        const { unitId, subUnitId } = groupParams[0].parent;
        groupParams.forEach((groupParam) => {
            ops.push(this._getGroupDrawingOp(groupParam));
        });

        const op = ops.reduce(json1.type.compose, null);

        const invertOp = json1.type.invertWithDoc(op, this.drawingManagerData as unknown as json1.Doc);

        return { undo: invertOp, redo: op, unitId, subUnitId, objects: groupParams };
    }

    getUngroupDrawingOp(groupParams: IDrawingGroupUpdateParam[]): IDrawingJsonUndo1 {
        const ops: JSONOp[] = [];
        const { unitId, subUnitId } = groupParams[0].parent;
        groupParams.forEach((groupParam) => {
            ops.push(this._getUngroupDrawingOp(groupParam));
        });

        const op = ops.reduce(json1.type.compose, null);

        const invertOp = json1.type.invertWithDoc(op, this.drawingManagerData as unknown as json1.Doc);

        return { undo: invertOp, redo: op, unitId, subUnitId, objects: groupParams };
    }

    getDrawingsByGroup(groupParam: IDrawingSearch): IDrawingParam[] {
        const { unitId, subUnitId, drawingId } = groupParam;
        const group = this.getDrawingByParam({ unitId, subUnitId, drawingId });

        if (group == null) {
            return [];
        }

        const drawings = this._getDrawingData(unitId, subUnitId);

        const children: IDrawingParam[] = [];
        Object.keys(drawings).forEach((key) => {
            const drawing = drawings[key];
            if (drawing.groupId === drawingId) {
                children.push(drawing);
            }
        });

        return children;
    }

    getDrawingsByGroupNested(groupSearch: IDrawingSearch): IDrawingGroupNestedParam | null {
        const { unitId, subUnitId } = groupSearch;
        const rootParam = this.getDrawingByParam(groupSearch);
        if (!rootParam) {
            return null;
        }

        // get all drawings in the same subUnit one time to avoid multiple times of data access when there are many drawings
        const allDrawings = this._getDrawingData(unitId, subUnitId);
        const groupDerivedDrawingsIdMap: Map<string, string[]> = new Map();
        Object.values(allDrawings).forEach((drawing) => {
            if (drawing.groupId != null) {
                if (!groupDerivedDrawingsIdMap.has(drawing.groupId)) {
                    groupDerivedDrawingsIdMap.set(drawing.groupId, []);
                }
                groupDerivedDrawingsIdMap.get(drawing.groupId)!.push(drawing.drawingId);
            }
        });

        const flatChildren: IDrawingParam[] = [];
        const groups: IDrawingParam[] = [];
        const nestedIdRecord: Record<string, IDrawingGroupNestedIds> = {};

        // It stores all non-grouped child elements, while ensuring that each child element is always positioned before its parent element in the repository.
        // `flatChildren` stores all non-grouped elements, satisfying the left-order traversal order.
        const dfs = (param: IDrawingParam): void => {
            const { drawingId } = param;
            const childrenIds = groupDerivedDrawingsIdMap.get(drawingId) ?? [];
            nestedIdRecord[drawingId] = { drawingId, children: childrenIds };
            childrenIds.forEach((childId) => {
                const childParam = allDrawings[childId];
                if (!childParam) return;
                if (childParam.drawingType === DrawingTypeEnum.DRAWING_GROUP) {
                    dfs(childParam);
                    groups.push(childParam);
                } else {
                    flatChildren.push(childParam);
                }
            });
        };

        dfs(rootParam);
        groups.push(rootParam); // root group is always last

        return {
            nestedIdRecord,
            flatChildren,
            groups,
        };
    }

    private _getGroupDrawingOp(groupParam: IDrawingGroupUpdateParam): JSONOp {
        const { parent, children } = groupParam;
        const { unitId: groupUnitId, subUnitId: groupSubUnitId, drawingId: groupDrawingId } = parent;

        const ops: JSONOp[] = [];

        ops.push(
            json1.insertOp([groupUnitId, groupSubUnitId, DrawingMapItemType.data, groupDrawingId], parent as unknown as json1.Doc)
        );
        let maxChildIndex = Number.NEGATIVE_INFINITY;
        children.forEach((child) => {
            const { unitId, subUnitId, drawingId } = child;
            const index = this._hasDrawingOrder({ unitId, subUnitId, drawingId });
            maxChildIndex = Math.max(maxChildIndex, index);
            ops.push(
                ...this._getUpdateParamCompareOp(child as T, this.getDrawingByParam({ unitId, subUnitId, drawingId }) as T)
            );
        });

        if (maxChildIndex === Number.NEGATIVE_INFINITY) {
            maxChildIndex = this._getDrawingOrder(groupUnitId, groupSubUnitId).length;
        }

        ops.push(
            json1.insertOp([groupUnitId, groupSubUnitId, DrawingMapItemType.order, maxChildIndex], groupDrawingId)
        );

        return ops.reduce(json1.type.compose, null);
    }

    private _getUngroupDrawingOp(groupParam: IDrawingGroupUpdateParam): JSONOp {
        const { parent, children } = groupParam;

        const { unitId: groupUnitId, subUnitId: groupSubUnitId, drawingId: groupDrawingId } = parent;

        const ops: JSONOp[] = [];
        children.forEach((child) => {
            const { unitId, subUnitId, drawingId } = child;
            ops.push(
                ...this._getUpdateParamCompareOp(child as T, this.getDrawingByParam({ unitId, subUnitId, drawingId }) as T)
            );
        });
        ops.push(
            json1.removeOp([groupUnitId, groupSubUnitId, DrawingMapItemType.data, groupDrawingId], true)
        );
        ops.push(
            json1.removeOp([groupUnitId, groupSubUnitId, DrawingMapItemType.order, this._getDrawingOrder(groupUnitId, groupSubUnitId).indexOf(groupDrawingId)], true)
        );

        return ops.reduce(json1.type.compose, null);
    }

    applyJson1(unitId: string, subUnitId: string, jsonOp: JSONOp) {
        this._establishDrawingMap(unitId, subUnitId);
        // this._fillMissingFields(jsonOp);
        this._oldDrawingManagerData = { ...this.drawingManagerData };
        this.drawingManagerData = json1.type.apply(this.drawingManagerData as unknown as json1.Doc, jsonOp) as unknown as IDrawingMap<T>;
    }

    // private _fillMissingFields(jsonOp: JSONOp) {
    //     if (jsonOp == null) {
    //         return;
    //     }

    //     let object: { [key: string]: {} } = this.drawingManagerData;
    //     for (let i = 0; i < jsonOp.length; i++) {
    //         const op = jsonOp[i];
    //         if (Array.isArray(op)) {
    //             const opKey = op[0] as string;
    //             if (!(opKey in object)) {
    //                 object[opKey] = null as unknown as never;
    //             }
    //         } else if (typeof op === 'string') {
    //             object = object[op];
    //             if (object == null) {
    //                 break;
    //             }
    //         }
    //     }
    // }

    featurePluginUpdateNotification(updateParams: T[]) {
        this._featurePluginUpdate$.next(updateParams);
    }

    featurePluginOrderUpdateNotification(drawingOrderUpdateParam: IDrawingOrderUpdateParam) {
        this._featurePluginOrderUpdate$.next(drawingOrderUpdateParam);
    }

    featurePluginAddNotification(insertParams: T[]) {
        this._featurePluginAdd$.next(insertParams);
    }

    featurePluginRemoveNotification(removeParams: IDrawingSearch[]) {
        this._featurePluginRemove$.next(removeParams);
    }

    featurePluginGroupUpdateNotification(groupParams: IDrawingGroupUpdateParam[]) {
        this._featurePluginGroupUpdate$.next(groupParams);
    }

    featurePluginUngroupUpdateNotification(groupParams: IDrawingGroupUpdateParam[]) {
        this._featurePluginUngroupUpdate$.next(groupParams);
    }

    getDrawingByParam(param: Nullable<IDrawingSearch>): Nullable<T> {
        return this._getCurrentBySearch(param);
    }

    getOldDrawingByParam(param: Nullable<IDrawingSearch>): Nullable<T> {
        return this._getOldBySearch(param);
    }

    getDrawingOKey(oKey: string): Nullable<T> {
        const [unitId, subUnitId, drawingId] = oKey.split('#-#');
        return this._getCurrentBySearch({ unitId, subUnitId, drawingId });
    }

    focusDrawing(params: Nullable<IDrawingSearch[]>): void {
        if (params == null || params.length === 0) {
            this._focusDrawings = [];
            this._focus$.next([]);
            return;
        }

        const drawingParams: T[] = [];
        params.forEach((param) => {
            const { unitId, subUnitId, drawingId } = param;
            const item = this._getDrawingData(unitId, subUnitId)?.[drawingId];
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
        const drawingParams: T[] = [];
        this._focusDrawings.forEach((param) => {
            const { unitId, subUnitId, drawingId } = param;
            const item = this._getDrawingData(unitId, subUnitId)?.[drawingId];
            if (item != null) {
                drawingParams.push(item);
            }
        });
        return drawingParams;
    }

    getDrawingOrder(unitId: string, subUnitId: string) {
        return this._getDrawingOrder(unitId, subUnitId);
    }

    // Use in doc only.
    setDrawingOrder(unitId: string, subUnitId: string, order: string[]) {
        this.drawingManagerData[unitId][subUnitId].order = order;
    }

    orderUpdateNotification(orderParams: IDrawingOrderMapParam) {
        this._order$.next(orderParams);
    }

    getForwardDrawingsOp(orderParams: IDrawingOrderMapParam): IDrawingJsonUndo1 {
        const { unitId, subUnitId, drawingIds } = orderParams;
        const ops: JSONOp[] = [];
        const orders = this.getDrawingOrder(unitId, subUnitId);
        const newIds = [...drawingIds];
        drawingIds.forEach((drawingId) => {
            const index = this._hasDrawingOrder({ unitId, subUnitId, drawingId });
            if (index === -1 || index === orders.length - 1) {
                return;
            }
            const op = json1.moveOp([unitId, subUnitId, DrawingMapItemType.order, index], [unitId, subUnitId, DrawingMapItemType.order, index + 1]);
            ops.push(op);
            if (!newIds.includes(orders[index + 1])) {
                newIds.push(orders[index + 1]);
            }
            // this._moveDrawingOrder(unitId, subUnitId, drawingId, index + 1);
        });

        const op = ops.reduce(json1.type.compose, null);
        const invertOp = json1.type.invertWithDoc(op, this.drawingManagerData as unknown as json1.Doc);

        // this._order$.next({ unitId, subUnitId, drawingIds: this.getDrawingOrder(unitId, subUnitId) });

        return { undo: invertOp, redo: op, unitId, subUnitId, objects: { ...orderParams, drawingIds: newIds } };
    }

    getBackwardDrawingOp(orderParams: IDrawingOrderMapParam): IDrawingJsonUndo1 {
        const { unitId, subUnitId, drawingIds } = orderParams;
        const ops: JSONOp[] = [];
        const orders = this.getDrawingOrder(unitId, subUnitId);
        const newIds = [...drawingIds];
        drawingIds.forEach((drawingId) => {
            const index = this._hasDrawingOrder({ unitId, subUnitId, drawingId });
            if (index === -1 || index === 0) {
                return;
            }
            // this._moveDrawingOrder(unitId, subUnitId, drawingId, index - 1);
            const op = json1.moveOp([unitId, subUnitId, DrawingMapItemType.order, index], [unitId, subUnitId, DrawingMapItemType.order, index - 1]);
            ops.push(op);
            if (!newIds.includes(orders[index - 1])) {
                newIds.push(orders[index - 1]);
            }
        });

        const op = ops.reduce(json1.type.compose, null);
        const invertOp = json1.type.invertWithDoc(op, this.drawingManagerData as unknown as json1.Doc);

        // this._order$.next({ unitId, subUnitId, drawingIds: this.getDrawingOrder(unitId, subUnitId) });

        return { undo: invertOp, redo: op, unitId, subUnitId, objects: { ...orderParams, drawingIds: newIds } };
    }

    getFrontDrawingsOp(orderParams: IDrawingOrderMapParam): IDrawingJsonUndo1 {
        const { unitId, subUnitId, drawingIds } = orderParams;
        const orderDrawingIds = this._getOrderFromSearchParams(unitId, subUnitId, drawingIds);
        const newIds = [...drawingIds];
        const orders = this.getDrawingOrder(unitId, subUnitId);
        const ops: JSONOp[] = [];
        orderDrawingIds.forEach((orderDrawingId) => {
            const { drawingId } = orderDrawingId;
            const index = this._getDrawingCount(unitId, subUnitId) - 1;

            const op = json1.moveOp([unitId, subUnitId, DrawingMapItemType.order, this._getDrawingOrder(unitId, subUnitId).indexOf(drawingId)], [unitId, subUnitId, DrawingMapItemType.order, index]);
            ops.push(op);
            if (!newIds.includes(orders[index])) {
                newIds.push(orders[index]);
            }
            // this._moveDrawingOrder(unitId, subUnitId, drawingId, index + 1);
        });

        const op = ops.reduce(json1.type.compose, null);
        const invertOp = json1.type.invertWithDoc(op, this.drawingManagerData as unknown as json1.Doc);

        return { undo: invertOp, redo: op, unitId, subUnitId, objects: { ...orderParams, drawingIds: newIds } };
    }

    getBackDrawingsOp(orderParams: IDrawingOrderMapParam): IDrawingJsonUndo1 {
        const { unitId, subUnitId, drawingIds } = orderParams;
        const orderSearchParams = this._getOrderFromSearchParams(unitId, subUnitId, drawingIds, true);
        const newIds = [...drawingIds];
        const orders = this.getDrawingOrder(unitId, subUnitId);
        const ops: JSONOp[] = [];
        orderSearchParams.forEach((orderSearchParam) => {
            const { drawingId } = orderSearchParam;

            const op = json1.moveOp([unitId, subUnitId, DrawingMapItemType.order, this._getDrawingOrder(unitId, subUnitId).indexOf(drawingId)], [unitId, subUnitId, DrawingMapItemType.order, 0]);
            ops.push(op);

            if (!newIds.includes(orders[0])) {
                newIds.push(orders[0]);
            }
        });

        const op = ops.reduce(json1.type.compose, null);
        const invertOp = json1.type.invertWithDoc(op, this.drawingManagerData as unknown as json1.Doc);

        return { undo: invertOp, redo: op, unitId, subUnitId, objects: { ...orderParams, drawingIds: newIds } };
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

    private _hasDrawingOrder(searchParam: Nullable<IDrawingSearch>) {
        if (searchParam == null) {
            return -1;
        }

        const { unitId, subUnitId, drawingId } = searchParam;

        this._establishDrawingMap(unitId, subUnitId);

        return this._getDrawingOrder(unitId, subUnitId).indexOf(drawingId);
    }

    private _getCurrentBySearch(searchParam: Nullable<IDrawingSearch>): Nullable<T> {
        if (searchParam == null) {
            return;
        }
        const { unitId, subUnitId, drawingId } = searchParam;
        return this.drawingManagerData[unitId]?.[subUnitId]?.data?.[drawingId] as T;
    }

    private _getOldBySearch(searchParam: Nullable<IDrawingSearch>): Nullable<T> {
        if (searchParam == null) {
            return;
        }
        const { unitId, subUnitId, drawingId } = searchParam;
        return this._oldDrawingManagerData[unitId]?.[subUnitId]?.data?.[drawingId] as T;
    }

    private _establishDrawingMap(unitId: string, subUnitId: string, drawingId?: string) {
        if (!this.drawingManagerData[unitId]) {
            this.drawingManagerData[unitId] = {};
        }

        if (!this.drawingManagerData[unitId][subUnitId]) {
            this.drawingManagerData[unitId][subUnitId] = {
                data: {},
                order: [],
            };
        }

        if (drawingId == null) {
            return null;
        }
        return this.drawingManagerData[unitId][subUnitId].data?.[drawingId];
    }

    private _addByParam(insertParam: T): { op: JSONOp; invertOp: JSONOp } {
        const { unitId, subUnitId, drawingId } = insertParam;

        this._establishDrawingMap(unitId, subUnitId, drawingId);

        // this.drawingManagerInfo[unitId][subUnitId][drawingId] = insertParam;

        // this._insertDrawingOrder({ unitId, subUnitId, drawingId });

        const op1 = json1.insertOp([unitId, subUnitId, DrawingMapItemType.data, drawingId], insertParam as unknown as json1.Doc);
        const op2 = json1.insertOp([unitId, subUnitId, DrawingMapItemType.order, this._getDrawingOrder(unitId, subUnitId).length], drawingId);
        const op = [op1, op2].reduce(json1.type.compose, null);

        const invertOp = json1.type.invertWithDoc(op, this.drawingManagerData as unknown as json1.Doc);

        return { op, invertOp };
    }

    private _removeByParam(searchParam: Nullable<IDrawingSearch>): { op: JSONOp; invertOp: JSONOp } {
        if (searchParam == null) {
            return { op: [], invertOp: [] };
        }
        const { unitId, subUnitId, drawingId } = searchParam;

        const object = this._establishDrawingMap(unitId, subUnitId, drawingId);

        if (object == null) {
            return { op: [], invertOp: [] };
        }

        // delete this.drawingManagerInfo[unitId][subUnitId][drawingId];

        // this._removeDrawingOrder({ unitId, subUnitId, drawingId });

        const op1 = json1.removeOp([unitId, subUnitId, DrawingMapItemType.data, drawingId], true);
        const op2 = json1.removeOp([unitId, subUnitId, DrawingMapItemType.order, this._getDrawingOrder(unitId, subUnitId).indexOf(drawingId)], true);
        const op = [op1, op2].reduce(json1.type.compose, null);

        const invertOp = json1.type.invertWithDoc(op, this.drawingManagerData as unknown as json1.Doc);

        return { op, invertOp };
    }

    private _updateByParam(updateParam: T): { op: JSONOp; invertOp: JSONOp } {
        const { unitId, subUnitId, drawingId } = updateParam;

        const object = this._establishDrawingMap(unitId, subUnitId, drawingId);

        if (object == null) {
            return { op: [], invertOp: [] };
        }

        // const oldParam = this._getCurrentBySearch({ unitId, subUnitId, drawingId });
        // if (oldParam) {
        //     this._initializeDrawingData(updateParam, oldParam);
        // }

        const ops: JSONOp[] = this._getUpdateParamCompareOp(updateParam, object as T);

        // this.drawingManagerInfo[unitId][subUnitId][drawingId] = newObject;

        if (ops.length === 0) {
            return { op: [] as unknown as JSONOp, invertOp: [] as unknown as JSONOp };
        }

        const op = ops.reduce(json1.type.compose, null);

        const invertOp = json1.type.invertWithDoc(op, this.drawingManagerData as unknown as json1.Doc);

        return { op, invertOp };
    }

    // private _initializeDrawingData(updateParam: T, oldParam: T) {
    //     Object.keys(updateParam).forEach((key) => {
    //         if (!(key in oldParam)) {
    //             oldParam[key as keyof IDrawingParam] = null as unknown as never;
    //         }
    //     });
    // }

    private _getUpdateParamCompareOp(newParam: T, oldParam: T) {
        const { unitId, subUnitId, drawingId } = newParam;
        const ops: JSONOp[] = [];
        Object.keys(newParam as IDrawingParam).forEach((key) => {
            const newVal = newParam[key as keyof IDrawingParam];
            const hasOldKey = Object.prototype.hasOwnProperty.call(oldParam, key);
            const oldVal = oldParam[key as keyof IDrawingParam];

            if (hasOldKey && isJsonValueEqual(oldVal, newVal)) {
                return;
            }

            const path = [unitId, subUnitId, DrawingMapItemType.data, drawingId, key];
            if (!hasOldKey) {
                if (newVal === undefined) {
                    return;
                }

                const op = json1.insertOp(path, newVal as unknown as json1.Doc);
                if (isNonEmptyOp(op)) {
                    ops.push(op);
                }
                return;
            }

            if (newVal === undefined) {
                const op = json1.removeOp(path, true);
                if (isNonEmptyOp(op)) {
                    ops.push(op);
                }
                return;
            }

            const op = json1.replaceOp(path, oldVal as unknown as json1.Doc, newVal as unknown as json1.Doc);
            if (isNonEmptyOp(op)) {
                ops.push(op);
            }
        });
        return ops;
    }

    private _getDrawingData(unitId: string, subUnitId: string) {
        return this.drawingManagerData[unitId]?.[subUnitId]?.data || {};
    }

    private _getDrawingOrder(unitId: string, subUnitId: string) {
        return this.drawingManagerData[unitId]?.[subUnitId]?.order || [];
    }

    getDrawingVisible() {
        return this._visible;
    }

    getDrawingEditable() {
        return this._editable;
    }

    setDrawingVisible(visible: boolean) {
        this._visible = visible;
    }

    setDrawingEditable(editable: boolean) {
        this._editable = editable;
    }
}

export class DrawingManagerService extends UnitDrawingService<IDrawingParam> { }
