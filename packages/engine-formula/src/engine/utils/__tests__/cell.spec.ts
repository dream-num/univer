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

import type { ICellData } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { ErrorType } from '../../../basics/error-type';
import { extractFormulaError, getCellValue } from '../cell';

describe('Test cell', () => {
    it('Function getCellValue', () => {
        const cell1: ICellData = {
            p: {
                id: 'p',
                body: {
                    dataStream: 'test\r\n',
                },
                documentStyle: {},
            },
        };

        const cell2 = {
            v: 2,
        };

        const cell3 = {
            f: '',
        };

        expect(getCellValue(cell1)).toBe('test');
        expect(getCellValue(cell2)).toBe(2);
        expect(getCellValue(cell3)).toBe(0);
    });

    it('Function extractFormulaError', () => {
        expect(extractFormulaError({ v: ErrorType.DIV_BY_ZERO, f: '=1/0' })).toBe(ErrorType.DIV_BY_ZERO);
        expect(extractFormulaError({ v: ErrorType.NAME, f: '=S' })).toBe(ErrorType.NAME);
        expect(extractFormulaError({ v: ErrorType.VALUE, f: '=SUM(A1)' })).toBe(ErrorType.VALUE);
        expect(extractFormulaError({ v: ErrorType.NUM, f: '=SUM(A1)' })).toBe(ErrorType.NUM);
        expect(extractFormulaError({ v: ErrorType.NA, f: '=SUM(A1)' })).toBe(ErrorType.NA);
        expect(extractFormulaError({ v: ErrorType.CYCLE, f: '=SUM(A1)' })).toBe(ErrorType.CYCLE);
        expect(extractFormulaError({ v: ErrorType.REF, f: '=SUM(A1)' })).toBe(ErrorType.REF);
        expect(extractFormulaError({ v: ErrorType.SPILL, f: '=SUM(A1)' })).toBe(ErrorType.SPILL);
        expect(extractFormulaError({ v: ErrorType.CALC, f: '=SUM(A1)' })).toBe(ErrorType.CALC);
        expect(extractFormulaError({ v: ErrorType.ERROR, f: '=SUM(A1)' })).toBe(ErrorType.ERROR);
        expect(extractFormulaError({ v: ErrorType.CONNECT, f: '=SUM(A1)' })).toBe(ErrorType.CONNECT);

        expect(extractFormulaError({ v: ErrorType.NULL, f: '=SUM(A1)' })).toBe(ErrorType.NULL);
        expect(extractFormulaError({ v: ErrorType.NULL, f: '=SUM(A1)', si: 'id1' })).toBe(ErrorType.NULL);
        expect(extractFormulaError({ v: ErrorType.NULL, si: 'id1' })).toBe(ErrorType.NULL);
        expect(extractFormulaError({ v: ErrorType.NULL })).toBeNull();

        expect(extractFormulaError({ f: '=SUM(1)' })).toBeNull();
        expect(extractFormulaError({ si: 'id1' })).toBeNull();
        expect(extractFormulaError({ p: null })).toBeNull();
        expect(extractFormulaError({ v: 'test' })).toBeNull();
        expect(extractFormulaError({ v: 1 })).toBeNull();
        expect(extractFormulaError({})).toBeNull();
        expect(extractFormulaError(null)).toBeNull();
        expect(extractFormulaError(undefined)).toBeNull();
    });
});
