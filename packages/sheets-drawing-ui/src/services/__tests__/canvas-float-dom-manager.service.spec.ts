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

import type { LifecycleStages } from '@univerjs/core';
import { DrawingTypeEnum, ICommandService, Injector, IUniverInstanceService, LifecycleService, UniverInstanceType } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService, Rect } from '@univerjs/engine-render';
import { InsertSheetDrawingCommand, ISheetDrawingService } from '@univerjs/sheets-drawing';
import { CanvasFloatDomService } from '@univerjs/ui';
import { EMPTY, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { calcSheetFloatDomPosition, SheetCanvasFloatDomManagerService, transformBound2DOMBound } from '../canvas-float-dom-manager.service';

describe('SheetCanvasFloatDomManagerService', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('transforms drawing bounds into dom bounds across scroll, freeze, and bounded view areas', () => {
        const noFreeze = transformBound2DOMBound(
            { left: 20, right: 70, top: 30, bottom: 80 },
            {
                getAncestorScale: () => ({ scaleX: 2, scaleY: 3 }),
                getViewport: () => ({
                    top: 10,
                    left: 12,
                    viewportScrollX: 5,
                    viewportScrollY: 7,
                }),
            } as never,
            {
                rowHeaderWidth: 8,
                columnHeaderHeight: 9,
                rowStartY: () => 0,
                colStartX: () => 0,
            } as never,
            {
                getFreeze: () => ({
                    startColumn: 0,
                    startRow: 0,
                    xSplit: 0,
                    ySplit: 0,
                }),
            } as never
        );

        expect(noFreeze).toEqual({
            left: 30,
            right: 130,
            top: 69,
            bottom: 219,
            absolute: {
                left: false,
                top: false,
            },
        });

        const freezeAware = transformBound2DOMBound(
            { left: 5, right: 55, top: 6, bottom: 46 },
            {
                getAncestorScale: () => ({ scaleX: 1, scaleY: 1 }),
                getViewport: () => ({
                    top: 10,
                    left: 20,
                    viewportScrollX: 40,
                    viewportScrollY: 30,
                }),
            } as never,
            {
                rowHeaderWidth: 10,
                columnHeaderHeight: 12,
                rowStartY: (row: number) => row * 20,
                colStartX: (col: number) => col * 30,
            } as never,
            {
                getFreeze: () => ({
                    startColumn: 2,
                    startRow: 1,
                    xSplit: 1,
                    ySplit: 1,
                }),
            } as never,
            {
                boundsOfViewArea: {
                    top: 15,
                    left: 18,
                    right: 0,
                    bottom: 0,
                },
                scrollDirectionResponse: 'HORIZONTAL' as never,
            } as never
        );

        expect(freezeAware).toEqual({
            left: 18,
            right: 25,
            top: 15,
            bottom: 46,
            absolute: {
                left: true,
                top: true,
            },
        });
    });

    it('derives float dom positions from scene objects with viewport clipping and scale applied', () => {
        const position = calcSheetFloatDomPosition(
            {
                left: 20,
                top: 10,
                width: 40,
                height: 30,
                angle: 12,
            } as never,
            {
                getAncestorScale: () => ({ scaleX: 2, scaleY: 2 }),
                getViewport: () => ({
                    top: 0,
                    left: 0,
                    viewportScrollX: 5,
                    viewportScrollY: 10,
                }),
            } as never,
            {
                rowHeaderWidth: 0,
                columnHeaderHeight: 0,
                rowStartY: () => 0,
                colStartX: () => 0,
            } as never,
            {
                getFreeze: () => ({
                    startColumn: 0,
                    startRow: 0,
                    xSplit: 0,
                    ySplit: 0,
                }),
            } as never
        );

        expect(position).toEqual({
            startX: 30,
            endX: 110,
            startY: 0,
            endY: 60,
            rotate: 12,
            width: 80,
            height: 60,
            absolute: {
                left: false,
                top: false,
            },
        });
    });

    it('adds float dom drawings through the sheet command pipeline and updates existing dom rect props', () => {
        const executeCommand = vi.fn();
        const syncExecuteCommand = vi.fn();
        const add$ = new Subject<any[]>();
        const remove$ = new Subject<any[]>();
        const update$ = new Subject<any[]>();
        const rect = new Rect('drawing-1', {
            left: 0,
            top: 0,
            width: 10,
            height: 10,
        });
        const setPropsSpy = vi.spyOn(rect, 'setProps');

        const injector = new Injector();
        injector.add([IRenderManagerService, {
            useValue: {
                getRenderById: () => ({
                    scene: {
                        getTransformerByCreate: () => ({}),
                        getObject: () => rect,
                        removeObject: vi.fn(),
                    },
                    engine: {
                        getCanvasElement: () => ({ dispatchEvent: vi.fn() }),
                    },
                    render: {
                        scene: {
                            getViewport: () => ({
                                onScrollAfter$: {
                                    subscribeEvent: () => ({ unsubscribe: vi.fn() }),
                                },
                            }),
                        },
                    },
                    with: () => ({
                        getSkeletonParam: () => ({
                            skeleton: {},
                        }),
                        getCellWithCoordByOffset: (x: number, y: number) => ({
                            actualColumn: x < 20 ? 1 : 4,
                            actualRow: y < 40 ? 2 : 6,
                            startX: x < 20 ? 10 : 40,
                            startY: y < 40 ? 20 : 60,
                        }),
                    }),
                }),
            } as never,
        }]);
        injector.add([IUniverInstanceService, {
            useValue: {
                getUnit: vi.fn((_id: string, type: UniverInstanceType) => type === UniverInstanceType.UNIVER_SHEET
                    ? {
                        getUnitId: () => 'book-1',
                        getActiveSheet: () => ({
                            getSheetId: () => 'sheet-1',
                        }),
                        getSheetBySheetId: () => ({
                            getSheetId: () => 'sheet-1',
                            getFreeze: () => ({
                                startColumn: 0,
                                startRow: 0,
                                xSplit: 0,
                                ySplit: 0,
                            }),
                        }),
                    }
                    : null),
                getCurrentTypeOfUnit$: vi.fn(() => EMPTY),
                getCurrentUnitOfType: vi.fn(() => ({
                    getUnitId: () => 'book-1',
                    getActiveSheet: () => ({
                        getSheetId: () => 'sheet-1',
                    }),
                    getSheetBySheetId: () => ({
                        getSheetId: () => 'sheet-1',
                        getFreeze: () => ({
                            startColumn: 0,
                            startRow: 0,
                            xSplit: 0,
                            ySplit: 0,
                        }),
                    }),
                })),
            } as never,
        }]);
        injector.add([ICommandService, {
            useValue: {
                executeCommand,
                syncExecuteCommand,
                onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })),
            } as never,
        }]);
        injector.add([IDrawingManagerService, {
            useValue: {
                add$,
                remove$,
                update$,
                getDrawingOrder: vi.fn(() => ['drawing-1']),
                getDrawingByParam: vi.fn(() => ({
                    drawingId: 'drawing-1',
                    transform: { left: 10, top: 20, width: 30, height: 40 },
                    drawingType: DrawingTypeEnum.DRAWING_DOM,
                })),
            } as never,
        }]);
        injector.add([CanvasFloatDomService, { useValue: { addFloatDom: vi.fn(), removeFloatDom: vi.fn(), updateFloatDom: vi.fn() } as never }]);
        injector.add([ISheetDrawingService, { useValue: { getBatchRemoveOp: vi.fn(() => ({ redo: [], objects: {} })) } as never }]);
        injector.add([LifecycleService, { useValue: { lifecycle$: new Subject<LifecycleStages>().asObservable() } as never }]);

        const service = injector.createInstance(SheetCanvasFloatDomManagerService);
        const added: any[] = [];
        service.add$.subscribe((value) => added.push(value));

        const handle = service.addFloatDomToPosition({
            componentKey: 'float-component',
            initPosition: {
                startX: 10,
                endX: 40,
                startY: 20,
                endY: 60,
            },
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            data: { label: 'float' },
        } as never, 'drawing-1');

        expect(handle?.id).toBe('drawing-1');
        expect(executeCommand).toHaveBeenCalledWith(InsertSheetDrawingCommand.id, expect.objectContaining({
            unitId: 'book-1',
            drawings: [expect.objectContaining({
                drawingId: 'drawing-1',
                componentKey: 'float-component',
                transform: {
                    left: 10,
                    top: 20,
                    width: 30,
                    height: 40,
                },
            })],
        }));
        expect(added).toEqual([{
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            id: 'drawing-1',
        }]);

        (service as any)._domLayerInfoMap.set('drawing-1', {
            rect,
            unitId: 'book-1',
            subUnitId: 'sheet-1',
        });
        service.updateFloatDomProps('book-1', 'sheet-1', 'drawing-1', { left: 99, top: 88 });
        expect(setPropsSpy).toHaveBeenCalledWith({ left: 99, top: 88 });

        service.dispose();
    });
});
