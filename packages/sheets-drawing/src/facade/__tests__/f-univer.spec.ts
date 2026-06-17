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
import { FUniver } from '@univerjs/core/facade';
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
