import { FontStyleType, ICellInfo, ISelection, IStyleBase, Nullable, ObjectMatrix, Tools, IRangeData, BaselineOffset, IScale } from '@univerjs/core';
import { DEFAULT_FONTFACE_PLANE } from './Const';
import { IBoundRectNoAngle } from './Vector2';
import { IFontLocale } from './Interfaces';
import { FontCache } from './FontCache';

const OBJECT_ARRAY = '[object Array]';
const OBJECT_NUMBER = '[object Number]';
const OBJECT_STRING = '[object String]';
const OBJECT_BOOLEAN = '[object Boolean]';
const PI_OVER_DEG180 = Math.PI / 180;
const DEG180_OVER_PI = 180 / Math.PI;
const HASH = '#';
const EMPTY_STRING = '';
const ZERO = '0';
const RGB_PAREN = 'rgb(';
const RGBA_PAREN = 'rgba(';
const RGB_REGEX = /rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/;

// TODO :move to core @jerry
export const getColor = (RgbArray: number[], opacity?: number): string => {
    if (!RgbArray) {
        return `${RGB_PAREN}0,0,0)`;
    }

    if (opacity != null) {
        return `${RGBA_PAREN + RgbArray.join(',')},${opacity})`;
    }
    return `${RGB_PAREN + RgbArray.join(',')})`;
};

export const toPx = (num: number | string, ReferenceValue?: number): number => {
    if (Tools.isNumber(num)) {
        return num;
    }
    if (ReferenceValue && num && Tools.isString(num) && num.substr(num.length - 1, 1) === '%') {
        const numFloat = parseFloat(num) / 100;
        return ReferenceValue * numFloat;
    }
    return 0;
};

/**
 * Queue a new function into the requested animation frame pool (ie. this function will be executed byt the browser for the next frame)
 * @param func - the function to be called
 * @param requester - the object that will request the next frame. Falls back to window.
 * @returns frame number
 */
export const requestNewFrame = (func: Function, requester?: any): number => {
    if (!requester) {
        requester = window;
    }

    if (requester.requestPostAnimationFrame) {
        return requester.requestPostAnimationFrame(func);
    }
    if (requester.requestAnimationFrame) {
        return requester.requestAnimationFrame(func);
    }
    if (requester.msRequestAnimationFrame) {
        return requester.msRequestAnimationFrame(func);
    }
    if (requester.webkitRequestAnimationFrame) {
        return requester.webkitRequestAnimationFrame(func);
    }
    if (requester.mozRequestAnimationFrame) {
        return requester.mozRequestAnimationFrame(func);
    }
    if (requester.oRequestAnimationFrame) {
        return requester.oRequestAnimationFrame(func);
    }
    return window.setTimeout(func, 16);
};

export const cancelRequestFrame = (requestID: number, requester?: any) => {
    if (!requester) {
        requester = window;
    }

    if (requester.requestPostAnimationFrame) {
        return requester.cancelPostAnimationFrame(requestID);
    }
    if (requester.requestAnimationFrame) {
        return requester.cancelAnimationFrame(requestID);
    }
    if (requester.msRequestAnimationFrame) {
        return requester.msCancelAnimationFrame(requestID);
    }
    if (requester.webkitRequestAnimationFrame) {
        return requester.webkitCancelAnimationFrame(requestID);
    }
    if (requester.mozRequestAnimationFrame) {
        return requester.mozCancelAnimationFrame(requestID);
    }
    if (requester.oRequestAnimationFrame) {
        return requester.oCancelAnimationFrame(requestID);
    }
    return window.clearTimeout(requestID);
};

export const createCanvasElement = (): HTMLCanvasElement => {
    let canvas = document.createElement('canvas');
    // on some environments canvas.style is readonly
    try {
        (canvas as any).style = canvas.style || {};
    } catch (e) {
        console.error(e);
    }
    return canvas;
};

export const createImageElement = () => document.createElement('img');

export const radToDeg = (rad: number) => rad * DEG180_OVER_PI;

// degree is °
export const degToRad = (deg: number) => deg * PI_OVER_DEG180;

/**
 * Gets the pointer prefix to use
 * @param engine defines the engine we are finding the prefix for
 * @returns "pointer" if touch is enabled. Else returns "mouse"
 */
export const getPointerPrefix = (): string => {
    let eventPrefix = 'pointer';

    // Check if pointer events are supported
    if (typeof window !== 'undefined' && !window.PointerEvent && typeof navigator !== 'undefined' && !navigator.pointerEnabled) {
        eventPrefix = 'mouse';
    }

    // Special Fallback MacOS Safari...
    if (
        Tools.isTablet() &&
        !Tools.isIPhone() &&
        // And not ipad pros who claim to be macs...
        !(document && 'ontouchend' in document)
    ) {
        eventPrefix = 'mouse';
    }

    return eventPrefix;
};

/**
 * Utility function to detect if the current user agent is Safari
 * @returns whether or not the current user agent is safari
 */
export const IsSafari = (): boolean => {
    if (Tools.getBrowserType() === 'safari') {
        return true;
    }
    return false;
};

export const generateRandomKey = (prefix: string = 'obj', keyLength: number = 4): string => {
    let userAgent = window.navigator.userAgent.replace(/[^a-zA-Z0-9]/g, '').split('');

    let mid = '';

    for (let i = 0; i < keyLength; i++) {
        mid += userAgent[Math.round(Math.random() * (userAgent.length - 1))];
    }

    let time = new Date().getTime();

    return `${prefix}_${mid}_${time}`;
};

export function getValueType(value: any): string {
    return Object.prototype.toString.apply(value);
}

export function isFunction(value?: any): value is boolean {
    return getValueType(value) === '[object Function]';
}

export function isDate(value?: Date): value is Date {
    return getValueType(value) === '[object Date]';
}

export function isRegExp(value?: any): value is RegExp {
    return getValueType(value) === '[object RegExp]';
}

export function isArray<T>(value?: any): value is T[] {
    return getValueType(value) === '[object Array]';
}

export function isString(value?: any): value is string {
    return getValueType(value) === '[object String]';
}

export function isNumber(value?: any): value is number {
    return getValueType(value) === '[object Number]';
}

export function isObject(value?: any): value is object {
    return getValueType(value) === '[object Object]';
}

export function precisionTo(num: number, accurate: number) {
    accurate = 10 ** accurate;
    return Math.round(num * accurate) / accurate;
}

/**
 * performance testing
 * var time = performance.now(); for(let i=0;i<100000000;i++){ fixLineWidthByScale(i, 0.666); }; console.log(performance.now()-time);
 */
export function fixLineWidthByScale(num: number, scale: number) {
    return Math.round(num * scale) / scale;
}

export function getFontStyleString(textStyle?: IStyleBase, fontLocale?: IFontLocale) {
    // 获取字体配置

    if (!fontLocale) {
        fontLocale = {
            fontList: ['Arial'],
            defaultFontSize: 14,
        };
    }

    const { fontList, defaultFontSize } = fontLocale;

    if (!textStyle) {
        return { fontString: `${defaultFontSize}px  ${fontList[0]}`, fontSize: defaultFontSize, fontFamily: fontList[0] };
    }

    // font-style
    let italic = FontStyleType.ITALIC;
    if (textStyle.it === 0 || textStyle.it === undefined) {
        italic = FontStyleType.NORMAL;
    }

    // font-variant
    // font += `${FontStyleType.NORMAL} `;

    // font-weight
    let bold = FontStyleType.BOLD;
    if (textStyle.bl === 0 || textStyle.bl === undefined) {
        bold = FontStyleType.NORMAL;
    }

    // font-size/line-height
    let fontSize = defaultFontSize;
    if (textStyle.fs) {
        fontSize = Math.ceil(textStyle.fs);
    }

    let fontFamilyResult = fontList[0];
    if (textStyle.ff) {
        let fontFamily = textStyle.ff;

        fontFamily = fontFamily.replace(/"/g, '').replace(/'/g, '');

        if (fontFamily.indexOf(' ') > -1) {
            fontFamily = `"${fontFamily}"`;
        }

        // if (fontFamily != null && document.fonts && !document.fonts.check('12px ' + fontFamily)) {
        //     menuButton.addFontToList(fontFamily);
        // }

        if (fontFamily == null) {
            fontFamily = fontList[0];
        }

        fontFamilyResult = fontFamily;
    }

    const { va: baselineOffset } = textStyle;

    if (baselineOffset === BaselineOffset.SUBSCRIPT || baselineOffset === BaselineOffset.SUPERSCRIPT) {
        const baselineOffsetInfo = FontCache.getBaselineOffsetInfo(fontFamilyResult, fontSize);
        const { sbr, spr } = baselineOffsetInfo;
        fontSize *= baselineOffset === BaselineOffset.SUBSCRIPT ? sbr : spr;
    }

    const fontString = `${italic} ${bold} ${fontSize}px ${fontFamilyResult}, ${DEFAULT_FONTFACE_PLANE} `;

    return {
        fontString,
        fontSize,
        fontFamily: fontFamilyResult,
    };
}

export function isSupportBoundingBox(ctx: CanvasRenderingContext2D) {
    let measureText = ctx.measureText('田');
    if (measureText.actualBoundingBoxAscent == null) {
        return false;
    }
    return true;
}

// 是否有中文
export function hasChineseText(text: string) {
    let pattern = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
    // /^([^\p{Han}]*?)(?:\s+([\p{Han}].*))?$/gim;

    if (!pattern.exec(text)) {
        return false;
    }
    return true;
}

// 是否有日文
export function hasJapaneseText(text: string) {
    let pattern = /[一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+|[a-zA-Z0-9]+|[ａ-ｚＡ-Ｚ０-９]+|[々〆〤]+/giu;

    if (!pattern.exec(text)) {
        return false;
    }
    return true;
}

// 是否有韩文
export function hasKoreanText(text: string) {
    let pattern = /[^a-zA-Z0-9\p{Hangul}]/gi;

    if (!pattern.exec(text)) {
        return false;
    }
    return true;
}

// 是否有中文、日文、韩文等可以垂直布局的文字，东亚文字
export function hasCJK(text: string) {
    let pattern = /[\u2E80-\uA4CF]|[\uF900-\uFAFF]|[\uFE30-\uFE4F]|[\uFF00-\uFFEF]/gi;
    if (!pattern.exec(text)) {
        return false;
    }
    return true;
}

// 是否有中文、日文等不会存在单词文字，即：单字可以换行，不像hellow world 一样，world的单字必须连在一起。目前只发现中文、日文有这个特性，以后还可以再补充
export function hasWrappableText(text: string) {
    return hasChineseText(text) || hasJapaneseText(text);
}

export function hasAllLatin(text: string) {
    let pattern = /[\u0000-\u024F]/gi;
    if (!pattern.exec(text)) {
        return false;
    }
    return true;
}

export function hasBasicLatin(text: string) {
    let pattern = /[\u0000-\u007F]/gi;
    if (!pattern.exec(text)) {
        return false;
    }
    return true;
}

export function hasLatinOneSupplement(text: string) {
    let pattern = /[\u0080-\u00FF]/gi;
    if (!pattern.exec(text)) {
        return false;
    }
    return true;
}

export function hasLatinExtendedA(text: string) {
    let pattern = /[\u0100-\u017F]/gi;
    if (!pattern.exec(text)) {
        return false;
    }
    return true;
}

export function hasLatinExtendedB(text: string) {
    let pattern = /[\u0180-\u024F]/gi;
    if (!pattern.exec(text)) {
        return false;
    }
    return true;
}

export function hasArabic(text: string) {
    let pattern = /[\u0600-\u06FF]|[\u0750-\u0750]|[\u0870-\u08FF]|[\uFB50-\uFDFF]|[\uFE70-\uFEFF]/gi;
    if (!pattern.exec(text)) {
        return false;
    }
    return true;
}

export function hasTibetan(text: string) {
    let pattern = /[\u0180-\u024F]/gi;
    if (!pattern.exec(text)) {
        return false;
    }
    return true;
}

export function hasSpaceAndTab(text: string) {
    let pattern = /\s+|\t+/g;
    if (!pattern.exec(text)) {
        return false;
    }
    return true;
}

// 返回屏幕DPI
let dpi_cache: Nullable<number>;
export function getDPI() {
    if (dpi_cache) {
        return dpi_cache;
    }
    let i = 56;
    for (; i < 2000; i++) {
        if (matchMedia(`(max-resolution: ${i}dpi)`).matches === true) {
            return i;
        }
    }
    dpi_cache = i;
    setTimeout(() => {
        dpi_cache = null;
    }, 1000);
    return i;
}

const BENCHMARK_DPI = 72;
const BENCHMARK_CONVERT_MM = 25.4;

// ptToPx
export function ptToPx(pt: number) {
    return pt / (BENCHMARK_DPI / getDPI());
}

// pxToPt
export function pxToPt(px: number) {
    return px * (BENCHMARK_DPI / getDPI());
}

// pxToMM
export function ptToMM(px: number) {
    return px * (getDPI() / BENCHMARK_CONVERT_MM);
}

// pxToInch
export function pxToInch(px: number) {
    return px * getDPI();
}

export function getScale(parentScale: IScale) {
    const { scaleX = 1, scaleY = 1 } = parentScale;
    return Math.max(scaleX, scaleY);
}

export function getCellPositionByIndex(row: number, column: number, rowHeightAccumulation: number[], columnWidthAccumulation: number[]) {
    const startRow = row - 1;
    const startColumn = column - 1;

    let startY = rowHeightAccumulation[startRow] || 0;
    let endY = rowHeightAccumulation[row];

    let startX = columnWidthAccumulation[startColumn] || 0;
    let endX = columnWidthAccumulation[column];

    return {
        startY,
        endY,
        startX,
        endX,
    };
}

export function getCellByIndex(
    row: number,
    column: number,
    rowHeightAccumulation: number[],
    columnWidthAccumulation: number[],
    dataMergeCache: ObjectMatrix<IRangeData>
): ICellInfo {
    let { startY, endY, startX, endX } = getCellPositionByIndex(row, column, rowHeightAccumulation, columnWidthAccumulation);

    const { isMerged, isMergedMainCell, newEndRow, newEndColumn, mergeRow, mergeColumn } = mergeCellHandler(row, column, dataMergeCache);
    let mergeInfo = {
        startRow: mergeRow,
        startColumn: mergeColumn,
        endRow: newEndRow,
        endColumn: newEndColumn,

        startY: 0,
        endY: 0,
        startX: 0,
        endX: 0,
    };
    if (isMerged && mergeRow !== -1 && mergeColumn !== -1) {
        let mergeStartY = rowHeightAccumulation[mergeRow - 1] || 0;
        let mergeEndY = rowHeightAccumulation[newEndRow];

        let mergeStartX = columnWidthAccumulation[mergeColumn - 1] || 0;
        let mergeEndX = columnWidthAccumulation[newEndColumn];
        mergeInfo = {
            ...mergeInfo,
            startY: mergeStartY,
            endY: mergeEndY,
            startX: mergeStartX,
            endX: mergeEndX,
        };
    } else if (!isMerged && newEndRow !== -1 && newEndColumn !== -1) {
        endY = rowHeightAccumulation[newEndRow] || 0;
        endX = columnWidthAccumulation[newEndColumn] || 0;
    }

    return {
        isMerged,
        isMergedMainCell,
        row,
        column,
        startY,
        endY,
        startX,
        endX,
        mergeInfo,
    };
}

export function mergeCellHandler(row: number, column: number, dataMergeCache?: ObjectMatrix<IRangeData>) {
    let isMerged = false; // The upper left cell only renders the content
    let isMergedMainCell = false;
    let newEndRow = -1;
    let newEndColumn = -1;
    let mergeRow = -1;
    let mergeColumn = -1;
    dataMergeCache?.forEach((r, dataMergeRow) => {
        let isSuspended = false;
        dataMergeRow?.forEach((c, dataCache) => {
            const { startRow: startRowMarge, endRow: endRowMarge, startColumn: startColumnMarge, endColumn: endColumnMarge } = dataCache;
            if (row === startRowMarge && column === startColumnMarge) {
                newEndRow = endRowMarge;
                newEndColumn = endColumnMarge;
                mergeRow = startRowMarge;
                mergeColumn = startColumnMarge;
                isSuspended = true;
                isMergedMainCell = true;
                return false;
            }
            if (row >= startRowMarge && row <= endRowMarge && column >= startColumnMarge && column <= endColumnMarge) {
                newEndRow = endRowMarge;
                newEndColumn = endColumnMarge;
                mergeRow = startRowMarge;
                mergeColumn = startColumnMarge;
                isSuspended = true;
                isMerged = true;
                return false;
            }
        });

        if (isSuspended) {
            return false;
        }
    });

    return {
        isMergedMainCell,
        isMerged,
        newEndRow,
        newEndColumn,
        mergeRow,
        mergeColumn,
    };
}

export function mergeInfoOffset(mergeInfo: ISelection, offsetX: number, offsetY: number, scaleX: number, scaleY: number) {
    const { startY, endY, startX, endX } = mergeInfo;
    mergeInfo.startY = fixLineWidthByScale(startY + offsetY, scaleY);
    mergeInfo.endY = fixLineWidthByScale(endY + offsetY, scaleY);
    mergeInfo.startX = fixLineWidthByScale(startX + offsetX, scaleX);
    mergeInfo.endX = fixLineWidthByScale(endX + offsetX, scaleX);

    return {
        ...mergeInfo,
    };
}

export function isRectIntersect(rect1: IBoundRectNoAngle, rect2: IBoundRectNoAngle) {
    return !(rect1.left > rect2.right || rect1.top > rect2.bottom || rect2.left > rect1.right || rect2.top > rect1.bottom);
}

export function injectStyle(styles: string[]) {
    const styleElement = document.createElement('style');

    document.head.appendChild(styleElement);

    const styleSheet = styleElement.sheet;

    for (let style of styles) {
        styleSheet?.insertRule(style, styleSheet.cssRules.length);
    }
}

export function checkStyle(content: string) {
    for (let i = 0, len = document.head.childNodes.length; i < len; i++) {
        const node = document.head.childNodes[i];
        if (node.nodeName === 'STYLE' && node.textContent && node.textContent.indexOf(content) > -1) {
            return true;
        }
    }
    return false;
}

export function pxToNum(unit: string) {
    return Number(unit.replace(/px/gi, ''));
}

export function getSizeForDom(dom: HTMLElement) {
    const style = getComputedStyle(dom);
    const { borderTopWidth, borderLeftWidth, borderRightWidth, borderBottomWidth, width, height } = style;
    return {
        top: pxToNum(borderTopWidth),
        left: pxToNum(borderLeftWidth),
        right: pxToNum(borderRightWidth),
        bottom: pxToNum(borderBottomWidth),
        width: pxToNum(width),
        height: pxToNum(height),
    };
}
