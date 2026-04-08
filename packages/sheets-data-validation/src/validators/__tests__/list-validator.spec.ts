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
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { describe, expect, it } from 'vitest';
import { getRuleFormulaResultSet, isValidListFormula } from '../list-validator';

describe('list-validator helpers', () => {
    it('collects formatted values and skips empty cells', () => {
        const result = getRuleFormulaResultSet([
            [
                {
                    v: 1234,
                    s: {
                        n: {
                            pattern: '#,##0.00',
                        },
                    },
                } as ICellData,
                {
                    v: 'Alpha',
                } as ICellData,
                null,
            ],
            [
                {
                    v: undefined,
                } as ICellData,
                {
                    v: false,
                } as ICellData,
            ],
        ]);

        expect(result).toEqual(['1,234.00', 'Alpha', '', 'false']);
    });

    it('accepts direct references and supported helper formulas only', () => {
        const lexer = new LexerTreeBuilder();

        expect(isValidListFormula('Red,Green,Blue', lexer)).toBe(true);
        expect(isValidListFormula('=A1:A3', lexer)).toBe(true);
        expect(isValidListFormula('=IF(A1>0,B1:B3,C1:C3)', lexer)).toBe(true);
        expect(isValidListFormula('=OFFSET(A1,0,0,2,1)', lexer)).toBe(true);
        expect(isValidListFormula('=SUM(A1:A3)', lexer)).toBe(false);

        lexer.dispose();
    });
});
