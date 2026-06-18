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
import { Rect } from '@univerjs/engine-render';
import { BehaviorSubject, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { InsertDocDrawingCommand } from '../../commands/commands/insert-doc-drawing.command';
import { calcDocFloatDomPositionByRect, DocFloatDomController } from '../doc-float-dom.controller';

function createScene() {
    return {
        getViewport: vi.fn(() => ({ viewportScrollX: 10, viewportScrollY: 20, onScrollAfter$: new Subject() })),
        getAncestorScale: vi.fn(() => ({ scaleX: 2, scaleY: 3 })),
        getTransformerByCreate: vi.fn(() => ({})),
        removeObject: vi.fn(),
    };
}

function createController(options: { rects?: Rect[]; page?: any } = {}) {
    const add$ = new Subject<any[]>();
    const remove$ = new Subject<any[]>();
    const refreshTransform$ = new Subject<any[]>();
    const commandHandlers: Array<(command: { id: string; params?: unknown }) => void> = [];
    const scene = createScene();
    const canvas = { dispatchEvent: vi.fn() };
    const renderUnit = {
        scene,
        engine: { getCanvasElement: () => canvas },
        with: vi.fn(() => ({
            getSkeleton: () => ({
                getSkeletonData: () => ({ pages: [options.page ?? { pageWidth: 240, marginLeft: 20, marginRight: 30 }] }),
            }),
        })),
    };
    const renderManagerService = {
        getRenderById: vi.fn(() => renderUnit),
    };
    const drawing = {
        unitId: 'doc-1',
        subUnitId: 'doc-1',
        drawingId: 'dom-1',
        componentKey: 'FloatDom',
        drawingType: DrawingTypeEnum.DRAWING_DOM,
        data: { value: 1 },
    };
    const drawingManagerService = {
        add$,
        remove$,
        refreshTransform$,
        getDrawingByParam: vi.fn(() => drawing),
    };
    const drawingRenderService = {
        renderFloatDom: vi.fn(async () => options.rects ?? []),
    };
    const canvasFloatDomService = {
        addFloatDom: vi.fn(),
        removeFloatDom: vi.fn(),
    };
    const doc = { getUnitId: () => 'doc-1' };
    const univerInstanceService = {
        getUnit: vi.fn(() => doc),
        getCurrentUnitOfType: vi.fn(() => doc),
        getCurrentTypeOfUnit$: vi.fn(() => new BehaviorSubject(null)),
    };
    const commandService = {
        onCommandExecuted: vi.fn((handler) => {
            commandHandlers.push(handler);
            return { dispose: vi.fn() };
        }),
        syncExecuteCommand: vi.fn(),
    };

    const controller = new DocFloatDomController(
        renderManagerService as never,
        drawingManagerService as never,
        drawingRenderService as never,
        canvasFloatDomService as never,
        univerInstanceService as never,
        commandService as never
    );

    return {
        controller,
        add$,
        remove$,
        commandHandlers,
        scene,
        canvas,
        renderUnit,
        drawingRenderService,
        canvasFloatDomService,
        commandService,
    };
}

describe('DocFloatDomController', () => {
    it('calculates float dom bounds using doc viewport scroll and ancestor scale', () => {
        const scene = createScene();

        expect(calcDocFloatDomPositionByRect({ left: 30, top: 50, right: 80, bottom: 90 }, scene as never, 0.4, 15)).toEqual({
            startX: 40,
            startY: 90,
            endX: 140,
            endY: 210,
            width: 100,
            height: 120,
            rotate: 15,
            absolute: { left: false, top: false },
            opacity: 0.4,
        });
    });

    it('adds rendered float doms, updates their position, and removes them with their rect object', async () => {
        const rect = new Rect('dom-rect', {
            left: 30,
            top: 50,
            width: 50,
            height: 40,
        } as never);
        rect.setOpacity(0.8);
        const { controller, add$, remove$, scene, drawingRenderService, canvasFloatDomService } = createController({ rects: [rect] });

        add$.next([{ unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'dom-1' }]);
        await Promise.resolve();

        expect(drawingRenderService.renderFloatDom).toHaveBeenCalledWith(expect.objectContaining({ drawingId: 'dom-1' }), scene);
        expect(canvasFloatDomService.addFloatDom).toHaveBeenCalledWith(expect.objectContaining({
            id: 'dom-1',
            componentKey: 'FloatDom',
            unitId: 'doc-1',
            data: { value: 1 },
        }));

        const position$ = canvasFloatDomService.addFloatDom.mock.calls[0][0].position$;
        const positions: unknown[] = [];
        const sub = position$.subscribe((position: unknown) => positions.push(position));
        rect.transformByState({ left: 40, top: 60 });

        expect(positions.at(-1)).toMatchObject({
            startX: 60,
            startY: 120,
            width: 100,
            height: 120,
            opacity: 0.8,
        });

        remove$.next([{ drawingId: 'dom-1' }]);
        expect(canvasFloatDomService.removeFloatDom).toHaveBeenCalledWith('dom-1');
        expect(scene.removeObject).toHaveBeenCalledWith(rect);

        sub.unsubscribe();
        controller.dispose();
    });

    it('inserts a float dom using page content width when no explicit width is provided', () => {
        const { controller, commandService } = createController();

        const drawingId = controller.insertFloatDom(
            { componentKey: 'FloatDom', data: { text: 'hello' } } as never,
            { height: 36, drawingId: 'fixed-dom-id' }
        );

        expect(drawingId).toBe('fixed-dom-id');
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(
            InsertDocDrawingCommand.id,
            expect.objectContaining({
                unitId: 'doc-1',
                drawings: [
                    expect.objectContaining({
                        drawingId: 'fixed-dom-id',
                        drawingType: DrawingTypeEnum.DRAWING_DOM,
                        layoutType: expect.any(Number),
                        docTransform: expect.objectContaining({
                            size: { width: 190, height: 36 },
                        }),
                    }),
                ],
            })
        );

        controller.dispose();
    });
});
