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

import {
    Disposable,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
    RANGE_TYPE,
    toDisposable,
} from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SelectionManagerService } from '@univerjs/sheets';
import { IContextMenuService, MenuPosition } from '@univerjs/ui';
import { Inject } from '@wendellhu/redi';

import { ISelectionRenderService } from '../../services/selection/selection-render.service';
import { SheetMenuPosition } from '../menu/menu';
import { getSheetObject } from '../utils/component-tools';

/**
 * This controller subscribe to context menu events in
 * sheet rendering views and invoke context menu at a correct position
 * and with correct menu type.
 */
@OnLifecycle(LifecycleStages.Rendered, SheetContextMenuController)
export class SheetContextMenuController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
        @IContextMenuService private readonly _contextMenuService: IContextMenuService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(SelectionManagerService)
        private readonly _selectionManagerService: SelectionManagerService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService
    ) {
        super();
        this._currentUniverService.currentSheet$.subscribe((workbook) => {
            if (workbook == null) {
                throw new Error('workbook is null');
            }
            this._addListeners();
        });
    }

    private _addListeners(): void {
        const objects = getSheetObject(this._currentUniverService, this._renderManagerService);
        if (!objects) {
            return;
        }

        const spreadsheetPointerDownObserver = objects.spreadsheet.onPointerDownObserver;
        const spreadsheetObserver = spreadsheetPointerDownObserver.add((event) => {
            if (event.button === 2) {
                const selections = this._selectionManagerService.getSelections();
                const currentSelection = selections?.[0];
                if (!currentSelection) {
                    return;
                }
                const rangeType = currentSelection.range.rangeType;
                const range = this._selectionRenderService.convertSelectionRangeToData(currentSelection).rangeWithCoord;
                const isPointerInRange = () => {
                    if (!range) {
                        return false;
                    }
                    const x = event.offsetX;
                    const y = event.offsetY;
                    switch (rangeType) {
                        case RANGE_TYPE.ROW:
                            return range.startY <= y && range.endY >= y;
                        case RANGE_TYPE.COLUMN:
                            return range.startX <= x && range.endX >= x;
                        default:
                            return range.startX <= x && range.endX >= x && range.startY <= y && range.endY >= y;
                    }
                };

                const triggerMenu = (position: string) => {
                    this._contextMenuService.triggerContextMenu(event, position);
                };
                if (!isPointerInRange()) {
                    triggerMenu(MenuPosition.CONTEXT_MENU);
                } else if (rangeType === RANGE_TYPE.COLUMN) {
                    triggerMenu(SheetMenuPosition.COL_HEADER_CONTEXT_MENU);
                } else if (rangeType === RANGE_TYPE.ROW) {
                    triggerMenu(SheetMenuPosition.ROW_HEADER_CONTEXT_MENU);
                } else {
                    triggerMenu(MenuPosition.CONTEXT_MENU);
                }
            }
        });
        this.disposeWithMe(toDisposable(() => spreadsheetPointerDownObserver.remove(spreadsheetObserver)));

        const rowHeaderPointerDownObserver = objects.spreadsheetRowHeader.onPointerDownObserver;
        const rowHeaderObserver = rowHeaderPointerDownObserver.add((event) => {
            if (event.button === 2) {
                this._contextMenuService.triggerContextMenu(event, SheetMenuPosition.ROW_HEADER_CONTEXT_MENU);
            }
        });
        this.disposeWithMe(toDisposable(() => spreadsheetPointerDownObserver.remove(rowHeaderObserver)));

        const colHeaderPointerDownObserver = objects.spreadsheetColumnHeader.onPointerDownObserver;
        const colHeaderObserver = colHeaderPointerDownObserver.add((event) => {
            if (event.button === 2) {
                this._contextMenuService.triggerContextMenu(event, SheetMenuPosition.COL_HEADER_CONTEXT_MENU);
            }
        });
        this.disposeWithMe(toDisposable(() => spreadsheetPointerDownObserver.remove(colHeaderObserver)));
    }
}
