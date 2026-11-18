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

/**
 * Escapes text so it can be embedded in a regular-expression pattern as a literal.
 */
export function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Creates a `RegExp` that matches literal text rather than regular-expression syntax.
 */
export function createLiteralRegExp(value: string, flags?: string): RegExp {
    return createRegExpFromSafeFragment(escapeRegExp(value), flags);
}

/**
 * Converts a spreadsheet-style wildcard pattern to an anchored regular expression.
 *
 * `*` matches any number of characters and `?` matches one character. In a pattern
 * that contains either of them, a tilde makes the following `*`, `?` or `~` literal,
 * and before any other character it is a literal tilde. A pattern with neither `*`
 * nor `?` is matched as written, tildes included, so `a~~b` matches only `a~~b`.
 * All other regular-expression syntax is treated as literal text. Matching is
 * case-insensitive.
 */
export function createFromWildcard(pattern: string): RegExp {
    // Excel reads tildes as escapes only in a pattern that has a `*` or a `?` to escape.
    if (!/[*?]/.test(pattern)) {
        return createRegExpFromSafeFragment(`^${escapeRegExp(pattern)}$`, 'i');
    }

    // After escaping, `*` and `?` read `\*` and `\?`; a tilde is left unescaped.
    const source = escapeRegExp(pattern).replace(/~(\\[*?]|~)|\\\*|\\\?/g, (match, escapedLiteral?: string) => {
        if (escapedLiteral !== undefined) {
            return escapedLiteral;
        }

        return match === '\\*' ? '.*' : '.';
    });
    return createRegExpFromSafeFragment(`^${source}$`, 'i');
}
