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
import type { IDocumentSkeletonGlyph } from '../../../basics/i-document-skeleton-cached';
import type { UniverRenderingContext } from '../../../context';
import { BaselineOffset, getColorStyle } from '@univerjs/core';
import { fontStringPtToPx, GlyphType, hasCJK } from '../../../basics';
import { COLOR_BLACK_RGB } from '../../../basics/const';
import { Vector2 } from '../../../basics/vector2';
import { CheckboxShape } from '../../../shape';
import { DocumentsSpanAndLineExtensionRegistry } from '../../extension';
import { docExtension } from '../doc-extension';

const UNIQUE_KEY = 'DefaultDocsFontAndBaseLineExtension';

const DOC_EXTENSION_Z_INDEX = 20;

export function fontStringPtToPx(fontString: string): string {
    const ptRegex = /(\d+)pt/;
    const match = fontString.match(ptRegex);

    if (match) {
        const ptValue = Number.parseInt(match[1], 10);

        const pxValue = Number.parseFloat((ptValue * (4 / 3)).toFixed(4)); ;

        const newFontString = fontString.replace(ptRegex, `${pxValue}px`);
        return newFontString;
    } else {
        return fontString;
    }
}

/**
 * 规范化字体字符串，移除默认的'normal'值
 * @param fontString 原始字体字符串
 * @returns 规范化后的字体字符串
 */
export function normalizeFontString(fontString: string): string {
  // 分割字体字符串为组件
    const parts = fontString.trim().split(/\s+/);
    const normalizedParts: string[] = [];

    let fontSizeFound = false;

  // 遍历并处理每个部分
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

    // 检查是否已找到字体大小（包含px, pt, em等）
        if (/^(\d+(\.\d+)?(px|pt|em|rem|%|vh|vw|vmin|vmax))$/i.test(part)) {
            fontSizeFound = true;
            normalizedParts.push(part);
            continue;
        }

    // 如果已找到字体大小，后面的都是字体族名称
        if (fontSizeFound) {
            normalizedParts.push(part);
            continue;
        }

    // 跳过'normal'值
        if (part.toLowerCase() === 'normal') {
            continue;
        }

    // 保留其他值（如'italic', 'bold', 'small-caps'等）
        normalizedParts.push(part);
    }

    return normalizedParts.join(' ');
}

/**
 * Singleton
 */
export class FontAndBaseLine extends docExtension {
    override uKey = UNIQUE_KEY;

    override Z_INDEX = DOC_EXTENSION_Z_INDEX;

    private _preFontColor = '';

    actualFontMap: Record<string, string> = {}; // 字体映射

    constructor() {
        super();
        console.log('FontAndBaseLine');
    }

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

        // const fontStringPxStr = normalizeFontString(fontStringPtToPx(fontStyle?.fontString || ''));
        // if (!(glyph.raw === '\r' || glyph.raw === '\n' || glyph.raw === ' ')) {
        //     // if (ctx.font !== fontStringPxStr) {
        //     ctx.font = fontStringPxStr;
        //     console.log('fontStringPxStr', fontStringPxStr, glyph.raw, 'height::', ctx.canvas.height);
        //     // }
        // }
        if (fontStyle && fontStyle.fontString) {
            if (!(glyph.raw === '\r' || glyph.raw === '\n' || glyph.raw === ' ')) {
                if (this.actualFontMap[fontStyle.fontString] !== ctx.font || true) {
                    ctx.font = fontStyle.fontString;
                    this.actualFontMap[fontStyle.fontString] = ctx.font;
                }
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
