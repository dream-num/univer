/**
 *
 * @param tasks all promise tasks that need to be triggered
 * @returns
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
