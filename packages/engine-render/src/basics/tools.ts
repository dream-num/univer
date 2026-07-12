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

import type {
    ICellInfo,
    ICellWithCoord,
    IPosition,
    IRange,
    IRangeWithCoord,
    IScale,
    IStyleBase,
    Nullable,
} from '@univerjs/core';
import type { IDocumentSkeletonFontStyle } from './i-document-skeleton-cached';
import type { IBoundRectNoAngle } from './vector2';
import {
    BaselineOffset,
    ColorKit,
    DEFAULT_STYLES,
    FontStyleType,
    getCellInfoInMergeData,
    Rectangle,
    Tools,
} from '@univerjs/core';
import { FontCache } from '../components/docs/layout/shaping-engine/font-cache';
import { DEFAULT_FONTFACE_PLANE } from './const';

const DEG180 = 180;

const PI_OVER_DEG180 = Math.PI / DEG180;
const DEG180_OVER_PI = DEG180 / Math.PI;
const RGB_PAREN = 'rgb(';
const RGBA_PAREN = 'rgba(';

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

const PERCENT_TO_NUMBER_DIVIDE = 100;

export const toPx = (num: number | string, ReferenceValue: Nullable<number>): number => {
    if (Tools.isNumber(num)) {
        return num;
    }
    if (ReferenceValue && num && Tools.isString(num) && num.substr(num.length - 1, 1) === '%') {
        const numFloat = Number.parseFloat(num) / PERCENT_TO_NUMBER_DIVIDE;
        return ReferenceValue * numFloat;
    }
    return 0;
};

const ONE_FRAME_NUMBER = 16;

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
    return setTimeout(func, ONE_FRAME_NUMBER);
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
    return clearTimeout(requestID);
};

export const createCanvasElement = (): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    // TODO: Remove this fallback when canvas/docs rendering fully supports RTL.
    // Keep canvas text rendering isolated from an RTL ancestor's inherited direction.
    canvas.dir = 'ltr';
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
    if (typeof window !== 'undefined' && !window.PointerEvent && typeof navigator !== 'undefined') {
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

const GENERATE_RANDOM_KEY_DEFAULT_LENGTH = 4;

export const generateRandomKey = (
    prefix: string = 'obj',
    keyLength: number = GENERATE_RANDOM_KEY_DEFAULT_LENGTH
): string => {
    const userAgent = window.navigator.userAgent.replace(/[^a-zA-Z0-9]/g, '').split('');

    let mid = '';

    for (let i = 0; i < keyLength; i++) {
        mid += userAgent[Math.round(Math.random() * (userAgent.length - 1))];
    }

    const time = new Date().getTime();

    return `${prefix}_${mid}_${time}`;
};

export function getValueType(value: unknown): string {
    return Object.prototype.toString.apply(value);
}

export function isFunction(value?: unknown): value is boolean {
    return getValueType(value) === '[object Function]';
}

export function isDate(value?: Date): value is Date {
    return getValueType(value) === '[object Date]';
}

export function isRegExp(value?: unknown): value is RegExp {
    return getValueType(value) === '[object RegExp]';
}

export function isArray<T>(value?: unknown): value is T[] {
    return getValueType(value) === '[object Array]';
}

export function isString(value?: unknown): value is string {
    return getValueType(value) === '[object String]';
}

export function isNumber(value?: unknown): value is number {
    return getValueType(value) === '[object Number]';
}

export function isObject(value?: unknown): value is object {
    return getValueType(value) === '[object Object]';
}

export function precisionTo(num: number, accurate: number) {
    accurate = 10 ** accurate;
    return Math.round(num * accurate) / accurate;
}

/**
 * When drawing lines, it is necessary to align their precision.
 * performance testing
 * var time = performance.now(); for(let i=0;i<100000000;i++){ fixLineWidthByScale(i, 0.666); }; console.log(performance.now()-time);
 */
export function fixLineWidthByScale(num: number, scale: number) {
    return Math.round(num * scale) / scale;
}

export function getFontStyleString(
    textStyle?: Nullable<IStyleBase>
): IDocumentSkeletonFontStyle {
    const defaultFont = DEFAULT_STYLES.ff;

    const defaultFontSize = DEFAULT_STYLES.fs;

    if (!textStyle) {
        const fontString = `${defaultFontSize}pt  ${defaultFont}`;

        return {
            fontCache: fontString,
            fontString,
            fontSize: defaultFontSize,
            originFontSize: defaultFontSize,
            fontFamily: defaultFont,
        };
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
    let originFontSize = defaultFontSize;
    if (textStyle.fs) {
        originFontSize = textStyle.fs;
    }
    let fontSize = originFontSize;

    const fontFamilyResult = normalizeFontFamily(textStyle.ff, defaultFont);

    const { va: baselineOffset } = textStyle;

    if (
        baselineOffset === BaselineOffset.SUBSCRIPT ||
        baselineOffset === BaselineOffset.SUPERSCRIPT
    ) {
        const baselineOffsetInfo = FontCache.getBaselineOffsetInfo(fontFamilyResult, fontSize);
        const { sbr, spr } = baselineOffsetInfo;

        fontSize *= baselineOffset === BaselineOffset.SUBSCRIPT ? sbr : spr;
    }

    const fontStringPure = `${italic} ${bold} ${fontSize}pt ${fontFamilyResult}`;

    const fontString = `${fontStringPure}, ${DEFAULT_FONTFACE_PLANE} `;

    return {
        fontCache: fontStringPure,
        fontString,
        fontSize,
        originFontSize,
        fontFamily: fontFamilyResult,
    };
}

function normalizeFontFamily(fontFamily: Nullable<string>, defaultFont: string): string {
    if (!fontFamily?.trim()) {
        return defaultFont;
    }

    return fontFamily
        .split(',')
        .map((item) => {
            const family = item.trim().replace(/^['"]|['"]$/g, '');
            return family.includes(' ') ? `"${family}"` : family;
        })
        .filter(Boolean)
        .join(', ');
}

export function hasAllLatin(text: string) {
    const pattern = /[\u0000-\u024F]/gi;
    if (!pattern.exec(text)) {
        return false;
    }
    return true;
}

export function hasBasicLatin(text: string) {
    const pattern = /[\u0000-\u007F]/gi;
    if (!pattern.exec(text)) {
        return false;
    }
    return true;
}

export function hasLatinOneSupplement(text: string) {
    const pattern = /[\u0080-\u00FF]/gi;
    if (!pattern.exec(text)) {
        return false;
    }
    return true;
}

export function hasLatinExtendedA(text: string) {
    const pattern = /[\u0100-\u017F]/gi;
    if (!pattern.exec(text)) {
        return false;
    }
    return true;
}

export function hasLatinExtendedB(text: string) {
    const pattern = /[\u0180-\u024F]/gi;
    if (!pattern.exec(text)) {
        return false;
    }
    return true;
}

// Emoji check logic
const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

export function getFirstGrapheme(text: string): string | null {
    const it = segmenter.segment(text)[Symbol.iterator]();
    return it.next().value?.segment ?? null;
}

export function isEmojiGrapheme(grapheme: string): boolean {
    // emoji + ZWJ + skin tone
    if (/\p{Extended_Pictographic}/u.test(grapheme)) {
        return true;
    }

    // flag 🇸🇬
    if (/^\p{Regional_Indicator}{2}$/u.test(grapheme)) {
        return true;
    }

    // keycap 1️⃣ #️⃣ *️⃣
    if (/^[0-9#*]\uFE0F?\u20E3$/u.test(grapheme)) {
        return true;
    }

    return false;
}

export function startWithEmoji(text: string): boolean {
    const first = getFirstGrapheme(text);
    return first ? isEmojiGrapheme(first) : false;
}

export function hasArabic(text: string) {
    const pattern = /[\u0600-\u06FF]|[\u0750-\u0750]|[\u0870-\u08FF]|[\uFB50-\uFDFF]|[\uFE70-\uFEFF]/gi;

    return pattern.test(text);
}

export function hasTibetan(text: string) {
    const pattern = /[\u0180-\u024F]/gi;

    return pattern.test(text);
}

export function hasThai(text: string) {
    const pattern = /[\u0E00-\u0E7F]/;

    return pattern.test(text);
}

export function hasSpace(text: string) {
    const pattern = /\s+/g;

    return pattern.test(text);
}

// See <https://www.w3.org/TR/clreq/#punctuation_width_adjustment>
export function isCjkLeftAlignedPunctuation(text: string) {
    const LEFT_ALIGNED_PUNCTUATION = ['”', '’', '，', '。', '．', '、', '：', '；', '？', '！', '》', '）', '』', '」', '】', '〗', '〕', '〉', '］', '｝'];

    return LEFT_ALIGNED_PUNCTUATION.indexOf(text) > -1;
}

// See <https://www.w3.org/TR/clreq/#punctuation_width_adjustment>
export function isCjkRightAlignedPunctuation(text: string) {
    const RIGHT_ALIGNED_PUNCTUATION = ['“', '‘', '《', '（', '『', '「', '【', '〖', '〔', '〈', '［', '｛'];

    return RIGHT_ALIGNED_PUNCTUATION.indexOf(text) > -1;
}

// See <https://www.w3.org/TR/clreq/#punctuation_width_adjustment>
export function isCjkCenterAlignedPunctuation(text: string) {
    // U+30FB: Katakana Middle Dot
    // U+00B7: Middle Dot
    const CENTER_ALIGNED_PUNCTUATION = ['\u{30FB}', '\u{00B7}'];

    return CENTER_ALIGNED_PUNCTUATION.indexOf(text) > -1;
}

const one_thousand = 1000;

// Return screen DPI
let dpi_cache: Nullable<number>;
export function getDPI() {
    if (dpi_cache) {
        return dpi_cache;
    }
    let i = 56;
    for (; i < one_thousand * 2; i++) {
        if (matchMedia(`(max-resolution: ${i}dpi)`).matches === true) {
            return i;
        }
    }
    dpi_cache = i;
    setTimeout(() => {
        dpi_cache = null;
    }, one_thousand);
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

export function getCellPositionByIndex(
    row: number,
    column: number,
    rowHeightAccumulation: number[],
    columnWidthAccumulation: number[]
): IPosition {
    const startRow = row - 1;
    const startColumn = column - 1;

    const startY = rowHeightAccumulation[startRow] || 0;
    let endY = rowHeightAccumulation[row];

    if (endY == null) {
        endY = rowHeightAccumulation[rowHeightAccumulation.length - 1];
    }

    const startX = columnWidthAccumulation[startColumn] || 0;
    let endX = columnWidthAccumulation[column];

    if (endX == null) {
        endX = columnWidthAccumulation[columnWidthAccumulation.length - 1];
    }

    return {
        startY,
        endY,
        startX,
        endX,
    };
}

/**
 * @deprecated use same function in @univerjs/core
 * @description Get the cell position information of the specified row and column, including the position information of the cell and the merge information of the cell
 * @param {number} row The row index of the cell
 * @param {number} column The column index of the cell
 * @param {number[]} rowHeightAccumulation The accumulated height of each row
 * @param {number[]} columnWidthAccumulation The accumulated width of each column
 * @param {ICellInfo} mergeDataInfo The merge information of the cell
 * @returns {ICellWithCoord} The cell position information of the specified row and column, including the position information of the cell and the merge information of the cell
 */
function getCellWithCoordByIndexCore(
    row: number,
    column: number,
    rowHeightAccumulation: number[],
    columnWidthAccumulation: number[],
    mergeDataInfo: ICellInfo
): ICellWithCoord {
    row = Tools.clamp(row, 0, rowHeightAccumulation.length - 1);
    column = Tools.clamp(column, 0, columnWidthAccumulation.length - 1);
    // eslint-disable-next-line prefer-const
    let { startY, endY, startX, endX } = getCellPositionByIndex(
        row,
        column,
        rowHeightAccumulation,
        columnWidthAccumulation
    );

    const { isMerged, isMergedMainCell, startRow, startColumn, endRow, endColumn } = mergeDataInfo;

    let mergeInfo = {
        startRow,
        startColumn,
        endRow,
        endColumn,

        startY: 0,
        endY: 0,
        startX: 0,
        endX: 0,
    };

    const rowAccumulationCount = rowHeightAccumulation.length - 1;
    const columnAccumulationCount = columnWidthAccumulation.length - 1;

    if (isMerged && startRow !== -1 && startColumn !== -1) {
        const mergeStartY = rowHeightAccumulation[startRow - 1] || 0;
        const mergeEndY = rowHeightAccumulation[endRow] || rowHeightAccumulation[rowAccumulationCount];

        const mergeStartX = columnWidthAccumulation[startColumn - 1] || 0;
        const mergeEndX = columnWidthAccumulation[endColumn] || columnWidthAccumulation[columnAccumulationCount];
        mergeInfo = {
            ...mergeInfo,
            startY: mergeStartY,
            endY: mergeEndY,
            startX: mergeStartX,
            endX: mergeEndX,
        };
    } else if (!isMerged && endRow !== -1 && endColumn !== -1) {
        const mergeEndY = rowHeightAccumulation[endRow] || rowHeightAccumulation[rowAccumulationCount];
        const mergeEndX = columnWidthAccumulation[endColumn] || columnWidthAccumulation[columnAccumulationCount];

        mergeInfo = {
            ...mergeInfo,
            startY,
            endY: mergeEndY,
            startX,
            endX: mergeEndX,
        };
    }

    return {
        isMerged,
        isMergedMainCell,
        actualRow: row,
        actualColumn: column,
        startY,
        endY,
        startX,
        endX,
        mergeInfo,
    };
}

/**
 * @deprecated please use getCellWithCoordByIndexCore in @univerjs/core instead
 */
const getCellByIndexWithMergeInfo = getCellWithCoordByIndexCore;
export { getCellByIndexWithMergeInfo };

/**
 * Determine whether there are any cells in a row that are not in the merged cells, mainly used for the calculation of auto height
 * @deprecated please use SpreadsheetSkeleton@_hasUnMergedCellInRow
 */
export function hasUnMergedCellInRow(
    row: number,
    startColumn: number,
    endColumn: number,
    mergeData: IRange[]
): boolean {
    // In the selection area, if a cell is not in the merged cell, the automatic height of the row needs to be calculated.
    let hasUnMergedCell = false;
    for (let colIndex = startColumn; colIndex <= endColumn; colIndex++) {
        const { isMerged, isMergedMainCell } = getCellInfoInMergeData(row, colIndex, mergeData);

        if (!isMerged && !isMergedMainCell) {
            hasUnMergedCell = true;
            break;
        }
    }

    return hasUnMergedCell;
}

export function mergeInfoOffset(mergeInfo: IRangeWithCoord, offsetX: number, offsetY: number) {
    return {
        ...mergeInfo,
        startY: mergeInfo.startY + offsetY,
        endY: mergeInfo.endY + offsetY,
        startX: mergeInfo.startX + offsetX,
        endX: mergeInfo.endX + offsetX,
    };
}

export function isRectIntersect(rect1: IBoundRectNoAngle, rect2: IBoundRectNoAngle) {
    return !(
        rect1.left > rect2.right ||
        rect1.top > rect2.bottom ||
        rect2.left > rect1.right ||
        rect2.top > rect1.bottom
    );
}

export function injectStyle(styles: string[]) {
    const styleElement = document.createElement('style');

    document.head.appendChild(styleElement);

    const styleSheet = styleElement.sheet;

    for (const style of styles) {
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

/**
 *1 pixel * 0.75 = 1 pt
 */
const PX_TO_PT_RATIO = 0.75;

export function ptToPixel(pt: number) {
    return pt / PX_TO_PT_RATIO;
}

export function pixelToPt(px: number) {
    return px * PX_TO_PT_RATIO;
}

/**
 * Is cell in view ranges.
 * @param ranges
 * @param rowIndex
 * @param colIndex
 * @returns boolean
 */
export function inViewRanges(ranges: IRange[], rowIndex: number, colIndex: number): boolean {
    for (const range of ranges) {
        if (rowIndex >= range.startRow && rowIndex <= range.endRow &&
            colIndex >= range.startColumn && colIndex <= range.endColumn) {
            return true;
        }
    }
    return false;
}

/**
 * If there is an intersection in ranges to the mainRanges, extend it to the first set of ranges.
 * @param {IRange[]} mainRanges target ranges
 * @param {IRange[]} ranges
 */
export function expandRangeIfIntersects(mainRanges: IRange[], ranges: IRange[]) {
    const intersects = [];
    for (const mainRange of mainRanges) {
        for (const range of ranges) {
            if (Rectangle.simpleRangesIntersect(mainRange, range)) {
                intersects.push(range);
            }
        }
    }
    return mainRanges.concat(intersects); // do not use [...mainRanges, ...intersects], because concat is slightly faster than spread
}

export function clampRange(range: IRange, maxRow: number, maxColumn: number) {
    return {
        startRow: Tools.clamp(range.startRow, 0, maxRow),
        endRow: Tools.clamp(range.endRow, 0, maxRow),
        startColumn: Tools.clamp(range.startColumn, 0, maxColumn),
        endColumn: Tools.clamp(range.endColumn, 0, maxColumn),
    };
}

/**
 * Get system highlight color in rgb format.
 */
export function getSystemHighlightColor() {
    const hiddenEle = document.createElement('div');
    hiddenEle.style.width = '0';
    hiddenEle.style.height = '0';
    hiddenEle.style.backgroundColor = 'highlight';
    document.body.append(hiddenEle);

    const highlightColor = getComputedStyle(hiddenEle).backgroundColor;

    hiddenEle.remove();

    const colorParser = new ColorKit(highlightColor);

    return colorParser.toRgb();
}
