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

import type { IUpdateDrawingDocTransformCommandParams } from '../update-doc-drawing-transform.command';
import {
    awaitTime,
    DocumentFlavor,
    DrawingTypeEnum,
    ICommandService,
    ImageSourceType,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    RedoCommand,
    UndoCommand,
} from '@univerjs/core';
import { DocHistoryAction, RichTextEditingMutation } from '@univerjs/docs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFacadeTestBed } from '../../../facade/__tests__/create-test-bed';
import { UpdateDrawingDocTransformCommand } from '../update-doc-drawing-transform.command';

class MockImage {
    width = 800;
    height = 400;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;

    get src(): string {
        return '';
    }

    set src(_value: string) {
        queueMicrotask(() => this.onload?.());
    }
}

describe('UpdateDrawingDocTransformCommand', () => {
    let testBed: ReturnType<typeof createFacadeTestBed>;

    beforeEach(() => {
        vi.stubGlobal('Image', MockImage);
        testBed = createFacadeTestBed();
    });

    afterEach(() => {
        testBed.univer.dispose();
        vi.unstubAllGlobals();
    });

    it('persists image crop geometry and restores it through undo and redo', async () => {
        const image = await testBed.document.insertImage({
            source: 'data:image/png;base64,image',
            imageSourceType: ImageSourceType.BASE64,
            width: 160,
            height: 90,
            textRange: { startOffset: 3, endOffset: 3, collapsed: true, segmentId: '' },
        });
        if (!image) {
            throw new Error('Image insertion failed');
        }
        const drawingId = image.getId();
        const before = structuredClone(testBed.documentDataModel.getDrawings()?.[drawingId]);
        const commandService = testBed.injector.get(ICommandService);
        expect(commandService.syncExecuteCommand<IUpdateDrawingDocTransformCommandParams>(
            UpdateDrawingDocTransformCommand.id,
            {
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawings: [
                    { drawingId, key: 'prstGeom', value: 'roundRect' },
                    { drawingId, key: 'adjustValues', value: { adj: 25000 } },
                    { drawingId, key: 'srcRect', value: { left: 10, top: 0, right: 10, bottom: 0 } },
                ],
            }
        )).toBe(true);
        const after = structuredClone(testBed.documentDataModel.getDrawings()?.[drawingId]);
        expect(after).toMatchObject({
            prstGeom: 'roundRect',
            adjustValues: { adj: 25000 },
            srcRect: { left: 10, top: 0, right: 10, bottom: 0 },
            docTransform: before?.docTransform,
        });
        expect(testBed.document.undo()).toBe(true);
        expect(testBed.documentDataModel.getDrawings()?.[drawingId]).toEqual(before);
        expect(testBed.document.redo()).toBe(true);
        expect(testBed.documentDataModel.getDrawings()?.[drawingId]).toEqual(after);
    });

    it('marks image transforms for history action summaries', async () => {
        const image = await testBed.document.insertImage({
            source: 'data:image/png;base64,image',
            imageSourceType: ImageSourceType.BASE64,
            width: 160,
            height: 90,
            textRange: {
                startOffset: 3,
                endOffset: 3,
                collapsed: true,
                segmentId: '',
            },
        });
        const commandService = testBed.injector.get(ICommandService);
        const mutationSpy = vi.spyOn(commandService, 'syncExecuteCommand');

        const result = commandService.syncExecuteCommand<IUpdateDrawingDocTransformCommandParams>(
            UpdateDrawingDocTransformCommand.id,
            {
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawings: [{ drawingId: image!.getId(), key: 'angle', value: 15 }],
            }
        );

        expect(result).toBe(true);
        expect(mutationSpy).toHaveBeenCalledWith(
            RichTextEditingMutation.id,
            expect.objectContaining({ historyAction: DocHistoryAction.UpdateImage })
        );
    });

    it('retains picture-local scale through resize, undo and redo', async () => {
        testBed.univer.dispose();
        testBed = createFacadeTestBed({
            id: 'test-doc',
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
            body: {
                dataStream: '\b\r\n',
                paragraphs: [{ startIndex: 1, paragraphId: 'paragraph-1' }],
                customBlocks: [{ startIndex: 0, blockId: 'picture' }],
            },
            drawingsOrder: ['picture'],
            drawings: {
                picture: {
                    unitId: 'test-doc',
                    subUnitId: 'test-doc',
                    drawingId: 'picture',
                    drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                    layoutType: PositionedObjectLayoutType.INLINE,
                    docTransform: {
                        angle: 0,
                        size: { width: 100, height: 50 },
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH },
                    },
                    drawingMLSizeScale: { width: 1.1, height: 1.2 },
                },
            },
        });
        const commandService = testBed.injector.get(ICommandService);
        expect(commandService.syncExecuteCommand(UpdateDrawingDocTransformCommand.id, {
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawings: [{ drawingId: 'picture', key: 'size', value: { width: 200, height: 75 } }],
        })).toBe(true);
        await awaitTime(350);
        const drawing = () => testBed.documentDataModel.getSnapshot().drawings!.picture;
        expect(drawing().docTransform.size).toEqual({ width: 200, height: 75 });
        expect(drawing().drawingMLSizeScale).toEqual({ width: 1.1, height: 1.2 });
        expect(await commandService.executeCommand(UndoCommand.id)).toBe(true);
        expect(drawing().docTransform.size).toEqual({ width: 100, height: 50 });
        expect(drawing().drawingMLSizeScale).toEqual({ width: 1.1, height: 1.2 });
        expect(await commandService.executeCommand(RedoCommand.id)).toBe(true);
        expect(drawing().docTransform.size).toEqual({ width: 200, height: 75 });
        expect(drawing().drawingMLSizeScale).toEqual({ width: 1.1, height: 1.2 });
    });
});
