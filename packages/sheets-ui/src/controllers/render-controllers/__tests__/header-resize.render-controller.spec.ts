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
});
