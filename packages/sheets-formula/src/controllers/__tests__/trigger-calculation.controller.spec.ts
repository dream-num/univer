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

import type { Dependency, IWorkbookData } from '@univerjs/core';
import type { IExecutionInProgressParams } from '@univerjs/engine-formula';
import {
    CommandType,
    ICommandService,
    IConfigService,
    LocaleType,
} from '@univerjs/core';
import {
    ActiveDirtyManagerService,
    ENGINE_FORMULA_CYCLE_REFERENCE_COUNT,
    ENGINE_FORMULA_RETURN_DEPENDENCY_TREE,
    FormulaDataModel,
    FormulaExecutedStateType,
    FormulaExecuteStageType,
    IActiveDirtyManagerService,
    RegisterOtherFormulaService,
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationStartMutation,
    SetFormulaCalculationStopMutation,
    SetFormulaStringBatchCalculationMutation,
    SetTriggerFormulaCalculationStartMutation,
} from '@univerjs/engine-formula';
import { SetRangeValuesMutation, SetStyleCommand } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFacadeTestBed } from '../../facade/__tests__/create-test-bed';
import { CalculationMode, PLUGIN_CONFIG_KEY_BASE } from '../config.schema';
import { TriggerCalculationController } from '../trigger-calculation.controller';

function createWorkbookData(): IWorkbookData {
    return {
        id: 'test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'test',
        sheetOrder: ['sheet1'],
        sheets: {
            sheet1: {
                id: 'sheet1',
                name: 'Sheet1',
                rowCount: 20,
                columnCount: 20,
                cellData: {
                    0: {
                        0: { f: '=SUM(B1)' },
                    },
                },
            },
        },
        styles: {},
    };
}

function createControllerTestBed() {
    const dependencies: Dependency[] = [
        [IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }],
        [RegisterOtherFormulaService],
        [TriggerCalculationController],
    ];

    const testBed = createFacadeTestBed(createWorkbookData(), dependencies);
    const injector = testBed.injector;
    const commandService = injector.get(ICommandService);
    const configService = injector.get(IConfigService);

    configService.setConfig(PLUGIN_CONFIG_KEY_BASE, { initialFormulaComputing: CalculationMode.WHEN_EMPTY }, { merge: true });
    configService.setConfig(ENGINE_FORMULA_RETURN_DEPENDENCY_TREE, true);
    configService.setConfig(ENGINE_FORMULA_CYCLE_REFERENCE_COUNT, 7);

    [
        SetTriggerFormulaCalculationStartMutation,
        SetFormulaCalculationStartMutation,
        SetFormulaCalculationStopMutation,
        SetFormulaCalculationNotificationMutation,
        SetFormulaStringBatchCalculationMutation,
        SetRangeValuesMutation,
    ].forEach((command) => commandService.registerCommand(command));

    commandService.registerCommand({
        id: 'formula.test-dirty-1',
        type: CommandType.COMMAND,
        handler: () => true,
    });
    commandService.registerCommand({
        id: 'formula.test-dirty-2',
        type: CommandType.COMMAND,
        handler: () => true,
    });
    commandService.registerCommand({
        id: 'formula.test-dirty-restart',
        type: CommandType.COMMAND,
        handler: () => true,
    });

    const executedCommands: Array<{ id: string; params?: object; options?: object }> = [];
    const executedDisposable = commandService.onCommandExecuted((command, options) => {
        executedCommands.push({
            id: command.id,
            params: command.params as object | undefined,
            options: options as object | undefined,
        });
    });

    const controller = injector.get(TriggerCalculationController);

    return {
        testBed,
        controller,
        commandService,
        formulaDataModel: injector.get(FormulaDataModel),
        activeDirtyManagerService: injector.get(IActiveDirtyManagerService),
        registerOtherFormulaService: injector.get(RegisterOtherFormulaService),
        executedCommands,
        executedDisposable,
    };
}

describe('TriggerCalculationController', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should trigger initial calculation and enrich calculation params through real command hooks', async () => {
        const testBed = createControllerTestBed();

        await Promise.resolve();

        expect(testBed.registerOtherFormulaService.calculateStarted$.getValue()).toBe(true);

        testBed.executedCommands.length = 0;

        await testBed.commandService.executeCommand(SetFormulaCalculationStartMutation.id, {});
        await testBed.commandService.executeCommand(SetFormulaStringBatchCalculationMutation.id, {});

        expect(testBed.executedCommands.find((command) => command.id === SetFormulaCalculationStartMutation.id)).toMatchObject({
            id: SetFormulaCalculationStartMutation.id,
            params: expect.objectContaining({
                isCalculateTreeModel: true,
                maxIteration: 7,
                rowData: testBed.formulaDataModel.getHiddenRowsFiltered(),
            }),
        });
        expect(testBed.executedCommands.find((command) => command.id === SetFormulaStringBatchCalculationMutation.id)).toMatchObject({
            id: SetFormulaStringBatchCalculationMutation.id,
            params: expect.objectContaining({
                maxIteration: 7,
                rowData: testBed.formulaDataModel.getHiddenRowsFiltered(),
            }),
        });

        testBed.executedDisposable.dispose();
        testBed.testBed.univer.dispose();
    });

    it('should merge dirty data from real active-dirty registrations and skip style-triggered range updates', async () => {
        const testBed = createControllerTestBed();

        testBed.activeDirtyManagerService.register('formula.test-dirty-1', {
            commandId: 'formula.test-dirty-1',
            getDirtyData: () => ({
                dirtyRanges: [
                    { unitId: 'test', sheetId: 'sheet1', range: { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 } },
                    { unitId: 'test', sheetId: 'sheet1', range: { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 } },
                ],
                dirtyNameMap: { test: { sheet1: '1' } },
                dirtyDefinedNameMap: { test: { sheet1: '1' } },
                dirtyUnitFeatureMap: { test: { sheet1: { featureA: true } } },
                dirtyUnitOtherFormulaMap: { test: { sheet1: { formulaA: true } } },
                clearDependencyTreeCache: { test: { sheet1: '1' } },
            }),
        });
        testBed.activeDirtyManagerService.register('formula.test-dirty-2', {
            commandId: 'formula.test-dirty-2',
            getDirtyData: () => ({
                dirtyRanges: [{ unitId: 'test', sheetId: 'sheet1', range: { startRow: 2, startColumn: 0, endRow: 3, endColumn: 1 } }],
                dirtyUnitFeatureMap: { test: { sheet1: { featureB: false } } },
                forceCalculation: true,
            }),
        });
        testBed.activeDirtyManagerService.register(SetRangeValuesMutation.id, {
            commandId: SetRangeValuesMutation.id,
            getDirtyData: () => ({
                dirtyRanges: [{ unitId: 'test', sheetId: 'sheet1', range: { startRow: 9, startColumn: 9, endRow: 9, endColumn: 9 } }],
            }),
        });

        testBed.executedCommands.length = 0;

        await testBed.commandService.executeCommand('formula.test-dirty-1');
        await testBed.commandService.executeCommand(SetRangeValuesMutation.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            trigger: SetStyleCommand.id,
            cellValue: { 0: { 0: { v: 1 } } },
        });
        await testBed.commandService.executeCommand('formula.test-dirty-2');

        await vi.advanceTimersByTimeAsync(150);

        const startCommand = testBed.executedCommands.findLast((command) => command.id === SetFormulaCalculationStartMutation.id);

        expect(startCommand).toMatchObject({
            params: {
                forceCalculation: true,
                dirtyRanges: [
                    { unitId: 'test', sheetId: 'sheet1', range: { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 } },
                    { unitId: 'test', sheetId: 'sheet1', range: { startRow: 2, startColumn: 0, endRow: 3, endColumn: 1 } },
                ],
                dirtyNameMap: { test: { sheet1: '1' } },
                dirtyDefinedNameMap: { test: { sheet1: '1' } },
                dirtyUnitFeatureMap: { test: { sheet1: { featureA: true, featureB: false } } },
                dirtyUnitOtherFormulaMap: { test: { sheet1: { formulaA: true } } },
                clearDependencyTreeCache: { test: { sheet1: '1' } },
            },
            options: { onlyLocal: true },
        });

        testBed.executedDisposable.dispose();
        testBed.testBed.univer.dispose();
    });

    it('should stop and restart calculation through real notification flow', async () => {
        const testBed = createControllerTestBed();

        testBed.activeDirtyManagerService.register('formula.test-dirty-restart', {
            commandId: 'formula.test-dirty-restart',
            getDirtyData: () => ({
                dirtyRanges: [{ unitId: 'test', sheetId: 'sheet1', range: { startRow: 4, startColumn: 0, endRow: 4, endColumn: 1 } }],
            }),
        });

        testBed.executedCommands.length = 0;

        await testBed.commandService.executeCommand(SetFormulaCalculationNotificationMutation.id, {
            stageInfo: {
                totalFormulasToCalculate: 1,
                completedFormulasCount: 0,
                totalArrayFormulasToCalculate: 0,
                completedArrayFormulasCount: 0,
                formulaCycleIndex: 0,
                stage: FormulaExecuteStageType.CURRENTLY_CALCULATING,
            } as IExecutionInProgressParams,
        });
        await testBed.commandService.executeCommand('formula.test-dirty-restart');

        await vi.advanceTimersByTimeAsync(150);

        expect(testBed.executedCommands.findLast((command) => command.id === SetFormulaCalculationStopMutation.id)).toBeDefined();

        await testBed.commandService.executeCommand(SetFormulaCalculationNotificationMutation.id, {
            functionsExecutedState: FormulaExecutedStateType.STOP_EXECUTION,
        });

        await Promise.resolve();

        expect(testBed.executedCommands.findLast((command) => command.id === SetFormulaCalculationStartMutation.id)).toMatchObject({
            options: { onlyLocal: true },
            params: expect.objectContaining({
                dirtyRanges: [{ unitId: 'test', sheetId: 'sheet1', range: { startRow: 4, startColumn: 0, endRow: 4, endColumn: 1 } }],
            }),
        });

        testBed.executedDisposable.dispose();
        testBed.testBed.univer.dispose();
    });

    it('should publish progress updates through real notification commands', async () => {
        const testBed = createControllerTestBed();
        const progressValues: Array<{ done: number; count: number; label?: string }> = [];
        const subscription = testBed.controller.progress$.subscribe((value) => progressValues.push(value));

        await testBed.commandService.executeCommand(SetFormulaCalculationNotificationMutation.id, {
            stageInfo: {
                stage: FormulaExecuteStageType.START,
                totalFormulasToCalculate: 0,
                completedFormulasCount: 0,
                totalArrayFormulasToCalculate: 0,
                completedArrayFormulasCount: 0,
                formulaCycleIndex: 0,
            } as IExecutionInProgressParams,
        });
        vi.advanceTimersByTime(1000);

        await testBed.commandService.executeCommand(SetFormulaCalculationNotificationMutation.id, {
            stageInfo: {
                stage: FormulaExecuteStageType.CURRENTLY_CALCULATING,
                totalFormulasToCalculate: 5,
                completedFormulasCount: 2,
                totalArrayFormulasToCalculate: 3,
                completedArrayFormulasCount: 1,
                formulaCycleIndex: 0,
            } as IExecutionInProgressParams,
        });
        await testBed.commandService.executeCommand(SetFormulaCalculationNotificationMutation.id, {
            stageInfo: {
                stage: FormulaExecuteStageType.START_DEPENDENCY_ARRAY_FORMULA,
                totalFormulasToCalculate: 5,
                completedFormulasCount: 2,
                totalArrayFormulasToCalculate: 3,
                completedArrayFormulasCount: 1,
                formulaCycleIndex: 0,
            } as IExecutionInProgressParams,
        });
        await testBed.commandService.executeCommand(SetFormulaCalculationNotificationMutation.id, {
            stageInfo: {
                stage: FormulaExecuteStageType.CURRENTLY_CALCULATING_ARRAY_FORMULA,
                totalFormulasToCalculate: 5,
                completedFormulasCount: 4,
                totalArrayFormulasToCalculate: 3,
                completedArrayFormulasCount: 2,
                formulaCycleIndex: 0,
            } as IExecutionInProgressParams,
        });
        await testBed.commandService.executeCommand(SetFormulaCalculationNotificationMutation.id, {
            functionsExecutedState: FormulaExecutedStateType.SUCCESS,
        });

        expect(progressValues).toContainEqual({ done: 0, count: 1, label: 'formula.progress.analyzing' });
        expect(progressValues).toContainEqual({ done: 3, count: 8, label: 'formula.progress.calculating' });
        expect(progressValues).toContainEqual({ done: 3, count: 8, label: 'formula.progress.array-analysis' });
        expect(progressValues).toContainEqual({ done: 6, count: 8, label: 'formula.progress.array-calculation' });
        expect(progressValues).toContainEqual({ done: 1, count: 1, label: 'formula.progress.done' });

        subscription.unsubscribe();
        testBed.executedDisposable.dispose();
        testBed.testBed.univer.dispose();
    });
});
