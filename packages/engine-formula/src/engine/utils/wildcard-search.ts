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
 * A parsed SEARCH pattern. `?` matches one character, `*` any text, and `~` makes the character
 * after it literal, as Excel does: `~~` is a tilde, `~*` an asterisk, `~x` an x, and a trailing
 * `~` matches nothing.
 */
export interface IWildcardSearchPattern {
    /** The text to find, with escapes removed, when the pattern has no wildcard. */
    readonly literal: string | null;
    /** The parts between `*` wildcards; `null` stands for `?`. */
    readonly segments: ReadonlyArray<ReadonlyArray<string | null>>;
}

export function parseWildcardSearchPattern(pattern: string): IWildcardSearchPattern {
    const segments: (string | null)[][] = [[]];
    let hasWildcard = false;

    for (let i = 0; i < pattern.length; i++) {
        const char = pattern[i];

        if (char === '~') {
            // Whatever follows a tilde is literal; a trailing tilde adds nothing to the pattern.
            if (i + 1 < pattern.length) {
                segments[segments.length - 1].push(pattern[i + 1]);
                i++;
            }
        } else if (char === '*') {
            hasWildcard = true;
            segments.push([]);
        } else if (char === '?') {
            hasWildcard = true;
            segments[segments.length - 1].push(null);
        } else {
            segments[segments.length - 1].push(char);
        }
    }

    return { literal: hasWildcard ? null : segments[0].join(''), segments };
}

/**
 * Index of the earliest match of `pattern` in `text` at or after `fromIndex`, or -1.
 *
 * Each segment is placed at its leftmost position after the previous one, which finds the
 * earliest match without backtracking: the cost is at most text length × pattern length.
 */
export function searchWildcard(text: string, pattern: IWildcardSearchPattern, fromIndex: number): number {
    if (pattern.literal !== null) {
        return text.indexOf(pattern.literal, fromIndex);
    }

    const [first, ...rest] = pattern.segments;
    const start = findSegment(text, first, fromIndex);

    if (start === -1) {
        return -1;
    }

    let position = matchSegmentAt(text, first, start);

    for (const segment of rest) {
        const found = findSegment(text, segment, position);

        if (found === -1) {
            return -1;
        }

        position = matchSegmentAt(text, segment, found);
    }

    return start;
}

/** Leftmost start at or after `fromIndex` where `segment` matches, or -1. */
function findSegment(text: string, segment: ReadonlyArray<string | null>, fromIndex: number): number {
    // Every token covers at least one UTF-16 unit, so a segment never fits in fewer.
    for (let start = fromIndex; start + segment.length <= text.length; start++) {
        if (matchSegmentAt(text, segment, start) !== -1) {
            return start;
        }
    }

    return -1;
}

/**
 * End of `segment` matched at `start`, or -1. `?` covers one character, so a surrogate pair
 * such as an emoji is a single `?`; positions stay in UTF-16 units, as LEN counts them.
 */
function matchSegmentAt(text: string, segment: ReadonlyArray<string | null>, start: number): number {
    let position = start;

    for (const token of segment) {
        if (position >= text.length) {
            return -1;
        }

        if (token === null) {
            position += isSurrogatePairAt(text, position) ? 2 : 1;
        } else if (token === text[position]) {
            position++;
        } else {
            return -1;
        }
    }

    return position;
}

function isSurrogatePairAt(text: string, index: number): boolean {
    const high = text.charCodeAt(index);
    const low = text.charCodeAt(index + 1);

    return high >= 0xD800 && high <= 0xDBFF && low >= 0xDC00 && low <= 0xDFFF;
}

/**
 * Upper-cases text for a case-insensitive search without changing its length, so a match
 * index is also the position in the original text. A character whose upper case is longer
 * (ß becomes SS) is kept as it is.
 */
export function upperCaseKeepingPositions(text: string): string {
    const upper = text.toLocaleUpperCase();

    if (upper.length === text.length) {
        return upper;
    }

    let result = '';

    for (const char of text) {
        const upperChar = char.toLocaleUpperCase();
        result += upperChar.length === char.length ? upperChar : char;
    }

    return result;
}
