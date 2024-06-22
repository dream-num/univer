/**
 * Copyright 2023-present DreamNum Inc.
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

import type { Workbook } from '@univerjs/core';
import { Disposable, Rectangle } from '@univerjs/core';
import { type IPointerEvent, type IRenderContext, type IRenderModule, SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { IContextMenuService, ILayoutService, MenuPosition } from '@univerjs/ui';
import { SelectionManagerService } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import { ISelectionRenderService } from '../../../services/selection/selection-render.service';

/**
 * On mobile devices, the context menu would popup when
 *
 * @ignore
 */
export class SheetContextMenuMobileRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @ILayoutService private readonly _layoutService: ILayoutService,
        @IContextMenuService private readonly _contextMenuService: IContextMenuService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        let listenToSelectionChangeEvent = false;

        this.disposeWithMe(this._selectionManagerService.selectionMoveStart$.subscribe(() => listenToSelectionChangeEvent = true));
        this.disposeWithMe(this._selectionManagerService.selectionMoveEnd$.subscribe((selection) => {
            if (!selection || listenToSelectionChangeEvent === false) {
                return;
            }

            listenToSelectionChangeEvent = false;

            const selectionRange = selection[0];
            if (!selectionRange.primary || Rectangle.equals(selectionRange.range, selectionRange.primary)) {
                return;
            }

            const canvasRect = this._layoutService.getCanvasElement().getBoundingClientRect();
            const range = this._selectionRenderService.attachSelectionWithCoord(selectionRange);

            const { scene } = this._context;
            const viewMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
            const viewportScrollX = viewMain?.viewportScrollX || 0;
            const viewportScrollY = viewMain?.viewportScrollY || 0;

            const clientX = range.rangeWithCoord.startX + canvasRect.left - viewportScrollX;
            const clientY = range.rangeWithCoord.endY + canvasRect.top - viewportScrollY;
            this._contextMenuService.triggerContextMenu({
                clientX,
                clientY,
                preventDefault: () => {},
                stopPropagation: () => {},
            } as unknown as IPointerEvent, MenuPosition.CONTEXT_MENU);
        }));
    }
}
