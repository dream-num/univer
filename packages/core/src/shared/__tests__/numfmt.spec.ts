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

import { describe, expect, it } from 'vitest';
import {
    DEFAULT_NUMBER_FORMAT,
    DEFAULT_TEXT_FORMAT,
    DEFAULT_TEXT_FORMAT_EXCEL,
    getNumfmtParseValueFilter,
    isDefaultFormat,
    isPatternEqualWithoutDecimal,
    isTextFormat,
    numfmt,
} from '../numfmt';

describe('numfmt helpers', () => {
    it('should recognize text and default number formats', () => {
        expect(isTextFormat(DEFAULT_TEXT_FORMAT)).toBe(true);
        expect(isTextFormat(DEFAULT_TEXT_FORMAT_EXCEL)).toBe(true);
        expect(isTextFormat('0.00')).toBe(false);

        expect(isDefaultFormat(null)).toBe(true);
        expect(isDefaultFormat(undefined)).toBe(true);
        expect(isDefaultFormat(DEFAULT_NUMBER_FORMAT)).toBe(true);
        expect(isDefaultFormat('0.00')).toBe(false);
    });

    it('should compare patterns while ignoring decimal precision differences', () => {
        expect(isPatternEqualWithoutDecimal('0.00', '0.0')).toBe(true);
        expect(isPatternEqualWithoutDecimal('$#,##0.00', '$#,##0')).toBe(true);
        expect(isPatternEqualWithoutDecimal('0.00', '0%')).toBe(false);
        expect(isPatternEqualWithoutDecimal('', '0.0')).toBe(false);
    });

    it('should filter invalid parse results and keep valid numfmt parses', () => {
        expect(getNumfmtParseValueFilter('1 23')).toBeNull();
        expect(getNumfmtParseValueFilter('5A')).toBeNull();
        expect(getNumfmtParseValueFilter('1000,')).toBeNull();
        expect(getNumfmtParseValueFilter('1,00,0')).toBeNull();

        expect(getNumfmtParseValueFilter('2/3')?.z).toBe('m/d');
        expect(getNumfmtParseValueFilter('5 A')?.z).toBe('h:mm AM/PM');
        expect(getNumfmtParseValueFilter('$1000')?.z).toBe('$#,##0');
        expect(getNumfmtParseValueFilter('25%')?.z).toBe('0%');
    });
});

describe('numfmt compatibility regression tests', () => {
    describe('numfmt.format', () => {
        it('should format numbers with common patterns', () => {
            expect(numfmt.format('#,##0.00', 1234.5)).toBe('1,234.50');
            expect(numfmt.format('0.00', 12.3)).toBe('12.30');
            expect(numfmt.format('0%', 0.25)).toBe('25%');
            expect(numfmt.format('0.00%', 0.255)).toBe('25.50%');
            expect(numfmt.format('$#,##0', 1000)).toBe('$1,000');
            expect(numfmt.format('General', 123)).toBe('123');
        });

        it('should handle locale formatting', () => {
            expect(numfmt.format('#,##0.00', 1234.5, { locale: 'en' })).toBe('1,234.50');
        });

        it('should not throw when throws option is false', () => {
            expect(numfmt.format('[invalid', 42, { throws: false })).toBe('######');
        });
    });

    describe('Excel-compatible decimal rounding', () => {
        it.each([
            [10.155, '0.00', '10.16'],
            [1.005, '0.00', '1.01'],
            [2.155, '0.00', '2.16'],
            [-10.155, '0.00', '-10.16'],
            [-1.005, '0.00', '-1.01'],
            [-2.155, '0.00', '-2.16'],
            [1.00499999999999, '0.00', '1.00'],
            [1.00500000000001, '0.00', '1.01'],
            [9.995, '0.00', '10.00'],
            [0.10155, '0.00%', '10.16%'],
            [10155, '0.00,', '10.16'],
            [-0.004, '0.00', '0.00'],
            [0.1 + 0.2, '0.000000000000000', '0.300000000000000'],
            [999999999999999, '0.00', '999999999999999.00'],
            [450000000000000.44, '0.00', '450000000000000.00'],
        ])('formats %s with %s as %s', (value, pattern, expected) => {
            expect(numfmt.format(pattern, value)).toBe(expected);
        });

        it.each([
            [2.155, '0.00E+00', '2.16E+00'],
            [-2.155, '0.00E+00', '-2.16E+00'],
            [9.995, '0.00E+00', '1.00E+01'],
            [-9.995, '0.00E+00', '-1.00E+01'],
            [1.0155e20, '0.00E+00', '1.02E+20'],
            [1.0155e-20, '0.00E+00', '1.02E-20'],
            [1e308, '0.00E+00', '1.00E+308'],
            [1e-308, '0.00E+00', '1.00E-308'],
        ])('formats scientific value %s', (value, pattern, expected) => {
            expect(numfmt.format(pattern, value)).toBe(expected);
        });

        it('rounds through the public decimal API', () => {
            expect(numfmt.round(10.155, 2)).toBe(10.16);
            expect(numfmt.round(1.005, 2)).toBe(1.01);
            expect(numfmt.round(-1.005, 2)).toBe(-1.01);
            expect(Object.is(numfmt.round(-0.004, 2), -0)).toBe(false);
        });

        it.each([
            [Number.MAX_SAFE_INTEGER, undefined, Number.MAX_SAFE_INTEGER],
            [Number.MIN_SAFE_INTEGER, undefined, Number.MIN_SAFE_INTEGER],
            [Number.MAX_VALUE, undefined, Number.MAX_VALUE],
            [1.5, Number.NaN, 2],
            [1.5, Number.POSITIVE_INFINITY, Number.NaN],
            [1.5, Number.NEGATIVE_INFINITY, 2],
            [1.15, 1.9, 1.2],
            [1.23456789, 1_000_000, 1.23456789],
            [Number.MAX_VALUE, -308, Number.MAX_VALUE],
            [1.23, -1_000_000, 0],
        ])('rounds public boundary %s at %s places', (value, places, expected) => {
            expect(numfmt.round(value, places)).toBe(expected);
        });

        it('preserves public round passthrough values', () => {
            expect(numfmt.round('text')).toBe('text');
            expect(numfmt.round(Number.NaN, 2)).toBeNaN();
            expect(numfmt.round(Number.POSITIVE_INFINITY, 2)).toBe(Number.POSITIVE_INFINITY);
            expect(numfmt.round(Number.NEGATIVE_INFINITY, 2)).toBe(Number.NEGATIVE_INFINITY);
            expect(Object.is(numfmt.round(-0), -0)).toBe(false);
        });

        it.each([
            [1.234565e11, '1.23457E+11'],
            [-1.234565e11, '-1.23457E+11'],
            [9.999995e11, '1E+12'],
            [-9.999995e11, '-1E+12'],
        ])('formats General decimal tie %s', (value, expected) => {
            expect(numfmt.format('General', value)).toBe(expected);
        });

        it('preserves legacy rounding for vulgar fractions', () => {
            expect(numfmt.format('# ?/11', 0.6818181818181818)).toBe(' 7/11');
        });

        it('preserves legacy rounding for BigInt scientific fallback', () => {
            expect(numfmt.format('0.00E+00', 1005000n)).toBe('1.00E+06');
        });

        it('preserves legacy rounding for BigInt General fallback', () => {
            expect(numfmt.format('General', 999999500000000n)).toBe('10E+14');
        });
    });

    describe('numfmt.formatColor', () => {
        it('should return color for colored patterns', () => {
            expect(numfmt.formatColor('[red]0', 42)).toBe('red');
            expect(numfmt.formatColor('[blue]0', -1)).toBe('blue');
            expect(numfmt.formatColor('0', 42)).toBeNull();
        });
    });

    describe('numfmt.parseDate', () => {
        it('should parse date strings', () => {
            expect(numfmt.parseDate('asdasdasd')).toBeNull();
            expect(numfmt.parseDate('1988/12/12 21:21:21')?.z).toBe('yyyy/mm/dd hh:mm:ss');
            expect(numfmt.parseDate('12/12 21:21:21')?.z).toBe('mm/dd hh:mm:ss');
            expect(numfmt.parseDate('2012/12 21:21:21')?.z).toBe('yyyy/m hh:mm:ss');
            expect(numfmt.parseDate('2012/12 21:21')?.z).toBe('yyyy/m hh:mm');
            expect(numfmt.parseDate('2012/12')?.z).toBe('yyyy/m');
            expect(numfmt.parseDate('2012/12/12')?.z).toBe('yyyy/mm/dd');
            expect(numfmt.parseDate('21:21')).toBeNull();
        });
    });

    describe('numfmt.parseTime', () => {
        it('should parse time strings', () => {
            expect(numfmt.parseTime('12:30')?.z).toBe('hh:mm');
            expect(numfmt.parseTime('25:00')).toBeNull();
        });
    });

    describe('numfmt.parseNumber', () => {
        it('should parse number strings', () => {
            expect(numfmt.parseNumber('25%')?.z).toBe('0%');
            expect(numfmt.parseNumber('$1000')?.z).toBe('$#,##0');
            expect(numfmt.parseNumber('1,00,0')?.z).toBe('#,##0');
        });
    });

    describe('numfmt.parseValue', () => {
        it('should parse mixed values (date/time/number)', () => {
            expect(numfmt.parseValue('25%')?.z).toBe('0%');
            expect(numfmt.parseValue('1988/12/12')?.z).toBe('yyyy/mm/dd');
            expect(numfmt.parseValue('12:30')?.z).toBe('hh:mm');
            expect(numfmt.parseValue('not-a-value')).toBeNull();
        });
    });

    describe('numfmt.getFormatInfo', () => {
        it('should return type information', () => {
            expect(numfmt.getFormatInfo('0%').type).toBe('percent');
            expect(numfmt.getFormatInfo('yyyy/mm/dd').isDate).toBe(true);
            expect(numfmt.getFormatInfo('#,##0.00').isDate).toBe(false);
        });

        it('should return maxDecimals', () => {
            expect(numfmt.getFormatInfo('0.00').maxDecimals).toBe(2);
            expect(numfmt.getFormatInfo('0').maxDecimals).toBe(0);
            expect(numfmt.getFormatInfo('General').maxDecimals).toBe(9);
        });
    });

    describe('numfmt.tokenize', () => {
        it('should tokenize patterns correctly', () => {
            const tokens = numfmt.tokenize('0.00');
            expect(tokens.length).toBeGreaterThan(0);
            expect(tokens.some((t) => t.type === numfmt.tokenTypes.POINT)).toBe(true);
            expect(tokens.some((t) => t.type === numfmt.tokenTypes.ZERO)).toBe(true);
        });

        it('should tokenize colored patterns', () => {
            const tokens = numfmt.tokenize('[red]0.00');
            expect(tokens.some((t) => t.type === numfmt.tokenTypes.COLOR)).toBe(true);
        });

        it('should tokenize patterns with minus', () => {
            const tokens = numfmt.tokenize('-0.00');
            expect(tokens.some((t) => t.type === numfmt.tokenTypes.MINUS)).toBe(true);
        });

        it('should tokenize patterns with grouping', () => {
            const tokens = numfmt.tokenize('#,##0');
            expect(tokens.some((t) => t.type === numfmt.tokenTypes.GROUP)).toBe(true);
        });
    });

    describe('numfmt.tokenTypes', () => {
        it('should expose expected token type constants', () => {
            expect(typeof numfmt.tokenTypes.POINT).toBe('string');
            expect(typeof numfmt.tokenTypes.ZERO).toBe('string');
            expect(typeof numfmt.tokenTypes.COLOR).toBe('string');
            expect(typeof numfmt.tokenTypes.MINUS).toBe('string');
            expect(typeof numfmt.tokenTypes.GROUP).toBe('string');
        });
    });
});
