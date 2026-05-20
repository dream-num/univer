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

import { describe, expect, it, vi } from 'vitest';
import { HeaderUnhideRangeAxis, HeaderUnhideRangeService } from '../../../services/header-unhide-range.service';
import { HeaderUnhideRenderController } from '../header-unhide.render-controller';
import { createRenderTestBed } from './render-test-bed';

describe('HeaderUnhideRenderController', () => {
    it('filters hidden row ranges and keeps hidden column icons at the bottom of expanded column headers', () => {
        const testBed = createRenderTestBed();
        const { context, injector, sheet, sheetSkeletonManagerService, skeleton } = testBed;
        const worksheet = sheet.getActiveSheet()!;

        skeleton.columnHeaderHeight = 60;
        vi.spyOn(worksheet, 'getHiddenRows').mockReturnValue([
            { startRow: 5, endRow: 5, startColumn: 0, endColumn: 0 },
            { startRow: 8, endRow: 8, startColumn: 0, endColumn: 0 },
        ]);
        vi.spyOn(worksheet, 'getHiddenCols').mockReturnValue([
            { startColumn: 6, endColumn: 6, startRow: 0, endRow: 0 },
        ]);

        const controller = injector.createInstance(HeaderUnhideRenderController, context as any);
        controller.interceptor.intercept(controller.interceptor.getInterceptPoints().HEADER_UNHIDE_RANGE_VISIBLE_CHECK, {
            handler: (_visible, range) => range.axis !== HeaderUnhideRangeAxis.ROW || range.range.startRow !== 5,
        });

        sheetSkeletonManagerService.emitCurrentSkeleton({
            unitId: sheet.getUnitId(),
            sheetId: worksheet.getSheetId(),
        });

        const shapes = (controller as any)._shapes;
        expect(shapes.rows).toHaveLength(1);
        expect(shapes.cols).toHaveLength(1);
        expect(shapes.cols[0].top).toBe(60 - 12);

        testBed.univer.dispose();
    });

    it('keeps hidden column icons at the bottom of column headers when outline adds top padding', () => {
        const testBed = createRenderTestBed();
        const { context, injector, sheet, sheetSkeletonManagerService, skeleton } = testBed;
        const worksheet = sheet.getActiveSheet()!;

        skeleton.columnHeaderHeight = 20;
        skeleton.columnHeaderHeightAndMarginTop = 60;
        vi.spyOn(worksheet, 'getHiddenRows').mockReturnValue([]);
        vi.spyOn(worksheet, 'getHiddenCols').mockReturnValue([
            { startColumn: 6, endColumn: 6, startRow: 0, endRow: 0 },
        ]);

        const controller = injector.createInstance(HeaderUnhideRenderController, context as any);

        sheetSkeletonManagerService.emitCurrentSkeleton({
            unitId: sheet.getUnitId(),
            sheetId: worksheet.getSheetId(),
        });

        const shapes = (controller as any)._shapes;
        expect(shapes.cols).toHaveLength(1);
        expect(shapes.cols[0].top).toBe(60 - 12);

        testBed.univer.dispose();
    });

    it('filters hidden row ranges through the shared unhide range service', () => {
        const testBed = createRenderTestBed();
        const { context, injector, sheet, sheetSkeletonManagerService, skeleton } = testBed;
        const worksheet = sheet.getActiveSheet()!;

        skeleton.columnHeaderHeight = 60;
        vi.spyOn(worksheet, 'getHiddenRows').mockReturnValue([
            { startRow: 13, endRow: 21, startColumn: 0, endColumn: 0 },
            { startRow: 30, endRow: 31, startColumn: 0, endColumn: 0 },
        ]);
        vi.spyOn(worksheet, 'getHiddenCols').mockReturnValue([]);

        injector.get(HeaderUnhideRangeService).registerRangeVisibleHandler((visible, payload) => (
            visible && !(payload.axis === HeaderUnhideRangeAxis.ROW && payload.range.startRow === 13 && payload.range.endRow === 21)
        ));

        const controller = injector.createInstance(HeaderUnhideRenderController, context as any);

        sheetSkeletonManagerService.emitCurrentSkeleton({
            unitId: sheet.getUnitId(),
            sheetId: worksheet.getSheetId(),
        });

        const shapes = (controller as any)._shapes;
        expect(shapes.rows).toHaveLength(1);
        expect(shapes.rows[0].top).toBe(30 * 20 - 12);

        testBed.univer.dispose();
    });
});
