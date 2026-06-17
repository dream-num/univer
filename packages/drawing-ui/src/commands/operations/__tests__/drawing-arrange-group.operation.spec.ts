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
import { SetDrawingArrangeOperation } from '../drawing-arrange.operation';
import { SetDrawingGroupOperation } from '../drawing-group.operation';

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
        commandService.registerCommand(SetDrawingGroupOperation);
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
});
