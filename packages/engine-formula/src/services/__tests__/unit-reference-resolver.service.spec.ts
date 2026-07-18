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

import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { ErrorType } from '../../basics/error-type';
import { FormulaUnitReferenceResolver } from '../unit-reference-resolver.service';

function createResolver(
    unitNameMap: Record<
        string,
        { name: string; unitType: UniverInstanceType.UNIVER_SHEET | UniverInstanceType.UNIVER_BASE }
    >,
    unitData: Record<string, unknown> = {}
) {
    return new FormulaUnitReferenceResolver({
        getUnitNameMap: () => unitNameMap,
        getUnitData: () => unitData,
    } as never);
}

describe('FormulaUnitReferenceResolver', () => {
    it('keeps runtime unit ids compatible and resolves empty qualifiers to the host', () => {
        const resolver = createResolver({
            host: { name: 'Host.xlsx', unitType: UniverInstanceType.UNIVER_SHEET },
        });

        expect(resolver.resolve({ hostUnitId: 'host', qualifier: '', referenceKind: 'a1' })).toEqual({
            unitId: 'host',
            unitType: UniverInstanceType.UNIVER_SHEET,
        });
        expect(resolver.resolve({ hostUnitId: 'other', qualifier: 'host', referenceKind: 'a1' })).toEqual({
            unitId: 'host',
            unitType: UniverInstanceType.UNIVER_SHEET,
        });
    });

    it('resolves Sheet and Base display names case-insensitively', () => {
        const resolver = createResolver({
            sheet: { name: 'Sales.xlsx', unitType: UniverInstanceType.UNIVER_SHEET },
            base: { name: 'Customer Base', unitType: UniverInstanceType.UNIVER_BASE },
        });

        expect(resolver.resolve({ hostUnitId: 'host', qualifier: 'sales.XLSX', referenceKind: 'a1' })).toEqual({
            unitId: 'sheet',
            unitType: UniverInstanceType.UNIVER_SHEET,
        });
        expect(resolver.resolve({ hostUnitId: 'host', qualifier: 'customer base', referenceKind: 'table' })).toEqual({
            unitId: 'base',
            unitType: UniverInstanceType.UNIVER_BASE,
        });
    });

    it('resolves imported workbook names without their Excel file extension', () => {
        const resolver = createResolver({
            sheet: { name: 'Sales 2026', unitType: UniverInstanceType.UNIVER_SHEET },
            base: { name: 'Customer Base', unitType: UniverInstanceType.UNIVER_BASE },
            unicode: { name: 'ÉTÉ 2026', unitType: UniverInstanceType.UNIVER_SHEET },
        });

        expect(resolver.resolve({ hostUnitId: 'host', qualifier: 'sales 2026.XLSX', referenceKind: 'a1' })).toEqual({
            unitId: 'sheet',
            unitType: UniverInstanceType.UNIVER_SHEET,
        });
        expect(
            resolver.resolve({
                hostUnitId: 'host',
                qualifier: 'customer base.xls',
                referenceKind: 'table',
            })
        ).toEqual({
            unitId: 'base',
            unitType: UniverInstanceType.UNIVER_BASE,
        });

        expect(resolver.resolve({ hostUnitId: 'host', qualifier: 'sales 2026.xlsm', referenceKind: 'a1' })).toEqual({
            unitId: 'sheet',
            unitType: UniverInstanceType.UNIVER_SHEET,
        });
        expect(resolver.resolve({ hostUnitId: 'host', qualifier: 'été 2026.xlsx', referenceKind: 'a1' })).toEqual({
            unitId: 'unicode',
            unitType: UniverInstanceType.UNIVER_SHEET,
        });
    });

    it('prefers an exact workbook name before extension-compatible aliases', () => {
        const resolver = createResolver({
            imported: { name: 'Sales', unitType: UniverInstanceType.UNIVER_SHEET },
            explicit: { name: 'Sales.xlsx', unitType: UniverInstanceType.UNIVER_SHEET },
        });

        expect(resolver.resolve({ hostUnitId: 'host', qualifier: 'Sales.xlsx', referenceKind: 'a1' })).toMatchObject({
            unitId: 'explicit',
        });
    });

    it('does not treat empty names as aliases', () => {
        const resolver = createResolver({
            unnamed: { name: '', unitType: UniverInstanceType.UNIVER_SHEET },
        });

        expect(resolver.resolve({ hostUnitId: 'host', qualifier: '', referenceKind: 'a1' })).toBe(ErrorType.REF);
    });

    it('returns REF for missing or ambiguous names', () => {
        const resolver = createResolver({
            first: { name: 'Sales.xlsx', unitType: UniverInstanceType.UNIVER_SHEET },
            second: { name: 'SALES.XLSX', unitType: UniverInstanceType.UNIVER_BASE },
        });

        expect(resolver.resolve({ hostUnitId: 'host', qualifier: 'missing.xlsx', referenceKind: 'a1' })).toBe(
            ErrorType.REF
        );
        expect(resolver.resolve({ hostUnitId: 'host', qualifier: 'sales.xlsx', referenceKind: 'table' })).toBe(
            ErrorType.REF
        );
    });

    it('returns REF for ambiguous extension-compatible aliases', () => {
        const resolver = createResolver({
            first: { name: 'Sales', unitType: UniverInstanceType.UNIVER_SHEET },
            second: { name: 'SALES', unitType: UniverInstanceType.UNIVER_BASE },
        });

        expect(resolver.resolve({ hostUnitId: 'host', qualifier: 'sales.xlsx', referenceKind: 'table' })).toBe(
            ErrorType.REF
        );
    });

    it('accepts synthetic runtime ids that only exist in unit data', () => {
        const resolver = createResolver({}, { 'external:1': {} });

        expect(resolver.resolve({ hostUnitId: 'host', qualifier: 'external:1', referenceKind: 'a1' })).toEqual({
            unitId: 'external:1',
            unitType: undefined,
        });
    });

    it('allows Base-to-Sheet A1 but keeps A1 references to Base forbidden', () => {
        const resolver = createResolver({
            sheet: { name: 'Sales.xlsx', unitType: UniverInstanceType.UNIVER_SHEET },
            base: { name: 'Customer Base', unitType: UniverInstanceType.UNIVER_BASE },
        });

        expect(resolver.resolve({ hostUnitId: 'sheet', qualifier: 'Customer Base', referenceKind: 'a1' })).toBe(
            ErrorType.REF
        );
        expect(resolver.resolve({ hostUnitId: 'base', qualifier: 'Sales.xlsx', referenceKind: 'a1' })).toEqual({
            unitId: 'sheet',
            unitType: UniverInstanceType.UNIVER_SHEET,
        });
        expect(resolver.resolve({ hostUnitId: 'base', qualifier: 'Sales.xlsx', referenceKind: 'table' })).toEqual({
            unitId: 'sheet',
            unitType: UniverInstanceType.UNIVER_SHEET,
        });
    });
});
