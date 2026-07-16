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

import type { Dependency, DependencyIdentifier, DocumentDataModel, ICommand, IDocumentData } from '@univerjs/core';
import type { IInsertDocDrawingCommandParams, ISetDocDrawingArrangeCommandParams, IUpdateDrawingDocTransformCommandParams } from '@univerjs/docs-drawing';
import {
    ArrangeTypeEnum,
    awaitTime,
    BooleanNumber,
    CommandType,
    Direction,
    DisposableCollection,
    DrawingTypeEnum,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    UniverInstanceType,
    WrapTextType,
} from '@univerjs/core';
import {
    buildDocTransform,
    DocContentInsertService,
    DocSelectionManagerService,
    DocSkeletonManagerService,
    RichTextEditingMutation,
} from '@univerjs/docs';
import {
    DocDrawingController as CoreDocDrawingController,
    DocDrawingAdapterService,
    DocDrawingService,
    IDocDrawingAdapterService,
    IDocDrawingService,
    InsertDocDrawingCommand,
    RemoveDocDrawingCommand,
    SetDocDrawingArrangeCommand,
    TextWrappingStyle,
    UpdateDocDrawingWrappingStyleCommand,
    UpdateDrawingDocTransformCommand,
} from '@univerjs/docs-drawing';
import { DocSelectionRenderService } from '@univerjs/docs-ui';
import { DrawingManagerService, IDrawingManagerService } from '@univerjs/drawing';
import { DocumentEditArea, IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDocUiTestBed } from '../../../__tests__/create-doc-ui-test-bed';
import { DocDrawingAddRemoveController } from '../../../controllers/doc-drawing-notification.controller';
import { DocDrawingUpdateRenderController } from '../../../controllers/render-controllers/doc-drawing-update.render-controller';
import { DocRefreshDrawingsService } from '../../../services/doc-refresh-drawings.service';
import { ClearDocDrawingTransformerOperation } from '../../operations/clear-drawing-transformer.operation';
import { DeleteDocDrawingsCommand } from '../delete-doc-drawing.command';
import { GroupDocDrawingCommand } from '../group-doc-drawing.command';
import { InsertDocImageCommand } from '../insert-image.command';
import { MoveDocDrawingsCommand } from '../move-drawings.command';
import { UngroupDocDrawingCommand } from '../ungroup-doc-drawing.command';
import {
    IMoveInlineDrawingCommand,
    ITransformNonInlineDrawingCommand,
    UpdateDocDrawingDistanceCommand,
    UpdateDocDrawingWrapTextCommand,
} from '../update-doc-drawing.command';

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

function createHeaderDrawingDocData(): IDocumentData {
    const docData = createBaseDocData();
    docData.headers = {
        'header-1': {
            headerId: 'header-1',
            body: {
                dataStream: '\b\r\n',
                customBlocks: [{ startIndex: 0, blockId: 'header-shape-1' }],
            },
        },
    };
    docData.drawings = {
        'header-shape-1': {
            drawingId: 'header-shape-1',
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
            docTransform: {
                positionH: { posOffset: 1 },
                positionV: { posOffset: 2 },
            },
        } as never,
    };
    docData.drawingsOrder = ['header-shape-1'];

    return docData;
}

function createChartDrawingDocData(): IDocumentData {
    return {
        ...createDrawingDocData(),
        drawings: {
            'shape-1': {
                drawingId: 'shape-1',
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingType: DrawingTypeEnum.DRAWING_CHART,
                chartId: 'chart-1',
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                docTransform: {
                    positionH: { posOffset: 1 },
                    positionV: { posOffset: 2 },
                },
            } as never,
        },
    };
}

function createMultiDrawingDocData(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: '\b\b\b\r\n',
            customBlocks: [
                { startIndex: 0, blockId: 'drawing-a' },
                { startIndex: 1, blockId: 'drawing-b' },
                { startIndex: 2, blockId: 'drawing-c' },
            ],
        },
        drawings: {
            'drawing-a': {
                drawingId: 'drawing-a',
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingType: 'image',
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                docTransform: { positionH: { posOffset: 1 }, positionV: { posOffset: 2 } },
            } as never,
            'drawing-b': {
                drawingId: 'drawing-b',
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingType: 'image',
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                docTransform: { positionH: { posOffset: 3 }, positionV: { posOffset: 4 } },
            } as never,
            'drawing-c': {
                drawingId: 'drawing-c',
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingType: 'image',
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                docTransform: { positionH: { posOffset: 5 }, positionV: { posOffset: 6 } },
            } as never,
        },
        drawingsOrder: ['drawing-a', 'drawing-b', 'drawing-c'],
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

function createInlineMoveDocData(): IDocumentData {
    return {
        id: 'test-doc',
        body: {
            dataStream: 'A\bB\r\n',
            customBlocks: [{
                startIndex: 1,
                blockId: 'shape-1',
            }],
        },
        headers: {
            'header-1': {
                headerId: 'header-1',
                body: {
                    dataStream: 'Header\r\n',
                    customBlocks: [],
                },
            },
        },
        drawings: {
            'shape-1': {
                drawingId: 'shape-1',
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingType: 'image',
                layoutType: PositionedObjectLayoutType.INLINE,
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

function createGroupedDrawingDocData(): IDocumentData {
    const docData = createMultiDrawingDocData();
    docData.drawings!['group-1'] = {
        drawingId: 'group-1',
        unitId: 'test-doc',
        subUnitId: 'test-doc',
        drawingType: DrawingTypeEnum.DRAWING_GROUP,
        layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
        docTransform: { positionH: { posOffset: 0 }, positionV: { posOffset: 0 } },
    } as never;
    docData.drawings!['drawing-a'].groupId = 'group-1';
    docData.drawings!['drawing-b'].groupId = 'group-1';
    docData.drawingsOrder = ['drawing-c', 'group-1'];

    return docData;
}

class TestDocDrawingUpdateRenderController {
    private _inserted = false;

    get inserted(): boolean {
        return this._inserted;
    }

    insertDocImage(): boolean {
        this._inserted = true;
        return true;
    }
}

function setupDrawingTestBed(docData: IDocumentData, dependencies: Dependency[] = []) {
    const refreshControls = vi.fn();
    const testBed = createDocUiTestBed(docData, [
        [IRenderManagerService, { useClass: RenderManagerService }],
        ...dependencies,
    ]);
    const { univer, get } = testBed;
    const injector = testBed.injector;

    const scene = new DisposableCollection() as any;
    const transformer = {
        refreshControls,
        debounceRefreshControls: refreshControls,
    };
    scene.getTransformerByCreate = () => transformer;
    scene.getTransformer = () => transformer;
    let currentSegment = '';
    let currentSegmentPage = 0;
    get(IRenderManagerService).addRender('test-doc', {
        unitId: 'test-doc',
        type: UniverInstanceType.UNIVER_DOC,
        engine: new DisposableCollection() as any,
        scene,
        mainComponent: null as any,
        components: new Map(),
        isMainScene: true,
        activated$: new BehaviorSubject(true),
        with: <T>(token: DependencyIdentifier<T>) => {
            if (token === DocSelectionRenderService) {
                return {
                    getSegment: () => currentSegment,
                    setSegment: (segmentId: string) => currentSegment = segmentId,
                    getSegmentPage: () => currentSegmentPage,
                    setSegmentPage: (page: number) => currentSegmentPage = page,
                } as T;
            }

            return injector.get(token);
        },
        activate: () => {},
        deactivate: () => {},
        isDisposed: () => false,
    });

    injector.add([DocDrawingService]);
    injector.add([IDocDrawingService, { useClass: DocDrawingService }]);
    injector.add([DocDrawingAdapterService]);
    injector.add([IDocDrawingAdapterService, { useClass: DocDrawingAdapterService }]);
    injector.add([IDrawingManagerService, { useClass: DrawingManagerService }]);
    injector.add([DocContentInsertService]);
    injector.add([DocRefreshDrawingsService]);
    injector.add([CoreDocDrawingController]);
    injector.add([DocDrawingAddRemoveController]);

    const commandService = get(ICommandService);
    [
        DeleteDocDrawingsCommand,
        MoveDocDrawingsCommand,
        GroupDocDrawingCommand,
        UngroupDocDrawingCommand,
        ClearDocDrawingTransformerOperation,
        InsertDocImageCommand,
        IMoveInlineDrawingCommand,
        ITransformNonInlineDrawingCommand,
        UpdateDocDrawingDistanceCommand,
        UpdateDocDrawingWrapTextCommand,
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

        expect(await testBed.commandService.executeCommand<IInsertDocDrawingCommandParams>(InsertDocDrawingCommand.id, {
            unitId: 'test-doc',
            drawings: [{
                drawingId: 'shape-1',
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                docTransform: {
                    size: { width: 1, height: 1 },
                    positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 1 },
                    positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 2 },
                    angle: 0,
                },
            }],
        })).toBe(true);
        await awaitTime(0);

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

    it('uses the explicit content insert range for drawing insertion', async () => {
        const insertOffset = 5;
        const testBed = setupDrawingTestBed(createBaseDocData());

        testBed.selectionManager.__TEST_ONLY_add([{
            startOffset: 0,
            endOffset: 0,
            collapsed: true,
            isActive: true,
            segmentId: '',
            style: null as never,
        }]);
        testBed.get(DocContentInsertService).setInsertRange({
            unitId: 'test-doc',
            startOffset: insertOffset,
            endOffset: insertOffset,
        });

        expect(await testBed.commandService.executeCommand<IInsertDocDrawingCommandParams>(InsertDocDrawingCommand.id, {
            unitId: 'test-doc',
            drawings: [{
                drawingId: 'shape-1',
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                docTransform: {
                    size: { width: 1, height: 1 },
                    positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 1 },
                    positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 2 },
                    angle: 0,
                },
            }],
        })).toBe(true);
        await awaitTime(0);

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(doc.getBody()?.dataStream).toBe('Hello\b\r\n');
        expect(doc.getBody()?.customBlocks).toEqual([{ startIndex: insertOffset, blockId: 'shape-1' }]);

        testBed.univer.dispose();
    });

    it('uses an explicit text range from command params for drawing insertion', async () => {
        const insertOffset = 3;
        const testBed = setupDrawingTestBed(createBaseDocData());

        testBed.selectionManager.__TEST_ONLY_add([{
            startOffset: 0,
            endOffset: 0,
            collapsed: true,
            isActive: true,
            segmentId: '',
            style: null as never,
        }]);

        expect(await testBed.commandService.executeCommand<IInsertDocDrawingCommandParams>(InsertDocDrawingCommand.id, {
            unitId: 'test-doc',
            textRange: {
                startOffset: insertOffset,
                endOffset: insertOffset,
                collapsed: true,
                segmentId: '',
            },
            drawings: [{
                drawingId: 'shape-1',
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                docTransform: {
                    size: { width: 1, height: 1 },
                    positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 1 },
                    positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 2 },
                    angle: 0,
                },
            }],
        })).toBe(true);
        await awaitTime(0);

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(doc.getBody()?.dataStream).toBe('Hel\blo\r\n');
        expect(doc.getBody()?.customBlocks).toEqual([{ startIndex: insertOffset, blockId: 'shape-1' }]);

        testBed.univer.dispose();
    });

    it('inserts into the document specified by the command params', async () => {
        const testBed = setupDrawingTestBed(createBaseDocData());
        const targetData = createBaseDocData();
        targetData.id = 'target-doc';
        const targetDoc = testBed.univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, targetData);

        testBed.injector.get(CoreDocDrawingController).loadDrawingDataForUnit('target-doc');
        testBed.get(IUniverInstanceService).setCurrentUnitForType('test-doc');

        expect(await testBed.commandService.executeCommand<IInsertDocDrawingCommandParams>(InsertDocDrawingCommand.id, {
            unitId: 'target-doc',
            textRange: {
                startOffset: 5,
                endOffset: 5,
                collapsed: true,
                segmentId: '',
            },
            drawings: [{
                drawingId: 'target-shape-1',
                unitId: 'target-doc',
                subUnitId: 'target-doc',
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                docTransform: {
                    size: { width: 1, height: 1 },
                    positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 1 },
                    positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 2 },
                    angle: 0,
                },
            }],
        })).toBe(true);

        expect(targetDoc.getBody()?.customBlocks).toEqual([{ startIndex: 5, blockId: 'target-shape-1' }]);
        expect(testBed.get(IUniverInstanceService).getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)?.getBody()?.customBlocks).toEqual([]);

        testBed.univer.dispose();
    });

    it('replaces the selected drawing block when inserting a new drawing over a selection', async () => {
        const testBed = setupDrawingTestBed(createDrawingDocData());

        testBed.selectionManager.__TEST_ONLY_add([{
            startOffset: 0,
            endOffset: 1,
            collapsed: false,
            isActive: true,
            segmentId: '',
            style: null as never,
        }]);

        expect(await testBed.commandService.executeCommand<IInsertDocDrawingCommandParams>(InsertDocDrawingCommand.id, {
            unitId: 'test-doc',
            drawings: [{
                drawingId: 'shape-2',
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                docTransform: {
                    size: { width: 1, height: 1 },
                    positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 10 },
                    positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 20 },
                    angle: 0,
                },
            }],
        })).toBe(true);
        await awaitTime(0);

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(doc.getBody()?.dataStream).toBe('\b\r\n');
        expect(doc.getBody()?.customBlocks).toEqual([{ startIndex: 0, blockId: 'shape-2' }]);
        expect(doc.getSnapshot().drawings?.['shape-1']).toBeUndefined();
        expect(doc.getSnapshot().drawings?.['shape-2']).toMatchObject({ drawingId: 'shape-2' });
        expect(doc.getSnapshot().drawingsOrder).toEqual(['shape-2']);

        testBed.univer.dispose();
    });

    it('deletes a focused drawing through the command pipeline and removes it from the document and services', async () => {
        const testBed = setupDrawingTestBed(createDrawingDocData());

        testBed.docDrawingService.focusDrawing([{ unitId: 'test-doc', subUnitId: 'test-doc', drawingId: 'shape-1' }]);

        expect(await testBed.commandService.executeCommand(DeleteDocDrawingsCommand.id)).toBe(true);
        await awaitTime(0);

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

    it('deletes from the explicit text range segment instead of the active selection segment', async () => {
        const testBed = setupDrawingTestBed(createHeaderDrawingDocData());

        expect(await testBed.commandService.executeCommand(RemoveDocDrawingCommand.id, {
            unitId: 'test-doc',
            drawings: [{
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingId: 'header-shape-1',
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            }],
            textRange: {
                startOffset: 0,
                endOffset: 0,
                collapsed: true,
                segmentId: 'header-1',
            },
        } as never)).toBe(true);

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(doc.getSelfOrHeaderFooterModel('header-1')?.getBody()?.customBlocks).toEqual([]);
        expect(doc.getSnapshot().drawings?.['header-shape-1']).toBeUndefined();

        testBed.univer.dispose();
    });

    it('deletes from the document specified by the command params', async () => {
        const testBed = setupDrawingTestBed(createBaseDocData());
        const targetData = createDrawingDocData();
        targetData.id = 'target-doc';
        targetData.drawings!['shape-1'].unitId = 'target-doc';
        targetData.drawings!['shape-1'].subUnitId = 'target-doc';
        const targetDoc = testBed.univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, targetData);

        testBed.injector.get(CoreDocDrawingController).loadDrawingDataForUnit('target-doc');
        testBed.get(IUniverInstanceService).setCurrentUnitForType('test-doc');

        expect(await testBed.commandService.executeCommand(RemoveDocDrawingCommand.id, {
            unitId: 'target-doc',
            drawings: [{
                unitId: 'target-doc',
                subUnitId: 'target-doc',
                drawingId: 'shape-1',
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            }],
        })).toBe(true);

        expect(targetDoc.getBody()?.customBlocks).toEqual([]);
        expect(targetDoc.getSnapshot().drawings).toEqual({});
        expect(testBed.get(IUniverInstanceService).getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)?.getBody()?.customBlocks).toEqual([]);

        testBed.univer.dispose();
    });

    it('includes drawing adapter resource mutations in the same undo item when deleting a drawing', async () => {
        const testBed = setupDrawingTestBed(createChartDrawingDocData());
        const removeResourceMutation = {
            id: 'test.mutation.remove-doc-chart-resource',
            type: CommandType.MUTATION,
            handler: vi.fn(() => true),
        };
        const restoreResourceMutation = {
            id: 'test.mutation.restore-doc-chart-resource',
            type: CommandType.MUTATION,
            handler: vi.fn(() => true),
        };
        testBed.commandService.registerCommand(removeResourceMutation);
        testBed.commandService.registerCommand(restoreResourceMutation);
        const getRemoveDrawingMutationInfos = vi.fn(() => ({
            redoMutations: [{ id: removeResourceMutation.id, params: { chartId: 'chart-1' } }],
            undoMutations: [{ id: restoreResourceMutation.id, params: { chartId: 'chart-1' } }],
        }));
        testBed.get(IDocDrawingAdapterService).registerAdapter({ getRemoveDrawingMutationInfos });

        testBed.docDrawingService.focusDrawing([{ unitId: 'test-doc', subUnitId: 'test-doc', drawingId: 'shape-1' }]);

        expect(await testBed.commandService.executeCommand(DeleteDocDrawingsCommand.id)).toBe(true);
        await awaitTime(0);

        expect(getRemoveDrawingMutationInfos).toHaveBeenCalledWith({
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawing: expect.objectContaining({
                drawingId: 'shape-1',
                drawingType: DrawingTypeEnum.DRAWING_CHART,
                chartId: 'chart-1',
            }),
            removeDrawings: [expect.objectContaining({ drawingId: 'shape-1' })],
        });
        expect(removeResourceMutation.handler).toHaveBeenCalled();

        const undoItem = testBed.get(IUndoRedoService).pitchTopUndoElement();
        expect(undoItem?.redoMutations.map((mutation) => mutation.id)).toEqual([
            removeResourceMutation.id,
            RichTextEditingMutation.id,
        ]);
        expect(undoItem?.undoMutations.map((mutation) => mutation.id)).toEqual([
            restoreResourceMutation.id,
            RichTextEditingMutation.id,
        ]);

        testBed.univer.dispose();
    });

    it('does not delete the document drawing when adapter resource removal fails', async () => {
        const testBed = setupDrawingTestBed(createChartDrawingDocData());
        const removeResourceMutation = {
            id: 'test.mutation.remove-doc-chart-resource',
            type: CommandType.MUTATION,
            handler: vi.fn(() => false),
        };
        testBed.commandService.registerCommand(removeResourceMutation);
        testBed.get(IDocDrawingAdapterService).registerAdapter({
            getRemoveDrawingMutationInfos: () => ({
                redoMutations: [{ id: removeResourceMutation.id, params: { chartId: 'chart-1' } }],
                undoMutations: [{ id: 'test.mutation.restore-doc-chart-resource', params: { chartId: 'chart-1' } }],
            }),
        });

        testBed.docDrawingService.focusDrawing([{ unitId: 'test-doc', subUnitId: 'test-doc', drawingId: 'shape-1' }]);

        expect(await testBed.commandService.executeCommand(DeleteDocDrawingsCommand.id)).toBe(false);

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;
        expect(doc.getSnapshot().drawings?.['shape-1']).toMatchObject({ drawingId: 'shape-1' });
        expect(doc.getBody()?.customBlocks).toEqual([{ startIndex: 0, blockId: 'shape-1' }]);

        testBed.univer.dispose();
    });

    it('moves a focused floating drawing by updating the persisted doc transform', async () => {
        const testBed = setupDrawingTestBed(createDrawingDocData());
        vi.spyOn(testBed.get(DocSkeletonManagerService), 'getSkeleton').mockReturnValue({} as never);

        testBed.docDrawingService.focusDrawing([{ unitId: 'test-doc', subUnitId: 'test-doc', drawingId: 'shape-1' }]);

        expect(await testBed.commandService.executeCommand(MoveDocDrawingsCommand.id, {
            direction: Direction.RIGHT,
        })).toBe(true);
        await awaitTime(0);

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(doc.getSnapshot().drawings?.['shape-1'].docTransform.positionH).toEqual({ posOffset: 3 });
        expect(testBed.refreshControls).toHaveBeenCalled();

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
        await awaitTime(0);

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
        await awaitTime(0);

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(doc.getSnapshot().drawings?.['shape-1'].wrapText).toBe(WrapTextType.RIGHT);

        testBed.univer.dispose();
    });

    it('keeps table cell drawing position when switching from inline to floating layout', async () => {
        const docData = createDrawingDocData();
        docData.drawings!['shape-1'].layoutType = PositionedObjectLayoutType.INLINE;
        docData.drawings!['shape-1'].docTransform = buildDocTransform(40, 24, {
            left: 999,
            top: 999,
        });
        const testBed = setupDrawingTestBed(docData);
        const skeletonManager = testBed.injector.get(DocSkeletonManagerService);
        vi.spyOn(skeletonManager, 'getViewModel').mockReturnValue({
            getEditArea: () => DocumentEditArea.BODY,
            reset: vi.fn(),
        } as never);
        vi.spyOn(skeletonManager, 'getSkeleton').mockReturnValue({
            getSkeletonData: () => ({
                pages: [{
                    marginTop: 72,
                    marginLeft: 90,
                    marginBottom: 72,
                    pageHeight: 800,
                    pageWidth: 600,
                    headerId: '',
                    footerId: '',
                    skeDrawings: new Map(),
                    skeTables: new Map([
                        ['table-1', {
                            rows: [{
                                cells: [{
                                    marginTop: 4,
                                    marginLeft: 5,
                                    skeDrawings: new Map([
                                        ['shape-1', {
                                            drawingId: 'shape-1',
                                            aLeft: 12,
                                            aTop: 20,
                                            columnLeft: 3,
                                            lineTop: 7,
                                            blockAnchorTop: 15,
                                            drawingOrigin: docData.drawings!['shape-1'],
                                        }],
                                    ]),
                                    skeTables: new Map(),
                                }],
                            }],
                        }],
                    ]),
                }],
                skeHeaders: new Map(),
                skeFooters: new Map(),
            }),
        } as never);

        expect(await testBed.commandService.executeCommand(UpdateDocDrawingWrappingStyleCommand.id, {
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawings: [{
                drawingId: 'shape-1',
            }],
            wrappingStyle: TextWrappingStyle.WRAP_SQUARE,
        })).toBe(true);
        await awaitTime(0);

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;
        const drawing = doc.getSnapshot().drawings?.['shape-1'];

        expect(drawing?.layoutType).toBe(PositionedObjectLayoutType.WRAP_SQUARE);
        expect(drawing?.docTransform.positionH).toEqual({
            relativeFrom: ObjectRelativeFromH.PAGE,
            posOffset: 12,
        });
        expect(drawing?.docTransform.positionV).toEqual({
            relativeFrom: ObjectRelativeFromV.PARAGRAPH,
            posOffset: 5,
        });

        testBed.univer.dispose();
    });

    it('updates drawing behind-text wrapping and keeps the anchor position in page coordinates', async () => {
        const docData = createDrawingDocData();
        docData.drawings!['shape-1'].docTransform = {
            positionH: {
                relativeFrom: ObjectRelativeFromH.MARGIN,
                posOffset: 999,
            },
            positionV: {
                relativeFrom: ObjectRelativeFromV.PAGE,
                posOffset: 999,
            },
            angle: 0,
        } as never;
        const testBed = setupDrawingTestBed(docData);
        const skeletonManager = testBed.injector.get(DocSkeletonManagerService);
        vi.spyOn(skeletonManager, 'getViewModel').mockReturnValue({
            getEditArea: () => DocumentEditArea.BODY,
            reset: vi.fn(),
        } as never);
        vi.spyOn(skeletonManager, 'getSkeleton').mockReturnValue({
            getSkeletonData: () => ({
                pages: [{
                    marginTop: 72,
                    marginLeft: 90,
                    marginBottom: 72,
                    pageHeight: 800,
                    pageWidth: 600,
                    headerId: '',
                    footerId: '',
                    skeDrawings: new Map([
                        ['shape-1', {
                            drawingId: 'shape-1',
                            aLeft: 140,
                            aTop: 30,
                            columnLeft: 0,
                            lineTop: 0,
                            blockAnchorTop: 0,
                            drawingOrigin: docData.drawings!['shape-1'],
                        }],
                    ]),
                    skeTables: new Map(),
                }],
                skeHeaders: new Map(),
                skeFooters: new Map(),
            }),
        } as never);

        expect(await testBed.commandService.executeCommand(UpdateDocDrawingWrappingStyleCommand.id, {
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawings: [{
                drawingId: 'shape-1',
            }],
            wrappingStyle: TextWrappingStyle.BEHIND_TEXT,
        })).toBe(true);
        await awaitTime(0);

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;
        const drawing = doc.getSnapshot().drawings?.['shape-1'];

        expect(drawing?.layoutType).toBe(PositionedObjectLayoutType.WRAP_NONE);
        expect(drawing?.behindDoc).toBe(BooleanNumber.TRUE);
        expect(drawing?.docTransform.positionH).toEqual({
            relativeFrom: ObjectRelativeFromH.MARGIN,
            posOffset: 50,
        });
        expect(drawing?.docTransform.positionV).toEqual({
            relativeFrom: ObjectRelativeFromV.PAGE,
            posOffset: 102,
        });

        testBed.univer.dispose();
    });

    it('updates drawing doc transform through the command pipeline', async () => {
        const testBed = setupDrawingTestBed(createDrawingDocData());
        const skeleton = {} as never;
        vi.spyOn(testBed.get(DocSkeletonManagerService), 'getSkeleton').mockReturnValue(skeleton);
        const refreshDrawings = vi.spyOn(testBed.get(DocRefreshDrawingsService), 'refreshDrawings');

        expect(await testBed.commandService.executeCommand<IUpdateDrawingDocTransformCommandParams>(UpdateDrawingDocTransformCommand.id, {
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawings: [{
                drawingId: 'shape-1',
                key: 'positionV',
                value: {
                    relativeFrom: ObjectRelativeFromV.PAGE,
                    posOffset: 18,
                },
            }],
        })).toBe(true);
        await awaitTime(0);

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(doc.getSnapshot().drawings?.['shape-1'].docTransform.positionV).toEqual({
            relativeFrom: ObjectRelativeFromV.PAGE,
            posOffset: 18,
        });
        expect(testBed.refreshControls).toHaveBeenCalled();
        expect(refreshDrawings).toHaveBeenCalledWith(skeleton);

        testBed.univer.dispose();
    });

    it('transforms a non-inline drawing and persists position, size and angle changes', async () => {
        const testBed = setupDrawingTestBed(createDrawingDocData());

        expect(await testBed.commandService.executeCommand(ITransformNonInlineDrawingCommand.id, {
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawing: {
                drawingId: 'shape-1',
            },
            offset: 0,
            segmentId: '',
            segmentPage: 0,
            docTransform: {
                positionH: {
                    relativeFrom: ObjectRelativeFromH.PAGE,
                    posOffset: 30,
                },
                positionV: {
                    relativeFrom: ObjectRelativeFromV.PAGE,
                    posOffset: 40,
                },
                size: {
                    width: 120,
                    height: 80,
                },
                angle: 15,
            },
        })).toBe(true);
        await awaitTime(0);

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(doc.getSnapshot().drawings?.['shape-1'].docTransform).toMatchObject({
            positionH: {
                relativeFrom: ObjectRelativeFromH.PAGE,
                posOffset: 30,
            },
            positionV: {
                relativeFrom: ObjectRelativeFromV.PAGE,
                posOffset: 40,
            },
            size: {
                width: 120,
                height: 80,
            },
            angle: 15,
        });
        expect(testBed.refreshControls).toHaveBeenCalled();

        testBed.univer.dispose();
    });

    it('refreshes inline drawing controls when the inline anchor needs to be recalculated', async () => {
        const testBed = setupDrawingTestBed(createDrawingDocData());
        const skeletonManager = testBed.injector.get(DocSkeletonManagerService);
        vi.spyOn(skeletonManager, 'getSkeleton').mockReturnValue({} as never);

        expect(await testBed.commandService.executeCommand(IMoveInlineDrawingCommand.id, {
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawing: {
                drawingId: 'shape-1',
            },
            offset: 0,
            segmentId: '',
            segmentPage: 0,
            needRefreshDrawings: true,
        })).toBe(true);

        expect(testBed.refreshControls).toHaveBeenCalled();

        testBed.univer.dispose();
    });

    it('moves an inline drawing to an earlier text anchor in the same document segment', async () => {
        const testBed = setupDrawingTestBed(createInlineMoveDocData());
        const skeletonManager = testBed.injector.get(DocSkeletonManagerService);
        vi.spyOn(skeletonManager, 'getSkeleton').mockReturnValue({} as never);

        expect(await testBed.commandService.executeCommand(IMoveInlineDrawingCommand.id, {
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawing: {
                drawingId: 'shape-1',
            },
            offset: 0,
            segmentId: '',
            segmentPage: 0,
        })).toBe(true);
        await awaitTime(0);

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(doc.getBody()?.dataStream).toBe('\bAB\r\n');
        expect(doc.getBody()?.customBlocks).toEqual([{ startIndex: 0, blockId: 'shape-1' }]);
        expect(testBed.refreshControls).toHaveBeenCalled();

        testBed.univer.dispose();
    });

    it('moves an inline drawing from the document body into a header segment', async () => {
        const testBed = setupDrawingTestBed(createInlineMoveDocData());
        const skeletonManager = testBed.injector.get(DocSkeletonManagerService);
        vi.spyOn(skeletonManager, 'getSkeleton').mockReturnValue({} as never);

        expect(await testBed.commandService.executeCommand(IMoveInlineDrawingCommand.id, {
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawing: {
                drawingId: 'shape-1',
            },
            offset: 2,
            segmentId: 'header-1',
            segmentPage: 1,
        })).toBe(true);
        await awaitTime(0);

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;
        const header = doc.getSelfOrHeaderFooterModel('header-1');

        expect(doc.getBody()?.dataStream).toBe('AB\r\n');
        expect(doc.getBody()?.customBlocks).toEqual([]);
        expect(header?.getBody()?.dataStream).toBe('He\bader\r\n');
        expect(header?.getBody()?.customBlocks).toEqual([{ startIndex: 2, blockId: 'shape-1' }]);
        expect(testBed.refreshControls).toHaveBeenCalled();

        testBed.univer.dispose();
    });

    it('arranges doc drawing order through the rich text mutation pipeline', async () => {
        const testBed = setupDrawingTestBed(createMultiDrawingDocData());
        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(doc.getSnapshot().drawingsOrder).toEqual(['drawing-a', 'drawing-b', 'drawing-c']);

        expect(await testBed.commandService.executeCommand<ISetDocDrawingArrangeCommandParams>(SetDocDrawingArrangeCommand.id, {
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawingIds: ['drawing-a'],
            arrangeType: ArrangeTypeEnum.front,
        })).toBe(true);
        await awaitTime(0);
        expect(doc.getSnapshot().drawingsOrder).toEqual(['drawing-b', 'drawing-c', 'drawing-a']);

        expect(await testBed.commandService.executeCommand<ISetDocDrawingArrangeCommandParams>(SetDocDrawingArrangeCommand.id, {
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawingIds: ['drawing-a'],
            arrangeType: ArrangeTypeEnum.backward,
        })).toBe(true);
        await awaitTime(0);
        expect(doc.getSnapshot().drawingsOrder).toEqual(['drawing-b', 'drawing-a', 'drawing-c']);

        expect(await testBed.commandService.executeCommand<ISetDocDrawingArrangeCommandParams>(SetDocDrawingArrangeCommand.id, {
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawingIds: ['drawing-b'],
            arrangeType: ArrangeTypeEnum.forward,
        })).toBe(true);
        await awaitTime(0);
        expect(doc.getSnapshot().drawingsOrder).toEqual(['drawing-a', 'drawing-b', 'drawing-c']);

        expect(await testBed.commandService.executeCommand<ISetDocDrawingArrangeCommandParams>(SetDocDrawingArrangeCommand.id, {
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawingIds: ['drawing-c'],
            arrangeType: ArrangeTypeEnum.back,
        })).toBe(true);
        await awaitTime(0);
        expect(doc.getSnapshot().drawingsOrder).toEqual(['drawing-c', 'drawing-a', 'drawing-b']);

        testBed.univer.dispose();
    });

    it('keeps doc drawings unchanged because docs grouping is currently not applied', async () => {
        const testBed = setupDrawingTestBed(createMultiDrawingDocData());
        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(await testBed.commandService.executeCommand(GroupDocDrawingCommand.id, [{
            parent: {
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingId: 'group-1',
                drawingType: DrawingTypeEnum.DRAWING_GROUP,
            },
            children: [
                { unitId: 'test-doc', subUnitId: 'test-doc', drawingId: 'drawing-a', groupId: 'group-1' },
                { unitId: 'test-doc', subUnitId: 'test-doc', drawingId: 'drawing-b', groupId: 'group-1' },
            ],
        }])).toBe(false);

        expect(doc.getSnapshot().drawings?.['group-1']).toBeUndefined();
        expect(doc.getSnapshot().drawings?.['drawing-a'].groupId).toBeUndefined();
        expect(doc.getSnapshot().drawings?.['drawing-b'].groupId).toBeUndefined();
        expect(doc.getSnapshot().drawingsOrder).toEqual(['drawing-a', 'drawing-b', 'drawing-c']);

        testBed.univer.dispose();
    });

    it('keeps grouped doc drawings unchanged because docs ungrouping is currently not applied', async () => {
        const testBed = setupDrawingTestBed(createGroupedDrawingDocData());
        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(await testBed.commandService.executeCommand(UngroupDocDrawingCommand.id, [{
            parent: {
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingId: 'group-1',
                drawingType: DrawingTypeEnum.DRAWING_GROUP,
            },
            children: [
                { unitId: 'test-doc', subUnitId: 'test-doc', drawingId: 'drawing-a' },
                { unitId: 'test-doc', subUnitId: 'test-doc', drawingId: 'drawing-b' },
            ],
        }])).toBe(false);

        expect(doc.getSnapshot().drawings?.['group-1']).toMatchObject({ drawingId: 'group-1' });
        expect(doc.getSnapshot().drawings?.['drawing-a'].groupId).toBe('group-1');
        expect(doc.getSnapshot().drawings?.['drawing-b'].groupId).toBe('group-1');
        expect(doc.getSnapshot().drawingsOrder).toEqual(['drawing-c', 'group-1']);

        testBed.univer.dispose();
    });

    it('clears the doc drawing transformer for the active render scene', async () => {
        const testBed = setupDrawingTestBed(createDrawingDocData());

        expect(await testBed.commandService.executeCommand(ClearDocDrawingTransformerOperation.id, ['test-doc'])).toBe(true);
        expect(testBed.refreshControls).toHaveBeenCalled();

        testBed.univer.dispose();
    });

    it('inserts an image through the current doc render controller', async () => {
        const testBed = setupDrawingTestBed(createBaseDocData(), [
            [DocDrawingUpdateRenderController, { useClass: TestDocDrawingUpdateRenderController as never }],
        ]);
        const updateController = testBed.injector.get(DocDrawingUpdateRenderController) as unknown as TestDocDrawingUpdateRenderController;

        expect(await testBed.commandService.executeCommand(InsertDocImageCommand.id, { files: null })).toBe(true);
        expect(updateController.inserted).toBe(true);

        testBed.univer.dispose();
    });
});
