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

import type {
    FormatDateInfo,
    FormatInfo,
    FormatInfoType,
    FormatSection,
    ParsedFormatSection,
} from './types';
import {
    reCurrencySymbols,
    u_DAY,
    u_HOUR,
    u_MIN,
    u_MONTH,
    u_SEC,
    u_YEAR,
} from './constants';

function isParsedSection(part: FormatSection | undefined): part is ParsedFormatSection {
    return !!part && 'scale' in part;
}

function isGenerated(part: FormatSection | undefined): boolean {
    return !!part && 'generated' in part && Boolean(part.generated);
}

export function isPercent(partitions: Array<FormatSection | undefined>): boolean {
    return !!(
        (isParsedSection(partitions[0]) && partitions[0].percent) ||
        (isParsedSection(partitions[1]) && partitions[1].percent) ||
        (isParsedSection(partitions[2]) && partitions[2].percent) ||
        (isParsedSection(partitions[3]) && partitions[3].percent)
    );
}

export function isDate(partitions: Array<FormatSection | undefined>): boolean {
    return !!(
        (isParsedSection(partitions[0]) && partitions[0].date) ||
        (isParsedSection(partitions[1]) && partitions[1].date) ||
        (isParsedSection(partitions[2]) && partitions[2].date) ||
        (isParsedSection(partitions[3]) && partitions[3].date)
    );
}

export function isText(partitions: Array<FormatSection | undefined>): boolean {
    const [part1, part2, part3, part4] = partitions;
    return !!(
        (!part1 || isGenerated(part1)) &&
        (!part2 || isGenerated(part2)) &&
        (!part3 || isGenerated(part3)) &&
        isParsedSection(part4) && part4.text && !isGenerated(part4)
    );
}

const level: Record<FormatInfoType, number> = {
    text: 15,
    datetime: 10.8,
    date: 10.8,
    time: 10.8,
    percent: 10.6,
    currency: 10.4,
    grouped: 10.2,
    scientific: 6,
    number: 4,
    fraction: 2,
    general: 0,
    error: 0,
};

const dateCodes: ReadonlyArray<readonly [prefix: string, code: number]> = [
    ['DMY', 1],
    ['DM', 2],
    ['MY', 3],
    ['MDY', 4],
    ['MD', 5],
    ['hmsa', 6],
    ['hma', 7],
    ['hms', 8],
    ['hm', 9],
];

// eslint-disable-next-line max-lines-per-function, complexity
export function info(
    partitions: Array<FormatSection | undefined>,
    currencyId: string | null = null
): FormatInfo {
    const [partPositive, partNegative] = partitions;
    if (!partPositive) {
        throw new TypeError('Cannot read properties of undefined (reading \'frac_max\')');
    }

    const positive = isParsedSection(partPositive) ? partPositive : undefined;
    const negative = isParsedSection(partNegative) ? partNegative : undefined;
    const isError = 'error' in partPositive;
    const fracMax = positive?.frac_max;
    const output: FormatInfo = {
        type: 'general',
        isDate: isDate(partitions),
        isText: isText(partitions),
        isPercent: isPercent(partitions),
        maxDecimals: positive?.general ? 9 : (fracMax ?? 0),
        scale: positive?.scale ?? 1,
        color: 0,
        parentheses: 0,
        grouped: positive?.grouping ? 1 : 0,
        code: '',
        level: 0,
    };

    // Currency identifier may be passed in, but otherwise report known glyphs.
    const isCurrency = !output.isDate && !output.isText && !isError && partPositive.tokens.some((token) => (
        token.type === 'string' &&
        typeof token.value === 'string' &&
        (currencyId ? token.value === currencyId : reCurrencySymbols.test(token.value))
    ));

    let codeType = 'G';
    let codeNumber: number | '' = fracMax !== undefined && fracMax >= 0 ? Math.min(15, fracMax) : '';
    let codeParentheses = '';
    let codeDash = '';

    if (negative?.color) {
        codeDash = '-';
        output.color = 1;
    }
    if (positive?.parens) {
        codeParentheses = '()';
        output.parentheses = 1;
    }

    if (isCurrency) {
        codeType = 'C';
        output.type = 'currency';
    } else if (isError) {
        output.type = 'error';
        output.maxDecimals = 0;
    } else if (output.isDate) {
        let haveTime = 0;
        let haveDate = 0;
        let order = '';
        // Excel checks order and then ignores trailing tokens.
        partPositive.tokens.forEach((token) => {
            const type = token.type;
            if (/^(b-)?year/.test(type)) {
                order += 'Y';
                haveDate++;
            } else if (type.startsWith('month')) {
                order += 'M';
                haveDate++;
            } else if (/^(week)?day/.test(type)) {
                order += 'D';
                haveDate++;
            } else if (type === 'hour' || type === 'min' || type === 'sec' || type === 'ampm') {
                order += type[0];
                haveTime++;
            }
        });
        output.type = 'date';
        if (haveDate && haveTime) {
            output.type = 'datetime';
        } else if (!haveDate && haveTime) {
            output.type = 'time';
        }
        const code = dateCodes.find(([prefix]) => order.startsWith(prefix));
        codeType = code ? 'D' : 'G';
        codeNumber = code ? code[1] : '';
    } else if (output.isText) {
        codeType = 'G';
        output.type = 'text';
        codeNumber = '';
        output.maxDecimals = 0;
    } else if (positive?.general) {
        codeType = 'G';
        output.type = 'general';
        codeNumber = '';
    } else if (positive?.fractions) {
        codeType = 'G';
        output.type = 'fraction';
        codeNumber = '';
    } else if (positive?.exponential) {
        codeType = 'S';
        output.type = 'scientific';
    } else if (output.isPercent) {
        codeType = 'P';
        output.type = 'percent';
    } else if (positive?.grouping) {
        codeType = ',';
        output.type = 'grouped';
    } else if (positive && (positive.int_max || fracMax)) {
        codeType = 'F';
        output.type = 'number';
    }

    output.code = codeType + codeNumber + codeDash + codeParentheses;
    output.level = level[output.type];

    return Object.freeze(output);
}

export function dateInfo(partitions: Array<FormatSection | undefined>): FormatDateInfo {
    const [partPositive] = partitions;
    if (!partPositive) {
        throw new TypeError('Cannot read properties of undefined (reading \'date\')');
    }
    const positive = isParsedSection(partPositive) ? partPositive : undefined;
    const date = positive?.date ?? 0;
    return {
        year: !!(date & u_YEAR),
        month: !!(date & u_MONTH),
        day: !!(date & u_DAY),
        hours: !!(date & u_HOUR),
        minutes: !!(date & u_MIN),
        seconds: !!(date & u_SEC),
        clockType: positive?.clock === 12 ? 12 : 24,
    };
}
