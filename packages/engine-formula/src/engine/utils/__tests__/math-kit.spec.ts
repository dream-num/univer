/**
 * Copyright 2023-present DreamNum Inc.
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
import { ceil, divide, equals, floor, greaterThan, greaterThanOrEquals, lessThan, lessThanOrEquals, minus, mod, multiply, plus, pow, round, sqrt, truncateNumber } from '../math-kit';

describe('Test math kit', () => {
    it('Function truncateNumber', () => {
        expect(truncateNumber('1234567890123456')).toBe(1234567890123450);
        expect(truncateNumber('123.4567890123456789')).toBe(123.456789012345);
        expect(truncateNumber('0.1234567890123456789')).toBe(0.123456789012345);
        expect(truncateNumber('1.234567890123456e+20')).toBe(123456789012345000000);
        expect(truncateNumber('123456789012345')).toBe(123456789012345);
        expect(truncateNumber('0.000000000000123456')).toBe(0.000000000000123456);
        expect(truncateNumber('0.7000000000000001')).toBe(0.7);
        expect(truncateNumber(0.1 + 0.2)).toBe(0.3);
    });
    it('Function plus', () => {
        expect(truncateNumber(plus(1, 2))).toBe(3);
        expect(truncateNumber(plus(0.1, 0.2))).toBe(0.3);
        expect(truncateNumber(plus(0.7, 0.1))).toBe(0.8);
        expect(truncateNumber(plus(0.0000000000001, 0.0000000000002))).toBe(0.0000000000003);
    });

    it('Function minus', () => {
        expect(truncateNumber(minus(2, 1))).toBe(1);
        expect(truncateNumber(minus(0.3, 0.1))).toBe(0.2);
        expect(truncateNumber(minus(0.8, 0.1))).toBe(0.7);
        expect(truncateNumber(minus(0.0000000000003, 0.0000000000002))).toBe(0.0000000000001);
    });

    it('Function multiply', () => {
        expect(truncateNumber(multiply(2, 3))).toBe(6);
        expect(truncateNumber(multiply(0.1, 0.2))).toBe(0.02);
        expect(truncateNumber(multiply(0.7, 0.1))).toBe(0.07);
        expect(truncateNumber(multiply(0.0000000000001, 0.0000000000002))).toBe(2e-26);
        expect(truncateNumber(multiply(0.6789, 10000))).toBe(6789);
    });

    it('Function divide', () => {
        expect(truncateNumber(divide(6, 3))).toBe(2);
        expect(truncateNumber(divide(0.02, 0.1))).toBe(0.2);
        expect(truncateNumber(divide(0.07, 0.1))).toBe(0.7);
        expect(truncateNumber(divide(0.3, 0.1))).toBe(3);
        expect(truncateNumber(divide(0.00000000000000002, 0.0000000000001))).toBe(0.0002);
    });

    it('Function divide with zero', () => {
        expect(divide(6, 0)).toBe(Infinity);
        expect(divide(0.02, 0)).toBe(Infinity);
        expect(divide(0.07, 0)).toBe(Infinity);
        expect(divide(0.3, 0)).toBe(Infinity);
        expect(divide(0.00000000000000002, 0)).toBe(Infinity);
    });

    it('Function divide with negative zero', () => {
        expect(divide(6, -0)).toBe(-Infinity);
        expect(divide(0.02, -0)).toBe(-Infinity);
        expect(divide(0.07, -0)).toBe(-Infinity);
        expect(divide(0.3, -0)).toBe(-Infinity);
        expect(divide(0.00000000000000002, -0)).toBe(-Infinity);
    });

    // test round
    it('Function round', () => {
        expect(round(1.23456789, 2)).toBe(1.23);
        expect(round(1.235, 2)).toBe(1.24);
        expect(round(1.23456789, 0)).toBe(1);
        expect(round(1.23456789, 1)).toBe(1.2);
        expect(round(1.23456789, 3)).toBe(1.235);
        expect(round(1.23456789, 4)).toBe(1.2346);
        expect(round(1.23456789, 5)).toBe(1.23457);
    });
    // test floor
    it('Function floor', () => {
        expect(floor(1.23456789, 2)).toBe(1.23);
        expect(floor(1.235, 2)).toBe(1.23);
        expect(floor(1.23456789, 0)).toBe(1);
        expect(floor(1.23456789, 1)).toBe(1.2);
        expect(floor(1.23456789, 3)).toBe(1.234);
        expect(floor(1.23456789, 4)).toBe(1.2345);
        expect(floor(1.23456789, 5)).toBe(1.23456);
    });

    // test ceil
    it('Function ceil', () => {
        expect(ceil(1.23456789, 2)).toBe(1.24);
        expect(ceil(1.235, 2)).toBe(1.24);
        expect(ceil(1.23456789, 0)).toBe(2);
        expect(ceil(1.23456789, 1)).toBe(1.3);
        expect(ceil(1.23456789, 3)).toBe(1.235);
        expect(ceil(1.23456789, 4)).toBe(1.2346);
        expect(ceil(1.23456789, 5)).toBe(1.23457);
    });

    // test mod
    it('Function mod', () => {
        expect(mod(5, 2)).toBe(1);
        expect(mod(5, 3)).toBe(2);
        expect(mod(5, 4)).toBe(1);
        expect(mod(5, 5)).toBe(0);
        expect(mod(5, 6)).toBe(5);
    });

    // test pow
    it('Function pow', () => {
        expect(pow(2, 3)).toBe(8);
        expect(pow(2, 0)).toBe(1);
        expect(pow(2, 1)).toBe(2);
        expect(pow(2, 2)).toBe(4);
        expect(pow(2, -1)).toBe(0.5);
        expect(pow(2, -2)).toBe(0.25);
        expect(pow(2, -3)).toBe(0.125);
    });
    // test sqrt
    it('Function sqrt', () => {
        expect(sqrt(4)).toBe(2);
        expect(sqrt(9)).toBe(3);
        expect(sqrt(16)).toBe(4);
        expect(sqrt(25)).toBe(5);
        expect(sqrt(36)).toBe(6);
        expect(sqrt(49)).toBe(7);
        expect(sqrt(64)).toBe(8);
        expect(sqrt(81)).toBe(9);
        expect(sqrt(100)).toBe(10);
        expect(sqrt(2)).toBe(1.4142135623730951);
    });
    // test equals
    it('Function equals', () => {
        expect(equals(1, 1)).toBe(true);
        expect(equals(1, 2)).toBe(false);
        expect(equals(1.1, 1.1)).toBe(true);
        expect(equals(1.1, 1.2)).toBe(false);
        expect(equals(1.11, 1.11)).toBe(true);
        expect(equals(1.11, 1.12)).toBe(false);
    });
    // test greaterThan
    it('Function greaterThan', () => {
        expect(greaterThan(1, 1)).toBe(false);
        expect(greaterThan(1, 2)).toBe(false);
        expect(greaterThan(2, 1)).toBe(true);
        expect(greaterThan(1.1, 1.1)).toBe(false);
        expect(greaterThan(1.1, 1.2)).toBe(false);
        expect(greaterThan(1.2, 1.1)).toBe(true);
        expect(greaterThan(1.11, 1.11)).toBe(false);
        expect(greaterThan(1.11, 1.12)).toBe(false);
        expect(greaterThan(1.12, 1.11)).toBe(true);
    });
    // test greaterThanOrEquals
    it('Function greaterThanOrEquals', () => {
        expect(greaterThanOrEquals(1, 1)).toBe(true);
        expect(greaterThanOrEquals(1, 2)).toBe(false);
        expect(greaterThanOrEquals(2, 1)).toBe(true);
        expect(greaterThanOrEquals(1.1, 1.1)).toBe(true);
        expect(greaterThanOrEquals(1.1, 1.2)).toBe(false);
        expect(greaterThanOrEquals(1.2, 1.1)).toBe(true);
        expect(greaterThanOrEquals(1.11, 1.11)).toBe(true);
        expect(greaterThanOrEquals(1.11, 1.12)).toBe(false);
        expect(greaterThanOrEquals(1.12, 1.11)).toBe(true);
    });
    // test lessThan
    it('Function lessThan', () => {
        expect(lessThan(1, 1)).toBe(false);
        expect(lessThan(1, 2)).toBe(true);
        expect(lessThan(2, 1)).toBe(false);
        expect(lessThan(1.1, 1.1)).toBe(false);
        expect(lessThan(1.1, 1.2)).toBe(true);
        expect(lessThan(1.2, 1.1)).toBe(false);
        expect(lessThan(1.11, 1.11)).toBe(false);
        expect(lessThan(1.11, 1.12)).toBe(true);
    });
    // test lessThanOrEquals
    it('Function lessThanOrEquals', () => {
        expect(lessThanOrEquals(1, 1)).toBe(true);
        expect(lessThanOrEquals(1, 2)).toBe(true);
        expect(lessThanOrEquals(2, 1)).toBe(false);
        expect(lessThanOrEquals(1.1, 1.1)).toBe(true);
        expect(lessThanOrEquals(1.1, 1.2)).toBe(true);
        expect(lessThanOrEquals(1.2, 1.1)).toBe(false);
        expect(lessThanOrEquals(1.11, 1.11)).toBe(true);
        expect(lessThanOrEquals(1.11, 1.12)).toBe(true);
    });
});
