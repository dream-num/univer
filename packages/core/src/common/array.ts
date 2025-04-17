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

export function dedupeBy<T>(arr: T[], keyFn: (v: T) => string): T[] {
    const deduplicated = new Set<string>();
    const result: T[] = [];
    for (const element of arr) {
        const key = keyFn(element);
        if (!deduplicated.has(key)) {
            deduplicated.add(key);
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

/**
 * Rotate an array without mutating the original array.
 * @param arr the array to be rotated
 * @param steps how many steps to rotate
 * @returns the rotated array, it is another array, the original array is not mutated.
 */
export function rotate<T>(arr: Readonly<T[]>, steps: number): readonly T[] {
    if (arr.length === 0) {
        return arr;
    }

    const offset = steps % arr.length;
    return arr.slice(offset).concat(arr.slice(0, offset));
}

export function groupBy<T>(arr: Readonly<T[]>, keyFn: (v: T) => string): Map<string, T[]> {
    const groups = new Map<string, T[]>();

    arr.forEach((element) => {
        const key = keyFn(element);

        let group = groups.get(key);
        if (!groups.has(key)) {
            group = [];
            groups.set(key, group);
        }

        group!.push(element);
    });

    return groups;
}

export function makeArray<T>(thing: T | T[]): T[] {
    if (Array.isArray(thing)) return thing;

    return [thing];
}
