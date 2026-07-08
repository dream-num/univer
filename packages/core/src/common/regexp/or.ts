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

import type { CharsetInput } from './charset';
import { Charset, charset } from './charset';
import { escapeRegExp } from './escape';
import { createRegExpFromSafeFragment } from './factory';

/**
 * A literal string, existing `Or`, or character-set input used to build alternatives.
 */
export type OrInput = string | Or | CharsetInput;

/**
 * Builds a regex alternation from literal strings and character sets.
 *
 * Literal strings are escaped automatically. Character-set inputs are folded into one
 * `Charset`, so `or('SUM', charset('A', 'B'))` serializes to an alternation containing
 * both the string branch and the character-class branch.
 */
export class Or {
    readonly charset: Charset;
    readonly strings: string[];

    constructor(...inputs: OrInput[]) {
        const charsetInputs: CharsetInput[] = [];
        const strings: string[] = [];

        for (const input of inputs) {
            if (input instanceof Or) {
                charsetInputs.push(input.charset);
                strings.push(...input.strings);
            } else if (input instanceof Charset || typeof input === 'number' || Array.isArray(input)) {
                charsetInputs.push(input);
            } else {
                strings.push(input);
            }
        }

        this.charset = charset(...charsetInputs);
        this.strings = Array.from(new Set(strings));
    }

    /**
     * Returns a new alternation containing this instance and all provided inputs.
     */
    union(...inputs: OrInput[]): Or {
        return new Or(this, ...inputs);
    }

    /**
     * Returns a new alternation with matching string and charset inputs removed.
     */
    subtract(...inputs: OrInput[]): Or {
        const other = new Or(...inputs);
        const nextStrings = this.strings.filter((item) => !other.strings.includes(item));

        return new Or(this.charset.subtract(other.charset), ...nextStrings);
    }

    /**
     * Returns whether this alternation would match no branches.
     */
    isEmpty(): boolean {
        return this.charset.isEmpty() && this.strings.length === 0;
    }

    /**
     * Serializes to a regex fragment, not a full anchored pattern.
     */
    toString(): string {
        if (this.isEmpty()) {
            return '(?!)';
        }

        const alternatives = [
            ...(!this.charset.isEmpty() ? [this.charset.toString()] : []),
            ...this.strings.map(escapeRegExp),
        ];

        return alternatives.length === 1 ? alternatives[0] : `(?:${alternatives.join('|')})`;
    }

    /**
     * Creates a `RegExp` from this alternation fragment with optional flags.
     */
    toRegExp(flags?: string): RegExp {
        return createRegExpFromSafeFragment(this.toString(), flags);
    }
}

/**
 * Convenience factory for `new Or(...)`.
 */
export const or = (...inputs: OrInput[]): Or => new Or(...inputs);
