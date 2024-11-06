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

import { Disposable, Inject, UniverInstanceType } from '@univerjs/core';
import { DrawingRenderService } from '@univerjs/drawing-ui';
import { CURSOR_TYPE, IRenderManagerService } from '@univerjs/engine-render';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { HoverManagerService } from '@univerjs/sheets-ui';
import { SheetCellCacheManagerService } from '../services/sheet-cell-cache-manager.service';

export class SheetCellImageHoverController extends Disposable {
    constructor(
        @Inject(HoverManagerService) private _hoverManagerService: HoverManagerService,
        @Inject(IRenderManagerService) private _renderManagerService: IRenderManagerService,
        @Inject(SheetsSelectionsService) private _selectionsService: SheetsSelectionsService,
        @Inject(SheetCellCacheManagerService) private _sheetCellCacheManagerService: SheetCellCacheManagerService,
        @Inject(DrawingRenderService) private _drawingRenderService: DrawingRenderService
    ) {
        super();
        this._initHover();
        this._initImageClick();
    }

    private _initHover() {
        let isSetCursor = false;
        this.disposeWithMe(this._hoverManagerService.currentRichText$.subscribe((hover) => {
            if (hover) {
                const currentSelection = this._selectionsService.getWorkbookSelections(hover.unitId).getSelectionOfWorksheet(hover.subUnitId)[0];
                const renderer = this._renderManagerService.getRenderById(hover.unitId);
                if (renderer) {
                    if (hover.drawing && currentSelection.primary?.actualColumn === hover.col && currentSelection.primary.actualRow === hover.row) {
                        renderer.mainComponent?.setCursor(CURSOR_TYPE.ZOOM_IN);
                        isSetCursor = true;
                    } else {
                        renderer.mainComponent?.setCursor(CURSOR_TYPE.DEFAULT);
                        isSetCursor = false;
                    }
                }
            } else {
                if (isSetCursor) {
                    const renderer = this._renderManagerService.getCurrentTypeOfRenderer(UniverInstanceType.UNIVER_SHEET);
                    if (renderer) {
                        renderer.mainComponent?.setCursor(CURSOR_TYPE.DEFAULT);
                        isSetCursor = false;
                    }
                }
            }
        }));
    }

    private _initImageClick() {
        this.disposeWithMe(this._hoverManagerService.currentClickedCell$.subscribe((clickedCell) => {
            if (clickedCell.drawing) {
                const currentSelection = this._selectionsService.getWorkbookSelections(clickedCell.location.unitId).getSelectionOfWorksheet(clickedCell.location.subUnitId)[0];

                if (currentSelection.primary?.actualColumn === clickedCell.location.col && currentSelection.primary?.actualRow === clickedCell.location.row) {
                    // const drawings = this
                    const imageElement = this._sheetCellCacheManagerService.getImageElementByKey(clickedCell.location.unitId, clickedCell.location.subUnitId, clickedCell.drawing);

                    if (imageElement) {
                        this._drawingRenderService.previewImage(`${clickedCell.drawing}-preview-image`, imageElement.src, imageElement.width, imageElement.height);
                    }
                }
            }
        }));
    }
}
