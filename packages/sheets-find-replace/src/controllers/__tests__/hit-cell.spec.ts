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

import type { IFindQuery } from '@univerjs/find-replace';
import { FindBy, FindDirection, FindScope } from '@univerjs/find-replace';
import { describe, expect, it } from 'vitest';
import { hitCell } from '../sheet-find-replace.controller';

describe('hitCell', () => {
    const baseQuery: IFindQuery = {
        replaceRevealed: false,
        findString: 'abc',
        caseSensitive: false,
        matchesTheWholeCell: false,
        findDirection: FindDirection.ROW,
        findScope: FindScope.SUBUNIT,
        findBy: FindBy.VALUE,
    };

    it('should mark formula matches replaceable only in formula mode', () => {
        const worksheet = {
            getCellRaw: () => ({ f: '=ABC()' }),
        };

        const formulaQuery: IFindQuery = { ...baseQuery, findBy: FindBy.FORMULA, findString: '=abc' };
        const res1 = hitCell(worksheet as any, 0, 0, formulaQuery, { v: 'xxx' } as any);
        expect(res1.hit).toBe(true);
        expect(res1.replaceable).toBe(true);
        expect(res1.isFormula).toBe(true);

        const valueQuery: IFindQuery = { ...baseQuery, findBy: FindBy.VALUE, findString: 'xxx' };
        const res2 = hitCell(worksheet as any, 0, 0, valueQuery, { v: 'xxx' } as any);
        expect(res2.hit).toBe(true);
        expect(res2.replaceable).toBe(false);
        expect(res2.isFormula).toBe(true);
    });

    it('should mark non-formula matches replaceable only when rawData exists', () => {
        const worksheetWithRaw = {
            getCellRaw: () => ({ v: 'abc' }),
        };

        const res1 = hitCell(worksheetWithRaw as any, 0, 0, baseQuery, { v: 'abc' } as any);
        expect(res1.hit).toBe(true);
        expect(res1.replaceable).toBe(true);

        const worksheetNoRaw = {
            getCellRaw: () => null,
        };

        const res2 = hitCell(worksheetNoRaw as any, 0, 0, baseQuery, { v: 'abc' } as any);
        expect(res2.hit).toBe(true);
        expect(res2.replaceable).toBe(false);
    });

    it('should support whole-cell matching with edge spaces', () => {
        const worksheet = {
            getCellRaw: () => ({ v: '  abc  ' }),
        };

        const res = hitCell(worksheet as any, 0, 0, {
            ...baseQuery,
            matchesTheWholeCell: true,
            findString: 'abc',
        }, { v: '  abc  ' } as any);

        expect(res.hit).toBe(true);
        expect(res.replaceable).toBe(true);
    });

    it('should extract number and boolean cell values for matching', () => {
        const worksheet = {
            getCellRaw: (_row: number, col: number) => (col === 0 ? { v: 123 } : { v: true }),
        };

        expect(hitCell(worksheet as any, 0, 0, { ...baseQuery, findString: '23' }, { v: 123 } as any).hit).toBe(true);
        expect(hitCell(worksheet as any, 0, 1, { ...baseQuery, findString: '1' }, { v: true } as any).hit).toBe(true);
    });

    it('should report misses for empty values and unmatched formula display values', () => {
        const formulaWorksheet = {
            getCellRaw: () => ({ f: '=SUM(1)' }),
        };
        const formulaRawMiss = hitCell(formulaWorksheet as any, 0, 0, {
            ...baseQuery,
            findBy: FindBy.FORMULA,
            findString: '=missing',
        }, { v: 'alpha' } as any);
        expect(formulaRawMiss.hit).toBe(false);
        expect(formulaRawMiss.replaceable).toBe(false);

        const formulaMiss = hitCell(formulaWorksheet as any, 0, 0, { ...baseQuery, findString: 'missing' }, { v: 'alpha' } as any);
        expect(formulaMiss.hit).toBe(false);
        expect(formulaMiss.replaceable).toBe(false);
        expect(formulaMiss.isFormula).toBe(true);

        const emptyWorksheet = {
            getCellRaw: () => ({ v: '' }),
        };
        const emptyMiss = hitCell(emptyWorksheet as any, 0, 0, baseQuery, { v: '' } as any);
        expect(emptyMiss.hit).toBe(false);
        expect(emptyMiss.replaceable).toBe(false);
    });
});
