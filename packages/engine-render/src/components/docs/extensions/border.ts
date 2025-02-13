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

import type { BorderStyleTypes, IBorderData, IBorderStyleData, IScale, Nullable } from '@univerjs/core';
import type { IDocumentSkeletonGlyph } from '../../../basics/i-document-skeleton-cached';

import type { UniverRenderingContext } from '../../../context';
import { getColorStyle } from '@univerjs/core';
import { BORDER_TYPE as BORDER_LTRB, COLOR_BLACK_RGB, FIX_ONE_PIXEL_BLUR_OFFSET } from '../../../basics/const';
import { drawLineByBorderType, getLineWidth, setLineType } from '../../../basics/draw';
import { Vector2 } from '../../../basics/vector2';
import { DocumentsSpanAndLineExtensionRegistry } from '../../extension';
import { docExtension } from '../doc-extension';

const UNIQUE_KEY = 'DefaultDocsBorderExtension';

export class Border extends docExtension {
    override uKey = UNIQUE_KEY;

    override Z_INDEX = 50;

    private _preBorderStyle: Nullable<BorderStyleTypes>;

    private _preBorderColor = '';

    override draw(ctx: UniverRenderingContext, parentScale: IScale, glyph: IDocumentSkeletonGlyph) {
        const line = glyph.parent?.parent;
        if (!line) {
            return;
        }

        const { asc: maxLineAsc = 0, lineHeight = 0 } = line;

        const { ts: textStyle, left, width: spanWidth } = glyph;
        if (!textStyle) {
            return;
        }

        const { bd: borderData } = textStyle;
        if (!borderData) {
            return;
        }

        const precisionScale = this._getScale(ctx.getScale());

        const borderCache = this._createBorderCache(borderData);

        ctx.save();

        ctx.translateWithPrecisionRatio(FIX_ONE_PIXEL_BLUR_OFFSET, FIX_ONE_PIXEL_BLUR_OFFSET);

        const { spanStartPoint = Vector2.create(0, 0) } = this.extensionOffset;

        for (const type of borderCache.keys()) {
            const borderCacheValue = borderCache.get(type);
            if (!borderCacheValue) {
                continue;
            }
            const { s: style, cl: colorStyle } = borderCacheValue;
            const color = getColorStyle(colorStyle) || COLOR_BLACK_RGB;

            const lineWidth = getLineWidth(style);

            if (style !== this._preBorderStyle) {
                setLineType(ctx, style);
                ctx.setLineWidthByPrecision(lineWidth);
                this._preBorderStyle = style;
            }

            if (color !== this._preBorderColor) {
                ctx.strokeStyle = color || COLOR_BLACK_RGB;
                this._preBorderColor = color;
            }

            drawLineByBorderType(ctx, type as BORDER_LTRB, (lineWidth - 1) / 2 / precisionScale, {
                startX: spanStartPoint.x,
                startY: spanStartPoint.y,
                endX: spanStartPoint.x + spanWidth,
                endY: spanStartPoint.y + lineHeight,
            });
        }

        ctx.restore();
    }

    override clearCache() {
        this._preBorderStyle = null;
        this._preBorderColor = '';
    }

    private _createBorderCache(borderData: IBorderData) {
        const { t, b, l, r } = borderData;
        const borderCache = new Map<BORDER_LTRB, Nullable<IBorderStyleData>>();
        t && borderCache.set(BORDER_LTRB.TOP, t);
        b && borderCache.set(BORDER_LTRB.BOTTOM, b);
        l && borderCache.set(BORDER_LTRB.LEFT, l);
        r && borderCache.set(BORDER_LTRB.RIGHT, r);
        return borderCache;
    }
}

DocumentsSpanAndLineExtensionRegistry.add(new Border());
