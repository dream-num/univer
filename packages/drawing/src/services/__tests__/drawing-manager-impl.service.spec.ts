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

import type { IDrawingParam, IDrawingSearch } from '@univerjs/core';
import { BooleanNumber, DrawingTypeEnum, Injector } from '@univerjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDrawingCopyPlan, getOrCreateDrawingCopyPlan, isGroupableDrawingType } from '../../utils/drawing-group';
import { UnitDrawingService } from '../drawing-manager-impl.service';

const unitId = 'unit';
const subUnitId = 'subUnit';

function createDrawing(drawingId: string, overrides: Partial<IDrawingParam> = {}): IDrawingParam {
    return {
        unitId,
        subUnitId,
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        ...overrides,
    };
}

function createSearch(drawingId: string): IDrawingSearch {
    return {
        unitId,
        subUnitId,
        drawingId,
    };
}

describe('UnitDrawingService', () => {
    let service: UnitDrawingService<IDrawingParam>;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([UnitDrawingService]);
        service = injector.get(UnitDrawingService);
    });

    it('should register, initialize and remove drawing data for a unit', () => {
        const added: IDrawingSearch[][] = [];
        const removed: IDrawingSearch[][] = [];

        service.add$.subscribe((params) => added.push(params));
        service.remove$.subscribe((params) => removed.push(params));

        service.registerDrawingData(unitId, {
            [subUnitId]: {
                data: {
                    a: createDrawing('a'),
                    b: createDrawing('b'),
                },
                order: ['a', 'b'],
            },
        });

        service.initializeNotification(unitId);

        expect(added).toHaveLength(1);
        expect(added[0].map((item) => item.drawingId)).toEqual(['a', 'b']);
        expect(service.getDrawingData(unitId, subUnitId)).toMatchObject({
            a: createDrawing('a'),
            b: createDrawing('b'),
        });

        service.removeDrawingDataForUnit(unitId);

        expect(removed).toEqual([[createSearch('a'), createSearch('b')]]);
        expect(service.getDrawingDataForUnit(unitId)).toEqual({});
    });

    it('should build and apply add, update and remove operations', () => {
        const drawingA = createDrawing('a', { allowTransform: true });
        const drawingB = createDrawing('b');

        const addOp = service.getBatchAddOp([drawingA, drawingB]);
        service.applyJson1(unitId, subUnitId, addOp.redo);

        expect(service.getDrawingOrder(unitId, subUnitId)).toEqual(['b', 'a']);
        expect(service.getDrawingByParam(createSearch('a'))).toEqual(drawingA);
        expect(service.getDrawingOKey(`${unitId}#-#${subUnitId}#-#a`)).toEqual(drawingA);

        const updatedDrawingA = createDrawing('a', {
            allowTransform: false,
            groupId: 'group-1',
        });
        const updateOp = service.getBatchUpdateOp([updatedDrawingA]);
        service.applyJson1(unitId, subUnitId, updateOp.redo);

        expect(service.getDrawingByParam(createSearch('a'))).toMatchObject(updatedDrawingA);
        expect(service.getOldDrawingByParam(createSearch('a'))).toMatchObject(drawingA);

        const removeOp = service.getBatchRemoveOp([createSearch('b')]);
        service.applyJson1(unitId, subUnitId, removeOp.redo);

        expect(service.getDrawingByParam(createSearch('b'))).toBeUndefined();
        expect(service.getOldDrawingByParam(createSearch('b'))).toMatchObject(drawingB);
    });

    it('should build and apply update operations for newly added metadata fields', () => {
        const drawingA = createDrawing('a');

        service.applyJson1(unitId, subUnitId, service.getBatchAddOp([drawingA]).redo);

        const updateOp = service.getBatchUpdateOp([{ ...drawingA, hidden: true }]);
        service.applyJson1(unitId, subUnitId, updateOp.redo);

        expect(service.getDrawingByParam(createSearch('a'))).toMatchObject({
            drawingId: 'a',
            hidden: true,
        });
    });

    it('expands grouped remove operations to include all nested drawing records', () => {
        service.applyJson1(unitId, subUnitId, service.getBatchAddOp([
            createDrawing('group', { drawingType: DrawingTypeEnum.DRAWING_GROUP }),
            createDrawing('image-child', { groupId: 'group' }),
            createDrawing('chart-child', { drawingType: DrawingTypeEnum.DRAWING_CHART, groupId: 'group' }),
        ]).redo);

        const removeOp = service.getBatchRemoveOp([createSearch('group')]);

        expect(removeOp.objects).toEqual([
            createSearch('chart-child'),
            createSearch('image-child'),
            createSearch('group'),
        ]);
    });

    it('keeps batch remove operations stable for empty drawing inputs', () => {
        expect(service.getBatchRemoveOp([])).toMatchObject({
            unitId: '',
            subUnitId: '',
            objects: [],
        });
    });

    it('deduplicates expanded remove params for grouped, normal, and missing drawings', () => {
        service.applyJson1(unitId, subUnitId, service.getBatchAddOp([
            createDrawing('group', { drawingType: DrawingTypeEnum.DRAWING_GROUP }),
            createDrawing('image'),
        ]).redo);
        vi.spyOn(service, 'getDrawingsByGroupNested').mockReturnValue(null);

        const expanded = (service as unknown as {
            _getExpandedBatchRemoveParams: (removeParams: IDrawingSearch[]) => IDrawingSearch[];
        })._getExpandedBatchRemoveParams([
            createSearch('group'),
            createSearch('group'),
            createSearch('image'),
            createSearch('image'),
            createSearch('missing'),
            createSearch('missing'),
        ]);

        expect(expanded).toEqual([
            createSearch('group'),
            createSearch('image'),
            createSearch('missing'),
        ]);
    });

    it('creates one copy id map for group children and chart drawings', () => {
        let nextId = 0;
        const plan = createDrawingCopyPlan([
            createDrawing('group', { drawingType: DrawingTypeEnum.DRAWING_GROUP }),
            createDrawing('image-child', { groupId: 'group' }),
            createDrawing('chart-child', { drawingType: DrawingTypeEnum.DRAWING_CHART, groupId: 'group' }),
        ], {
            unitId,
            sourceSubUnitId: subUnitId,
            targetSubUnitId: 'copied-sheet',
            generateId: () => `copy-${nextId++}`,
        });

        expect(plan.idMap.size).toBe(3);
        expect(plan.idMap.get('group')).toBe('copy-0');
        expect(plan.idMap.get('image-child')).toBe('copy-1');
        expect(plan.idMap.get('chart-child')).toBe('copy-2');
        expect(plan.drawings).toEqual([
            expect.objectContaining({ drawingId: 'copy-0', subUnitId: 'copied-sheet' }),
            expect.objectContaining({ drawingId: 'copy-1', groupId: 'copy-0', subUnitId: 'copied-sheet' }),
            expect.objectContaining({ drawingId: 'copy-2', groupId: 'copy-0', subUnitId: 'copied-sheet' }),
        ]);
    });

    it('keeps copied drawing unchanged when the id map cannot resolve its current id', () => {
        let readCount = 0;
        const dynamicDrawing = {
            ...createDrawing('registered-id'),
            get drawingId() {
                readCount += 1;
                return readCount <= 2 ? 'registered-id' : 'unmapped-id';
            },
        } as IDrawingParam;

        const plan = createDrawingCopyPlan([dynamicDrawing], {
            unitId,
            sourceSubUnitId: subUnitId,
            targetSubUnitId: 'copied-sheet',
            generateId: () => 'copy-0',
        });

        expect(plan.idMap.get('registered-id')).toBe('copy-0');
        expect(plan.drawings[0]).toEqual(expect.objectContaining({
            drawingId: 'unmapped-id',
            subUnitId,
        }));
    });

    it('creates uncached copy plans and reuses cached complete copy plans', () => {
        let nextId = 0;
        const options = {
            unitId,
            sourceSubUnitId: subUnitId,
            targetSubUnitId: 'copied-sheet',
            generateId: () => `copy-${nextId++}`,
        };
        const child = createDrawing('child', { groupId: 'missing-group' });
        const uncachedPlan = getOrCreateDrawingCopyPlan(undefined, [child], options);

        expect(isGroupableDrawingType(DrawingTypeEnum.DRAWING_TABLE)).toBe(false);
        expect(uncachedPlan.drawings[0]).toEqual(expect.objectContaining({
            drawingId: 'copy-0',
            subUnitId: 'copied-sheet',
        }));
        expect(uncachedPlan.drawings[0].groupId).toBeUndefined();

        const copyContext = new Map<string, unknown>();
        const cachedPlan = getOrCreateDrawingCopyPlan(copyContext, [child], options);

        expect(getOrCreateDrawingCopyPlan(copyContext, [child], options)).toBe(cachedPlan);
    });

    it('extends a cached copy plan with the default id generator when no generator is provided', () => {
        const options = {
            unitId,
            sourceSubUnitId: subUnitId,
            targetSubUnitId: 'copied-sheet',
        };
        const copyContext = new Map<string, unknown>();
        const firstPlan = getOrCreateDrawingCopyPlan(copyContext, [createDrawing('child-1')], options);

        const extendedPlan = getOrCreateDrawingCopyPlan(copyContext, [
            createDrawing('child-1'),
            createDrawing('child-2'),
        ], options);

        expect(extendedPlan).toBe(firstPlan);
        expect(extendedPlan.idMap.has('child-2')).toBe(true);
        expect(extendedPlan.drawings.map((drawing) => drawing.subUnitId)).toEqual(['copied-sheet', 'copied-sheet']);
    });

    it('extends a cached copy plan when a later caller provides more drawing graph nodes', () => {
        let nextId = 0;
        const copyContext = new Map<string, unknown>();
        const options = {
            unitId,
            sourceSubUnitId: subUnitId,
            targetSubUnitId: 'copied-sheet',
            generateId: () => `copy-${nextId++}`,
        };
        const chart = createDrawing('chart-child', { drawingType: DrawingTypeEnum.DRAWING_CHART, groupId: 'group' });
        const firstPlan = getOrCreateDrawingCopyPlan(copyContext, [chart], options);

        expect(firstPlan.drawings[0].groupId).toBeUndefined();

        const extendedPlan = getOrCreateDrawingCopyPlan(copyContext, [
            createDrawing('group', { drawingType: DrawingTypeEnum.DRAWING_GROUP }),
            createDrawing('image-child', { groupId: 'group' }),
            chart,
        ], options);

        expect(extendedPlan).toBe(firstPlan);
        expect(extendedPlan.idMap.get('chart-child')).toBe('copy-0');
        expect(extendedPlan.idMap.get('group')).toBe('copy-1');
        expect(extendedPlan.idMap.get('image-child')).toBe('copy-2');
        expect(extendedPlan.drawings).toEqual([
            expect.objectContaining({ drawingId: 'copy-1', subUnitId: 'copied-sheet' }),
            expect.objectContaining({ drawingId: 'copy-2', groupId: 'copy-1', subUnitId: 'copied-sheet' }),
            expect.objectContaining({ drawingId: 'copy-0', groupId: 'copy-1', subUnitId: 'copied-sheet' }),
        ]);
    });

    it('should manage focus, refresh and visibility notifications', () => {
        const focused: IDrawingParam[][] = [];
        const refreshed: IDrawingParam[][] = [];
        const visibleUpdates: Array<Array<{ drawingId: string; visible: boolean }>> = [];

        const drawing = createDrawing('a');
        const addOp = service.getBatchAddOp([drawing]);
        service.applyJson1(unitId, subUnitId, addOp.redo);

        service.focus$.subscribe((params) => focused.push(params));
        service.refreshTransform$.subscribe((params) => refreshed.push(params));
        service.visible$.subscribe((params) => visibleUpdates.push(params.map(({ drawingId, visible }) => ({ drawingId, visible }))));

        service.focusDrawing([createSearch('a'), createSearch('missing')]);
        expect(focused[0].map((item) => item.drawingId)).toEqual(['a']);
        expect(service.getFocusDrawings().map((item) => item.drawingId)).toEqual(['a']);

        const transformed = createDrawing('a', {
            transform: { left: 1, top: 2 } as NonNullable<IDrawingParam['transform']>,
            transforms: [{ left: 3, top: 4 } as NonNullable<IDrawingParam['transform']>] as NonNullable<IDrawingParam['transforms']>,
            isMultiTransform: BooleanNumber.TRUE,
            behindText: true,
            hidden: true,
        } as Partial<IDrawingParam>);
        service.refreshTransform([transformed]);

        expect(refreshed).toEqual([[transformed]]);
        expect(service.getDrawingByParam(createSearch('a'))).toMatchObject({
            transform: { left: 1, top: 2 },
            transforms: [{ left: 3, top: 4 }],
            isMultiTransform: BooleanNumber.TRUE,
            behindText: true,
            hidden: true,
        });

        service.visibleNotification([{ ...createSearch('a'), visible: false }]);
        expect(visibleUpdates).toEqual([[{ drawingId: 'a', visible: false }]]);

        service.focusDrawing(null);
        expect(focused.at(-1)).toEqual([]);
        expect(service.getFocusDrawings()).toEqual([]);
    });

    it('should update drawing order in all directions', () => {
        service.registerDrawingData(unitId, {
            [subUnitId]: {
                data: {
                    a: createDrawing('a'),
                    b: createDrawing('b'),
                    c: createDrawing('c'),
                },
                order: ['a', 'b', 'c'],
            },
        });

        service.applyJson1(unitId, subUnitId, service.getForwardDrawingsOp({ unitId, subUnitId, drawingIds: ['a'] }).redo);
        expect(service.getDrawingOrder(unitId, subUnitId)).toEqual(['b', 'a', 'c']);

        service.applyJson1(unitId, subUnitId, service.getBackwardDrawingOp({ unitId, subUnitId, drawingIds: ['a'] }).redo);
        expect(service.getDrawingOrder(unitId, subUnitId)).toEqual(['a', 'b', 'c']);

        service.applyJson1(unitId, subUnitId, service.getFrontDrawingsOp({ unitId, subUnitId, drawingIds: ['a'] }).redo);
        expect(service.getDrawingOrder(unitId, subUnitId)).toEqual(['b', 'c', 'a']);

        service.applyJson1(unitId, subUnitId, service.getBackDrawingsOp({ unitId, subUnitId, drawingIds: ['a'] }).redo);
        expect(service.getDrawingOrder(unitId, subUnitId)).toEqual(['a', 'b', 'c']);
    });

    it('should group, ungroup and expose feature notifications and flags', () => {
        const addOp = service.getBatchAddOp([
            createDrawing('child-1'),
            createDrawing('child-2'),
        ]);
        service.applyJson1(unitId, subUnitId, addOp.redo);

        const groupNotifications: IDrawingSearch[][] = [];
        const pluginUpdates: IDrawingParam[][] = [];
        const pluginAdds: IDrawingParam[][] = [];
        const pluginRemoves: IDrawingSearch[][] = [];
        const pluginOrderUpdates: string[][] = [];
        const pluginGroupUpdates: string[][] = [];
        const pluginUngroupUpdates: string[][] = [];

        service.update$.subscribe((params) => groupNotifications.push(params));
        service.featurePluginUpdate$.subscribe((params) => pluginUpdates.push(params));
        service.featurePluginAdd$.subscribe((params) => pluginAdds.push(params));
        service.featurePluginRemove$.subscribe((params) => pluginRemoves.push(params));
        service.featurePluginOrderUpdate$.subscribe((params) => pluginOrderUpdates.push(params.drawingIds));
        service.featurePluginGroupUpdate$.subscribe((params) => pluginGroupUpdates.push(params.map((item) => item.parent.drawingId)));
        service.featurePluginUngroupUpdate$.subscribe((params) => pluginUngroupUpdates.push(params.map((item) => item.parent.drawingId)));

        const groupParent = createDrawing('group', { drawingType: DrawingTypeEnum.DRAWING_GROUP });
        const groupedChildren = [
            createDrawing('child-1', { groupId: 'group' }),
            createDrawing('child-2', { groupId: 'group' }),
        ];
        const groupParams = [{
            parent: groupParent,
            children: groupedChildren,
        }];

        service.applyJson1(unitId, subUnitId, service.getGroupDrawingOp(groupParams).redo);
        expect(service.getDrawingByParam(createSearch('group'))).toMatchObject(groupParent);
        expect(service.getDrawingsByGroup(createSearch('group')).map((item) => item.drawingId).sort()).toEqual(['child-1', 'child-2']);

        const ungroupParams = [{
            parent: groupParent,
            children: [createDrawing('child-1'), createDrawing('child-2')],
        }];
        service.applyJson1(unitId, subUnitId, service.getUngroupDrawingOp(ungroupParams).redo);
        expect(service.getDrawingByParam(createSearch('group'))).toBeUndefined();

        service.updateNotification([createSearch('child-1')]);
        service.featurePluginUpdateNotification([createDrawing('child-1')]);
        service.featurePluginAddNotification([createDrawing('child-2')]);
        service.featurePluginRemoveNotification([createSearch('child-2')]);
        service.featurePluginOrderUpdateNotification({ unitId, subUnitId, drawingIds: ['child-1'], arrangeType: 0 });
        service.featurePluginGroupUpdateNotification(groupParams);
        service.featurePluginUngroupUpdateNotification(ungroupParams);

        expect(groupNotifications).toEqual([[createSearch('child-1')]]);
        expect(pluginUpdates[0].map((item) => item.drawingId)).toEqual(['child-1']);
        expect(pluginAdds[0].map((item) => item.drawingId)).toEqual(['child-2']);
        expect(pluginRemoves).toEqual([[createSearch('child-2')]]);
        expect(pluginOrderUpdates).toEqual([['child-1']]);
        expect(pluginGroupUpdates).toEqual([['group']]);
        expect(pluginUngroupUpdates).toEqual([['group']]);

        expect(service.getDrawingVisible()).toBe(true);
        expect(service.getDrawingEditable()).toBe(true);

        service.setDrawingVisible(false);
        service.setDrawingEditable(false);

        expect(service.getDrawingVisible()).toBe(false);
        expect(service.getDrawingEditable()).toBe(false);

        service.dispose();
        expect(service.drawingManagerData).toEqual({});
    });
});
