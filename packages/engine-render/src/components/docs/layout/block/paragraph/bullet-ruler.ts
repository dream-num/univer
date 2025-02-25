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

import { ListGlyphType, numberToListABC } from '@univerjs/core';

export function getBulletOrderedSymbol(startIndex: number, startNumber: number, glyphType: ListGlyphType | string) {
    // if (!(glyphType in GlyphType)) {
    //     return dealWidthCustomBulletOrderedSymbol(startIndex, startNumber, glyphType as string); // 插件定义更多类型的bullet
    // }

    return generateOrderedSymbol(startIndex, startNumber, glyphType as ListGlyphType);
}

function generateOrderedSymbol(startIndex: number, startNumber: number, glyphType: ListGlyphType) {
    // startIndex从0开始，startNumber为用户输入默认是1
    if (glyphType === ListGlyphType.DECIMAL) {
        return decimal(startIndex, startNumber);
    }
    if (glyphType === ListGlyphType.DECIMAL_ZERO) {
        return zeroDecimal(startIndex, startNumber);
    }
    if (glyphType === ListGlyphType.UPPER_LETTER) {
        return upperAlpha(startIndex, startNumber);
    }
    if (glyphType === ListGlyphType.LOWER_LETTER) {
        return alpha(startIndex, startNumber);
    }
    if (glyphType === ListGlyphType.UPPER_ROMAN) {
        return upperRoman(startIndex, startNumber);
    }
    if (glyphType === ListGlyphType.LOWER_ROMAN) {
        return roman(startIndex, startNumber);
    }

    return decimal(startIndex, startNumber);
}

// A number, like 1, 2, or 3.
function decimal(startIndex: number, startNumber: number) {
    const currentIndex = startIndex + startNumber;
    return currentIndex.toString();
}

// A number where single digit numbers are prefixed with a zero, like 01, 02, or 03. Numbers with more than one digit are not prefixed with a zero.
function zeroDecimal(startIndex: number, startNumber: number) {
    const currentIndex = startIndex + startNumber;

    if (currentIndex < 10) {
        return `0${currentIndex}`;
    }
    return currentIndex.toString();
}

// An uppercase letter, like A, B, or C.
function upperAlpha(startIndex: number, startNumber: number) {
    return numberToListABC(startIndex + startNumber - 1, true);
}

// A lowercase letter, like a, b, or c.
function alpha(startIndex: number, startNumber: number) {
    return numberToListABC(startIndex + startNumber - 1, false);
}

// An uppercase Roman numeral, like I, II, or III.
function upperRoman(startIndex: number, startNumber: number) {
    return _convertRoman(startIndex + startNumber, true);
}

// A lowercase Roman numeral, like i, ii, or iii.
function roman(startIndex: number, startNumber: number) {
    return _convertRoman(startIndex + startNumber, false);
}

function _convertRoman(num: number, uppercase = false) {
    const upperLookup = {
        M: 1000,
        CM: 900,
        D: 500,
        CD: 400,
        C: 100,
        XC: 90,
        L: 50,
        XL: 40,
        X: 10,
        IX: 9,
        V: 5,
        IV: 4,
        I: 1,
    };
    const lowerLookup = {
        m: 1000,
        cm: 900,
        d: 500,
        cd: 400,
        c: 100,
        xc: 90,
        l: 50,
        xl: 40,
        x: 10,
        ix: 9,
        v: 5,
        iv: 4,
        i: 1,
    };
    let lookup: { [key: string]: number } = lowerLookup;
    if (uppercase) {
        lookup = upperLookup;
    }
    let romanStr = '';
    for (const i in lookup) {
        while (num >= lookup[i]) {
            romanStr += i;
            num -= lookup[i];
        }
    }
    return romanStr;
}
