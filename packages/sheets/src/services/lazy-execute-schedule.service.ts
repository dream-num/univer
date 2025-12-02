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

import type { IMutationInfo, Workbook } from '@univerjs/core';
import type { ISetRangeValuesMutationParams } from '../commands/mutations/set-range-values.mutation';
import { Disposable, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';

interface IScheduledTask {
    unitId: string;
    subUnitId: string;
    mutations: IMutationInfo<ISetRangeValuesMutationParams>[];
    currentIndex: number;
}

/**
 * Service to schedule and execute remaining SetRangeValuesMutation tasks
 * during browser idle time after a sheet copy operation.
 *
 * This improves user experience by:
 * 1. Immediately showing the copied sheet with first chunk of data
 * 2. Filling remaining data in background during idle time
 * 3. Automatically canceling tasks if the sheet is deleted
 * 4. Warning user if they try to close while tasks are pending
 */
export class SheetLazyExecuteScheduleService extends Disposable {
    private _tasks: Map<string, IScheduledTask> = new Map();
    private _idleCallbackId: number | null = null;
    private _beforeUnloadHandler: ((e: BeforeUnloadEvent) => void) | null = null;

    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._setupBeforeUnloadListener();

        this.disposeWithMe(() => {
            this._cancelAllTasks();
            this._removeBeforeUnloadListener();
        });
    }

    /**
     * Check if there are any pending tasks
     */
    hasPendingTasks(): boolean {
        return this._tasks.size > 0;
    }

    /**
     * Get the count of pending mutations across all tasks
     */
    getPendingMutationsCount(): number {
        let count = 0;
        for (const task of this._tasks.values()) {
            count += task.mutations.length - task.currentIndex;
        }
        return count;
    }

    /**
     * Schedule mutations to be executed during idle time
     * @param unitId - The workbook unit ID
     * @param subUnitId - The sheet ID (newly created sheet)
     * @param mutations - Remaining SetRangeValuesMutation to execute
     */
    scheduleMutations(
        unitId: string,
        subUnitId: string,
        mutations: IMutationInfo<ISetRangeValuesMutationParams>[]
    ): void {
        if (mutations.length === 0) {
            return;
        }

        const taskKey = `${unitId}_${subUnitId}`;

        // Cancel existing task for the same sheet if any
        this._cancelTask(taskKey);

        this._tasks.set(taskKey, {
            unitId,
            subUnitId,
            mutations,
            currentIndex: 0,
        });

        this._scheduleNextIdle();
    }

    /**
     * Cancel scheduled mutations for a specific sheet
     * Called when the sheet is deleted
     */
    cancelScheduledMutations(unitId: string, subUnitId: string): void {
        const taskKey = `${unitId}_${subUnitId}`;
        this._cancelTask(taskKey);
    }

    private _cancelTask(taskKey: string): void {
        this._tasks.delete(taskKey);

        // If no more tasks, cancel the idle callback
        if (this._tasks.size === 0 && this._idleCallbackId !== null) {
            if (typeof cancelIdleCallback !== 'undefined') {
                cancelIdleCallback(this._idleCallbackId);
            }
            this._idleCallbackId = null;
        }
    }

    private _cancelAllTasks(): void {
        this._tasks.clear();
        if (this._idleCallbackId !== null) {
            if (typeof cancelIdleCallback !== 'undefined') {
                cancelIdleCallback(this._idleCallbackId);
            }
            this._idleCallbackId = null;
        }
    }

    private _scheduleNextIdle(): void {
        if (this._idleCallbackId !== null) {
            return; // Already scheduled
        }

        if (typeof requestIdleCallback !== 'undefined') {
            this._idleCallbackId = requestIdleCallback(
                (deadline) => this._processIdleTasks(deadline),
                { timeout: 1000 * 60 }
            );
        } else {
            // Fallback for environments without requestIdleCallback
            this._idleCallbackId = setTimeout(() => {
                this._processIdleTasks({ didTimeout: false, timeRemaining: () => 16 });
            }, 16) as unknown as number;
        }
    }

    private _processIdleTasks(deadline: IdleDeadline | { didTimeout: boolean; timeRemaining: () => number }): void {
        this._idleCallbackId = null;

        // Process tasks while we have time
        for (const [taskKey, task] of this._tasks) {
            // Check if the sheet still exists
            if (!this._isSheetExist(task.unitId, task.subUnitId)) {
                // Sheet was deleted, cancel the task
                this._tasks.delete(taskKey);
                continue;
            }

            const startIndex = task.currentIndex;
            // Process mutations while we have time remaining
            while (task.currentIndex < task.mutations.length) {
                if (deadline.timeRemaining() <= 0 && !deadline.didTimeout) {
                    // No more time, schedule next idle
                    this._scheduleNextIdle();
                    return;
                }

                const mutation = task.mutations[task.currentIndex];
                // Use onlyLocal since the mutation was already synced to changeset via syncOnly
                this._commandService.syncExecuteCommand(mutation.id, mutation.params, { onlyLocal: true });
                task.currentIndex++;
            }

            // Task completed, remove it
            this._tasks.delete(taskKey);
        }

        // If there are still tasks remaining, schedule next idle
        if (this._tasks.size > 0) {
            this._scheduleNextIdle();
        }
    }

    private _isSheetExist(unitId: string, subUnitId: string): boolean {
        const workbook = this._univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return false;
        }
        return workbook.getSheetBySheetId(subUnitId) !== null;
    }

    private _setupBeforeUnloadListener(): void {
        if (typeof window === 'undefined') {
            return;
        }

        this._beforeUnloadHandler = (e: BeforeUnloadEvent) => {
            if (this.hasPendingTasks()) {
                // Standard way to show browser's default confirmation dialog
                e.preventDefault();
                // For older browsers
                e.returnValue = '';
                return '';
            }
        };

        window.addEventListener('beforeunload', this._beforeUnloadHandler);
    }

    private _removeBeforeUnloadListener(): void {
        if (typeof window === 'undefined' || !this._beforeUnloadHandler) {
            return;
        }

        window.removeEventListener('beforeunload', this._beforeUnloadHandler);
        this._beforeUnloadHandler = null;
    }
}
