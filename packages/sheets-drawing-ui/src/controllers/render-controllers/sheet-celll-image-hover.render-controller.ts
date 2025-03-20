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
import { CURSOR_TYPE, IRenderManagerService } from '@univerjs/engine-render';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { HoverManagerService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';

export class SheetCellImageHoverRenderController extends Disposable implements IRenderModule {
    private _isSetCursor = false;

    constructor(
        private _context: IRenderContext,
        @Inject(HoverManagerService) private _hoverManagerService: HoverManagerService,
        @Inject(IRenderManagerService) private _renderManagerService: IRenderManagerService,
        @Inject(SheetsSelectionsService) private _selectionsService: SheetsSelectionsService,
        @Inject(DrawingRenderService) private _drawingRenderService: DrawingRenderService,
        @Inject(SheetSkeletonManagerService) private _sheetSkeletonManagerService: SheetSkeletonManagerService
    ) {
        super();
        this._initHover();
        this._initImageClick();
    }

    private _initHover() {
        this.disposeWithMe(this._hoverManagerService.currentRichText$.subscribe((richText) => {
            if (richText?.drawing) {
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
            if (click?.drawing) {
                const imageDrawing = click.drawing.drawing.drawingOrigin as IDocImage;
                const imageEle = this._sheetSkeletonManagerService.getCurrentSkeleton()?.imageCacheMap.getImage(imageDrawing.imageSourceType, imageDrawing.source);
                if (!imageEle) return;
                this._drawingRenderService.previewImage('preview-cell-image', imageEle.src, imageEle.width, imageEle.height);
            }
        }));
    }
}
