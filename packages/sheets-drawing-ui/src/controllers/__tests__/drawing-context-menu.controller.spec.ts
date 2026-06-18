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

import { ContextMenuPosition } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DrawingContextMenuController } from '../drawing-context-menu.controller';

function createController(options?: {
    selectedObjects?: Map<string, { oKey: string }>;
    drawingLookup?: (oKey: string) => unknown;
    scene?: any;
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
    const controller = new DrawingContextMenuController(
        { getDrawingOKey: vi.fn(options?.drawingLookup ?? (() => ({ unitId: 'u1' }))) } as any,
        contextMenuService as any,
        { getRenderById: vi.fn(() => ({ scene })) } as any,
        { getAllUnitsForType: vi.fn(() => [{ getUnitId: () => 'unit-1' }]) } as any
    );

    return { controller, changeEnd$, contextMenuService, transformer };
}

describe('DrawingContextMenuController', () => {
    it('opens drawing context menu on right click when all selected objects belong to drawings', () => {
        const { controller, changeEnd$, contextMenuService } = createController();
        const event = { button: 2 };

        changeEnd$.next({ event });

        expect(contextMenuService.triggerContextMenu).toHaveBeenCalledWith(event, ContextMenuPosition.DRAWING);
        controller.dispose();
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
