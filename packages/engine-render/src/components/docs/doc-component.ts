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

import type { Nullable } from '@univerjs/core';

import { RENDER_CLASS_TYPE } from '../../basics/const';
import type { IDocumentSkeletonGlyph, IDocumentSkeletonLine } from '../../basics/i-document-skeleton-cached';
import { PageLayoutType } from '../../basics/i-document-skeleton-cached';
import type { INodeInfo } from '../../basics/interfaces';
import type { IBoundRectNoAngle, IViewportBound } from '../../basics/vector2';
import type { UniverRenderingContext } from '../../context';
import { RenderComponent } from '../component';
import type { DOCS_EXTENSION_TYPE } from './doc-extension';
import type { DocumentSkeleton } from './layout/doc-skeleton';

export class DocComponent extends RenderComponent<
    IDocumentSkeletonGlyph | IDocumentSkeletonLine,
    DOCS_EXTENSION_TYPE,
    IBoundRectNoAngle[]
> {
    pageMarginLeft: number = 0;

    pageMarginTop: number = 0;

    pageLayoutType: PageLayoutType = PageLayoutType.VERTICAL;

    constructor(
        oKey: string,
        private _skeleton?: DocumentSkeleton
    ) {
        super(oKey);
    }

    getSkeleton() {
        return this._skeleton;
    }

    setSkeleton(skeleton: DocumentSkeleton) {
        this._skeleton = skeleton;
    }

    override render(mainCtx: UniverRenderingContext, bounds?: IViewportBound) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        if (!this._skeleton) {
            return;
        }

        const m = this.transform.getMatrix();

        mainCtx.save();

        mainCtx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        this._draw(mainCtx, bounds);
        mainCtx.restore();
    }

    getParentScale() {
        if (!this.parent) {
            return { scaleX: 1, scaleY: 1 };
        }
        let { scaleX = 1, scaleY = 1 } = this.parent;

        if (this.parent.classType === RENDER_CLASS_TYPE.SCENE) {
            scaleX = this.parent.ancestorScaleX || 1;
            scaleY = this.parent.ancestorScaleY || 1;
        }

        return {
            scaleX,
            scaleY,
        };
    }

    scrollBySelection() {}

    syncSelection() {}

    remainActiveSelection() {}

    findNodeByCoord(offsetX: number, offsetY: number): Nullable<INodeInfo> {}

    findCoordByNode(glyph: IDocumentSkeletonGlyph) {}

    protected _getBounding(bounds?: IViewportBound) {}

    protected _draw(ctx: UniverRenderingContext, bounds?: IViewportBound) {
        /* abstract */
    }
}
