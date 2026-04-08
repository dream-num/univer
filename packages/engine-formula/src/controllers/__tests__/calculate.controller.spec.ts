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
import { ObjectMatrix } from '@univerjs/core';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
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
import { SetImageFormulaDataMutation } from '../../commands/mutations/set-image-formula-data.mutation';
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

        // eslint-disable-next-line no-new
        new CalculateController(
            commandService as never,
            calculateFormulaService as never,
            formulaDataModel as never
        );

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

        // eslint-disable-next-line no-new
        new CalculateController(
            commandService as never,
            calculateFormulaService as never,
            formulaDataModel as never
        );

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

    it('should emit calculation progress and apply successful runtime result', async () => {
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

        // eslint-disable-next-line no-new
        new CalculateController(
            commandService as never,
            calculateFormulaService as never,
            formulaDataModel as never
        );

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

        executionCompleteListener$.next({
            functionsExecutedState: FormulaExecutedStateType.SUCCESS,
            unitData: {
                unit: {
                    sheet: new ObjectMatrix({
                        0: {
                            0: { v: 123 },
                        },
                    }),
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
        });
        await Promise.resolve();

        expect(formulaDataModel.clearPreviousArrayFormulaCellData).toHaveBeenCalled();
        expect(formulaDataModel.mergeArrayFormulaCellData).toHaveBeenCalled();
        expect(formulaDataModel.mergeArrayFormulaRange).toHaveBeenCalled();
        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetArrayFormulaDataMutation.id,
            expect.anything(),
            { onlyLocal: true }
        );
        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetImageFormulaDataMutation.id,
            expect.objectContaining({
                imageFormulaData: expect.any(Array),
            }),
            { onlyLocal: true }
        );
        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetFormulaDependencyCalculationResultMutation.id,
            { result: [{ treeId: 100 }] },
            { onlyLocal: true }
        );
        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetFormulaCalculationResultMutation.id,
            expect.anything(),
            { onlyLocal: true }
        );
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

        // eslint-disable-next-line no-new
        new CalculateController(
            commandService as never,
            calculateFormulaService as never,
            formulaDataModel as never
        );

        executionCompleteListener$.next({
            functionsExecutedState: FormulaExecutedStateType.NOT_EXECUTED,
            dependencyTreeModelData: [{ treeId: 201 }],
        });
        await Promise.resolve();

        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetFormulaDependencyCalculationResultMutation.id,
            { result: [{ treeId: 201 }] },
            { onlyLocal: true }
        );
        expect(commandService.executeCommand).toHaveBeenCalledWith(
            SetFormulaCalculationNotificationMutation.id,
            { functionsExecutedState: FormulaExecutedStateType.NOT_EXECUTED },
            { onlyLocal: true }
        );
    });
});
