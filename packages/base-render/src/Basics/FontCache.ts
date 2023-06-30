import { Nullable } from '@univerjs/core';
import { IDocumentSkeletonBoundingBox, IDocumentSkeletonFontStyle } from './IDocumentSkeletonCached';
import { DEFAULT_MEASURE_TEXT } from './Const';
import { IMeasureTextCache } from './Interfaces';

const getDefaultBaselineOffset = (fontSize: number) => ({
    sbr: 0.5,
    sbo: fontSize,
    spr: 0.5,
    spo: fontSize,
});

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

export class FontCache {
    private static _getTextHeightCache: { [key: string]: { width: number; height: number } } = {};

    private static _context: CanvasRenderingContext2D;

    private static _fontDataMap: Map<string, IFontData> = new Map();

    // 文字缓存全局变量
    private static _globalFontMeasureCache: Map<string, Map<string, IMeasureTextCache>> = new Map();

    static get globalFontMeasureCache() {
        return this._globalFontMeasureCache;
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

    // 自动清除文字缓存，阈值可调整，清除规则是触发上限后删除一半的缓存
    static autoCleanFontMeasureCache(cacheLimit: number = 1000000) {
        let allSize = 0;
        let isDelete = false;
        let i = 0;

        for (let item of this._globalFontMeasureCache) {
            const [, values] = item;
            allSize += values.size;
            if (allSize > cacheLimit) {
                isDelete = true;
                break;
            }
            i++;
        }

        if (isDelete) {
            let deleteAllSize = 0;
            for (let item of this._globalFontMeasureCache) {
                const [key, values] = item;
                deleteAllSize += values.size;
                if (deleteAllSize > cacheLimit / 2) {
                    const limit = deleteAllSize - cacheLimit / 2;
                    this._clearMeasureCache(limit, values); // 如果字体样式下面的文字数量部门超过阈值，则深入内部清除
                    break;
                }

                // 清除整个样式下的字体缓存
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

        let dom = document.getElementById('universheetTextSizeTest');
        const defaultStyle = 'float:left;white-space:nowrap;visibility:hidden;margin:0;padding:0;';
        if (!dom) {
            dom = document.createElement('span');
            // dom.style.cssText = 'visibility:hidden;';
            dom.id = 'universheetTextSizeTest';
            document.getElementsByTagName('body')[0].appendChild(dom);
        }
        dom.style.cssText += `${defaultStyle};${fontStyle}`;
        dom.innerText = text;
        const rect = dom.getBoundingClientRect();
        const result = { width: rect.width, height: rect.height };
        this._getTextHeightCache[fontStyle] = result;

        return result;
    }

    static getTextSize(content: string, fontStyle: IDocumentSkeletonFontStyle): IDocumentSkeletonBoundingBox {
        const { fontString, fontSize, fontFamily } = fontStyle;

        let bBox = this._getBoundingBoxByFont(fontFamily, fontSize);
        if (!bBox) {
            const measureText = this.getMeasureText(content, fontString);
            bBox = this._calculateBoundingBoxByMeasureText(measureText, fontSize);
        }
        return bBox;
    }

    // 获取有值单元格文本大小
    // let measureTextCache = {}, measureTextCacheTimeOut = null;
    static getMeasureText(content: string, fontString: string): IMeasureTextCache {
        if (!this._context) {
            const canvas = document.createElement('canvas');
            this._context = canvas.getContext('2d')!;
        }

        // const { fontString, fontSize, fontFamily } = fontStyle;

        const ctx = this._context;

        const mtc = this.getFontMeasureCache(fontString, content);
        if (mtc != null) {
            return mtc;
        }

        ctx.font = fontString;

        const textMetrics = ctx.measureText(content);

        const { width, fontBoundingBoxAscent, fontBoundingBoxDescent, actualBoundingBoxAscent, actualBoundingBoxDescent } = textMetrics;

        const cache: IMeasureTextCache = {
            width,
            fontBoundingBoxAscent,
            fontBoundingBoxDescent,
            actualBoundingBoxAscent,
            actualBoundingBoxDescent,
        };

        // 兼容不支持textMetrics的情况
        if (fontBoundingBoxAscent == null || fontBoundingBoxDescent == null || Number.isNaN(fontBoundingBoxAscent) || Number.isNaN(fontBoundingBoxDescent)) {
            let oneLineTextHeight = this.getTextSizeByDom(DEFAULT_MEASURE_TEXT, fontString).height;

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

    private static _clearMeasureCache(limit: number, values: Map<string, IMeasureTextCache>) {
        let valueIndex = 0;
        for (let txtItem of values) {
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

    private static _calculateBoundingBoxByMeasureText(textCache: IMeasureTextCache, fontSize: number) {
        const { width, fontBoundingBoxAscent, fontBoundingBoxDescent, actualBoundingBoxAscent, actualBoundingBoxDescent } = textCache;
        return {
            width,
            ba: fontBoundingBoxAscent,
            bd: fontBoundingBoxDescent,
            aba: actualBoundingBoxAscent,
            abd: actualBoundingBoxDescent,
            sp: (fontBoundingBoxAscent + fontBoundingBoxDescent) / 2,
            sbr: 0.5,
            sbo: fontSize,
            spr: 0.5,
            spo: fontSize,
        };
    }
}
