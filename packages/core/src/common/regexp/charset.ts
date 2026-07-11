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

import { createRegExpFromSafeFragment } from './factory';

export type CharsetDataUnit = [number, number];

/**
 * A single character, code point, or inclusive range used to build a character class.
 *
 * String inputs must contain exactly one Unicode code point. Use `or()` for multi-character
 * alternatives such as keywords or table names.
 */
export type CharsetRawInput = string | number | [string, string] | [number, number];
export type CharsetInput = Charset | CharsetRawInput;

const MAX_CODE_POINT = 0x10FFFF;

/**
 * Builds a normalized regular-expression character class.
 *
 * `Charset` is intended for dynamic character sets, especially when callers need set
 * operations that are hard to read or easy to get wrong with handwritten `[...]` strings.
 * Ranges are stored as inclusive Unicode code-point pairs and merged during construction.
 */
export class Charset {
    readonly data: CharsetDataUnit[];

    constructor(...inputs: CharsetInput[]) {
        this.data = normalizeData(inputs.flatMap((input) => inputToData(input)));
    }

    /**
     * Returns a new charset containing this charset and all provided characters or ranges.
     */
    union(...inputs: CharsetInput[]): Charset {
        return new Charset(this, ...inputs);
    }

    /**
     * Returns a new charset with the provided characters or ranges removed.
     */
    subtract(...inputs: CharsetInput[]): Charset {
        const subtractData = normalizeData(inputs.flatMap((input) => inputToData(input)));
        let next = this.data.slice();

        for (const [removeStart, removeEnd] of subtractData) {
            const fragments: CharsetDataUnit[] = [];

            for (const [start, end] of next) {
                if (removeEnd < start || removeStart > end) {
                    fragments.push([start, end]);
                    continue;
                }

                if (removeStart > start) {
                    fragments.push([start, removeStart - 1]);
                }

                if (removeEnd < end) {
                    fragments.push([removeEnd + 1, end]);
                }
            }

            next = fragments;
        }

        return new Charset(...next);
    }

    /**
     * Returns a new charset containing only characters shared with the provided inputs.
     */
    intersect(...inputs: CharsetInput[]): Charset {
        const intersectData = normalizeData(inputs.flatMap((input) => inputToData(input)));
        const next: CharsetDataUnit[] = [];

        for (const [start, end] of this.data) {
            for (const [intersectStart, intersectEnd] of intersectData) {
                const nextStart = Math.max(start, intersectStart);
                const nextEnd = Math.min(end, intersectEnd);

                if (nextStart <= nextEnd) {
                    next.push([nextStart, nextEnd]);
                }
            }
        }

        return new Charset(...next);
    }

    /**
     * Returns whether this charset would match no characters.
     */
    isEmpty(): boolean {
        return this.data.length === 0;
    }

    /**
     * Serializes to a regex fragment, not a full anchored pattern.
     */
    toString(): string {
        if (this.isEmpty()) {
            return '(?!)';
        }

        return `[${this.data.map(rangeToString).join('')}]`;
    }

    /**
     * Creates a `RegExp` from this charset fragment with optional flags.
     */
    toRegExp(flags?: string): RegExp {
        return createRegExpFromSafeFragment(this.toString(), flags);
    }
}

/**
 * Convenience factory for `new Charset(...)`.
 */
export const charset = (...inputs: CharsetInput[]): Charset => new Charset(...inputs);

function inputToData(input: CharsetInput): CharsetDataUnit[] {
    if (input instanceof Charset) {
        return input.data;
    }

    if (Array.isArray(input)) {
        const start = codePoint(input[0]);
        const end = codePoint(input[1]);

        return [[Math.min(start, end), Math.max(start, end)]];
    }

    const point = codePoint(input);
    return [[point, point]];
}

function codePoint(input: string | number): number {
    if (typeof input === 'number') {
        if (!Number.isInteger(input) || input < 0 || input > MAX_CODE_POINT) {
            throw new RangeError(`Invalid code point: ${input}`);
        }

        return input;
    }

    const point = input.codePointAt(0);
    if (point == null || String.fromCodePoint(point) !== input) {
        throw new RangeError(`Charset string inputs must contain exactly one code point: ${input}`);
    }

    return point;
}

function normalizeData(data: CharsetDataUnit[]): CharsetDataUnit[] {
    if (data.length === 0) {
        return [];
    }

    const sorted = data.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const result: CharsetDataUnit[] = [];

    for (const [start, end] of sorted) {
        const last = result[result.length - 1];

        if (!last || start > last[1] + 1) {
            result.push([start, end]);
        } else {
            last[1] = Math.max(last[1], end);
        }
    }

    return result;
}

function rangeToString([start, end]: CharsetDataUnit): string {
    if (start === end) {
        return escapeCharClassCodePoint(start);
    }

    return `${escapeCharClassCodePoint(start)}-${escapeCharClassCodePoint(end)}`;
}

function escapeCharClassCodePoint(point: number): string {
    const char = String.fromCodePoint(point);

    if (char === '\\' || char === ']' || char === '-' || char === '^') {
        return `\\${char}`;
    }

    if (point <= 0x1F || point === 0x7F) {
        return `\\u${point.toString(16).padStart(4, '0')}`;
    }

    return char;
}
