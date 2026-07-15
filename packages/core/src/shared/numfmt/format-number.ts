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
    FormatColor,
    FormatSection,
    ParsedFormatSection,
    ParsedPattern,
    ResolvedFormatOptions,
} from './types';
import { indexColors, TOKEN_TEXT } from './constants';
import { decimalFromNumber } from './decimal';
import { defaultLocale, getLocale } from './locale';
import { parseFormatSection } from './parse-format-section';
import { runPart } from './run-part';

const defaultText = parseFormatSection([
    { type: TOKEN_TEXT, value: '@', raw: '@' },
]);

function isParsedSection(part: FormatSection | undefined): part is ParsedFormatSection {
    return !!part && 'scale' in part;
}

function getPart(
    value: number | bigint,
    parts: Array<FormatSection | undefined>
): FormatSection | undefined {
    for (let partIndex = 0; partIndex < 3; partIndex++) {
        const part = parts[partIndex];
        if (isParsedSection(part)) {
            let condition: boolean | undefined;
            if (part.condition) {
                const operator = part.condition[0];
                const operand = part.condition[1];
                if (operator === '=') {
                    condition = value === operand;
                } else if (operator === '>') {
                    condition = value > operand;
                } else if (operator === '<') {
                    condition = value < operand;
                } else if (operator === '>=') {
                    condition = value >= operand;
                } else if (operator === '<=') {
                    condition = value <= operand;
                } else if (operator === '<>') {
                    condition = value !== operand;
                }
            } else {
                condition = true;
            }
            if (condition) {
                return part;
            }
        } else if (part) {
            return part;
        }
    }
    return undefined;
}

export function formatColor(
    value: unknown,
    pattern: ParsedPattern,
    options: ResolvedFormatOptions
): FormatColor {
    const parts = pattern.partitions;
    let part = parts[3];
    let color: FormatColor = null;
    if (
        (typeof value === 'number' || typeof value === 'bigint') &&
        // Preserve numfmt 3.2.6, including its BigInt coercion behavior here.
        // eslint-disable-next-line unicorn/prefer-number-properties
        isFinite(value as number)
    ) {
        part = getPart(value, parts);
    }
    if (isParsedSection(part) && part.color) {
        color = part.color;
    }
    if (color && typeof color === 'number' && options.indexColors) {
        color = indexColors[color - 1] || '#000';
    }
    return color;
}

export function formatValue(
    value: unknown,
    pattern: ParsedPattern,
    options: ResolvedFormatOptions
): string {
    const parts = pattern.partitions;
    const locale = getLocale(pattern.locale || options.locale);
    let renderValue = value;
    // not a number?
    const textPart = parts[3] ? parts[3] : defaultText;
    if (typeof renderValue === 'boolean') {
        const resolvedLocale = locale || defaultLocale;
        renderValue = resolvedLocale.bool[renderValue ? 0 : 1];
    }
    if (renderValue == null) {
        return '';
    }
    const isBigInt = typeof renderValue === 'bigint';
    if (typeof renderValue !== 'number' && !isBigInt) {
        return runPart(renderValue, textPart, options, locale);
    }
    // guard against non-finite numbers:
    if (!isBigInt && !Number.isFinite(renderValue)) {
        const resolvedLocale = locale || defaultLocale;
        if (Number.isNaN(renderValue)) {
            return resolvedLocale.nan;
        }
        return ((renderValue as number) < 0 ? resolvedLocale.negative : '') + resolvedLocale.infinity;
    }
    // find and run the pattern part that applies to this number
    const part = getPart(value as number | bigint, parts);
    const decimalValue =
        part && typeof value === 'number' && Number.isFinite(value)
            ? decimalFromNumber(value)
            : null;

    return part
        ? runPart(value, part, options, locale, decimalValue)
        : options.overflow;
}
