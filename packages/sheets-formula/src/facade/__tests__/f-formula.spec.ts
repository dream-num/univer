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
import { ICommandService, IConfigService, LifecycleService, LifecycleStages } from '@univerjs/core';
import {
    ActiveDirtyManagerService,
    DescriptionService,
    FormulaCalculationSessionController,
    FormulaCalculationSessionService,
    FormulaExecutedStateType,
    FormulaExecuteStageType,
    IActiveDirtyManagerService,
    IDescriptionService,
    IFunctionService,
    IRegisterFunctionService,
    ISuperTableService,
    RegisterFunctionService,
    RegisterOtherFormulaService,
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationResultMutation,
    SetFormulaCalculationStartMutation,
    SetTriggerFormulaCalculationStartMutation,
    SuperTableService,
} from '@univerjs/engine-formula';
import { SetRangeValuesMutation } from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    SheetFormulaCalculationResultApplyController,
} from '../../controllers/sheet-formula-calculation-result-apply.controller';
import {
    CalculationMode,
    PLUGIN_CONFIG_KEY_BASE,
} from '../../index';
import { createFacadeTestBed } from './create-test-bed';
import '@univerjs/engine-formula/facade';
import '@univerjs/sheets/facade';
import '../../facade';

describe('sheets-formula facade mixins', () => {
    let get: Injector['get'];
    let univerAPI: FUniver;
    let commandService: ICommandService;
    let disposeUniver: () => void;

    beforeEach(() => {
        const testBed = createFacadeTestBed();
        testBed.injector.add([IDescriptionService, { useClass: DescriptionService }]);
        testBed.injector.add([ISuperTableService, { useClass: SuperTableService }]);
        testBed.injector.add([IRegisterFunctionService, { useClass: RegisterFunctionService }]);
        testBed.injector.add([IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }]);
        testBed.injector.add([RegisterOtherFormulaService]);
        testBed.injector.add([FormulaCalculationSessionService]);
        testBed.injector.add([FormulaCalculationSessionController]);
        testBed.injector.add([SheetFormulaCalculationResultApplyController]);
        testBed.injector.get(FormulaCalculationSessionService);
        testBed.injector.get(FormulaCalculationSessionController);
        testBed.injector.get(SheetFormulaCalculationResultApplyController);

        get = testBed.get;
        univerAPI = testBed.univerAPI;
        disposeUniver = () => testBed.univer.dispose();

        commandService = get(ICommandService);
        commandService.registerCommand(SetFormulaCalculationStartMutation);
        commandService.registerCommand(SetFormulaCalculationNotificationMutation);
        commandService.registerCommand(SetFormulaCalculationResultMutation);
        commandService.registerCommand(SetRangeValuesMutation);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        disposeUniver();
    });

    it('registers functions through FFormula and triggers a debounced recalculation command', async () => {
        vi.useFakeTimers();

        const functionService = get(IFunctionService);
        const executeCommandSpy = vi.spyOn(commandService, 'executeCommand').mockResolvedValue(true);

        const formula = univerAPI.getFormula();
        const formulaDisposable = formula.registerFunction('FORMULA_SIDE', (value) => Number(value) + 1, 'Registered from FFormula');
        const asyncDisposable = formula.registerAsyncFunction('FORMULA_ASYNC', async () => 2, 'Async formula');

        await vi.advanceTimersByTimeAsync(11);

        expect(get(IRegisterFunctionService)).toBeDefined();
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

        formulaDisposable.dispose();
        asyncDisposable.dispose();

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

        const formula = univerAPI.getFormula();
        const resultPayload = {
            unitData: {
                test: {
                    sheet1: {
                        0: {
                            0: { v: 1 },
                        },
                    },
                },
            },
            unitOtherData: {},
        };

        await new Promise<void>((resolve) => {
            const disposable = formula.calculationResultApplied((result) => {
                expect(result).toEqual(resultPayload);
                disposable.dispose();
                resolve();
            });

            commandService.executeCommand(SetFormulaCalculationResultMutation.id, resultPayload);
            commandService.executeCommand(
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

    it('fires calculationResultApplied when range update is observed before the result mutation', async () => {
        vi.stubGlobal('requestIdleCallback', ((callback: IdleRequestCallback) => {
            callback({ didTimeout: false, timeRemaining: () => 16 } as IdleDeadline);
            return 1;
        }) as typeof requestIdleCallback);

        const formula = univerAPI.getFormula();
        const resultPayload = {
            unitData: {
                unit1: {
                    sheet1: {
                        0: {
                            0: { v: 1 },
                        },
                    },
                },
            },
            unitOtherData: {},
        };

        await new Promise<void>((resolve) => {
            const disposable = formula.calculationResultApplied((result) => {
                expect(result).toEqual(resultPayload);
                disposable.dispose();
                resolve();
            });

            commandService.executeCommand(
                SetRangeValuesMutation.id,
                {
                    unitId: 'unit1',
                    subUnitId: 'sheet1',
                    cellValue: {},
                },
                {
                    applyFormulaCalculationResult: true,
                }
            );
            commandService.executeCommand(SetFormulaCalculationResultMutation.id, resultPayload);
        });
    });

    it('fires calculationResultApplied once for repeated range apply notifications', async () => {
        vi.stubGlobal('requestIdleCallback', ((callback: IdleRequestCallback) => {
            callback({ didTimeout: false, timeRemaining: () => 16 } as IdleDeadline);
            return 1;
        }) as typeof requestIdleCallback);

        const formula = univerAPI.getFormula();
        const resultPayload = {
            unitData: {
                unit1: {
                    sheet1: {
                        0: {
                            0: { v: 1 },
                        },
                    },
                },
            },
            unitOtherData: {},
        };
        const callback = vi.fn();
        const disposable = formula.calculationResultApplied(callback);

        await commandService.executeCommand(SetFormulaCalculationResultMutation.id, resultPayload);
        await commandService.executeCommand(
            SetRangeValuesMutation.id,
            {
                unitId: 'unit1',
                subUnitId: 'sheet1',
                cellValue: {},
            },
            {
                applyFormulaCalculationResult: true,
            }
        );
        await commandService.executeCommand(
            SetRangeValuesMutation.id,
            {
                unitId: 'unit1',
                subUnitId: 'sheet1',
                cellValue: {},
            },
            {
                applyFormulaCalculationResult: true,
            }
        );

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(resultPayload);

        disposable.dispose();
    });

    it('resolves onCalculationResultApplied when no calculation actually starts', async () => {
        vi.useFakeTimers();

        const formula = univerAPI.getFormula();
        const waitForResult = formula.onCalculationResultApplied();

        await vi.advanceTimersByTimeAsync(500);

        await expect(waitForResult).resolves.toBeUndefined();
    });

    it('resolves onCalculationResultApplied for other-formula-only results without range value application', async () => {
        vi.useFakeTimers();
        vi.stubGlobal('requestIdleCallback', ((callback: IdleRequestCallback) => {
            callback({ didTimeout: false, timeRemaining: () => 16 } as IdleDeadline);
            return 1;
        }) as typeof requestIdleCallback);

        const formula = univerAPI.getFormula();
        const waitForResult = formula.onCalculationResultApplied();

        await commandService.executeCommand(SetFormulaCalculationStartMutation.id, {}, { onlyLocal: true });
        await commandService.executeCommand(SetFormulaCalculationNotificationMutation.id, {
            stageInfo: {
                stage: FormulaExecuteStageType.START_CALCULATION,
                completedFormulasCount: 0,
                completedArrayFormulasCount: 0,
                formulaCycleIndex: 0,
                totalArrayFormulasToCalculate: 0,
                totalFormulasToCalculate: 1,
            },
        });

        await commandService.executeCommand(SetFormulaCalculationResultMutation.id, {
            unitData: {},
            unitOtherData: {
                unit1: {
                    sheet1: {
                        'formula.cf-1': {
                            0: {
                                0: { v: true },
                            },
                        },
                    },
                },
            },
        });

        await expect(waitForResult).resolves.toBeUndefined();
    });

    it('resolves onCalculationResultApplied after the latest restarted calculation is applied', async () => {
        vi.useFakeTimers();

        const formula = univerAPI.getFormula();
        const waitForResult = formula.onCalculationResultApplied();
        let resolved = false;
        waitForResult.then(() => {
            resolved = true;
        });

        await commandService.executeCommand(SetFormulaCalculationStartMutation.id, {}, { onlyLocal: true });
        await commandService.executeCommand(SetFormulaCalculationNotificationMutation.id, {
            stageInfo: {
                stage: FormulaExecuteStageType.CURRENTLY_CALCULATING,
                completedFormulasCount: 0,
                completedArrayFormulasCount: 0,
                formulaCycleIndex: 0,
                totalArrayFormulasToCalculate: 0,
                totalFormulasToCalculate: 1,
            },
        });
        await commandService.executeCommand(SetFormulaCalculationNotificationMutation.id, {
            functionsExecutedState: FormulaExecutedStateType.STOP_EXECUTION,
        });

        await Promise.resolve();
        expect(resolved).toBe(false);

        await commandService.executeCommand(SetFormulaCalculationStartMutation.id, {}, { onlyLocal: true });
        await commandService.executeCommand(SetFormulaCalculationResultMutation.id, {
            unitData: {
                test: {
                    sheet1: {
                        0: {
                            0: { v: 1 },
                        },
                    },
                },
            },
            unitOtherData: {},
        });

        await Promise.resolve();
        expect(resolved).toBe(false);

        await commandService.executeCommand(
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

        await expect(waitForResult).resolves.toBeUndefined();
    });

    it('does not wait for a sheet application when the result targets an unknown unit', async () => {
        await commandService.executeCommand(SetFormulaCalculationStartMutation.id, {}, { onlyLocal: true });
        const waitForResult = univerAPI.getFormula().onCalculationResultApplied();

        await commandService.executeCommand(SetFormulaCalculationResultMutation.id, {
            unitData: {
                'unknown-unit': {
                    sheet1: {
                        0: {
                            0: { v: 1 },
                        },
                    },
                },
            },
            unitOtherData: {},
        });

        await expect(waitForResult).resolves.toBeUndefined();
    });

    it('reads each of ten consecutive sheet results after its own application finishes', async () => {
        vi.stubGlobal('requestIdleCallback', ((callback: IdleRequestCallback) => {
            callback({ didTimeout: false, timeRemaining: () => 16 } as IdleDeadline);
            return 1;
        }) as typeof requestIdleCallback);

        const formula = univerAPI.getFormula();
        const workbook = univerAPI.getActiveWorkbook();
        if (!workbook) {
            throw new Error('Expected an active workbook in the facade test bed.');
        }
        const range = workbook.getActiveSheet().getRange('A1');
        const expectedValues = [10, 3, 77, -5, 1000, 0, 42, 8.5, 999, -1200];
        const actualValues: unknown[] = [];

        for (const value of expectedValues) {
            const resultApplied = formula.onCalculationResultApplied(1_000);
            const resultPayload = {
                unitData: {
                    test: {
                        sheet1: {
                            0: {
                                0: { v: value },
                            },
                        },
                    },
                },
                unitOtherData: {},
            };

            await commandService.executeCommand(SetFormulaCalculationStartMutation.id, {}, { onlyLocal: true });
            await commandService.executeCommand(SetFormulaCalculationResultMutation.id, resultPayload);
            await commandService.executeCommand(
                SetRangeValuesMutation.id,
                {
                    unitId: 'test',
                    subUnitId: 'sheet1',
                    cellValue: { 0: { 0: { v: value } } },
                },
                {
                    applyFormulaCalculationResult: true,
                }
            );
            await resultApplied;
            actualValues.push(range.getValue());
        }

        expect(actualValues).toEqual(expectedValues);
    });

    it('rejects onCalculationResultApplied when an explicit timeout is exceeded', async () => {
        vi.useFakeTimers();

        const formula = univerAPI.getFormula();
        const waitForResult = expect(formula.onCalculationResultApplied(1000)).rejects.toThrowError('Calculation end timeout');

        await commandService.executeCommand(SetFormulaCalculationStartMutation.id, {}, { onlyLocal: true });
        await commandService.executeCommand(SetFormulaCalculationNotificationMutation.id, {
            stageInfo: {
                stage: FormulaExecuteStageType.START_CALCULATION,
                completedFormulasCount: 0,
                completedArrayFormulasCount: 0,
                formulaCycleIndex: 0,
                totalArrayFormulasToCalculate: 1,
                totalFormulasToCalculate: 1,
            },
        });

        await vi.advanceTimersByTimeAsync(1000);

        await waitForResult;
    });
});
