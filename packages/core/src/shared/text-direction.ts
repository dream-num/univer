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
 * Detect whether a piece of text "feels" right-to-left, following the
 * Unicode bidi P2/P3 rules ("first strong character").
 *
 * Spreadsheets (Excel / Google Sheets / Numbers) all auto-flip the
 * alignment of a cell whose content starts with an RTL character even
 * when no explicit text direction is configured. This helper centralises
 * that decision so it stays consistent across:
 *
 *  - the canvas sheet renderer (cell display),
 *  - the cell editor (alignment + container `dir`),
 *  - the hidden contenteditable used to capture IME input.
 *
 * Only "strong" RTL ranges count; whitespace, punctuation, digits and
 * neutral characters are skipped. If no strong character is found we
 * default to LTR.
 *
 * RTL ranges considered (covers Hebrew, Arabic, Syriac, NKo, Thaana,
 * Samaritan, Mandaic, Arabic Supplement, plus the presentation forms):
 *  - U+0590..U+08FF
 *  - U+FB1D..U+FDFF
 *  - U+FE70..U+FEFF
 *
 * @param text The text to inspect. Empty / nullish inputs return `false`.
 * @returns `true` when the first strong character is RTL.
 */
export function isFirstStrongCharRTL(text: string | null | undefined): boolean {
    if (!text) {
        return false;
    }

    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);

        // Strong LTR: basic Latin letters, extended Latin, Greek, Cyrillic,
        // Han, Hangul, Hiragana, Katakana, … (everything up to U+0590).
        // We treat the first letter in this range as strong LTR and stop.
        const isLatinUpper = code >= 0x0041 && code <= 0x005A;
        const isLatinLower = code >= 0x0061 && code <= 0x007A;
        if (isLatinUpper || isLatinLower) {
            return false;
        }

        // Strong RTL ranges.
        if (code >= 0x0590 && code <= 0x08FF) return true;
        if (code >= 0xFB1D && code <= 0xFDFF) return true;
        if (code >= 0xFE70 && code <= 0xFEFF) return true;

        // CJK / Kana / Hangul ranges - strong LTR per the bidi spec.
        if (code >= 0x3040 && code <= 0x9FFF) return false;
        if (code >= 0xAC00 && code <= 0xD7AF) return false;
        if (code >= 0xF900 && code <= 0xFAFF) return false;
    }

    return false;
}

/**
 * Lightweight test for "does this text contain any RTL character?".
 * Useful for fast-paths that only care whether bidi processing might
 * matter at all (e.g. avoid running the bidi algorithm on pure-ASCII).
 */
export function hasRTLCharacter(text: string | null | undefined): boolean {
    if (!text) return false;
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code >= 0x0590 && code <= 0x08FF) return true;
        if (code >= 0xFB1D && code <= 0xFDFF) return true;
        if (code >= 0xFE70 && code <= 0xFEFF) return true;
    }
    return false;
}
