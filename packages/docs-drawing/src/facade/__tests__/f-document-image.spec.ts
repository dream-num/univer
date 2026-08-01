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

import type { IDocumentData, IObjectPositionH, IObjectPositionV } from '@univerjs/core';
import {
    ArrangeTypeEnum,
    BooleanNumber,
    DataStreamTreeTokenType,
    ICommandService,
    ImageSourceType,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
} from '@univerjs/core';
import { FEnum } from '@univerjs/core/facade';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IDocDrawingService, TextWrappingStyle, UpdateDocDrawingWrappingStyleCommand } from '@univerjs/docs-drawing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RemoveDocDrawingCommand } from '../../commands/commands/remove-doc-drawing.command';
import { SetDocDrawingArrangeCommand } from '../../commands/commands/set-drawing-arrange.command';
import { UpdateDrawingDocTransformCommand } from '../../commands/commands/update-doc-drawing-transform.command';
import { createFacadeTestBed } from './create-test-bed';

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

describe('FDocument image facade', () => {
    let testBed: ReturnType<typeof createFacadeTestBed>;

    beforeEach(() => {
        vi.stubGlobal('Image', MockImage);
        testBed = createFacadeTestBed();
    });

    afterEach(() => {
        testBed.univer.dispose();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('exposes TextWrappingStyle under its Facade signature name', () => {
        expect(FEnum.get().TextWrappingStyle).toBe(TextWrappingStyle);
        expect(FEnum.get()).not.toHaveProperty('DocsImageWrappingStyle');
    });

    it('inserts an image with optional transform and text range options', async () => {
        const positionH: IObjectPositionH = {
            relativeFrom: ObjectRelativeFromH.MARGIN,
            posOffset: 12,
        };
        const positionV: IObjectPositionV = {
            relativeFrom: ObjectRelativeFromV.PARAGRAPH,
            posOffset: 34,
        };

        const image = await testBed.document.insertImage({
            source: 'data:image/png;base64,image',
            imageSourceType: ImageSourceType.BASE64,
            width: 200,
            angle: 15,
            positionH,
            positionV,
            textRange: {
                startOffset: 5,
                endOffset: 5,
                collapsed: true,
                segmentId: '',
            },
        });

        expect(image).not.toBeNull();
        expect(image?.getSource()).toBe('data:image/png;base64,image');
        expect(image?.getSourceType()).toBe(ImageSourceType.BASE64);
        expect(image?.getSize()).toEqual({ width: 200, height: 100 });
        expect(image?.getAngle()).toBe(15);
        expect(image?.getPositionH()).toEqual(positionH);
        expect(image?.getPositionV()).toEqual(positionV);
        expect(image?.getImageData()).toMatchObject({
            drawingId: image?.getId(),
            source: 'data:image/png;base64,image',
            imageSourceType: ImageSourceType.BASE64,
        });
        expect(testBed.document.save().body?.dataStream).toBe('Hello\b world\r\n');
        expect(testBed.document.getImage(image!.getId())).not.toBeNull();
        expect(testBed.document.getImages().map((item) => item.getId())).toEqual([image!.getId()]);
    });

    it('resolves the insertion range only once', async () => {
        const selectionManager = testBed.injector.get(DocSelectionManagerService);
        const getActiveTextRange = vi.spyOn(selectionManager, 'getActiveTextRange');

        await testBed.document.insertImage({
            source: 'data:image/png;base64,image',
            imageSourceType: ImageSourceType.BASE64,
            textRange: {
                startOffset: 0,
                endOffset: 0,
                collapsed: true,
                segmentId: '',
            },
        });

        expect(getActiveTextRange).toHaveBeenCalledTimes(1);
    });

    it('uses a capped intrinsic size when width and height are omitted', async () => {
        const image = await testBed.document.insertImage({
            source: 'data:image/png;base64,image',
            imageSourceType: ImageSourceType.BASE64,
            textRange: {
                startOffset: 0,
                endOffset: 0,
                collapsed: true,
                segmentId: '',
            },
        });

        expect(image?.getSize()).toEqual({ width: 500, height: 250 });
    });

    it('uses explicit dimensions without loading the image source', async () => {
        vi.stubGlobal('Image', undefined);

        const image = await testBed.document.insertImage({
            source: 'data:image/png;base64,image',
            imageSourceType: ImageSourceType.BASE64,
            width: 160,
            height: 90,
            textRange: {
                startOffset: 0,
                endOffset: 0,
                collapsed: true,
                segmentId: '',
            },
        });

        expect(image?.getSize()).toEqual({ width: 160, height: 90 });
    });

    it('creates a renderable image paragraph when the range points to the document structural tail', async () => {
        const image = await testBed.document.insertImage({
            source: 'data:image/png;base64,image',
            imageSourceType: ImageSourceType.BASE64,
            width: 160,
            height: 90,
            textRange: {
                startOffset: 12,
                endOffset: 12,
                collapsed: true,
                segmentId: '',
            },
        });

        const snapshot = testBed.document.save();

        expect(image).not.toBeNull();
        expect(snapshot.body?.dataStream).toBe('Hello world\r\b\r\n');
        expect(snapshot.body?.customBlocks).toEqual([
            {
                startIndex: 12,
                blockId: image?.getId(),
            },
        ]);
        expect(snapshot.body?.paragraphs).toEqual([
            { startIndex: 11, paragraphId: 'paragraph-1' },
            expect.objectContaining({ startIndex: 13 }),
        ]);
    });

    it('anchors an image inside the current table-cell paragraph when the range points to the cell structural tail', async () => {
        const T = DataStreamTreeTokenType;
        const tableStream = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
        const documentData: IDocumentData = {
            id: 'test-doc',
            documentStyle: {},
            body: {
                dataStream: `${tableStream}${T.PARAGRAPH}${T.SECTION_BREAK}`,
                paragraphs: [
                    { startIndex: 7, paragraphId: 'cell-paragraph' },
                    { startIndex: 12, paragraphId: 'body-paragraph' },
                ],
                sectionBreaks: [
                    { startIndex: 8, sectionId: 'cell-section' },
                    { startIndex: 13, sectionId: 'body-section' },
                ],
                customBlocks: [],
                tables: [{ startIndex: 0, endIndex: 12, tableId: 'table-1' }],
            },
            drawings: {},
            drawingsOrder: [],
        };
        testBed.univer.dispose();
        testBed = createFacadeTestBed(documentData);

        const image = await testBed.document.insertImage({
            source: 'data:image/png;base64,image',
            imageSourceType: ImageSourceType.BASE64,
            width: 160,
            height: 90,
            textRange: {
                startOffset: 8,
                endOffset: 8,
                collapsed: true,
                segmentId: '',
            },
        });

        const snapshot = testBed.document.save();
        const expectedDataStream = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell${T.CUSTOM_BLOCK}${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}${T.PARAGRAPH}${T.SECTION_BREAK}`;

        expect(image).not.toBeNull();
        expect(snapshot.body?.dataStream).toBe(expectedDataStream);
        expect(snapshot.body?.customBlocks).toEqual([{ startIndex: 7, blockId: image?.getId() }]);
        expect(snapshot.body?.paragraphs).toEqual([
            { startIndex: 8, paragraphId: 'cell-paragraph' },
            { startIndex: 13, paragraphId: 'body-paragraph' },
        ]);

        expect(testBed.document.undo()).toBe(true);
        expect(testBed.document.save().body?.dataStream).toBe(documentData.body?.dataStream);
        expect(testBed.document.save().drawingsOrder).toEqual([]);

        expect(testBed.document.redo()).toBe(true);
        expect(testBed.document.save().body?.dataStream).toBe(expectedDataStream);
        expect(testBed.document.save().drawingsOrder).toEqual([image?.getId()]);
    });

    it('inserts an image with a non-inline wrapping style', async () => {
        const image = await testBed.document.insertImage({
            source: 'data:image/png;base64,image',
            imageSourceType: ImageSourceType.BASE64,
            wrappingStyle: TextWrappingStyle.BEHIND_TEXT,
            textRange: {
                startOffset: 2,
                endOffset: 2,
                collapsed: true,
                segmentId: '',
            },
        });

        expect(image?.getImageData()).toMatchObject({
            layoutType: PositionedObjectLayoutType.WRAP_NONE,
            behindDoc: BooleanNumber.TRUE,
        });
    });

    it('inserts a header image with multi-page transforms', async () => {
        const segmentId = testBed.document.ensurePageHeader();
        const image = await testBed.document.insertImage({
            source: 'data:image/png;base64,image',
            imageSourceType: ImageSourceType.BASE64,
            width: 160,
            height: 90,
            textRange: {
                startOffset: 0,
                endOffset: 0,
                collapsed: true,
                segmentId,
            },
        });
        const imageData = image?.getImageData();

        expect(testBed.document.save().headers?.[segmentId].body.dataStream).toBe('\r\b\r\n');
        expect(imageData?.isMultiTransform).toBe(BooleanNumber.TRUE);
        expect(imageData?.transforms).toEqual(imageData?.transform ? [imageData.transform] : null);
    });

    it('arranges images from the document model when the headless drawing projection is stale', async () => {
        const firstImage = await testBed.document.insertImage({
            source: 'data:image/png;base64,first-image',
            imageSourceType: ImageSourceType.BASE64,
            width: 160,
            height: 90,
            textRange: {
                startOffset: 1,
                endOffset: 1,
                collapsed: true,
                segmentId: '',
            },
        });
        const secondImage = await testBed.document.insertImage({
            source: 'data:image/png;base64,second-image',
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
        const thirdImage = await testBed.document.insertImage({
            source: 'data:image/png;base64,third-image',
            imageSourceType: ImageSourceType.BASE64,
            width: 160,
            height: 90,
            textRange: {
                startOffset: 5,
                endOffset: 5,
                collapsed: true,
                segmentId: '',
            },
        });

        expect(firstImage).not.toBeNull();
        expect(secondImage).not.toBeNull();
        expect(thirdImage).not.toBeNull();
        if (!firstImage || !secondImage || !thirdImage) {
            throw new Error('Expected all document images to be inserted');
        }

        const firstImageId = firstImage.getId();
        const secondImageId = secondImage.getId();
        const thirdImageId = thirdImage.getId();
        const docDrawingService = testBed.injector.get(IDocDrawingService);

        expect(docDrawingService.getDrawingOrder('test-doc', 'test-doc')).toEqual([]);
        expect(testBed.document.save().drawingsOrder).toEqual([firstImageId, secondImageId, thirdImageId]);

        expect(secondImage.setFront()).toBe(true);
        expect(testBed.document.save().drawingsOrder).toEqual([firstImageId, thirdImageId, secondImageId]);

        expect(secondImage.setBackward()).toBe(true);
        expect(testBed.document.save().drawingsOrder).toEqual([firstImageId, secondImageId, thirdImageId]);

        expect(firstImage.setForward()).toBe(true);
        expect(testBed.document.save().drawingsOrder).toEqual([secondImageId, firstImageId, thirdImageId]);

        expect(thirdImage.setBack()).toBe(true);
        expect(testBed.document.save().drawingsOrder).toEqual([thirdImageId, secondImageId, firstImageId]);

        expect(testBed.document.undo()).toBe(true);
        expect(testBed.document.save().drawingsOrder).toEqual([secondImageId, firstImageId, thirdImageId]);

        expect(testBed.document.redo()).toBe(true);
        expect(testBed.document.save().drawingsOrder).toEqual([thirdImageId, secondImageId, firstImageId]);

        expect(testBed.injector.get(ICommandService).syncExecuteCommand(SetDocDrawingArrangeCommand.id, {
            unitId: 'test-doc',
            subUnitId: 'test-doc',
            drawingIds: [thirdImageId, secondImageId],
            arrangeType: ArrangeTypeEnum.front,
        })).toBe(true);
        expect(testBed.document.save().drawingsOrder).toEqual([firstImageId, thirdImageId, secondImageId]);

        expect(testBed.document.undo()).toBe(true);
        expect(testBed.document.save().drawingsOrder).toEqual([thirdImageId, secondImageId, firstImageId]);
    });

    it('routes image updates, arranging, and removal through docs-drawing commands', async () => {
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
        const execute = vi.spyOn(commandService, 'syncExecuteCommand').mockReturnValue(true);
        const positionH: IObjectPositionH = { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 20 };
        const positionV: IObjectPositionV = { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 30 };
        const drawingId = image!.getId();

        expect(image!.setSize(320, 180)).toBe(true);
        expect(image!.setRotate(25)).toBe(true);
        expect(image!.setPositionH(positionH)).toBe(true);
        expect(image!.setPositionV(positionV)).toBe(true);
        expect(image!.setWrappingStyle(TextWrappingStyle.WRAP_SQUARE)).toBe(true);
        expect(image!.setForward()).toBe(true);
        expect(image!.setBackward()).toBe(true);
        expect(image!.setBack()).toBe(true);
        expect(image!.setFront()).toBe(true);
        expect(image!.remove()).toBe(true);

        expect(execute.mock.calls).toEqual([
            [UpdateDrawingDocTransformCommand.id, {
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawings: [{ drawingId, key: 'size', value: { width: 320, height: 180 } }],
            }],
            [UpdateDrawingDocTransformCommand.id, {
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawings: [{ drawingId, key: 'angle', value: 25 }],
            }],
            [UpdateDrawingDocTransformCommand.id, {
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawings: [{ drawingId, key: 'positionH', value: positionH }],
            }],
            [UpdateDrawingDocTransformCommand.id, {
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawings: [{ drawingId, key: 'positionV', value: positionV }],
            }],
            [UpdateDocDrawingWrappingStyleCommand.id, {
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawings: [image!.getImageData()],
                wrappingStyle: TextWrappingStyle.WRAP_SQUARE,
            }],
            [SetDocDrawingArrangeCommand.id, {
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingIds: [drawingId],
                arrangeType: ArrangeTypeEnum.forward,
            }],
            [SetDocDrawingArrangeCommand.id, {
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingIds: [drawingId],
                arrangeType: ArrangeTypeEnum.backward,
            }],
            [SetDocDrawingArrangeCommand.id, {
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingIds: [drawingId],
                arrangeType: ArrangeTypeEnum.back,
            }],
            [SetDocDrawingArrangeCommand.id, {
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawingIds: [drawingId],
                arrangeType: ArrangeTypeEnum.front,
            }],
            [RemoveDocDrawingCommand.id, {
                unitId: 'test-doc',
                drawings: [{
                    unitId: 'test-doc',
                    subUnitId: 'test-doc',
                    drawingId,
                    drawingType: 0,
                }],
                textRange: {
                    startOffset: 3,
                    endOffset: 3,
                    collapsed: true,
                    segmentId: '',
                },
            }],
        ]);
    });
});
