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

import type { IMutationInfo } from '@univerjs/core';
import type { ISetRangeValuesMutationParams } from '../../commands/mutations/set-range-values.mutation';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SheetLazyExecuteScheduleService } from '../lazy-execute-schedule.service';

function createMutation(unitId: string, subUnitId: string): IMutationInfo<ISetRangeValuesMutationParams> {
    return {
        id: 'sheet.mutation.set-range-values',
        params: {
            unitId,
            subUnitId,
            cellValue: {
                0: { 0: { v: 1 } },
            },
        },
    };
}

describe('SheetLazyExecuteScheduleService', () => {
    let commandService: {
        syncExecuteCommand: ReturnType<typeof vi.fn>;
    };

    let getSheetBySheetId: ReturnType<typeof vi.fn>;

    let instanceService: {
        getUnit: ReturnType<typeof vi.fn>;
    };

    let service: SheetLazyExecuteScheduleService;

    beforeEach(() => {
        commandService = {
            syncExecuteCommand: vi.fn(),
        };

        getSheetBySheetId = vi.fn(() => ({}));
        instanceService = {
            getUnit: vi.fn(() => ({
                getSheetBySheetId,
            })),
        };

        vi.stubGlobal('requestIdleCallback', vi.fn(() => 1));
        vi.stubGlobal('cancelIdleCallback', vi.fn());

        service = new SheetLazyExecuteScheduleService(commandService as never, instanceService as never);
    });

    afterEach(() => {
        service.dispose();
        vi.unstubAllGlobals();
    });

    it('tracks pending tasks and can cancel scheduled mutations', () => {
        expect(service.hasPendingTasks()).toBe(false);
        expect(service.getPendingMutationsCount()).toBe(0);

        service.scheduleMutations('unit-1', 'sheet-1', []);
        expect(service.hasPendingTasks()).toBe(false);

        const mutations = [createMutation('unit-1', 'sheet-1'), createMutation('unit-1', 'sheet-1')];
        service.scheduleMutations('unit-1', 'sheet-1', mutations);
        expect(service.hasPendingTasks()).toBe(true);
        expect(service.getPendingMutationsCount()).toBe(2);

        service.cancelScheduledMutations('unit-1', 'sheet-1');
        expect(service.hasPendingTasks()).toBe(false);
        expect((globalThis as unknown as { cancelIdleCallback: ReturnType<typeof vi.fn> }).cancelIdleCallback).toHaveBeenCalled();
    });

    it('executes scheduled mutations in idle time and marks them onlyLocal', () => {
        service.scheduleMutations('unit-1', 'sheet-1', [
            createMutation('unit-1', 'sheet-1'),
            createMutation('unit-1', 'sheet-1'),
        ]);

        (
            service as unknown as {
                _processIdleTasks: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void;
            }
        )._processIdleTasks({
            didTimeout: true,
            timeRemaining: () => 0,
        });

        expect(commandService.syncExecuteCommand).toHaveBeenCalledTimes(2);
        expect(commandService.syncExecuteCommand).toHaveBeenNthCalledWith(
            1,
            'sheet.mutation.set-range-values',
            expect.any(Object),
            { onlyLocal: true }
        );
        expect(service.hasPendingTasks()).toBe(false);
    });

    it('drops task when target sheet no longer exists', () => {
        getSheetBySheetId.mockReturnValue(null);
        service.scheduleMutations('unit-1', 'sheet-1', [createMutation('unit-1', 'sheet-1')]);

        (
            service as unknown as {
                _processIdleTasks: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void;
            }
        )._processIdleTasks({
            didTimeout: true,
            timeRemaining: () => 10,
        });

        expect(commandService.syncExecuteCommand).not.toHaveBeenCalled();
        expect(service.hasPendingTasks()).toBe(false);
    });

    it('beforeunload handler blocks navigation when tasks are pending', () => {
        const beforeUnloadHandler = (
            service as unknown as { _beforeUnloadHandler: ((event: { preventDefault: () => void; returnValue: string }) => unknown) | null }
        )._beforeUnloadHandler;
        expect(beforeUnloadHandler).toBeTruthy();

        const event = {
            preventDefault: vi.fn(),
            returnValue: '',
        };

        beforeUnloadHandler!(event);
        expect(event.preventDefault).not.toHaveBeenCalled();

        service.scheduleMutations('unit-1', 'sheet-1', [createMutation('unit-1', 'sheet-1')]);
        beforeUnloadHandler!(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.returnValue).toBe('');

        service.dispose();
        expect(service.hasPendingTasks()).toBe(false);
    });
});
