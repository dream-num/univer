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

export interface ISequenceExecuteResult {
    index: number;
    result: boolean;
    error?: unknown;
}

/**
 * Execute promise tasks in sequence, if one of the tasks return false, the sequence will be stopped.
 * @param tasks All promise tasks that need to be triggered.
 * @returns Returns `true` if all tasks are executed successfully, otherwise `false` and index of the task that returns false.
 */
export async function sequenceAsync(tasks: Array<() => Promise<boolean> | boolean>): Promise<ISequenceExecuteResult> {
    for (const [index, task] of tasks.entries()) {
        try {
            const result = await task();
            if (!result) {
                return {
                    index,
                    result: false,
                };
            }
        } catch (e: unknown) {
            return {
                index,
                result: false,
                error: e,
            };
        }
    }

    return {
        result: true,
        index: -1,
    };
}

/**
 * Execute tasks in sequence, if one of the tasks return false, the sequence will be stopped.
 * @param tasks All tasks that need to be triggered.
 * @returns Returns `true` if all tasks are executed successfully, otherwise `false` and index of the task that returns false.
 */
export function sequence(tasks: Array<() => boolean>): ISequenceExecuteResult {
    for (const [index, task] of tasks.entries()) {
        try {
            const result = task();
            if (!result) {
                return {
                    index,
                    result: false,
                };
            }
        } catch (e: unknown) {
            return {
                index,
                result: false,
                error: e,
            };
        }
    }

    return {
        result: true,
        index: -1,
    };
}
