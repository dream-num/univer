/**
 * Remove an item from an array.
 * @param arr The array to remove item from.
 * @param item The item to be removed.
 * @returns Returns `true` if the item is removed successfully. Returns `false` if the item does not exist in the array.
 */
export function remove<T>(arr: T[], item: T): boolean {
    const index = arr.indexOf(item);
    if (index > -1) {
        arr.splice(index, 1);
        return true;
    }
    return false;
}

/**
 * Deduplicate an array.
 * @param arr The array to be dedupe.
 * @returns Return the deduplicated array.
 */
export function dedupe<T>(arr: T[]): T[] {
    const deduplicated = new Set<T>();
    const result: T[] = [];
    for (const element of arr) {
        if (!deduplicated.has(element)) {
            deduplicated.add(element);
            result.push(element);
        }
    }
    return result;
}

export function findLast<T>(arr: T[], callback: (item: T, index: number) => boolean): T | null {
    for (let i = arr.length - 1; i > -1; i--) {
        const item = arr[i];
        if (callback(item, i)) {
            return item;
        }
    }

    return null;
}
