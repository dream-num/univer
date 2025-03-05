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

import type { IDocumentSkeletonGlyph, IDocumentSkeletonLine, IDocumentSkeletonPage } from '../../basics/i-document-skeleton-cached';
import type { IBoundRectNoAngle, IViewportInfo } from '../../basics/vector2';
import type { UniverRenderingContext } from '../../context';
import type { DOCS_EXTENSION_TYPE } from './doc-extension';
import type { DocumentSkeleton } from './layout/doc-skeleton';
import { RENDER_CLASS_TYPE } from '../../basics/const';
import { PageLayoutType } from '../../basics/i-document-skeleton-cached';
import { RenderComponent } from '../component';

export interface IPageMarginLayout {
    pageMarginLeft: number;
    pageMarginTop: number;
    pageLayoutType?: PageLayoutType;
}

export interface IDocumentsConfig extends IPageMarginLayout {
    hasEditor?: boolean;
}

export abstract class DocComponent extends RenderComponent<
    IDocumentSkeletonGlyph | IDocumentSkeletonLine,
    DOCS_EXTENSION_TYPE,
    IBoundRectNoAngle[]
> {
    pageMarginLeft: number = 0;

    pageMarginTop: number = 0;

    pageLayoutType: PageLayoutType = PageLayoutType.VERTICAL;

    constructor(
        oKey: string,
        private _skeleton?: DocumentSkeleton,
        config?: IDocumentsConfig
    ) {
        super(oKey);

        this._setConfig(config);
    }

    getSkeleton() {
        return this._skeleton;
    }

    setSkeleton(skeleton: DocumentSkeleton) {
        this._skeleton = skeleton;
    }

    private _setConfig(config?: IDocumentsConfig) {
        if (config?.pageMarginLeft != null) {
            this.pageMarginLeft = config?.pageMarginLeft;
        } else {
            this.pageMarginLeft = 17;
        }

        if (config?.pageMarginTop != null) {
            this.pageMarginTop = config?.pageMarginTop;
        } else {
            this.pageMarginTop = 14;
        }

        if (config?.pageLayoutType != null) {
            this.pageLayoutType = config?.pageLayoutType;
        } else {
            this.pageLayoutType = PageLayoutType.VERTICAL;
        }
    }

    override render(mainCtx: UniverRenderingContext, bounds?: Partial<IViewportInfo>) {
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

    isSkipByDiffBounds(page: IDocumentSkeletonPage, pageTop: number, pageLeft: number, bounds?: IViewportInfo) {
        if (bounds === null || bounds === undefined) {
            return false;
        }

        const { pageWidth, pageHeight, marginBottom, marginTop, marginLeft, marginRight } = page;

        const pageRight = pageLeft + pageWidth + marginLeft + marginRight;

        const pageBottom = pageTop + pageHeight + marginBottom + marginTop;

        const { left, top, right, bottom } = bounds.viewBound;

        if (pageRight < left || pageBottom < top) {
            return true;
        }

        if (pageLeft > right && pageWidth !== Number.POSITIVE_INFINITY) {
            return true;
        }

        if (pageTop > bottom && pageHeight !== Number.POSITIVE_INFINITY) {
            return true;
        }

        return false;
    }

    protected abstract _draw(ctx: UniverRenderingContext, bounds?: Partial<IViewportInfo>): void;
}
