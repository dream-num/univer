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

import type { DocumentDataModel } from '@univerjs/core';
import { Disposable } from '@univerjs/core';
import { neoGetDocObject, VIEWPORT_KEY } from '@univerjs/docs';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';

export class DocPageLayoutService extends Disposable implements IRenderModule {
    constructor(
        private _context: IRenderContext<DocumentDataModel>
    ) {
        super();
    }

    calculatePagePosition() {
        const docObject = neoGetDocObject(this._context);
        const docDataModel = this._context.unit;
        const zoomRatio = docDataModel.getSettings()?.zoomRatio ?? 1;
        const { document: docsComponent, scene, docBackground } = docObject;

        const parent = scene?.getParent();

        const { width: docsWidth, height: docsHeight, pageMarginLeft, pageMarginTop } = docsComponent;
        if (parent == null || docsWidth === Number.POSITIVE_INFINITY || docsHeight === Number.POSITIVE_INFINITY) {
            return;
        }
        const { width: engineWidth, height: engineHeight } = parent;
        let docsLeft = 0;
        let docsTop = 0;

        let sceneWidth = 0;

        let sceneHeight = 0;

        let scrollToX = Number.POSITIVE_INFINITY;

        if (engineWidth > (docsWidth + pageMarginLeft * 2) * zoomRatio) {
            docsLeft = engineWidth / 2 - (docsWidth * zoomRatio) / 2;
            docsLeft /= zoomRatio;
            sceneWidth = (engineWidth - pageMarginLeft * 2) / zoomRatio;

            scrollToX = 0;
        } else {
            docsLeft = pageMarginLeft;
            sceneWidth = docsWidth + pageMarginLeft * 2;

            scrollToX = (sceneWidth - engineWidth / zoomRatio) / 2;
        }

        if (engineHeight > docsHeight) {
            docsTop = engineHeight / 2 - docsHeight / 2;
            sceneHeight = (engineHeight - pageMarginTop * 2) / zoomRatio;
        } else {
            docsTop = pageMarginTop;
            sceneHeight = docsHeight + pageMarginTop * 2;
        }

        scene.resize(sceneWidth, sceneHeight + 200);

        docsComponent.translate(docsLeft, docsTop);
        docBackground.translate(docsLeft, docsTop);

        const viewport = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (scrollToX !== Number.POSITIVE_INFINITY && viewport != null) {
            const actualX = viewport.transViewportScroll2ScrollValue(scrollToX, 0).x;
            viewport.scrollTo({
                x: actualX,
            });
        }

        return this;
    }
}
