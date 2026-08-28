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

import type { FormatSection, ParsedFormatSection, RenderToken } from './types';
import { EPOCH_1900 } from './constants';
import { getValueFormatSection } from './format-number';

type DateComponentType = 'day' | 'month' | 'year';

interface IDateComponent {
    type: DateComponentType;
    pattern: string;
    tokenIndex: number;
}

function isParsedSection(section: FormatSection | undefined): section is ParsedFormatSection {
    return !!section && 'scale' in section;
}

function getDateComponent(token: RenderToken, tokenIndex: number): IDateComponent | null {
    if (token.type === 'year' || token.type === 'year-short') {
        return { type: 'year', pattern: 'yyyy', tokenIndex };
    }
    if (token.type === 'month') {
        return { type: 'month', pattern: token.pad ? 'mm' : 'm', tokenIndex };
    }
    if (token.type === 'day') {
        return { type: 'day', pattern: token.pad ? 'dd' : 'd', tokenIndex };
    }
    return null;
}

function isComplexDateToken(token: RenderToken): boolean {
    return token.type.startsWith('b-year') || token.type.startsWith('monthname') || token.type.startsWith('weekday');
}

function getSeparator(tokens: RenderToken[], leftIndex: number, rightIndex: number): '-' | '/' | null {
    if (rightIndex !== leftIndex + 2) {
        return null;
    }
    const token = tokens[leftIndex + 1];
    return token.value === '-' || token.value === '/' ? token.value : null;
}

function getMissingComponentPattern(components: IDateComponent[], type: 'day' | 'month'): string {
    const related = components.find((component) => component.type === (type === 'day' ? 'month' : 'day'));
    const padded = related?.pattern.length === 2;
    if (type === 'day') {
        return padded ? 'dd' : 'd';
    }
    return padded ? 'mm' : 'm';
}

function completeNumericDatePattern(components: IDateComponent[], separator: '-' | '/'): string | null {
    const types = components.map((component) => component.type).join('');
    if (new Set(components.map((component) => component.type)).size !== components.length) {
        return null;
    }

    const patterns = new Map(components.map((component) => [component.type, component.pattern]));
    patterns.set('year', 'yyyy');
    if (!patterns.has('month')) {
        patterns.set('month', getMissingComponentPattern(components, 'month'));
    }
    if (!patterns.has('day')) {
        patterns.set('day', getMissingComponentPattern(components, 'day'));
    }

    // Preserve an unambiguous existing order; when the year is omitted, put it where Excel exposes it while editing.
    const completeOrder: Record<string, DateComponentType[]> = {
        daymonth: ['day', 'month', 'year'],
        daymonthyear: ['day', 'month', 'year'],
        dayyear: ['day', 'month', 'year'],
        monthday: ['year', 'month', 'day'],
        monthdayyear: ['month', 'day', 'year'],
        monthyear: ['month', 'day', 'year'],
        yearmonth: ['year', 'month', 'day'],
        yearmonthday: ['year', 'month', 'day'],
        yearday: ['year', 'month', 'day'],
    };
    const order = completeOrder[types];
    return order ? order.map((type) => patterns.get(type)).join(separator) : null;
}

function getDatePattern(section: ParsedFormatSection): string | null {
    const components = section.tokens
        .map((token, tokenIndex) => getDateComponent(token, tokenIndex))
        .filter((component): component is IDateComponent => component !== null);
    if (!components.length) {
        return null;
    }
    // Only numeric dates with one consistent '-' or '/' separator are safe to extend without changing their meaning.
    if (
        components.length < 2 ||
        components.length > 3 ||
        section.locale ||
        section.date_system !== EPOCH_1900 ||
        section.tokens.some(isComplexDateToken)
    ) {
        return 'yyyy/mm/dd';
    }

    const separators = components.slice(1).map((component, index) => (
        getSeparator(section.tokens, components[index].tokenIndex, component.tokenIndex)
    ));
    const separator = separators[0];
    if (!separator || separators.some((item) => item !== separator)) {
        return 'yyyy/mm/dd';
    }
    return completeNumericDatePattern(components, separator) ?? 'yyyy/mm/dd';
}

function getTimePattern(section: ParsedFormatSection): string | null {
    const hourIndex = section.tokens.findIndex((token) => token.type === 'hour');
    const minuteToken = section.tokens.find((token) => token.type === 'min');
    const ampmIndex = section.tokens.findIndex((token) => token.type === 'ampm');
    const ampmToken = ampmIndex < 0 ? undefined : section.tokens[ampmIndex];
    const hasTime = hourIndex >= 0 || !!minuteToken || section.tokens.some((token) => token.type === 'sec') || !!ampmToken;
    if (!hasTime) {
        return null;
    }

    const hourToken = hourIndex < 0 ? undefined : section.tokens[hourIndex];
    const hour = hourToken?.pad ? 'hh' : 'h';
    const minute = minuteToken?.pad === false ? 'm' : 'mm';
    const clock = `${hour}:${minute}:ss`;
    if (!ampmToken || typeof ampmToken.value !== 'string') {
        return clock;
    }
    return ampmIndex < hourIndex ? `${ampmToken.value} ${clock}` : `${clock} ${ampmToken.value}`;
}

export function createDateTimeEditPattern(
    partitions: Array<FormatSection | undefined>,
    value: number
): string | null {
    const section = getValueFormatSection(value, partitions);
    if (!isParsedSection(section) || section.tokens.some((token) => token.type.endsWith('-elap'))) {
        return null;
    }

    const datePattern = getDatePattern(section);
    const timePattern = getTimePattern(section);
    if (datePattern && timePattern) {
        return `${datePattern} ${timePattern}`;
    }
    return datePattern ?? timePattern;
}
