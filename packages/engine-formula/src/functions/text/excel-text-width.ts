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

import { getRegionLocale } from '@univerjs/core';

const KATAKANA = '。「」、・ヲァィゥェォャュョッーアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン\u3099\u309A';
const CURRENCY_AND_SIGNS = '¢£¬¯¦¥₩';
const HANGUL_LEADS = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const HANGUL_FINAL_CLUSTERS = new Map([
    ['ㄳ', 3],
    ['ㄵ', 5],
    ['ㄶ', 6],
    ['ㄺ', 9],
    ['ㄻ', 10],
    ['ㄼ', 11],
    ['ㄽ', 12],
    ['ㄾ', 13],
    ['ㄿ', 14],
    ['ㅀ', 15],
    ['ㅄ', 18],
]);

// Unicode width pairs for Korean compatibility jamo, with gaps in the halfwidth block.
const HANGUL_WIDTH_RANGES = [
    [0xFFA1, 0xFFBE, 0x3131],
    [0xFFC2, 0xFFC7, 0x314F],
    [0xFFCA, 0xFFCF, 0x3155],
    [0xFFD2, 0xFFD7, 0x315B],
    [0xFFDA, 0xFFDC, 0x3161],
] as const;
const HALF_TO_FULL = new Map<string, string>([
    [' ', '\u3000'],
    ['\uFFA0', '\u3164'],
    ...Array.from(KATAKANA, (character, index): [string, string] => [String.fromCharCode(0xFF61 + index), character]),
    ...Array.from(CURRENCY_AND_SIGNS, (character, index): [string, string] => [character, String.fromCharCode(0xFFE0 + index)]),
]);
for (const [start, end, wide] of HANGUL_WIDTH_RANGES) {
    for (let half = start; half <= end; half++) {
        HALF_TO_FULL.set(String.fromCharCode(half), String.fromCharCode(wide + half - start));
    }
}
const FULL_TO_HALF = new Map(Array.from(HALF_TO_FULL, ([half, full]) => [full, half]));
for (let ascii = 0x21; ascii <= 0x7E; ascii++) {
    // The Windows width conversion preserves both backslash forms.
    if (ascii === 0x5C) continue;
    const half = String.fromCharCode(ascii);
    const full = String.fromCharCode(ascii + 0xFEE0);
    HALF_TO_FULL.set(half, full);
    FULL_TO_HALF.set(full, half);
}
HALF_TO_FULL.set('\u309B', '\u3099');
HALF_TO_FULL.set('\u309C', '\u309A');
FULL_TO_HALF.set('\u309B', '\uFF9E');
FULL_TO_HALF.set('\u309C', '\uFF9F');

export function usesEastAsianCharacterWidth(region: string | undefined): boolean {
    const locale = region && getRegionLocale(region);
    if (!locale) return false;
    if (locale.language === 'zh') return locale.region === 'CN' || locale.region === 'TW' || locale.region === 'HK';
    return (locale.language === 'ja' && locale.region === 'JP') || (locale.language === 'ko' && locale.region === 'KR');
}

export function toHalfWidth(text: string): string {
    let result = '';
    for (const character of text) {
        const half = FULL_TO_HALF.get(character);
        if (half !== undefined) {
            result += half;
        } else if (character >= '\u30A0' && character <= '\u30FF') {
            const [base, mark] = character.normalize('NFD');
            const halfMark = mark && FULL_TO_HALF.get(mark);
            result += halfMark ? (FULL_TO_HALF.get(base) ?? base) + halfMark : character;
        } else {
            result += character;
        }
    }
    return result;
}

export function toFullWidth(text: string): string {
    const characters = Array.from(text, (character) => HALF_TO_FULL.get(character) ?? character);
    let result = '';
    for (let index = 0; index < characters.length; index++) {
        let character = characters[index];
        const next = characters[index + 1];
        const syllable = next === undefined ? undefined : composeHangul(character, next, characters[index + 2]);
        if (syllable) {
            character = syllable.character;
            index += syllable.consumed;
        }
        // Compose only adjacent combining marks. Normalizing whole strings would alter
        // unrelated compatibility characters and canonical singleton mappings.
        while (characters[index + 1] !== undefined && /\p{M}/u.test(characters[index + 1])) {
            const half = character >= '\uFF01' && character <= '\uFF5E' ? FULL_TO_HALF.get(character) : undefined;
            const combined = ((half ?? character) + characters[index + 1]).normalize('NFC');
            if (Array.from(combined).length !== 1) break;
            character = combined;
            index++;
        }
        result += character;
    }
    return result;
}

function composeHangul(lead: string, vowel: string, tail?: string): { character: string; consumed: number } | undefined {
    const vowelCode = vowel.charCodeAt(0);
    const vowelIndex = vowelCode >= 0x314F && vowelCode <= 0x3163 ? vowelCode - 0x314F : vowelCode - 0x1161;
    if (vowelIndex < 0 || vowelIndex >= 21) return undefined;
    const leadIndex = lead >= '\u1100' && lead <= '\u1112' ? lead.charCodeAt(0) - 0x1100 : HANGUL_LEADS.indexOf(lead);
    if (leadIndex < 0) return undefined;
    const tailIndex = tail && tail >= '\u11A8' && tail <= '\u11C2' ? tail.charCodeAt(0) - 0x11A7 : (HANGUL_FINAL_CLUSTERS.get(tail ?? '') ?? 0);
    return {
        character: String.fromCharCode(0xAC00 + (leadIndex * 21 + vowelIndex) * 28 + tailIndex),
        consumed: tailIndex ? 2 : 1,
    };
}
