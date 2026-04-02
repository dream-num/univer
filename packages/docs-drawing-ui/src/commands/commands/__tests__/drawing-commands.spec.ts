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

import type { DocumentDataModel, ICommand, IDocumentData, Injector } from '@univerjs/core';
import {
    ArrangeTypeEnum,
    Direction,
    ICommandService,
    IUniverInstanceService,
    PositionedObjectLayoutType,
    UniverInstanceType,
    WrapTextType,
} from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { DocDrawingController as CoreDocDrawingController, DocDrawingService, IDocDrawingService } from '@univerjs/docs-drawing';
import { DocSelectionRenderService } from '@univerjs/docs-ui';
import { DrawingManagerService, IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDocUiTestBed } from '../../../__tests__/create-doc-ui-test-bed';
import { DocDrawingAddRemoveController } from '../../../controllers/doc-drawing-notification.controller';
import { DocRefreshDrawingsService } from '../../../services/doc-refresh-drawings.service';
import { DeleteDocDrawingsCommand } from '../delete-doc-drawing.command';
import { InsertDocDrawingCommand } from '../insert-doc-drawing.command';
import { MoveDocDrawingsCommand } from '../move-drawings.command';
import { RemoveDocDrawingCommand } from '../remove-doc-drawing.command';
import { SetDocDrawingArrangeCommand } from '../set-drawing-arrange.command';
import { IMoveInlineDrawingCommand, ITransformNonInlineDrawingCommand, UpdateDocDrawingDistanceCommand, UpdateDocDrawingWrapTextCommand, UpdateDrawingDocTransformCommand } from '../update-doc-drawing.command';

function waitNextTick() {
    return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

function createBaseDocData(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: 'Hello\r\n',
            customBlocks: [],
        },
        drawings: {},
        drawingsOrder: [],
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

function createDrawingDocData(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: '\b\r\n',
            customBlocks: [{
                startIndex: 0,
                blockId: 'shape-1',
            }],
        },
        drawings: {
            'shape-1': {
                drawingId: 'shape-1',
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingType: 'image',
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                docTransform: {
                    positionH: { posOffset: 1 },
                    positionV: { posOffset: 2 },
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

function createInlineDrawingDocData(): IDocumentData {
    return {
        ...createBaseDocData(),
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
                    positionH: { posOffset: 0 },
                    positionV: { posOffset: 0 },
                },
            } as never,
        },
        drawingsOrder: ['shape-1'],
    };
}

function createFloatingDrawingWithTextDocData(): IDocumentData {
    return {
        ...createBaseDocData(),
        body: {
            dataStream: '\bAB\r\n',
            customBlocks: [{
                startIndex: 0,
                blockId: 'shape-1',
            }],
        },
        drawings: {
            'shape-1': {
                drawingId: 'shape-1',
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingType: 'image',
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                docTransform: {
                    positionH: { posOffset: 1 },
                    positionV: { posOffset: 2 },
                },
            } as never,
        },
        drawingsOrder: ['shape-1'],
    };
}

function createMultiDrawingDocData(): IDocumentData {
    return {
        ...createBaseDocData(),
        body: {
            dataStream: '\b\b\r\n',
            customBlocks: [
                { startIndex: 0, blockId: 'shape-1' },
                { startIndex: 1, blockId: 'shape-2' },
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
                    positionH: { posOffset: 1 },
                    positionV: { posOffset: 2 },
                },
            } as never,
            'shape-2': {
                drawingId: 'shape-2',
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingType: 'image',
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                docTransform: {
                    positionH: { posOffset: 5 },
                    positionV: { posOffset: 6 },
                },
            } as never,
        },
        drawingsOrder: ['shape-1', 'shape-2'],
    };
}

function setupDrawingTestBed(docData: IDocumentData) {
    const refreshControls = vi.fn();
    let currentSegment = '';
    let currentSegmentPage = 0;
    let injector!: Injector;
    const docSelectionRenderService = {
        getSegment: () => currentSegment,
        setSegment: (segmentId: string) => {
            currentSegment = segmentId;
        },
        setSegmentPage: (segmentPage: number) => {
            currentSegmentPage = segmentPage;
        },
        getSegmentPage: () => currentSegmentPage,
    };
    const renderManagerService = {
        getRenderById: () => ({
            scene: {
                getTransformerByCreate: () => ({
                    refreshControls,
                }),
            },
            with: <T>(token: T) => {
                if (token === DocSelectionRenderService) {
                    return docSelectionRenderService as T;
                }
                if (token === DocSkeletonManagerService) {
                    const docSkeletonManager = injector.get(DocSkeletonManagerService);

                    return {
                        getSkeleton: () => ({ skeletonId: 'test-skeleton' }),
                        getViewModel: () => docSkeletonManager.getViewModel(),
                    } as T;
                }

                return injector.get(token as never);
            },
        }),
    };
    const testBed = createDocUiTestBed(docData, [
        [IRenderManagerService, { useValue: renderManagerService }],
    ]);
    const { univer, get } = testBed;
    injector = testBed.injector;

    injector.add([DocDrawingService]);
    injector.add([IDocDrawingService, { useClass: DocDrawingService }]);
    injector.add([IDrawingManagerService, { useClass: DrawingManagerService }]);
    injector.add([DocRefreshDrawingsService]);
    injector.add([CoreDocDrawingController]);
    injector.add([DocDrawingAddRemoveController]);

    const commandService = get(ICommandService);
    [
        InsertDocDrawingCommand,
        RemoveDocDrawingCommand,
        DeleteDocDrawingsCommand,
        MoveDocDrawingsCommand,
        SetDocDrawingArrangeCommand,
        UpdateDocDrawingDistanceCommand,
        UpdateDocDrawingWrapTextCommand,
        UpdateDrawingDocTransformCommand,
        IMoveInlineDrawingCommand,
        ITransformNonInlineDrawingCommand,
        RichTextEditingMutation as unknown as ICommand,
    ].forEach((command) => commandService.registerCommand(command));

    const selectionManager = get(DocSelectionManagerService);
    selectionManager.__TEST_ONLY_setCurrentSelection({
        unitId: 'test-doc',
        subUnitId: 'test-doc',
    });

    const coreDocDrawingController = injector.get(CoreDocDrawingController);
    injector.get(DocDrawingAddRemoveController);
    coreDocDrawingController.loadDrawingDataForUnit('test-doc');

    return {
        univer,
        get,
        injector,
        commandService,
        selectionManager,
        docDrawingService: injector.get(IDocDrawingService),
        drawingManagerService: injector.get(IDrawingManagerService),
        docRefreshDrawingsService: injector.get(DocRefreshDrawingsService),
        docSelectionRenderService,
        refreshControls,
    };
}

describe('docs drawing commands integration', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('inserts a drawing through the real mutation chain and synchronizes drawing services', async () => {
        const testBed = setupDrawingTestBed(createBaseDocData());

        testBed.selectionManager.__TEST_ONLY_add([{
            startOffset: 5,
            endOffset: 5,
            collapsed: true,
            isActive: true,
            segmentId: '',
            style: null as never,
        }]);

        expect(await testBed.commandService.executeCommand(InsertDocDrawingCommand.id, {
            drawings: [{
                drawingId: 'shape-1',
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingType: 'image',
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                docTransform: {
                    positionH: { posOffset: 1 },
                    positionV: { posOffset: 2 },
                },
            }],
        })).toBe(true);
        await waitNextTick();

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(doc.getBody()?.dataStream).toBe('Hello\b\r\n');
        expect(doc.getBody()?.customBlocks).toEqual([{ startIndex: 5, blockId: 'shape-1' }]);
        expect(doc.getSnapshot().drawingsOrder).toEqual(['shape-1']);
        expect(doc.getSnapshot().drawings?.['shape-1']).toMatchObject({ drawingId: 'shape-1' });
        expect(testBed.docDrawingService.getDrawingByParam({ unitId: 'test-doc', subUnitId: 'test-doc', drawingId: 'shape-1' })).toMatchObject({
            drawingId: 'shape-1',
        });
        expect(testBed.drawingManagerService.getDrawingOrder('test-doc', 'test-doc')).toEqual(['shape-1']);

        testBed.univer.dispose();
    });

    it('deletes a focused drawing through the command pipeline and removes it from the document and services', async () => {
        const testBed = setupDrawingTestBed(createDrawingDocData());

        testBed.docDrawingService.focusDrawing([{ unitId: 'test-doc', subUnitId: 'test-doc', drawingId: 'shape-1' }]);

        expect(await testBed.commandService.executeCommand(DeleteDocDrawingsCommand.id)).toBe(true);
        await waitNextTick();

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(doc.getBody()?.dataStream).toBe('\r\n');
        expect(doc.getBody()?.customBlocks).toEqual([]);
        expect(doc.getSnapshot().drawings).toEqual({});
        expect(doc.getSnapshot().drawingsOrder).toEqual([]);
        expect(testBed.docDrawingService.getDrawingByParam({ unitId: 'test-doc', subUnitId: 'test-doc', drawingId: 'shape-1' })).toBeUndefined();
        expect(testBed.drawingManagerService.getDrawingByParam({ unitId: 'test-doc', subUnitId: 'test-doc', drawingId: 'shape-1' })).toBeUndefined();

        testBed.univer.dispose();
    });

    it('returns false when deleting drawings without a focused drawing', async () => {
        const testBed = setupDrawingTestBed(createDrawingDocData());

        expect(await testBed.commandService.executeCommand(DeleteDocDrawingsCommand.id)).toBe(false);

        testBed.univer.dispose();
    });

    it('deletes multiple focused drawings through the command pipeline', async () => {
        const testBed = setupDrawingTestBed(createMultiDrawingDocData());

        testBed.docDrawingService.focusDrawing([
            { unitId: 'test-doc', subUnitId: 'test-doc', drawingId: 'shape-1' },
            { unitId: 'test-doc', subUnitId: 'test-doc', drawingId: 'shape-2' },
        ]);

        expect(await testBed.commandService.executeCommand(DeleteDocDrawingsCommand.id)).toBe(true);
        await waitNextTick();

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(doc.getBody()?.dataStream).toBe('\r\n');
        expect(doc.getBody()?.customBlocks).toEqual([]);
        expect(doc.getSnapshot().drawings).toEqual({});
        expect(doc.getSnapshot().drawingsOrder).toEqual([]);

        testBed.univer.dispose();
    });

    it('moves a focused floating drawing by updating the persisted doc transform', async () => {
        const testBed = setupDrawingTestBed(createDrawingDocData());

        testBed.docDrawingService.focusDrawing([{ unitId: 'test-doc', subUnitId: 'test-doc', drawingId: 'shape-1' }]);

        expect(await testBed.commandService.executeCommand(MoveDocDrawingsCommand.id, {
            direction: Direction.RIGHT,
        })).toBe(true);
        await waitNextTick();

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(doc.getSnapshot().drawings?.['shape-1'].docTransform.positionH).toEqual({ posOffset: 3 });
        expect(testBed.refreshControls).toHaveBeenCalled();

        testBed.univer.dispose();
    });

    it('returns false when shortcut move targets only inline drawings', async () => {
        const testBed = setupDrawingTestBed(createInlineDrawingDocData());

        testBed.docDrawingService.focusDrawing([{ unitId: 'test-doc', subUnitId: 'test-doc', drawingId: 'shape-1' }]);

        expect(await testBed.commandService.executeCommand(MoveDocDrawingsCommand.id, {
            direction: Direction.RIGHT,
        })).toBe(false);
        expect(testBed.refreshControls).not.toHaveBeenCalled();

        testBed.univer.dispose();
    });

    it('updates drawing wrap distances through the command pipeline', async () => {
        const testBed = setupDrawingTestBed(createDrawingDocData());

        expect(await testBed.commandService.executeCommand(UpdateDocDrawingDistanceCommand.id, {
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawings: [{
                drawingId: 'shape-1',
            }],
            dist: {
                distT: 12,
                distB: 16,
                distL: 8,
                distR: 10,
            },
        })).toBe(true);
        await waitNextTick();

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(doc.getSnapshot().drawings?.['shape-1']).toMatchObject({
            distT: 12,
            distB: 16,
            distL: 8,
            distR: 10,
        });

        testBed.univer.dispose();
    });

    it('updates drawing wrap text through the command pipeline', async () => {
        const testBed = setupDrawingTestBed(createDrawingDocData());

        expect(await testBed.commandService.executeCommand(UpdateDocDrawingWrapTextCommand.id, {
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawings: [{
                drawingId: 'shape-1',
            }],
            wrapText: WrapTextType.RIGHT,
        })).toBe(true);
        await waitNextTick();

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(doc.getSnapshot().drawings?.['shape-1'].wrapText).toBe(WrapTextType.RIGHT);

        testBed.univer.dispose();
    });

    it('updates drawing doc transform through the command pipeline', async () => {
        const testBed = setupDrawingTestBed(createDrawingDocData());

        expect(await testBed.commandService.executeCommand(UpdateDrawingDocTransformCommand.id, {
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawings: [{
                drawingId: 'shape-1',
                key: 'positionV',
                value: {
                    posOffset: 18,
                },
            }],
        })).toBe(true);
        await waitNextTick();

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(doc.getSnapshot().drawings?.['shape-1'].docTransform.positionV).toEqual({ posOffset: 18 });
        expect(testBed.refreshControls).toHaveBeenCalled();

        testBed.univer.dispose();
    });

    it('reorders drawings through the arrange command and persists the final drawing order', async () => {
        const testBed = setupDrawingTestBed(createMultiDrawingDocData());

        expect(await testBed.commandService.executeCommand(SetDocDrawingArrangeCommand.id, {
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawingIds: ['shape-1'],
            arrangeType: ArrangeTypeEnum.front,
        })).toBe(true);
        await waitNextTick();

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(doc.getSnapshot().drawingsOrder).toEqual(['shape-2', 'shape-1']);

        testBed.univer.dispose();
    });

    it('moves an inline drawing through the real mutation chain and updates the custom block anchor', async () => {
        const testBed = setupDrawingTestBed(createInlineDrawingDocData());

        expect(await testBed.commandService.executeCommand(IMoveInlineDrawingCommand.id, {
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawing: {
                drawingId: 'shape-1',
                unitId: 'test-doc',
                subUnitId: 'test-doc',
            },
            offset: 4,
            segmentId: '',
            segmentPage: 0,
        })).toBe(true);
        await waitNextTick();

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(doc.getBody()?.dataStream).toBe('ABC\b\r\n');
        expect(doc.getBody()?.customBlocks).toEqual([{ startIndex: 3, blockId: 'shape-1' }]);
        expect(testBed.docSelectionRenderService.getSegment()).toBe('');
        expect(testBed.refreshControls).toHaveBeenCalled();

        testBed.univer.dispose();
    });

    it('refreshes drawings instead of mutating the document when inline move requests a redraw', async () => {
        const testBed = setupDrawingTestBed(createInlineDrawingDocData());
        const refreshSpy = vi.fn();
        const refreshSubscription = testBed.docRefreshDrawingsService.refreshDrawings$.subscribe((value) => {
            if (value != null) {
                refreshSpy(value);
            }
        });

        expect(await testBed.commandService.executeCommand(IMoveInlineDrawingCommand.id, {
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawing: {
                drawingId: 'shape-1',
                unitId: 'test-doc',
                subUnitId: 'test-doc',
            },
            offset: 4,
            segmentId: '',
            segmentPage: 0,
            needRefreshDrawings: true,
        })).toBe(true);

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(doc.getBody()?.dataStream).toBe('A\bBC\r\n');
        expect(refreshSpy).toHaveBeenCalledTimes(1);
        expect(testBed.refreshControls).toHaveBeenCalled();

        refreshSubscription.unsubscribe();
        testBed.univer.dispose();
    });

    it('transforms a floating drawing and persists both anchor movement and doc transform updates', async () => {
        const testBed = setupDrawingTestBed(createFloatingDrawingWithTextDocData());

        expect(await testBed.commandService.executeCommand(ITransformNonInlineDrawingCommand.id, {
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawing: {
                drawingId: 'shape-1',
                unitId: 'test-doc',
                subUnitId: 'test-doc',
            },
            offset: 3,
            docTransform: {
                positionH: { posOffset: 14 },
                positionV: { posOffset: 22 },
                size: { width: 120, height: 48 },
                angle: 15,
            },
            segmentId: '',
            segmentPage: 0,
        })).toBe(true);
        await waitNextTick();

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(doc.getBody()?.dataStream).toBe('AB\b\r\n');
        expect(doc.getBody()?.customBlocks).toEqual([{ startIndex: 2, blockId: 'shape-1' }]);
        expect(doc.getSnapshot().drawings?.['shape-1'].docTransform).toEqual({
            positionH: { posOffset: 14 },
            positionV: { posOffset: 22 },
            size: { width: 120, height: 48 },
            angle: 15,
        });
        expect(testBed.refreshControls).toHaveBeenCalled();

        testBed.univer.dispose();
    });
});
