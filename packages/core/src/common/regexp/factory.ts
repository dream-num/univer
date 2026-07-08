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

const REGEXP_FLAGS = new Set(['d', 'g', 'i', 'm', 's', 'u', 'v', 'y']);

export function createRegExpFromSafeFragment(fragment: string, flags?: string): RegExp {
    const safeFlags = normalizeRegExpFlags(flags);

    // Fragments passed here must come from regexp helpers that escape literals or normalize charsets.
    return new RegExp(fragment, safeFlags); // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp
}

function normalizeRegExpFlags(flags: string | undefined): string | undefined {
    if (flags === undefined) {
        return undefined;
    }

    const seen = new Set<string>();
    for (const flag of flags) {
        if (!REGEXP_FLAGS.has(flag) || seen.has(flag)) {
            throw new SyntaxError(`Invalid regular expression flags: ${flags}`);
        }

        seen.add(flag);
    }

    return flags;
}
