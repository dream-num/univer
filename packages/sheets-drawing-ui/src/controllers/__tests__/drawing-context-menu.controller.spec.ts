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

import { DrawingTypeEnum } from '@univerjs/core';
import { ContextMenuPosition } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DrawingContextMenuService } from '../../services/drawing-context-menu.service';
import { DrawingContextMenuController } from '../drawing-context-menu.controller';

function createController(options?: {
    selectedObjects?: Map<string, { oKey: string }>;
    drawingLookup?: (oKey: string) => unknown;
    scene?: any;
    drawingContextMenuService?: DrawingContextMenuService;
}) {
    const changeEnd$ = new Subject<any>();
    const transformer = {
        changeEnd$,
        getSelectedObjectMap: vi.fn(() => options?.selectedObjects ?? new Map([['shape-1', { oKey: 'shape-1' }]])),
    };
    const scene = options?.scene ?? {
        getTransformerByCreate: vi.fn(() => transformer),
    };
    const contextMenuService = {
        triggerContextMenu: vi.fn(),
    };
    const drawingContextMenuService = options?.drawingContextMenuService ?? new DrawingContextMenuService();
    const controller = new DrawingContextMenuController(
        { getDrawingOKey: vi.fn(options?.drawingLookup ?? (() => ({ unitId: 'u1' }))) } as any,
        contextMenuService as any,
        { getRenderById: vi.fn(() => ({ scene })) } as any,
        { getAllUnitsForType: vi.fn(() => [{ getUnitId: () => 'unit-1' }]) } as any,
        drawingContextMenuService
    );

    return { controller, changeEnd$, contextMenuService, drawingContextMenuService, transformer };
}

describe('DrawingContextMenuController', () => {
    it('opens drawing context menu on right click when all selected objects belong to drawings', () => {
        const { controller, changeEnd$, contextMenuService } = createController();
        const event = { button: 2 };

        changeEnd$.next({ event });

        expect(contextMenuService.triggerContextMenu).toHaveBeenCalledWith(event, ContextMenuPosition.DRAWING);
        controller.dispose();
    });

    it('uses a drawing-type provider for a single selected drawing', () => {
        const drawingContextMenuService = new DrawingContextMenuService();
        const provider = {
            getContextMenuPosition: vi.fn(() => 'chart-context-menu'),
        };
        drawingContextMenuService.registerProvider(DrawingTypeEnum.DRAWING_CHART, provider);
        const drawing = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'chart-1',
            drawingType: DrawingTypeEnum.DRAWING_CHART,
        };
        const { controller, changeEnd$, contextMenuService } = createController({
            drawingLookup: () => drawing,
            drawingContextMenuService,
        });
        const event = { button: 2 };

        changeEnd$.next({ event });

        expect(provider.getContextMenuPosition).toHaveBeenCalledWith({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'chart-1',
            drawingType: DrawingTypeEnum.DRAWING_CHART,
            drawing,
        });
        expect(contextMenuService.triggerContextMenu).toHaveBeenCalledWith(event, 'chart-context-menu');
        controller.dispose();
    });

    it('falls back to the drawing menu when there is no provider', () => {
        const { controller, changeEnd$, contextMenuService } = createController({
            drawingLookup: () => ({
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                drawingId: 'shape-1',
                drawingType: DrawingTypeEnum.DRAWING_SHAPE,
            }),
        });
        const event = { button: 2 };

        changeEnd$.next({ event });

        expect(contextMenuService.triggerContextMenu).toHaveBeenCalledWith(event, ContextMenuPosition.DRAWING);
        controller.dispose();
    });

    it('keeps the drawing menu for multiple selected drawings', () => {
        const drawingContextMenuService = new DrawingContextMenuService();
        const provider = {
            getContextMenuPosition: vi.fn(() => 'chart-context-menu'),
        };
        drawingContextMenuService.registerProvider(DrawingTypeEnum.DRAWING_CHART, provider);
        const { controller, changeEnd$, contextMenuService } = createController({
            selectedObjects: new Map([
                ['chart-1', { oKey: 'chart-1' }],
                ['chart-2', { oKey: 'chart-2' }],
            ]),
            drawingLookup: (oKey) => ({
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                drawingId: oKey,
                drawingType: DrawingTypeEnum.DRAWING_CHART,
            }),
            drawingContextMenuService,
        });
        const event = { button: 2 };

        changeEnd$.next({ event });

        expect(provider.getContextMenuPosition).not.toHaveBeenCalled();
        expect(contextMenuService.triggerContextMenu).toHaveBeenCalledWith(event, ContextMenuPosition.DRAWING);
        controller.dispose();
    });

    it('keeps newer providers when an older provider is disposed', () => {
        const drawingContextMenuService = new DrawingContextMenuService();
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

    it('ignores non-right-clicks, empty selections and non-drawing selected objects', () => {
        const { controller, changeEnd$, contextMenuService, transformer } = createController({
            selectedObjects: new Map(),
        });

        changeEnd$.next({ event: { button: 0 } });
        changeEnd$.next({ event: { button: 2 } });
        transformer.getSelectedObjectMap.mockReturnValue(new Map([['shape-1', { oKey: 'shape-1' }]]));
        (controller as any)._drawingManagerService.getDrawingOKey = vi.fn(() => null);
        changeEnd$.next({ event: { button: 2 } });

        expect(contextMenuService.triggerContextMenu).not.toHaveBeenCalled();
        controller.dispose();
    });
});
