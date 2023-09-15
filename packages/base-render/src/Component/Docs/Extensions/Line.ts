import { BooleanNumber, getColorStyle, IScale, TextDecoration } from '@univerjs/core';

import { COLOR_BLACK_RGB, DEFAULT_OFFSET_SPACING } from '../../../Basics/Const';
import { calculateRectRotate } from '../../../Basics/Draw';
import { IDocumentSkeletonSpan } from '../../../Basics/IDocumentSkeletonCached';
import { fixLineWidthByScale, getScale } from '../../../Basics/Tools';
import { Vector2 } from '../../../Basics/Vector2';
import { DocumentsSpanAndLineExtensionRegistry } from '../../Extension';
import { docExtension } from '../DocExtension';

const UNIQUE_KEY = 'DefaultDocsLineExtension';

export class Line extends docExtension {
    override uKey = UNIQUE_KEY;

    override zIndex = 40;

    private _preBackgroundColor = '';

    override draw(ctx: CanvasRenderingContext2D, parentScale: IScale, span: IDocumentSkeletonSpan) {
        const line = span.parent?.parent;
        if (!line) {
            return;
        }

        const { asc: maxLineAsc = 0, lineHeight = 0 } = line;
        const { ts: textStyle, left, width, bBox } = span;
        if (!textStyle) {
            return;
        }

        const { sp: strikeoutPosition } = bBox;

        const scale = getScale(parentScale);

        const { ul: underline, st: strikethrough, ol: overline } = textStyle;

        const { originTranslate = Vector2.create(0, 0), centerPoint = Vector2.create(0, 0), alignOffset = Vector2.create(0, 0), renderConfig = {} } = this.extensionOffset;

        const { centerAngle = 0, vertexAngle = 0 } = renderConfig;

        if (underline) {
            const { s: show, cl: colorStyle, t: lineType } = underline;
            if (show === BooleanNumber.TRUE) {
                ctx.beginPath();
                const color = getColorStyle(colorStyle) || COLOR_BLACK_RGB;
                ctx.strokeStyle = color;
                this._setLineType(ctx, lineType || TextDecoration.SINGLE);

                const startY = fixLineWidthByScale(lineHeight + DEFAULT_OFFSET_SPACING - 0.5, scale);

                const start = calculateRectRotate(originTranslate.addByPoint(left, startY), centerPoint, centerAngle, vertexAngle, alignOffset);
                const end = calculateRectRotate(originTranslate.addByPoint(left + width, startY), centerPoint, centerAngle, vertexAngle, alignOffset);
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
        }

        if (strikethrough) {
            const { s: show, cl: colorStyle, t: lineType } = strikethrough;
            if (show === BooleanNumber.TRUE) {
                ctx.beginPath();
                const color = getColorStyle(colorStyle) || COLOR_BLACK_RGB;
                ctx.strokeStyle = color;
                this._setLineType(ctx, lineType || TextDecoration.SINGLE);

                const startY = fixLineWidthByScale(strikeoutPosition - 0.5, scale);

                const start = calculateRectRotate(originTranslate.addByPoint(left, startY), centerPoint, centerAngle, vertexAngle, alignOffset);
                const end = calculateRectRotate(originTranslate.addByPoint(left + width, startY), centerPoint, centerAngle, vertexAngle, alignOffset);

                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
        }

        if (overline) {
            const { s: show, cl: colorStyle, t: lineType } = overline;
            if (show === BooleanNumber.TRUE) {
                ctx.beginPath();
                const color = getColorStyle(colorStyle) || COLOR_BLACK_RGB;
                ctx.strokeStyle = color;
                this._setLineType(ctx, lineType || TextDecoration.SINGLE);

                const startY = fixLineWidthByScale(-DEFAULT_OFFSET_SPACING - 0.5, scale);

                const start = calculateRectRotate(originTranslate.addByPoint(left, startY), centerPoint, centerAngle, vertexAngle, alignOffset);
                const end = calculateRectRotate(originTranslate.addByPoint(left + width, startY), centerPoint, centerAngle, vertexAngle, alignOffset);

                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
        }
    }

    override clearCache() {
        this._preBackgroundColor = '';
    }

    private _setLineType(ctx: CanvasRenderingContext2D, style: TextDecoration) {
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

    private _getLineWidth(style: TextDecoration) {
        let lineWidth = 1;
        if (
            style === TextDecoration.WAVY_HEAVY ||
            style === TextDecoration.DASHED_HEAVY ||
            style === TextDecoration.DOTTED_HEAVY ||
            style === TextDecoration.DASH_DOT_HEAVY ||
            style === TextDecoration.DASH_LONG_HEAVY ||
            style === TextDecoration.DASH_DOT_DOT_HEAVY
        ) {
            lineWidth = 2;
        } else if (style === TextDecoration.THICK) {
            lineWidth = 3;
        }

        return lineWidth;
    }
}

DocumentsSpanAndLineExtensionRegistry.add(new Line());
