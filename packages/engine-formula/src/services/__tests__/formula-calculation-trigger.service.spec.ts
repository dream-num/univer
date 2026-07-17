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

import type { ICommandInfo, ICommandService, IExecutionOptions } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    SetFormulaCalculationNotificationMutation,
    SetFormulaCalculationStartMutation,
    SetFormulaCalculationStopMutation,
    SetTriggerFormulaCalculationStartMutation,
} from '../../commands/mutations/set-formula-calculation.mutation';
import { FormulaCalculationTriggerService } from '../formula-calculation-trigger.service';
import { FormulaExecutedStateType } from '../runtime.service';

function createTestBed(start = true) {
    let listener: ((command: ICommandInfo, options?: IExecutionOptions) => void) | undefined;
    const executed: Array<{ id: string; params: unknown; options: unknown }> = [];
    const conversions = new Map<string, { commandId: string; shouldTrigger?: () => boolean; getDirtyData: (command: ICommandInfo) => object }>();
    const commandService = {
        onCommandExecuted: vi.fn((callback: typeof listener) => {
            listener = callback;
            return { dispose: vi.fn() };
        }),
        executeCommand: vi.fn(async (id: string, params: unknown, options?: IExecutionOptions) => {
            executed.push({ id, params, options });
            listener?.({ id, params } as ICommandInfo, options);
            return true;
        }),
    } as unknown as ICommandService;
    const activeDirtyManagerService = {
        get: (id: string) => conversions.get(id),
    };
    const service = new FormulaCalculationTriggerService(commandService, activeDirtyManagerService as never);
    if (start) {
        service.start();
    }

    return {
        service,
        executed,
        conversions,
        emit: (command: ICommandInfo, options?: IExecutionOptions) => listener?.(command, options),
    };
}

describe('FormulaCalculationTriggerService', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('collects changeset dirty data before start and merges it with the initial trigger', async () => {
        const testBed = createTestBed(false);
        testBed.conversions.set('sheet-dirty', {
            commandId: 'sheet-dirty',
            getDirtyData: () => ({
                dirtyRanges: [{ unitId: 'sheet-unit', sheetId: 'sheet-1', range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 } }],
            }),
        });
        testBed.conversions.set(SetTriggerFormulaCalculationStartMutation.id, {
            commandId: SetTriggerFormulaCalculationStartMutation.id,
            getDirtyData: () => ({ forceCalculation: true }),
        });

        testBed.emit({ id: 'sheet-dirty' } as ICommandInfo, { fromChangeset: true });
        await vi.advanceTimersByTimeAsync(10);
        expect(testBed.executed).toEqual([]);

        testBed.service.start();
        testBed.emit({ id: SetTriggerFormulaCalculationStartMutation.id } as ICommandInfo);
        await vi.advanceTimersByTimeAsync(10);

        expect(testBed.executed).toHaveLength(1);
        expect(testBed.executed[0]).toMatchObject({
            id: SetFormulaCalculationStartMutation.id,
            params: {
                forceCalculation: true,
                dirtyRanges: [{ unitId: 'sheet-unit', sheetId: 'sheet-1' }],
            },
        });
        testBed.service.dispose();
    });

    it('merges dirty data from different unit types into one calculation', async () => {
        const testBed = createTestBed();
        testBed.conversions.set('sheet-dirty', {
            commandId: 'sheet-dirty',
            getDirtyData: () => ({
                dirtyRanges: [{ unitId: 'sheet-unit', sheetId: 'sheet-1', range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 } }],
            }),
        });
        testBed.conversions.set('base-dirty', {
            commandId: 'base-dirty',
            getDirtyData: () => ({
                dirtyRanges: [{ unitId: 'base-unit', sheetId: 'table-1', range: { startRow: 1, startColumn: 2, endRow: 1, endColumn: 2 } }],
            }),
        });

        testBed.emit({ id: 'sheet-dirty' } as ICommandInfo);
        testBed.emit({ id: 'base-dirty' } as ICommandInfo);
        await vi.advanceTimersByTimeAsync(10);

        expect(testBed.executed).toHaveLength(1);
        expect(testBed.executed[0]).toMatchObject({
            id: SetFormulaCalculationStartMutation.id,
            options: { onlyLocal: true },
            params: {
                dirtyRanges: [
                    { unitId: 'sheet-unit', sheetId: 'sheet-1' },
                    { unitId: 'base-unit', sheetId: 'table-1' },
                ],
            },
        });
        testBed.service.dispose();
    });

    it('stops once and requeues running dirty data when ranges intersect', async () => {
        const testBed = createTestBed();
        testBed.conversions.set('initial-dirty', {
            commandId: 'initial-dirty',
            getDirtyData: () => ({
                dirtyRanges: [{ unitId: 'unit', sheetId: 'sheet', range: { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 } }],
            }),
        });
        testBed.conversions.set('overlapping-dirty', {
            commandId: 'overlapping-dirty',
            getDirtyData: () => ({
                dirtyRanges: [{ unitId: 'unit', sheetId: 'sheet', range: { startRow: 1, startColumn: 1, endRow: 2, endColumn: 2 } }],
            }),
        });

        testBed.emit({ id: 'initial-dirty' } as ICommandInfo);
        await vi.advanceTimersByTimeAsync(10);
        testBed.executed.length = 0;

        testBed.emit({ id: 'overlapping-dirty' } as ICommandInfo);
        await vi.advanceTimersByTimeAsync(10);

        expect(testBed.executed[0]).toMatchObject({ id: SetFormulaCalculationStopMutation.id });

        testBed.emit({ id: 'overlapping-dirty' } as ICommandInfo);
        await vi.advanceTimersByTimeAsync(10);
        expect(testBed.executed).toHaveLength(1);

        testBed.emit({
            id: SetFormulaCalculationNotificationMutation.id,
            params: { functionsExecutedState: FormulaExecutedStateType.STOP_EXECUTION },
        } as ICommandInfo);

        expect(testBed.executed).toHaveLength(1);
        await vi.advanceTimersByTimeAsync(10);
        expect(testBed.executed[1]).toMatchObject({
            id: SetFormulaCalculationStartMutation.id,
            params: {
                dirtyRanges: [
                    { unitId: 'unit', sheetId: 'sheet', range: { startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 } },
                    { unitId: 'unit', sheetId: 'sheet', range: { startRow: 1, startColumn: 1, endRow: 2, endColumn: 2 } },
                ],
            },
        });
        testBed.service.dispose();
    });

    it('waits for success when dirty data does not intersect and only starts pending data', async () => {
        const testBed = createTestBed();
        testBed.conversions.set('initial-dirty', {
            commandId: 'initial-dirty',
            getDirtyData: () => ({
                dirtyRanges: [{ unitId: 'unit', sheetId: 'sheet', range: { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 } }],
            }),
        });
        testBed.conversions.set('non-overlapping-dirty', {
            commandId: 'non-overlapping-dirty',
            getDirtyData: () => ({
                dirtyRanges: [{ unitId: 'unit', sheetId: 'sheet', range: { startRow: 10, startColumn: 10, endRow: 10, endColumn: 10 } }],
            }),
        });

        testBed.emit({ id: 'initial-dirty' } as ICommandInfo);
        await vi.advanceTimersByTimeAsync(10);
        testBed.executed.length = 0;

        testBed.emit({ id: 'non-overlapping-dirty' } as ICommandInfo);
        await vi.advanceTimersByTimeAsync(10);

        expect(testBed.executed).toEqual([]);

        testBed.emit({
            id: SetFormulaCalculationNotificationMutation.id,
            params: { functionsExecutedState: FormulaExecutedStateType.SUCCESS },
        } as ICommandInfo);

        expect(testBed.executed).toEqual([]);
        await vi.advanceTimersByTimeAsync(10);
        expect(testBed.executed[0]).toMatchObject({
            id: SetFormulaCalculationStartMutation.id,
            params: {
                dirtyRanges: [{ unitId: 'unit', sheetId: 'sheet', range: { startRow: 10, startColumn: 10, endRow: 10, endColumn: 10 } }],
            },
        });
        testBed.service.dispose();
    });

    it('honors conversion trigger predicates before scheduling', async () => {
        const testBed = createTestBed();
        testBed.conversions.set('local-result', {
            commandId: 'local-result',
            shouldTrigger: () => false,
            getDirtyData: () => ({ forceCalculation: true }),
        });

        testBed.emit({ id: 'local-result' } as ICommandInfo);
        await vi.advanceTimersByTimeAsync(10);

        expect(testBed.executed).toEqual([]);
        testBed.service.dispose();
    });

    it('only runs empty dirty data for an explicit trigger', async () => {
        const testBed = createTestBed();
        testBed.conversions.set('empty-dirty', {
            commandId: 'empty-dirty',
            getDirtyData: () => ({}),
        });
        testBed.conversions.set(SetTriggerFormulaCalculationStartMutation.id, {
            commandId: SetTriggerFormulaCalculationStartMutation.id,
            getDirtyData: () => ({}),
        });

        testBed.emit({ id: 'empty-dirty' } as ICommandInfo);
        await vi.advanceTimersByTimeAsync(10);
        expect(testBed.executed).toEqual([]);

        testBed.emit({ id: SetTriggerFormulaCalculationStartMutation.id } as ICommandInfo);
        await vi.advanceTimersByTimeAsync(10);

        expect(testBed.executed).toHaveLength(1);
        expect(testBed.executed[0]).toMatchObject({ id: SetFormulaCalculationStartMutation.id });
        testBed.service.dispose();
    });
});
