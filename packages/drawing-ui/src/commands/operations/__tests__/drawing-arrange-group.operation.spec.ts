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

import type { ICommandInfo, IDrawingParam } from '@univerjs/core';
import type { IDrawingGroupUpdateParam, IDrawingOrderUpdateParam } from '@univerjs/drawing';
import { ArrangeTypeEnum, DrawingTypeEnum, ICommandService, Univer } from '@univerjs/core';
import { DrawingManagerService, IDrawingManagerService } from '@univerjs/drawing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { resolveDrawingUIRotateEnabled } from '../../../utils/rotate-enabled';
import {
    AlignType,
    SetDrawingAlignBottomOperation,
    SetDrawingAlignCenterOperation,
    SetDrawingAlignHorizonOperation,
    SetDrawingAlignLeftOperation,
    SetDrawingAlignMiddleOperation,
    SetDrawingAlignOperation,
    SetDrawingAlignRightOperation,
    SetDrawingAlignTopOperation,
    SetDrawingAlignVerticalOperation,
} from '../drawing-align.operation';
import {
    SetDrawingArrangeBackOperation,
    SetDrawingArrangeBackwardOperation,
    SetDrawingArrangeForwardOperation,
    SetDrawingArrangeFrontOperation,
    SetDrawingArrangeOperation,
} from '../drawing-arrange.operation';
import { CancelDrawingGroupOperation, SetDrawingGroupOperation } from '../drawing-group.operation';
import { AutoImageCropOperation, CloseImageCropOperation, CropType, OpenImageCropOperation } from '../image-crop.operation';
import { ImageResetSizeOperation } from '../image-reset-size.operation';

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

function createChartDrawing(drawingId: string, left: number): IDrawingParam {
    return {
        ...createDrawing(drawingId, left),
        drawingType: DrawingTypeEnum.DRAWING_CHART,
    };
}

function createGroupDrawing(drawingId: string, left: number, rotateEnabled?: boolean): IDrawingParam {
    return {
        ...createDrawing(drawingId, left),
        drawingType: DrawingTypeEnum.DRAWING_GROUP,
        transform: {
            left,
            top: 10,
            width: 20,
            height: 30,
            rotateEnabled,
        },
    };
}

function expectNoPersistedRotateEnabled(drawing: IDrawingParam): void {
    expect(Object.prototype.hasOwnProperty.call(drawing.transform ?? {}, 'rotateEnabled')).toBe(false);
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
        commandService.registerCommand(SetDrawingArrangeForwardOperation);
        commandService.registerCommand(SetDrawingArrangeBackOperation);
        commandService.registerCommand(SetDrawingArrangeBackwardOperation);
        commandService.registerCommand(SetDrawingGroupOperation);
        commandService.registerCommand(CancelDrawingGroupOperation);
        commandService.registerCommand(SetDrawingAlignOperation);
        commandService.registerCommand(SetDrawingAlignLeftOperation);
        commandService.registerCommand(SetDrawingAlignCenterOperation);
        commandService.registerCommand(SetDrawingAlignRightOperation);
        commandService.registerCommand(SetDrawingAlignTopOperation);
        commandService.registerCommand(SetDrawingAlignMiddleOperation);
        commandService.registerCommand(SetDrawingAlignBottomOperation);
        commandService.registerCommand(SetDrawingAlignHorizonOperation);
        commandService.registerCommand(SetDrawingAlignVerticalOperation);
        commandService.registerCommand(OpenImageCropOperation);
        commandService.registerCommand(CloseImageCropOperation);
        commandService.registerCommand(AutoImageCropOperation);
        commandService.registerCommand(ImageResetSizeOperation);
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

    it('uses focused drawings for forward, backward and back layer commands', async () => {
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

        expect(await commandService.executeCommand(SetDrawingArrangeForwardOperation.id)).toBe(true);
        expect(await commandService.executeCommand(SetDrawingArrangeBackwardOperation.id)).toBe(true);
        expect(await commandService.executeCommand(SetDrawingArrangeBackOperation.id)).toBe(true);

        const arrangeTypes: ArrangeTypeEnum[] = [];
        for (const update of orderUpdates) {
            arrangeTypes.push(update.arrangeType as ArrangeTypeEnum);
            expect(update).toMatchObject({
                unitId,
                subUnitId,
                drawingIds: ['image-1', 'image-2'],
            });
        }
        expect(arrangeTypes).toEqual([
            ArrangeTypeEnum.forward,
            ArrangeTypeEnum.backward,
            ArrangeTypeEnum.back,
        ]);
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
        expectNoPersistedRotateEnabled(groupUpdates[0][0].parent);
        expect(resolveDrawingUIRotateEnabled(groupUpdates[0][0].parent, {
            getChildren: (drawing) => drawing.drawingId === groupUpdates[0][0].parent.drawingId
                ? groupUpdates[0][0].children
                : drawingManagerService.getDrawingsByGroup(drawing),
        })).toBe(true);

        const childIds: string[] = [];
        for (const child of groupUpdates[0][0].children) {
            childIds.push(child.drawingId);
            expect(child.groupId).toBe(groupUpdates[0][0].parent.drawingId);
        }
        expect(childIds).toEqual(['image-1', 'image-2']);
    });

    it('groups chart drawings with regular drawings', async () => {
        const groupUpdates: IDrawingGroupUpdateParam[][] = [];
        drawingManagerService.featurePluginGroupUpdate$.subscribe((update) => groupUpdates.push(update));

        const result = await commandService.executeCommand(SetDrawingGroupOperation.id, {
            drawings: [createChartDrawing('chart-1', 0), createDrawing('image-1', 30)],
        });

        expect(result).toBe(true);
        expect(groupUpdates).toHaveLength(1);
        expectNoPersistedRotateEnabled(groupUpdates[0][0].parent);
        expect(resolveDrawingUIRotateEnabled(groupUpdates[0][0].parent, {
            getChildren: (drawing) => drawing.drawingId === groupUpdates[0][0].parent.drawingId
                ? groupUpdates[0][0].children
                : drawingManagerService.getDrawingsByGroup(drawing),
        })).toBe(false);
        expect(groupUpdates[0][0].children.map((child) => child.drawingId)).toEqual(['chart-1', 'image-1']);
        expect(groupUpdates[0][0].children[0]).toMatchObject({
            drawingId: 'chart-1',
            drawingType: DrawingTypeEnum.DRAWING_CHART,
            groupId: groupUpdates[0][0].parent.drawingId,
        });
    });

    it('recomputes nested group rotate capability from current descendants', async () => {
        drawingManagerService.registerDrawingData(unitId, {
            [subUnitId]: {
                data: {
                    staleGroup: {
                        ...createGroupDrawing('staleGroup', 0, false),
                    },
                    'nested-child': {
                        ...createDrawing('nested-child', 10),
                        groupId: 'staleGroup',
                    },
                },
                order: ['staleGroup', 'nested-child'],
            },
        });
        const groupUpdates: IDrawingGroupUpdateParam[][] = [];
        drawingManagerService.featurePluginGroupUpdate$.subscribe((update) => groupUpdates.push(update));

        const result = await commandService.executeCommand(SetDrawingGroupOperation.id, {
            drawings: [createGroupDrawing('staleGroup', 0, false), createDrawing('image-1', 30)],
        });

        expect(result).toBe(true);
        expectNoPersistedRotateEnabled(groupUpdates[0][0].parent);
        expect(resolveDrawingUIRotateEnabled(groupUpdates[0][0].parent, {
            getChildren: (drawing) => drawing.drawingId === groupUpdates[0][0].parent.drawingId
                ? groupUpdates[0][0].children
                : drawingManagerService.getDrawingsByGroup(drawing),
        })).toBe(true);
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

    it('translates drawing alignment menu actions into concrete alignment operations', async () => {
        const executedCommands: ICommandInfo[] = [];
        commandService.onCommandExecuted((command) => executedCommands.push(command));

        expect(await commandService.executeCommand(SetDrawingAlignLeftOperation.id)).toBe(true);
        expect(await commandService.executeCommand(SetDrawingAlignCenterOperation.id)).toBe(true);
        expect(await commandService.executeCommand(SetDrawingAlignRightOperation.id)).toBe(true);
        expect(await commandService.executeCommand(SetDrawingAlignTopOperation.id)).toBe(true);
        expect(await commandService.executeCommand(SetDrawingAlignMiddleOperation.id)).toBe(true);
        expect(await commandService.executeCommand(SetDrawingAlignBottomOperation.id)).toBe(true);
        expect(await commandService.executeCommand(SetDrawingAlignHorizonOperation.id)).toBe(true);
        expect(await commandService.executeCommand(SetDrawingAlignVerticalOperation.id)).toBe(true);

        const alignTypes: AlignType[] = [];
        for (const command of executedCommands) {
            if (command.id === SetDrawingAlignOperation.id) {
                alignTypes.push((command.params as { alignType: AlignType }).alignType);
            }
        }

        expect(alignTypes).toEqual([
            AlignType.left,
            AlignType.center,
            AlignType.right,
            AlignType.top,
            AlignType.middle,
            AlignType.bottom,
            AlignType.horizon,
            AlignType.vertical,
        ]);
    });

    it('publishes image crop lifecycle operations with the target drawing and crop mode', async () => {
        const executedCommands: ICommandInfo[] = [];
        commandService.onCommandExecuted((command) => executedCommands.push(command));
        const targetDrawing = { unitId, subUnitId, drawingId: 'image-1' };

        expect(await commandService.executeCommand(OpenImageCropOperation.id, targetDrawing)).toBe(true);
        expect(await commandService.executeCommand(AutoImageCropOperation.id, { cropType: CropType.R16_9 })).toBe(true);
        expect(await commandService.executeCommand(CloseImageCropOperation.id, { isAuto: true })).toBe(true);

        expect(executedCommands).toEqual([
            {
                id: OpenImageCropOperation.id,
                type: OpenImageCropOperation.type,
                params: targetDrawing,
            },
            {
                id: AutoImageCropOperation.id,
                type: AutoImageCropOperation.type,
                params: { cropType: CropType.R16_9 },
            },
            {
                id: CloseImageCropOperation.id,
                type: CloseImageCropOperation.type,
                params: { isAuto: true },
            },
        ]);
    });

    it('publishes image reset-size operation for selected image drawings', async () => {
        const executedCommands: ICommandInfo[] = [];
        commandService.onCommandExecuted((command) => executedCommands.push(command));
        const selectedImages = [
            { unitId, subUnitId, drawingId: 'image-1' },
            { unitId, subUnitId, drawingId: 'image-2' },
        ];

        expect(await commandService.executeCommand(ImageResetSizeOperation.id, selectedImages)).toBe(true);

        expect(executedCommands).toEqual([{
            id: ImageResetSizeOperation.id,
            type: ImageResetSizeOperation.type,
            params: selectedImages,
        }]);
    });
});
