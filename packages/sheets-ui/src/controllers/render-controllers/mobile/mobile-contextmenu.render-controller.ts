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
import { IContextMenuService, MenuPosition } from '@univerjs/ui';
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
        @IContextMenuService private readonly _contextMenuService: IContextMenuService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this.disposeWithMe(this._selectionManagerService.selectionMoveEnd$.subscribe((selection) => {
            if (!selection) {
                return;
            }

            const selectionRange = selection[0];
            if (!selectionRange.primary || Rectangle.equals(selectionRange.range, selectionRange.primary)) {
                return;
            }

            const range = this._selectionRenderService.attachSelectionWithCoord(selectionRange);
            this._contextMenuService.triggerContextMenu({
                clientX: range.rangeWithCoord.startX,
                clientY: range.rangeWithCoord.startY,
                preventDefault: () => {},
                stopPropagation: () => {},
            } as unknown as IPointerEvent, MenuPosition.CONTEXT_MENU);
        }));
    }
}
