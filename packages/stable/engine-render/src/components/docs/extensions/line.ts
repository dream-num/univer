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

import type { IScale, ITextDecoration } from '@univerjs/core';
import type { IDocumentSkeletonGlyph } from '../../../basics/i-document-skeleton-cached';

import type { UniverRenderingContext } from '../../../context';
import { BaselineOffset, BooleanNumber, getColorStyle, TextDecoration } from '@univerjs/core';
import { COLOR_BLACK_RGB, DEFAULT_OFFSET_SPACING } from '../../../basics/const';
import { calculateRectRotate } from '../../../basics/draw';
import { degToRad, getScale } from '../../../basics/tools';
import { Vector2 } from '../../../basics/vector2';
import { DocumentsSpanAndLineExtensionRegistry } from '../../extension';
import { docExtension } from '../doc-extension';

const UNIQUE_KEY = 'DefaultDocsLineExtension';

const DOC_EXTENSION_Z_INDEX = 40;

export class Line extends docExtension {
    override uKey = UNIQUE_KEY;

    override Z_INDEX = DOC_EXTENSION_Z_INDEX;

    private _preBackgroundColor = '';

    override draw(ctx: UniverRenderingContext, parentScale: IScale, glyph: IDocumentSkeletonGlyph) {
        const line = glyph.parent?.parent;
        const { ts: textStyle, bBox, content } = glyph;

        if (line == null || textStyle == null || content === '\r') {
            return;
        }

        const { asc, dsc } = line;
        const { sp: strikeoutPosition, spo, sbo, bd } = bBox;
        const scale = getScale(parentScale);
        const DELTA = 0.5;
        const { ul: underline, st: strikethrough, ol: overline, va: baselineOffset, bbl: bottomBorderLine } = textStyle;

        if (underline) {
            const startY = asc + dsc;
            this._drawLine(ctx, glyph, underline, startY, scale);
        }

        if (bottomBorderLine) {
            const startY = asc + dsc + 3;
            this._drawLine(ctx, glyph, bottomBorderLine, startY, scale, 2);
        }

        if (strikethrough) {
            // strikethrough position is the middle of bounding box ascent and descent.
            let startY = asc + bd - strikeoutPosition - DELTA;

            /**
             * --------- superscript strikethrough position -------
             * --------- superscript offset -----------------------
             * --------- baseline           -----------------------
             * --------- subscript strikethrough position ---------
             * --------- subscript offset   -----------------------
             */
            if (baselineOffset === BaselineOffset.SUPERSCRIPT) {
                startY -= spo;
            } else if (baselineOffset === BaselineOffset.SUBSCRIPT) {
                startY += sbo;
            }

            this._drawLine(ctx, glyph, strikethrough, startY, scale);
        }

        if (overline) {
            const startY = -DEFAULT_OFFSET_SPACING - DELTA;

            this._drawLine(ctx, glyph, overline, startY, scale);
        }
    }

    override clearCache() {
        this._preBackgroundColor = '';
    }

    private _drawLine(
        ctx: UniverRenderingContext,
        glyph: IDocumentSkeletonGlyph,
        line: ITextDecoration,
        startY: number,
        _scale: number,
        lineWidth = 1
    ) {
        let { s: show, cl: colorStyle, t: lineType, c = BooleanNumber.TRUE } = line;

        if (show !== BooleanNumber.TRUE) {
            return;
        }

        if (c == null) {
            c = BooleanNumber.TRUE;
        }

        const {
            originTranslate = Vector2.create(0, 0),
            alignOffset = Vector2.create(0, 0),
            renderConfig = {},
        } = this.extensionOffset;

        const { left, width } = glyph;

        const { centerAngle: centerAngleDeg = 0, vertexAngle: vertexAngleDeg = 0 } = renderConfig;

        ctx.save();

        // translate with precision is handled in moveToByPrecision and lineToByPrecision. NO NEED to do this again!
        // ctx.translateWithPrecision(FIX_ONE_PIXEL_BLUR_OFFSET, FIX_ONE_PIXEL_BLUR_OFFSET);

        const color =
            (c === BooleanNumber.TRUE ? getColorStyle(glyph.ts?.cl) : getColorStyle(colorStyle)) || COLOR_BLACK_RGB;
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;

        this._setLineType(ctx, lineType || TextDecoration.SINGLE);

        const centerAngle = degToRad(centerAngleDeg);
        const vertexAngle = degToRad(vertexAngleDeg);
        const start = calculateRectRotate(
            originTranslate.addByPoint(left, startY),
            Vector2.create(0, 0),
            centerAngle,
            vertexAngle,
            alignOffset
        );
        const end = calculateRectRotate(
            originTranslate.addByPoint(left + width, startY),
            Vector2.create(0, 0),
            centerAngle,
            vertexAngle,
            alignOffset
        );

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.restore();
    }

    private _setLineType(ctx: UniverRenderingContext, style: TextDecoration) {
        if (style === TextDecoration.DASH_DOT_DOT_HEAVY || style === TextDecoration.DOT_DOT_DASH) {
            ctx.setLineDash([2, 2, 5, 2, 2]);
        } else if (style === TextDecoration.DASH_DOT_HEAVY || style === TextDecoration.DOT_DASH) {
            ctx.setLineDash([2, 5, 2]);
        } else if (style === TextDecoration.DOTTED || style === TextDecoration.DOTTED_HEAVY) {
            ctx.setLineDash([2]);
        } else if (style === TextDecoration.DASH || style === TextDecoration.DASHED_HEAVY) {
            ctx.setLineDash([3]);
        } else if (style === TextDecoration.DASH_LONG || style === TextDecoration.DASH_LONG_HEAVY) {
            ctx.setLineDash([6]);
        } else {
            ctx.setLineDash([0]);
        }
    }
}

DocumentsSpanAndLineExtensionRegistry.add(new Line());
