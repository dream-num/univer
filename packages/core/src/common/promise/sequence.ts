/**
 * Execute promise tasks in sequence, if one of the tasks return false, the sequence will be stopped.
 * @param tasks All promise tasks that need to be triggered.
 * @returns Returns `true` if all tasks are executed successfully, otherwise `false` and index of the task that returns false.
 */
export async function sequence(
    tasks: Array<() => Promise<boolean> | boolean>
): Promise<{ result: boolean; index: number }> {
    for (const [index, task] of tasks.entries()) {
        if (!(await task())) {
            return {
                index,
                result: false,
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
export function syncSequence(tasks: Array<() => boolean>): { result: boolean; index: number } {
    for (const [index, task] of tasks.entries()) {
        if (!task()) {
            return {
                index,
                result: false,
            };
        }
    }

    return {
        result: true,
        index: -1,
    };
}
