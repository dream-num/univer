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

import type { ITextRange } from '@univerjs/core';
import type { IDocObjectParam } from '@univerjs/docs-ui';
import type { Viewport } from '@univerjs/engine-render';
import {
    DOCS_ZEN_EDITOR_UNIT_ID_KEY,
    RxDisposable,
} from '@univerjs/core';
import { VIEWPORT_KEY as DOC_VIEWPORT_KEY, DocBackScrollRenderController } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { getEditorObject } from '@univerjs/sheets-ui';

import { takeUntil } from 'rxjs';
import { IZenEditorManagerService } from '../services/zen-editor.service';

export class ZenEditorController extends RxDisposable {
    constructor(
        @IZenEditorManagerService private readonly _zenEditorManagerService: IZenEditorManagerService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this._syncZenEditorSize();
    }

    // Listen to changes in the size of the zen editor container to set the size of the editor.
    private _syncZenEditorSize() {
        this._zenEditorManagerService.position$.pipe(takeUntil(this.dispose$)).subscribe((position) => {
            if (position == null) {
                return;
            }

            const { width, height } = position;

            const editorObject = getEditorObject(DOCS_ZEN_EDITOR_UNIT_ID_KEY, this._renderManagerService);

            if (editorObject == null) {
                return;
            }

            // resize canvas
            requestIdleCallback(() => {
                editorObject.engine.resizeBySize(width, height);
                this._calculatePagePosition(editorObject);
                this._scrollToTop();
            });
        });
    }

    private _calculatePagePosition(currentRender: IDocObjectParam) {
        const { document: docsComponent, scene, docBackground } = currentRender;

        const parent = scene?.getParent();

        const { width: docsWidth, height: docsHeight, pageMarginLeft, pageMarginTop } = docsComponent;
        if (parent == null || docsWidth === Number.POSITIVE_INFINITY || docsHeight === Number.POSITIVE_INFINITY) {
            return;
        }
        const { width: engineWidth, height: engineHeight } = parent;

        let docsLeft = 0;
        const docsTop = pageMarginTop;

        let sceneWidth = 0;

        let sceneHeight = 0;

        let scrollToX = Number.POSITIVE_INFINITY;

        const { scaleX, scaleY } = scene.getAncestorScale();

        if (engineWidth > (docsWidth + pageMarginLeft * 2) * scaleX) {
            docsLeft = engineWidth / 2 - (docsWidth * scaleX) / 2;
            docsLeft /= scaleX;
            sceneWidth = (engineWidth - pageMarginLeft * 2) / scaleX;

            scrollToX = 0;
        } else {
            docsLeft = pageMarginLeft;
            sceneWidth = docsWidth + pageMarginLeft * 2;

            scrollToX = (sceneWidth - engineWidth / scaleX) / 2;
        }

        if (engineHeight > docsHeight) {
            sceneHeight = (engineHeight - pageMarginTop * 2) / scaleY;
        } else {
            sceneHeight = docsHeight + pageMarginTop * 2;
        }

        scene.resize(sceneWidth, sceneHeight);
        docsComponent.translate(docsLeft, docsTop);
        docBackground.translate(docsLeft, docsTop);

        const viewport = scene.getViewport(DOC_VIEWPORT_KEY.VIEW_MAIN) as Viewport;
        if (scrollToX !== Number.POSITIVE_INFINITY && viewport != null) {
            const actualX = viewport.transScroll2ViewportScrollValue(scrollToX, 0).x;
            viewport.scrollToBarPos({
                x: actualX,
            });
        }

        return this;
    }

    private _scrollToTop() {
        const backScrollController = this._renderManagerService.getRenderById(DOCS_ZEN_EDITOR_UNIT_ID_KEY)?.with(DocBackScrollRenderController);
        const textRange = {
            startOffset: 0,
            endOffset: 0,
        };
        if (backScrollController) {
            backScrollController.scrollToRange(textRange as ITextRange);
        }
    }
}
