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

import type { Ctor } from '@univerjs/core';
import type { IFormulaDatasetConfig } from '../../basics/common';
import type { IFunctionNames } from '../../basics/function';
import type { BaseFunction } from '../../functions/base-function';
import type { IAllRuntimeData } from '../runtime.service';
import { CellValueType, ObjectMatrix } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { ErrorType } from '../../basics/error-type';
import { createFunctionTestBed } from '../../functions/__tests__/create-function-test-bed';
import { ALL_IMPLEMENTED_FUNCTIONS } from '../../functions/index';

import { ICalculateFormulaService } from '../calculate-formula.service';
import { DependencyManagerService, IDependencyManagerService } from '../dependency-manager.service';
import { FeatureCalculationManagerService, IFeatureCalculationManagerService } from '../feature-calculation-manager.service';
import { IFunctionService } from '../function.service';
import { IFormulaRuntimeService } from '../runtime.service';

function createBed() {
    const bed = createFunctionTestBed(undefined, [
        [IFeatureCalculationManagerService, { useClass: FeatureCalculationManagerService }],
        [IDependencyManagerService, { useClass: DependencyManagerService }],
    ]);
    bed.get(IFunctionService).registerExecutors(...ALL_IMPLEMENTED_FUNCTIONS.map(([Fn, name]) =>
        new (Fn as Ctor<BaseFunction>)(name as IFunctionNames)));
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
