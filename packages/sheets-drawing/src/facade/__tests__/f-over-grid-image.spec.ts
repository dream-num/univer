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
import { DrawingTypeEnum, ImageSourceType } from '@univerjs/core';
import { SheetSkeletonService } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSheetsDrawingTestBed } from '../../__tests__/create-sheets-drawing-test-bed';
import { FOverGridImage } from '../f-over-grid-image';

describe('FOverGridImage', () => {
    let univer: Univer;
    let injector: Injector;

    beforeEach(() => {
        const skeleton = {
            getNoMergeCellWithCoordByIndex: (row: number, column: number) => ({
                startX: column * 100,
                endX: (column + 1) * 100,
                startY: row * 20,
                endY: (row + 1) * 20,
            }),
        };
        const testBed = createSheetsDrawingTestBed(undefined, [
            [SheetSkeletonService, { useValue: { getSkeleton: () => skeleton } }],
        ]);
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

        const builder = injector.createInstance(FOverGridImage, image).toBuilder();

        expect(builder.getSource()).toBe('https://example.com/drawing-1.png');
        expect(builder.getSourceType()).toBe(ImageSourceType.URL);
        expect(warnSpy).not.toHaveBeenCalledWith(expect.stringContaining('FOverGridImageBuilder but get 0'));

        warnSpy.mockRestore();
    });
});
