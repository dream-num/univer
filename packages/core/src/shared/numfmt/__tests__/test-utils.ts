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

// @vitest-environment node

import type { FormatColor, FormatDateInfo, FormatInfo, FormatOptions } from '../types';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { expect, it } from 'vitest';
import { format, formatColor, getFormatDateInfo, getFormatInfo } from '../api';

export interface INumfmtTestContext {
    equal(actual: unknown, expected: unknown, message?: string): void;
    deepEqual(actual: unknown, expected: unknown, message?: string): void;
    deepLooseEqual(actual: unknown, expected: unknown, message?: string): void;
    ok(actual: unknown, message?: string): void;
    throws(action: () => unknown, message?: string): void;
    format(
        pattern: string,
        value: unknown,
        expected: string,
        options?: FormatOptions
    ): void;
    validFormat(pattern: string, details?: unknown): void;
    formatColor(
        pattern: string,
        value: unknown,
        expected: FormatColor,
        options?: FormatOptions
    ): void;
    formatInvalid(pattern: string, options?: unknown): void;
    formatThrows(
        pattern: string,
        value: unknown,
        expected?: string | RegExp,
        options?: FormatOptions
    ): void;
    assertInfo(pattern: string, expected: Partial<FormatInfo>): void;
    assertDateInfo(pattern: string, expected: Partial<FormatDateInfo>): void;
}

const COMMON_INFO: Omit<FormatInfo, 'type' | 'code'> & {
    type?: FormatInfo['type'];
    code?: string;
} = {
    isDate: false,
    isText: false,
    isPercent: false,
    maxDecimals: 0,
    grouped: 0,
    parentheses: 0,
    color: 0,
    scale: 1,
    level: 0,
};

const COMMON_DATE_INFO: FormatDateInfo = {
    year: false,
    month: false,
    day: false,
    hours: false,
    minutes: false,
    seconds: false,
    clockType: 24,
};

function createContext(): INumfmtTestContext {
    return {
        equal(actual, expected, message) {
            expect(actual, message).toBe(expected);
        },
        deepEqual(actual, expected, message) {
            expect(actual, message).toEqual(expected);
        },
        deepLooseEqual(actual, expected, message) {
            expect(actual, message).toEqual(expected);
        },
        ok(actual, message) {
            expect(actual, message).toBeTruthy();
        },
        throws(action, message) {
            expect(action, message).toThrow();
        },
        format(pattern, value, expected, options = {}) {
            expect(format(pattern, value, options), pattern).toBe(expected);
        },
        validFormat(pattern) {
            expect(() => format(pattern, 1), pattern).not.toThrow();
        },
        formatColor(pattern, value, expected, options = {}) {
            expect(formatColor(pattern, value, options), pattern).toBe(expected);
        },
        formatInvalid(pattern, options) {
            expect(
                () => format(pattern, '', options as FormatOptions),
                pattern
            ).toThrow();
        },
        formatThrows(pattern, value, expected, options = {}) {
            const assertion = expect(
                () => format(pattern, value, options),
                typeof expected === 'string' ? expected : pattern
            );
            if (expected instanceof RegExp) {
                assertion.toThrow(expected);
            } else {
                assertion.toThrow();
            }
        },
        assertInfo(pattern, expected) {
            expect(getFormatInfo(pattern), pattern).toEqual({
                ...COMMON_INFO,
                ...expected,
            });
        },
        assertDateInfo(pattern, expected) {
            expect(getFormatDateInfo(pattern), pattern).toEqual({
                ...COMMON_DATE_INFO,
                ...expected,
            });
        },
    };
}

function runNumfmtTestBody(body: (context: INumfmtTestContext) => void): void {
    const previousTimezone = process.env.TZ;
    try {
        body(createContext());
    } finally {
        if (previousTimezone === undefined) {
            delete process.env.TZ;
        } else {
            process.env.TZ = previousTimezone;
        }
    }
}

interface INumfmtTest {
    (name: string, body: (context: INumfmtTestContext) => void): void;
    skip(name: string, body: (context: INumfmtTestContext) => void): void;
}

export const numfmtTest: INumfmtTest = Object.assign(
    (name: string, body: (context: INumfmtTestContext) => void): void => {
        it(name, () => runNumfmtTestBody(body));
    },
    {
        skip(name: string, body: (context: INumfmtTestContext) => void): void {
            it.skip(name, () => runNumfmtTestBody(body));
        },
    }
);

export type TableFixture =
    | 'cal-updated.tsv.gz'
    | 'ssf-dates.tsv.gz'
    | 'ssf-times.tsv.gz'
    | 'ssf-times-full.tsv.gz';

export function numfmtTableTest(title: string, fixture: TableFixture): void {
    const enabled =
        process.env.NUMFMT_TABLE_TESTS === '1' ||
        process.env.NUMFMT_FULL_TABLE_TESTS === '1';

    it.skipIf(!enabled)(title, () => {
        const filename = fileURLToPath(new URL(`./fixtures/${fixture}`, import.meta.url));
        const table = gunzipSync(readFileSync(filename))
            .toString('utf8')
            .replace(/\r/g, '')
            .split('\n')
            .map((row) => row.replace(/#{255}/g, '').split('\t'));
        const headers = table[0].slice(1);
        let failureCount = 0;
        const diagnostics: string[] = [];

        headers.forEach((pattern, patternIndex) => {
            for (let rowIndex = 1; rowIndex < table.length; rowIndex++) {
                const row = table[rowIndex];
                if (!row[0]) {
                    break;
                }

                const expected = row[patternIndex + 1] === '######'
                    ? '#VALUE!'
                    : row[patternIndex + 1];
                let actual: string;

                try {
                    actual = format(pattern, Number.parseFloat(row[0]), {
                        dateSpanLarge: false,
                        dateErrorNumber: false,
                        dateErrorThrows: true,
                    });
                } catch {
                    actual = '#VALUE!';
                }

                if (actual !== expected) {
                    failureCount++;
                    if (diagnostics.length < 50) {
                        diagnostics.push(
                            `${String(rowIndex - 1)}: numfmt(${pattern}, ${
                                row[0]}) => ${actual} !== ${expected}`
                        );
                    }
                }
            }
        });

        expect(failureCount, diagnostics.join('\n')).toBe(0);
    });
}

export function getTimeZoneName(): string {
    const dateString = new Date().toString();
    return dateString.replace(/^.*GMT\+\d{4} \((.*?)\)$/, '$1');
}

export function getTimeZoneOffset(date: Date): number {
    const utc = new Date();
    utc.setUTCFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    utc.setUTCHours(
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds()
    );
    return (date.getTime() - utc.getTime()) / 60000;
}

export function isLeapYear(year: number): boolean {
    return Boolean((!(year % 4) && year % 100) || !(year % 400));
}
