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

import { SORT_WEIGHTS } from './sort-weights';

interface ISortWeights {
    characters: Uint32Array;
    expansions: number[][];
    jamo: number[][];
}

interface ISortKey {
    value: string;
    jamo?: number[];
}

let weights: ISortWeights | undefined;

function getWeights(): ISortWeights {
    if (weights) return weights;
    const bytes = atob(SORT_WEIGHTS);
    let cursor = 0;
    const read = () => {
        let value = 0;
        let shift = 0;
        let byte: number;
        do {
            byte = bytes.charCodeAt(cursor++);
            value |= (byte & 127) << shift;
            shift += 7;
        } while (byte & 128);
        return value >>> 0;
    };
    const characters = new Uint32Array(65536);
    let previous = 0;
    for (let index = 0; index < characters.length;) {
        const delta = read();
        if (delta) {
            characters[index++] = previous ^= delta;
        } else {
            const end = index + read();
            characters.fill(previous, index, end);
            index = end;
        }
    }
    const expansions = Array.from({ length: read() }, () => Array.from({ length: read() }, read));
    const jamo = Array.from({ length: 357 }, () => Array.from({ length: 5 }, () => bytes.charCodeAt(cursor++)));
    weights = { characters, expansions, jamo };
    return weights;
}

function trim(values: number[], minimum: number, exact = false): number[] {
    while (values.length && (exact ? values[values.length - 1] === minimum : values[values.length - 1] <= minimum)) values.pop();
    return values;
}

function jamoIndex(code: number): number {
    if (code >= 0x1100 && code <= 0x11FF) return code - 0x1100;
    if (code >= 0xA960 && code <= 0xA97C) return 256 + code - 0xA960;
    if (code >= 0xD7B0 && code <= 0xD7C6) return 285 + code - 0xD7B0;
    if (code >= 0xD7CB && code <= 0xD7FB) return 308 + code - 0xD7CB;
    return -1;
}

function jamoClass(code: number): number {
    if ((code >= 0x1100 && code <= 0x115F) || (code >= 0xA960 && code <= 0xA97C)) return 0;
    if ((code >= 0x1160 && code <= 0x11A7) || (code >= 0xD7B0 && code <= 0xD7C6)) return 1;
    return jamoIndex(code) >= 0 ? 2 : -1;
}

function appendJamo(text: string, start: number, data: ISortWeights, primary: number[]): number {
    const collect = (reset: boolean) => {
        let end = start;
        let old = false;
        let filler = false;
        const indices = [0, 0, 0];
        const extra = [0, 0, 2];
        for (let kind = 0; kind < 3; kind++) {
            let code = text.charCodeAt(end);
            if (jamoClass(code) === kind && !(reset && kind > 0)) end++;
            else if (kind < 2) code = kind === 0 ? 0x115F : 0x1160;
            else continue;
            const record = data.jamo[jamoIndex(code)];
            old ||= !!record[0];
            filler ||= code === 0x115F || code === 0x1160;
            for (let index = 0; index < 3; index++) indices[index] = Math.max(indices[index], record[index + 1]);
            extra[kind] = record[4];
        }
        return { end, old, filler, indices, extra };
    };
    let result = collect(false);
    // Modern decomposed Hangul does not use the old-Hangul composition branch.
    if (!result.old) result = collect(true);
    const { end, filler, indices, extra } = result;
    const code = 0xAC00 + (indices[0] * 21 + indices[1]) * 28 + indices[2] - Number(filler);
    const base = code < 0xAC00 ? data.characters[0xAC00] - 256 : data.characters[code];
    primary.push((base >>> 16) & 255, (base >>> 8) & 255, 255, extra[0] + (filler ? 128 : 0), 255, extra[1], 255, extra[2]);
    return end;
}

function getSortKey(text: string): ISortKey {
    const data = getWeights();
    const primary: number[] = [];
    const diacritics: number[] = [];
    const cases: number[] = [];
    const special: number[] = [];
    const extra: number[][] = [[], [], [], []];
    let jamo: number[] | undefined;
    let previous: number | undefined;
    for (let index = 0; index < text.length; index++) {
        const weight = data.characters[text.charCodeAt(index)];
        const script = (weight >>> 16) & 255;
        const alphabetic = (weight >>> 8) & 255;
        const diacritic = weight & 255;
        const casing = weight >>> 24;
        if (!script) continue;
        if (script === 1) {
            if (diacritics.length) diacritics[diacritics.length - 1] = (diacritics[diacritics.length - 1] + diacritic) & 255;
            else diacritics.push(diacritic);
            continue;
        }
        if (script === 2) {
            // CompareStringEx processes expansion marks and kana; LCMapStringEx's raw keys differ.
            for (const expanded of data.expansions[weight & 65535]) {
                const expandedScript = (expanded >>> 16) & 255;
                const expandedDiacritic = expanded & 255;
                const expandedCase = expanded >>> 24;
                if (!expandedScript) continue;
                if (expandedScript === 1) {
                    if (diacritics.length) diacritics[diacritics.length - 1] = (diacritics[diacritics.length - 1] + expandedDiacritic) & 255;
                    else diacritics.push(expandedDiacritic);
                    continue;
                }
                primary.push(expandedScript === 3 ? 34 : expandedScript, (expanded >>> 8) & 255);
                diacritics.push(expandedDiacritic);
                cases.push(expandedScript === 3 ? 2 : expandedCase);
                if (expandedScript === 3) {
                    extra[0].push(0xC4 | (expandedCase & 2));
                    extra[1].push(3);
                    extra[2].push(0xC4 | (expandedCase & 32));
                    extra[3].push(0xC4 | (expandedCase & 1));
                }
            }
        } else if (script === 3) {
            let key = alphabetic;
            let small = casing & 2;
            let kind = 3;
            let kana = casing & 32;
            let width = casing & 1;
            if (alphabetic <= 1) {
                const precedingScript = previous === undefined ? 0 : (previous >>> 16) & 255;
                if (!precedingScript || precedingScript === 2) {
                    primary.push(255, 255);
                } else if (precedingScript !== 3) {
                    primary.push(precedingScript, (previous! >>> 8) & 255);
                    diacritics.push(diacritic);
                    cases.push(2);
                } else {
                    key = (previous! >>> 8) & (alphabetic ? 0x87 : 255);
                    small = (previous! >>> 24) & 2;
                    kind = alphabetic ? 5 : 4;
                    kana = (previous! >>> 24) & 32;
                    if (!alphabetic) width = (previous! >>> 24) & 1;
                }
                if (precedingScript !== 3) continue;
            }
            primary.push(34, key);
            diacritics.push(diacritic);
            cases.push(2);
            extra[0].push(0xC4 | small);
            extra[1].push(kind);
            extra[2].push(0xC4 | kana);
            extra[3].push(0xC4 | width);
        } else if (script === 4) {
            (jamo ??= []).push(primary.length + 2);
            index = appendJamo(text, index, data, primary) - 1;
            diacritics.push(2);
            cases.push(2);
        } else if (script === 5) {
            primary.push(253, 255, alphabetic, diacritic);
            diacritics.push(2);
            cases.push(2);
        } else if (script === 6) {
            // Word sorting defers punctuation until after all linguistic weights.
            const position = (65535 - Math.floor(primary.length / 2)) & 65535;
            special.push(position >>> 8, position & 255, alphabetic, ((diacritic << 3) | casing) & 255);
        } else {
            primary.push(script, alphabetic);
            if (script >= 169 && script <= 175) primary.push(diacritic);
            else diacritics.push(diacritic);
            cases.push(casing);
        }
        if (script !== 3 || alphabetic > 1) previous = weight;
    }
    const key = primary.concat(1, trim(diacritics, 2), 1, trim(cases, 2), 1);
    if (extra[0].length) {
        const groups = [trim(extra[0], 0xC6, true), [255], trim(extra[1], 3, true), [2], trim(extra[2], 0xE4, true), [255], trim(extra[3], 0xC5, true), [255]];
        for (const group of groups) {
            for (const byte of group) key.push(byte);
        }
    }
    key.push(1);
    for (const byte of special) key.push(byte);
    key.push(0);
    const chunks: string[] = [];
    for (let index = 0; index < key.length; index += 8192) chunks.push(String.fromCharCode(...key.slice(index, index + 8192)));
    return { value: chunks.join(''), jamo };
}

function compareKeys(left: ISortKey, right: ISortKey): number {
    if (!left.jamo && !right.jamo) return left.value === right.value ? 0 : left.value < right.value ? -1 : 1;
    let leftIndex = 0;
    let rightIndex = 0;
    let leftExtra = 0;
    let rightExtra = 0;
    while (leftIndex < left.value.length && rightIndex < right.value.length) {
        const leftJamo = left.jamo?.[leftExtra] === leftIndex;
        const rightJamo = right.jamo?.[rightExtra] === rightIndex;
        if (leftJamo) leftExtra++;
        if (rightJamo) rightExtra++;
        // NLS compares the extra old-Hangul weights only when both sides have them.
        if (leftJamo && !rightJamo) {
            leftIndex += 6;
            continue;
        }
        if (rightJamo && !leftJamo) {
            rightIndex += 6;
            continue;
        }
        const difference = left.value.charCodeAt(leftIndex) - right.value.charCodeAt(rightIndex);
        if (difference) return difference < 0 ? -1 : 1;
        leftIndex++;
        rightIndex++;
    }
    return Number(leftIndex < left.value.length) - Number(rightIndex < right.value.length);
}

export function createSortCompare(): (left: string, right: string) => number {
    const keys = new Map<string, { ascii: string | null; linguistic?: ISortKey }>();
    const cached = (text: string) => {
        let value = keys.get(text);
        if (value === undefined) {
            value = { ascii: /[^a-z0-9]/i.test(text) ? null : text.toLowerCase() };
            keys.set(text, value);
        }
        return value;
    };
    return (left, right) => {
        if (left === right) return 0;
        const leftCached = cached(left);
        const rightCached = cached(right);
        if (leftCached.ascii !== null && rightCached.ascii !== null) {
            return leftCached.ascii === rightCached.ascii ? 0 : leftCached.ascii < rightCached.ascii ? -1 : 1;
        }
        const length = Math.min(left.length, right.length);
        let index = 0;
        for (; index < length; index++) {
            let a = left.charCodeAt(index);
            let b = right.charCodeAt(index);
            if (a > 0x7A || b > 0x7A) break;
            if (a !== b) {
                if (a > 0x60) a -= 32;
                if (b > 0x60) b -= 32;
                if (a !== b) {
                    if ((a >= 65 && a <= 90 && b >= 65 && b <= 90) || (a >= 48 && a <= 57 && b >= 48 && b <= 57)) return a < b ? -1 : 1;
                    break;
                }
            }
        }
        if (index === length) return left.length === right.length ? 0 : left.length < right.length ? -1 : 1;
        // Excel removes the matching ASCII prefix before invoking linguistic comparison.
        const leftTail = left.slice(index);
        const rightTail = right.slice(index);
        const leftKey = index ? cached(leftTail) : leftCached;
        const rightKey = index ? cached(rightTail) : rightCached;
        return compareKeys(leftKey.linguistic ??= getSortKey(leftTail), rightKey.linguistic ??= getSortKey(rightTail));
    };
}
