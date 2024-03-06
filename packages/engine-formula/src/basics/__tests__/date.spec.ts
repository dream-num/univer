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
import { excelDateSerial, excelSerialToDate, formatDateDefault, isValidDateStr } from '../date';

describe('Test date', () => {
    it('Function excelDateSerial', () => {
        expect(excelDateSerial(new Date(1900, 1, 28))).toBe(59);
        expect(excelDateSerial(new Date(1900, 1, 29))).toBe(61);
        expect(excelDateSerial(new Date(1900, 2, 1))).toBe(61);
        expect(excelDateSerial(new Date(1901, 0, 1))).toBe(367);
        expect(excelDateSerial(new Date(2024, 1, 2))).toBe(45324);
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
