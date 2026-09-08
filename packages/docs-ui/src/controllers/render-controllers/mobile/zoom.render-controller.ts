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

import { DocumentFlavor } from '@univerjs/core';
import { VIEWPORT_KEY } from '../../../basics/docs-view-key';
import { DocZoomRenderController } from '../zoom.render-controller';
import { MobileDocPinchZoomGesture } from './doc-pinch-zoom';

export class MobileDocZoomRenderController extends DocZoomRenderController {
    protected override _initGestureZoom(): void {
        if (
            this._context.unit.getSnapshot().documentStyle.documentFlavor !== DocumentFlavor.TRADITIONAL
        ) {
            return;
        }

        const scene = this._context.scene;
        const engine = scene.getEngine();
        const canvasElement = engine?.getCanvasElement();
        const viewport = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (engine == null || canvasElement == null || viewport == null) {
            return;
        }

        this.disposeWithMe(new MobileDocPinchZoomGesture({
            canvasElement,
            commandService: this._commandService,
            contextService: this._contextService,
            docViewScaleService: this._docViewScaleService,
            engine,
            scene,
            textSelectionManagerService: this._textSelectionManagerService,
            unitId: this._context.unitId,
            viewport,
        }));
    }
}
