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
    awaitTime,
    Direction,
    ICommandService,
    IUniverInstanceService,
    PositionedObjectLayoutType,
    UniverInstanceType,
    WrapTextType,
} from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { DocDrawingController as CoreDocDrawingController, DocDrawingService, IDocDrawingService } from '@univerjs/docs-drawing';
import { DocSelectionRenderService } from '@univerjs/docs-ui';
import { DrawingManagerService, IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDocUiTestBed } from '../../../__tests__/create-doc-ui-test-bed';
import { DocDrawingAddRemoveController } from '../../../controllers/doc-drawing-notification.controller';
import { DeleteDocDrawingsCommand } from '../delete-doc-drawing.command';
import { InsertDocDrawingCommand } from '../insert-doc-drawing.command';
import { MoveDocDrawingsCommand } from '../move-drawings.command';
import { RemoveDocDrawingCommand } from '../remove-doc-drawing.command';
import { UpdateDocDrawingDistanceCommand, UpdateDocDrawingWrapTextCommand, UpdateDrawingDocTransformCommand } from '../update-doc-drawing.command';

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

function setupDrawingTestBed(docData: IDocumentData) {
    const refreshControls = vi.fn();
    let injector!: Injector;
    const renderManagerService = {
        getRenderById: () => ({
            scene: {
                getTransformerByCreate: () => ({
                    refreshControls,
                }),
            },
            with: <T>(token: T) => {
                if (token === DocSelectionRenderService) {
                    return {
                        getSegment: () => '',
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
    injector.add([CoreDocDrawingController]);
    injector.add([DocDrawingAddRemoveController]);

    const commandService = get(ICommandService);
    [
        InsertDocDrawingCommand,
        RemoveDocDrawingCommand,
        DeleteDocDrawingsCommand,
        MoveDocDrawingsCommand,
        UpdateDocDrawingDistanceCommand,
        UpdateDocDrawingWrapTextCommand,
        UpdateDrawingDocTransformCommand,
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

    it('moves a focused floating drawing by updating the persisted doc transform', async () => {
        const testBed = setupDrawingTestBed(createDrawingDocData());

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
        await awaitTime(0);

        const doc = testBed.get(IUniverInstanceService)
            .getUnit<DocumentDataModel>('test-doc', UniverInstanceType.UNIVER_DOC)!;

        expect(doc.getSnapshot().drawings?.['shape-1'].docTransform.positionV).toEqual({ posOffset: 18 });
        expect(testBed.refreshControls).toHaveBeenCalled();

        testBed.univer.dispose();
    });
});
