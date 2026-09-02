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

import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, fromEventSubject, Inject, isInternalEditorID } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { ISidebarService } from '@univerjs/ui';
import { animationFrameScheduler, observeOn, throttleTime } from 'rxjs';
import { DocPageLayoutService } from '../../services/doc-page-layout.service';

export function hasRenderableDocSkeleton(component: unknown): boolean {
    if (typeof component !== 'object' || component == null ||
        !('getSkeleton' in component) || typeof component.getSkeleton !== 'function') {
        return false;
    }

    const skeleton = component.getSkeleton();
    if (typeof skeleton !== 'object' || skeleton == null ||
        !('getSkeletonData' in skeleton) || typeof skeleton.getSkeletonData !== 'function') {
        return false;
    }

    const skeletonData = skeleton.getSkeletonData();
    return typeof skeletonData === 'object' && skeletonData != null &&
        'pages' in skeletonData && Array.isArray(skeletonData.pages) && skeletonData.pages.length > 0;
}

// REFACTOR: @JOCS, move to new-docs package.
export class DocResizeRenderController extends Disposable implements IRenderModule {
    constructor(
        private _context: IRenderContext,
        @Inject(DocPageLayoutService) private readonly _docPageLayoutService: DocPageLayoutService,
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService,
        @ISidebarService private readonly _sidebarService: ISidebarService
    ) {
        super();

        const unitId = this._context.unitId;
        if (isInternalEditorID(unitId)) {
            return this;
        }

        this._initResize();
    }

    private _initResize() {
        this.disposeWithMe(
            fromEventSubject(this._context.engine.onTransformChange$).pipe(
                throttleTime(0, animationFrameScheduler)
            ).subscribe(() => this._refreshLayoutAndSelection())
        );

        this.disposeWithMe(
            this._sidebarService.sidebarOptions$.pipe(
                observeOn(animationFrameScheduler)
            ).subscribe(() => this._refreshLayoutAndSelection())
        );
    }

    private _refreshLayoutAndSelection() {
        if (this._disposed) {
            return;
        }

        // Keep the default document component offscreen until the first stable
        // publication supplies real geometry, avoiding a left-aligned blank flash.
        if (!hasRenderableDocSkeleton(this._context.mainComponent)) {
            return;
        }

        this._docPageLayoutService.calculatePagePosition();
        // Sidebar changes can run after a new layout checkpoint. Rebuild from
        // this document's logical offsets, not physical nodes from the old page.
        // The current global selection may belong to the comment editor instead.
        const unitId = this._context.unitId;
        this._textSelectionManagerService.refreshSelection({ unitId, subUnitId: unitId });
    }
}
