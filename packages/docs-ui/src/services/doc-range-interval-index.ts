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

export interface IDocInterval<T> {
    start: number;
    end: number;
    value: T;
}

export interface IDocIntervalIndex<T> {
    intervals: IDocInterval<T>[];
    subtreeEnds: number[];
}

export function buildDocIntervalIndex<T>(intervals: IDocInterval<T>[]): IDocIntervalIndex<T> {
    intervals.sort((left, right) => left.start - right.start);
    const subtreeEnds = new Array<number>(intervals.length);
    const indexSubtree = (first: number, end: number): number => {
        if (first === end) {
            return Number.NEGATIVE_INFINITY;
        }
        const middle = Math.floor((first + end) / 2);
        const maxEnd = Math.max(intervals[middle].end, indexSubtree(first, middle), indexSubtree(middle + 1, end));
        subtreeEnds[middle] = maxEnd;
        return maxEnd;
    };
    indexSubtree(0, intervals.length);
    return { intervals, subtreeEnds };
}

export function visitDocIntervals<T>(index: IDocIntervalIndex<T>, start: number, end: number, visit: (value: T) => void): void {
    const { intervals, subtreeEnds } = index;
    const visitSubtree = (first: number, last: number): void => {
        if (first === last || intervals[first].start > end) {
            return;
        }
        const middle = Math.floor((first + last) / 2);
        if (subtreeEnds[middle] < start) {
            return;
        }
        visitSubtree(first, middle);
        const interval = intervals[middle];
        if (interval.start <= end && interval.end >= start) {
            visit(interval.value);
        }
        visitSubtree(middle + 1, last);
    };
    visitSubtree(0, intervals.length);
}
