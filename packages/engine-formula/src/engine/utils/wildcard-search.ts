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
 * A parsed SEARCH pattern. `?` matches one character, `*` any text, and `~` before `?` or `*`
 * makes that character literal.
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
        const next = pattern[i + 1];

        if (char === '~' && (next === '*' || next === '?')) {
            segments[segments.length - 1].push(next);
            i++;
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

    let position = start + first.length;

    for (const segment of rest) {
        const found = findSegment(text, segment, position);

        if (found === -1) {
            return -1;
        }

        position = found + segment.length;
    }

    return start;
}

function findSegment(text: string, segment: ReadonlyArray<string | null>, fromIndex: number): number {
    for (let start = fromIndex; start + segment.length <= text.length; start++) {
        let matched = 0;

        while (matched < segment.length && (segment[matched] === null || segment[matched] === text[start + matched])) {
            matched++;
        }

        if (matched === segment.length) {
            return start;
        }
    }

    return -1;
}
