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

import { DrawingTypeEnum, ICommandService, Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { IDrawingManagerService } from '@univerjs/drawing';
import { DrawingRenderService } from '@univerjs/drawing-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { CanvasFloatDomService } from '@univerjs/ui';
import { EMPTY, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InsertDocDrawingCommand } from '../../commands/commands/insert-doc-drawing.command';
import { calcDocFloatDomPositionByRect, DocFloatDomController } from '../doc-float-dom.controller';

function createEventSubject<T = void>() {
    return {
        subscribeEvent: (cb: (value: T) => void) => {
            return {
                dispose: vi.fn(),
                emit: cb,
            };
        },
    };
}

describe('DocFloatDomController', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('calculates float dom positions from a scene rect and viewport state', () => {
        const position = calcDocFloatDomPositionByRect(
            {
                left: 10,
                top: 20,
                right: 50,
                bottom: 80,
            },
            {
                getViewport: () => ({
                    viewportScrollX: 5,
                    viewportScrollY: 10,
                }),
                getAncestorScale: () => ({
                    scaleX: 2,
                    scaleY: 3,
                }),
            } as never,
            0.5,
            15
        );

        expect(position).toEqual({
            startX: 10,
            startY: 30,
            endX: 90,
            endY: 210,
            width: 80,
            height: 180,
            rotate: 15,
            absolute: {
                left: false,
                top: false,
            },
            opacity: 0.5,
        });
    });

    it('adds float dom layers for inserted drawings, forwards pointer events, updates position, and removes them again', async () => {
        class PointerEvt {
            type: string;
            constructor(type: string) {
                this.type = type;
            }
        }
        class WheelEvt {
            type: string;
            constructor(type: string) {
                this.type = type;
            }
        }
        vi.stubGlobal('PointerEvent', PointerEvt as never);
        vi.stubGlobal('WheelEvent', WheelEvt as never);

        const add$ = new Subject<any[]>();
        const remove$ = new Subject<any[]>();
        const transformListeners: Array<() => void> = [];
        const pointerEnterListeners: Array<() => void> = [];
        const pointerLeaveListeners: Array<() => void> = [];
        const canvas = {
            dispatchEvent: vi.fn(),
        };
        const rect = {
            top: 20,
            left: 10,
            width: 100,
            height: 50,
            angle: 0,
            opacity: 1,
            cursor: '',
            onTransformChange$: {
                subscribeEvent: (cb: () => void) => {
                    transformListeners.push(cb);
                    return { dispose: vi.fn() };
                },
            },
            onPointerEnter$: {
                subscribeEvent: (cb: () => void) => {
                    pointerEnterListeners.push(cb);
                    return { dispose: vi.fn() };
                },
            },
            onPointerLeave$: {
                subscribeEvent: (cb: () => void) => {
                    pointerLeaveListeners.push(cb);
                    return { dispose: vi.fn() };
                },
            },
        };
        const renderObject: any = {
            scene: {
                getTransformerByCreate: () => ({}),
                getViewport: () => ({
                    viewportScrollX: 0,
                    viewportScrollY: 0,
                    onScrollAfter$: createEventSubject(),
                }),
                getAncestorScale: () => ({
                    scaleX: 1,
                    scaleY: 1,
                }),
                removeObject: vi.fn(),
            },
            engine: {
                getCanvasElement: () => canvas,
            },
            render: {
                scene: {
                    getViewport: () => ({
                        onScrollAfter$: createEventSubject(),
                    }),
                },
            },
        };
        const drawing = {
            drawingId: 'dom-1',
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawingType: DrawingTypeEnum.DRAWING_DOM,
            componentKey: 'test-float',
            data: { label: 'dom' },
        };
        const addedFloatDoms: any[] = [];

        const injector = new Injector();
        injector.add([IRenderManagerService, { useValue: { getRenderById: () => renderObject } as never }]);
        injector.add([IDrawingManagerService, {
            useValue: {
                add$,
                remove$,
                getDrawingByParam: vi.fn(() => drawing),
            } as never,
        }]);
        injector.add([DrawingRenderService, { useValue: { renderFloatDom: vi.fn(async () => [rect]) } as never }]);
        injector.add([CanvasFloatDomService, {
            useValue: {
                addFloatDom: vi.fn((layer) => addedFloatDoms.push(layer)),
                removeFloatDom: vi.fn(),
            } as never,
        }]);
        injector.add([IUniverInstanceService, {
            useValue: {
                getUnit: vi.fn(() => ({ getUnitId: () => 'doc-1' })),
                getCurrentTypeOfUnit$: vi.fn(() => EMPTY),
                getCurrentUnitOfType: vi.fn(() => null),
            } as never,
        }]);
        injector.add([ICommandService, {
            useValue: {
                onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })),
                syncExecuteCommand: vi.fn(),
            } as never,
        }]);

        const controller = injector.createInstance(DocFloatDomController);

        add$.next([{ unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'dom-1' }]);
        await Promise.resolve();

        expect(addedFloatDoms).toHaveLength(1);
        expect(addedFloatDoms[0]).toEqual(expect.objectContaining({
            id: 'dom-1',
            componentKey: 'test-float',
            unitId: 'doc-1',
            data: { label: 'dom' },
        }));

        addedFloatDoms[0].onPointerDown({ type: 'pointerdown' });
        addedFloatDoms[0].onPointerMove({ type: 'pointermove' });
        addedFloatDoms[0].onPointerUp({ type: 'pointerup' });
        addedFloatDoms[0].onWheel({ type: 'wheel' });
        expect(canvas.dispatchEvent).toHaveBeenCalledTimes(4);

        rect.left = 30;
        transformListeners[0]();
        expect(addedFloatDoms[0].position$.value.startX).toBe(30);

        pointerEnterListeners[0]();
        expect(rect.cursor).toBe('grab');
        pointerLeaveListeners[0]();
        expect(rect.cursor).toBe('default');

        remove$.next([{ unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'dom-1' }]);
        expect(injector.get(CanvasFloatDomService).removeFloatDom).toHaveBeenCalledWith('dom-1');
        expect(renderObject.scene.removeObject).toHaveBeenCalledWith(rect);

        controller.dispose();
    });

    it('inserts a float dom through the doc drawing command pipeline with a computed inline size', () => {
        const syncExecuteCommand = vi.fn();
        const injector = new Injector();
        injector.add([IRenderManagerService, {
            useValue: {
                getRenderById: () => ({
                    scene: {
                        getTransformerByCreate: () => ({}),
                        getViewport: () => ({
                            onScrollAfter$: createEventSubject(),
                        }),
                    },
                    render: {
                        scene: {
                            getViewport: () => ({
                                onScrollAfter$: createEventSubject(),
                            }),
                        },
                    },
                    engine: {
                        getCanvasElement: () => ({ dispatchEvent: vi.fn() }),
                    },
                    with: (token: unknown) => {
                        if (token === DocSkeletonManagerService) {
                            return {
                                getSkeleton: () => ({
                                    getSkeletonData: () => ({
                                        pages: [{
                                            pageWidth: 600,
                                            marginLeft: 40,
                                            marginRight: 50,
                                        }],
                                    }),
                                }),
                            };
                        }

                        return null;
                    },
                }),
            } as never,
        }]);
        injector.add([IDrawingManagerService, { useValue: { add$: EMPTY, remove$: EMPTY } as never }]);
        injector.add([DrawingRenderService, { useValue: {} as never }]);
        injector.add([CanvasFloatDomService, { useValue: {} as never }]);
        injector.add([IUniverInstanceService, {
            useValue: {
                getCurrentTypeOfUnit$: vi.fn(() => EMPTY),
                getCurrentUnitOfType: vi.fn((type: UniverInstanceType) => type === UniverInstanceType.UNIVER_DOC ? { getUnitId: () => 'doc-1' } : null),
            } as never,
        }]);
        injector.add([ICommandService, {
            useValue: {
                onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })),
                syncExecuteCommand,
            } as never,
        }]);

        const controller = injector.createInstance(DocFloatDomController);
        const drawingId = controller.insertFloatDom(
            {
                componentKey: 'float-component',
                data: { label: 'inserted' },
            } as never,
            {
                height: 80,
                drawingId: 'float-1',
            }
        );

        expect(drawingId).toBe('float-1');
        expect(syncExecuteCommand).toHaveBeenCalledWith(InsertDocDrawingCommand.id, expect.objectContaining({
            unitId: 'doc-1',
            drawings: [expect.objectContaining({
                drawingId: 'float-1',
                drawingType: DrawingTypeEnum.DRAWING_DOM,
                componentKey: 'float-component',
                layoutType: 0,
                docTransform: expect.objectContaining({
                    size: {
                        width: 510,
                        height: 80,
                    },
                }),
            })],
        }));

        controller.dispose();
    });
});
