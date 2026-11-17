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

/**
 * A code point in the surrogate block is half of a UTF-16 pair, not a character.
 */
export function isSurrogateCodePoint(codePoint: number) {
    return codePoint >= 0xD800 && codePoint <= 0xDFFF;
}

/**
 * U+FDD0-U+FDEF and the last two code points of every plane (xFFFE, xFFFF).
 */
export function isNonCharacterCodePoint(codePoint: number) {
    return (codePoint >= 0xFDD0 && codePoint <= 0xFDEF) || (codePoint & 0xFFFF) >= 0xFFFE;
}

/**
 * excel logic is cofusing, so we use google sheet logic
 *
 * @param text
 * @returns number
 */
export function charLenByte(text: string): number {
    let byteCount = 0;

    for (let i = 0; i < text.length; i++) {
        byteCount += getCharLenByteInText(text, i);
    }

    return byteCount;
}

export function getCharLenByteInText(text: string, charIndex: number, direction: 'ltr' | 'rtl' = 'ltr'): number {
    const codePoint = getCodePoint(text, charIndex, direction);
    return codePoint > 255 ? 2 : 1;
}

/**
 * Whether the code unit at `index` and the one after it form a surrogate pair, which
 * together make up one character.
 */
export function isSurrogatePairAt(text: string, index: number): boolean {
    const high = text.charCodeAt(index);
    const low = text.charCodeAt(index + 1);

    return high >= 0xD800 && high <= 0xDBFF && low >= 0xDC00 && low <= 0xDFFF;
}

/**
 * Upper-cases text for a case-insensitive search without changing its length, so an
 * index in the result is also the index in the original text. A character whose upper
 * case is longer, such as ß becoming SS, is left as it is. The host locale is ignored,
 * as it is for the wildcard comparisons in `compare.ts`.
 */
export function upperCaseKeepingPositions(text: string): string {
    const upperCase = text.toUpperCase();

    if (upperCase.length === text.length) {
        return upperCase;
    }

    let result = '';

    for (const char of text) {
        const upperChar = char.toUpperCase();
        result += upperChar.length === char.length ? upperChar : char;
    }

    return result;
}

function highSurrogate(charCode: number): boolean {
    return charCode >= 0xD800 && charCode <= 0xDBFF;
}

function lowSurrogate(charCode: number): boolean {
    return charCode >= 0xDC00 && charCode <= 0xDFFF;
}

function surrogatePair(highSurrogate: number, lowSurrogate: number): number {
    const highBits = (highSurrogate & 0x3FF) << 10;
    const lowBits = lowSurrogate & 0x3FF;
    return highBits + lowBits + 0x10000;
}

function getCodePoint(str: string, index: number, direction: 'ltr' | 'rtl' = 'ltr'): number {
    const charCode = str.charCodeAt(index);

    if (direction === 'ltr' && highSurrogate(charCode) && index + 1 < str.length) {
        const nextCharCode = str.charCodeAt(index + 1);

        if (lowSurrogate(nextCharCode)) {
            return surrogatePair(charCode, nextCharCode);
        }
    }

    if (direction === 'rtl' && lowSurrogate(charCode) && index - 1 >= 0) {
        const prevCharCode = str.charCodeAt(index - 1);

        if (highSurrogate(prevCharCode)) {
            return surrogatePair(prevCharCode, charCode);
        }
    }

    return charCode;
}
