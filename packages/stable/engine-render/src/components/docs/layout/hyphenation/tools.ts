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

export type RawHyphenPattern = [string, string, string[]];

export interface IHyphenPattern {
    levelsTable: string[];
    // eslint-disable-next-line ts/no-explicit-any
    pattern: any;
}

export function parsePattern(pattern: RawHyphenPattern): IHyphenPattern {
    const [levelsTableStr, patternStr] = pattern;

    return {
        levelsTable: levelsTableStr.split(','),
        pattern: JSON.parse(patternStr),
    };
}

export function snackToPascal(snack: string) {
    return snack
        .replace(/^[a-z]/, (g) => g.toUpperCase())
        .replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

export function createStringSlicer(str: string[]): [() => string[], () => boolean] {
    let i = 0;
    let slice = str;

    function next() {
        slice = str.slice(i++);

        if (slice.length < 3) {
            return [];
        }

        return slice;
    }

    function isFirstCharacter() {
        return i === 2;
    }

    return [next, isFirstCharacter];
}

export function createCharIterator(str: string[]): [() => string, () => boolean] {
    let i = 0;

    function nextChar() {
        return str[i++];
    }

    function isLastLetter() {
        return str.length === i + 1;
    }

    return [nextChar, isLastLetter];
}
