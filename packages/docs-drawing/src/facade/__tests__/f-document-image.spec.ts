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

import type { IObjectPositionH, IObjectPositionV } from '@univerjs/core';
import {
    ArrangeTypeEnum,
    BooleanNumber,
    ICommandService,
    ImageSourceType,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
} from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { TextWrappingStyle, UpdateDocDrawingWrappingStyleCommand } from '@univerjs/docs-drawing';
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

        expect(testBed.document.save().headers?.[segmentId].body.dataStream).toBe('\b\r\n');
        expect(imageData?.isMultiTransform).toBe(BooleanNumber.TRUE);
        expect(imageData?.transforms).toEqual(imageData?.transform ? [imageData.transform] : null);
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
