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

import type { Injector, IRange, IScale } from '@univerjs/core';
import type { IDrawInfo, SpreadsheetSkeleton, UniverRenderingContext } from '@univerjs/engine-render';
import { ImageCacheMap } from '@univerjs/core';
import { SHEET_EXTENSION_TYPE, SheetExtension } from '@univerjs/engine-render';

export const WORKSHEET_BACKGROUND_IMAGE_EXTENSION_KEY = 'WorksheetBackgroundImageExtension';

export class WorksheetBackgroundImageExtension extends SheetExtension {
    override uKey = WORKSHEET_BACKGROUND_IMAGE_EXTENSION_KEY;
    override type = SHEET_EXTENSION_TYPE.BACKGROUND;

    private readonly _imageCache: ImageCacheMap;

    constructor(injector: Injector, private readonly _requestRender: () => void) {
        super();
        this._imageCache = new ImageCacheMap(injector);
    }

    override draw(
        ctx: UniverRenderingContext,
        _parentScale: IScale,
        spreadsheetSkeleton: SpreadsheetSkeleton,
        diffRanges: IRange[],
        drawInfo: IDrawInfo
    ): void {
        const backgroundImage = spreadsheetSkeleton.worksheet.getConfig().backgroundImage;
        if (!backgroundImage) {
            return;
        }

        const image = this._imageCache.getImage(
            backgroundImage.imageSourceType,
            backgroundImage.source,
            this._requestRender,
            this._requestRender
        );
        if (!image || !image.complete || image.naturalWidth === 0 || image.getAttribute('data-error')) {
            return;
        }

        const pattern = ctx.createPattern(image, 'repeat');
        if (!pattern) {
            return;
        }
        const scaleX = backgroundImage.scaleX ?? 1;
        const scaleY = backgroundImage.scaleY ?? 1;
        if (scaleX !== 1 || scaleY !== 1) {
            pattern.setTransform({ a: scaleX, d: scaleY });
        }

        const ranges = diffRanges.length > 0 ? diffRanges : drawInfo.viewRanges;
        const { columnWidthAccumulation, rowHeightAccumulation } = spreadsheetSkeleton;
        if (!columnWidthAccumulation || !rowHeightAccumulation) {
            return;
        }

        ctx.save();
        ctx.fillStyle = pattern;
        ranges.forEach((range) => {
            const startX = range.startColumn > 0 ? columnWidthAccumulation[range.startColumn - 1] : 0;
            const startY = range.startRow > 0 ? rowHeightAccumulation[range.startRow - 1] : 0;
            const endX = columnWidthAccumulation[range.endColumn];
            const endY = rowHeightAccumulation[range.endRow];
            if (endX != null && endY != null) {
                ctx.fillRect(startX, startY, endX - startX, endY - startY);
            }
        });
        ctx.restore();
    }
}
