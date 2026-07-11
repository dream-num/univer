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

import type { IDocTextFill, IDocTextFillGradientStop, IScale } from '@univerjs/core';
import type { IBoundRectNoAngle } from '../../../basics';
import type { IDocumentSkeletonGlyph } from '../../../basics/i-document-skeleton-cached';
import type { UniverRenderingContext } from '../../../context';
import type { IDrawInfo } from '../../extension';
import { BaselineOffset, getColorStyle } from '@univerjs/core';
import { GlyphType } from '../../../basics';
import { cjk } from '../../../basics/cjk-regexp';
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

    private _textFillImageCache = new Map<string, HTMLImageElement>();

    constructor() {
        super();
    }

    // invoked by document.ts
    override draw(ctx: UniverRenderingContext, _parentScale: IScale, glyph: IDocumentSkeletonGlyph, _?: IBoundRectNoAngle, _more?: IDrawInfo) {
        // _parentScale: IScale, _skeleton: T, _diffBounds?: V, _more?: IDrawInfo

        const line = glyph.parent?.parent;
        if (!line) {
            return;
        }

        const { ts: textStyle, content, fontStyle, bBox } = glyph;

        const { spanPointWithFont = Vector2.create(0, 0) } = this.extensionOffset;

        // I don't know what this code does. It affects the rendering of Rotate up. After commenting it out, it works normally.
        // if (more) {
        //     if (more.viewBound) {
        //         // ctx.fillText('', x, y), the 'y' is the baseline of a character, not the left top of the character
        //         if (spanPointWithFont.x > more.viewBound.right || spanPointWithFont.y - glyph.bBox.aba > more.viewBound.bottom) {
        //             return;
        //         }
        //     }
        // }

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

        const { cl: colorStyle, va: baselineOffset, textFill } = textStyle;
        const fontColor = getColorStyle(colorStyle) || COLOR_BLACK_RGB;

        if (baselineOffset === BaselineOffset.SUPERSCRIPT) {
            spanPointWithFont.y += -bBox.spo;
        } else if (baselineOffset === BaselineOffset.SUBSCRIPT) {
            spanPointWithFont.y += bBox.sbo;
        }

        if (this._fillTextWithTextFill(ctx, glyph, spanPointWithFont, textFill, fontColor)) {
            return;
        }

        if (fontColor && this._preFontColor !== fontColor) {
            ctx.fillStyle = fontColor;
        }

        this._fillText(ctx, glyph, spanPointWithFont);
    }

    private _fillTextWithTextFill(
        ctx: UniverRenderingContext,
        glyph: IDocumentSkeletonGlyph,
        spanPointWithFont: Vector2,
        textFill: IDocTextFill | undefined,
        fallbackColor: string
    ): boolean {
        if (!textFill || textFill.type === 'none') {
            return textFill?.type === 'none';
        }

        const { content, glyphType } = glyph;
        if (content == null || glyphType === GlyphType.LIST) {
            return false;
        }

        const { renderConfig } = this.extensionOffset;
        const { vertexAngle, centerAngle } = renderConfig ?? {};
        const VERTICAL_DEG = 90;
        if (vertexAngle === VERTICAL_DEG && centerAngle === VERTICAL_DEG) {
            return false;
        }

        const bounds = this._getGlyphPaintBounds(glyph, spanPointWithFont);
        if (bounds.width <= 0 || bounds.height <= 0) {
            return false;
        }

        const color = this._colorWithOpacity(textFill.color || fallbackColor, textFill.opacity);

        if (textFill.type === 'solid') {
            ctx.fillStyle = color;
            this._fillText(ctx, glyph, spanPointWithFont);
            return true;
        }

        if (textFill.type === 'gradient') {
            const gradient = this._createTextGradient(ctx, bounds, textFill, fallbackColor);
            if (!gradient) {
                return false;
            }

            ctx.fillStyle = gradient;
            this._fillText(ctx, glyph, spanPointWithFont);
            return true;
        }

        if (textFill.type === 'picture') {
            const pattern = this._createTextPicturePattern(ctx, bounds, textFill);
            if (!pattern) {
                return false;
            }

            ctx.fillStyle = pattern;
            this._fillText(ctx, glyph, spanPointWithFont);
            return true;
        }

        return false;
    }

    private _getGlyphPaintBounds(glyph: IDocumentSkeletonGlyph, spanPointWithFont: Vector2) {
        const { width, bBox } = glyph;
        const textWidth = Math.max(width, bBox.width, 1);
        const textHeight = Math.max(bBox.aba + bBox.abd, 1);

        return {
            left: spanPointWithFont.x,
            top: spanPointWithFont.y - bBox.aba,
            width: textWidth,
            height: textHeight,
        };
    }

    private _createTextGradient(
        ctx: UniverRenderingContext,
        bounds: { left: number; top: number; width: number; height: number },
        textFill: IDocTextFill,
        fallbackColor: string
    ): CanvasGradient | null {
        const gradient = textFill.gradient;
        const type = gradient?.type ?? 'linear';
        const angle = gradient?.angle ?? 0;
        const stops = this._normalizeGradientStops(gradient?.stops, textFill.color || fallbackColor);
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;
        let canvasGradient: CanvasGradient;

        if (type === 'radial') {
            const radius = Math.max(bounds.width, bounds.height) / 2;
            canvasGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        } else if (type === 'angular' && 'createConicGradient' in ((ctx as unknown as { _context?: CanvasRenderingContext2D })._context ?? ctx)) {
            const rawContext = ((ctx as unknown as { _context?: CanvasRenderingContext2D })._context ?? ctx) as CanvasRenderingContext2D & {
                createConicGradient: (startAngle: number, x: number, y: number) => CanvasGradient;
            };
            canvasGradient = rawContext.createConicGradient(((angle - 90) * Math.PI) / 180, centerX, centerY);
        } else if (type === 'diamond') {
            const radius = Math.max(bounds.width, bounds.height) / 2;
            canvasGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        } else {
            const line = this._getLinearGradientLine(bounds, angle);
            canvasGradient = ctx.createLinearGradient(line.x0, line.y0, line.x1, line.y1);
        }

        for (const stop of stops) {
            const opacity = (textFill.opacity ?? 1) * (stop.opacity ?? 1);
            canvasGradient.addColorStop(stop.offset, this._colorWithOpacity(stop.color, opacity));
        }

        return canvasGradient;
    }

    private _createTextPicturePattern(
        ctx: UniverRenderingContext,
        bounds: { left: number; top: number; width: number; height: number },
        textFill: IDocTextFill
    ): CanvasPattern | null {
        const source = textFill.picture?.source;
        if (!source) {
            return null;
        }

        const image = this._getTextFillImage(source);
        if (!image || !image.complete || !(image.naturalWidth || image.width)) {
            return null;
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.ceil(bounds.width));
        canvas.height = Math.max(1, Math.ceil(bounds.height));
        const canvasContext = canvas.getContext('2d');
        if (!canvasContext) {
            return null;
        }

        const opacity = this._clamp(textFill.picture?.opacity ?? textFill.opacity ?? 1, 0, 1);
        canvasContext.globalAlpha = opacity;

        if (textFill.picture?.mode === 'tile') {
            const scaleX = textFill.picture.scaleX ?? 1;
            const scaleY = textFill.picture.scaleY ?? 1;
            const cellWidth = Math.max(1, (image.naturalWidth || image.width) * scaleX);
            const cellHeight = Math.max(1, (image.naturalHeight || image.height) * scaleY);
            const offsetX = textFill.picture.offsetX ?? 0;
            const offsetY = textFill.picture.offsetY ?? 0;

            for (let x = ((offsetX % cellWidth) + cellWidth) % cellWidth - cellWidth; x < canvas.width; x += cellWidth) {
                for (let y = ((offsetY % cellHeight) + cellHeight) % cellHeight - cellHeight; y < canvas.height; y += cellHeight) {
                    canvasContext.drawImage(image, x, y, cellWidth, cellHeight);
                }
            }
        } else {
            canvasContext.drawImage(image, 0, 0, canvas.width, canvas.height);
        }

        const pattern = ctx.createPattern(canvas, 'no-repeat');
        pattern?.setTransform?.(new DOMMatrix().translate(bounds.left, bounds.top));

        return pattern;
    }

    private _getTextFillImage(source: string): HTMLImageElement | null {
        const cached = this._textFillImageCache.get(source);
        if (cached) {
            return cached;
        }

        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = source;
        this._textFillImageCache.set(source, image);

        return image.complete ? image : null;
    }

    private _normalizeGradientStops(stops: IDocTextFillGradientStop[] | undefined, fallbackColor: string) {
        const normalizedStops = stops && stops.length >= 2
            ? stops
            : [
                { offset: 0, color: fallbackColor },
                { offset: 100, color: '#ffffff' },
            ];

        return normalizedStops.map((stop) => ({
            color: stop.color,
            offset: this._clamp(stop.offset > 1 ? stop.offset / 100 : stop.offset, 0, 1),
            opacity: stop.opacity,
        }));
    }

    private _getLinearGradientLine(bounds: { left: number; top: number; width: number; height: number }, angle: number) {
        const angleRad = (angle * Math.PI) / 180;
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        const halfDiagonal = (Math.abs(bounds.width * cos) + Math.abs(bounds.height * sin)) / 2;

        return {
            x0: centerX - cos * halfDiagonal,
            y0: centerY - sin * halfDiagonal,
            x1: centerX + cos * halfDiagonal,
            y1: centerY + sin * halfDiagonal,
        };
    }

    private _colorWithOpacity(color: string, opacity?: number): string {
        if (opacity === undefined || opacity >= 1) {
            return color;
        }

        const alpha = this._clamp(opacity, 0, 1);
        const hex = color.trim();
        if (/^#[0-9a-f]{3}$/i.test(hex)) {
            const [, r, g, b] = hex;
            return `rgba(${Number.parseInt(r + r, 16)}, ${Number.parseInt(g + g, 16)}, ${Number.parseInt(b + b, 16)}, ${alpha})`;
        }

        if (/^#[0-9a-f]{6}$/i.test(hex)) {
            return `rgba(${Number.parseInt(hex.slice(1, 3), 16)}, ${Number.parseInt(hex.slice(3, 5), 16)}, ${Number.parseInt(hex.slice(5, 7), 16)}, ${alpha})`;
        }

        return color;
    }

    private _clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
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

        if (isVertical && !cjk.hasCJK(content)) {
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
                let x_offset = 0;
                let y_offset = 0;
                if (isVertical) {
                    const fontHeight = glyph.bBox.aba - glyph.bBox.abd;
                    x_offset = (glyph.width - glyph.bBox.width) / 2;
                    y_offset = -(glyph.width - fontHeight) / 2;
                }
                ctx.fillText(content, spanPointWithFont.x + x_offset, spanPointWithFont.y + y_offset);
            }
        }
    }

    override clearCache() {
        this._preFontColor = '';
    }
}

DocumentsSpanAndLineExtensionRegistry.add(new FontAndBaseLine());
