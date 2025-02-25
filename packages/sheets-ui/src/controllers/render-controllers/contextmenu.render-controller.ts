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
import type { IRenderContext, IRenderModule, Spreadsheet, SpreadsheetColumnHeader, SpreadsheetHeader } from '@univerjs/engine-render';
import {
    Disposable,
    Inject,
    RANGE_TYPE,
} from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { ContextMenuPosition, IContextMenuService } from '@univerjs/ui';

import { SHEET_VIEW_KEY } from '../../common/keys';
import { ISheetSelectionRenderService } from '../../services/selection/base-selection-render.service';
import { attachSelectionWithCoord } from '../../services/selection/util';

/**
 * This controller subscribe to context menu events in sheet rendering views and invoke context menu at a correct
 * position and with correct menu type.
 */
export class SheetContextMenuRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @IContextMenuService private readonly _contextMenuService: IContextMenuService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @ISheetSelectionRenderService private readonly _selectionRenderService: ISheetSelectionRenderService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        const spreadsheetPointerDownObserver = (this._context?.mainComponent as Spreadsheet)?.onPointerDown$;

        // Content range context menu
        const spreadsheetSubscription = spreadsheetPointerDownObserver.subscribeEvent((event) => {
            if (event.button === 2) {
                const selections = this._selectionManagerService.getCurrentSelections();
                const currentSelection = selections?.[0];
                if (!currentSelection) {
                    return;
                }
                const rangeType = currentSelection.range.rangeType;
                const skeleton = this._selectionRenderService.getSkeleton();
                const selectionRangeWithCoord = attachSelectionWithCoord(currentSelection, skeleton);
                const range = selectionRangeWithCoord.rangeWithCoord;
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
                    triggerMenu(ContextMenuPosition.MAIN_AREA);
                } else if (rangeType === RANGE_TYPE.COLUMN) {
                    triggerMenu(ContextMenuPosition.COL_HEADER);
                } else if (rangeType === RANGE_TYPE.ROW) {
                    triggerMenu(ContextMenuPosition.ROW_HEADER);
                } else {
                    triggerMenu(ContextMenuPosition.MAIN_AREA);
                }
            }
        });
        this.disposeWithMe(spreadsheetSubscription);

        // Row header context menu
        const spreadsheetColumnHeader = this._context.components.get(SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnHeader;
        const spreadsheetRowHeader = this._context.components.get(SHEET_VIEW_KEY.ROW) as SpreadsheetHeader;
        const rowHeaderSub = spreadsheetRowHeader.onPointerDown$.subscribeEvent((event) => {
            if (event.button === 2) {
                this._contextMenuService.triggerContextMenu(event, ContextMenuPosition.ROW_HEADER);
            }
        });
        this.disposeWithMe(rowHeaderSub);

        // Col header context menu
        const colHeaderPointerDownObserver = spreadsheetColumnHeader.onPointerDown$;
        const colHeaderObserver = colHeaderPointerDownObserver.subscribeEvent((event) => {
            if (event.button === 2) {
                this._contextMenuService.triggerContextMenu(event, ContextMenuPosition.COL_HEADER);
            }
        });
        this.disposeWithMe(colHeaderObserver);
    }
}
