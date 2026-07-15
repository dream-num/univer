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

import type { IDecimalValue, IRoundedDecimalParts } from './decimal';
import type {
    ErrorFormatSection,
    FormatSection,
    LocaleData,
    ParsedFormatSection,
    ResolvedFormatOptions,
} from './types';
import { clamp } from './clamp';
import {
    EPOCH_1317,
    MAX_L_DATE,
    MAX_S_DATE,
    MIN_L_DATE,
    MIN_S_DATE,
    u_CSEC,
    u_DSEC,
    u_MSEC,
} from './constants';
import { dec2frac } from './dec-to-frac';
import { decimalFromNumber, roundDecimal, roundScientificDecimal, shiftDecimal } from './decimal';
import { general } from './general';
import { defaultLocale } from './locale';
import { getExponent, getSignificand } from './number-props';
import { pad } from './pad';
import { toYMD } from './to-ymd';

const DAYSIZE = 86400;

type RuntimeFormatSection = ParsedFormatSection & Partial<ErrorFormatSection>;

function dateOverflows(inputValue: number, roundedValue: number, bigRange: boolean): boolean {
    if (bigRange) {
        return inputValue < MIN_L_DATE || roundedValue >= MAX_L_DATE;
    }
    return inputValue < MIN_S_DATE || roundedValue >= MAX_S_DATE;
}

function legacyRound(number: number, places = 0): number {
    if (number < 0) {
        return -legacyRound(-number, places);
    }
    if (places) {
        const power = 10 ** places || 1;
        return legacyRound(number * power, 0) / power;
    }
    return Math.round(number);
}

// eslint-disable-next-line max-lines-per-function, complexity
export function runPart(
    value: unknown,
    part: FormatSection,
    options: ResolvedFormatOptions,
    locale?: LocaleData | null,
    decimalValue: IDecimalValue | null = null
): string {
    // Error sections intentionally contain only tokens and an error. The
    // upstream renderer treats every other property as undefined until the
    // error token is emitted, so keep that duck-typed runtime contract local.
    const section = part as RuntimeFormatSection;
    let renderValue = value;
    let numericValue = value as number;
    let mantissa = '';
    let mantissaSign = '';
    let numerator = '';
    let denominator = '';
    let fraction = '';
    let integer = '';
    let exponent = 0;
    let roundedNumber: IRoundedDecimalParts | null = null;

    let date = 0;
    if (typeof renderValue === 'bigint') {
        if (renderValue <= Number.MAX_SAFE_INTEGER && renderValue >= Number.MIN_SAFE_INTEGER) {
            numericValue = Number(renderValue);
            renderValue = numericValue;
        } else {
            return options.bigintErrorNumber
                ? String(renderValue)
                : options.overflow;
        }
        date = numericValue;
    } else {
        date = Math.trunc(numericValue);
    }
    let time = 0;
    let year = 0;
    let month = 1;
    let day = 0;
    let weekday = 0;
    let hour = 0;
    let minute = 0;
    let second = 0;
    let subsec = 0;

    const l10n = locale || defaultLocale;

    let decimal = decimalValue;
    if (!decimal && typeof value === 'number' && Number.isFinite(value)) {
        decimal = decimalFromNumber(value);
    }
    if (decimal && !section.text && section.scaleExponent) {
        decimal = shiftDecimal(decimal, section.scaleExponent);
    }

    // scale number
    if (!section.text && Number.isFinite(section.scale) && section.scale !== 1) {
        numericValue = clamp(numericValue * section.scale);
        renderValue = numericValue;
    }

    // calc exponent
    // Below exponent -308, preserve numfmt's shortest-exponential path for
    // subnormal compatibility. Exponent -308 itself remains canonical.
    if (section.exponential && decimal && decimal.exponent >= -308) {
        const scientific = roundScientificDecimal(
            decimal,
            section.int_max,
            Boolean(section.integer),
            section.frac_max
        );
        exponent = scientific.exponent;
        roundedNumber = scientific.rounded;
        mantissa += Math.abs(exponent);
    } else if (section.exponential) {
        let significand = Math.abs(numericValue);
        if (significand) {
            exponent = getExponent(significand, section.int_max);
        }
        if (numericValue && !section.integer) {
            // when there isn't an integer part, the exp gets shifted by 1
            exponent++;
        }
        significand = getSignificand(significand, exponent);
        if (section.int_max === 1 && legacyRound(significand, section.frac_max) === 10) {
            significand = 1;
            exponent++;
        }
        numericValue = numericValue < 0 ? -significand : significand;
        renderValue = numericValue;
        mantissa += Math.abs(exponent);
    }

    const requiresDecimalRounding = !Number.isSafeInteger(numericValue) || Boolean(section.scaleExponent);
    roundedNumber = roundedNumber || (decimal &&
        requiresDecimalRounding &&
        !section.date &&
        !section.fractions &&
        !section.exponential &&
        (section.integer || section.dec_fractions)
        ? roundDecimal(decimal, section.frac_max)
        : null);

    // integer to text
    if (section.integer) {
        if (roundedNumber) {
            integer = roundedNumber.integer === '0' ? '' : roundedNumber.integer;
        } else {
            const places = section.fractions ? 1 : section.frac_max;
            const roundedInteger = Math.abs(Number.isSafeInteger(numericValue) && places === 0
                ? numericValue
                : legacyRound(numericValue, places));
            integer += roundedInteger < 1 ? '' : Math.floor(roundedInteger);
        }
    }
    // integer grouping
    const primaryGroup = options.grouping[0] ?? 3;
    const secondaryGroup = options.grouping[1] ?? primaryGroup;

    // fraction to text
    if (section.dec_fractions) {
        fraction = roundedNumber
            ? roundedNumber.fraction
            : String(legacyRound(numericValue, section.frac_max)).split('.')[1] || '';
    }

    // using vulgar fractions
    const fixedSlash = !section.error && (section.num_p.includes('0') || section.den_p.includes('0'));

    let haveFraction = fixedSlash;
    if (section.fractions) {
        haveFraction = fixedSlash || !!(numericValue % 1);
        const decimal = Math.abs(section.integer ? numericValue % 1 : numericValue);
        if (decimal) {
            haveFraction = true;
            if (section.denominator && Number.isFinite(section.denominator)) {
                // predefined denominator
                denominator += section.denominator;
                numerator += legacyRound(decimal * section.denominator);
                if (numerator === '0') {
                    numerator = '';
                    denominator = '';
                    haveFraction = fixedSlash;
                }
            } else {
                const fractionParts = dec2frac(decimal, Infinity, section.den_max);
                numerator += fractionParts[0];
                denominator += fractionParts[1];
                if (section.integer && numerator === '0') {
                    numerator = '';
                    denominator = '';
                    haveFraction = fixedSlash;
                }
            }
        } else if (!numericValue && !section.integer) {
            haveFraction = true;
            numerator = '0';
            denominator = '1';
        }
        if (section.integer && !haveFraction && !Math.trunc(numericValue)) {
            integer = '0';
        }
    }

    // using date/time
    if (section.date) {
        date = Math.trunc(numericValue);
        const rawTime = DAYSIZE * (numericValue - date);
        time = Math.floor(rawTime); // in seconds
        // "epsilon" correction
        subsec = rawTime - time;
        if (Math.abs(subsec) < 1e-6) { // 0.000001
            subsec = 0;
        } else if (subsec > 0.9999) {
            subsec = 0;
            time += 1;
            if (time === DAYSIZE) {
                time = 0;
                date += 1;
            }
        }
        if (subsec) {
            // round time based on smallest used unit
            const minimumUnit = section.date & u_MSEC || section.date & u_CSEC || section.date & u_DSEC;
            if (
                (minimumUnit === u_MSEC && subsec > 0.9995) ||
                (minimumUnit === u_CSEC && subsec > 0.995) ||
                (minimumUnit === u_DSEC && subsec > 0.95) ||
                (!minimumUnit && subsec >= 0.5)
            ) {
                time++;
                subsec = 0;
            }
        }
        // serial date/time to gregorian calendar
        if (date || section.date_system) {
            const dateOutput = toYMD(numericValue, section.date_system, options.leap1900);
            year = dateOutput[0];
            month = dateOutput[1];
            day = dateOutput[2];
        }
        if (time) {
            const normalizedTime = time < 0 ? DAYSIZE + time : time;
            second = Math.floor(normalizedTime) % 60;
            minute = Math.floor(normalizedTime / 60) % 60;
            hour = Math.floor((normalizedTime / 60) / 60) % 60;
        }
        weekday = (6 + date) % 7;
        if (
            section.date_eval &&
            dateOverflows(numericValue, date + (time / DAYSIZE), options.dateSpanLarge)
        ) {
            // if value is out of bounds and formatting is date Excel emits a
            // stream of "######" that fills the cell width.
            // This doesn't happen, if the only date tokens are "elapsed time" tokens.
            // Code instead follows the TEXT function which emits a #VALUE! error.
            if (options.dateErrorThrows) {
                throw new Error('Date out of bounds');
            }
            if (options.dateErrorNumber) {
                const output: Array<string | number> = numericValue < 0 ? [l10n.negative] : [];
                return general(output, {}, numericValue, l10n, decimal).join('');
            }
            return options.overflow;
        }
    }

    const questionPadding = pad('?', options.nbsp);

    // mantissa sign
    if (exponent < 0) {
        mantissaSign = '-';
    } else if (section.exp_plus) {
        mantissaSign = '+';
    }

    const output: unknown[] = [];

    const digitsStart = (numberString: string, pattern: string, tokenPattern: string, offset: number): number => {
        let normalizedOffset = offset;
        const length = !normalizedOffset && numberString.length > pattern.length
            ? tokenPattern.length + numberString.length - pattern.length
            : tokenPattern.length;
        if (numberString.length < pattern.length) {
            normalizedOffset += numberString.length - pattern.length;
        }
        for (let index = 0; index < length; index++) {
            output.push(numberString[index + normalizedOffset] || pad(tokenPattern[index], options.nbsp));
        }
        return length;
    };

    let denominatorFixed = false;
    const counter = { int: 0, frac: 0, man: 0, num: 0, den: 0 };
    for (let tokenIndex = 0, tokenLength = section.tokens.length; tokenIndex < tokenLength; tokenIndex++) {
        const token = section.tokens[tokenIndex];
        const tokenType = token.type;
        const length = token.num ? token.num.length : 0;

        if (tokenType === 'string') {
            const tokenValue = token.value as string;
            // special rules may apply if next or prev is numerator or denominator
            if (token.rule) {
                if (token.rule === 'num') {
                    if (haveFraction) {
                        output.push(tokenValue.replace(/ /g, questionPadding));
                    } else if (section.num_min > 0 || section.den_min > 0) {
                        // FIXME: output.push(''.repeat(tokenValue.length))
                        output.push(tokenValue.replace(/./g, questionPadding));
                    }
                } else if (token.rule === 'num+int') {
                    if (haveFraction && integer) {
                        output.push(tokenValue.replace(/ /g, questionPadding));
                    } else if ((section.den_min > 0) && (integer || section.num_min)) {
                        output.push(tokenValue.replace(/./g, questionPadding));
                    }
                } else if (token.rule === 'den') {
                    if (haveFraction) {
                        output.push(tokenValue.replace(/ /g, questionPadding));
                    } else if (section.den_min > 0) {
                        output.push(tokenValue.replace(/./g, questionPadding));
                    }
                }
            } else {
                output.push(tokenValue.replace(/ /g, questionPadding));
            }
        } else if (tokenType === 'space') {
            if (token.rule === 'num+int') {
                if (
                    (haveFraction || section.num_min || section.den_min) &&
                    (integer || section.num_min)
                ) {
                    output.push(questionPadding);
                }
            } else {
                output.push(questionPadding);
            }
        } else if (tokenType === 'error') {
            // token used to define invalid pattern
            output.push(options.invalid);
        } else if (tokenType === 'point') {
            // Excel always emits a period: TEXT(0, "#.#") => "."
            output.push(section.date ? token.value : l10n.decimal);
        } else if (tokenType === 'general') {
            general(output as Array<string | number>, section, renderValue as number | string, l10n, decimal);
        } else if (tokenType === 'exp') {
            output.push(l10n.exponent);
        } else if (tokenType === 'minus') {
            if (token.volatile && section.date) {
                // don't emit the prepended minus if this is a date
            } else if (token.volatile && roundedNumber) {
                if (roundedNumber.negative && !roundedNumber.zero) {
                    output.push(l10n.negative);
                }
            } else if (token.volatile && (numericValue >= 0 || typeof renderValue !== 'number')) {
                // don't emit volatile minus for positive numbers
            } else if (token.volatile && !section.fractions && (section.integer || section.dec_fractions)) {
                // minus is only shown if there is a non-zero digit present
                if ((numericValue < 0 && !!integer && integer !== '0') || fraction) {
                    output.push(l10n.negative);
                }
            } else {
                output.push(l10n.negative);
            }
        } else if (tokenType === 'plus') {
            output.push(l10n.positive);
        } else if (tokenType === 'text') {
            output.push(renderValue);
        } else if (tokenType === 'fill') {
            // If user has provided a token to signal that next char is a fill char,
            // then emit that plus the fill char. By default this does what the
            // TEXT function does in this case: Emits nothing.
            if (options.fillChar) {
                output.push(options.fillChar, token.value);
            }
        } else if (tokenType === 'skip') {
            // If user has provided a token to signal that next char is a fill char,
            // then emit that plus the fill char. By default this does what the
            // TEXT function does in this case: Emits a space.
            if (options.skipChar) {
                output.push(options.skipChar, token.value);
            } else {
                output.push(options.nbsp ? '\u00A0' : ' ');
            }
        } else if (tokenType === 'div') {
            if (haveFraction) {
                output.push('/');
            } else if (section.num_min > 0 || section.den_min > 0) {
                output.push(questionPadding);
            } else {
                output.push(pad('#', options.nbsp));
            }
        } else if (tokenType === 'int') {
            // number isn't fragmented
            if (section.int_pattern.length === 1) {
                const pattern = section.int_p;
                const length = Math.max(section.int_min, integer.length);
                let digits = '';
                for (let index = length; index > 0; index--) {
                    const digit = integer.charAt(integer.length - index);
                    const patternDigit = digit ? '' : pattern.charAt(pattern.length - index) || pattern[0];
                    let separator = '';
                    if (section.grouping) {
                        const groupIndex = (index - 1) - primaryGroup;
                        if (groupIndex >= 0 && !(groupIndex % secondaryGroup)) {
                            separator = digit || patternDigit === '0'
                                ? l10n.group
                                : pad('?', options.nbsp);
                        }
                    }
                    digits += (digit || pad(patternDigit, options.nbsp)) + separator;
                }
                output.push(digits);
            } else {
                counter.int += digitsStart(integer, section.int_p, token.num!, counter.int);
            }
        } else if (tokenType === 'frac') {
            const offset = counter.frac;
            for (let index = 0; index < length; index++) {
                output.push(fraction[index + offset] || pad(token.num![index], options.nbsp));
            }
            counter.frac += length;
        } else if (tokenType === 'man') {
            // mantissa sign is attached to the first digit, not the exponent symbol
            // "0E+ 0" will print as "1E +12"
            if (!counter[tokenType] && !counter.man) {
                output.push(mantissaSign);
            }
            counter.man += digitsStart(mantissa, section.man_p, token.num!, counter.man);
        } else if (tokenType === 'num') {
            counter.num += digitsStart(numerator, section.num_p, token.num!, counter.num);
        } else if (tokenType === 'den') {
            const offset = counter.den;
            for (let index = 0; index < length; index++) {
                let digit = denominator[index + offset];
                if (!digit) {
                    const char = token.num![index];
                    if (
                        '123456789'.includes(char) ||
                        (denominatorFixed && char === '0')
                    ) {
                        denominatorFixed = true;
                        digit = options.nbsp ? '\u00A0' : ' ';
                    } else if (
                        !denominatorFixed &&
                        index === length - 1 &&
                        char === '0' &&
                        !denominator
                    ) {
                        digit = '1';
                    } else {
                        digit = pad(char, options.nbsp);
                    }
                }
                output.push(digit);
            }
            counter.den += length;
        } else if (tokenType === 'year') {
            if (year < 0) {
                output.push(l10n.negative);
            }
            output.push(String(Math.abs(year)).padStart(4, '0'));
        } else if (tokenType === 'year-short') {
            const shortYear = year % 100;
            output.push(shortYear < 10 ? '0' : '', shortYear);
        } else if (tokenType === 'month') {
            output.push(token.pad && month < 10 ? '0' : '', month);
        } else if (tokenType === 'monthname-single') {
            // This is what Excel does.
            // The Vietnamese list goes:
            //  from ["Tháng 1", "Tháng 2", ... ] to [ "T", "T", ... ]
            // Simplified Chinese goes:
            //  from [ 1月, ... 9月, 10月, 11月, 12月 ] to [ 1, ... 9, 1, 1, 1 ]
            if (section.date_system === EPOCH_1317) {
                output.push(l10n.mmmm6[month - 1].charAt(0));
            } else {
                output.push(l10n.mmmm[month - 1].charAt(0));
            }
        } else if (tokenType === 'monthname-short') {
            if (section.date_system === EPOCH_1317) {
                output.push(l10n.mmm6[month - 1]);
            } else {
                output.push(l10n.mmm[month - 1]);
            }
        } else if (tokenType === 'monthname') {
            if (section.date_system === EPOCH_1317) {
                output.push(l10n.mmmm6[month - 1]);
            } else {
                output.push(l10n.mmmm[month - 1]);
            }
        } else if (token.type === 'weekday-short') {
            output.push(l10n.ddd[weekday]);
        } else if (tokenType === 'weekday') {
            output.push(l10n.dddd[weekday]);
        } else if (tokenType === 'day') {
            output.push(token.pad && day < 10 ? '0' : '', day);
        } else if (tokenType === 'hour') {
            const displayHour = hour % section.clock || (section.clock < 24 ? section.clock : 0);
            output.push(token.pad && displayHour < 10 ? '0' : '', displayHour);
        } else if (tokenType === 'min') {
            output.push(token.pad && minute < 10 ? '0' : '', minute);
        } else if (tokenType === 'sec') {
            output.push(token.pad && second < 10 ? '0' : '', second);
        } else if (tokenType === 'subsec') {
            output.push(l10n.decimal);
            // decimals is pre-determined by longest subsec token
            // but the number emitted is per-token
            const formattedSubseconds = subsec.toFixed(section.sec_decimals);
            output.push(formattedSubseconds.slice(2, 2 + token.decimals!));
        } else if (tokenType === 'ampm') {
            const index = hour < 12 ? 0 : 1;
            if (token.short && !locale) {
                output.push('AP'[index]);
            } else {
                output.push(l10n.ampm[index]);
            }
        } else if (tokenType === 'hour-elap') {
            if (numericValue < 0) {
                output.push(l10n.negative);
            }
            const elapsedHours = (date * 24) + Math.floor(Math.abs(time) / (60 * 60));
            output.push(String(Math.abs(elapsedHours)).padStart(token.pad as number, '0'));
        } else if (tokenType === 'min-elap') {
            if (numericValue < 0) {
                output.push(l10n.negative);
            }
            const elapsedMinutes = (date * 1440) + Math.floor(Math.abs(time) / 60);
            output.push(String(Math.abs(elapsedMinutes)).padStart(token.pad as number, '0'));
        } else if (tokenType === 'sec-elap') {
            if (numericValue < 0) {
                output.push(l10n.negative);
            }
            const elapsedSeconds = (date * DAYSIZE) + Math.abs(time);
            output.push(String(Math.abs(elapsedSeconds)).padStart(token.pad as number, '0'));
        } else if (tokenType === 'b-year') {
            output.push(year + 543);
        } else if (tokenType === 'b-year-short') {
            const shortYear = (year + 543) % 100;
            output.push(shortYear < 10 ? '0' : '', shortYear);
        }
    }
    return output.join('');
}
