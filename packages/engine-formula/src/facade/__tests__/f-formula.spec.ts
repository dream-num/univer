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

import type { ICommandInfo } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    SetCellFormulaDependencyCalculationMutation,
    SetCellFormulaDependencyCalculationResultMutation,
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationStartMutation,
    SetFormulaCalculationStopMutation,
    SetFormulaDependencyCalculationMutation,
    SetFormulaDependencyCalculationResultMutation,
    SetFormulaStringBatchCalculationMutation,
    SetFormulaStringBatchCalculationResultMutation,
    SetQueryFormulaDependencyAllMutation,
    SetQueryFormulaDependencyAllResultMutation,
    SetQueryFormulaDependencyMutation,
    SetQueryFormulaDependencyResultMutation,
    SetTriggerFormulaCalculationStartMutation,
} from '../../commands/mutations/set-formula-calculation.mutation';
import { ENGINE_FORMULA_CYCLE_REFERENCE_COUNT, ENGINE_FORMULA_RETURN_DEPENDENCY_TREE } from '../../controllers/config.schema';
import { FFormula } from '../f-formula';

interface ICommandServiceMock {
    executeCommand: ReturnType<typeof vi.fn>;
    onCommandExecuted: (callback: (commandInfo: ICommandInfo) => void) => { dispose: () => void };
    emit: (id: string, params?: unknown) => void;
}

function createCommandServiceMock(): ICommandServiceMock {
    const callbacks = new Set<(commandInfo: ICommandInfo) => void>();
    return {
        executeCommand: vi.fn(async () => true),
        onCommandExecuted: (callback: (commandInfo: ICommandInfo) => void) => {
            callbacks.add(callback);
            return {
                dispose: () => callbacks.delete(callback),
            };
        },
        emit: (id: string, params?: unknown) => {
            callbacks.forEach((callback) => callback({ id, params } as ICommandInfo));
        },
    };
}

function createFFormula(computingStatusService?: { computingStatus: boolean; computingStatus$: BehaviorSubject<boolean> }) {
    const commandService = createCommandServiceMock();
    const configService = {
        setConfig: vi.fn(),
    };
    const lexerTreeBuilder = {
        moveFormulaRefOffset: vi.fn(() => '=B2'),
        sequenceNodesBuilder: vi.fn(() => ['SUM', 'A1']),
        getFormulaExprTree: vi.fn(() => ({ value: 'SUM(A1)', children: [], startIndex: 0 })),
    };
    const functionService = {
        hasExecutor: vi.fn(() => true),
    };
    const definedNamesService = {
        getValueByName: vi.fn(() => undefined),
    };
    const superTableService = {
        getTable: vi.fn(() => undefined),
    };
    const injector = {
        get: vi.fn(() => computingStatusService),
    };

    const formula = new FFormula(
        commandService as never,
        injector as never,
        lexerTreeBuilder as never,
        configService as never,
        functionService as never,
        definedNamesService as never,
        superTableService as never
    );

    return {
        formula,
        commandService,
        configService,
        lexerTreeBuilder,
        functionService,
        definedNamesService,
        superTableService,
    };
}

describe('FFormula', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('should delegate lexer tree methods', () => {
        const { formula, lexerTreeBuilder } = createFFormula();

        expect(formula.moveFormulaRefOffset('=A1', 1, 1)).toBe('=B2');
        expect(lexerTreeBuilder.moveFormulaRefOffset).toHaveBeenCalledWith('=A1', 1, 1, undefined);

        expect(formula.sequenceNodesBuilder('=SUM(A1)')).toEqual(['SUM', 'A1']);
        lexerTreeBuilder.sequenceNodesBuilder.mockReturnValueOnce(undefined as never);
        expect(formula.sequenceNodesBuilder('=X')).toEqual([]);
    });

    it('should execute start/stop commands and listen to command events', () => {
        const { formula, commandService } = createFFormula();
        const onStart = vi.fn();
        const onEnd = vi.fn();
        const onProgress = vi.fn();

        formula.executeCalculation();
        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetTriggerFormulaCalculationStartMutation.id,
            { commands: [], forceCalculation: true },
            { onlyLocal: true }
        );

        formula.stopCalculation();
        expect(commandService.executeCommand).toHaveBeenCalledWith(SetFormulaCalculationStopMutation.id, {});

        formula.calculationStart(onStart);
        formula.calculationEnd(onEnd);
        formula.calculationProcessing(onProgress);

        commandService.emit(SetFormulaCalculationStartMutation.id, { forceCalculation: true });
        commandService.emit(SetFormulaCalculationNotificationMutation.id, { functionsExecutedState: 1 });
        commandService.emit(SetFormulaCalculationNotificationMutation.id, {
            stageInfo: {
                totalFormulasToCalculate: 1,
                completedFormulasCount: 1,
                totalArrayFormulasToCalculate: 0,
                completedArrayFormulasCount: 0,
                formulaCycleIndex: 0,
                stage: 4,
            },
        });

        expect(onStart).toHaveBeenCalledWith(true);
        expect(onEnd).toHaveBeenCalledWith(1);
        expect(onProgress).toHaveBeenCalledTimes(1);
    });

    it('should wait computing complete by status stream or timeout', async () => {
        const status$ = new BehaviorSubject(false);
        const computingStatusService = {
            computingStatus: false,
            computingStatus$: status$,
        };
        const { formula } = createFFormula(computingStatusService);

        const pending = formula.whenComputingCompleteAsync(200);
        status$.next(true);
        await expect(pending).resolves.toBe(true);

        const timeoutService = {
            computingStatus: false,
            computingStatus$: new BehaviorSubject(false),
        };
        const { formula: timeoutFormula } = createFFormula(timeoutService);
        const timeoutPromise = timeoutFormula.whenComputingCompleteAsync(1);
        await expect(timeoutPromise).resolves.toBe(false);

        const readyService = {
            computingStatus: true,
            computingStatus$: new BehaviorSubject(true),
        };
        const { formula: readyFormula } = createFFormula(readyService);
        await expect(readyFormula.whenComputingCompleteAsync()).resolves.toBe(true);
    });

    it('should resolve and timeout on onCalculationEnd()', async () => {
        const { formula, commandService } = createFFormula();
        const pending = formula.onCalculationEnd();

        commandService.emit(SetFormulaCalculationNotificationMutation.id, { functionsExecutedState: 1 });
        await expect(pending).resolves.toBeUndefined();

        vi.useFakeTimers();
        const timeoutPromise = expect(formula.onCalculationEnd()).rejects.toThrow('Calculation end timeout');
        await vi.advanceTimersByTimeAsync(30_001);
        await timeoutPromise;
    });

    it('should set formula configs', () => {
        const { formula, configService } = createFFormula();

        formula.setMaxIteration(12);
        formula.setFormulaReturnDependencyTree(true);

        expect(configService.setConfig).toHaveBeenCalledWith(ENGINE_FORMULA_CYCLE_REFERENCE_COUNT, 12);
        expect(configService.setConfig).toHaveBeenCalledWith(ENGINE_FORMULA_RETURN_DEPENDENCY_TREE, true);
    });

    it('should execute formulas and resolve results', async () => {
        const { formula, commandService } = createFFormula();
        const pending = formula.executeFormulas({ unit: { sheet: {} } }, 100);

        commandService.emit(SetFormulaStringBatchCalculationResultMutation.id, {
            result: { unit: { sheet: { 0: { 0: [{ value: 1, formula: '=1' }] } } } },
        });
        await expect(pending).resolves.toEqual({ unit: { sheet: { 0: { 0: [{ value: 1, formula: '=1' }] } } } });

        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetFormulaStringBatchCalculationMutation.id,
            { formulas: { unit: { sheet: {} } } },
            { onlyLocal: true }
        );
    });

    it('should reject executeFormulas for empty result or timeout', async () => {
        const { formula, commandService } = createFFormula();
        const emptyResult = formula.executeFormulas({ unit: { sheet: {} } }, 100);
        commandService.emit(SetFormulaStringBatchCalculationResultMutation.id, { result: null });
        await expect(emptyResult).rejects.toThrow('Formula batch calculation returned no result');

        vi.useFakeTimers();
        const timeoutResult = expect(formula.executeFormulas({ unit: { sheet: {} } }, 1)).rejects.toThrow('Formula batch calculation timeout');
        await vi.advanceTimersByTimeAsync(2);
        await timeoutResult;
    });

    it('should query all dependency trees', async () => {
        const { formula, commandService } = createFFormula();
        const pending = formula.getAllDependencyTrees(100);
        commandService.emit(SetFormulaDependencyCalculationResultMutation.id, { result: [{ treeId: 1 }] });
        await expect(pending).resolves.toEqual([{ treeId: 1 }]);

        const emptyPending = formula.getAllDependencyTrees(100);
        commandService.emit(SetFormulaDependencyCalculationResultMutation.id, { result: null });
        await expect(emptyPending).resolves.toEqual([]);

        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetFormulaDependencyCalculationMutation.id,
            undefined,
            { onlyLocal: true }
        );
    });

    it('should query cell dependency tree', async () => {
        const { formula, commandService } = createFFormula();
        const pending = formula.getCellDependencyTree(
            { unitId: 'u', sheetId: 's', row: 1, column: 2 },
            100
        );
        commandService.emit(SetCellFormulaDependencyCalculationResultMutation.id, { result: { treeId: 11 } });
        await expect(pending).resolves.toEqual({ treeId: 11 });

        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetCellFormulaDependencyCalculationMutation.id,
            { unitId: 'u', sheetId: 's', row: 1, column: 2 },
            { onlyLocal: true }
        );
    });

    it('should query range dependents and in-range formulas', async () => {
        const { formula, commandService } = createFFormula();
        const ranges = [{ unitId: 'u', sheetId: 's', range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 } }];

        const dependents = formula.getRangeDependents(ranges, 100);
        commandService.emit(SetQueryFormulaDependencyResultMutation.id, { result: [{ treeId: 2 }] });
        await expect(dependents).resolves.toEqual([{ treeId: 2 }]);

        const inRanges = formula.getInRangeFormulas(ranges, 100);
        commandService.emit(SetQueryFormulaDependencyResultMutation.id, { result: null });
        await expect(inRanges).resolves.toEqual([]);

        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetQueryFormulaDependencyMutation.id,
            { unitRanges: ranges },
            { onlyLocal: true }
        );
        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetQueryFormulaDependencyMutation.id,
            { unitRanges: ranges, isInRange: true },
            { onlyLocal: true }
        );
    });

    it('should query dependents and in-range formulas in one call', async () => {
        const { formula, commandService } = createFFormula();
        const ranges = [{ unitId: 'u', sheetId: 's', range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 } }];

        const pending = formula.getRangeDependentsAndInRangeFormulas(ranges, 100);
        commandService.emit(SetQueryFormulaDependencyAllResultMutation.id, {
            result: {
                dependents: [{ treeId: 3 }],
                inRanges: [{ treeId: 4 }],
            },
        });
        await expect(pending).resolves.toEqual({
            dependents: [{ treeId: 3 }],
            inRanges: [{ treeId: 4 }],
        });

        const emptyPending = formula.getRangeDependentsAndInRangeFormulas(ranges, 100);
        commandService.emit(SetQueryFormulaDependencyAllResultMutation.id, { result: null });
        await expect(emptyPending).resolves.toEqual({ dependents: [], inRanges: [] });

        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetQueryFormulaDependencyAllMutation.id,
            { unitRanges: ranges },
            { onlyLocal: true }
        );
    });

    it('should delegate getFormulaExpressTree with bound providers', () => {
        const { formula, lexerTreeBuilder, functionService, definedNamesService, superTableService } = createFFormula();
        const tree = formula.getFormulaExpressTree('=SUM(A1)', 'unit-1');

        expect(tree).toEqual({ value: 'SUM(A1)', children: [], startIndex: 0 });
        expect(lexerTreeBuilder.getFormulaExprTree).toHaveBeenCalledWith(
            '=SUM(A1)',
            'unit-1',
            expect.any(Function),
            expect.any(Function),
            expect.any(Function)
        );
    });
});
