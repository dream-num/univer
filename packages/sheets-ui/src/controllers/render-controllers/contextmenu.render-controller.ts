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

import type {
    Workbook } from '@univerjs/core';
import {
    Disposable,
    RANGE_TYPE,
    toDisposable,
} from '@univerjs/core';
import type { IRenderContext, IRenderModule, Spreadsheet, SpreadsheetColumnHeader, SpreadsheetHeader } from '@univerjs/engine-render';
import { SelectionManagerService } from '@univerjs/sheets';
import { IContextMenuService, MenuPosition } from '@univerjs/ui';
import { Inject } from '@wendellhu/redi';

import { ISelectionRenderService } from '../../services/selection/selection-render.service';
import { SheetMenuPosition } from '../menu/menu';
import { SHEET_VIEW_KEY } from '../../common/keys';

/**
 * This controller subscribe to context menu events in sheet rendering views and invoke context menu at a correct
 * position and with correct menu type.
 */
export class SheetContextMenuRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @IContextMenuService private readonly _contextMenuService: IContextMenuService,
        @Inject(SelectionManagerService)
        private readonly _selectionManagerService: SelectionManagerService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService
    ) {
        super();
        this._addListeners();
    }

    private _addListeners(): void {
        const spreadsheetPointerDownObserver = (this._context?.mainComponent as Spreadsheet)?.onPointerDownObserver;
        const spreadsheetObserver = spreadsheetPointerDownObserver.add((event) => {
            if (event.button === 2) {
                const selections = this._selectionManagerService.getSelections();
                const currentSelection = selections?.[0];
                if (!currentSelection) {
                    return;
                }
                const rangeType = currentSelection.range.rangeType;
                const range = this._selectionRenderService.attachSelectionWithCoord(currentSelection).rangeWithCoord;
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

        const spreadsheetColumnHeader = this._context.components.get(SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnHeader;
        const spreadsheetRowHeader = this._context.components.get(SHEET_VIEW_KEY.ROW) as SpreadsheetHeader;
        const rowHeaderPointerDownObserver = spreadsheetRowHeader.onPointerDownObserver;
        const rowHeaderObserver = rowHeaderPointerDownObserver.add((event) => {
            if (event.button === 2) {
                this._contextMenuService.triggerContextMenu(event, SheetMenuPosition.ROW_HEADER_CONTEXT_MENU);
            }
        });
        this.disposeWithMe(toDisposable(() => spreadsheetPointerDownObserver.remove(rowHeaderObserver)));

        const colHeaderPointerDownObserver = spreadsheetColumnHeader.onPointerDownObserver;
        const colHeaderObserver = colHeaderPointerDownObserver.add((event) => {
            if (event.button === 2) {
                this._contextMenuService.triggerContextMenu(event, SheetMenuPosition.COL_HEADER_CONTEXT_MENU);
            }
        });
        this.disposeWithMe(toDisposable(() => spreadsheetPointerDownObserver.remove(colHeaderObserver)));
    }
}
