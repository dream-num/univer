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
import { CURSOR_TYPE, IRenderManagerService } from '@univerjs/engine-render';
import { HoverManagerService } from '@univerjs/sheets-ui';

export class SheetCellImageHoverController extends Disposable {
    constructor(
        @Inject(HoverManagerService) private _hoverManagerService: HoverManagerService,
        @Inject(IRenderManagerService) private _renderManagerService: IRenderManagerService
    ) {
        super();
        this._initHover();
    }

    private _initHover() {
        let isSetCursor = false;
        this.disposeWithMe(this._hoverManagerService.currentRichText$.subscribe((hover) => {
            if (hover) {
                const renderer = this._renderManagerService.getRenderById(hover.unitId);
                if (renderer) {
                    if (hover.drawing) {
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
}
