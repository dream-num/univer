/**
 * Copyright 2023-present DreamNum Inc.
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
 * Korean in Excel does not count as two characters. Here we calculate all Chinese, Japanese and Korean characters as two characters.
 *
 * ā -> 1
 * ー -> 2
 *
 * @param str
 * @returns
 */
export function charLenByte(str: string) {
    let byteCount = 0;

    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);

        if (
            (charCode >= 0x3040 && charCode <= 0x30FF) || // Japanese hiragana and katakana
            (charCode >= 0x4E00 && charCode <= 0x9FFF) || // Chinese (simplified and traditional)
            (charCode >= 0xAC00 && charCode <= 0xD7AF) // Korean language
        ) {
            byteCount += 2;
        } else {
            byteCount += 1;
        }
    }

    return byteCount;
}
