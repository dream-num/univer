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

import type { IViewportInfo } from '../../basics/vector2';
import type { UniverRenderingContext } from '../../context';
import { Rect } from '../../shape';
import { Liquid } from './liquid';
import type { IDocumentsConfig } from './doc-component';
import { DocComponent } from './doc-component';
import type { DocumentSkeleton } from './layout/doc-skeleton';

const PAGE_STROKE_COLOR = 'rgba(198, 198, 198, 1)';
const PAGE_FILL_COLOR = 'rgba(255, 255, 255, 1)';

export class DocBackground extends DocComponent {
    private _drawLiquid: Liquid;

    constructor(oKey: string, documentSkeleton?: DocumentSkeleton, config?: IDocumentsConfig) {
        super(oKey, documentSkeleton, config);

        this._drawLiquid = new Liquid();

        this.makeDirty(true);
    }

    static create(oKey: string, documentSkeleton?: DocumentSkeleton, config?: IDocumentsConfig) {
        return new DocBackground(oKey, documentSkeleton, config);
    }

    override draw(ctx: UniverRenderingContext, bounds?: IViewportInfo) {
        const skeletonData = this.getSkeleton()?.getSkeletonData();

        if (skeletonData == null) {
            return;
        }

        this._drawLiquid.reset();

        const { pages } = skeletonData;

        // broadcasting the pageTop and pageLeft for each page in the document with multiple pages.
        let pageTop = 0;
        let pageLeft = 0;

        for (let i = 0, len = pages.length; i < len; i++) {
            const page = pages[i];

            if (this.isSkipByDiffBounds(page, pageTop, pageLeft, bounds)) {
                const { x, y } = this._drawLiquid.translatePage(
                    page,
                    this.pageLayoutType,
                    this.pageMarginLeft,
                    this.pageMarginTop
                );
                pageLeft += x;
                pageTop += y;
                continue;
            }

            // Draw background.
            const { width, pageWidth, height, pageHeight } = page;

            ctx.save();
            ctx.translate(pageLeft - 0.5, pageTop - 0.5);
            const options = {
                width: pageWidth ?? width,
                height: pageHeight ?? height,
                strokeWidth: 1,
                stroke: PAGE_STROKE_COLOR,
                fill: PAGE_FILL_COLOR,
                zIndex: 3,
            };
            Rect.drawWith(ctx, options);
            ctx.restore();

            const { x, y } = this._drawLiquid.translatePage(
                page,
                this.pageLayoutType,
                this.pageMarginLeft,
                this.pageMarginTop
            );
            pageLeft += x;
            pageTop += y;
        }
    }

    changeSkeleton(newSkeleton: DocumentSkeleton) {
        this.setSkeleton(newSkeleton);

        return this;
    }

    protected override _draw(ctx: UniverRenderingContext, bounds?: IViewportInfo) {
        this.draw(ctx, bounds);
    }
}
