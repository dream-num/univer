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

import type { DocumentDataModel } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, Inject } from '@univerjs/core';
import { neoGetDocObject } from '../basics/component-tools';
import { VIEWPORT_KEY } from '../basics/docs-view-key';
import { DocViewScaleService, resolveDocFitPaddingX } from './doc-view-scale';

export class DocPageLayoutService extends Disposable implements IRenderModule {
    constructor(
        private _context: IRenderContext<DocumentDataModel>,
        @Inject(DocViewScaleService) private readonly _docViewScaleService: DocViewScaleService
    ) {
        super();
    }

    calculatePagePosition() {
        if (this._disposed) return;

        const docObject = neoGetDocObject(this._context);
        const viewScale = this._docViewScaleService.getViewScale();
        const fitOptions = this._docViewScaleService.getOptions();
        const isStartAlignedFit = fitOptions.mode === 'fit-width' && fitOptions.align === 'start';
        const { document: docsComponent, scene, docBackground } = docObject;
        if (scene.scaleX !== viewScale || scene.scaleY !== viewScale) {
            scene.scale(viewScale, viewScale);
        }

        const parent = scene?.getParent();

        const { width: docsWidth, height: docsHeight, pageMarginLeft, pageMarginTop } = docsComponent;
        const horizontalMargin = isStartAlignedFit
            ? resolveDocFitPaddingX(this._docViewScaleService.getAvailableWidth(), fitOptions.paddingX) / viewScale
            : pageMarginLeft;

        if (parent == null || docsWidth === Number.POSITIVE_INFINITY || docsHeight === Number.POSITIVE_INFINITY) {
            return;
        }
        const { width: engineWidth, height: engineHeight } = parent;
        let docsLeft = 0;
        let docsTop = pageMarginTop;

        let sceneWidth = 0;

        let sceneHeight = 0;

        let scrollToX = Number.POSITIVE_INFINITY;

        if (engineWidth > (docsWidth + horizontalMargin * 2) * viewScale) {
            docsLeft = isStartAlignedFit ? horizontalMargin : (engineWidth / 2 - (docsWidth * viewScale) / 2) / viewScale;
            sceneWidth = (engineWidth - horizontalMargin * 2) / viewScale;

            scrollToX = 0;
        } else {
            docsLeft = horizontalMargin;
            sceneWidth = docsWidth + horizontalMargin * 2;

            scrollToX = isStartAlignedFit ? 0 : (sceneWidth - engineWidth / viewScale) / 2;
        }

        if (engineHeight > docsHeight) {
            sceneHeight = (engineHeight - pageMarginTop * 2) / viewScale;
        } else {
            sceneHeight = docsHeight + pageMarginTop * 2;
        }

        scene.resize(sceneWidth, sceneHeight);

        // the engine width is 1, when engine has no container.
        // Use to fix flickering issues into the page.
        if (engineWidth <= 1) {
            docsLeft = -10000;
            docsTop = -10000;
        }

        docsComponent.translate(docsLeft, docsTop);
        docBackground.translate(docsLeft, docsTop);

        const viewport = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (scrollToX !== Number.POSITIVE_INFINITY && viewport != null) {
            viewport.scrollToViewportPos({
                viewportScrollX: scrollToX,
            });
        }

        return this;
    }
}
