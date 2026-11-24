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

/*! Bulk partitioning adapted from rbush 4.0.1 (MIT) and quickselect 3.0.0 (ISC). See THIRD-PARTY-NOTICES.txt. */

type Compare<T> = (a: T, b: T) => number;

function swap<T>(items: T[], a: number, b: number) {
    const saved = items[a];
    items[a] = items[b];
    items[b] = saved;
}

// Floyd–Rivest selection partitions the slice around the item at rank k.
function select<T>(items: T[], k: number, start: number, end: number, compare: Compare<T>) {
    let left = start;
    let right = end;
    while (right > left) {
        if (right - left > 600) {
            const count = right - left + 1;
            const rank = k - left + 1;
            const log = Math.log(count);
            const sample = 0.5 * Math.exp(2 * log / 3);
            const deviation = 0.5 * Math.sqrt(log * sample * (count - sample) / count) * (rank < count / 2 ? -1 : 1);
            const sampleLeft = Math.max(left, Math.floor(k - rank * sample / count + deviation));
            const sampleRight = Math.min(right, Math.floor(k + (count - rank) * sample / count + deviation));
            select(items, k, sampleLeft, sampleRight, compare);
        }

        const pivot = items[k];
        let i = left;
        let j = right;
        swap(items, left, k);
        if (compare(items[right], pivot) > 0) {
            swap(items, left, right);
        }
        while (i < j) {
            swap(items, i, j);
            i++;
            j--;
            while (compare(items[i], pivot) < 0) {
                i++;
            }
            while (compare(items[j], pivot) > 0) {
                j--;
            }
        }
        if (compare(items[left], pivot) === 0) {
            swap(items, left, j);
        } else {
            j++;
            swap(items, j, right);
        }
        if (j <= k) {
            left = j + 1;
        }
        if (k <= j) {
            right = j - 1;
        }
    }
}

// Partition into ordered tiles without sorting the entries inside each tile.
export function multiSelect<T>(items: T[], start: number, end: number, tileSize: number, compare: Compare<T>) {
    const stack = [start, end];
    while (stack.length) {
        const right = stack.pop()!;
        const left = stack.pop()!;
        if (right - left > tileSize) {
            const middle = left + Math.ceil((right - left) / tileSize / 2) * tileSize;
            select(items, middle, left, right, compare);
            stack.push(left, middle, middle, right);
        }
    }
}
