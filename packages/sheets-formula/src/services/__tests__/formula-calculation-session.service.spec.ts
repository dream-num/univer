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

import type { ISetFormulaCalculationResultMutation } from '@univerjs/engine-formula';
import { Injector } from '@univerjs/core';
import { FormulaExecutedStateType, FormulaExecuteStageType } from '@univerjs/engine-formula';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormulaCalculationSessionService } from '../formula-calculation-session.service';

function createService(): FormulaCalculationSessionService {
    const injector = new Injector();
    injector.add([FormulaCalculationSessionService]);
    return injector.get(FormulaCalculationSessionService);
}

describe('FormulaCalculationSessionService', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('waits for the latest restarted session to be applied', async () => {
        vi.useFakeTimers();

        const service = createService();
        service.initialize();
        const waitForApplied = service.waitForLatestApplied();
        let resolved = false;
        waitForApplied.then(() => {
            resolved = true;
        });

        service.start();
        service.updateProgress({
            stage: FormulaExecuteStageType.CURRENTLY_CALCULATING,
            totalFormulasToCalculate: 1,
            completedFormulasCount: 0,
            totalArrayFormulasToCalculate: 0,
            completedArrayFormulasCount: 0,
            formulaCycleIndex: 0,
        });
        service.markStopped();

        await Promise.resolve();

        service.start();
        service.updateProgress({
            stage: FormulaExecuteStageType.CURRENTLY_CALCULATING,
            totalFormulasToCalculate: 1,
            completedFormulasCount: 0,
            totalArrayFormulasToCalculate: 0,
            completedArrayFormulasCount: 0,
            formulaCycleIndex: 0,
        });

        await Promise.resolve();

        expect(resolved).toBe(false);

        service.markResultEmitted({ unitData: {}, unitOtherData: {} }, true);
        await Promise.resolve();
        expect(resolved).toBe(false);

        service.markResultApplied();
        await expect(waitForApplied).resolves.toBeUndefined();
    });

    it('stores lifecycle flags and progress for the active session', () => {
        const service = createService();
        service.initialize();

        service.start();
        const progress = {
            stage: FormulaExecuteStageType.START_CALCULATION,
            totalFormulasToCalculate: 2,
            completedFormulasCount: 0,
            totalArrayFormulasToCalculate: 0,
            completedArrayFormulasCount: 0,
            formulaCycleIndex: 0,
        };

        service.updateProgress(progress);
        expect(service.state).toMatchObject({
            started: true,
            progress,
            stopped: false,
            completed: false,
            resultApplied: false,
        });

        service.markCompleted(FormulaExecutedStateType.SUCCESS);
        expect(service.state).toMatchObject({
            completed: true,
            stopped: false,
            resultApplied: false,
        });
    });

    it('does not resolve from an already applied previous session when a new session starts', async () => {
        vi.useFakeTimers();

        const service = createService();
        service.initialize();
        service.start();
        service.markResultEmitted({ unitData: {}, unitOtherData: {} }, false);

        await Promise.resolve();

        const waitForApplied = service.waitForLatestApplied();
        let resolved = false;
        waitForApplied.then(() => {
            resolved = true;
        });

        await Promise.resolve();
        expect(resolved).toBe(false);

        service.start();
        service.markResultEmitted({ unitData: {}, unitOtherData: {} }, true);
        await Promise.resolve();
        expect(resolved).toBe(false);

        service.markResultApplied();
        await expect(waitForApplied).resolves.toBeUndefined();
    });

    it('emits result applied when value application is observed', async () => {
        const service = createService();
        service.initialize();
        const result = {
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
        const appliedResults: unknown[] = [];
        const subscription = service.resultApplied$.subscribe((value) => appliedResults.push(value));

        service.start();
        service.markResultEmitted(result, true);
        expect(appliedResults).toEqual([]);

        service.markResultApplied();
        expect(appliedResults).toEqual([result]);

        subscription.unsubscribe();
    });

    it('emits result applied only once for repeated value application notifications', () => {
        const service = createService();
        service.initialize();
        const result = {
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
        const appliedResults: unknown[] = [];
        const subscription = service.resultApplied$.subscribe((value) => appliedResults.push(value));

        service.start();
        service.markResultEmitted(result, true);
        service.markResultApplied();
        service.markResultApplied();

        expect(appliedResults).toEqual([result]);

        subscription.unsubscribe();
    });

    it('emits result applied once when result arrives after an application notification', () => {
        const service = createService();
        service.initialize();
        const result = {
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
        const appliedResults: unknown[] = [];
        const subscription = service.resultApplied$.subscribe((value) => appliedResults.push(value));

        service.start();
        service.markResultApplied();
        service.markResultEmitted(result, true);
        service.markResultApplied();

        expect(appliedResults).toEqual([result]);

        subscription.unsubscribe();
    });

    it('emits result applied immediately when there is no sheet value to apply', () => {
        const service = createService();
        service.initialize();
        const result: ISetFormulaCalculationResultMutation = {
            unitData: {},
            unitOtherData: {},
        };
        const appliedResults: unknown[] = [];
        const subscription = service.resultApplied$.subscribe((value) => appliedResults.push(value));

        service.start();
        service.markResultEmitted(result, false);

        expect(appliedResults).toEqual([result]);

        subscription.unsubscribe();
    });

    it('does not start the no-calculation watchdog until the session controller is initialized', async () => {
        vi.useFakeTimers();

        const service = createService();
        const waitForApplied = service.waitForLatestApplied();
        let resolved = false;
        waitForApplied.then(() => {
            resolved = true;
        });

        await vi.advanceTimersByTimeAsync(500);
        await Promise.resolve();
        expect(resolved).toBe(false);

        service.initialize();
        await vi.advanceTimersByTimeAsync(499);
        await Promise.resolve();
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(1);
        await expect(waitForApplied).resolves.toBeUndefined();
    });

    it('does not reject long-running calculations unless a timeout is provided', async () => {
        vi.useFakeTimers();

        const service = createService();
        service.initialize();
        service.start();

        const waitForApplied = service.waitForLatestApplied();
        let settled = false;
        waitForApplied.then(() => {
            settled = true;
        });

        await vi.advanceTimersByTimeAsync(60_000);
        await Promise.resolve();

        expect(settled).toBe(false);

        service.markResultEmitted({ unitData: {}, unitOtherData: {} }, false);

        await expect(waitForApplied).resolves.toBeUndefined();
    });

    it('rejects long-running calculations when a timeout is provided', async () => {
        vi.useFakeTimers();

        const service = createService();
        service.initialize();
        service.start();

        const waitForApplied = expect(service.waitForLatestApplied(1000)).rejects.toThrow('Calculation end timeout');

        await vi.advanceTimersByTimeAsync(1000);

        await waitForApplied;
    });
});
