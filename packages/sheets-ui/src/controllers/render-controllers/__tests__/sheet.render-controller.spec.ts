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

import { SheetTypes, ThemeService } from '@univerjs/core';
import { SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { describe, expect, it } from 'vitest';
import { SHEET_VIEW_KEY } from '../../../common/keys';
import { SheetScrollManagerService } from '../../../services/scroll-manager.service';
import { HeaderFreezeRenderController } from '../freeze.render-controller';
import { getLeftTopPlaceholderSize } from '../sheet.render-controller';
import { SheetSkeletonRenderController } from '../skeleton.render-controller';
import { SheetsZoomRenderController } from '../zoom.render-controller';
import { createChartRenderTestBed } from './chart-render-test-bed';

describe('SheetRenderController', () => {
    it('sizes the select-all placeholder from header margins', () => {
        expect(getLeftTopPlaceholderSize({
            rowHeaderWidth: 46,
            columnHeaderHeight: 20,
            rowHeaderWidthAndMarginLeft: 86,
            columnHeaderHeightAndMarginTop: 60,
        })).toEqual({
            width: 86,
            height: 60,
        });
    });
});

describe('Chart host render lifecycle', () => {
    it.each([false, true])('retains the shared renderer and restores frozen Grid after Chart with initialChart=%s', (initialChart) => {
        const { render, manager, activate, workbook, injector } = createChartRenderTestBed([
            [SheetScrollManagerService],
            [SheetSkeletonRenderController],
            [HeaderFreezeRenderController],
            [SheetsZoomRenderController],
        ], initialChart);
        const spreadsheet = render.mainComponent!;
        if (!initialChart) {
            expect(spreadsheet.visible).toBe(true);
            expect(render.scene.getMainViewport().top).toBeGreaterThan(0);
            activate('chart');
        }
        expect(manager.getCurrentSkeleton()).toBeUndefined();
        expect(render.mainComponent).toBe(spreadsheet);
        for (const component of render.components.values()) {
            expect(component.visible).toBe(false);
        }
        const main = render.scene.getMainViewport();
        expect([main.left, main.top]).toEqual([0, 0]);
        expect(main.transScroll2ViewportScrollValue(0, 0)).toEqual({ x: 0, y: 0 });
        expect(render.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP)!.isActive).toBe(false);
        expect(render.scene.scaleX).toBe(0.75);
        render.scene.transformByState({ width: 1200, height: 900 });
        manager.setCurrent({ sheetId: 'grid' });
        const theme = injector.get(ThemeService);
        theme.setTheme({ ...theme.getCurrentTheme() });
        render.engine.resizeBySize(1000, 700);
        expect([render.scene.width, render.scene.height]).toEqual([1200, 900]);
        expect([main.left, main.top]).toEqual([0, 0]);
        expect(render.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP)!.isActive).toBe(false);
        activate('grid');
        expect(workbook.getActiveSheet().getFreeze()).toEqual({ startRow: 4, startColumn: 4, xSplit: 2, ySplit: 2 });
        expect(manager.getCurrentSkeleton()?.worksheet).toBe(workbook.getActiveSheet());
        expect(render.mainComponent).toBe(spreadsheet);
        expect(spreadsheet.visible).toBe(true);
        expect(render.components.get(SHEET_VIEW_KEY.ROW)!.visible).toBe(true);
        for (const key of [SHEET_VIEWPORT_KEY.VIEW_ROW_BOTTOM, SHEET_VIEWPORT_KEY.VIEW_COLUMN_RIGHT, SHEET_VIEWPORT_KEY.VIEW_LEFT_TOP]) {
            expect(render.scene.getViewport(key)!.isActive).toBe(true);
        }
        expect(render.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP)!.isActive).toBe(true);
        expect(main.top).toBeGreaterThan(0);
        expect(render.scene.scaleX).toBe(1.25);
    });
});

describe('Historical non-Chart renderer ownership', () => {
    it.each([SheetTypes.KANBAN, SheetTypes.GANTT, 99 as SheetTypes])('preserves existing render visibility without a Chart transition for sheet type %s', (type) => {
        const { render, workbook } = createChartRenderTestBed([], false, { type });
        render.mainComponent!.hide();
        render.scene.getMainViewport().disable();
        workbook.setActiveSheet(workbook.getActiveSheet());
        expect(render.mainComponent!.visible).toBe(false);
        expect(render.scene.getMainViewport().isActive).toBe(false);
    });
});
