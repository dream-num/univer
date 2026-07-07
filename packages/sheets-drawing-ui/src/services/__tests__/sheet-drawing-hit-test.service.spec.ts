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
import { DrawingTypeEnum, UniverInstanceType } from '@univerjs/core';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SheetDrawingHitTestService } from '../sheet-drawing-hit-test.service';

function createDrawing(drawingId: string, subUnitId = 'sheet-1'): IDrawingParam {
    return {
        unitId: 'unit-1',
        subUnitId,
        drawingId,
        drawingType: DrawingTypeEnum.DRAWING_CHART,
    };
}

function createScene(oKey = 'unit-1#-#sheet-1#-#chart-1') {
    const handlers = new Set<(event: { offsetX: number; offsetY: number }) => void>();
    const unsubscribers: Array<ReturnType<typeof vi.fn>> = [];
    const scene = {
        pick: vi.fn(() => ({ oKey })),
        onDblclick$: {
            subscribeEvent: vi.fn((handler: (event: { offsetX: number; offsetY: number }) => void) => {
                handlers.add(handler);
                const unsubscribe = vi.fn(() => handlers.delete(handler));
                unsubscribers.push(unsubscribe);
                return { unsubscribe };
            }),
        },
        emitDoubleClick(event: { offsetX: number; offsetY: number }) {
            Array.from(handlers).forEach((handler) => handler(event));
        },
        unsubscribers,
    };

    return scene;
}

function createServiceHarness(options: { drawing?: IDrawingParam | null } = {}) {
    const currentSheet$ = new Subject<unknown>();
    const renderCreated$ = new Subject<unknown>();
    const renderDisposed$ = new Subject<string>();
    const scene = createScene();
    let currentRender = { unitId: 'unit-1', scene };
    const drawing = options.drawing === undefined ? createDrawing('chart-1') : options.drawing;
    const drawingManagerService = {
        getDrawingOKey: vi.fn(() => drawing),
    };
    const workbook = {
        getUnitId: vi.fn(() => 'unit-1'),
        getActiveSheet: vi.fn(() => ({ getSheetId: vi.fn(() => 'sheet-1') })),
    };
    const renderManagerService = {
        getRenderById: vi.fn((unitId: string) => unitId === 'unit-1' ? currentRender : null),
        created$: renderCreated$.asObservable(),
        disposed$: renderDisposed$.asObservable(),
    };
    const service = new SheetDrawingHitTestService(
        drawingManagerService as never,
        {
            getCurrentTypeOfUnit$: vi.fn(() => currentSheet$.asObservable()),
            getCurrentUnitOfType: vi.fn((type: UniverInstanceType) => type === UniverInstanceType.UNIVER_SHEET ? workbook : null),
        } as never,
        renderManagerService as never
    );
    const doubleClickEvents: unknown[] = [];
    const subscription = service.onDoubleClick$.subscribe((event) => doubleClickEvents.push(event));

    return {
        currentSheet$,
        doubleClickEvents,
        drawing,
        drawingManagerService,
        renderCreated$,
        renderDisposed$,
        renderManagerService,
        scene,
        service,
        setRender(nextRender: typeof currentRender) {
            currentRender = nextRender;
        },
        subscription,
    };
}

describe('SheetDrawingHitTestService', () => {
    it('emits the current sheet drawing on scene double-click', () => {
        const { doubleClickEvents, drawing, drawingManagerService, scene, service, subscription } = createServiceHarness();

        scene.emitDoubleClick({ offsetX: 140, offsetY: 90 });

        expect(scene.pick).toHaveBeenCalled();
        expect(drawingManagerService.getDrawingOKey).toHaveBeenCalledWith('unit-1#-#sheet-1#-#chart-1');
        expect(doubleClickEvents[0]).toMatchObject({
            drawing,
            oKey: 'unit-1#-#sheet-1#-#chart-1',
            offsetX: 140,
            offsetY: 90,
        });

        subscription.unsubscribe();
        service.dispose();
    });

    it('ignores drawings outside the active sheet', () => {
        const { doubleClickEvents, scene, service, subscription } = createServiceHarness({
            drawing: createDrawing('chart-1', 'sheet-2'),
        });

        scene.emitDoubleClick({ offsetX: 140, offsetY: 90 });

        expect(doubleClickEvents).toHaveLength(0);

        subscription.unsubscribe();
        service.dispose();
    });

    it('rebinds when the active workbook render is recreated', () => {
        const { doubleClickEvents, renderCreated$, scene, service, setRender, subscription } = createServiceHarness();
        const nextScene = createScene();
        const nextRender = { unitId: 'unit-1', scene: nextScene };

        setRender(nextRender);
        renderCreated$.next(nextRender);
        scene.emitDoubleClick({ offsetX: 140, offsetY: 90 });
        nextScene.emitDoubleClick({ offsetX: 150, offsetY: 100 });

        expect(scene.unsubscribers[0]).toHaveBeenCalled();
        expect(doubleClickEvents).toHaveLength(1);
        expect(doubleClickEvents[0]).toMatchObject({
            offsetX: 150,
            offsetY: 100,
        });

        subscription.unsubscribe();
        service.dispose();
    });
});
