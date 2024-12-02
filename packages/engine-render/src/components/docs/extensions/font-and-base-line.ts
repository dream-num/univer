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

import type { IScale } from '@univerjs/core';
import type { IDocumentSkeletonGlyph } from '../../../basics/i-document-skeleton-cached';
import type { UniverRenderingContext } from '../../../context';
import { BaselineOffset, getColorStyle } from '@univerjs/core';
import { GlyphType, hasCJK } from '../../../basics';
import { COLOR_BLACK_RGB } from '../../../basics/const';
import { Vector2 } from '../../../basics/vector2';
import { CheckboxShape } from '../../../shape';
import { DocumentsSpanAndLineExtensionRegistry } from '../../extension';
import { docExtension } from '../doc-extension';

const UNIQUE_KEY = 'DefaultDocsFontAndBaseLineExtension';

const DOC_EXTENSION_Z_INDEX = 20;

export class FontAndBaseLine extends docExtension {
    override uKey = UNIQUE_KEY;

    override Z_INDEX = DOC_EXTENSION_Z_INDEX;

    private _preFontColor = '';

    override draw(ctx: UniverRenderingContext, parentScale: IScale, glyph: IDocumentSkeletonGlyph) {
        const line = glyph.parent?.parent;
        if (!line) {
            return;
        }

        const { ts: textStyle, content, fontStyle, bBox } = glyph;

        const { spanPointWithFont = Vector2.create(0, 0) } = this.extensionOffset;

        if (content == null) {
            return;
        }

        if (!textStyle) {
            this._fillText(ctx, glyph, spanPointWithFont);
            return;
        }

        if (ctx.font !== fontStyle?.fontString) {
            ctx.font = fontStyle?.fontString || '';
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
