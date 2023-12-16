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
import { BaselineOffset, getColorStyle } from '@univerjs/core';

import { hasCJK } from '../../../basics';
import { COLOR_BLACK_RGB } from '../../../basics/const';
import type { IDocumentSkeletonSpan } from '../../../basics/i-document-skeleton-cached';
import { Vector2 } from '../../../basics/vector2';
import { DocumentsSpanAndLineExtensionRegistry } from '../../extension';
import { docExtension } from '../doc-extension';

const UNIQUE_KEY = 'DefaultDocsFontAndBaseLineExtension';

const DOC_EXTENSION_Z_INDEX = 20;

export class FontAndBaseLine extends docExtension {
    override uKey = UNIQUE_KEY;

    override zIndex = DOC_EXTENSION_Z_INDEX;

    private _preFontString = '';

    private _preFontColor = '';

    override draw(ctx: CanvasRenderingContext2D, parentScale: IScale, span: IDocumentSkeletonSpan) {
        const line = span.parent?.parent;
        if (!line) {
            return;
        }

        // const { asc = 0, marginTop: lineMarginTop = 0, paddingTop: linePaddingTop = 0 } = line;

        // const maxLineAsc = asc + lineMarginTop + linePaddingTop;

        const { ts: textStyle, content, fontStyle, bBox } = span;

        const { spanPointWithFont = Vector2.create(0, 0) } = this.extensionOffset;

        if (content == null) {
            return;
        }

        if (!textStyle) {
            this._fillText(ctx, span, spanPointWithFont);
            return;
        }

        if (this._preFontString !== fontStyle?.fontString) {
            ctx.font = this._preFontString = fontStyle?.fontString || '';
        }

        const { cl: colorStyle, va: baselineOffset } = textStyle;
        const fontColor = getColorStyle(colorStyle) || COLOR_BLACK_RGB;

        if (fontColor && this._preFontColor !== fontColor) {
            ctx.fillStyle = fontColor;
        }

        if (baselineOffset === BaselineOffset.SUBSCRIPT || baselineOffset === BaselineOffset.SUPERSCRIPT) {
            // const { renderConfig = {} } = this.extensionOffset;

            // const { centerAngle = 0 } = renderConfig;
            let offset = 0;

            if (baselineOffset === BaselineOffset.SUPERSCRIPT) {
                offset = -bBox.sbo;
            }

            // const offsetSin = offset * Math.sin(centerAngle);
            // const offsetCos = offset * Math.cos(centerAngle);

            spanPointWithFont.y += offset;
        }

        // console.log(content, spanPointWithFont.x, spanPointWithFont.y, startX, startY);
        this._fillText(ctx, span, spanPointWithFont);
    }

    private _fillText(ctx: CanvasRenderingContext2D, span: IDocumentSkeletonSpan, spanPointWithFont: Vector2) {
        const { renderConfig, spanStartPoint, centerPoint } = this.extensionOffset;
        const { content, width, bBox } = span;
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
            ctx.fillText(content, spanPointWithFont.x, spanPointWithFont.y);
        }
    }

    override clearCache() {
        this._preFontString = '';
        this._preFontColor = '';
    }
}

DocumentsSpanAndLineExtensionRegistry.add(new FontAndBaseLine());
