import { BorderStyleTypes, getColorStyle, IBorderData, IBorderStyleData, Nullable } from '@univer/core';
import { IScale } from '../../../Basics/Interfaces';
import { DocumentsSpanAndLineExtensionRegistry } from '../../Extension';
import { docsExtension } from '../DocsExtension';
import { IDocumentSkeletonSpan } from '../../../Basics/IDocumentSkeletonCached';
import { BORDER_TYPE, COLOR_BLACK_RGB } from '../../../Basics/Const';
import { drawLineByBorderType, getLineWidth, setLineType } from '../../../Basics/Draw';
import { Vector2 } from '../../../Basics/Vector2';

const UNIQUE_KEY = 'DefaultDocsBorderExtension';

export class Border extends docsExtension {
    uKey = UNIQUE_KEY;

    zIndex = 30;

    private _preBorderStyle: Nullable<BorderStyleTypes>;

    private _preBorderColor = '';

    draw(ctx: CanvasRenderingContext2D, parentScale: IScale, span: IDocumentSkeletonSpan) {
        const line = span.parent?.parent;
        if (!line) {
            return;
        }

        const { asc: maxLineAsc = 0, lineHeight = 0 } = line;

        const { ts: textStyle, left, width: spanWidth } = span;
        if (!textStyle) {
            return;
        }

        const { bd: borderData } = textStyle;
        if (!borderData) {
            return;
        }
        const scale = this._getScale(parentScale);
        const borderCache = this._createBorderCache(borderData);

        const { spanStartPoint = Vector2.create(0, 0) } = this.extensionOffset;

        for (let type of borderCache.keys()) {
            const borderCacheValue = borderCache.get(type);
            if (!borderCacheValue) {
                continue;
            }
            const { s: style, cl: colorStyle } = borderCacheValue;
            const color = getColorStyle(colorStyle) || COLOR_BLACK_RGB;

            if (style !== this._preBorderStyle) {
                setLineType(ctx, style);
                ctx.lineWidth = getLineWidth(style) / scale;
                this._preBorderStyle = style;
            }

            if (color !== this._preBorderColor) {
                ctx.strokeStyle = color || COLOR_BLACK_RGB;
                this._preBorderColor = color;
            }

            drawLineByBorderType(ctx, type as BORDER_TYPE, {
                startX: spanStartPoint.x,
                startY: spanStartPoint.y,
                endX: spanStartPoint.x + spanWidth,
                endY: spanStartPoint.y + lineHeight,
            });
        }
    }

    clearCache() {
        this._preBorderStyle = null;
        this._preBorderColor = '';
    }

    private _createBorderCache(borderData: IBorderData) {
        const { t, b, l, r } = borderData;
        const borderCache = new Map<BORDER_TYPE, Nullable<IBorderStyleData>>();
        t && borderCache.set(BORDER_TYPE.TOP, t);
        b && borderCache.set(BORDER_TYPE.BOTTOM, b);
        l && borderCache.set(BORDER_TYPE.LEFT, l);
        r && borderCache.set(BORDER_TYPE.RIGHT, r);
        return borderCache;
    }
}

DocumentsSpanAndLineExtensionRegistry.add(new Border());
