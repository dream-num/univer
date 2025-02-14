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
import { above, below, getBottomN, getTopN, thisWeek, today, tomorrow, yesterday } from '../condition/dynamicGenerator';

describe('dynamic test', () => {
    it('above text', () => {
        const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const avg = arr.reduce((a, b) => a + b) / arr.length;

        expect(above(1, avg)).toBe(false);
        expect(above(6, avg)).toBe(true);
    });
    it('below text', () => {
        const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const avg = arr.reduce((a, b) => a + b) / arr.length;

        expect(below(1, avg)).toBe(true);
        expect(below(6, avg)).toBe(false);
    });
    it('getTopN test', () => {
        const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        expect(getTopN(arr, 5, 4)).toMatchObject(false);
        expect(getTopN(arr, 5, 6)).toMatchObject(true);
    });
    it('getBottomN test', () => {
        const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        expect(getBottomN(arr, 5, 4)).toMatchObject(true);
        expect(getBottomN(arr, 5, 6)).toMatchObject(false);
    });
    it('today test', () => {
        const date = new Date();
        expect(today(date)).toBe(true);
    });
    it('today test2', () => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        expect(today(date)).toBe(true);
    });
    it('tomorrow test', () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        expect(tomorrow(date)).toBe(true);
    });
    it('yesterday test', () => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        expect(yesterday(date)).toBe(true);
    });
    it('thisWeek test', () => {
        const date = new Date();
        expect(thisWeek(date)).toBe(true);

        date.setDate(date.getDate() - 7);
        expect(thisWeek(date)).toBe(false);
    });
});
