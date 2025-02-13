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
