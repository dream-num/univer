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
    private _pagePositionOffset = { x: 0, y: 0 };
    private _pendingZoomAnchor?: {
        pagePoint: { x: number; y: number };
        viewportPoint: { x: number; y: number };
    };

    constructor(
        private _context: IRenderContext<DocumentDataModel>,
        @Inject(DocViewScaleService) private readonly _docViewScaleService: DocViewScaleService
    ) {
        super();
    }

    setZoomAnchorAtViewportPoint(viewportPoint: { x: number; y: number }): boolean {
        const { document: docsComponent, scene } = neoGetDocObject(this._context);
        const viewport = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (!viewport) {
            return false;
        }

        const scaleX = scene.scaleX || 1;
        const scaleY = scene.scaleY || 1;
        this._pendingZoomAnchor = {
            pagePoint: {
                x: viewport.viewportScrollX + viewportPoint.x / scaleX - docsComponent.left,
                y: viewport.viewportScrollY + viewportPoint.y / scaleY - docsComponent.top,
            },
            viewportPoint,
        };
        return true;
    }

    clearZoomAnchor(): void {
        this._pendingZoomAnchor = undefined;
    }

    private _restoreZoomAnchor(): void {
        const zoomAnchor = this._pendingZoomAnchor;
        if (!zoomAnchor) {
            return;
        }

        const { document: docsComponent, scene, docBackground } = neoGetDocObject(this._context);
        const viewport = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (!viewport) {
            this._pendingZoomAnchor = undefined;
            return;
        }

        const desiredScroll = {
            viewportScrollX: docsComponent.left + zoomAnchor.pagePoint.x - zoomAnchor.viewportPoint.x / (scene.scaleX || 1),
            viewportScrollY: docsComponent.top + zoomAnchor.pagePoint.y - zoomAnchor.viewportPoint.y / (scene.scaleY || 1),
        };
        viewport.scrollToViewportPos({
            viewportScrollX: 0,
            viewportScrollY: desiredScroll.viewportScrollY,
        });
        const residual = {
            x: desiredScroll.viewportScrollX,
            y: desiredScroll.viewportScrollY - viewport.viewportScrollY,
        };
        if (Math.abs(residual.x) >= 0.01 || Math.abs(residual.y) >= 0.01) {
            this._pagePositionOffset = {
                x: this._pagePositionOffset.x - residual.x,
                y: this._pagePositionOffset.y - residual.y,
            };
            docsComponent.translate(docsComponent.left - residual.x, docsComponent.top - residual.y);
            docBackground.translate(docBackground.left - residual.x, docBackground.top - residual.y);
        }
        this._pendingZoomAnchor = undefined;
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

            scrollToX = 0;
        }

        if (engineHeight > docsHeight) {
            sceneHeight = (engineHeight - pageMarginTop * 2) / viewScale;
        } else {
            sceneHeight = docsHeight + pageMarginTop * 2;
        }

        scene.transformByState({ width: sceneWidth, height: sceneHeight });

        // the engine width is 1, when engine has no container.
        // Use to fix flickering issues into the page.
        if (engineWidth <= 1) {
            docsLeft = -10000;
            docsTop = -10000;
        }

        docsLeft += this._pagePositionOffset.x;
        docsTop += this._pagePositionOffset.y;

        docsComponent.translate(docsLeft, docsTop);
        docBackground.translate(docsLeft, docsTop);

        const viewport = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (scrollToX !== Number.POSITIVE_INFINITY && viewport != null) {
            viewport.scrollToViewportPos({
                viewportScrollX: scrollToX,
            });
        }
        this._restoreZoomAnchor();

        return this;
    }
}
