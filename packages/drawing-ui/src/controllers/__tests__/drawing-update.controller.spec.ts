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

import type { ICommandInfo } from '@univerjs/core';
import type { IDrawingGroupUpdateParam } from '@univerjs/drawing';
import { DrawingTypeEnum, UniverInstanceType } from '@univerjs/core';
import { getDrawingShapeKeyByDrawingSearch, SetDrawingSelectedOperation } from '@univerjs/drawing';
import { DRAWING_OBJECT_LAYER_INDEX, Rect } from '@univerjs/engine-render';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AlignType, SetDrawingAlignOperation } from '../../commands/operations/drawing-align.operation';
import { DOC_DRAWING_BEHIND_TEXT_LAYER_INDEX } from '../../services/drawing-render.service';
import { DrawingUpdateController } from '../drawing-update.controller';

interface IDrawingNotification {
    unitId: string;
    subUnitId: string;
    drawingId: string;
    behindText?: boolean;
    hidden?: boolean;
}

interface IDrawingTransformObject {
    oKey: string;
    left: number;
    top: number;
    width: number;
    height: number;
    angle: number;
    isInGroup?: boolean;
}

function createHarness() {
    const add$ = new Subject<IDrawingNotification[]>();
    const remove$ = new Subject<IDrawingNotification[]>();
    const update$ = new Subject<IDrawingNotification[]>();
    const refreshTransform$ = new Subject<IDrawingNotification[]>();
    const visible$ = new Subject<Array<IDrawingNotification & { visible: boolean }>>();
    const order$ = new Subject<{ unitId: string; subUnitId: string; drawingIds: string[] }>();
    const group$ = new Subject<IDrawingGroupUpdateParam[]>();
    const ungroup$ = new Subject<IDrawingGroupUpdateParam[]>();

    const changeStart$ = new Subject<{ objects: Map<string, IDrawingTransformObject> }>();
    const changeEnd$ = new Subject<{ objects: Map<string, IDrawingTransformObject> }>();
    const transformer = {
        changeStart$,
        changeEnd$,
        clearSelectedObjects: vi.fn(),
        setSelectedControl: vi.fn(),
        refreshControls: vi.fn(() => ({ changeNotification: vi.fn() })),
    };

    const debounceRefreshControls = vi.fn();
    const sceneTransformer = {
        debounceRefreshControls,
        clearSelectedObjects: vi.fn(),
    };

    const zIndexShape = { setProps: vi.fn(), makeDirty: vi.fn() };
    const disposeShape = { dispose: vi.fn() };
    const showHideShape = { show: vi.fn(), hide: vi.fn() };
    const transformShape = { layer: { zIndex: DRAWING_OBJECT_LAYER_INDEX }, transformByState: vi.fn(), setClipBounds: vi.fn(), show: vi.fn(), hide: vi.fn() };
    const getSceneObject = vi.fn((key: string) => {
        if (key === 'unit-1#-#sheet-1#-#drawing-visible') return showHideShape;
        if (key === 'unit-1#-#sheet-1#-#drawing-transform') return transformShape;
        if (key === 'unit-1#-#sheet-1#-#drawing-transform-refresh-hidden') return transformShape;
        if (key === 'unit-1#-#sheet-1#-#drawing-remove') return disposeShape;
        return null;
    });

    const scene = {
        getTransformerByCreate: vi.fn(() => transformer),
        getTransformer: vi.fn(() => sceneTransformer),
        getObject: getSceneObject,
        getObjectIncludeInGroup: vi.fn(getSceneObject),
        fuzzyMathObjects: vi.fn((key: string) => {
            if (key.includes('drawing-z')) return [zIndexShape];
            if (key.includes('drawing-remove')) return [disposeShape];
            return [];
        }),
        addObject: vi.fn((_object: any, _layerIndex?: number) => ({ attachTransformerTo: vi.fn() })),
        addObjects: vi.fn(),
        removeObject: vi.fn(),
        makeDirty: vi.fn(),
    };

    const renderManagerService = {
        getRenderById: vi.fn(() => ({ scene })),
    };

    const drawingParams = new Map<string, { unitId: string; subUnitId: string; drawingId: string; drawingType: DrawingTypeEnum; behindText?: boolean; hidden?: boolean; transform: { left: number; top: number; width: number; height: number; angle: number; clipBounds?: { left: number; top: number; width: number; height: number } } }>([
        ['drawing-a', { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-a', drawingType: DrawingTypeEnum.DRAWING_IMAGE, transform: { left: 0, top: 0, width: 10, height: 10, angle: 0 } }],
        ['drawing-b', { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-b', drawingType: DrawingTypeEnum.DRAWING_IMAGE, transform: { left: 20, top: 0, width: 10, height: 10, angle: 0 } }],
        ['chart-1', { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'chart-1', drawingType: DrawingTypeEnum.DRAWING_CHART, transform: { left: 40, top: 0, width: 20, height: 10, angle: 0 } }],
        ['drawing-transform', { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-transform', drawingType: DrawingTypeEnum.DRAWING_IMAGE, behindText: true, hidden: true, transform: { left: 1, top: 2, width: 3, height: 4, angle: 0, clipBounds: { left: 0, top: 0, width: 80, height: 120 } } }],
        ['drawing-transform-in-group', { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-transform-in-group', drawingType: DrawingTypeEnum.DRAWING_IMAGE, transform: { left: 8, top: 9, width: 10, height: 11, angle: 0 } }],
        ['drawing-transform-refresh-hidden', { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-transform-refresh-hidden', drawingType: DrawingTypeEnum.DRAWING_IMAGE, transform: { left: 1, top: 2, width: 3, height: 4, angle: 0, clipBounds: { left: 0, top: 0, width: 80, height: 120 } } }],
        ['drawing-refresh-missing', { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-refresh-missing', drawingType: DrawingTypeEnum.DRAWING_IMAGE, transform: { left: 4, top: 5, width: 6, height: 7, angle: 0 } }],
    ]);

    const drawingManagerService = {
        drawingManagerData: {},
        add$,
        remove$,
        update$,
        refreshTransform$,
        visible$,
        order$,
        group$,
        ungroup$,
        getDrawingByParam: vi.fn(({ drawingId }: { drawingId: string }) => drawingParams.get(drawingId) ?? null),
        getDrawingOKey: vi.fn((oKey: string) => ({ unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: oKey, drawingType: DrawingTypeEnum.DRAWING_IMAGE, transform: { left: 0, top: 0, width: 10, height: 10, angle: 0 } })),
        getDrawingOrder: vi.fn(() => ['drawing-z']),
        getFocusDrawings: vi.fn(() => [
            { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-a', drawingType: DrawingTypeEnum.DRAWING_IMAGE },
            { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-b', drawingType: DrawingTypeEnum.DRAWING_IMAGE },
        ]),
        addNotification: vi.fn(),
        featurePluginUpdateNotification: vi.fn(),
    };

    let commandExecuted: ((cmd: ICommandInfo) => void) | undefined;
    const commandService = {
        onCommandExecuted: vi.fn((handler: (cmd: ICommandInfo) => void) => {
            commandExecuted = handler;
            return { dispose: vi.fn() };
        }),
        syncExecuteCommand: vi.fn(),
    };

    const controller = new DrawingUpdateController(
        {
            getFocusedUnit: vi.fn(() => ({
                type: UniverInstanceType.UNIVER_SHEET,
                getUnitId: () => 'unit-1',
                getActiveSheet: () => ({ getSheetId: () => 'sheet-1' }),
            })),
        } as never,
        commandService as never,
        renderManagerService as never,
        drawingManagerService as never
    );

    return {
        controller,
        add$,
        changeStart$,
        changeEnd$,
        commandExecuted: () => commandExecuted,
        drawingManagerService,
        group$,
        order$,
        refreshTransform$,
        remove$,
        scene,
        showHideShape,
        transformShape,
        update$,
        visible$,
        zIndexShape,
        disposeShape,
        debounceRefreshControls,
        transformer,
        commandService,
    };
}

describe('DrawingUpdateController', () => {
    it('syncs selection on transform start and persists transform changes on end', () => {
        const harness = createHarness();

        harness.add$.next([{ unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-a' }]);

        const oKey = 'drawing-a';
        const startObject = { oKey, left: 0, top: 0, width: 10, height: 10, angle: 0, isInGroup: false };
        harness.changeStart$.next({ objects: new Map([[oKey, startObject]]) });

        expect(harness.commandService.syncExecuteCommand).toHaveBeenCalledWith(SetDrawingSelectedOperation.id, [
            { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-a' },
        ]);

        const endObject = { ...startObject, left: 5 };
        harness.changeEnd$.next({ objects: new Map([[oKey, endObject]]) });

        expect(harness.drawingManagerService.featurePluginUpdateNotification).toHaveBeenCalledWith([
            expect.objectContaining({ drawingId: 'drawing-a', transform: expect.objectContaining({ left: 5 }) }),
        ]);

        harness.controller.dispose();
    });

    it('applies drawing alignment changes for focused drawings', () => {
        const harness = createHarness();

        harness.add$.next([{ unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-a' }]);

        harness.commandExecuted()?.({ id: SetDrawingAlignOperation.id, params: { alignType: AlignType.left } });

        expect(harness.drawingManagerService.featurePluginUpdateNotification).toHaveBeenCalledWith([
            expect.objectContaining({ drawingId: 'drawing-b', transform: { left: 0, top: 0 } }),
        ]);

        harness.controller.dispose();
    });

    it('updates zIndex, transforms, visibility, and disposes removed shapes', () => {
        const harness = createHarness();

        harness.order$.next({ unitId: 'unit-1', subUnitId: 'sheet-1', drawingIds: ['drawing-z'] });
        expect(harness.zIndexShape.setProps).toHaveBeenCalledWith({ zIndex: 0 });
        expect(harness.zIndexShape.makeDirty).toHaveBeenCalledTimes(1);

        const drawingId = 'drawing-transform';
        harness.update$.next([{ unitId: 'unit-1', subUnitId: 'sheet-1', drawingId }]);
        expect(harness.transformShape.transformByState).toHaveBeenCalled();
        expect(harness.transformShape.hide).toHaveBeenCalledTimes(1);
        expect(harness.debounceRefreshControls).toHaveBeenCalledTimes(1);

        harness.refreshTransform$.next([{ unitId: 'unit-1', subUnitId: 'sheet-1', drawingId }]);
        expect(harness.transformShape.transformByState).toHaveBeenCalledTimes(2);
        expect(harness.transformShape.setClipBounds).toHaveBeenCalledWith({ left: 0, top: 0, width: 80, height: 120 });
        expect(harness.transformShape.hide).toHaveBeenCalledTimes(2);
        expect(harness.scene.removeObject).toHaveBeenCalledWith(harness.transformShape);
        expect(harness.scene.addObject).toHaveBeenCalledWith(harness.transformShape, DOC_DRAWING_BEHIND_TEXT_LAYER_INDEX);

        harness.visible$.next([{ unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-visible', visible: false }]);
        expect(harness.showHideShape.hide).toHaveBeenCalledTimes(1);

        harness.visible$.next([{ unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-visible', visible: true }]);
        expect(harness.showHideShape.show).toHaveBeenCalledTimes(1);

        harness.remove$.next([{ unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-remove' }]);
        expect(harness.disposeShape.dispose).toHaveBeenCalledTimes(1);

        harness.controller.dispose();
    });

    it('disposes grouped drawing children through grouped scene lookup on remove notifications', () => {
        const harness = createHarness();
        const groupedShape = { dispose: vi.fn() };
        const drawingId = 'drawing-remove-in-group';
        const drawingShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId: 'unit-1', subUnitId: 'sheet-1', drawingId });

        harness.scene.getObjectIncludeInGroup.mockImplementation((key: string) => {
            if (key === drawingShapeKey) {
                return groupedShape;
            }
            return null;
        });
        harness.scene.fuzzyMathObjects.mockClear();

        harness.remove$.next([{ unitId: 'unit-1', subUnitId: 'sheet-1', drawingId }]);

        expect(groupedShape.dispose).toHaveBeenCalledTimes(1);
        expect(harness.scene.getTransformer().clearSelectedObjects).toHaveBeenCalledTimes(1);
        expect(harness.scene.fuzzyMathObjects).not.toHaveBeenCalled();

        harness.controller.dispose();
    });

    it('requests drawing insertion when a refreshed transform belongs to a missing scene object', () => {
        const harness = createHarness();

        harness.refreshTransform$.next([{ unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-refresh-missing' }]);

        expect(harness.drawingManagerService.addNotification).toHaveBeenCalledTimes(1);
        expect(harness.drawingManagerService.addNotification).toHaveBeenCalledWith([
            { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-refresh-missing' },
        ]);

        harness.controller.dispose();
    });

    it('refreshes drawing transforms for objects inside groups without requesting insertion', () => {
        const harness = createHarness();
        const groupedShape = { transformByState: vi.fn(), setClipBounds: vi.fn(), show: vi.fn(), hide: vi.fn(), layer: { zIndex: DRAWING_OBJECT_LAYER_INDEX } };
        const drawingId = 'drawing-transform-in-group';
        const drawingShapeKey = getDrawingShapeKeyByDrawingSearch({ unitId: 'unit-1', subUnitId: 'sheet-1', drawingId });

        harness.scene.getObjectIncludeInGroup.mockImplementation((key: string) => {
            if (key === drawingShapeKey) {
                return groupedShape;
            }
            return null;
        });

        harness.refreshTransform$.next([{ unitId: 'unit-1', subUnitId: 'sheet-1', drawingId }]);

        expect(groupedShape.transformByState).toHaveBeenCalledWith({
            left: 8,
            top: 9,
            width: 10,
            height: 11,
            angle: 0,
            flipX: false,
            flipY: false,
            skewX: 0,
            skewY: 0,
        });
        expect(harness.drawingManagerService.addNotification).not.toHaveBeenCalled();

        harness.controller.dispose();
    });

    it('groups existing chart render objects from the scene', () => {
        const harness = createHarness();
        const unitId = 'unit-1';
        const subUnitId = 'sheet-1';
        const imageKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId: 'drawing-a' });
        const chartKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId: 'chart-1' });
        const groupKey = getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId: 'group-1' });
        const imageRect = new Rect(imageKey, { left: 0, top: 0, width: 10, height: 10 });
        const chartRect = new Rect(chartKey, { left: 40, top: 0, width: 20, height: 10 });
        const imageTransformSpy = vi.spyOn(imageRect, 'transformByState');
        const chartTransformSpy = vi.spyOn(chartRect, 'transformByState');
        let createdGroup: { oKey: string; getObjects: () => unknown[]; transformerConfig?: { rotateEnabled?: boolean }; angle?: number } | undefined;

        harness.scene.getObjectIncludeInGroup.mockImplementation((key: string) => {
            if (key === imageKey) {
                return imageRect;
            }
            if (key === chartKey) {
                return chartRect;
            }
            return null;
        });
        harness.scene.addObject.mockImplementation((object: { oKey: string; getObjects?: () => unknown[] }) => {
            if (object.oKey === groupKey && object.getObjects) {
                createdGroup = object as { oKey: string; getObjects: () => unknown[]; transformerConfig?: { rotateEnabled?: boolean }; angle?: number };
            }
            return { attachTransformerTo: vi.fn() };
        });

        harness.group$.next([{
            parent: {
                unitId,
                subUnitId,
                drawingId: 'group-1',
                drawingType: DrawingTypeEnum.DRAWING_GROUP,
                transform: { left: 0, top: 0, width: 60, height: 10, angle: 30 },
                groupBaseBound: { left: 0, top: 0, width: 60, height: 10 },
            },
            children: [
                { unitId, subUnitId, drawingId: 'drawing-a', drawingType: DrawingTypeEnum.DRAWING_IMAGE, transform: { left: 0, top: 0, width: 10, height: 10, angle: 0 }, groupId: 'group-1' },
                { unitId, subUnitId, drawingId: 'chart-1', drawingType: DrawingTypeEnum.DRAWING_CHART, transform: { left: 40, top: 0, width: 20, height: 10, angle: 0 }, groupId: 'group-1' },
            ],
        }]);

        expect(createdGroup?.oKey).toBe(groupKey);
        expect(createdGroup?.getObjects()).toEqual([imageRect, chartRect]);
        expect(createdGroup?.transformerConfig?.rotateEnabled).toBe(false);
        expect(createdGroup?.angle).toBe(30);
        expect(imageRect.isInGroup).toBe(true);
        expect(chartRect.isInGroup).toBe(true);
        expect(imageRect.groupKey).toBe(groupKey);
        expect(chartRect.groupKey).toBe(groupKey);
        expect(imageTransformSpy).toHaveBeenCalledWith({ left: 0, top: 0, width: 10, height: 10, angle: 0 });
        expect(chartTransformSpy).toHaveBeenCalledWith({ left: 40, top: 0, width: 20, height: 10, angle: 0 });
        expect(harness.transformer.clearSelectedObjects).toHaveBeenCalledTimes(1);
        expect(harness.transformer.setSelectedControl).toHaveBeenCalledWith(createdGroup);

        harness.controller.dispose();
    });

    it('uses refresh metadata to hide stale drawings without re-adding missing hidden shapes', () => {
        const harness = createHarness();

        harness.refreshTransform$.next([{
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'drawing-transform-refresh-hidden',
            behindText: true,
            hidden: true,
        }]);

        expect(harness.transformShape.hide).toHaveBeenCalledTimes(1);
        expect(harness.scene.removeObject).toHaveBeenCalledWith(harness.transformShape);
        expect(harness.scene.addObject).toHaveBeenCalledWith(harness.transformShape, DOC_DRAWING_BEHIND_TEXT_LAYER_INDEX);

        harness.refreshTransform$.next([{
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'drawing-refresh-missing',
            hidden: true,
        }]);

        expect(harness.drawingManagerService.addNotification).not.toHaveBeenCalled();

        harness.controller.dispose();
    });
});
