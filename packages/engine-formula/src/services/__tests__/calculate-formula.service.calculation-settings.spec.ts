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

import type { Ctor, IWorkbookData } from '@univerjs/core';
import type { IFormulaDatasetConfig } from '../../basics/common';
import type { IFunctionNames } from '../../basics/function';
import type { BaseFunction } from '../../functions/base-function';
import type { IAllRuntimeData } from '../runtime.service';
import { CellValueType, LocaleType, ObjectMatrix } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { ErrorType } from '../../basics/error-type';
import { LexerNode } from '../../engine/analysis/lexer-node';
import { LexerTreeBuilder } from '../../engine/analysis/lexer-tree-builder';
import { StringValueObject } from '../../engine/value-object/primitive-object';
import { createFunctionTestBed } from '../../functions/__tests__/create-function-test-bed';
import { ALL_IMPLEMENTED_FUNCTIONS } from '../../functions/index';
import { ExcelRegexreplace } from '../../functions/text/excel-regex';
import { FUNCTION_NAMES_TEXT } from '../../functions/text/function-names';

import { ICalculateFormulaService } from '../calculate-formula.service';
import { IDefinedNamesService } from '../defined-names.service';
import { DependencyManagerService, IDependencyManagerService } from '../dependency-manager.service';
import { FeatureCalculationManagerService, IFeatureCalculationManagerService } from '../feature-calculation-manager.service';
import { IFunctionService } from '../function.service';
import { IFormulaRuntimeService } from '../runtime.service';

function createBed(workbookData?: IWorkbookData) {
    const bed = createFunctionTestBed(workbookData, [
        [IFeatureCalculationManagerService, { useClass: FeatureCalculationManagerService }],
        [IDependencyManagerService, { useClass: DependencyManagerService }],
    ]);
    const injector = bed.univer.__getInjector();
    bed.get(IFunctionService).registerExecutors(...ALL_IMPLEMENTED_FUNCTIONS.map(([Fn, name]) =>
        injector.createInstance(Fn as Ctor<BaseFunction>, name as IFunctionNames)));
    return bed;
}

describe('Persisted calculation settings', () => {
    async function calculate(
        bed: ReturnType<typeof createFunctionTestBed>,
        formulas: Record<number, Record<number, { f: string }>>,
        enabled: boolean,
        count = 100,
        maxChange = 0.001,
        extra: Partial<IFormulaDatasetConfig> = {}
    ): Promise<IAllRuntimeData> {
        const config: IFormulaDatasetConfig = {
            formulaData: { [bed.unitId]: { [bed.sheetId]: formulas } },
            allUnitData: { [bed.unitId]: bed.sheetData },
            unitStylesData: {},
            unitSheetNameMap: { [bed.unitId]: { Sheet1: bed.sheetId } },
            arrayFormulaCellData: {},
            arrayFormulaRange: {},
            forceCalculate: true,
            clearDependencyTreeCache: { [bed.unitId]: { [bed.sheetId]: 'Sheet1' } },
            dirtyRanges: [],
            dirtyNameMap: {},
            dirtyDefinedNameMap: {},
            dirtyUnitFeatureMap: {},
            dirtyUnitOtherFormulaMap: {},
            calculationSettings: { [bed.unitId]: { iterativeCalculation: enabled, maxIterations: count, maxChange } },
            ...extra,
        };
        const service = bed.get(ICalculateFormulaService);
        let result: IAllRuntimeData | undefined;
        const subscription = service.executionCompleteListener$.subscribe((data) => {
            result = data;
        });
        try {
            await service.execute(config);
            return result!;
        } finally {
            subscription.unsubscribe();
        }
    }

    it.each([
        { label: 'range-comparison', formula: '=SUM(--(A1:A2<2))+1', cached: 0, a2: { v: 10 }, enabled: true, count: 3, expected: 2, expectedIterations: 3, expectedConverged: false },
        { label: 'sumif', formula: '=SUMIF(A1:A2,"<2",A1:A2)+1', cached: 0, a2: { v: 10 }, enabled: true, count: 3, expected: 1, expectedIterations: 3, expectedConverged: false },
        { label: 'dynamic-enabled', formula: '=INDIRECT(A2)+1', cached: 7, a2: { f: '="A1"', v: 'B1', t: CellValueType.STRING }, enabled: true, count: 1, expected: 8, expectedIterations: 1, expectedConverged: false },
        { label: 'dynamic-disabled', formula: '=INDIRECT(A2)+1', cached: 7, a2: { f: '="A1"', v: 'B1', t: CellValueType.STRING }, enabled: false, count: 1, expected: 7, expectedIterations: 0, expectedConverged: undefined },
        { label: 'range-numeric', formula: '=SUM(A1:A2)+1', cached: 0, a2: { v: 0 }, enabled: true, count: 3, expected: 3, expectedIterations: 3, expectedConverged: false },
    ])('$label', async ({ formula, cached, a2, enabled, count, expected, expectedIterations, expectedConverged }) => {
        const bed = createBed();
        try {
            const cells = bed.sheetData[bed.sheetId]!.cellData;
            cells.setValue(0, 0, { f: formula, v: cached, t: CellValueType.NUMBER });
            cells.setValue(0, 1, { v: 100, t: CellValueType.NUMBER });
            cells.setValue(1, 0, a2);
            const formulas: Record<number, Record<number, { f: string }>> = { 0: { 0: { f: formula } } };
            if ('f' in a2) {
                formulas[1] = { 0: { f: a2.f! } };
            }
            const result = await calculate(bed, formulas, enabled, count);
            const actual = result.unitData[bed.unitId]?.[bed.sheetId]?.getValue(0, 0)?.v ?? cached;
            expect(actual).toBe(expected);
            expect(result.circularReferences?.[0]).toMatchObject({ iterations: expectedIterations, converged: expectedConverged });
        } finally {
            bed.univer.dispose();
        }
    });

    it.each([
        { formula: '=ROW(A1)', expected: 1 },
        { formula: '=COLUMN(A1)', expected: 1 },
        { formula: '=ROWS(A1:A3)', expected: 3 },
        { formula: '=COLUMNS(A1:C1)', expected: 3 },
    ])('does not treat reference metadata in $formula as a circular value dependency', async ({ formula, expected }) => {
        const bed = createBed();
        try {
            bed.sheetData[bed.sheetId]!.cellData.setValue(0, 0, { f: formula, v: 7, t: CellValueType.NUMBER });
            const result = await calculate(bed, { 0: { 0: { f: formula } } }, false);
            expect(result.unitData[bed.unitId]?.[bed.sheetId]?.getValue(0, 0)?.v).toBe(expected);
            expect(result.circularReferences).toEqual([]);
        } finally {
            bed.univer.dispose();
        }
    });

    it.each(['=ROWS(A1+1)', '=COLUMNS(A1+1)', '=ROWS(A1:A3)+A1'])(
        'retains circular value dependencies in %s',
        async (formula) => {
            const bed = createBed();
            try {
                bed.sheetData[bed.sheetId]!.cellData.setValue(0, 0, { f: formula, v: 7, t: CellValueType.NUMBER });
                const result = await calculate(bed, { 0: { 0: { f: formula } } }, false);
                expect(result.unitData[bed.unitId]?.[bed.sheetId]?.getValue(0, 0)?.v ?? 7).toBe(7);
                expect(result.circularReferences).toHaveLength(1);
            } finally {
                bed.univer.dispose();
            }
        }
    );

    it('updates value dependencies beside a metadata-only self-reference', async () => {
        const bed = createBed();
        try {
            const cells = bed.sheetData[bed.sheetId]!.cellData;
            const firstFormula = '=ROWS(A1:A3)+B1';
            const secondFormula = '=C1+1';
            const formulas = { 0: { 0: { f: firstFormula }, 1: { f: secondFormula } } };
            cells.setValue(0, 0, { f: firstFormula, v: 7, t: CellValueType.NUMBER });
            cells.setValue(0, 1, { f: secondFormula, v: 0, t: CellValueType.NUMBER });
            cells.setValue(0, 2, { v: 2, t: CellValueType.NUMBER });
            const first = await calculate(bed, formulas, false);
            expect(first.unitData[bed.unitId]?.[bed.sheetId]?.getValue(0, 0)?.v).toBe(6);
            expect(first.circularReferences).toEqual([]);

            cells.setValue(0, 0, { f: firstFormula, v: 6, t: CellValueType.NUMBER });
            cells.setValue(0, 1, { f: secondFormula, v: 3, t: CellValueType.NUMBER });
            cells.setValue(0, 2, { v: 3, t: CellValueType.NUMBER });
            const second = await calculate(bed, formulas, false, 100, 0.001, {
                forceCalculate: false,
                clearDependencyTreeCache: {},
                dirtyRanges: [{ unitId: bed.unitId, sheetId: bed.sheetId, range: { startRow: 0, endRow: 0, startColumn: 2, endColumn: 2 } }],
            });
            expect(second.unitData[bed.unitId]?.[bed.sheetId]?.getValue(0, 0)?.v).toBe(7);
            expect(second.circularReferences).toEqual([]);
        } finally {
            bed.univer.dispose();
        }
    });

    it('retains unrelated cycle diagnostics on incremental recalculation', async () => {
        const bed = createBed();
        try {
            const cells = bed.sheetData[bed.sheetId]!.cellData;
            cells.setValue(0, 0, { f: '=A1+1', v: 7, t: CellValueType.NUMBER });
            cells.setValue(0, 3, { v: 10, t: CellValueType.NUMBER });
            cells.setValue(1, 3, { f: '=D1+1', v: 0, t: CellValueType.NUMBER });
            const formulas = { 0: { 0: { f: '=A1+1' } }, 1: { 3: { f: '=D1+1' } } };
            const first = await calculate(bed, formulas, false);
            expect(first.circularReferences).toHaveLength(1);
            cells.setValue(1, 3, { f: '=D1+1', v: 11, t: CellValueType.NUMBER });
            cells.setValue(0, 3, { v: 20, t: CellValueType.NUMBER });
            const second = await calculate(bed, formulas, false, 100, 0.001, {
                forceCalculate: false,
                clearDependencyTreeCache: {},
                dirtyRanges: [{ unitId: bed.unitId, sheetId: bed.sheetId, range: { startRow: 0, endRow: 0, startColumn: 3, endColumn: 3 } }],
            });
            expect(second.unitData[bed.unitId]?.[bed.sheetId]?.getValue(1, 3)?.v).toBe(21);
            expect(second.circularReferences).toHaveLength(1);
        } finally {
            bed.univer.dispose();
        }
    });

    it('updates the interior of an OFFSET range and follows a chain of resolved addresses', async () => {
        const bed = createBed();
        const formulas = {
            0: { 3: { f: '=SUM(A1:OFFSET(A3,0,0))' } },
            1: { 3: { f: '=SUM(OFFSET(D2,-1,0),A2)' } },
            2: { 3: { f: '=SUM(OFFSET(D3,-1,0),A3)' }, 4: { f: '=D3*2' } },
        };
        const { unitId, sheetId } = bed;
        const cells = bed.sheetData[sheetId]!.cellData;
        const read = (result: IAllRuntimeData) => {
            const values = result.unitData[unitId]?.[sheetId];
            return [values?.getValue(0, 3)?.v, values?.getValue(1, 3)?.v, values?.getValue(2, 3)?.v, values?.getValue(2, 4)?.v];
        };
        const calculateEdit = () => calculate(bed, formulas, false, 100, 0.001, {
            forceCalculate: false,
            clearDependencyTreeCache: {},
            dirtyRanges: [{ unitId, sheetId, range: { startRow: 1, endRow: 1, startColumn: 0, endColumn: 0 } }],
        });
        try {
            cells.setValue(0, 0, { v: 1 });
            cells.setValue(1, 0, { v: 2 });
            cells.setValue(2, 0, { v: 3 });
            const first = await calculate(bed, formulas, false);
            expect(first.circularReferences).toEqual([]);
            expect(read(first)).toEqual([6, 8, 11, 22]);
            cells.setValue(1, 0, { v: 8 });
            expect(read(await calculateEdit())).toEqual([12, 20, 23, 46]);
            cells.setValue(1, 0, { v: 2 });
            expect(read(await calculateEdit())).toEqual([6, 8, 11, 22]);
        } finally {
            bed.univer.dispose();
        }
    });

    it.each([
        ['=SUM((A1):(A3))', 6],
        ['=SUM(A1:((INDEX(A3:A4,1))))', 6],
        ['=SUM(A1:(A2:A3))', 6],
        ['=SUM(A1:(INDEX(A3:A4,1)))+10', 16],
        ['=SUM(A1:(INDEX(A3:A4,1)),20)', 26],
        ['=2+(SUM(A1:(INDEX(A3:A4,1))))%', 2.06],
        ['=2+((3))%', 2.03],
        ['=SUM(A1:(INDEX(A3:A4,1)))%', 0.06],
    ])('keeps grouped range endpoints and surrounding expressions intact in %s', async (formula, expected) => {
        const bed = createBed();
        const cells = bed.sheetData[bed.sheetId]!.cellData;
        try {
            cells.reset();
            for (let row = 0; row < 4; row++) {
                cells.setValue(row, 0, { v: row + 1 });
            }
            const result = await calculate(bed, { 0: { 1: { f: formula } } }, false);
            expect(result.unitData[bed.unitId]?.[bed.sheetId]?.getValue(0, 1)?.v).toBe(expected);
        } finally {
            bed.univer.dispose();
        }
    });

    it('preserves grouped endpoints when adding Excel function prefixes', () => {
        const bed = createBed();
        try {
            const input = '=SUM(A1:(XLOOKUP(3,A3:A4,A3:A4)),20)';
            const functions = bed.get(IFunctionService);
            expect(bed.get(LexerTreeBuilder).getNewFormulaWithPrefix(input, (name) => functions.hasExecutor(name)))
                .toBe('=SUM(A1:(_xlfn.XLOOKUP(3,A3:A4,A3:A4)),20)');
        } finally {
            bed.univer.dispose();
        }
    });

    it('combines the areas of a range endpoint into one rectangle', async () => {
        const cases = [
            ['=SUM(A1:(A2,A3))', 63],
            ['=SUM((A2,A3):A1)', 63],
            ['=SUM(D4:(C6,A2))', 850],
            ['=SUM((A1,A3):(C2,D4))', 440],
            ['=SUM(B3:((E1,A2),C6))', 1140],
            ['=SUM((B3:D4,A5):(A2,D4:F6))', 1305],
            ['=SUM(A1:((A2,A4) A1:A4))', 104],
            ['=SUM(A1:Corners)', 212],
            ['=SUM(Corners:A1)', 212],
            ['=SUM(A1:IF(TRUE,(A2,A4),(A2,A6)))', 104],
            ['=AREAS((D4:B3,A6):(C7,B1))', 1],
            ['=COLUMNS((2:3,5:6):B2)', 16384],
            ['=ROWS(B2:(A:A,D:D))', 1048576],
            ['=SUM(Sheet1!A1:(Sheet1!A2,Sheet1!B3))', 129],
            ['=SUM(Other!A1:(Other!A2,Other!B3))', 141],
            ['=SUM(Sheet1!A1:(Other!A2,Sheet1!B3))', ErrorType.VALUE],
            ['=SUM(A1:(Other!A2,Other!B3))', ErrorType.VALUE],
            ['=SUM(A1:IFS(TRUE,Other!A4))', ErrorType.VALUE],
            ['=SUM(Other!A1:SWITCH(1,1,A4))', ErrorType.VALUE],
            ['=SUM(Other!A1:IFS(TRUE,Other!A4))', 116],
            ['=SUM(SWITCH(1,1,Other!A4):Other!A1)', 116],
            ['=SUM(A1:(A2,INDIRECT("bad reference")))', ErrorType.REF],
            ['=SUM(A1:INDIRECT({"A2","A4"}))', ErrorType.VALUE],
            ['=SUM(A1:(A2,XLOOKUP(999,A2:A4,B2:B4)))', ErrorType.NA],
            ['=SUM(A1:CHOOSE(0,(A2,A4),(A2,A6)))', ErrorType.VALUE],
            ['=SUM(A1:CHOOSE({1,2},(A2,A4),(A2,A6)))', ErrorType.VALUE],
            ['=SUM(A1:(Sheet1:Other!A2))', ErrorType.NAME],
            ['=SUM(A1:(Sheet1:Other!A2,Sheet1!A3))', ErrorType.NAME],
        ] as const;
        const bed = createBed({
            id: 'multi-area',
            name: 'Multi-area references',
            appVersion: '3.0.0-alpha',
            locale: LocaleType.EN_US,
            sheetOrder: ['main', 'other'],
            sheets: {
                main: { id: 'main', name: 'Sheet1' },
                other: { id: 'other', name: 'Other' },
            },
            styles: {},
        });
        try {
            bed.get(IDefinedNamesService).registerDefinedName(bed.unitId, {
                id: 'corners',
                name: 'Corners',
                formulaOrRefString: '(Sheet1!$A$3,Sheet1!$B$4)',
            });
            // All cells are filled so an endpoint-only or duplicated-area sum cannot pass.
            const { main, other } = bed.sheetData;
            for (const sheet of [main, other]) {
                for (let row = 0; row < 8; row++) {
                    for (let column = 0; column < 8; column++) {
                        sheet.cellData.setValue(row, column, { v: 10 * (row + 1) + column + 1 });
                    }
                }
            }
            other.cellData.setValue(0, 0, { v: 23 });
            const formulas = Object.fromEntries(cases.map(([f], index) => [index + 9, { 11: { f } }]));
            const result = await calculate(bed, formulas, false, 100, 0.001, {
                unitSheetNameMap: { [bed.unitId]: { Sheet1: 'main', Other: 'other' } },
            });
            const actual = result.unitData[bed.unitId]?.[bed.sheetId];
            cases.forEach(([formula, expected], index) => expect.soft(actual?.getValue(index + 9, 11)?.v, formula).toBe(expected));
        } finally {
            bed.univer.dispose();
        }
    });

    it.each([
        'A1:INDEX(C4:C5,D1)',
        'A1:(INDEX(C4:C5,D1))',
        '(INDEX(C4:C5,D1)):A1',
        'A1:(A2,INDEX(C4:C5,D1))',
        '(A2,INDEX(C4:C5,D1)):A1',
        'A1:CHOOSE(D1,(A2,C4),(A2,C5))',
        'A1:IF(D1=1,(A2,C4),(A2,C5))',
        'A1:_xlfn.IFS(D1=1,(A2,C4),TRUE,(A2,C5))',
        'SWITCH(D1,1,(A2,C4),(A2,C5)):A1',
    ])('updates the dependency range when an endpoint moves in %s', async (range) => {
        const bed = createBed();
        const formulas = { 0: { 4: { f: `=SUM(${range})` } } };
        const { unitId, sheetId } = bed;
        const cells = bed.sheetData[sheetId]!.cellData;
        const read = (result: IAllRuntimeData) => result.unitData[unitId]?.[sheetId]?.getValue(0, 4)?.v;
        const edit = (row: number, column: number, v: number) => {
            cells.setValue(row, column, { v });
            return calculate(bed, formulas, false, 100, 0.001, {
                forceCalculate: false,
                clearDependencyTreeCache: {},
                dirtyRanges: [{ unitId, sheetId, range: { startRow: row, endRow: row, startColumn: column, endColumn: column } }],
            });
        };
        try {
            cells.reset();
            cells.setValue(0, 0, { v: 1 });
            cells.setValue(0, 3, { v: 1 });
            cells.setValue(3, 2, { v: 4 });
            cells.setValue(4, 1, { v: 10 });
            cells.setValue(4, 2, { v: 5 });
            expect(read(await calculate(bed, formulas, false))).toBe(5);
            expect(read(await edit(0, 3, 2))).toBe(20);
            expect(read(await edit(4, 1, 30))).toBe(40);
            expect(read(await edit(0, 3, 1))).toBe(5);
            expect(read(await edit(4, 1, 10))).toBeUndefined();
        } finally {
            bed.univer.dispose();
        }
    });

    it('keeps selected references in range endpoints without changing ordinary selector results', async () => {
        const cases = [
            ['=SUM(IFS(TRUE,(A2,A4),TRUE,(A3,A6)):A1)', 10],
            ['=SUM(A1:SWITCH(1,1,(A2,A4),(A3,A6)))', 10],
            ['=SUM(A1:(A2,IFS(TRUE,(A3,A4),TRUE,(A5,A6))))', 10],
            ['=SUM(A1:CHOOSE(1,SWITCH(1,1,(A2,A4),(A3,A6))))', 10],
            ['=SUM(A1:IFS(TRUE,(A2,A4),FALSE,NA()))', 10],
            ['=SUM(A1:IFS(TRUE,(A2,A4),NA(),(A2,A6)))', 10],
            ['=SUM(A1:SWITCH(1,1,(A2,A4),NA(),(A2,A6)))', 10],
            ['=SUM(A1:IFS({TRUE,FALSE},(A2,A4),TRUE,(A3,A6)))', ErrorType.VALUE],
            ['=SUM(A1:IFS({TRUE},(A2,A4),TRUE,(A3,A6)))', ErrorType.VALUE],
            ['=SUM(A1:SWITCH({1,2},1,(A2,A4),(A3,A6)))', ErrorType.VALUE],
            ['=SUM(A1:SWITCH({1},1,(A2,A4),(A3,A6)))', ErrorType.VALUE],
            ['=SUM(A1:SWITCH(1,"1",(A2,A4),(A3,A6)))', 21],
            ['=SUM(A1:SWITCH(TRUE,1,(A2,A4),(A3,A6)))', 21],
            ['=SUM(A1:IFS("TRUE",(A2,A4),TRUE,(A3,A6)))', 10],
            ['=SUM(A1:IFS(FALSE,(A2,A4)))', ErrorType.NA],
            ['=SUM(A1:SWITCH(2,1,(A2,A4)))', ErrorType.NA],
            ['=SUM(A1:IFS(TRUE,A4))', 10],
            ['=SUM(A1:SWITCH(1,1,A4))', 10],
            ['=IFS(TRUE,5,TRUE,10)', 5],
            ['=SWITCH(1,1,5,6)', 5],
            ['=SUM(IFS({TRUE,FALSE},10,TRUE,20))', 30],
            ['=SUM(SWITCH({1,2},1,10,20))', 30],
        ] as const;
        const bed = createBed();
        try {
            const data = bed.sheetData[bed.sheetId]!.cellData;
            data.reset();
            for (let row = 0; row < 6; row++) {
                data.setValue(row, 0, { v: row + 1 });
            }
            const formulas = Object.fromEntries(cases.map(([f], index) => [index, { 9: { f } }]));
            const result = await calculate(bed, formulas, false);
            const actual = result.unitData[bed.unitId]?.[bed.sheetId];
            cases.forEach(([formula, expected], index) => expect.soft(actual?.getValue(index, 9)?.v, formula).toBe(expected));
        } finally {
            bed.univer.dispose();
        }
    });

    it('evaluates grouped intersections and preserves references only in reference-producing arguments', async () => {
        const bed = createBed();
        const cells = bed.sheetData[bed.sheetId]!.cellData;
        const cases = [
            ['=SUM(A1:A4 (A2:A3))', 5, 5],
            ['=SUM((A1:A4) ( A2:A3 ))', 5, 5],
            ['=SUM(CHOOSE(D1,A1:A4,A3:A4) (A2:A3))', 5, 3],
            ['=SUM(CHOOSE(D1,A1:A4,A3:A4) A2:A3)', 5, 3],
            ['=SUM(A1:A4 (A2:A3,A4))', 9, 9],
            ['=SUM(A1:A4 (A2:INDEX(A1:A4,D1+2)))', 5, 9],
            ['=SUM(A1:IFS(IFS(TRUE,B1),A4))', 10, 10],
            ['=SUM(A1:INDEX(IFS(TRUE,A2:A4),D1+1))', 6, 10],
            ['=SUM(A1:INDEX(SWITCH(1,1,A2:A4),2))', 6, 6],
            ['=SUM(A1:INDEX(IFS(TRUE,(A2:A4,B2:B4)),2,1,1))', 6, 6],
            ['=SUM (A1:A4)', 10, 10],
        ] as const;
        try {
            cells.reset();
            for (let row = 0; row < 4; row++) {
                cells.setValue(row, 0, { v: row + 1 });
            }
            cells.setValue(0, 1, { v: 1 });
            cells.setValue(0, 3, { v: 1 });
            const formulas = Object.fromEntries(cases.map(([f], index) => [index, { 9: { f } }]));
            const read = (result: IAllRuntimeData, index: number) => result.unitData[bed.unitId]?.[bed.sheetId]?.getValue(index, 9)?.v;
            const full = await calculate(bed, formulas, false);
            cases.forEach(([formula, expected], index) => expect.soft(read(full, index), formula).toBe(expected));
            cells.setValue(0, 3, { v: 2 });
            const updated = await calculate(bed, formulas, false, 100, 0.001, {
                forceCalculate: false,
                clearDependencyTreeCache: {},
                dirtyRanges: [{ unitId: bed.unitId, sheetId: bed.sheetId, range: { startRow: 0, endRow: 0, startColumn: 3, endColumn: 3 } }],
            });
            cases.forEach(([formula, , expected], index) => expect.soft(read(updated, index) ?? read(full, index), formula).toBe(expected));
        } finally {
            bed.univer.dispose();
        }
    });

    it('parses formulas and expands regex backreferences without newer browser built-ins', () => {
        const bed = createBed();
        const lexer = bed.get(LexerTreeBuilder);
        const replace = bed.univer.__getInjector().createInstance(ExcelRegexreplace, FUNCTION_NAMES_TEXT.REGEXREPLACE);
        const at = Object.getOwnPropertyDescriptor(Array.prototype, 'at')!;
        const hasOwn = Object.getOwnPropertyDescriptor(Object, 'hasOwn')!;
        let parsed: ReturnType<LexerTreeBuilder['treeBuilder']>[];
        let replacements: unknown[];
        try {
            // eslint-disable-next-line no-extend-native -- Simulate older browsers for this synchronous test.
            Object.defineProperty(Array.prototype, 'at', { value: undefined, configurable: true });
            Object.defineProperty(Object, 'hasOwn', { value: undefined, configurable: true });
            parsed = [lexer.treeBuilder('=(1+2)'), lexer.treeBuilder('=1+{2,3}')];
            const evaluate = (pattern: string, replacement: string) => replace.calculate(
                StringValueObject.create('a'),
                StringValueObject.create(pattern),
                StringValueObject.create(replacement)
            ).getValue();
            replacements = [evaluate('(a)', '\\1'), evaluate('(?<letter>a)', '$<letter>')];
        } finally {
            // eslint-disable-next-line no-extend-native -- Restore the original browser API.
            Object.defineProperty(Array.prototype, 'at', at);
            Object.defineProperty(Object, 'hasOwn', hasOwn);
            bed.univer.dispose();
        }
        expect(parsed.every((node) => node instanceof LexerNode)).toBe(true);
        expect(replacements).toEqual(['a', 'a']);
    });

    it('returns positive zero when ISO.CEILING rounds a negative number to zero', async () => {
        const bed = createBed();
        try {
            const result = await calculate(bed, {
                0: {
                    9: { f: '=ISO.CEILING(-1.3,2)' },
                    10: { f: '=ISO.CEILING(-1.3,-2)' },
                    11: { f: '=ISO.CEILING(-2.3,-2)' },
                },
            }, false);
            const actual = result.unitData[bed.unitId]?.[bed.sheetId];
            expect(actual?.getValue(0, 9)?.v).toBe(0);
            expect(actual?.getValue(0, 10)?.v).toBe(0);
            expect(actual?.getValue(0, 11)?.v).toBe(-2);
        } finally {
            bed.univer.dispose();
        }
    });

    it('detects a weekly period in four weeks of hourly values', async () => {
        const bed = createBed();
        try {
            const cases = [
                ['=FORECAST.ETS.SEASONALITY(MOD(SEQUENCE(672)-1,168),SEQUENCE(672))', 168],
                ['=FORECAST.ETS.SEASONALITY(MOD(SEQUENCE(336)-1,168),SEQUENCE(336))', 0],
                ['=FORECAST.ETS.SEASONALITY(MOD(SEQUENCE(419)-1,168),SEQUENCE(419))', 0],
                ['=FORECAST.ETS.SEASONALITY(MOD(SEQUENCE(420)-1,168),SEQUENCE(420))', 168],
                ['=FORECAST.ETS.SEASONALITY(SEQUENCE(672),SEQUENCE(672))', 0],
            ] as const;
            const result = await calculate(bed, { 0: Object.fromEntries(cases.map(([f], index) => [index + 9, { f }])) }, false);
            const actual = result.unitData[bed.unitId]?.[bed.sheetId];
            cases.forEach(([formula, expected], index) => expect(actual?.getValue(0, index + 9)?.v, formula).toBe(expected));
        } finally {
            bed.univer.dispose();
        }
    });

    it('keeps XLOOKUP references and updates composed ranges after their endpoints move', async () => {
        const bed = createBed();
        const formulas = {
            0: {
                6: { f: '=SUM(XLOOKUP(E1,A1:A4,B1:B4):XLOOKUP(F1,A1:A4,D1:D4))' },
                7: { f: '=G1*2' },
                8: { f: '=ISREF(XLOOKUP(1,A1:A4,B1:D4))' },
                9: { f: '=ISREF(XLOOKUP(99,A1:A4,B1:B4,D1))' },
                10: { f: '=ISREF(XLOOKUP(1,A1:A4,{1;2;3;4}))' },
                11: { f: '=COUNT(XLOOKUP(1,A1:A4,J2:J5))' },
                12: { f: '=XLOOKUP(1,A1:A4,N1:N4)' },
            },
        };
        const { unitId, sheetId } = bed;
        const cells = bed.sheetData[sheetId]!.cellData;
        const read = (result: IAllRuntimeData, columns: number[]) => columns.map((column) =>
            result.unitData[unitId]?.[sheetId]?.getValue(0, column)?.v
        );
        const edit = async (row: number, column: number, value: number, expected: number) => {
            cells.setValue(row, column, { v: value });
            const result = await calculate(bed, formulas, false, 100, 0.001, {
                forceCalculate: false,
                clearDependencyTreeCache: {},
                dirtyRanges: [{ unitId, sheetId, range: { startRow: row, endRow: row, startColumn: column, endColumn: column } }],
            });
            expect(read(result, [6, 7])).toEqual([expected, expected * 2]);
        };
        try {
            for (let row = 0; row < 4; row++) {
                cells.setValue(row, 0, { v: row + 1 });
                for (let column = 1; column < 4; column++) {
                    cells.setValue(row, column, { v: row * 3 + column });
                }
            }
            cells.setValue(0, 4, { v: 1 });
            cells.setValue(0, 5, { v: 2 });
            const initial = await calculate(bed, formulas, false);
            expect(read(initial, [6, 7, 8, 9, 10, 11, 12])).toEqual([21, 42, 1, 1, 0, 0, 0]);
            await edit(1, 2, 50, 66);
            await edit(1, 2, 5, 21);
            await edit(0, 5, 4, 78);
            await edit(3, 2, 100, 167);
            await edit(3, 2, 11, 78);
            await edit(0, 5, 2, 21);
        } finally {
            bed.univer.dispose();
        }
    });

    it('uses separate iteration budgets in a cross-workbook cycle', async () => {
        const bed = createBed();
        try {
            const otherUnitId = 'other-workbook';
            const firstFormula = '=[other-workbook]Sheet1!A1+1';
            const secondFormula = `=[${bed.unitId}]Sheet1!A1+1`;
            bed.sheetData[bed.sheetId]!.cellData.setValue(0, 0, { f: firstFormula, v: 0, t: CellValueType.NUMBER });
            const otherCells = new ObjectMatrix({ 0: { 0: { f: secondFormula, v: 0, t: CellValueType.NUMBER } } });
            const result = await calculate(bed, {}, true, 1, 0.001, {
                formulaData: {
                    [bed.unitId]: { [bed.sheetId]: { 0: { 0: { f: firstFormula } } } },
                    [otherUnitId]: { [bed.sheetId]: { 0: { 0: { f: secondFormula } } } },
                },
                allUnitData: { [bed.unitId]: bed.sheetData, [otherUnitId]: { [bed.sheetId]: { ...bed.sheetData[bed.sheetId]!, cellData: otherCells } } },
                unitSheetNameMap: { [bed.unitId]: { Sheet1: bed.sheetId }, [otherUnitId]: { Sheet1: bed.sheetId } },
                calculationSettings: {
                    [bed.unitId]: { iterativeCalculation: true, maxIterations: 1, maxChange: 0.001 },
                    [otherUnitId]: { iterativeCalculation: true, maxIterations: 3, maxChange: 0.001 },
                },
            });
            expect(result.circularReferences).toHaveLength(2);
            expect(result.circularReferences?.find((cell) => cell.unitId === bed.unitId)?.iterations).toBe(1);
            expect(result.circularReferences?.find((cell) => cell.unitId === otherUnitId)?.iterations).toBeGreaterThan(1);
        } finally {
            bed.univer.dispose();
        }
    });

    it.each([false, true])('literal dynamic self-reference enabled=%s', async (enabled) => {
        const bed = createBed();
        try {
            const formula = '=INDIRECT("A1")+1';
            bed.sheetData[bed.sheetId]!.cellData.setValue(0, 0, { f: formula, v: 7, t: CellValueType.NUMBER });
            const result = await calculate(bed, { 0: { 0: { f: formula } } }, enabled, 1);
            expect(result.unitData[bed.unitId]?.[bed.sheetId]?.getValue(0, 0)?.v ?? 7).toBe(enabled ? 8 : 7);
            expect(result.circularReferences).toHaveLength(1);
        } finally {
            bed.univer.dispose();
        }
    });

    it('boolean results use equality despite a large numeric threshold', async () => {
        const bed = createBed();
        try {
            bed.sheetData[bed.sheetId]!.cellData.setValue(0, 0, { f: '=NOT(A1)', v: 0, t: CellValueType.BOOLEAN });
            const result = await calculate(bed, { 0: { 0: { f: '=NOT(A1)' } } }, true, 4, 2);
            expect(result.unitData[bed.unitId]?.[bed.sheetId]?.getValue(0, 0)?.v).toBe(0);
            expect(result.circularReferences?.[0]).toMatchObject({ iterations: 4, converged: false });
        } finally {
            bed.univer.dispose();
        }
    });

    it('refreshes a shared range between members of the same iteration', async () => {
        const bed = createBed();
        try {
            const cells = bed.sheetData[bed.sheetId]!.cellData;
            cells.setValue(0, 0, { f: '=SUM(A1:B1)+1', v: 0, t: CellValueType.NUMBER });
            cells.setValue(0, 1, { f: '=SUM(A1:B1)+2', v: 0, t: CellValueType.NUMBER });
            const result = await calculate(bed, { 0: { 0: { f: '=SUM(A1:B1)+1' }, 1: { f: '=SUM(A1:B1)+2' } } }, true, 1);
            const runtime = result.unitData[bed.unitId]?.[bed.sheetId];
            const values = [runtime?.getValue(0, 0)?.v, runtime?.getValue(0, 1)?.v];
            // Both traversal orders are valid; the second member must see the first result.
            expect([[1, 3], [3, 2]]).toContainEqual(values);
            expect(result.circularReferences).toHaveLength(2);
            expect(result.circularReferences?.every((cell) => cell.iterations === 1)).toBe(true);
        } finally {
            bed.univer.dispose();
        }
    });
    it('dynamic DAG reads recalculated precedents', async () => {
        const bed = createBed();
        try {
            const cells = bed.sheetData[bed.sheetId]!.cellData;
            cells.setValue(0, 0, { f: '=INDIRECT("B1")+1', v: 0, t: CellValueType.NUMBER });
            cells.setValue(0, 1, { f: '=C1+1', v: 10, t: CellValueType.NUMBER });
            cells.setValue(0, 2, { f: '=D1+1', v: 20, t: CellValueType.NUMBER });
            cells.setValue(0, 3, { v: 1, t: CellValueType.NUMBER });
            const result = await calculate(bed, { 0: { 0: { f: '=INDIRECT("B1")+1' }, 1: { f: '=C1+1' }, 2: { f: '=D1+1' } } }, false);
            const runtime = result.unitData[bed.unitId]?.[bed.sheetId];
            expect([0, 1, 2].map((column) => runtime?.getValue(0, column)?.v)).toEqual([4, 3, 2]);
            expect(result.circularReferences).toEqual([]);
            for (const [column, value] of [[0, 4], [1, 3], [2, 2]]) {
                cells.setValue(0, column, { ...cells.getValue(0, column), v: value });
            }
            cells.setValue(0, 3, { v: 2, t: CellValueType.NUMBER });
            const updated = await calculate(bed, { 0: { 0: { f: '=INDIRECT("B1")+1' }, 1: { f: '=C1+1' }, 2: { f: '=D1+1' } } }, false, 100, 0.001, {
                forceCalculate: false,
                clearDependencyTreeCache: {},
                dirtyRanges: [{ unitId: bed.unitId, sheetId: bed.sheetId, range: { startRow: 0, endRow: 0, startColumn: 3, endColumn: 3 } }],
            });
            const updatedRuntime = updated.unitData[bed.unitId]?.[bed.sheetId];
            expect([0, 1, 2].map((column) => updatedRuntime?.getValue(0, column)?.v)).toEqual([5, 4, 3]);
        } finally {
            bed.univer.dispose();
        }
    });
    it.each([false, true])('distinguishes disabled and one enabled self-reference iteration: %s', async (enabled) => {
        const bed = createBed();
        try {
            bed.sheetData[bed.sheetId]!.cellData.setValue(0, 0, { f: '=A1+1', v: 7, t: CellValueType.NUMBER });
            const result = await calculate(bed, { 0: { 0: { f: '=A1+1' }, 1: { f: '=A1*2' } } }, enabled, 1);
            const runtime = result.unitData[bed.unitId]?.[bed.sheetId];
            expect(runtime?.getValue(0, 0)?.v ?? 7).toBe(enabled ? 8 : 7);
            expect(runtime?.getValue(0, 1)?.v).toBe(enabled ? 16 : 14);
            expect(result.circularReferences).toEqual([expect.objectContaining({
                unitId: bed.unitId,
                sheetId: bed.sheetId,
                row: 0,
                column: 0,
                iterations: enabled ? 1 : 0,
            })]);
            expect(bed.get(IFormulaRuntimeService).getRuntimeState().circularReferences).toEqual(result.circularReferences);
        } finally {
            bed.univer.dispose();
        }
    });

    it('preserves both cells of a disabled mutual cycle and still calculates its dependent', async () => {
        const bed = createBed();
        try {
            const cells = bed.sheetData[bed.sheetId]!.cellData;
            cells.setValue(0, 0, { f: '=B1+1', v: 7, t: CellValueType.NUMBER });
            cells.setValue(0, 1, { f: '=A1+1', v: 9, t: CellValueType.NUMBER });
            const result = await calculate(bed, { 0: { 0: { f: '=B1+1' }, 1: { f: '=A1+1' }, 2: { f: '=A1+B1' } } }, false);
            expect(result.unitData[bed.unitId]?.[bed.sheetId]?.getValue(0, 2)?.v).toBe(16);
            expect(result.circularReferences).toHaveLength(2);
            expect(result.circularReferences?.map((cell) => cell.groupId)).toEqual([
                result.circularReferences?.[0].groupId,
                result.circularReferences?.[0].groupId,
            ]);
        } finally {
            bed.univer.dispose();
        }
    });

    it('stops a convergent group early and clears diagnostics after the cycle is removed', async () => {
        const bed = createBed();
        try {
            const cells = bed.sheetData[bed.sheetId]!.cellData;
            cells.setValue(0, 0, { f: '=(A1+1)/2', v: 0, t: CellValueType.NUMBER });
            const result = await calculate(bed, { 0: { 0: { f: '=(A1+1)/2' } } }, true);
            expect(result.unitData[bed.unitId]?.[bed.sheetId]?.getValue(0, 0)?.v).toBeCloseTo(1, 2);
            expect(result.circularReferences?.[0].converged).toBe(true);
            expect(result.circularReferences?.[0].iterations).toBeLessThan(100);
            cells.setValue(0, 0, { f: '=1', v: 0, t: CellValueType.NUMBER });
            const updated = await calculate(bed, { 0: { 0: { f: '=1' } } }, true);
            expect(updated.circularReferences).toEqual([]);
        } finally {
            bed.univer.dispose();
        }
    });

    it('applies one workbook setting to a cycle across sheets', async () => {
        const bed = createBed();
        try {
            bed.sheetData[bed.sheetId]!.cellData.setValue(0, 0, { f: '=Sheet2!A1+1', v: 7, t: CellValueType.NUMBER });
            bed.sheetData.sheet2 = { ...bed.sheetData[bed.sheetId]!, cellData: new ObjectMatrix({ 0: { 0: { f: '=Sheet1!A1+1', v: 9, t: CellValueType.NUMBER } } }) };
            const result = await calculate(bed, {}, false, 1, 0.001, {
                formulaData: { [bed.unitId]: {
                    [bed.sheetId]: { 0: { 0: { f: '=Sheet2!A1+1' }, 1: { f: '=Sheet2!A1*2' } } },
                    sheet2: { 0: { 0: { f: '=Sheet1!A1+1' } } },
                } },
                unitSheetNameMap: { [bed.unitId]: { Sheet1: bed.sheetId, Sheet2: 'sheet2' } },
            });
            expect(result.circularReferences).toHaveLength(2);
            expect(result.unitData[bed.unitId]?.[bed.sheetId]?.getValue(0, 1)?.v).toBe(18);
        } finally {
            bed.univer.dispose();
        }
    });

    it('keeps settings independent for multiple workbooks in one task', async () => {
        const bed = createBed();
        try {
            const otherUnitId = 'other-workbook';
            const otherCells = new ObjectMatrix({ 0: { 0: { f: '=A1+1', v: 9, t: CellValueType.NUMBER } } });
            bed.sheetData[bed.sheetId]!.cellData.setValue(0, 0, { f: '=A1+1', v: 7, t: CellValueType.NUMBER });
            const result = await calculate(bed, {}, false, 1, 0.001, {
                formulaData: {
                    [bed.unitId]: { [bed.sheetId]: { 0: { 0: { f: '=A1+1' }, 1: { f: '=A1*2' } } } },
                    [otherUnitId]: { [bed.sheetId]: { 0: { 0: { f: '=A1+1' }, 1: { f: '=A1*2' } } } },
                },
                allUnitData: { [bed.unitId]: bed.sheetData, [otherUnitId]: { [bed.sheetId]: { ...bed.sheetData[bed.sheetId]!, cellData: otherCells } } },
                unitSheetNameMap: { [bed.unitId]: { Sheet1: bed.sheetId }, [otherUnitId]: { Sheet1: bed.sheetId } },
                calculationSettings: {
                    [bed.unitId]: { iterativeCalculation: false, maxIterations: 100, maxChange: 0.001 },
                    [otherUnitId]: { iterativeCalculation: true, maxIterations: 1, maxChange: 0.001 },
                },
            });
            expect(result.unitData[bed.unitId]?.[bed.sheetId]?.getValue(0, 1)?.v).toBe(14);
            expect(result.unitData[otherUnitId]?.[bed.sheetId]?.getValue(0, 0)?.v).toBe(10);
            expect(result.unitData[otherUnitId]?.[bed.sheetId]?.getValue(0, 1)?.v).toBe(20);
        } finally {
            bed.univer.dispose();
        }
    });

    it.each([
        { formula: '=NOT(A1)', cached: { v: 0, t: CellValueType.BOOLEAN }, expected: 1, iterations: 5, converged: false },
        { formula: '=IF(A1="a","b","a")', cached: { v: 'a', t: CellValueType.STRING }, expected: 'b', iterations: 5, converged: false },
        { formula: '=IF(A1=0,1/0,A1)', cached: { v: 0, t: CellValueType.NUMBER }, expected: ErrorType.DIV_BY_ZERO, iterations: 2, converged: true },
    ])('preserves convergence when result types change: $formula', async ({ formula, cached, expected, iterations, converged }) => {
        const bed = createBed();
        try {
            bed.sheetData[bed.sheetId]!.cellData.setValue(0, 0, { f: formula, ...cached });
            const result = await calculate(bed, { 0: { 0: { f: formula } } }, true, 5);
            expect(result.unitData[bed.unitId]?.[bed.sheetId]?.getValue(0, 0)?.v).toBe(expected);
            expect(result.circularReferences?.[0]).toMatchObject({ iterations, converged });
        } finally {
            bed.univer.dispose();
        }
    });

    it('reloads settings for consecutive tasks on the same workbook', async () => {
        const bed = createBed();
        try {
            for (const count of [1, 3]) {
                bed.sheetData[bed.sheetId]!.cellData.setValue(0, 0, { f: '=A1+1', v: 7, t: CellValueType.NUMBER });
                const result = await calculate(bed, { 0: { 0: { f: '=A1+1' } } }, true, count);
                expect(result.unitData[bed.unitId]?.[bed.sheetId]?.getValue(0, 0)?.v).toBe(7 + count);
                expect(result.circularReferences?.[0].iterations).toBe(count);
            }
            bed.sheetData[bed.sheetId]!.cellData.setValue(0, 0, { f: '=A1+1', v: 7, t: CellValueType.NUMBER });
            const disabled = await calculate(bed, { 0: { 0: { f: '=A1+1' } } }, false);
            expect(disabled.unitData[bed.unitId]?.[bed.sheetId]?.getValue(0, 0)?.v ?? 7).toBe(7);
            expect(disabled.circularReferences?.[0].iterations).toBe(0);
        } finally {
            bed.univer.dispose();
        }
    });

    it('uses an inclusive convergence threshold and reloads it between tasks', async () => {
        const bed = createBed();
        try {
            for (const [maxChange, iterations] of [[0.125, 1], [0.0625, 5]]) {
                bed.sheetData[bed.sheetId]!.cellData.setValue(0, 0, { f: '=A1+0.125', v: 0, t: CellValueType.NUMBER });
                const result = await calculate(bed, { 0: { 0: { f: '=A1+0.125' } } }, true, 5, maxChange);
                expect(result.unitData[bed.unitId]?.[bed.sheetId]?.getValue(0, 0)?.v).toBe(iterations * 0.125);
                expect(result.circularReferences?.[0]).toMatchObject({ iterations, converged: iterations === 1 });
            }
        } finally {
            bed.univer.dispose();
        }
    });

    it('writes zero for uncached disabled cycles and reports non-convergence at the limit', async () => {
        const bed = createBed();
        try {
            const cells = bed.sheetData[bed.sheetId]!.cellData;
            cells.setValue(0, 0, { f: '=A1+1' });
            const disabled = await calculate(bed, { 0: { 0: { f: '=A1+1' } } }, false);
            expect(disabled.unitData[bed.unitId]?.[bed.sheetId]?.getValue(0, 0)?.v).toBe(0);
            const result = await calculate(bed, { 0: { 0: { f: '=A1+1' } } }, true, 3);
            expect(result.unitData[bed.unitId]?.[bed.sheetId]?.getValue(0, 0)?.v).toBe(3);
            expect(result.circularReferences?.[0]).toMatchObject({ converged: false, iterations: 3 });
        } finally {
            bed.univer.dispose();
        }
    });
});
