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

import type { Workbook } from '@univerjs/core';
import { Disposable, Inject, RANGE_TYPE, Tools } from '@univerjs/core';
import { type IPointerEvent, type IRenderContext, type IRenderModule, SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { type ISelectionWithStyle, SheetsSelectionsService } from '@univerjs/sheets';
import { ContextMenuPosition, IContextMenuService, ILayoutService } from '@univerjs/ui';
import { ISheetSelectionRenderService } from '../../../services/selection/base-selection-render.service';
import { attachSelectionWithCoord } from '../../../services/selection/util';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';

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
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @ISheetSelectionRenderService private readonly _selectionRenderService: ISheetSelectionRenderService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        let listenToSelectionChangeEvent = false;
        this.disposeWithMe(this._selectionManagerService.selectionMoveStart$.subscribe(() => listenToSelectionChangeEvent = true));
        this.disposeWithMe(this._selectionManagerService.selectionMoveEnd$.subscribe((selectionWithStyleList: ISelectionWithStyle[]) => {
            const skeleton = this._sheetSkeletonManagerService.getCurrentParam()!.skeleton;
            if (!skeleton || !selectionWithStyleList || listenToSelectionChangeEvent === false) {
                return;
            }

            listenToSelectionChangeEvent = false;

            const selectionRangeWithStyle = selectionWithStyleList[0] as unknown as ISelectionWithStyle;

            if (!selectionRangeWithStyle.primary) return;

            const selectionWithCoord = attachSelectionWithCoord(selectionRangeWithStyle, skeleton);
            const rangeType = selectionRangeWithStyle.range.rangeType;

            const { scene } = this._context;
            const viewMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
            const viewportScrollX = viewMain?.viewportScrollX || 0;
            const viewportScrollY = viewMain?.viewportScrollY || 0;

            let clientX = 0;
            let clientY = 0;

            const rowHeaderWidth = skeleton.rowHeaderWidth;

            // TODO @lumixraku popup should positioned by transform not topleft.
            // using transform & transform-origin would be easy to position popup
            const canvasRect = this._layoutService.getContentElement().getBoundingClientRect();
            switch (rangeType) {
                case RANGE_TYPE.NORMAL:
                    clientX = selectionWithCoord.rangeWithCoord.startX + canvasRect.left - viewportScrollX;
                    clientY = selectionWithCoord.rangeWithCoord.endY + canvasRect.top - viewportScrollY;
                    break;
                case RANGE_TYPE.COLUMN:
                    clientX = selectionWithCoord.rangeWithCoord.startX + canvasRect.left - viewportScrollX;
                    // slightly lower than control point for easy to drag control point.
                    clientY = Math.min(canvasRect.height / 2, selectionWithCoord.rangeWithCoord.endY) + 40;
                    break;
                case RANGE_TYPE.ROW:
                    // slightly left than control point for easy to drag control point.
                    clientX = (canvasRect.width - rowHeaderWidth) / 2 + 20;
                    clientY = selectionWithCoord.rangeWithCoord.endY + canvasRect.top - viewportScrollY;
                    break;
                case RANGE_TYPE.ALL:
                    clientX = selectionWithCoord.rangeWithCoord.startX + canvasRect.left;
                    clientY = selectionWithCoord.rangeWithCoord.startY + canvasRect.top;
                    break;
                default:
                    clientX = selectionWithCoord.rangeWithCoord.startX + canvasRect.left - viewportScrollX;
                    clientY = selectionWithCoord.rangeWithCoord.endY + canvasRect.top - viewportScrollY;
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
            } as unknown as IPointerEvent, ContextMenuPosition.MAIN_AREA);
        }));
    }
}
