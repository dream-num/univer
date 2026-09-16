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

import type { Nullable } from '@univerjs/core';
import type {
    IDocumentSkeletonBoundingBox,
    IDocumentSkeletonFontStyle,
} from '../../../../basics/i-document-skeleton-cached';

export const DEFAULT_MEASURE_TEXT = '0';

export interface IMeasureTextCache {
    fontBoundingBoxAscent: number;
    fontBoundingBoxDescent: number;
    actualBoundingBoxAscent: number;
    actualBoundingBoxDescent: number;
    actualBoundingBoxRight?: number;
    width: number;
}

const getDefaultBaselineOffset = (fontSize: number) => ({
    sbr: 0.6,
    sbo: fontSize,
    spr: 0.6,
    spo: fontSize,
});

function getNormalFontKey(font: string): string {
    return font.replace(/\d+(?:\.\d+)?(?:pt|px)/, '1000pt').trim();
}

interface IFontData {
    notDefWidth: number;
    ascender: number;
    descender: number;
    typoAscender: number;
    typoDescender: number;
    strikeoutPosition: number;
    subscriptSizeRatio: number;
    subscriptOffset: number;
    superscriptSizeRatio: number;
    superscriptOffset: number;
    hdmxData?: number[]; // hdmxData https://docs.microsoft.com/en-us/typography/opentype/spec/recom#hdmx
    glyphHorizonMap: Map<number, IGlyphHorizonData>;
}

interface IGlyphHorizonData {
    width: number;
    lsb: number;
    pixelsPerEm?: number[];
}

/** Invalidates selected CSS font keys in both measurement caches; registered font data is retained. */
export function invalidateDocumentFontMetrics(matches: (fontStyle: string) => boolean): boolean {
    return FontCache.invalidateMetrics(matches);
}

export class FontCache {
    private static _normalLineHeightCache = new Map<string, number>();

    private static _getTextHeightCache: { [key: string]: { width: number; height: number } } = {};

    private static _context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;

    private static _fontDataMap: Map<string, IFontData> = new Map();

    private static _globalFontMeasureCache: Map<string, Map<string, IMeasureTextCache>> = new Map();

    static get globalFontMeasureCache() {
        return this._globalFontMeasureCache;
    }

    static invalidateMetrics(matches: (fontStyle: string) => boolean): boolean {
        let changed = false;
        const keys = new Set([
            ...this._globalFontMeasureCache.keys(),
            ...Object.keys(this._getTextHeightCache),
            ...this._normalLineHeightCache.keys(),
        ]);
        for (const key of keys) {
            if (matches(key)) {
                this._globalFontMeasureCache.delete(key);
                delete this._getTextHeightCache[key];
                this._normalLineHeightCache.delete(key);
                this._normalLineHeightCache.delete(getNormalFontKey(key));
                changed = true;
            }
        }
        return changed;
    }

    static setFontMeasureCache(fontStyle: string, content: string, tm: IMeasureTextCache) {
        if (!this._globalFontMeasureCache.has(fontStyle)) {
            this._globalFontMeasureCache.set(fontStyle, new Map());
        }

        const fontMeasureCache = this._globalFontMeasureCache.get(fontStyle);
        if (fontMeasureCache) {
            fontMeasureCache.set(content, tm);
        }
    }

    static clearFontMeasureCache(path: string) {
        const pathArr = path.split('/');
        if (pathArr.length === 1) {
            const fontStyle = pathArr[0];
            this._globalFontMeasureCache.delete(fontStyle);
        } else if (pathArr.length === 2) {
            const fontStyle = pathArr[0];
            const content = pathArr[1];
            this._globalFontMeasureCache.get(fontStyle)?.delete(content);
        } else {
            return false;
        }
        return true;
    }

    static getFontMeasureCache(fontStyle: string, content: string): Nullable<IMeasureTextCache> {
        return this._globalFontMeasureCache.get(fontStyle)?.get(content);
    }

    // Automatically clear text cache, threshold is adjustable, clear rule is to delete half of the cache after reaching the upper limit
    static autoCleanFontMeasureCache(cacheLimit: number = 1000000) {
        let allSize = 0;
        let isDelete = false;

        for (const item of this._globalFontMeasureCache) {
            const [, values] = item;
            allSize += values.size;
            if (allSize > cacheLimit) {
                isDelete = true;
                break;
            }
        }

        if (isDelete) {
            let deleteAllSize = 0;
            for (const item of this._globalFontMeasureCache) {
                const [key, values] = item;
                deleteAllSize += values.size;
                if (deleteAllSize > cacheLimit / 2) {
                    const limit = deleteAllSize - cacheLimit / 2;
                    this._clearMeasureCache(limit, values); // If the number of characters under the font style exceeds the threshold, clear deeply internally
                    break;
                }

                // Clear font cache under the entire style
                this._globalFontMeasureCache.delete(key);
            }

            return true;
        }

        return false;
    }

    static getBaselineOffsetInfo(fontFamily: string, fontSize: number) {
        if (this._fontDataMap.size === 0) {
            return getDefaultBaselineOffset(fontSize);
        }

        const fontFamilyList = fontFamily.split(',');

        for (let ff of fontFamilyList) {
            ff = ff.replace(/'/g, '');
            const fontData = this._fontDataMap.get(ff);
            if (!fontData) {
                continue;
            }

            const { subscriptSizeRatio, subscriptOffset, superscriptSizeRatio, superscriptOffset } = fontData;

            return {
                sbr: subscriptSizeRatio,
                sbo: subscriptOffset * fontSize,
                spr: superscriptSizeRatio,
                spo: superscriptOffset * fontSize,
            };
        }
        return getDefaultBaselineOffset(fontSize);
    }

    static getTextSizeByDom(text: string, fontStyle: string) {
        if (fontStyle in this._getTextHeightCache) {
            return this._getTextHeightCache[fontStyle];
        }

        if (typeof document === 'undefined') {
            return {
                width: 0,
                height: this._getFontSizeFromStyle(fontStyle),
            };
        }

        let dom = document.getElementById('universheetTextSizeTest');
        const defaultStyle = 'float:left;white-space:nowrap;visibility:hidden;margin:0;padding:0;';
        if (!dom) {
            dom = document.createElement('span');
            // dom.style.cssText = 'visibility:hidden;';
            dom.id = 'universheetTextSizeTest';
            document.getElementsByTagName('body')[0].appendChild(dom);
        }
        dom.style.cssText += `${defaultStyle};${fontStyle}`;
        dom.textContent = text;
        const rect = dom.getBoundingClientRect();
        const result = { width: rect.width, height: rect.height };
        this._getTextHeightCache[fontStyle] = result;

        return result;
    }

    /** CSS normal spacing includes font leading that Canvas bounding boxes omit. */
    static getNormalLineHeight(fontStyle: IDocumentSkeletonFontStyle): number | undefined {
        const key = getNormalFontKey(fontStyle.fontString);
        let ratio = this._normalLineHeightCache.get(key);
        if (ratio == null && typeof document !== 'undefined' && document.body != null) {
            const element = document.createElement('div');
            element.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;white-space:pre;margin:0;padding:0;border:0;';
            element.style.font = key;
            element.style.lineHeight = 'normal';
            element.textContent = 'Hg\nHg';
            document.body.appendChild(element);
            try {
                // Measuring large text preserves subpixel font metrics at ordinary document sizes.
                const height = element.getBoundingClientRect().height / 2000;
                if (Number.isFinite(height) && height > 0) {
                    ratio = height;
                    if (this._normalLineHeightCache.size >= 1024) {
                        this._normalLineHeightCache.clear();
                    }
                    this._normalLineHeightCache.set(key, ratio);
                }
            } finally {
                element.remove();
            }
        }
        return ratio == null ? undefined : ratio * fontStyle.originFontSize;
    }

    /** Transfers browser-only normal spacing measurements to the document layout Worker. */
    static getNormalLineHeightCache(): Record<string, number> {
        return Object.fromEntries(this._normalLineHeightCache);
    }

    static setNormalLineHeightCache(metrics: Record<string, number>): void {
        for (const [font, ratio] of Object.entries(metrics)) {
            if (Number.isFinite(ratio) && ratio > 0) {
                if (this._normalLineHeightCache.size >= 1024 && !this._normalLineHeightCache.has(font)) {
                    this._normalLineHeightCache.clear();
                }
                this._normalLineHeightCache.set(font, ratio);
            }
        }
    }

    static getTextSize(
        content: string,
        fontStyle: IDocumentSkeletonFontStyle,
        includeNormalFontLeading = false
    ): IDocumentSkeletonBoundingBox {
        const { fontString, fontSize, fontFamily } = fontStyle;

        let bBox = this._getBoundingBoxByFont(fontFamily, fontSize);

        if (!bBox) {
            // if (content === DataStreamTreeTokenType.PARAGRAPH) {
            //     content = '0';
            // }
            const measureText = this.getMeasureText(content, fontString);
            bBox = this._calculateBoundingBoxByMeasureText(measureText, fontStyle);
        }

        return {
            ...bBox,
            normalLineHeight: (includeNormalFontLeading ? this.getNormalLineHeight(fontStyle) : undefined) ?? bBox.ba + bBox.bd,
        };
    }

    /**
     * Measure text on another canvas.
     * @param content
     * @param fontString
     * @returns IMeasureTextCache
     */
    static getMeasureText(content: string, fontString: string): IMeasureTextCache {
        if (!this._context) {
            this._context = this._createMeasureContext();
        }
        if (!this._context) {
            return {
                width: 0,
                fontBoundingBoxAscent: 0,
                fontBoundingBoxDescent: 0,
                actualBoundingBoxAscent: 0,
                actualBoundingBoxDescent: 0,
            };
        }
        // const { fontString, fontSize, fontFamily } = fontStyle;

        const ctx = this._context;

        const mtc = this.getFontMeasureCache(fontString, content);
        if (mtc != null) {
            return mtc;
        }
        ctx.font = fontString;

        const textMetrics = ctx.measureText(content);

        const {
            width,
            fontBoundingBoxAscent,
            fontBoundingBoxDescent,
            actualBoundingBoxAscent,
            actualBoundingBoxDescent,
            actualBoundingBoxRight,
        } = textMetrics;

        const cache: IMeasureTextCache = {
            width,
            fontBoundingBoxAscent,
            fontBoundingBoxDescent,
            actualBoundingBoxAscent,
            actualBoundingBoxDescent,
            actualBoundingBoxRight,
        };

        // Compatibility for browsers that do not support textMetrics
        if (
            fontBoundingBoxAscent == null ||
            fontBoundingBoxDescent == null ||
            Number.isNaN(fontBoundingBoxAscent) ||
            Number.isNaN(fontBoundingBoxDescent)
        ) {
            const measuredHeight = actualBoundingBoxAscent + actualBoundingBoxDescent;
            const oneLineTextHeight = typeof document === 'undefined' && typeof OffscreenCanvas !== 'undefined' && Number.isFinite(measuredHeight) && measuredHeight > 0
                ? measuredHeight
                : this.getTextSizeByDom(DEFAULT_MEASURE_TEXT, fontString).height;

            if (ctx.textBaseline === 'top') {
                cache.fontBoundingBoxAscent = cache.actualBoundingBoxAscent = oneLineTextHeight;
                cache.fontBoundingBoxDescent = cache.actualBoundingBoxDescent = 0;
            } else if (ctx.textBaseline === 'middle') {
                cache.fontBoundingBoxDescent = cache.actualBoundingBoxDescent = oneLineTextHeight / 2;
                cache.fontBoundingBoxAscent = cache.actualBoundingBoxAscent = oneLineTextHeight / 2;
            } else {
                cache.fontBoundingBoxDescent = cache.actualBoundingBoxDescent = 0;
                cache.fontBoundingBoxAscent = cache.actualBoundingBoxAscent = oneLineTextHeight;
            }
        }

        this.setFontMeasureCache(fontString, content, cache);

        return cache;
    }

    private static _createMeasureContext(): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null {
        if (typeof document !== 'undefined') {
            return document.createElement('canvas').getContext('2d');
        }

        if (typeof OffscreenCanvas !== 'undefined') {
            return new OffscreenCanvas(1, 1).getContext('2d');
        }

        return null;
    }

    private static _getFontSizeFromStyle(fontStyle: string): number {
        const match = /(?:^|\s)(\d+(?:\.\d+)?)px(?:\s|\/|$)/.exec(fontStyle);
        return match == null ? 0 : Number(match[1]);
    }

    private static _clearMeasureCache(limit: number, values: Map<string, IMeasureTextCache>) {
        let valueIndex = 0;
        for (const txtItem of values) {
            const [txtKey] = txtItem;
            if (valueIndex > limit) {
                break;
            }
            values.delete(txtKey);
            valueIndex++;
        }
        return true;
    }

    /**
     * Vertical Metrics https://glyphsapp.com/learn/vertical-metrics
     * @param fontFamily
     * @param fontSize
     * @param content
     * @returns
     */
    private static _getBoundingBoxByFont(fontFamily: string, fontSize = 28, content: string = '') {
        const fontData = this._fontDataMap.get(fontFamily);

        if (!fontData) {
            return;
        }
        const {
            notDefWidth,
            ascender,
            descender,
            typoAscender,
            typoDescender,
            strikeoutPosition,
            subscriptSizeRatio,
            subscriptOffset,
            superscriptSizeRatio,
            superscriptOffset,
            hdmxData,
            glyphHorizonMap,
        } = fontData;

        const pixelsPerEmIndex = hdmxData?.indexOf(Math.floor(fontSize));

        const glyph = glyphHorizonMap.get(content.charCodeAt(0));
        let widthResult = notDefWidth;
        if (glyph) {
            const { width, pixelsPerEm = [] } = glyph;

            if (pixelsPerEmIndex) {
                widthResult = pixelsPerEm[pixelsPerEmIndex];
            } else {
                widthResult = width;
            }
        }
        return {
            width: widthResult * fontSize,
            ba: ascender * fontSize,
            bd: descender * fontSize,
            aba: typoAscender * fontSize,
            abd: typoDescender * fontSize,
            sp: strikeoutPosition * fontSize,
            sbr: subscriptSizeRatio,
            sbo: subscriptOffset * fontSize,
            spr: superscriptSizeRatio,
            spo: superscriptOffset * fontSize,
        };
    }

    private static _calculateBoundingBoxByMeasureText(textCache: IMeasureTextCache, fontStyle: IDocumentSkeletonFontStyle) {
        const {
            width,
            fontBoundingBoxAscent,
            fontBoundingBoxDescent,
            actualBoundingBoxAscent: aba,
            actualBoundingBoxDescent: abd,
        } = textCache;

        const { fontSize, originFontSize } = fontStyle;
        const scale = originFontSize / fontSize;
        const ba = fontBoundingBoxAscent * scale;
        const bd = fontBoundingBoxDescent * scale;

        return {
            width,
            ba,
            bd,
            aba,
            abd,
            sp: (fontBoundingBoxAscent + fontBoundingBoxDescent) / 2,
            sbr: 0.6,
            spr: 0.6,
            // https://en.wikipedia.org/wiki/Subscript_and_superscript Microsoft Word 2015
            sbo: (ba + bd) * 0.141,
            spo: (ba + bd) * 0.4,
        };
    }
}
