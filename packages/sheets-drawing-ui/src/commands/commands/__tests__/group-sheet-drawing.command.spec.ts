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

import { DrawingTypeEnum } from '@univerjs/core';
import { getDrawingShapeKeyByDrawingSearch, IDrawingManagerService } from '@univerjs/drawing';
import { insertGroupObject } from '@univerjs/drawing-ui';
import { DrawingGroupObject, Engine, Image, MAIN_VIEW_PORT_KEY, Rect, Scene, Vector2, Viewport } from '@univerjs/engine-render';
import { ISheetDrawingService } from '@univerjs/sheets-drawing';
import { describe, expect, it, vi } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../../__tests__/create-sheets-drawing-ui-test-bed';
import { GroupSheetDrawingCommand } from '../group-sheet-drawing.command';
import { UngroupSheetDrawingCommand } from '../ungroup-sheet-drawing.command';
import { createSheetDrawing, insertDrawings } from './drawing-command-test-utils';

describe('GroupSheetDrawingCommand', () => {
    it.each([[false, false], [true, false], [false, true], [true, true]])('restores sheet group picking and stacking with flips %s/%s', async (flipX, flipY) => {
        const contextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            return { canvas: this, setTransform: vi.fn(), clearRect: vi.fn() } as unknown as CanvasRenderingContext2D;
        });
        const testBed = createSheetsDrawingUiTestBed();
        const engine = new Engine('group-engine', { elementWidth: 800, elementHeight: 500, dpr: 1 });
        const scene = new Scene('group-scene', engine);
        const viewport = new Viewport(MAIN_VIEW_PORT_KEY, scene, { left: 0, top: 0, width: 800, height: 500, active: true });
        try {
            testBed.commandService.registerCommand(GroupSheetDrawingCommand);
            const children = [createSheetDrawing('child-1', 0, 0), createSheetDrawing('child-2', 100, 80)];
            await insertDrawings(testBed, [createSheetDrawing('background', 0, 0), ...children]);
            const parent = {
                unitId: testBed.unitId,
                subUnitId: testBed.subUnitId,
                drawingId: 'group-1',
                drawingType: DrawingTypeEnum.DRAWING_GROUP,
                transform: { left: 100, top: 100, width: 200, height: 160, flipX, flipY },
                groupBaseBound: { left: 0, top: 0, width: 200, height: 160 },
            };
            expect(await testBed.commandService.executeCommand(GroupSheetDrawingCommand.id, [{
                parent,
                children: children.map((child) => ({ ...child, groupId: parent.drawingId })),
            }])).toBe(true);
            const manager = testBed.get(IDrawingManagerService);
            for (const child of children) {
                const object = new Image(getDrawingShapeKeyByDrawingSearch(child), { ...child.transform });
                scene.addObject(object, 7);
                insertGroupObject(parent, object, scene, manager);
            }
            const group = scene.getObjectIncludeInGroup(getDrawingShapeKeyByDrawingSearch(parent)) as DrawingGroupObject;
            expect(group).toBeInstanceOf(DrawingGroupObject);
            expect(group.getObjects()).toHaveLength(2);
            expect(group.layer?.zIndex).toBe(7);
            expect(group.zIndex).toBe(manager.getDrawingOrder(parent.unitId, parent.subUnitId).indexOf(parent.drawingId));
            const point = new Vector2(flipX ? 275 : 125, flipY ? 240 : 120);
            expect(scene.pick(point)).toBe(group);
            const overlay = new Rect('overlay', { left: 100, top: 100, width: 200, height: 160, fill: '#993333' });
            overlay.zIndex = group.zIndex + 1;
            scene.addObject(overlay, 7);
            expect(scene.pick(point)).toBe(overlay);
            overlay.zIndex = group.zIndex - 1;
            expect(scene.pick(point)).toBe(group);
            if (flipX !== flipY) {
                expect(group.isHit(new Vector2(125, 120))).toBe(false);
            }
        } finally {
            viewport.dispose();
            scene.dispose();
            engine.dispose();
            testBed.univer.dispose();
            contextSpy.mockRestore();
        }
    });

    it('groups two drawings and then ungroups them back to standalone drawings', async () => {
        const testBed = createSheetsDrawingUiTestBed();
        const sheetDrawingService = testBed.get(ISheetDrawingService);
        testBed.commandService.registerCommand(GroupSheetDrawingCommand);
        testBed.commandService.registerCommand(UngroupSheetDrawingCommand);
        await insertDrawings(testBed, [
            createSheetDrawing('child-1', 10, 20),
            createSheetDrawing('child-2', 40, 60),
        ]);

        const parent = {
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'group-1',
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
            transform: { left: 0, top: 0, width: 140, height: 120 },
            groupBaseBound: { left: 0, top: 0, width: 140, height: 120 },
        };
        const groupedChildren = [
            {
                ...createSheetDrawing('child-1', 10, 20),
                groupId: 'group-1',
            },
            {
                ...createSheetDrawing('child-2', 40, 60),
                groupId: 'group-1',
            },
        ];

        expect(await testBed.commandService.executeCommand(GroupSheetDrawingCommand.id, [{
            parent,
            children: groupedChildren,
        }])).toBe(true);
        expect(sheetDrawingService.getDrawingByParam({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'group-1',
        })).toMatchObject({
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
        });
        expect(sheetDrawingService.getDrawingByParam({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'child-1',
        })).toMatchObject({
            groupId: 'group-1',
        });

        const ungroupedChildren = [
            {
                ...createSheetDrawing('child-1', 10, 20),
                groupId: undefined,
            },
            {
                ...createSheetDrawing('child-2', 40, 60),
                groupId: undefined,
            },
        ];
        expect(await testBed.commandService.executeCommand(UngroupSheetDrawingCommand.id, [{
            parent,
            children: ungroupedChildren,
        }])).toBe(true);

        expect(sheetDrawingService.getDrawingByParam({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'group-1',
        })).toBeUndefined();
        expect(sheetDrawingService.getDrawingByParam({
            unitId: testBed.unitId,
            subUnitId: testBed.subUnitId,
            drawingId: 'child-1',
        })?.groupId).toBeUndefined();

        testBed.univer.dispose();
    });
});
