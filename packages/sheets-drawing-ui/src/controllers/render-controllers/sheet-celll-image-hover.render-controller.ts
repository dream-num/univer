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

import type { IDocImage } from '@univerjs/docs-drawing';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, Inject } from '@univerjs/core';
import { DrawingRenderService } from '@univerjs/drawing-ui';
import { CURSOR_TYPE } from '@univerjs/engine-render';
import { type ISelectionWithStyle, SheetsSelectionsService } from '@univerjs/sheets';
import { HoverManagerService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { throttleTime } from 'rxjs';

export class SheetCellImageHoverRenderController extends Disposable implements IRenderModule {
    private _isSetCursor = false;

    constructor(
        private _context: IRenderContext,
        @Inject(HoverManagerService) private _hoverManagerService: HoverManagerService,
        @Inject(SheetsSelectionsService) private _selectionsService: SheetsSelectionsService,
        @Inject(DrawingRenderService) private _drawingRenderService: DrawingRenderService,
        @Inject(SheetSkeletonManagerService) private _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        super();
        this._initHover();
        this._initImageClick();
    }

    private _initHover() {
        this.disposeWithMe(this._hoverManagerService.currentRichTextNoDistinct$
            .pipe(throttleTime(33))
            .subscribe((richText) => {
                let currentSelections: Readonly<ISelectionWithStyle[]> = [];
                // null richText means the unit was disposed, should not get current selections
                if (richText !== null) {
                    currentSelections = this._selectionsService.getWorkbookSelections(this._context.unitId).getCurrentSelections();
                }
                if (
                    currentSelections.length > 0 &&
                    richText?.unitId === this._context.unitId &&
                    richText?.drawing &&
                    currentSelections.length === 1 &&
                    currentSelections[0].primary?.actualRow === richText.row &&
                    currentSelections[0].primary?.actualColumn === richText.col
                ) {
                    this._isSetCursor = true;
                    this._context.scene.setCursor(CURSOR_TYPE.ZOOM_IN);
                } else if (this._isSetCursor) {
                    this._isSetCursor = false;
                    this._context.scene.resetCursor();
                }
            }));
    }

    private _initImageClick() {
        this.disposeWithMe(this._hoverManagerService.currentClickedCell$.subscribe((click) => {
            if (click?.drawing && this._isSetCursor) {
                const imageDrawing = click.drawing.drawing.drawingOrigin as IDocImage;
                const imageEle = this._sheetSkeletonManagerService.getCurrentSkeleton()?.imageCacheMap.getImage(imageDrawing.imageSourceType, imageDrawing.source);
                if (!imageEle) return;
                this._drawingRenderService.previewImage('preview-cell-image', imageEle.src, imageEle.width, imageEle.height);
                this._context.scene.resetCursor();
                this._isSetCursor = false;
            }
        }));
    }
}
