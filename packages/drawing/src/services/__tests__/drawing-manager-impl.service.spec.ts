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
import { BooleanNumber, DrawingTypeEnum } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
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
        service = new UnitDrawingService<IDrawingParam>();
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
        });
        service.refreshTransform([transformed]);

        expect(refreshed).toEqual([[transformed]]);
        expect(service.getDrawingByParam(createSearch('a'))).toMatchObject({
            transform: { left: 1, top: 2 },
            transforms: [{ left: 3, top: 4 }],
            isMultiTransform: BooleanNumber.TRUE,
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
