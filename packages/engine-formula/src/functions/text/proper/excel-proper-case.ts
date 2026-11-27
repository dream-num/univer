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

import { TEXT_DELIMITER_CASE_RANGES, TEXT_DELIMITER_WORD_ENDS } from '../excel-text-delimiter';
import { WORD_INTERIOR_OVERRIDES, WORD_LETTERS, WORD_START_MAPPINGS } from './excel-proper-data';

function findRange<T extends readonly [number, number, ...number[]]>(ranges: readonly T[], code: number): T | undefined {
    let left = 0;
    let right = ranges.length;
    while (left < right) {
        const middle = (left + right) >>> 1;
        if (ranges[middle][1] < code) {
            left = middle + 1;
        } else {
            right = middle;
        }
    }
    const range = ranges[left];
    return range && range[0] <= code ? range : undefined;
}

function mapCode(ranges: readonly (readonly [number, number, number, number])[], code: number): number | undefined {
    const range = findRange(ranges, code);
    return range && (code - range[0]) % range[2] === 0 ? code + range[3] : undefined;
}

export function excelProperCase(text: string): string {
    let result = '';
    let startsWord = true;
    for (let index = 0; index < text.length; index++) {
        const code = text.charCodeAt(index);
        if (code < 0x80) {
            const folded = code | 0x20;
            const letter = folded >= 0x61 && folded <= 0x7A;
            result += String.fromCharCode(letter ? (startsWord ? folded - 0x20 : folded) : code);
            startsWord = !letter;
            continue;
        }
        // At a word interior, Excel selects the sigma form using the next UTF-16 unit.
        if (code === 0x03A3 && !startsWord) {
            const next = text[index + 1];
            result += next == null || next === '\0' || TEXT_DELIMITER_WORD_ENDS.includes(next) ? 'ς' : 'σ';
        } else {
            const mapped = startsWord
                ? mapCode(WORD_START_MAPPINGS, code)
                : mapCode(WORD_INTERIOR_OVERRIDES, code) ?? mapCode(TEXT_DELIMITER_CASE_RANGES, code);
            result += String.fromCharCode(mapped ?? code);
        }
        startsWord = findRange(WORD_LETTERS, code) == null;
    }
    return result;
}
