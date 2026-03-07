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

import type { Injector } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import { CommandType, ICommandService, IConfigService, LifecycleService, LifecycleStages } from '@univerjs/core';
import { FormulaExecuteStageType, IFunctionService, ISuperTableService, SetFormulaCalculationResultMutation, SetTriggerFormulaCalculationStartMutation, SuperTableService } from '@univerjs/engine-formula';
import { SetRangeValuesMutation } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CalculationMode, DescriptionService, IDescriptionService, IRegisterFunctionService, PLUGIN_CONFIG_KEY_BASE, RegisterFunctionService } from '../../index';
import { createFacadeTestBed } from './create-test-bed';

import '@univerjs/engine-formula/facade';
import '@univerjs/sheets/facade';
import '../../facade';

describe('sheets-formula facade mixins', () => {
    let get: Injector['get'];
    let univerAPI: FUniver;
    let disposeUniver: () => void;

    beforeEach(() => {
        const testBed = createFacadeTestBed();
        testBed.injector.add([IDescriptionService, { useClass: DescriptionService }]);
        testBed.injector.add([ISuperTableService, { useClass: SuperTableService }]);
        testBed.injector.add([IRegisterFunctionService, { useClass: RegisterFunctionService }]);

        get = testBed.get;
        univerAPI = testBed.univerAPI;
        disposeUniver = () => testBed.univer.dispose();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        disposeUniver();
    });

    it('registers functions through FUniver and FFormula and triggers a debounced recalculation command', async () => {
        vi.useFakeTimers();

        const commandService = get(ICommandService);
        const functionService = get(IFunctionService);
        const executeCommandSpy = vi.spyOn(commandService, 'executeCommand').mockResolvedValue(true);

        const univerDisposable = univerAPI.registerFunction({
            calculate: [
                [() => 1, 'UNIVER_SIDE', 'Registered from FUniver'],
            ],
        });

        const formula = univerAPI.getFormula();
        const formulaDisposable = formula.registerFunction('FORMULA_SIDE', (value) => Number(value) + 1, 'Registered from FFormula');
        const asyncDisposable = formula.registerAsyncFunction('FORMULA_ASYNC', async () => 2, 'Async formula');

        await vi.advanceTimersByTimeAsync(11);

        expect(get(IRegisterFunctionService)).toBeDefined();
        expect(functionService.hasExecutor('UNIVER_SIDE')).toBe(true);
        expect(functionService.hasExecutor('FORMULA_SIDE')).toBe(true);
        expect(functionService.hasExecutor('FORMULA_ASYNC')).toBe(true);
        expect(executeCommandSpy).toHaveBeenCalledWith(
            SetTriggerFormulaCalculationStartMutation.id,
            {
                commands: [],
                forceCalculation: true,
            },
            {
                onlyLocal: true,
            }
        );

        univerDisposable.dispose();
        formulaDisposable.dispose();
        asyncDisposable.dispose();

        expect(functionService.hasExecutor('UNIVER_SIDE')).toBe(false);
        expect(functionService.hasExecutor('FORMULA_SIDE')).toBe(false);
        expect(functionService.hasExecutor('FORMULA_ASYNC')).toBe(false);
    });

    it('updates initial calculation mode and warns after the Starting lifecycle', () => {
        const formula = univerAPI.getFormula();
        const configService = get(IConfigService);
        const lifecycleService = get(LifecycleService);

        formula.setInitialFormulaComputing(CalculationMode.FORCED);
        expect(configService.getConfig(PLUGIN_CONFIG_KEY_BASE)).toMatchObject({
            initialFormulaComputing: CalculationMode.FORCED,
        });

        lifecycleService.stage = LifecycleStages.Ready;

        expect(() => formula.setInitialFormulaComputing(CalculationMode.NO_CALCULATION)).not.toThrow();
        formula.setInitialFormulaComputing(CalculationMode.NO_CALCULATION);

        expect(configService.getConfig(PLUGIN_CONFIG_KEY_BASE)).toMatchObject({
            initialFormulaComputing: CalculationMode.NO_CALCULATION,
        });
    });

    it('fires calculationResultApplied only after result mutation and applied range update are both observed', async () => {
        vi.stubGlobal('requestIdleCallback', ((callback: IdleRequestCallback) => {
            callback({ didTimeout: false, timeRemaining: () => 16 } as IdleDeadline);
            return 1;
        }) as typeof requestIdleCallback);

        const commandService = get(ICommandService);
        commandService.registerCommand(SetFormulaCalculationResultMutation);
        commandService.registerCommand(SetRangeValuesMutation);

        const formula = univerAPI.getFormula();
        const resultPayload = {
            unitData: {},
        };

        await new Promise<void>((resolve) => {
            const disposable = formula.calculationResultApplied((result) => {
                expect(result).toEqual(resultPayload);
                disposable.dispose();
                resolve();
            });

            void commandService.executeCommand(SetFormulaCalculationResultMutation.id, resultPayload);
            void commandService.executeCommand(
                SetRangeValuesMutation.id,
                {
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    cellValue: {},
                },
                {
                    applyFormulaCalculationResult: true,
                }
            );
        });
    });

    it('resolves onCalculationResultApplied when no calculation actually starts', async () => {
        vi.useFakeTimers();

        const formula = univerAPI.getFormula();
        const waitForResult = formula.onCalculationResultApplied();

        await vi.advanceTimersByTimeAsync(500);

        await expect(waitForResult).resolves.toBeUndefined();
    });

    it('rejects onCalculationResultApplied when the wait exceeds the global timeout', async () => {
        vi.useFakeTimers();

        const commandService = get(ICommandService);
        commandService.registerCommand({
            id: SetFormulaCalculationResultMutation.id,
            type: CommandType.MUTATION,
            handler: () => true,
        });

        const formula = univerAPI.getFormula();
        vi.spyOn(formula, 'calculationProcessing').mockImplementation((callback) => {
            callback({
                stage: FormulaExecuteStageType.START_CALCULATION,
                completedFormulasCount: 0,
                completedArrayFormulasCount: 0,
                formulaCycleIndex: 0,
                totalArrayFormulasToCalculate: 1,
                totalFormulasToCalculate: 1,
            });

            return { dispose: () => {} };
        });
        vi.spyOn(formula, 'calculationResultApplied').mockReturnValue({ dispose: () => {} });

        const waitForResult = expect(formula.onCalculationResultApplied()).rejects.toThrowError('Calculation end timeout');

        await vi.advanceTimersByTimeAsync(60_000);

        await waitForResult;
    });
});
