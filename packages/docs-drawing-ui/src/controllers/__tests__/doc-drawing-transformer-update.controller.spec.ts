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

import type { ICommand, IDocumentData, Injector } from '@univerjs/core';
import { BooleanNumber, ICommandService, ObjectRelativeFromH, ObjectRelativeFromV, PositionedObjectLayoutType } from '@univerjs/core';
import { DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { DocSelectionRenderService } from '@univerjs/docs-ui';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDocUiTestBed } from '../../__tests__/create-doc-ui-test-bed';
import { IMoveInlineDrawingCommand, ITransformNonInlineDrawingCommand, UpdateDrawingDocTransformCommand } from '../../commands/commands/update-doc-drawing.command';
import { DocRefreshDrawingsService } from '../../services/doc-refresh-drawings.service';
import { DocDrawingTransformerController } from '../doc-drawing-transformer-update.controller';

interface TestObject {
    oKey: string;
    left: number;
    top: number;
    width: number;
    height: number;
    angle: number;
    setOpacity: ReturnType<typeof vi.fn>;
}

function createInlineDocData(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: 'A\bBC\r\n',
            customBlocks: [{
                startIndex: 1,
                blockId: 'shape-1',
            }],
        },
        drawings: {
            'shape-1': {
                drawingId: 'shape-1',
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingType: 'image',
                layoutType: PositionedObjectLayoutType.INLINE,
                docTransform: {
                    positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: 0 },
                    positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                    size: { width: 20, height: 30 },
                    angle: 0,
                },
            } as never,
        },
        drawingsOrder: ['shape-1'],
        documentStyle: {
            pageSize: {
                width: 594.3,
                height: 840.51,
            },
            marginTop: 72,
            marginBottom: 72,
            marginRight: 90,
            marginLeft: 90,
        },
    };
}

function createFloatingDocData(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: '\bAB\b\r\n',
            customBlocks: [
                {
                    startIndex: 0,
                    blockId: 'shape-1',
                },
                {
                    startIndex: 3,
                    blockId: 'shape-2',
                },
            ],
        },
        drawings: {
            'shape-1': {
                drawingId: 'shape-1',
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingType: 'image',
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                docTransform: {
                    positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: 10 },
                    positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 20 },
                    size: { width: 40, height: 50 },
                    angle: 0,
                },
            } as never,
            'shape-2': {
                drawingId: 'shape-2',
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingType: 'image',
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                docTransform: {
                    positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: 5 },
                    positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 6 },
                    size: { width: 30, height: 35 },
                    angle: 5,
                },
                isMultiTransform: BooleanNumber.TRUE,
            } as never,
        },
        drawingsOrder: ['shape-1', 'shape-2'],
        documentStyle: {
            pageSize: {
                width: 594.3,
                height: 840.51,
            },
            marginTop: 72,
            marginBottom: 72,
            marginRight: 90,
            marginLeft: 90,
        },
    };
}

function createObject(partial: Partial<TestObject> & Pick<TestObject, 'oKey'>): TestObject {
    return {
        oKey: partial.oKey,
        left: partial.left ?? 0,
        top: partial.top ?? 0,
        width: partial.width ?? 20,
        height: partial.height ?? 20,
        angle: partial.angle ?? 0,
        setOpacity: partial.setOpacity ?? vi.fn(),
    };
}

function waitNextTick() {
    return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

function setupTestBed(docData: IDocumentData) {
    const changeStart$ = new Subject<{ objects: Map<string, TestObject> }>();
    const changing$ = new Subject<{ objects: Map<string, TestObject>; offsetX?: number; offsetY?: number }>();
    const changeEnd$ = new Subject<{ objects: Map<string, TestObject>; offsetX?: number; offsetY?: number }>();
    const refreshControls = vi.fn();
    const add$ = new Subject<Array<{ unitId: string }>>();
    let currentSegment = '';
    let currentSegmentPage = 0;
    let injector!: Injector;

    const transformer = {
        changeStart$,
        changing$,
        changeEnd$,
        refreshControls,
    };

    const docSelectionRenderService = {
        getSegment: () => currentSegment,
        setSegment: (segmentId: string) => {
            currentSegment = segmentId;
        },
        getSegmentPage: () => currentSegmentPage,
        setSegmentPage: (segmentPage: number) => {
            currentSegmentPage = segmentPage;
        },
    };

    const renderManagerService = {
        getRenderById: () => ({
            scene: {
                getTransformerByCreate: () => transformer,
            },
            with: <T>(token: T) => {
                if (token === DocSelectionRenderService) {
                    return docSelectionRenderService as T;
                }

                if (token === DocSkeletonManagerService) {
                    return {
                        getSkeleton: () => null,
                        getViewModel: () => injector.get(DocSkeletonManagerService).getViewModel(),
                    } as T;
                }

                return injector.get(token as never);
            },
        }),
    };

    const drawingManagerService = {
        add$,
        getDrawingOKey: (oKey: string) => ({
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawingId: oKey,
        }),
    };

    const testBed = createDocUiTestBed(docData, [
        [IRenderManagerService, { useValue: renderManagerService }],
        [IDrawingManagerService, { useValue: drawingManagerService as never }],
    ]);
    injector = testBed.injector;
    injector.add([DocRefreshDrawingsService]);

    const commandService = testBed.get(ICommandService);
    [
        UpdateDrawingDocTransformCommand,
        IMoveInlineDrawingCommand,
        ITransformNonInlineDrawingCommand,
        RichTextEditingMutation as unknown as ICommand,
    ].forEach((command) => commandService.registerCommand(command));

    const controller = injector.createInstance(DocDrawingTransformerController);

    return {
        ...testBed,
        controller,
        add$,
        changeStart$,
        changing$,
        changeEnd$,
        refreshControls,
        renderManagerService,
        snapshot: () => testBed.doc.getSnapshot(),
    };
}

describe('DocDrawingTransformerController', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('resizes an inline drawing through the transformer event chain and updates the document snapshot', async () => {
        const testBed = setupTestBed(createInlineDocData());
        const object = createObject({
            oKey: 'shape-1',
            width: 20,
            height: 30,
        });

        testBed.add$.next([{ unitId: 'test-doc' }]);
        testBed.changeStart$.next({ objects: new Map([['shape-1', object]]) });

        object.width = 45;
        object.height = 60;
        object.angle = 15;

        testBed.changeEnd$.next({ objects: new Map([['shape-1', object]]) });
        await waitNextTick();

        expect(object.setOpacity).toHaveBeenNthCalledWith(1, 0.2);
        expect(object.setOpacity).toHaveBeenNthCalledWith(2, 1);
        expect(testBed.snapshot().drawings?.['shape-1']?.docTransform).toEqual(expect.objectContaining({
            size: { width: 45, height: 60 },
            angle: 15,
        }));
        expect(testBed.refreshControls).toHaveBeenCalled();
    });

    it('moves an inline drawing through the command pipeline when the anchor changes', async () => {
        const testBed = setupTestBed(createInlineDocData());
        const controllerRef = testBed.controller as any;
        const object = createObject({
            oKey: 'shape-1',
            left: 10,
            width: 20,
            height: 30,
        });

        vi.spyOn(controllerRef, '_getInlineDrawingAnchor').mockReturnValue({
            offset: 3,
            segmentId: '',
            segmentPage: 0,
        });

        testBed.add$.next([{ unitId: 'test-doc' }]);
        testBed.changeStart$.next({ objects: new Map([['shape-1', object]]) });

        object.left = 35;

        testBed.changeEnd$.next({
            objects: new Map([['shape-1', object]]),
            offsetX: 25,
            offsetY: 0,
        });
        await waitNextTick();

        expect(testBed.snapshot().body?.customBlocks?.[0]?.startIndex).toBe(2);
        expect(testBed.refreshControls).toHaveBeenCalled();
    });

    it('transforms a floating drawing through the command pipeline and rewrites both anchor and transform', async () => {
        const testBed = setupTestBed(createFloatingDocData());
        const controllerRef = testBed.controller as any;
        const object = createObject({
            oKey: 'shape-1',
            left: 10,
            top: 20,
            width: 40,
            height: 50,
        });

        vi.spyOn(controllerRef, '_getDrawingAnchor').mockReturnValue({
            offset: 2,
            segmentId: '',
            segmentPage: 0,
            docTransform: {
                positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: 44 },
                positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 55 },
                size: { width: 90, height: 100 },
                angle: 30,
            },
        });

        testBed.add$.next([{ unitId: 'test-doc' }]);
        testBed.changeStart$.next({ objects: new Map([['shape-1', object]]) });

        object.left = 48;
        object.top = 66;
        object.width = 90;
        object.height = 100;
        object.angle = 30;

        testBed.changeEnd$.next({ objects: new Map([['shape-1', object]]) });
        await waitNextTick();

        expect(testBed.snapshot().body?.customBlocks?.find((block) => block.blockId === 'shape-1')?.startIndex).toBe(1);
        expect(testBed.snapshot().drawings?.['shape-1']?.docTransform).toEqual({
            positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: 44 },
            positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 55 },
            size: { width: 90, height: 100 },
            angle: 30,
        });
        expect(testBed.refreshControls).toHaveBeenCalled();
    });

    it('updates multiple floating drawings when a multi-selection transform ends', async () => {
        const testBed = setupTestBed(createFloatingDocData());
        const shape1 = createObject({
            oKey: 'shape-1',
            left: 10,
            top: 20,
            width: 40,
            height: 50,
        });
        const shape2 = createObject({
            oKey: 'shape-2',
            left: 5,
            top: 6,
            width: 30,
            height: 35,
            angle: 5,
        });

        testBed.add$.next([{ unitId: 'test-doc' }]);
        testBed.changeStart$.next({
            objects: new Map([
                ['shape-1', shape1],
                ['shape-2', shape2],
            ]),
        });

        shape1.left = 25;
        shape1.top = 35;
        shape1.width = 42;
        shape1.height = 52;
        shape1.angle = 8;
        shape2.left = 12;
        shape2.top = 18;
        shape2.width = 34;
        shape2.height = 40;
        shape2.angle = 15;

        testBed.changeEnd$.next({
            objects: new Map([
                ['shape-1', shape1],
                ['shape-2', shape2],
            ]),
        });
        await waitNextTick();

        expect(testBed.snapshot().drawings?.['shape-1']?.docTransform).toEqual(expect.objectContaining({
            positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: 25 },
            positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 35 },
            size: { width: 42, height: 52 },
            angle: 8,
        }));
        expect(testBed.snapshot().drawings?.['shape-2']?.docTransform).toEqual(expect.objectContaining({
            positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: 12 },
            positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 18 },
            size: { width: 34, height: 40 },
            angle: 15,
        }));
        expect(testBed.refreshControls).toHaveBeenCalled();
    });

    it('refreshes inline anchor visuals while dragging and reuses the created anchor shape', () => {
        const testBed = setupTestBed(createInlineDocData());
        const controllerRef = testBed.controller as any;
        const addObject = vi.fn();

        testBed.renderManagerService.getRenderById = (() => ({
            mainComponent: {
                getOffsetConfig: () => ({
                    docsLeft: 5,
                    docsTop: 7,
                }),
            },
            scene: {
                addObject,
                getTransformerByCreate: () => ({
                    refreshControls: testBed.refreshControls,
                }),
            },
            with: () => null,
        })) as any;

        controllerRef._transformerCache = new Map([['shape-1', {
            drawing: testBed.snapshot().drawings?.['shape-1'],
            left: 0,
            top: 0,
            width: 20,
            height: 30,
            angle: 0,
        }]]);

        vi.spyOn(controllerRef, '_getInlineDrawingAnchor').mockReturnValue({
            offset: 2,
            segmentId: '',
            segmentPage: 0,
            contentBoxPointGroup: [[
                { x: 10, y: 12 },
                { x: 14, y: 12 },
                { x: 10, y: 24 },
                { x: 14, y: 24 },
            ]],
        });

        controllerRef._updateInlineDrawingAnchor(testBed.snapshot().drawings?.['shape-1'], 20, 10);
        const anchorShape = controllerRef._anchorShape;
        const transformByState = vi.spyOn(anchorShape, 'transformByState');
        const show = vi.spyOn(anchorShape, 'show');

        controllerRef._updateInlineDrawingAnchor(testBed.snapshot().drawings?.['shape-1'], 20, 10);

        expect(addObject).toHaveBeenCalledTimes(1);
        expect(transformByState).toHaveBeenCalled();
        expect(show).toHaveBeenCalled();
    });

    it('refreshes drawings instead of moving inline drawings when no new anchor can be resolved', async () => {
        const testBed = setupTestBed(createInlineDocData());
        const controllerRef = testBed.controller as any;
        const refreshDrawings = vi.spyOn(testBed.injector.get(DocRefreshDrawingsService), 'refreshDrawings');

        vi.spyOn(controllerRef, '_getInlineDrawingAnchor').mockReturnValue(undefined);

        await controllerRef._moveInlineDrawing(testBed.snapshot().drawings?.['shape-1'], 10, 5);

        expect(refreshDrawings).toHaveBeenCalledWith(null);
        expect(testBed.refreshControls).toHaveBeenCalled();
    });

    it('falls back to direct doc transform updates when floating anchors cannot be recalculated', async () => {
        const testBed = setupTestBed(createFloatingDocData());
        const controllerRef = testBed.controller as any;

        vi.spyOn(controllerRef, '_getDrawingAnchor').mockReturnValue(undefined);
        controllerRef._transformerCache = new Map([['shape-1', {
            drawing: testBed.snapshot().drawings?.['shape-1'],
            left: 10,
            top: 20,
            width: 40,
            height: 50,
            angle: 0,
        }]]);

        await controllerRef._nonInlineDrawingTransform(testBed.snapshot().drawings?.['shape-1'], createObject({
            oKey: 'shape-1',
            left: 70,
            top: 80,
            width: 90,
            height: 95,
            angle: 12,
        }));
        await waitNextTick();

        expect(testBed.snapshot().drawings?.['shape-1']?.docTransform).toEqual(expect.objectContaining({
            positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: 70 },
            positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 80 },
            size: { width: 90, height: 95 },
            angle: 12,
        }));
    });

    it('uses page skeleton data to compute page content size', () => {
        const testBed = setupTestBed(createFloatingDocData());
        const controllerRef = testBed.controller as any;

        testBed.renderManagerService.getRenderById = (() => ({
            scene: {
                getTransformerByCreate: () => ({
                    refreshControls: testBed.refreshControls,
                }),
            },
            with: () => ({
                getSkeleton: () => ({
                    getSkeletonData: () => ({
                        pages: [{
                            pageWidth: 820,
                            pageHeight: 900,
                            marginLeft: 60,
                            marginRight: 80,
                            marginTop: 70,
                            marginBottom: 90,
                            skeDrawings: new Map([['shape-1', {}]]),
                        }],
                    }),
                }),
            }),
        })) as any;

        expect(controllerRef._getPageContentSize(testBed.snapshot().drawings?.['shape-1'])).toEqual({
            width: 680,
            height: 740,
        });
    });
});
