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

import type { Nullable, Workbook } from '@univerjs/core';
import { Disposable, RANGE_TYPE, Tools } from '@univerjs/core';
import { type IPointerEvent, type IRenderContext, type IRenderModule, SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { IContextMenuService, ILayoutService, MenuPosition } from '@univerjs/ui';
import type { ISelectionWithStyle } from '@univerjs/sheets';
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
        this.disposeWithMe(this._selectionManagerService.selectionMoveEnd$.subscribe((selectionsList: Nullable<ISelectionWithStyle[]>) => {
            if (!selectionsList || listenToSelectionChangeEvent === false) {
                return;
            }

            listenToSelectionChangeEvent = false;

            const selectionRangeWithStyle = selectionsList[0];
            // if (!selectionRangeWithStyle.primary || Rectangle.equals(selectionRangeWithStyle.range, selectionRangeWithStyle.primary)) {
                // return;
            // }

            if (!selectionRangeWithStyle.primary) return;

            const canvasRect = this._layoutService.getCanvasElement().getBoundingClientRect();
            const range = this._selectionRenderService.attachSelectionWithCoord(selectionRangeWithStyle);
            const rangeType = selectionRangeWithStyle.range.rangeType;

            const { scene } = this._context;
            const viewMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
            const viewportScrollX = viewMain?.viewportScrollX || 0;
            const viewportScrollY = viewMain?.viewportScrollY || 0;

            let clientX = 0;
            let clientY = 0;

            const rowHeaderWidth = 46;
            // TODO @lumixraku popup should positioned by transform not topleft.
            // using transform & transform-origin would be easy to position popup
            switch (rangeType) {
                case RANGE_TYPE.NORMAL:
                    clientX = range.rangeWithCoord.startX + canvasRect.left - viewportScrollX;
                    clientY = range.rangeWithCoord.endY + canvasRect.top - viewportScrollY;
                    break;
                case RANGE_TYPE.COLUMN:
                    clientX = range.rangeWithCoord.startX + canvasRect.left - viewportScrollX;
                    // slightly lower than control point for easy to drag control point.
                    clientY = Math.min(canvasRect.height / 2, range.rangeWithCoord.endY) + 40;
                    break;
                case RANGE_TYPE.ROW:
                    // slightly left than control point for easy to drag control point.
                    clientX = rowHeaderWidth + (canvasRect.width - rowHeaderWidth) / 2 + 20;
                    clientY = range.rangeWithCoord.endY + canvasRect.top - viewportScrollY;
                    break;
                default:
                    break;
            }
            // in case clientXY is not in screen area.
            clientX = Tools.clamp(clientX, rowHeaderWidth, canvasRect.width);
            clientY = Tools.clamp(clientY, canvasRect.top, canvasRect.height);

            this._contextMenuService.triggerContextMenu({
                clientX,
                clientY,
                preventDefault: () => {},
                stopPropagation: () => {},
            } as unknown as IPointerEvent, MenuPosition.CONTEXT_MENU);
        }));
    }
}
