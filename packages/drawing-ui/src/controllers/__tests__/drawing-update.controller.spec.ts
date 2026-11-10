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
import { BooleanNumber, DrawingTypeEnum, Univer, UniverInstanceType } from '@univerjs/core';
import {
    DrawingManagerService,
    getDrawingShapeKeyByDrawingSearch,
    IDrawingManagerService,
    SetDrawingSelectedOperation,
} from '@univerjs/drawing';
import {
    CanvasColorService,
    DRAWING_OBJECT_LAYER_INDEX,
    DrawingGroupObject,
    Group,
    ICanvasColorService,
    IRenderManagerService,
    Rect,
    RenderManagerService,
} from '@univerjs/engine-render';
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
    selectable?: boolean;
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
        clearControlByIds: vi.fn(),
    };

    const zIndexShape = { zIndex: 5, makeDirty: vi.fn() };
    const disposeShape = { dispose: vi.fn() };
    const showHideShape = { show: vi.fn(), hide: vi.fn() };
    const transformShape = { layer: { zIndex: DRAWING_OBJECT_LAYER_INDEX }, transformByState: vi.fn(), setClipBounds: vi.fn(), show: vi.fn(), hide: vi.fn() };
    const hiddenTransformShape = { layer: { zIndex: DRAWING_OBJECT_LAYER_INDEX }, transformByState: vi.fn(), setClipBounds: vi.fn(), show: vi.fn(), hide: vi.fn() };
    const selectableShape = { oKey: 'unit-1#-#sheet-1#-#drawing-selectable', evented: true, layer: { zIndex: DRAWING_OBJECT_LAYER_INDEX }, transformByState: vi.fn(), setClipBounds: vi.fn(), show: vi.fn(), hide: vi.fn() };
    const eventlessShape = { oKey: 'unit-1#-#sheet-1#-#drawing-eventless', evented: false, layer: { zIndex: DRAWING_OBJECT_LAYER_INDEX }, transformByState: vi.fn(), setClipBounds: vi.fn(), show: vi.fn(), hide: vi.fn() };
    const getSceneObject = vi.fn((key: string): unknown => {
        if (key === 'unit-1#-#sheet-1#-#drawing-visible') return showHideShape;
        if (key === 'unit-1#-#sheet-1#-#drawing-transform') return transformShape;
        if (key === 'unit-1#-#sheet-1#-#drawing-transform-refresh-hidden') return transformShape;
        if (key === selectableShape.oKey) return selectableShape;
        if (key === eventlessShape.oKey) return eventlessShape;
        if (key === 'unit-1#-#sheet-1#-#drawing-remove') return disposeShape;
        return null;
    });

    const scene = {
        getTransformerByCreate: vi.fn(() => transformer),
        getTransformer: vi.fn(() => sceneTransformer),
        getObject: getSceneObject,
        getObjectIncludeInGroup: vi.fn((key: string) => {
            if (key === 'unit-1#-#sheet-1#-#drawing-hidden-to-visible') return hiddenTransformShape;
            return getSceneObject(key);
        }),
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
        getRenderUnitById: vi.fn(() => ({ scene })),
    };

    const drawingParams = new Map<string, { unitId: string; subUnitId: string; drawingId: string; drawingType: DrawingTypeEnum; behindText?: boolean; hidden?: boolean; selectable?: boolean; transform: { left: number; top: number; width: number; height: number; angle: number; clipBounds?: { left: number; top: number; width: number; height: number } } }>([
        ['drawing-a', { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-a', drawingType: DrawingTypeEnum.DRAWING_IMAGE, transform: { left: 0, top: 0, width: 10, height: 10, angle: 0 } }],
        ['drawing-b', { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-b', drawingType: DrawingTypeEnum.DRAWING_IMAGE, transform: { left: 20, top: 0, width: 10, height: 10, angle: 0 } }],
        ['chart-1', { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'chart-1', drawingType: DrawingTypeEnum.DRAWING_CHART, transform: { left: 40, top: 0, width: 20, height: 10, angle: 0 } }],
        ['drawing-transform', { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-transform', drawingType: DrawingTypeEnum.DRAWING_IMAGE, behindText: true, hidden: true, transform: { left: 1, top: 2, width: 3, height: 4, angle: 0, clipBounds: { left: 0, top: 0, width: 80, height: 120 } } }],
        ['drawing-transform-in-group', { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-transform-in-group', drawingType: DrawingTypeEnum.DRAWING_IMAGE, transform: { left: 8, top: 9, width: 10, height: 11, angle: 0 } }],
        ['drawing-transform-refresh-hidden', { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-transform-refresh-hidden', drawingType: DrawingTypeEnum.DRAWING_IMAGE, transform: { left: 1, top: 2, width: 3, height: 4, angle: 0, clipBounds: { left: 0, top: 0, width: 80, height: 120 } } }],
        ['drawing-hidden-to-visible', { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-hidden-to-visible', drawingType: DrawingTypeEnum.DRAWING_IMAGE, hidden: false, transform: { left: 1, top: 2, width: 3, height: 4, angle: 0 } }],
        ['drawing-selectable', { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-selectable', drawingType: DrawingTypeEnum.DRAWING_IMAGE, selectable: false, transform: { left: 1, top: 2, width: 3, height: 4, angle: 0 } }],
        ['drawing-eventless', { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-eventless', drawingType: DrawingTypeEnum.DRAWING_CHART, transform: { left: 4, top: 5, width: 6, height: 7, angle: 0 } }],
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
        getOldDrawingByParam: vi.fn(({ drawingId }: { drawingId: string }) => {
            const drawing = drawingParams.get(drawingId);
            return drawingId === 'drawing-selectable' && drawing
                ? { ...drawing, selectable: false }
                : drawing ?? null;
        }),
        getDrawingOKey: vi.fn((oKey: string) => ({ unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: oKey, drawingType: DrawingTypeEnum.DRAWING_IMAGE, transform: { left: 0, top: 0, width: 10, height: 10, angle: 0 } })),
        getDrawingOrder: vi.fn(() => ['drawing-z']),
        getFocusDrawings: vi.fn(() => [
            { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-a', drawingType: DrawingTypeEnum.DRAWING_IMAGE },
            { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-b', drawingType: DrawingTypeEnum.DRAWING_IMAGE },
        ]),
        focusDrawing: vi.fn(),
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
        drawingParams,
        group$,
        order$,
        refreshTransform$,
        remove$,
        scene,
        showHideShape,
        transformShape,
        hiddenTransformShape,
        selectableShape,
        eventlessShape,
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
    it('refreshes indexed header images without requesting another image load', () => {
        const canvas = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
            .mockReturnValue(new Proxy({}, { get: () => () => {} }) as CanvasRenderingContext2D);
        const univer = new Univer();
        try {
            const injector = univer.__getInjector();
            injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
            injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            injector.add([IDrawingManagerService, { useClass: DrawingManagerService }]);
            injector.add([DrawingUpdateController]);
            const unitId = 'header-doc';
            univer.createUnit(UniverInstanceType.UNIVER_DOC, { id: unitId, body: { dataStream: '\r\n' } });
            const render = injector.get(IRenderManagerService).createRender(unitId);
            render.deactivate();
            const manager = injector.get(IDrawingManagerService);
            injector.get(DrawingUpdateController);
            const drawing = {
                unitId,
                subUnitId: unitId,
                drawingId: 'logo',
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                isMultiTransform: BooleanNumber.TRUE,
                hidden: false,
                transform: { left: 20, top: 30, width: 40, height: 30 },
                transforms: [
                    { left: 20, top: 30, width: 40, height: 30 },
                    { left: 20, top: 530, width: 40, height: 30 },
                ],
            };
            manager.setDrawingData(unitId, unitId, { logo: drawing });
            const images = drawing.transforms.map((transform, index) => {
                const image = new Rect(getDrawingShapeKeyByDrawingSearch(drawing, index), transform);
                render.scene.addObject(image);
                return image;
            });
            const add = vi.spyOn(manager, 'addNotification');

            const update = { ...drawing, transforms: drawing.transforms.map((transform) => ({ ...transform, left: 50 })) };
            manager.refreshTransform([update]);
            expect(add).not.toHaveBeenCalled();
            expect(images.map((image) => image.left)).toEqual([50, 50]);

            manager.refreshTransform([{ ...update, hidden: true }]);
            expect(images.every((image) => !image.visible)).toBe(true);
            manager.refreshTransform([update]);
            expect(images.every((image) => image.visible)).toBe(true);
            expect(add).not.toHaveBeenCalled();

            images[1].dispose();
            manager.refreshTransform([update]);
            expect(add).toHaveBeenCalledTimes(1);
        } finally {
            univer.dispose();
            canvas.mockRestore();
        }
    });

    it.each([{ GroupType: Group }, { GroupType: DrawingGroupObject }])('arranges $GroupType.name and repeated instances without interrupting other drawings', ({ GroupType }) => {
        const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            return { canvas: this, setTransform: vi.fn(), clearRect: vi.fn() } as unknown as CanvasRenderingContext2D;
        });
        const univer = new Univer();
        try {
            const injector = univer.__getInjector();
            injector.add([IDrawingManagerService, { useClass: DrawingManagerService }]);
            injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
            injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            injector.add([DrawingUpdateController]);

            const unitId = 'arrange-unit';
            const subUnitId = 'arrange-subunit';
            const { scene } = injector.get(IRenderManagerService).createRender(unitId);
            const drawingManagerService = injector.get(IDrawingManagerService);
            injector.get(DrawingUpdateController);

            const groupSearch = { unitId, subUnitId, drawingId: 'group' };
            const child = new Rect('child', { zIndex: 7 });
            const group = new GroupType(getDrawingShapeKeyByDrawingSearch(groupSearch), child);
            const repeatedGroup = new GroupType(getDrawingShapeKeyByDrawingSearch(groupSearch, 0));
            const shape = new Rect(getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId, drawingId: 'shape' }));
            scene.addObjects([group, repeatedGroup, shape], DRAWING_OBJECT_LAYER_INDEX);

            for (const order of [['shape', 'group'], ['group', 'shape']]) {
                group.makeDirty(false);
                repeatedGroup.makeDirty(false);
                shape.makeDirty(false);
                drawingManagerService.setDrawingOrder(unitId, subUnitId, order);
                drawingManagerService.orderUpdateNotification({ unitId, subUnitId, drawingIds: ['group', 'shape'] });

                expect(group.zIndex).toBe(order.indexOf('group'));
                expect(repeatedGroup.zIndex).toBe(group.zIndex);
                expect(shape.zIndex).toBe(order.indexOf('shape'));
                expect(group.isDirty()).toBe(true);
                expect(repeatedGroup.isDirty()).toBe(true);
                expect(shape.isDirty()).toBe(true);
                expect(scene.getAllObjectsByOrder()).toEqual(
                    order[0] === 'group' ? [group, repeatedGroup, shape] : [shape, group, repeatedGroup]
                );
                expect(group.getObjects()).toEqual([child]);
                expect(child.zIndex).toBe(7);
            }
        } finally {
            univer.dispose();
            getContextSpy.mockRestore();
        }
    });

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
        expect(harness.zIndexShape.zIndex).toBe(0);
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

    it('restores a hidden render object when drawing metadata becomes visible', () => {
        const harness = createHarness();

        harness.update$.next([{
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'drawing-hidden-to-visible',
        }]);

        expect(harness.hiddenTransformShape.show).toHaveBeenCalledTimes(1);

        harness.controller.dispose();
    });

    it('restores a hidden render object from a visibility notification', () => {
        const harness = createHarness();

        harness.visible$.next([{
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'drawing-hidden-to-visible',
            visible: true,
        }]);

        expect(harness.hiddenTransformShape.show).toHaveBeenCalledTimes(1);

        harness.controller.dispose();
    });

    it('syncs drawing selectability to canvas picking and the active selection', () => {
        const harness = createHarness();
        const drawing = harness.drawingParams.get('drawing-selectable')!;
        harness.drawingManagerService.getFocusDrawings.mockReturnValue([
            { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-selectable', drawingType: DrawingTypeEnum.DRAWING_IMAGE },
            { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-b', drawingType: DrawingTypeEnum.DRAWING_IMAGE },
        ]);

        harness.update$.next([{
            unitId: drawing.unitId,
            subUnitId: drawing.subUnitId,
            drawingId: drawing.drawingId,
        }]);

        expect(harness.selectableShape.evented).toBe(false);
        expect(harness.scene.getTransformer().clearControlByIds).toHaveBeenCalledWith([harness.selectableShape.oKey]);
        expect(harness.drawingManagerService.focusDrawing).toHaveBeenCalledWith([
            expect.objectContaining({ drawingId: 'drawing-b' }),
        ]);

        delete drawing.selectable;
        harness.update$.next([{
            unitId: drawing.unitId,
            subUnitId: drawing.subUnitId,
            drawingId: drawing.drawingId,
        }]);

        expect(harness.selectableShape.evented).toBe(true);

        harness.controller.dispose();
    });

    it('preserves eventless render objects without selectable metadata', () => {
        const harness = createHarness();

        harness.update$.next([{
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'drawing-eventless',
        }]);

        expect(harness.eventlessShape.evented).toBe(false);

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

describe('drawing removal with real render selection', () => {
    it.each([DrawingTypeEnum.DRAWING_IMAGE, DrawingTypeEnum.DRAWING_SHAPE, DrawingTypeEnum.DRAWING_CHART]
        .flatMap((drawingType) => [false, true].map((otherSelected) => ({ drawingType, otherSelected }))))(
        'clears stale controls for type $drawingType with other selection=$otherSelected',
        ({ drawingType, otherSelected }) => {
            const context = new Proxy({}, { get: () => () => {} });
            const canvas = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
            const univer = new Univer();
            const injector = univer.__getInjector();
            injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
            injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            injector.add([IDrawingManagerService, { useClass: DrawingManagerService }]);
            injector.add([DrawingUpdateController]);
            univer.createUnit(UniverInstanceType.UNIVER_DOC, { id: 'delete-doc', body: { dataStream: '\r\n' } });
            const render = injector.get(IRenderManagerService).createRender('delete-doc');
            render.deactivate();
            injector.get(DrawingUpdateController);
            const manager = injector.get(IDrawingManagerService);
            const search = { unitId: 'delete-doc', subUnitId: 'delete-doc', drawingId: 'deleted', drawingType };
            const key = getDrawingShapeKeyByDrawingSearch(search);
            const objects = [key, `${key}#-#0`, ...(otherSelected ? ['unrelated'] : [])]
                .map((id) => new Rect(id, { left: 10, top: 10, width: 40, height: 30 }));
            const transformer = render.scene.getTransformerByCreate();
            const cleared = vi.fn();
            const subscription = transformer.clearControl$.subscribe(cleared);
            try {
                for (const object of objects) {
                    render.scene.addObject(object);
                    transformer.setSelectedControl(object);
                }
                render.scene.removeObjects(objects.slice(0, 2));
                cleared.mockClear();
                manager.removeNotification([search]);
                expect([...transformer.getSelectedObjectMap().keys()]).toEqual(otherSelected ? ['unrelated'] : []);
                expect(cleared).toHaveBeenCalledTimes(otherSelected ? 0 : 1);
                expect(render.scene.getAllObjects().some((object) => object.oKey.includes(key))).toBe(false);
            } finally {
                subscription.unsubscribe();
                objects.forEach((object) => object.dispose());
                univer.dispose();
                canvas.mockRestore();
            }
        }
    );
});
