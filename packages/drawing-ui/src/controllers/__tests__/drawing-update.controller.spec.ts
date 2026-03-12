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
import { SetDrawingSelectedOperation } from '@univerjs/drawing';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AlignType, SetDrawingAlignOperation } from '../../commands/operations/drawing-align.operation';
import { DrawingUpdateController } from '../drawing-update.controller';

interface IDrawingNotification {
    unitId: string;
    subUnitId: string;
    drawingId: string;
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
    const transformShape = { transformByState: vi.fn() };

    const scene = {
        getTransformerByCreate: vi.fn(() => transformer),
        getTransformer: vi.fn(() => sceneTransformer),
        getObject: vi.fn((key: string) => {
            if (key.includes('drawing-visible')) return showHideShape;
            if (key.includes('drawing-transform')) return transformShape;
            return null;
        }),
        getObjectIncludeInGroup: vi.fn(() => null),
        fuzzyMathObjects: vi.fn((key: string) => {
            if (key.includes('drawing-z')) return [zIndexShape];
            if (key.includes('drawing-remove')) return [disposeShape];
            return [];
        }),
        addObject: vi.fn(() => ({ attachTransformerTo: vi.fn() })),
        addObjects: vi.fn(),
        makeDirty: vi.fn(),
    };

    const renderManagerService = {
        getRenderById: vi.fn(() => ({ scene })),
    };

    const drawingParams = new Map<string, { unitId: string; subUnitId: string; drawingId: string; drawingType: DrawingTypeEnum; transform: { left: number; top: number; width: number; height: number; angle: number } }>([
        ['drawing-a', { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-a', drawingType: DrawingTypeEnum.DRAWING_IMAGE, transform: { left: 0, top: 0, width: 10, height: 10, angle: 0 } }],
        ['drawing-b', { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-b', drawingType: DrawingTypeEnum.DRAWING_IMAGE, transform: { left: 20, top: 0, width: 10, height: 10, angle: 0 } }],
        ['drawing-transform', { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-transform', drawingType: DrawingTypeEnum.DRAWING_IMAGE, transform: { left: 1, top: 2, width: 3, height: 4, angle: 0 } }],
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
        expect(harness.debounceRefreshControls).toHaveBeenCalledTimes(1);

        harness.refreshTransform$.next([{ unitId: 'unit-1', subUnitId: 'sheet-1', drawingId }]);
        expect(harness.transformShape.transformByState).toHaveBeenCalledTimes(2);

        harness.visible$.next([{ unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-visible', visible: false }]);
        expect(harness.showHideShape.hide).toHaveBeenCalledTimes(1);

        harness.visible$.next([{ unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-visible', visible: true }]);
        expect(harness.showHideShape.show).toHaveBeenCalledTimes(1);

        harness.remove$.next([{ unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-remove' }]);
        expect(harness.disposeShape.dispose).toHaveBeenCalledTimes(1);

        harness.controller.dispose();
    });
});
