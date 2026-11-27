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

type Compare<T> = (a: T, b: T) => number;

function exchange<T>(items: T[], a: number, b: number) {
    const value = items[a];
    items[a] = items[b];
    items[b] = value;
}

// A rank partition also determines the relative order of equal coordinates in a saved tree.
// Use the Floyd–Rivest sample window before partitioning large intervals.
function partitionAt<T>(items: T[], rank: number, first: number, last: number, compare: Compare<T>) {
    let begin = first;
    let end = last;
    while (begin < end) {
        const length = end - begin + 1;
        if (length > 601) {
            const position = rank - begin + 1;
            const logLength = Math.log(length);
            const sample = Math.exp(2 * logLength / 3) / 2;
            const deviation = Math.sqrt(logLength * sample * (length - sample) / length) / 2;
            const shift = position < length / 2 ? -deviation : deviation;
            const lower = Math.floor(rank - position * sample / length + shift);
            const upper = Math.floor(rank + (length - position) * sample / length + shift);
            partitionAt(items, rank, Math.max(begin, lower), Math.min(end, upper), compare);
        }

        const pivot = items[rank];
        exchange(items, rank, begin);
        if (!(compare(items[end], pivot) > 0)) {
            exchange(items, begin, end);
        }
        let lower = begin;
        let upper = end;
        for (;;) {
            do {
                lower++;
            } while (compare(items[lower], pivot) < 0);
            do {
                upper--;
            } while (compare(items[upper], pivot) > 0);
            if (lower >= upper) {
                break;
            }
            exchange(items, lower, upper);
        }

        const atStart = compare(items[begin], pivot) === 0;
        const boundary = atStart ? upper : upper + 1;
        exchange(items, boundary, atStart ? begin : end);
        if (boundary === rank) {
            return;
        }
        if (boundary < rank) {
            begin = boundary + 1;
        } else {
            end = boundary - 1;
        }
    }
}

export function partitionSpatialGroups<T>(items: T[], begin: number, end: number, groupSize: number, compare: Compare<T>) {
    let last = end;
    while (last - begin > groupSize) {
        const boundary = begin + groupSize * Math.ceil((last - begin) / (2 * groupSize));
        partitionAt(items, boundary, begin, last, compare);
        // Both intervals include the boundary. Visiting the upper interval first preserves ties.
        if (last - boundary > groupSize) {
            partitionSpatialGroups(items, boundary, last, groupSize, compare);
        }
        last = boundary;
    }
}
