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

// Derived from numfmt 3.2.6 (MIT), commit c2cfdfa01bb1f24df51e985825671eb480daed4c.
// See packages/core/src/shared/numfmt/LICENSE.

import type { FormatToken } from './types';
import {
    TOKEN_AMPM,
    TOKEN_BREAK,
    TOKEN_CALENDAR,
    TOKEN_CHAR,
    TOKEN_COLOR,
    TOKEN_COMMA,
    TOKEN_CONDITION,
    TOKEN_DATETIME,
    TOKEN_DBNUM,
    TOKEN_DIGIT,
    TOKEN_DURATION,
    TOKEN_ERROR,
    TOKEN_ESCAPED,
    TOKEN_EXP,
    TOKEN_FILL,
    TOKEN_GENERAL,
    TOKEN_GROUP,
    TOKEN_HASH,
    TOKEN_LOCALE,
    TOKEN_MINUS,
    TOKEN_MODIFIER,
    TOKEN_NATNUM,
    TOKEN_PAREN,
    TOKEN_PERCENT,
    TOKEN_PLUS,
    TOKEN_POINT,
    TOKEN_QMARK,
    TOKEN_SCALE,
    TOKEN_SKIP,
    TOKEN_SLASH,
    TOKEN_SPACE,
    TOKEN_STRING,
    TOKEN_TEXT,
    TOKEN_ZERO,
} from './constants';

type TokenGroup = number | readonly number[];
type TokenHandler = readonly [type: string, expression: RegExp, group: TokenGroup];

const tokenHandlers: readonly TokenHandler[] = [
    [TOKEN_GENERAL, /^General/i, 0],
    [TOKEN_HASH, /^#/, 0],
    [TOKEN_ZERO, /^0/, 0],
    [TOKEN_QMARK, /^\?/, 0],
    [TOKEN_SLASH, /^\//, 0],
    // Commas are dealt with as a special case in the tokenizer but will end up
    // as one of these:
    // [ TOKEN_GROUP, /^(,),*/, 1 ],
    // [ TOKEN_SCALE, /^(,),*/, 1 ],
    // [ TOKEN_COMMA, /^(,),*/, 1 ],
    [TOKEN_BREAK, /^;/, 0],
    [TOKEN_TEXT, /^@/, 0],
    [TOKEN_PLUS, /^\+/, 0],
    [TOKEN_MINUS, /^-/, 0],
    [TOKEN_POINT, /^\./, 0],
    [TOKEN_SPACE, /^ /, 0],
    [TOKEN_PERCENT, /^%/, 0],
    [TOKEN_DIGIT, /^[1-9]/, 0],
    [TOKEN_CALENDAR, /^(?:B[12])/i, 0],
    [TOKEN_ERROR, /^B$/, 0], // pattern must not end in a "B"
    [TOKEN_DATETIME, /^(?:[hH]+|[mM]+|[sS]+|[yY]+|[bB]+|[dD]+|[gG]+|[aA]{3,}|e+)/, 0],
    [TOKEN_DURATION, /^(?:\[(h+|m+|s+)\])/i, 1],
    [TOKEN_CONDITION, /^\[(<[=>]?|>=?|=)\s*(-?[.\d]+)\]/, [1, 2]],
    [TOKEN_DBNUM, /^\[(DBNum[0-4]?\d)\]/i, 1],
    [TOKEN_NATNUM, /^\[(NatNum[0-4]?\d)\]/i, 1],
    [TOKEN_LOCALE, /^\[\$([^\]]+)\]/, 1],
    [TOKEN_COLOR, /^\[(black|blue|cyan|green|magenta|red|white|yellow|color\s*\d+)\]/i, 1],
    // conditionally allow these open ended directions?
    [TOKEN_MODIFIER, /^\[([^\]]+)\]/, 1],
    [TOKEN_AMPM, /^(?:AM\/PM|am\/pm|A\/P)/, 0],
    [TOKEN_ESCAPED, /^\\(.)/, 1],
    [TOKEN_STRING, /^"([^"]*?)"/, 1],
    [TOKEN_SKIP, /^_(\\.|.)/, 1],
    // Google Sheets and Excel diverge on "e": Excel only accepts E.
    [TOKEN_EXP, /^[Ee]([+-])/, 1],
    [TOKEN_FILL, /^\*(\\.|.)/, 1],
    [TOKEN_PAREN, /^[()]/, 0],
    [TOKEN_ERROR, /^[EÈÉÊËèéêëĒēĔĕĖėĘęĚěȄȅȆȇȨȩNnÑñŃńŅņŇňǸǹ["*/\\_]/, 0],
    [TOKEN_CHAR, /^./, 0],
];

const CODE_QMRK = 63;
const CODE_HASH = 35;
const CODE_ZERO = 48;
const CODE_NINE = 57;
const isNumOp = (char: string | undefined): boolean => {
    const code = (char || '\0').charCodeAt(0);
    return code === CODE_QMRK || code === CODE_HASH || (code >= CODE_ZERO && code <= CODE_NINE);
};

/**
 * Breaks a format pattern string into a list of tokens.
 */
// eslint-disable-next-line complexity
export function tokenize(pattern: string): FormatToken[] {
    let index = 0;
    const tokens: FormatToken[] = [];
    const unresolvedCommas: FormatToken[] = [];
    while (index < pattern.length) {
        const current = pattern.slice(index);
        let step = 0;
        // A comma is context sensitive and needs to be handled as a special case.
        // This needs to happen in the tokenizer because to be able to re-localize
        // the pattern we'll need to know what each comma means.
        const commaMatch = /^(,+)(.)?/.exec(current);
        if (commaMatch) {
            // comma depends on what it follows
            const raw = commaMatch[1];
            step = raw.length;
            const lookBehind = pattern[index - 1] || '';
            let maybeGroup = false;
            let maybeScale = false;
            if (isNumOp(lookBehind)) { // 0-9, '#', or '?': may be GROUP or SCALE
                maybeGroup = true;
                maybeScale = true;
            } else if (lookBehind === '.') { // '.': may be SCALE only
                maybeScale = true;
            }
            // if at the end of the pattern or section, then this can't be a GROUP op
            const lookAhead = commaMatch[2] || '';
            if (maybeGroup && (!lookAhead || lookAhead === ';')) {
                maybeGroup = false;
            }
            // if next char is a num token, then this cannot be a SCALE op
            if (maybeScale && isNumOp(lookAhead)) {
                maybeScale = false;
            }
            if (maybeGroup && !maybeScale) {
                tokens.push({ type: TOKEN_GROUP, value: ',', raw });
            } else if (!maybeGroup && maybeScale) {
                tokens.push({ type: TOKEN_SCALE, value: ',', raw });
            } else if (maybeGroup && maybeScale) {
                // this token will be set to scale, but switched to group if we hit a
                // num token later on in the pattern...
                const token: FormatToken = { type: TOKEN_SCALE, value: ',', raw };
                tokens.push(token);
                unresolvedCommas.push(token);
            } else {
                tokens.push({ type: TOKEN_COMMA, value: ',', raw });
            }
        } else {
            // all other symbols are matched using token handlers
            let token: FormatToken | undefined;
            for (const [type, expression, group] of tokenHandlers) {
                const match = expression.exec(current);
                if (match) {
                    const value = typeof group !== 'number'
                        ? group.map((matchIndex) => match[matchIndex])
                        : match[group || 0];
                    token = { type, value, raw: match[0] };
                    tokens.push(token);
                    step = match[0].length;
                    break;
                }
            }
            // if we just matched a break, then deal with any unresolved commas
            if (unresolvedCommas.length && token?.raw === ';') {
                unresolvedCommas.length = 0;
            }
            // if we just matched a num operator, then deal with any unresolved commas
            if (unresolvedCommas.length && isNumOp(token?.raw)) {
                unresolvedCommas.forEach((unresolved) => (unresolved.type = TOKEN_GROUP));
                unresolvedCommas.length = 0;
            }
        }
        if (!step) {
            const raw = current[0];
            step = 1;
            tokens.push({ type: TOKEN_CHAR, value: raw, raw });
        }
        index += step;
    }
    return tokens;
}
