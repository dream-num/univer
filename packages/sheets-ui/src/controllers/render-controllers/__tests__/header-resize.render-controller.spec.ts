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
import { DeltaRowHeightCommand } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { SHEET_VIEW_KEY } from '../../../common/keys';
import { HeaderResizeRenderController } from '../header-resize.render-controller';
import { createRenderTestBed } from './render-test-bed';

describe('HeaderResizeRenderController', () => {
    it('resizes row by dragging the resize handle and triggers DeltaRowHeightCommand', () => {
        const testBed = createRenderTestBed();
        const { context, injector } = testBed;

        const commandService = injector.get(ICommandService);
        const executeSpy = vi.spyOn(commandService, 'executeCommand').mockResolvedValue(true as any);

        const controller = injector.createInstance(HeaderResizeRenderController, context as any);
        controller.interceptor.intercept(controller.interceptor.getInterceptPoints().HEADER_RESIZE_PERMISSION_CHECK, {
            handler: () => true,
        });

        // Hover near the bottom edge of the first row to show the row resize handle.
        const rowHeader = context.components.get(SHEET_VIEW_KEY.ROW) as any;
        rowHeader.onPointerMove$.emit({ offsetX: 10, offsetY: 19, button: 0 }, {});

        const rowResizeRect = (controller as any)._rowResizeRect;
        // Start dragging the resize handle downward.
        rowResizeRect.onPointerDown$.emitEvent({ offsetX: 10, offsetY: 19, button: 0 } as any);
        (context.scene as any).onPointerMove$.emit({ offsetX: 10, offsetY: 35, button: 0 }, {});
        (context.scene as any).onPointerUp$.emit({ offsetX: 10, offsetY: 35, button: 0 }, {});

        expect(executeSpy).toHaveBeenCalledWith(
            DeltaRowHeightCommand.id,
            expect.objectContaining({
                anchorRow: expect.any(Number),
                deltaY: expect.any(Number),
            })
        );

        testBed.univer.dispose();
    });

    it('positions resize handles in the base header area when outline uses margins', () => {
        const testBed = createRenderTestBed();
        const { context, injector, skeleton } = testBed;

        skeleton.rowHeaderWidth = 46;
        skeleton.columnHeaderHeight = 20;
        skeleton.rowHeaderWidthAndMarginLeft = 86;
        skeleton.columnHeaderHeightAndMarginTop = 60;
        (skeleton.worksheet as any).getConfig = () => ({
            rowHeader: { width: 46 },
            columnHeader: { height: 20 },
        });

        const controller = injector.createInstance(HeaderResizeRenderController, context as any);
        controller.interceptor.intercept(controller.interceptor.getInterceptPoints().HEADER_RESIZE_PERMISSION_CHECK, {
            handler: () => true,
        });

        const rowHeader = context.components.get(SHEET_VIEW_KEY.ROW) as any;
        rowHeader.onPointerMove$.emit({ offsetX: 70, offsetY: 19, button: 0 }, {});
        const rowResizeRect = (controller as any)._rowResizeRect;
        expect(rowResizeRect.left).toBeCloseTo(40 + 46 / 2 - (46 / 3) / 2);
        expect(rowResizeRect.size).toBeCloseTo(46 / 3);

        const columnHeader = context.components.get(SHEET_VIEW_KEY.COLUMN) as any;
        columnHeader.onPointerMove$.emit({ offsetX: 99, offsetY: 52, button: 0 }, {});
        const columnResizeRect = (controller as any)._columnResizeRect;
        expect(columnResizeRect.top).toBeCloseTo(40 + 20 / 2 - (20 * 0.7) / 2);
        expect(columnResizeRect.size).toBeCloseTo(20 * 0.7);

        testBed.univer.dispose();
    });
});
