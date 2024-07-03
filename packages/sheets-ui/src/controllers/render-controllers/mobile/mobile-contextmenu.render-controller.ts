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
import type { IPointerEvent, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { IContextMenuService, ILayoutService, MenuPosition } from '@univerjs/ui';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import { ISheetSelectionRenderService } from '../../../services/selection/base-selection-render.service';
import { attachSelectionWithCoord } from '../../../services/selection/util';

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
        @ISheetSelectionRenderService private readonly _selectionRenderService: ISheetSelectionRenderService
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
            const skeleton = this._selectionRenderService.getSkeleton();
            const range = attachSelectionWithCoord(selectionRange, skeleton);
            this._contextMenuService.triggerContextMenu({
                // TODO@wzhudev: there is an offset with the rangeWithCoord.endX and rangeWithCoord.endY
                // with the client rect
                clientX: range.rangeWithCoord.startX + canvasRect.left,
                clientY: range.rangeWithCoord.endY + canvasRect.top,
                preventDefault: () => {},
                stopPropagation: () => {},
            } as unknown as IPointerEvent, MenuPosition.CONTEXT_MENU);
        }));
    }
}
