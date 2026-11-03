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

import { convertPositionSheetOverGridToAbsolute, SheetSkeletonService } from '@univerjs/sheets';
import { describe, expect, it } from 'vitest';
import { createSheetsDrawingTestBed } from '../../__tests__/create-sheets-drawing-test-bed';
import { transformToAxisAlignPosition, transformToDrawingPosition } from '../transform-position';

describe('drawing model coordinates', () => {
    it('keeps cell anchors stable when the viewport zooms and scrolls', () => {
        const bed = createSheetsDrawingTestBed();
        try {
            const skeleton = bed.get(SheetSkeletonService).ensureSkeleton('test', 'sheet1')!;
            const bounds = { left: 120, top: 80, width: 110, height: 30, angle: 90 };
            const position = transformToDrawingPosition(bounds, skeleton);
            const axisAligned = transformToAxisAlignPosition(bounds, skeleton);
            const expectedBounds = { left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height };

            expect(convertPositionSheetOverGridToAbsolute('test', 'sheet1', position, skeleton)).toMatchObject(expectedBounds);

            skeleton.setScale(0.75);
            skeleton.setScroll(88, 22);

            expect(transformToDrawingPosition(bounds, skeleton)).toEqual(position);
            expect(transformToAxisAlignPosition(bounds, skeleton)).toEqual(axisAligned);
            expect(convertPositionSheetOverGridToAbsolute('test', 'sheet1', position, skeleton)).toMatchObject(expectedBounds);
        } finally {
            bed.univer.dispose();
        }
    });
});
