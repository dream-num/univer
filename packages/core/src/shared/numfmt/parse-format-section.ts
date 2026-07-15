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

import type { FormatToken, ParsedFormatSection, RenderToken } from './types';
import {
    EPOCH_1317,
    EPOCH_1900,
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
    u_CSEC,
    u_DAY,
    u_DSEC,
    u_HOUR,
    u_MIN,
    u_MONTH,
    u_MSEC,
    u_SEC,
    u_YEAR,
} from './constants';
import { resolveLocale } from './locale';

type NumberPatternName = 'int' | 'frac' | 'man' | 'den' | 'num';

interface INumberChunkToken extends RenderToken {
    type: NumberPatternName;
    num: string;
}

interface IDateChunkToken extends RenderToken {
    type: string;
    size: number;
    date: 1;
    pad?: boolean | number;
    used?: boolean;
    indeterminate?: boolean;
}

function getNumberPattern(part: ParsedFormatSection, prefix: NumberPatternName): string[] {
    switch (prefix) {
        case 'int':
            return part.int_pattern;
        case 'frac':
            return part.frac_pattern;
        case 'man':
            return part.man_pattern;
        case 'den':
            return part.den_pattern;
        case 'num':
            return part.num_pattern;
    }
}

function minMaxPad(str: string, part: ParsedFormatSection, prefix: NumberPatternName): ParsedFormatSection {
    const max = str.length;
    const min = str.replace(/#/g, '').length;
    switch (prefix) {
        case 'int':
            part.int_max = max;
            part.int_min = min;
            break;
        case 'frac':
            part.frac_max = max;
            part.frac_min = min;
            break;
        case 'man':
            part.man_max = max;
            part.man_min = min;
            break;
        case 'den':
            part.den_max = max;
            part.den_min = min;
            break;
        case 'num':
            part.num_max = max;
            part.num_min = min;
            break;
    }
    return part;
}

function add(token: string | RenderToken, tokens: RenderToken[]): void {
    // allow adding string tokens without wrapping
    if (typeof token === 'string') {
        tokens.push({ type: 'string', value: token });
    } else {
        tokens.push(token);
    }
}

function isNumOp(token: FormatToken | undefined, activePattern: NumberPatternName): boolean {
    const type = token?.type;
    return (
        type === TOKEN_HASH ||
        type === TOKEN_ZERO ||
        type === TOKEN_QMARK ||
        (type === TOKEN_DIGIT && activePattern === 'den')
    );
}

function assertNumberChunk(token: INumberChunkToken | null): asserts token is INumberChunkToken {
    if (token === null) {
        throw new TypeError('Cannot read properties of null (reading \'num\')');
    }
}

// eslint-disable-next-line max-lines-per-function, complexity
export function parseFormatSection(inputTokens: FormatToken[]): ParsedFormatSection {
    const outputTokens: RenderToken[] = [];

    const part: ParsedFormatSection = {
        scale: 1,
        scaleExponent: 0,
        percent: false,
        text: false,
        date: 0,
        date_eval: false,
        date_system: EPOCH_1900,
        sec_decimals: 0,
        general: false,
        clock: 24,
        int_pattern: [],
        frac_pattern: [],
        man_pattern: [],
        den_pattern: [],
        num_pattern: [],
        tokens: outputTokens,
        tokensUsed: 0,
        pattern: '',
        int_max: 0,
        int_min: 0,
        frac_max: 0,
        frac_min: 0,
        man_max: 0,
        man_min: 0,
        num_max: 0,
        num_min: 0,
        den_max: 0,
        den_min: 0,
        int_p: '',
        man_p: '',
        num_p: '',
        den_p: '',
        integer: false,
    };

    let currentPattern: NumberPatternName = 'int';
    let lastNumberChunk: INumberChunkToken | null = null;
    const dateChunks: IDateChunkToken[] = [];
    let last: FormatToken | undefined;
    let haveLocale = false;

    let index = -1;
    let partOver = false;
    let patternSource = '';
    let haveSlash = false;

    while (++index < inputTokens.length && !partOver) {
        const token = inputTokens[index];
        const type = token.type || TOKEN_ERROR;
        patternSource += token.raw;

        if (type === TOKEN_GENERAL) {
            part.general = true;
            add(token, outputTokens);
        } else if (isNumOp(token, currentPattern)) {
            const pattern = getNumberPattern(part, currentPattern);
            if (isNumOp(last, currentPattern) || last?.type === TOKEN_GROUP) {
                pattern.push((pattern.pop() || '') + token.value);
                assertNumberChunk(lastNumberChunk);
                lastNumberChunk.num += token.value;
            } else {
                pattern.push(token.value);
                lastNumberChunk = { type: currentPattern, num: token.value };
                add(lastNumberChunk, outputTokens);
            }
        } else if (type === TOKEN_PAREN) {
            if (token.value === '(') {
                part.parens = true;
            }
            add(token.value, outputTokens);
        } else if (type === TOKEN_DIGIT) {
            // just print it
            add(token.value, outputTokens);
        } else if (type === TOKEN_SLASH) {
            // vulgar fractions
            haveSlash = true;
            const pattern = getNumberPattern(part, currentPattern);
            if (pattern.length) {
                if (!lastNumberChunk) { // need to have a numerator present
                    throw new SyntaxError('Format pattern is missing a numerator');
                }
                part.fractions = true;
                // ... we just passed the numerator - correct that item
                const numerator = pattern.pop();
                if (numerator === undefined) {
                    throw new SyntaxError('Format pattern is missing a numerator');
                }
                part.num_pattern.push(numerator);
                lastNumberChunk.type = 'num';
                // next up... the denominator
                currentPattern = 'den';
                add({ type: 'div' }, outputTokens);
            } else {
                add(token.value, outputTokens);
            }
        } else if (type === TOKEN_COMMA) {
            add(',', outputTokens);
        } else if (type === TOKEN_SCALE) {
            part.scale = 0.001 ** token.raw.length;
            part.scaleExponent = -3 * token.raw.length;
        } else if (type === TOKEN_GROUP) {
            if (currentPattern === 'int') {
                part.grouping = true;
            }
            if (currentPattern === 'den') {
                throw new SyntaxError('Cannot group denominator digits');
            }
            // else we just ignore it!
        } else if (type === TOKEN_SPACE) {
            add(token, outputTokens);
        } else if (type === TOKEN_BREAK) {
            partOver = true;
            break; // leave the ";" hanging
        } else if (type === TOKEN_TEXT) {
            part.text = true;
            add(token, outputTokens);
        } else if (type === TOKEN_PLUS || type === TOKEN_MINUS) {
            add(token, outputTokens);
        } else if (type === TOKEN_DURATION) {
            // [h] [m] [s]
            const tokenValue = token.value.toLowerCase();
            const startsWith = tokenValue[0];
            const bit: IDateChunkToken = { type: '', size: 0, date: 1, pad: tokenValue.length };
            if (startsWith === 'h') {
                bit.size = u_HOUR;
                bit.type = 'hour-elap';
            } else if (startsWith === 'm') {
                bit.size = u_MIN;
                bit.type = 'min-elap';
            } else {
                bit.size = u_SEC;
                bit.type = 'sec-elap';
            }
            // signal date calc and track smallest needed unit
            part.date = part.date | bit.size;
            dateChunks.push(bit);
            add(bit, outputTokens);
        } else if (part.date && type === TOKEN_POINT && inputTokens[index + 1]?.type === TOKEN_ZERO) {
            // In locales where decimal symbol is set to "," Excel will expect
            // "," rather than a ".". The pattern must be re-localized first.
            let decimals = 1;
            index++;
            let raw = '0';
            if (inputTokens[index + 1]?.type === TOKEN_ZERO) {
                raw += '0';
                decimals = 2;
                index++;
            }
            if (inputTokens[index + 1]?.type === TOKEN_ZERO) {
                raw += '0';
                decimals = 3;
                index++;
            }
            patternSource += raw;
            const size = [u_SEC, u_DSEC, u_CSEC, u_MSEC][decimals];
            part.date = part.date | size;
            part.date_eval = true;
            part.sec_decimals = Math.max(part.sec_decimals, decimals);
            add({
                type: 'subsec',
                size,
                decimals,
                date: 1,
            }, outputTokens);
        } else if (type === TOKEN_CALENDAR) {
            // signal date system (ignored if defined with [$-xxx])
            if (!haveLocale) {
                if (token.value === 'B2' || token.value === 'b2') {
                    // TODO: B2 also switches locale to [$-060401] (ar).
                    part.date_system = EPOCH_1317;
                } else {
                    part.date_system = EPOCH_1900;
                }
            }
        } else if (type === TOKEN_DATETIME) {
            // hh:mm:ss YYYY-MM-DD
            const bit: IDateChunkToken = { type: '', size: 0, date: 1 };
            const value = token.value.toLowerCase();
            const startsWith = value[0];
            if (value === 'y' || value === 'yy') {
                bit.size = u_YEAR;
                bit.type = 'year-short';
            } else if (startsWith === 'y' || startsWith === 'e') {
                bit.size = u_YEAR;
                bit.type = 'year';
            } else if (value === 'b' || value === 'bb') {
                bit.size = u_YEAR;
                bit.type = 'b-year-short';
            } else if (startsWith === 'b') {
                bit.size = u_YEAR;
                bit.type = 'b-year';
            } else if (value === 'd' || value === 'dd') {
                bit.size = u_DAY;
                bit.type = 'day';
                bit.pad = /dd/.test(value);
            } else if (value === 'ddd' || value === 'aaa') {
                bit.size = u_DAY;
                bit.type = 'weekday-short';
            } else if (startsWith === 'd' || startsWith === 'a') {
                bit.size = u_DAY;
                bit.type = 'weekday';
            } else if (startsWith === 'h') {
                bit.size = u_HOUR;
                bit.type = 'hour';
                bit.pad = /hh/i.test(value);
            } else if (startsWith === 'm') {
                if (value.length === 3) {
                    bit.size = u_MONTH;
                    bit.type = 'monthname-short';
                } else if (value.length === 5) {
                    bit.size = u_MONTH;
                    bit.type = 'monthname-single';
                } else if (value.length >= 4) {
                    bit.size = u_MONTH;
                    bit.type = 'monthname';
                }
                // m or mm can be either minute or month based on context
                const lastDateChunk = dateChunks[dateChunks.length - 1];
                if (
                    !bit.type &&
                    lastDateChunk &&
                    !lastDateChunk.used &&
                    (lastDateChunk.size & (u_HOUR | u_SEC))
                ) {
                    lastDateChunk.used = true;
                    bit.size = u_MIN;
                    bit.type = 'min';
                    bit.pad = /mm/.test(value);
                }
                // if we still don't know, treat as a month and defer
                if (!bit.type) {
                    bit.size = u_MONTH;
                    bit.type = 'month';
                    bit.pad = /mm/.test(value);
                    bit.indeterminate = true;
                }
            } else if (startsWith === 's') {
                bit.size = u_SEC;
                bit.type = 'sec';
                bit.pad = /ss/.test(value);
                const lastDateChunk = dateChunks[dateChunks.length - 1];
                if (lastDateChunk && (lastDateChunk.size & u_MIN)) {
                    bit.used = true;
                } else if (lastDateChunk?.indeterminate) {
                    delete lastDateChunk.indeterminate;
                    lastDateChunk.size = u_MIN;
                    lastDateChunk.type = 'min';
                    bit.used = true;
                }
            } else if (startsWith === 'g') {
                // TODO: Don't know what this does? (yet!)
            }
            // signal date calc and track smallest needed unit
            part.date = part.date | bit.size;
            part.date_eval = true;
            dateChunks.push(bit);
            add(bit, outputTokens);
        } else if (type === TOKEN_AMPM) {
            part.clock = 12;
            part.date = part.date | u_HOUR;
            part.date_eval = true;
            token.short = token.value === 'A/P';
            add(token, outputTokens);
        } else if (type === TOKEN_STRING || type === TOKEN_ESCAPED || type === TOKEN_CHAR) {
            add(token.value, outputTokens);
        } else if (type === TOKEN_CONDITION) {
            part.condition = [token.value[0], Number.parseFloat(token.value[1])];
        } else if (type === TOKEN_LOCALE) {
            const bits = token.value.split('-');
            const code = bits.length < 2 ? '' : bits.slice(1).join('-');

            const currency = bits[0];
            if (currency) {
                add(currency, outputTokens);
            }

            const locale = resolveLocale(code);
            if (locale) {
                part.locale = locale;
            }
            const windowsCode = Number.parseInt(code, 16);
            if (Number.isFinite(windowsCode) && (windowsCode & 0xFF0000)) {
                const calendar = (windowsCode >> 16) & 0xFF;
                if (calendar === 6) {
                    part.date_system = EPOCH_1317;
                }
            }

            haveLocale = true; // ignore any B2 & B1 tokens
        } else if (type === TOKEN_COLOR) {
            const normalizedColor: string = token.value.toLowerCase();
            let color: string | number = normalizedColor;
            const colorMatch = /^color\s*(\d+)$/i.exec(normalizedColor);
            if (colorMatch) {
                color = Number.parseInt(colorMatch[1], 10);
            }
            part.color = color;
        } else if (type === TOKEN_PERCENT) {
            part.scale = 100;
            part.scaleExponent = 2;
            part.percent = true;
            add('%', outputTokens);
        } else if (type === TOKEN_POINT) {
            add(token, outputTokens);
            if (!part.date) {
                part.dec_fractions = true;
                currentPattern = 'frac';
            }
        } else if (type === TOKEN_EXP) {
            part.exponential = true;
            part.exp_plus = token.value.includes('+');
            currentPattern = 'man';
            add({ type: 'exp', plus: part.exp_plus }, outputTokens);
        } else if (type === TOKEN_SKIP || type === TOKEN_FILL) {
            add(token, outputTokens);
        } else if (type === TOKEN_DBNUM || type === TOKEN_NATNUM) {
            // Unsupported upstream numeric modifiers are deliberately ignored.
        } else if (type === TOKEN_ERROR) {
            throw new SyntaxError(`Illegal character: ${patternSource}`);
        } else {
            throw new SyntaxError(`Unknown token ${type} in ${patternSource}`);
        }

        // advance parser
        last = token;
    }
    part.tokensUsed = index;
    part.pattern = patternSource;

    // Quickly determine if this pattern is condition only.
    if (/^((?:\[[^\]]+\])+)(;|$)/.test(part.pattern) && !/^\[(?:h+|m+|s+)\]/.test(part.pattern)) {
        add({ type: 'text' }, outputTokens);
    }

    if (
        (part.fractions && part.dec_fractions) ||
        (part.grouping && !part.int_pattern.length) ||
        (part.fractions && part.exponential) ||
        (part.fractions && (part.den_pattern.length * part.num_pattern.length) === 0) ||
        (haveSlash && !part.fractions && !part.date) ||
        (part.exponential && ((part.int_pattern.length || part.frac_pattern.length) * part.man_pattern.length) === 0)
    ) {
        throw new SyntaxError(`Invalid pattern: ${patternSource}`);
    }

    const intPattern = part.int_pattern.join('');
    const manPattern = part.man_pattern.join('');
    const fracPattern = part.frac_pattern.join('');
    minMaxPad(intPattern, part, 'int');
    let min = 0;
    for (let patternIndex = 0; patternIndex < intPattern.length; patternIndex++) {
        const character = intPattern[intPattern.length - 1 - patternIndex];
        if (/^[0-9?]/.test(character)) {
            min = patternIndex + 1;
        }
    }
    part.int_min = min;

    minMaxPad(fracPattern, part, 'frac');
    minMaxPad(manPattern, part, 'man');

    let numeratorPattern = part.num_pattern.join('');
    let denominatorPattern = part.den_pattern[0] || '';
    const enforcePadded = denominatorPattern.includes('?') || numeratorPattern.includes('?');
    if (enforcePadded) {
        denominatorPattern = denominatorPattern.replace(/\d/g, '?');
        denominatorPattern = denominatorPattern.replace(/#$/g, '?');
        minMaxPad(numeratorPattern, part, 'num');
        minMaxPad(denominatorPattern, part, 'den');
        numeratorPattern = numeratorPattern.replace(/#$/g, '?');
    } else {
        minMaxPad(numeratorPattern, part, 'num');
        minMaxPad(denominatorPattern, part, 'den');
    }

    part.int_p = intPattern;
    part.man_p = manPattern;
    part.num_p = numeratorPattern;
    part.den_p = denominatorPattern;

    if (part.den_pattern.length) {
        part.denominator = Number.parseInt(part.den_pattern.join('').replace(/\D/g, ''), 10);
    }

    part.integer = !!intPattern.length;

    if (!part.integer && !part.exponential && fracPattern.length) {
        const pointIndex = part.tokens.findIndex((token) => token.type === 'point');
        part.tokens.splice(pointIndex, 0, { type: 'int', value: '#' });
        part.integer = true;
        part.int_pattern = ['#'];
        part.int_p = '#';
    }

    // Extra whitespace rules for vulgar fractions.
    if (part.fractions) {
        for (let tokenIndex = 0; tokenIndex < outputTokens.length - 1; tokenIndex++) {
            const token = outputTokens[tokenIndex];
            if (token.type !== 'string' && token.type !== 'space') {
                continue;
            }
            const nextType = outputTokens[tokenIndex + 1].type;
            if (nextType === 'num') {
                token.rule = 'num+int';
            } else if (nextType === 'div') {
                token.rule = 'num';
            } else if (nextType === 'den') {
                token.rule = 'den';
            }
        }
    }

    if (part.grouping && part.int_pattern.length > 1) {
        part.grouping = false;
    }

    return part;
}
