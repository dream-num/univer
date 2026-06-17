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

import type { IDrawingParam } from '@univerjs/core';
import type { IDrawingGroupUpdateParam, IDrawingOrderUpdateParam } from '@univerjs/drawing';
import { ArrangeTypeEnum, DrawingTypeEnum, ICommandService, Univer } from '@univerjs/core';
import { DrawingManagerService, IDrawingManagerService } from '@univerjs/drawing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SetDrawingArrangeFrontOperation, SetDrawingArrangeOperation } from '../drawing-arrange.operation';
import { CancelDrawingGroupOperation, SetDrawingGroupOperation } from '../drawing-group.operation';

const unitId = 'drawing-ui-unit';
const subUnitId = 'drawing-ui-subunit';

function createDrawing(drawingId: string, left: number): IDrawingParam {
    return {
        unitId,
        subUnitId,
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        transform: {
            left,
            top: 10,
            width: 20,
            height: 30,
        },
    };
}

describe('drawing arrange and group operations', () => {
    let univer: Univer;
    let commandService: ICommandService;
    let drawingManagerService: IDrawingManagerService;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([IDrawingManagerService, { useClass: DrawingManagerService }]);

        commandService = injector.get(ICommandService);
        commandService.registerCommand(SetDrawingArrangeOperation);
        commandService.registerCommand(SetDrawingArrangeFrontOperation);
        commandService.registerCommand(SetDrawingGroupOperation);
        commandService.registerCommand(CancelDrawingGroupOperation);
        drawingManagerService = injector.get(IDrawingManagerService);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('requests a layer-order change for the selected drawings', async () => {
        const orderUpdates: IDrawingOrderUpdateParam[] = [];
        drawingManagerService.featurePluginOrderUpdate$.subscribe((update) => orderUpdates.push(update));

        const result = await commandService.executeCommand(SetDrawingArrangeOperation.id, {
            arrangeType: ArrangeTypeEnum.front,
            drawings: [createDrawing('image-1', 0), createDrawing('image-2', 30)],
        });

        expect(result).toBe(true);
        expect(orderUpdates).toEqual([{
            unitId,
            subUnitId,
            drawingIds: ['image-1', 'image-2'],
            arrangeType: ArrangeTypeEnum.front,
        }]);
    });

    it('uses the focused drawings when arranging from the front command', async () => {
        drawingManagerService.registerDrawingData(unitId, {
            [subUnitId]: {
                data: {
                    'image-1': createDrawing('image-1', 0),
                    'image-2': createDrawing('image-2', 30),
                },
                order: ['image-1', 'image-2'],
            },
        });
        drawingManagerService.focusDrawing([
            { unitId, subUnitId, drawingId: 'image-1' },
            { unitId, subUnitId, drawingId: 'image-2' },
        ]);
        const orderUpdates: IDrawingOrderUpdateParam[] = [];
        drawingManagerService.featurePluginOrderUpdate$.subscribe((update) => orderUpdates.push(update));

        const result = await commandService.executeCommand(SetDrawingArrangeFrontOperation.id);

        expect(result).toBe(true);
        expect(orderUpdates).toEqual([{
            unitId,
            subUnitId,
            drawingIds: ['image-1', 'image-2'],
            arrangeType: ArrangeTypeEnum.front,
        }]);
    });

    it('groups two selected drawings under a generated group drawing', async () => {
        const groupUpdates: IDrawingGroupUpdateParam[][] = [];
        drawingManagerService.featurePluginGroupUpdate$.subscribe((update) => groupUpdates.push(update));

        const result = await commandService.executeCommand(SetDrawingGroupOperation.id, {
            drawings: [createDrawing('image-1', 0), createDrawing('image-2', 30)],
        });

        expect(result).toBe(true);
        expect(groupUpdates).toHaveLength(1);
        expect(groupUpdates[0]).toHaveLength(1);
        expect(groupUpdates[0][0].parent).toMatchObject({
            unitId,
            subUnitId,
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
        });

        const childIds: string[] = [];
        for (const child of groupUpdates[0][0].children) {
            childIds.push(child.drawingId);
            expect(child.groupId).toBe(groupUpdates[0][0].parent.drawingId);
        }
        expect(childIds).toEqual(['image-1', 'image-2']);
    });

    it('does not create a drawing group from a single selected drawing', async () => {
        const groupUpdates: IDrawingGroupUpdateParam[][] = [];
        drawingManagerService.featurePluginGroupUpdate$.subscribe((update) => groupUpdates.push(update));

        const result = await commandService.executeCommand(SetDrawingGroupOperation.id, {
            drawings: [createDrawing('image-1', 0)],
        });

        expect(result).toBe(false);
        expect(groupUpdates).toEqual([]);
    });

    it('ungroups a focused drawing group and restores children to the sheet layer', async () => {
        drawingManagerService.registerDrawingData(unitId, {
            [subUnitId]: {
                data: {},
                order: ['group', 'image-1', 'image-2'],
            },
        });
        drawingManagerService.setDrawingData(unitId, subUnitId, {
            group: {
                unitId,
                subUnitId,
                drawingId: 'group',
                drawingType: DrawingTypeEnum.DRAWING_GROUP,
                transform: { left: 10, top: 20, width: 100, height: 80 },
                groupBaseBound: { left: 10, top: 20, width: 100, height: 80 },
            },
            'image-1': {
                ...createDrawing('image-1', 0),
                groupId: 'group',
            },
            'image-2': {
                ...createDrawing('image-2', 30),
                groupId: 'group',
            },
        });
        drawingManagerService.focusDrawing([{ unitId, subUnitId, drawingId: 'group' }]);
        const ungroupUpdates: IDrawingGroupUpdateParam[][] = [];
        drawingManagerService.featurePluginUngroupUpdate$.subscribe((update) => ungroupUpdates.push(update));

        const result = await commandService.executeCommand(CancelDrawingGroupOperation.id, {});

        expect(result).toBe(true);
        expect(ungroupUpdates).toHaveLength(1);
        expect(ungroupUpdates[0][0].parent).toMatchObject({
            unitId,
            subUnitId,
            drawingId: 'group',
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
        });

        const childIds: string[] = [];
        for (const child of ungroupUpdates[0][0].children) {
            childIds.push(child.drawingId);
            expect(child.groupId).toBeUndefined();
        }
        expect(childIds).toEqual(['image-1', 'image-2']);
    });

    it('does not ungroup regular drawings', async () => {
        const ungroupUpdates: IDrawingGroupUpdateParam[][] = [];
        drawingManagerService.featurePluginUngroupUpdate$.subscribe((update) => ungroupUpdates.push(update));

        const result = await commandService.executeCommand(CancelDrawingGroupOperation.id, {
            drawings: [createDrawing('image-1', 0), createDrawing('image-2', 30)],
        });

        expect(result).toBe(false);
        expect(ungroupUpdates).toEqual([]);
    });
});
