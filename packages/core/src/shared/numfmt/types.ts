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

export type ConditionOperator = '<' | '<=' | '=' | '>=' | '>' | '<>';
export type FormatCondition = [ConditionOperator, number];

export interface LocaleToken {
    lang: string;
    language: string;
    territory: string;
}

export interface LocaleData {
    group: string;
    decimal: string;
    positive: string;
    negative: string;
    percent: string;
    exponent: string;
    nan: string;
    infinity: string;
    ampm: string[];
    mmmm6: string[];
    mmm6: string[];
    mmmm: string[];
    mmm: string[];
    dddd: string[];
    ddd: string[];
    bool: string[];
    preferMDY: boolean;
    isDefault?: boolean;
}

export type LocaleSettings = Partial<Omit<LocaleData, 'isDefault'>>;

export interface ParseData<T extends number | boolean = number | boolean> {
    v: T;
    z?: string;
}

export interface NumberDigits {
    total: number;
    digits?: number;
    sign: number;
    period: number;
    int: number;
    frac: number;
}

export interface FormatOptions {
    overflow?: string;
    dateErrorThrows?: boolean;
    dateErrorNumber?: boolean;
    bigintErrorNumber?: boolean;
    dateSpanLarge?: boolean;
    leap1900?: boolean;
    nbsp?: boolean;
    throws?: boolean;
    invalid?: string;
    locale?: string;
    ignoreTimezone?: boolean;
    grouping?: readonly [number, number?];
    indexColors?: boolean;
    skipChar?: string | boolean;
    fillChar?: string | boolean;
}

export interface ResolvedFormatOptions {
    overflow: string;
    dateErrorThrows: boolean;
    dateErrorNumber: boolean;
    bigintErrorNumber: boolean;
    dateSpanLarge: boolean;
    leap1900: boolean;
    nbsp: boolean;
    throws: boolean;
    invalid: string;
    locale: string;
    ignoreTimezone: boolean;
    grouping: readonly [number, number?];
    indexColors: boolean;
    skipChar: string | boolean;
    fillChar: string | boolean;
}

export interface FormatToken {
    raw: string;
    type: string;
    value: any;
    short?: boolean;
}

export interface RenderToken {
    type: string;
    raw?: string;
    value?: string | string[];
    num?: string;
    rule?: 'num' | 'num+int' | 'den';
    volatile?: boolean;
    plus?: boolean;
    size?: number;
    date?: 1;
    pad?: boolean | number;
    decimals?: number;
    short?: boolean;
}

export interface ParsedFormatSection {
    scale: number;
    scaleExponent: number;
    percent: boolean;
    text: boolean;
    date: number;
    date_eval: boolean;
    date_system: number;
    sec_decimals: number;
    general: boolean;
    clock: 12 | 24;
    int_pattern: string[];
    frac_pattern: string[];
    man_pattern: string[];
    den_pattern: string[];
    num_pattern: string[];
    tokens: RenderToken[];
    tokensUsed: number;
    pattern: string;
    int_max: number;
    int_min: number;
    frac_max: number;
    frac_min: number;
    man_max: number;
    man_min: number;
    num_max: number;
    num_min: number;
    den_max: number;
    den_min: number;
    int_p: string;
    man_p: string;
    num_p: string;
    den_p: string;
    integer: boolean;
    parens?: boolean;
    fractions?: boolean;
    grouping?: boolean;
    condition?: FormatCondition | null;
    locale?: string;
    color?: string | number;
    dec_fractions?: boolean;
    exponential?: boolean;
    exp_plus?: boolean;
    denominator?: number;
}

export interface ErrorFormatSection {
    tokens: RenderToken[];
    error: string;
}

export type FormatSection = ParsedFormatSection | ErrorFormatSection;

export interface ParsedPattern {
    pattern: string;
    partitions: Array<FormatSection | undefined>;
    locale?: string | null;
    error?: string;
    info?: FormatInfo;
    dateInfo?: FormatDateInfo;
}

export interface FormatDateInfo {
    year: boolean;
    month: boolean;
    day: boolean;
    hours: boolean;
    minutes: boolean;
    seconds: boolean;
    clockType: 12 | 24;
}

export type FormatInfoType =
    | 'currency'
    | 'date'
    | 'datetime'
    | 'error'
    | 'fraction'
    | 'general'
    | 'grouped'
    | 'number'
    | 'percent'
    | 'scientific'
    | 'text'
    | 'time';

export interface FormatInfo {
    type: FormatInfoType;
    isDate: boolean;
    isText: boolean;
    isPercent: boolean;
    maxDecimals: number;
    color: 0 | 1;
    parentheses: 0 | 1;
    grouped: 0 | 1;
    code: string;
    scale: number;
    level: number;
}

export type DateParts = [number, number, number];
export type DateTimeParts = [number, number, number, number, number, number];
export type FormatColor = string | number | null;
