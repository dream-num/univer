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

import { DrawingTypeEnum, Injector } from '@univerjs/core';
import { expect, it, vi } from 'vitest';
import { DrawingContextMenuService, IDrawingContextMenuService } from '../drawing-context-menu.service';

it('keeps newer providers when an older provider is disposed', () => {
    const drawingContextMenuService = new Injector([[IDrawingContextMenuService, { useClass: DrawingContextMenuService }]]).get(IDrawingContextMenuService);
    const firstProvider = {
        getContextMenuPosition: vi.fn(() => 'first-menu'),
    };
    const secondProvider = {
        getContextMenuPosition: vi.fn(() => 'second-menu'),
    };
    const firstDisposable = drawingContextMenuService.registerProvider(DrawingTypeEnum.DRAWING_CHART, firstProvider);
    drawingContextMenuService.registerProvider(DrawingTypeEnum.DRAWING_CHART, secondProvider);

    firstDisposable.dispose();

    expect(drawingContextMenuService.getContextMenuPosition({
        unitId: 'unit-1',
        subUnitId: 'sheet-1',
        drawingId: 'chart-1',
        drawingType: DrawingTypeEnum.DRAWING_CHART,
        drawing: {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'chart-1',
            drawingType: DrawingTypeEnum.DRAWING_CHART,
        },
    })).toBe('second-menu');
});
