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
import { stripErrorMargin } from '../../engine/utils/math-kit';
import { excelDateSerial, excelDateTimeSerial, excelSerialToDate, formatDateDefault, isValidDateStr } from '../date';

describe('Test date', () => {
    it('Function excelDateSerial', () => {
        expect(excelDateSerial(new Date(1900, 1, 28))).toBe(59);
        expect(excelDateSerial(new Date(1900, 1, 29))).toBe(61);
        expect(excelDateSerial(new Date(1900, 2, 1))).toBe(61);
        expect(excelDateSerial(new Date(1901, 0, 1))).toBe(367);
        expect(excelDateSerial(new Date(2024, 1, 2))).toBe(45324);
    });

    it('Function excelDateSerial should account for hours, minutes, and seconds', () => {
        // Testing midday, which is exactly half of a day
        expect(excelDateTimeSerial(new Date(Date.UTC(2024, 0, 2, 12, 0, 0)))).toBe(45293.5);
        // Testing exact hour, which is a quarter of a day
        expect(excelDateTimeSerial(new Date(Date.UTC(2024, 0, 2, 6, 0, 0)))).toBe(45293.25);
        // Testing minutes and seconds
        expect(stripErrorMargin(excelDateTimeSerial(new Date(Date.UTC(2024, 0, 2, 1, 2, 3))))).toBe(45293.0430902778);
        expect(stripErrorMargin(excelDateTimeSerial(new Date(Date.UTC(2024, 5, 24, 15, 10, 0))))).toBe(45467.6319444444);
    });

    it('Function excelSerialToDate', () => {
        expect(formatDateDefault(excelSerialToDate(59))).toBe('1900/02/28');
        expect(formatDateDefault(excelSerialToDate(61))).toBe('1900/03/01');
        expect(formatDateDefault(excelSerialToDate(367))).toBe('1901/01/01');
        expect(formatDateDefault(excelSerialToDate(45324))).toBe('2024/02/02');
    });
    it('Function isValidDateStr', () => {
        expect(isValidDateStr('2020-1-1')).toBeTruthy();
        expect(isValidDateStr('2020/1/31')).toBeTruthy();
        expect(isValidDateStr('2020-2-31')).toBeFalsy();
        expect(isValidDateStr('2020/001/31')).toBeFalsy();
    });
});
