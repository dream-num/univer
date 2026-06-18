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

import type { Injector, Univer } from '@univerjs/core';
import type { ISheetImage } from '@univerjs/sheets-drawing';
import { ICommandService } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { SetDrawingSelectedOperation } from '@univerjs/drawing';
import { ISheetDrawingService } from '@univerjs/sheets-drawing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createSheetsDrawingTestBed } from '../../__tests__/create-sheets-drawing-test-bed';
import '@univerjs/sheets/facade';
import '../index';

describe('sheets drawing facade image lifecycle', () => {
    let univer: Univer;
    let injector: Injector;
    let univerAPI: FUniver;

    beforeEach(() => {
        const testBed = createSheetsDrawingTestBed();
        univer = testBed.univer;
        injector = testBed.injector;
        univerAPI = FUniver.newAPI(injector);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('keeps the sheet unchanged when a before-insert listener cancels the image', async () => {
        const worksheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const disposable = univerAPI.addEvent(univerAPI.Event.BeforeOverGridImageInsert, (event) => {
            if (event.insertImageParams[0].source.includes('blocked')) {
                event.cancel = true;
            }
        });
        const blocked = await worksheet.newOverGridImage()
            .setSource('https://example.com/blocked.png', univerAPI.Enum.ImageSourceType.URL)
            .setWidth(40)
            .setHeight(40)
            .buildAsync();

        expect(worksheet.insertImages([blocked])).toBe(worksheet);
        expect(worksheet.getImageById(blocked.drawingId)).toBeNull();

        disposable.dispose();
    });

    it('emits image lifecycle events around insert, change, select, and remove operations', async () => {
        const worksheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
        const commandService = injector.get(ICommandService);
        const events: string[] = [];
        const disposables = [
            univerAPI.addEvent(univerAPI.Event.BeforeOverGridImageInsert, (event) => {
                events.push(`before-insert:${event.insertImageParams[0].source}`);
            }),
            univerAPI.addEvent(univerAPI.Event.OverGridImageInserted, (event) => {
                events.push(`inserted:${event.images[0].getId()}`);
            }),
            univerAPI.addEvent(univerAPI.Event.BeforeOverGridImageChange, (event) => {
                events.push(`before-change:${event.images[0].changeParam.source}`);
            }),
            univerAPI.addEvent(univerAPI.Event.OverGridImageChanged, (event) => {
                events.push(`changed:${event.images[0].toBuilder().getSource()}`);
            }),
            univerAPI.addEvent(univerAPI.Event.BeforeOverGridImageSelect, (event) => {
                events.push(`before-select:${event.selectedImages[0].getId()}:${event.oldSelectedImages.length}`);
            }),
            univerAPI.addEvent(univerAPI.Event.OverGridImageSelected, (event) => {
                events.push(`selected:${event.selectedImages[0].getId()}`);
            }),
            univerAPI.addEvent(univerAPI.Event.BeforeOverGridImageRemove, (event) => {
                events.push(`before-remove:${event.images[0].getId()}`);
            }),
            univerAPI.addEvent(univerAPI.Event.OverGridImageRemoved, (event) => {
                events.push(`removed:${event.removeImageParams[0].drawingId}`);
            }),
        ];
        const image = await worksheet.newOverGridImage()
            .setSource('https://example.com/image.png', univerAPI.Enum.ImageSourceType.URL)
            .setWidth(40)
            .setHeight(30)
            .buildAsync();

        expect(worksheet.insertImages([image])).toBe(worksheet);
        expect(getStoredImage(injector, image.drawingId).source).toBe('https://example.com/image.png');

        const imageFacade = worksheet.getImageById(image.drawingId)!;
        expect(imageFacade.setSource('https://example.com/updated.png', univerAPI.Enum.ImageSourceType.URL)).toBe(true);

        expect(commandService.syncExecuteCommand(SetDrawingSelectedOperation.id, [{
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: image.drawingId,
            drawingType: image.drawingType,
        }])).toBe(true);

        expect(imageFacade.remove()).toBe(true);

        expect(events).toEqual([
            'before-insert:https://example.com/image.png',
            `inserted:${image.drawingId}`,
            'before-change:https://example.com/updated.png',
            'changed:https://example.com/updated.png',
            `before-select:${image.drawingId}:0`,
            `selected:${image.drawingId}`,
            `before-remove:${image.drawingId}`,
            `removed:${image.drawingId}`,
        ]);

        for (const disposable of disposables) {
            disposable.dispose();
        }
    });
});

function getStoredImage(injector: Injector, drawingId: string): ISheetImage {
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
