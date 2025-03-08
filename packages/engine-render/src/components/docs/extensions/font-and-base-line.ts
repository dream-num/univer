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

import type { IScale } from '@univerjs/core';
import type { IBoundRectNoAngle } from '../../../basics';
import type { IDocumentSkeletonGlyph } from '../../../basics/i-document-skeleton-cached';
import type { UniverRenderingContext } from '../../../context';
import type { IDrawInfo } from '../../extension';
import { BaselineOffset, getColorStyle } from '@univerjs/core';
import { GlyphType, hasCJK } from '../../../basics';
import { COLOR_BLACK_RGB } from '../../../basics/const';
import { Vector2 } from '../../../basics/vector2';
import { CheckboxShape } from '../../../shape';
import { DocumentsSpanAndLineExtensionRegistry } from '../../extension';
import { docExtension } from '../doc-extension';

const UNIQUE_KEY = 'DefaultDocsFontAndBaseLineExtension';

const DOC_EXTENSION_Z_INDEX = 20;

/**
 * Singleton
 */
export class FontAndBaseLine extends docExtension {
    override uKey = UNIQUE_KEY;

    override Z_INDEX = DOC_EXTENSION_Z_INDEX;

    private _preFontColor = '';

    /**
     * ctx.font = val;  then ctx.font is not exactly the same as val
     * that is because canvas would normalize the font string, remove default value and convert pt to px.
     * so we need a map to store actual value and set value
     */
    actualFontMap: Record<string, string> = {};

    constructor() {
        super();
    }

    // invoked by document.ts
    override draw(ctx: UniverRenderingContext, _parentScale: IScale, glyph: IDocumentSkeletonGlyph, _?: IBoundRectNoAngle, more?: IDrawInfo) {
        // _parentScale: IScale, _skeleton: T, _diffBounds?: V, _more?: IDrawInfo

        const line = glyph.parent?.parent;
        if (!line) {
            return;
        }

        const { ts: textStyle, content, fontStyle, bBox } = glyph;

        const { spanPointWithFont = Vector2.create(0, 0) } = this.extensionOffset;

        if (more) {
            if (more.viewBound) {
                // ctx.fillText('', x, y), the 'y' is the baseline of a character, not the left top of the character
                if (spanPointWithFont.x > more.viewBound.right || spanPointWithFont.y - glyph.bBox.aba > more.viewBound.bottom) {
                    return;
                }
            }
        }

        if (content == null) {
            return;
        }

        if (!textStyle) {
            this._fillText(ctx, glyph, spanPointWithFont);
            return;
        }

        const fontStringPxStr = fontStyle?.fontString || '';
        if (fontStringPxStr) {
            if (ctx.font !== this.actualFontMap[fontStringPxStr]) {
                ctx.font = fontStringPxStr;
                this.actualFontMap[fontStringPxStr] = ctx.font;
            }
        }

        const { cl: colorStyle, va: baselineOffset } = textStyle;
        const fontColor = getColorStyle(colorStyle) || COLOR_BLACK_RGB;

        if (fontColor && this._preFontColor !== fontColor) {
            ctx.fillStyle = fontColor;
        }

        if (baselineOffset === BaselineOffset.SUPERSCRIPT) {
            spanPointWithFont.y += -bBox.spo;
        } else if (baselineOffset === BaselineOffset.SUBSCRIPT) {
            spanPointWithFont.y += bBox.sbo;
        }
        this._fillText(ctx, glyph, spanPointWithFont);
    }

    private _fillText(ctx: UniverRenderingContext, glyph: IDocumentSkeletonGlyph, spanPointWithFont: Vector2) {
        const { renderConfig, spanStartPoint, centerPoint } = this.extensionOffset;
        const { content, width, bBox } = glyph;
        const { aba, abd } = bBox;

        if (content == null || spanStartPoint == null || centerPoint == null) {
            return;
        }

        const { vertexAngle, centerAngle } = renderConfig ?? {};

        const VERTICAL_DEG = 90;

        const isVertical = vertexAngle === VERTICAL_DEG && centerAngle === VERTICAL_DEG;

        if (isVertical && !hasCJK(content)) {
            ctx.save();
            ctx.translate(spanStartPoint.x + centerPoint.x, spanStartPoint.y + centerPoint.y);
            ctx.rotate(Math.PI / 2);
            ctx.translate(-width / 2, (aba + abd) / 2 - abd);
            ctx.fillText(content, 0, 0);
            ctx.restore();
        } else {
            const CHECKED_GLYPH = '\u2611';
            const UNCHECKED_GLYPH = '\u2610';
            if ((content === UNCHECKED_GLYPH || content === CHECKED_GLYPH) && glyph.glyphType === GlyphType.LIST) {
                const size = Math.ceil((glyph.ts?.fs ?? 12) * 1.2);
                ctx.save();
                const fontHeight = glyph.bBox.aba - glyph.bBox.abd;
                const bottom = spanPointWithFont.y;
                const top = bottom - fontHeight;
                const left = spanPointWithFont.x;
                const topOffset = top + (bottom - top - size) / 2;
                const leftOffset = left;
                const BORDER_WIDTH = 1;
                ctx.translate(leftOffset - BORDER_WIDTH / 2, topOffset - BORDER_WIDTH / 2);
                CheckboxShape.drawWith(ctx, {
                    width: size,
                    height: size,
                    checked: content === CHECKED_GLYPH,
                });
                ctx.restore();
            } else {
                ctx.fillText(content, spanPointWithFont.x, spanPointWithFont.y);
            }
        }
    }

    override clearCache() {
        this._preFontColor = '';
    }
}

DocumentsSpanAndLineExtensionRegistry.add(new FontAndBaseLine());
