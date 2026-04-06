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

import { Injector, IUniverInstanceService } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ContextMenuPosition, IContextMenuService } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DrawingContextMenuController } from '../drawing-context-menu.controller';

describe('DrawingContextMenuController', () => {
    it('opens the drawing context menu only for right-click transformer changes with valid drawing selections', () => {
        const changeEnd$ = new Subject<any>();
        const triggerContextMenu = vi.fn();
        const injector = new Injector();
        injector.add([IDrawingManagerService, {
            useValue: {
                getDrawingOKey: vi.fn((oKey: string) => oKey.includes('drawing-1') ? { drawingId: 'drawing-1' } : null),
            } as never,
        }]);
        injector.add([IContextMenuService, { useValue: { triggerContextMenu } as never }]);
        injector.add([IRenderManagerService, {
            useValue: {
                getRenderById: vi.fn(() => ({
                    scene: {
                        getTransformerByCreate: () => ({
                            changeEnd$,
                            getSelectedObjectMap: () => new Map([
                                ['drawing-1', { oKey: 'book-1#-#sheet-1#-#drawing-1' }],
                            ]),
                        }),
                    },
                })),
            } as never,
        }]);
        injector.add([IUniverInstanceService, {
            useValue: {
                getAllUnitsForType: vi.fn(() => [{
                    getUnitId: () => 'book-1',
                }]),
            } as never,
        }]);

        const controller = injector.createInstance(DrawingContextMenuController);
        const rightClick = { button: 2 };
        const leftClick = { button: 0 };

        changeEnd$.next({ event: leftClick });
        expect(triggerContextMenu).not.toHaveBeenCalled();

        changeEnd$.next({ event: rightClick });
        expect(triggerContextMenu).toHaveBeenCalledWith(rightClick, ContextMenuPosition.DRAWING);

        controller.dispose();
    });
});
