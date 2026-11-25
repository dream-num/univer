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

const MAX_PENDING_TASKS = 1000;

/**
 * Runs tasks one at a time in submission order. Each instance has its own queue.
 *
 * Share an instance across operations that need exclusive access to the same resource.
 * A running task that awaits another task on the same queue will deadlock.
 */
export class SerialTaskQueue {
    private _running = false;
    private readonly _waiting: Array<() => void> = [];

    /**
     * Calls the task immediately when the queue is idle. Otherwise it waits for earlier
     * tasks to settle. If a task fails, the next waiting task can still run.
     *
     * @param task Work to run. Return a promise covering all work that needs exclusive access.
     * @returns A promise that resolves with the task's result or rejects with its error.
     * @throws {Error} The returned promise rejects without starting the task if 1,000 tasks
     * are already waiting, in addition to the one currently running.
     */
    async run<T>(task: () => T | PromiseLike<T>): Promise<T> {
        if (this._running) {
            if (this._waiting.length >= MAX_PENDING_TASKS) {
                throw new Error('Too many pending tasks in queue');
            }
            await new Promise<void>((resolve) => {
                this._waiting.push(resolve);
            });
        }

        this._running = true;
        try {
            return await task();
        } finally {
            const next = this._waiting.shift();
            if (next) {
                next();
            } else {
                this._running = false;
            }
        }
    }
}
