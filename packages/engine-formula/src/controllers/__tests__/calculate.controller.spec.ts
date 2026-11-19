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
import { ICommandService, Injector, ObjectMatrix } from '@univerjs/core';
import { fromModule, toModule } from '@univerjs/rpc';
import { Subject } from 'rxjs';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import type { IFormulaDatasetConfig } from '../../basics/common';
import type { IFormulaDataSnapshot } from '../../models/formula-data-snapshot';
import type { IAllRuntimeData, IExecutionInProgressParams } from '../../services/runtime.service';
import { SetArrayFormulaDataMutation } from '../../commands/mutations/set-array-formula-data.mutation';
import {
    SetCellFormulaDependencyCalculationMutation,
    SetCellFormulaDependencyCalculationResultMutation,
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
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
} from '../../commands/mutations/set-formula-calculation.mutation';
import { FormulaDataModel } from '../../models/formula-data.model';
import { ICalculateFormulaService } from '../../services/calculate-formula.service';
import { FormulaExecutedStateType, FormulaExecuteStageType } from '../../services/runtime.service';
import { CalculateController } from '../calculate.controller';

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

function createTestBed(
    commandService: ICommandServiceMock,
    calculateFormulaService: Pick<ICalculateFormulaService, 'execute' | 'executionCompleteListener$' | 'executionInProgressListener$'>,
    formulaDataModel: Pick<FormulaDataModel, 'getFormulaData' | 'getArrayFormulaCellData' | 'getArrayFormulaRange'>
) {
    const injector = new Injector([
        [ICommandService, { useValue: commandService }],
        [ICalculateFormulaService, { useValue: calculateFormulaService }],
        [FormulaDataModel, { useValue: formulaDataModel }],
        [CalculateController],
    ]);
    onTestFinished(() => injector.dispose());
    return injector;
}

describe('CalculateController', () => {
    it('should dispatch execute and stop events from commands', async () => {
        const commandService = createCommandServiceMock();
        const executionCompleteListener$ = new Subject<any>();
        const executionInProgressListener$ = new Subject<any>();
        const calculateFormulaService = {
            executionCompleteListener$,
            executionInProgressListener$,
            stopFormulaExecution: vi.fn(),
            execute: vi.fn(),
            executeFormulas: vi.fn(async () => ({ u: {} })),
            getAllDependencyJson: vi.fn(async () => [{ treeId: 1 }]),
            getCellDependencyJson: vi.fn(async () => ({ treeId: 2 })),
            getInRangeFormulas: vi.fn(async () => [{ treeId: 3 }]),
            getRangeDependents: vi.fn(async () => [{ treeId: 4 }]),
            getDependentsAndInRangeFormulas: vi.fn(async () => ({ dependents: [], inRanges: [] })),
        };
        const formulaDataModel = {
            getFormulaData: vi.fn(() => ({ unit: {} })),
            getArrayFormulaCellData: vi.fn(() => ({ unit: {} })),
            getArrayFormulaRange: vi.fn(() => ({ unit: {} })),
            setArrayFormulaRange: vi.fn(),
            setArrayFormulaCellData: vi.fn(),
            clearPreviousArrayFormulaCellData: vi.fn(),
            mergeArrayFormulaCellData: vi.fn(),
            mergeArrayFormulaRange: vi.fn(),
        };

        const injector = createTestBed(commandService, calculateFormulaService, formulaDataModel);
        injector.get(CalculateController);

        commandService.emit(SetFormulaCalculationStopMutation.id, {});
        expect(calculateFormulaService.stopFormulaExecution).toHaveBeenCalledTimes(1);

        commandService.emit(SetFormulaCalculationStartMutation.id, {
            forceCalculation: true,
            dirtyRanges: [],
        });
        expect(calculateFormulaService.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                formulaData: { unit: {} },
                arrayFormulaCellData: { unit: {} },
                arrayFormulaRange: { unit: {} },
                forceCalculate: true,
            })
        );

        commandService.emit(SetArrayFormulaDataMutation.id, {
            arrayFormulaRange: { u: { s: {} } },
            arrayFormulaCellData: { u: { s: {} } },
        });
        expect(formulaDataModel.setArrayFormulaRange).toHaveBeenCalled();
        expect(formulaDataModel.setArrayFormulaCellData).toHaveBeenCalled();
    });

    it('should handle formula query commands and emit local result mutations', async () => {
        const commandService = createCommandServiceMock();
        const executionCompleteListener$ = new Subject<any>();
        const executionInProgressListener$ = new Subject<any>();
        const calculateFormulaService = {
            executionCompleteListener$,
            executionInProgressListener$,
            stopFormulaExecution: vi.fn(),
            execute: vi.fn(),
            executeFormulas: vi.fn(async () => ({ unit: { sheet: {} } })),
            getAllDependencyJson: vi.fn(async () => [{ treeId: 11 }]),
            getCellDependencyJson: vi.fn(async () => ({ treeId: 12 })),
            getInRangeFormulas: vi.fn(async () => [{ treeId: 13 }]),
            getRangeDependents: vi.fn(async () => [{ treeId: 14 }]),
            getDependentsAndInRangeFormulas: vi.fn(async () => ({ dependents: [{ treeId: 15 }], inRanges: [{ treeId: 16 }] })),
        };
        const formulaDataModel = {
            getFormulaData: vi.fn(() => ({})),
            getArrayFormulaCellData: vi.fn(() => ({})),
            getArrayFormulaRange: vi.fn(() => ({})),
            setArrayFormulaRange: vi.fn(),
            setArrayFormulaCellData: vi.fn(),
            clearPreviousArrayFormulaCellData: vi.fn(),
            mergeArrayFormulaCellData: vi.fn(),
            mergeArrayFormulaRange: vi.fn(),
        };

        const injector = createTestBed(commandService, calculateFormulaService, formulaDataModel);
        injector.get(CalculateController);

        commandService.emit(SetFormulaStringBatchCalculationMutation.id, {
            formulas: {
                unit: {
                    sheet: {
                        1: {
                            1: ['=A1'],
                        },
                    },
                },
            },
        });
        await Promise.resolve();
        expect(calculateFormulaService.executeFormulas).toHaveBeenCalled();
        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetFormulaStringBatchCalculationResultMutation.id,
            { result: { unit: { sheet: {} } } },
            { onlyLocal: true }
        );

        commandService.emit(SetFormulaDependencyCalculationMutation.id, {});
        await Promise.resolve();
        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetFormulaDependencyCalculationResultMutation.id,
            { result: [{ treeId: 11 }] },
            { onlyLocal: true }
        );

        commandService.emit(SetCellFormulaDependencyCalculationMutation.id, {
            unitId: 'u',
            sheetId: 's',
            row: 1,
            column: 2,
        });
        await Promise.resolve();
        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetCellFormulaDependencyCalculationResultMutation.id,
            { result: { treeId: 12 } },
            { onlyLocal: true }
        );

        commandService.emit(SetQueryFormulaDependencyMutation.id, {
            unitRanges: [],
            isInRange: false,
        });
        await Promise.resolve();
        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetQueryFormulaDependencyResultMutation.id,
            { result: [{ treeId: 14 }] },
            { onlyLocal: true }
        );

        commandService.emit(SetQueryFormulaDependencyMutation.id, {
            unitRanges: [],
            isInRange: true,
        });
        await Promise.resolve();
        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetQueryFormulaDependencyResultMutation.id,
            { result: [{ treeId: 13 }] },
            { onlyLocal: true }
        );

        commandService.emit(SetQueryFormulaDependencyAllMutation.id, {
            unitRanges: [],
        });
        await Promise.resolve();
        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetQueryFormulaDependencyAllResultMutation.id,
            { result: { dependents: [{ treeId: 15 }], inRanges: [{ treeId: 16 }] } },
            { onlyLocal: true }
        );
    });

    it('emits one terminal notification without resubmitting results', async () => {
        const commandService = createCommandServiceMock();
        const executionCompleteListener$ = new Subject<any>();
        const executionInProgressListener$ = new Subject<any>();
        const calculateFormulaService = {
            executionCompleteListener$,
            executionInProgressListener$,
            stopFormulaExecution: vi.fn(),
            execute: vi.fn(),
            executeFormulas: vi.fn(async () => ({})),
            getAllDependencyJson: vi.fn(async () => []),
            getCellDependencyJson: vi.fn(async () => undefined),
            getInRangeFormulas: vi.fn(async () => []),
            getRangeDependents: vi.fn(async () => []),
            getDependentsAndInRangeFormulas: vi.fn(async () => ({ dependents: [], inRanges: [] })),
        };
        const formulaDataModel = {
            getFormulaData: vi.fn(() => ({})),
            getArrayFormulaCellData: vi.fn(() => ({})),
            getArrayFormulaRange: vi.fn(() => ({})),
            setArrayFormulaRange: vi.fn(),
            setArrayFormulaCellData: vi.fn(),
            clearPreviousArrayFormulaCellData: vi.fn(),
            mergeArrayFormulaCellData: vi.fn(),
            mergeArrayFormulaRange: vi.fn(),
        };

        const injector = createTestBed(commandService, calculateFormulaService, formulaDataModel);
        injector.get(CalculateController);

        executionInProgressListener$.next({
            totalFormulasToCalculate: 3,
            completedFormulasCount: 1,
            totalArrayFormulasToCalculate: 0,
            completedArrayFormulasCount: 0,
            formulaCycleIndex: 0,
            stage: FormulaExecuteStageType.CURRENTLY_CALCULATING,
        });

        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetFormulaCalculationNotificationMutation.id,
            expect.objectContaining({
                stageInfo: expect.objectContaining({
                    stage: FormulaExecuteStageType.CURRENTLY_CALCULATING,
                }),
            }),
            { onlyLocal: true }
        );

        const unitMatrix = new ObjectMatrix({ 0: { 0: { v: 123 } } });
        const forValue = vi.spyOn(unitMatrix, 'forValue');
        const runtimeData = {
            functionsExecutedState: FormulaExecutedStateType.SUCCESS,
            unitData: {
                unit: {
                    sheet: unitMatrix,
                },
            },
            unitOtherData: {},
            arrayFormulaRange: { unit: { sheet: {} } },
            arrayFormulaCellData: { unit: { sheet: {} } },
            clearArrayFormulaCellData: {},
            arrayFormulaEmbedded: { unit: { sheet: {} } },
            imageFormulaData: [
                { unitId: 'unit', sheetId: 'sheet', row: 1, column: 1, imageId: 'img-1' },
            ],
            runtimeFeatureRange: {},
            runtimeFeatureCellData: {},
            dependencyTreeModelData: [{ treeId: 100 }],
        };
        executionCompleteListener$.next(runtimeData);
        await Promise.resolve();

        expect(commandService.executeCommand.mock.calls.filter(([id]) => id === SetFormulaCalculationResultMutation.id)).toHaveLength(0);
        expect(formulaDataModel.mergeArrayFormulaCellData).not.toHaveBeenCalled();
        expect(forValue).not.toHaveBeenCalled();
        expect(commandService.executeCommand).toHaveBeenLastCalledWith(
            SetFormulaCalculationNotificationMutation.id,
            { functionsExecutedState: FormulaExecutedStateType.SUCCESS },
            { onlyLocal: true }
        );
        expect(runtimeData.unitData.unit.sheet).toBe(unitMatrix);
        expect(unitMatrix.getValue(0, 0)).toEqual({ v: 123 });
    });

    it('should only apply tree result when no formula executed', async () => {
        const commandService = createCommandServiceMock();
        const executionCompleteListener$ = new Subject<any>();
        const executionInProgressListener$ = new Subject<any>();
        const calculateFormulaService = {
            executionCompleteListener$,
            executionInProgressListener$,
            stopFormulaExecution: vi.fn(),
            execute: vi.fn(),
            executeFormulas: vi.fn(async () => ({})),
            getAllDependencyJson: vi.fn(async () => []),
            getCellDependencyJson: vi.fn(async () => undefined),
            getInRangeFormulas: vi.fn(async () => []),
            getRangeDependents: vi.fn(async () => []),
            getDependentsAndInRangeFormulas: vi.fn(async () => ({ dependents: [], inRanges: [] })),
        };
        const formulaDataModel = {
            getFormulaData: vi.fn(() => ({})),
            getArrayFormulaCellData: vi.fn(() => ({})),
            getArrayFormulaRange: vi.fn(() => ({})),
            setArrayFormulaRange: vi.fn(),
            setArrayFormulaCellData: vi.fn(),
            clearPreviousArrayFormulaCellData: vi.fn(),
            mergeArrayFormulaCellData: vi.fn(),
            mergeArrayFormulaRange: vi.fn(),
        };

        const injector = createTestBed(commandService, calculateFormulaService, formulaDataModel);
        injector.get(CalculateController);

        executionCompleteListener$.next({
            functionsExecutedState: FormulaExecutedStateType.NOT_EXECUTED,
            dependencyTreeModelData: [{ treeId: 201 }],
        });
        await Promise.resolve();

        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetFormulaCalculationNotificationMutation.id,
            { functionsExecutedState: FormulaExecutedStateType.NOT_EXECUTED },
            { onlyLocal: true }
        );
        for (const state of [FormulaExecutedStateType.STOP_EXECUTION, FormulaExecutedStateType.INITIAL]) {
            commandService.executeCommand.mockClear();
            executionCompleteListener$.next({ functionsExecutedState: state });
            await Promise.resolve();
            expect(commandService.executeCommand).toHaveBeenCalledTimes(1);
            expect(commandService.executeCommand).toHaveBeenCalledWith(
                SetFormulaCalculationNotificationMutation.id,
                { functionsExecutedState: state },
                { onlyLocal: true }
            );
        }
    });
});

describe('CalculateController formula snapshot capability', () => {
    it('captures before later metadata reads and passes no placeholder formula data', async () => {
        const commandService = createCommandServiceMock();
        let formula = '=1';
        const events: string[] = [];
        const service = {
            executionCompleteListener$: new Subject<IAllRuntimeData>(),
            executionInProgressListener$: new Subject<IExecutionInProgressParams>(),
            supportsFormulaDataSnapshot: true,
            prepareFormulaDataSnapshot: vi.fn(() => {
                events.push('capture');
                const captured = formula;
                return { materialize: () => ({ u: { s: { 0: { 1: { f: captured } } } } }) };
            }),
            execute: vi.fn(async () => {}),
            executeWithFormulaDataSnapshot: vi.fn(async function (
                this: unknown,
                config: Omit<IFormulaDatasetConfig, 'formulaData'>,
                snapshot: IFormulaDataSnapshot
            ) {
                expect(this).toBe(service);
                expect(Object.hasOwn(config, 'formulaData')).toBe(false);
                expect(config.dirtyReferenceUnits).toEqual(['u']);
                expect(snapshot.materialize()).toEqual({ u: { s: { 0: { 1: { f: '=1' } } } } });
            }),
        };
        const model = {
            getFormulaData: vi.fn(),
            getArrayFormulaCellData: () => {
                events.push('cells');
                formula = '=99';
                return {};
            },
            getArrayFormulaRange: () => {
                events.push('ranges');
                return {};
            },
        };
        const injector = createTestBed(commandService, service, model);
        injector.get(CalculateController);
        commandService.emit(SetFormulaCalculationStartMutation.id, { dirtyReferenceUnits: ['u'] });
        await Promise.resolve();
        expect(events).toEqual(['capture', 'cells', 'ranges']);
        expect(service.executeWithFormulaDataSnapshot).toHaveBeenCalledTimes(1);
        expect(service.execute).not.toHaveBeenCalled();
        expect(model.getFormulaData).not.toHaveBeenCalled();
    });

    it('uses the eager getter once when snapshot preparation declines', async () => {
        const commandService = createCommandServiceMock();
        const data = { u: {} };
        const service = {
            executionCompleteListener$: new Subject<IAllRuntimeData>(),
            executionInProgressListener$: new Subject<IExecutionInProgressParams>(),
            supportsFormulaDataSnapshot: true,
            prepareFormulaDataSnapshot: vi.fn(() => undefined),
            executeWithFormulaDataSnapshot: vi.fn(),
            execute: vi.fn(async (_config: IFormulaDatasetConfig) => {}),
        };
        const model = {
            getFormulaData: vi.fn(() => data),
            getArrayFormulaCellData: () => ({}),
            getArrayFormulaRange: () => ({}),
        };
        const injector = createTestBed(commandService, service, model);
        injector.get(CalculateController);
        commandService.emit(SetFormulaCalculationStartMutation.id, { dirtyReferenceUnits: ['u'] });
        await Promise.resolve();
        expect(model.getFormulaData).toHaveBeenCalledTimes(1);
        expect(service.execute.mock.calls[0][0].formulaData).toBe(data);
        expect(service.execute.mock.calls[0][0].dirtyReferenceUnits).toEqual(['u']);
        expect(service.executeWithFormulaDataSnapshot).not.toHaveBeenCalled();
    });

    it('does not opt in through dynamically generated RPC methods', async () => {
        const commandService = createCommandServiceMock();
        const data = { u: {} };
        const execute = vi.fn(async (_config: IFormulaDatasetConfig) => {});
        const unknownRpcCall = vi.fn();
        const service = new Proxy({
            execute,
            executionCompleteListener$: new Subject<IAllRuntimeData>(),
            executionInProgressListener$: new Subject<IExecutionInProgressParams>(),
        }, {
            get(target, key, receiver) {
                if (key === 'dispose') return undefined;
                return Reflect.has(target, key) ? Reflect.get(target, key, receiver) : unknownRpcCall;
            },
        });
        const model = {
            getFormulaData: vi.fn(() => data),
            getArrayFormulaCellData: () => ({}),
            getArrayFormulaRange: () => ({}),
        };
        const injector = createTestBed(commandService, service, model);
        injector.get(CalculateController);
        commandService.emit(SetFormulaCalculationStartMutation.id, {});
        await Promise.resolve();
        expect(unknownRpcCall).not.toHaveBeenCalled();
        expect(execute.mock.calls[0][0].formulaData).toBe(data);
    });

    it('keeps the complete formula DTO on the existing RPC channel without invoking optional capabilities', async () => {
        const commandService = createCommandServiceMock();
        const data = { u: {} };
        const channel = fromModule({ execute: vi.fn(async (_config: IFormulaDatasetConfig) => {}) });
        const call = vi.spyOn(channel, 'call');
        const subscribe = vi.spyOn(channel, 'subscribe');
        const remote = toModule<ICalculateFormulaService>(channel);
        // The controller consumes local observables; calculation methods retain the real channel proxy.
        const service = new Proxy({
            executionCompleteListener$: new Subject<IAllRuntimeData>(),
            executionInProgressListener$: new Subject<IExecutionInProgressParams>(),
            execute: remote.execute,
        }, {
            get(target, key, receiver) {
                return Reflect.has(target, key) ? Reflect.get(target, key, receiver) : Reflect.get(remote, key);
            },
        });
        const model = {
            getFormulaData: vi.fn(() => data),
            getArrayFormulaCellData: () => ({}),
            getArrayFormulaRange: () => ({}),
        };
        const injector = createTestBed(commandService, service, model);
        injector.get(CalculateController);
        commandService.emit(SetFormulaCalculationStartMutation.id, {});
        await Promise.resolve();
        expect(call).toHaveBeenCalledTimes(1);
        expect(call).toHaveBeenCalledWith('execute', [expect.objectContaining({ formulaData: data })]);
        expect(model.getFormulaData).toHaveBeenCalledTimes(1);
        expect(subscribe).not.toHaveBeenCalled();
    });
});
