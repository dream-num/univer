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

import { DrawingTypeEnum, ICommandService, ImageSourceType, type Injector, type Univer } from '@univerjs/core';
import { SheetSkeletonService } from '@univerjs/sheets';
import { getSheetDrawingPlacement, ISheetDrawingService, type ISheetImage, SheetDrawingAnchorType } from '@univerjs/sheets-drawing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSheetsDrawingTestBed } from '../../__tests__/create-sheets-drawing-test-bed';
import { InsertSheetDrawingCommand } from '../../commands/commands/insert-sheet-drawing.command';
import { FOverGridImage, FOverGridImageBuilder } from '../f-over-grid-image';

const BOUNDS_ANCHOR_KINDS: readonly (
    SheetDrawingAnchorType.Position | SheetDrawingAnchorType.Both
)[] = [
    SheetDrawingAnchorType.Position,
    SheetDrawingAnchorType.Both,
];

describe('FOverGridImage', () => {
    let univer: Univer;
    let injector: Injector;

    beforeEach(() => {
        const testBed = createSheetsDrawingTestBed();
        univer = testBed.univer;
        injector = testBed.injector;
    });

    afterEach(() => {
        univer.dispose();
    });

    it('creates a builder from the image unit and sheet ids', () => {
        const image: ISheetImage = {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: 'drawing-1',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType: ImageSourceType.URL,
            source: 'https://example.com/drawing-1.png',
            sheetTransform: {
                from: {
                    row: 1,
                    rowOffset: 0,
                    column: 1,
                    columnOffset: 0,
                },
                to: {
                    row: 4,
                    rowOffset: 0,
                    column: 3,
                    columnOffset: 0,
                },
            },
            axisAlignSheetTransform: {
                from: {
                    row: 1,
                    rowOffset: 0,
                    column: 1,
                    columnOffset: 0,
                },
                to: {
                    row: 4,
                    rowOffset: 0,
                    column: 3,
                    columnOffset: 0,
                },
            },
        };

        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        injector.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1');

        const builder = injector.createInstance(FOverGridImage, image).toBuilder();

        expect(builder.getSource()).toBe('https://example.com/drawing-1.png');
        expect(builder.getSourceType()).toBe(ImageSourceType.URL);
        expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining('FOverGridImageBuilder but get 0'));

        warnSpy.mockRestore();
    });

    it('updates image data and removes the image through facade methods', async () => {
        const image = createImage();
        const commandService = injector.get(ICommandService);
        const sheetDrawingService = injector.get(ISheetDrawingService);
        expect(commandService.syncExecuteCommand(InsertSheetDrawingCommand.id, { unitId: 'test', drawings: [image] })).toBe(true);

        const fImage = injector.createInstance(FOverGridImage, image);

        expect(fImage.setSource('https://example.com/updated.png', ImageSourceType.URL)).toBe(true);
        expect(getStoredImage('drawing-1').source).toBe('https://example.com/updated.png');

        expect(await fImage.setPositionAsync(4, 5, 6, 7)).toBe(true);
        expect(getStoredImage('drawing-1').sheetTransform.from).toEqual(expect.objectContaining({
            row: 4,
            column: 5,
            rowOffset: 6,
            columnOffset: 7,
        }));

        expect(await fImage.setSizeAsync(160, 90)).toBe(true);
        expect(getStoredImage('drawing-1').transform).toEqual(expect.objectContaining({
            width: 160,
            height: 90,
        }));

        expect(fImage.setCrop(1, 2, 3, 4)).toBe(true);
        expect(getStoredImage('drawing-1').srcRect).toEqual({ top: 1, left: 2, bottom: 3, right: 4 });

        expect(fImage.setRotate(30)).toBe(true);
        expect(getStoredImage('drawing-1').sheetTransform.angle).toBe(30);

        expect(fImage.setForward()).toBe(true);
        expect(fImage.setBackward()).toBe(true);
        expect(fImage.setFront()).toBe(true);
        expect(fImage.setBack()).toBe(true);

        expect(fImage.remove()).toBe(true);
        expect(sheetDrawingService.getDrawingByParam({ unitId: 'test', subUnitId: 'sheet1', drawingId: 'drawing-1' })).toBeUndefined();
    });

    it.each(BOUNDS_ANCHOR_KINDS)('builds %s placement directly from absolute Sheet bounds', async (kind) => {
        const image = await injector
            .createInstance(FOverGridImageBuilder, 'test', 'sheet1')
            .setSource('https://example.com/direct-bounds.png', ImageSourceType.URL)
            .setPlacement({
                kind,
                left: 123,
                top: 47,
                width: 205,
                height: 91,
            })
            .buildAsync();

        expect(image.anchorType).toBe(kind);
        expect(image.transform).toEqual(expect.objectContaining({
            left: 123,
            top: 47,
            width: 205,
            height: 91,
        }));
        const placement = getSheetDrawingPlacement(image);
        expect(placement.kind).toBe(kind);
        expect('left' in placement).toBe(false);
    });

    function getStoredImage(drawingId: string): ISheetImage {
        const image = injector.get(ISheetDrawingService).getDrawingByParam({
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId,
        }) as ISheetImage | undefined;

        if (!image) {
            throw new Error(`Image ${drawingId} was not stored`);
        }

        return image;
    }
});

function createImage(): ISheetImage {
    return {
        unitId: 'test',
        subUnitId: 'sheet1',
        drawingId: 'drawing-1',
        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
        imageSourceType: ImageSourceType.URL,
        source: 'https://example.com/drawing-1.png',
        transform: {
            left: 20,
            top: 30,
            width: 100,
            height: 60,
        },
        sheetTransform: {
            from: {
                row: 1,
                rowOffset: 0,
                column: 1,
                columnOffset: 0,
            },
            to: {
                row: 4,
                rowOffset: 0,
                column: 3,
                columnOffset: 0,
            },
        },
        axisAlignSheetTransform: {
            from: {
                row: 1,
                rowOffset: 0,
                column: 1,
                columnOffset: 0,
            },
            to: {
                row: 4,
                rowOffset: 0,
                column: 3,
                columnOffset: 0,
            },
        },
    };
}
