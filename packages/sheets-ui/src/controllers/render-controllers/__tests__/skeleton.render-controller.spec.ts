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

import { SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { describe, expect, it } from 'vitest';
import { SheetSkeletonRenderController } from '../skeleton.render-controller';
import { createRenderTestBed } from './render-test-bed';

describe('SheetSkeletonRenderController', () => {
    it('syncs viewport geometry from skeleton margins', () => {
        const testBed = createRenderTestBed();
        const { context, injector, skeleton, sheetSkeletonManagerService, viewportMap } = testBed;

        skeleton.rowHeaderWidth = 46;
        skeleton.columnHeaderHeight = 20;
        skeleton.rowHeaderWidthAndMarginLeft = 86;
        skeleton.columnHeaderHeightAndMarginTop = 60;

        injector.createInstance(SheetSkeletonRenderController, context as any);
        sheetSkeletonManagerService.emitCurrentSkeleton({ skeleton });

        expect(viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN)?.left).toBe(86);
        expect(viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN)?.top).toBe(60);
        expect(viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_LEFT_TOP)?.width).toBe(86);
        expect(viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_LEFT_TOP)?.height).toBe(60);
        expect(viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_COLUMN_RIGHT)?.left).toBe(86);
        expect(viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_COLUMN_RIGHT)?.height).toBe(60);
        expect(viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_ROW_BOTTOM)?.width).toBe(86);
        expect(viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_ROW_BOTTOM)?.top).toBe(60);

        testBed.univer.dispose();
    });
});
