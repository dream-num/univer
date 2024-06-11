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
import { dateM1, dateM10, dateM11, dateM12, dateM2, dateM3, dateM4, dateM5, dateM6, dateM7, dateM8, dateM9, dateQ1, dateQ2, dateQ3, dateQ4 } from '../condition/dateGenerator';

describe('date grouping test', () => {
    it('dateM1 test', () => {
        const date = new Date();
        date.setMonth(0, 1);
        expect(dateM1(date)).toBe(true);
    });
    it('dateM2 test', () => {
        const date = new Date();
        date.setMonth(1, 1);
        expect(dateM2(date)).toBe(true);
    });
    it('dateM3 test', () => {
        const date = new Date();
        date.setMonth(2, 1);
        expect(dateM3(date)).toBe(true);
    });
    it('dateM4 test', () => {
        const date = new Date();
        date.setMonth(3, 1);
        expect(dateM4(date)).toBe(true);
    });
    it('dateM5 test', () => {
        const date = new Date();
        date.setMonth(4, 1);
        expect(dateM5(date)).toBe(true);
    });
    it('dateM6 test', () => {
        const date = new Date();
        date.setMonth(5, 1);
        expect(dateM6(date)).toBe(true);
    });
    it('dateM7 test', () => {
        const date = new Date();
        date.setMonth(6, 1);
        expect(dateM7(date)).toBe(true);
    });
    it('dateM8 test', () => {
        const date = new Date();
        date.setMonth(7, 1);
        expect(dateM8(date)).toBe(true);
    });
    it('dateM9 test', () => {
        const date = new Date();
        date.setMonth(8, 1);
        expect(dateM9(date)).toBe(true);
    });
    it('dateM10 test', () => {
        const date = new Date();
        date.setMonth(9, 1);
        expect(dateM10(date)).toBe(true);
    });
    it('dateM11 test', () => {
        const date = new Date();
        date.setMonth(10, 1);
        expect(dateM11(date)).toBe(true);
    });
    it('dateM12 test', () => {
        const date = new Date();
        date.setMonth(11, 1);
        expect(dateM12(date)).toBe(true);
    });
    it('dateQ1 test', () => {
        const date = new Date();
        date.setMonth(0, 1);
        expect(dateQ1(date)).toBe(true);
    });
    it('dateQ2 test', () => {
        const date = new Date();
        date.setMonth(3, 1);
        expect(dateQ2(date)).toBe(true);
    });
    it('dateQ3 test', () => {
        const date = new Date();
        date.setMonth(6, 1);
        expect(dateQ3(date)).toBe(true);
    });
    it('dateQ4 test', () => {
        const date = new Date();
        date.setMonth(9, 1);
        expect(dateQ4(date)).toBe(true);
    });
});

describe('spacial date grouping test', () => {
    it('spacial dateM1 test', () => {
        const date = new Date();
        date.setMonth(0, 31);
        expect(dateM1(date)).toBe(true);
    });
    it('spacial dateM1 test', () => {
        const date = new Date();
        date.setMonth(0, 31);
        date.setMonth(1);
        // in this case, the February 31 is not a valid date, so the date change to March 3
        expect(dateM2(date)).toBe(false);
        expect(dateM3(date)).toBe(true);
    });
});
