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

import { ICommandService } from '@univerjs/core';
import { SHEET_VIEWPORT_KEY, TRANSFORM_CHANGE_OBSERVABLE_TYPE } from '@univerjs/engine-render';
import { SetWorksheetActiveOperation } from '@univerjs/sheets';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { SheetScrollManagerService } from '../../../services/scroll-manager.service';
import { HeaderFreezeRenderController } from '../freeze.render-controller';
import { createRenderTestBed } from './render-test-bed';

describe('HeaderFreezeRenderController', () => {
    it('refreshes viewports when switching sheets and freeze is enabled', () => {
        const validViewportScrollInfo$ = new BehaviorSubject<any>(null);
        const scrollManagerService = {
            validViewportScrollInfo$,
            getCurrentScrollState: () => ({
                sheetViewStartRow: 0,
                sheetViewStartColumn: 0,
                offsetX: 0,
                offsetY: 0,
            }),
        };

        const testBed = createRenderTestBed({
            dependencies: [
                [SheetScrollManagerService, { useValue: scrollManagerService }],
            ],
        });

        const { sheet, injector, viewportMap, sheetSkeletonManagerService, context } = testBed;

        // Ensure active worksheet has a freeze config (freeze first 2 rows).
        const worksheet = sheet.getActiveSheet();
        const config = worksheet.getConfig();
        config.freeze = { startRow: 2, startColumn: -1, ySplit: 2, xSplit: 0 };

        injector.get(ICommandService);

        injector.createInstance(HeaderFreezeRenderController, context as any);

        // Switching sheet tabs triggers currentSkeleton$ with SetWorksheetActiveOperation.id,
        // and the controller should re-apply the freeze layout.
        sheetSkeletonManagerService.emitCurrentSkeleton({
            commandId: SetWorksheetActiveOperation.id,
        });

        const viewMainTop = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP) as any;
        const viewRowTop = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_ROW_TOP) as any;
        const viewMain = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN) as any;

        expect(viewMainTop.isActive).toBe(true);
        expect(viewRowTop.isActive).toBe(true);
        expect(viewMain.top).toBeGreaterThan(0);

        testBed.univer.dispose();
    });

    it('applies different freeze layouts when sheet freeze config changes', () => {
        const validViewportScrollInfo$ = new BehaviorSubject<any>(null);
        const scrollManagerService = {
            validViewportScrollInfo$,
            getCurrentScrollState: () => ({
                sheetViewStartRow: 0,
                sheetViewStartColumn: 0,
                offsetX: 0,
                offsetY: 0,
            }),
        };

        const testBed = createRenderTestBed({
            dependencies: [
                [SheetScrollManagerService, { useValue: scrollManagerService }],
            ],
        });

        const { sheet, injector, viewportMap, sheetSkeletonManagerService, context } = testBed;

        injector.createInstance(HeaderFreezeRenderController, context as any);

        const worksheet = sheet.getActiveSheet();
        const applyFreeze = (freeze: any) => {
            worksheet.getConfig().freeze = freeze;
            sheetSkeletonManagerService.emitCurrentSkeleton({
                commandId: SetWorksheetActiveOperation.id,
            });
        };

        const viewMainLeftTop = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP) as any;
        const viewMainTop = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP) as any;
        const viewMainLeft = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT) as any;
        const viewRowTop = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_ROW_TOP) as any;
        const viewColumnLeft = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_COLUMN_LEFT) as any;

        applyFreeze({ startRow: 2, startColumn: -1, ySplit: 2, xSplit: 0 });
        expect(viewMainTop.isActive).toBe(true);
        expect(viewRowTop.isActive).toBe(true);
        expect(viewMainLeft.isActive).toBe(false);
        expect(viewColumnLeft.isActive).toBe(false);

        applyFreeze({ startRow: -1, startColumn: 2, ySplit: 0, xSplit: 2 });
        expect(viewMainTop.isActive).toBe(false);
        expect(viewRowTop.isActive).toBe(false);
        expect(viewMainLeft.isActive).toBe(true);
        expect(viewColumnLeft.isActive).toBe(true);

        applyFreeze({ startRow: 2, startColumn: 2, ySplit: 2, xSplit: 2 });
        expect(viewMainLeftTop.isActive).toBe(true);
        expect(viewMainTop.isActive).toBe(true);
        expect(viewMainLeft.isActive).toBe(true);
        expect(viewRowTop.isActive).toBe(true);
        expect(viewColumnLeft.isActive).toBe(true);

        applyFreeze({ startRow: -1, startColumn: -1, ySplit: 0, xSplit: 0 });
        expect(viewMainLeftTop.isActive).toBe(false);
        expect(viewMainTop.isActive).toBe(false);
        expect(viewMainLeft.isActive).toBe(false);
        expect(viewRowTop.isActive).toBe(false);
        expect(viewColumnLeft.isActive).toBe(false);

        testBed.univer.dispose();
    });

    it('syncs freeze-side viewports with valid viewport scroll state', () => {
        const validViewportScrollInfo$ = new BehaviorSubject<any>(null);
        const scrollManagerService = {
            validViewportScrollInfo$,
            getCurrentScrollState: () => ({
                sheetViewStartRow: 0,
                sheetViewStartColumn: 0,
                offsetX: 0,
                offsetY: 0,
            }),
        };

        const testBed = createRenderTestBed({
            dependencies: [
                [SheetScrollManagerService, { useValue: scrollManagerService }],
            ],
        });

        const { sheet, injector, viewportMap, context, sheetSkeletonManagerService } = testBed;
        injector.createInstance(HeaderFreezeRenderController, context as any);

        sheet.getActiveSheet().getConfig().freeze = { startRow: 2, startColumn: 2, ySplit: 2, xSplit: 2 };
        sheetSkeletonManagerService.emitCurrentSkeleton({
            commandId: SetWorksheetActiveOperation.id,
        });

        validViewportScrollInfo$.next({
            scrollX: 36,
            scrollY: 48,
            viewportScrollX: 320,
            viewportScrollY: 260,
        });

        const viewRowBottom = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_ROW_BOTTOM) as any;
        const viewColumnRight = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_COLUMN_RIGHT) as any;
        const viewMainLeft = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT) as any;
        const viewMainTop = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP) as any;

        expect(viewRowBottom.scrollY).toBe(48);
        expect(viewRowBottom.viewportScrollY).toBe(260);
        expect(viewColumnRight.scrollX).toBe(36);
        expect(viewColumnRight.viewportScrollX).toBe(320);
        expect(viewMainLeft.viewportScrollY).toBe(260);
        expect(viewMainTop.viewportScrollX).toBe(320);

        testBed.univer.dispose();
    });

    it('refreshes freeze layout on scene scale transform changes', () => {
        const validViewportScrollInfo$ = new BehaviorSubject<any>(null);
        const scrollManagerService = {
            validViewportScrollInfo$,
            getCurrentScrollState: () => ({
                sheetViewStartRow: 0,
                sheetViewStartColumn: 0,
                offsetX: 0,
                offsetY: 0,
            }),
        };

        const testBed = createRenderTestBed({
            dependencies: [
                [SheetScrollManagerService, { useValue: scrollManagerService }],
            ],
        });

        const { sheet, injector, viewportMap, context, scene, sheetSkeletonManagerService } = testBed;
        injector.createInstance(HeaderFreezeRenderController, context as any);

        const worksheet = sheet.getActiveSheet();
        worksheet.getConfig().freeze = { startRow: -1, startColumn: -1, ySplit: 0, xSplit: 0 };
        sheetSkeletonManagerService.emitCurrentSkeleton({
            commandId: SetWorksheetActiveOperation.id,
        });

        const viewMainTop = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP) as any;
        const viewMainLeft = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT) as any;
        expect(viewMainTop.isActive).toBe(false);
        expect(viewMainLeft.isActive).toBe(false);

        worksheet.getConfig().freeze = { startRow: 1, startColumn: 1, ySplit: 1, xSplit: 1 };
        scene.onTransformChange$.emit({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.scale,
        }, { stopPropagation: () => { } });

        expect(viewMainTop.isActive).toBe(true);
        expect(viewMainLeft.isActive).toBe(true);

        testBed.univer.dispose();
    });
});
