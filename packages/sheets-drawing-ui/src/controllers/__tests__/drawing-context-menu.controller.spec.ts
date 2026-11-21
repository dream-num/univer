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

// @vitest-environment jsdom

import type { ITransformState } from '@univerjs/core';
import {
    ContextService,
    DrawingTypeEnum,
    EDITOR_ACTIVATED,
    IContextService,
    Injector,
    IUniverInstanceService,
    SheetTypes,
    UniverInstanceType,
} from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { REF_SELECTIONS_ENABLED } from '@univerjs/sheets';
import { ContextMenuPosition, IContextMenuService, IContextMenuShortcutService } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DrawingContextMenuService, IDrawingContextMenuService } from '../../services/drawing-context-menu.service';
import { DrawingContextMenuController } from '../drawing-context-menu.controller';

function createController(options?: {
    selectedObjects?: Map<string, { oKey: string; getState?: () => ITransformState }>;
    drawingLookup?: (oKey: string) => unknown;
}) {
    const changeEnd$ = new Subject<{ event: { button: number } }>();
    const transformer = {
        changeEnd$,
        getSelectedObjectMap: vi.fn(() => options?.selectedObjects ?? new Map([['shape-1', {
            oKey: 'shape-1',
            getState: () => ({ left: 20, top: 30, width: 40, height: 20 }),
        }]])),
    };
    const scene = {
        getTransformerByCreate: () => transformer,
        getTransformer: () => transformer,
        getAncestorScale: () => ({ scaleX: 1, scaleY: 1 }),
        getViewport: () => null,
    };
    const contextMenuService = { triggerContextMenu: vi.fn() };
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 80, 500, 300));
    const workbook = {
        type: UniverInstanceType.UNIVER_SHEET,
        getUnitId: () => 'unit-1',
        getActiveSheet: () => ({ getConfig: () => ({ type: SheetTypes.GRID }) }),
    };
    const getDrawingOKey = vi.fn(options?.drawingLookup ?? (() => ({ unitId: 'unit-1' })));
    const register = vi.fn<IContextMenuShortcutService['register']>(() => ({ dispose() {} }));
    const injector = new Injector([
        [IContextMenuShortcutService, { useValue: { register } }],
        [IContextMenuService, { useValue: contextMenuService }],
        [IDrawingManagerService, { useValue: { getDrawingOKey } }],
        [IContextService, { useClass: ContextService }],
        [IRenderManagerService, { useValue: { getRenderUnitById: () => ({ scene, engine: { getCanvasElement: () => canvas }, with: () => ({ getCurrentSkeleton: () => ({}) }) }) } }],
        [IUniverInstanceService, { useValue: { getAllUnitsForType: () => [workbook], getFocusedUnit: () => workbook } }],
        [IDrawingContextMenuService, { useClass: DrawingContextMenuService }],
        [DrawingContextMenuController],
    ]);
    const controller = injector.get(DrawingContextMenuController);
    const keyboardMenu = () => register.mock.calls[0][0](canvas)?.(new MouseEvent('contextmenu'));
    return {
        controller,
        changeEnd$,
        contextMenuService,
        drawingContextMenuService: injector.get(IDrawingContextMenuService),
        transformer,
        keyboardMenu,
        context: injector.get(IContextService),
        getDrawingOKey,
    };
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
        const provider = {
            getContextMenuPosition: vi.fn(() => 'chart-context-menu'),
        };
        const drawing = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'chart-1',
            drawingType: DrawingTypeEnum.DRAWING_CHART,
        };
        const { controller, changeEnd$, contextMenuService, drawingContextMenuService, keyboardMenu, context } = createController({
            drawingLookup: () => drawing,
        });
        drawingContextMenuService.registerProvider(DrawingTypeEnum.DRAWING_CHART, provider);
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
        expect(keyboardMenu()).toBe(true);
        expect(contextMenuService.triggerContextMenu).toHaveBeenLastCalledWith(
            expect.objectContaining({ clientX: 140, clientY: 120 }),
            'chart-context-menu',
            { autoFocus: true, unitId: 'unit-1' }
        );
        for (const guard of [EDITOR_ACTIVATED, REF_SELECTIONS_ENABLED]) {
            context.setContextValue(guard, true);
            expect(keyboardMenu()).toBeUndefined();
            context.setContextValue(guard, false);
        }
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
        const provider = {
            getContextMenuPosition: vi.fn(() => 'chart-context-menu'),
        };
        const { controller, changeEnd$, contextMenuService, drawingContextMenuService, keyboardMenu } = createController({
            selectedObjects: new Map([
                ['chart-1', { oKey: 'chart-1', getState: () => ({ left: 10, top: 20, width: 30, height: 10 }) }],
                ['chart-2', { oKey: 'chart-2', getState: () => ({ left: 80, top: 90, width: 20, height: 30 }) }],
            ]),
            drawingLookup: (oKey) => ({
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                drawingId: oKey,
                drawingType: DrawingTypeEnum.DRAWING_CHART,
            }),
        });
        drawingContextMenuService.registerProvider(DrawingTypeEnum.DRAWING_CHART, provider);
        const event = { button: 2 };

        changeEnd$.next({ event });

        expect(provider.getContextMenuPosition).not.toHaveBeenCalled();
        expect(contextMenuService.triggerContextMenu).toHaveBeenCalledWith(event, ContextMenuPosition.DRAWING);
        expect(keyboardMenu()).toBe(true);
        expect(contextMenuService.triggerContextMenu).toHaveBeenLastCalledWith(
            expect.objectContaining({ clientX: 155, clientY: 150 }),
            ContextMenuPosition.DRAWING,
            { autoFocus: true, unitId: 'unit-1' }
        );
        controller.dispose();
    });

    it('ignores non-right-clicks, empty selections and non-drawing selected objects', () => {
        const { controller, changeEnd$, contextMenuService, transformer, getDrawingOKey } = createController({
            selectedObjects: new Map(),
        });

        changeEnd$.next({ event: { button: 0 } });
        changeEnd$.next({ event: { button: 2 } });
        transformer.getSelectedObjectMap.mockReturnValue(new Map([['shape-1', { oKey: 'shape-1' }]]));
        getDrawingOKey.mockReturnValue(null);
        changeEnd$.next({ event: { button: 2 } });

        expect(contextMenuService.triggerContextMenu).not.toHaveBeenCalled();
        controller.dispose();
    });
});
