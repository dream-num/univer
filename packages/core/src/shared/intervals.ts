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

export function generateIntervalsByPoints(points: Array<number | [number, number]>): [number, number][] {
    if (points.length === 0) {
        return [];
    }

    // Sort points and ranges by their starting number
    const sortedPoints = points.slice().sort((a, b) => (Array.isArray(a) ? a[0] : a) - (Array.isArray(b) ? b[0] : b));

    const intervals: [number, number][] = [];
    let currentStart = Array.isArray(sortedPoints[0]) ? sortedPoints[0][0] : sortedPoints[0];
    let currentEnd = currentStart;

    for (let i = 1; i < sortedPoints.length; i++) {
        const point = sortedPoints[i];
        let nextStart: number;
        let nextEnd: number;

        if (Array.isArray(point)) {
            nextStart = point[0];
            nextEnd = point[1];
        } else {
            nextStart = point;
            nextEnd = point;
        }

        if (nextStart <= currentEnd + 1) {
            // Extend the current interval
            currentEnd = Math.max(currentEnd, nextEnd);
        } else {
            // Save the current interval and start a new one
            intervals.push([currentStart, currentEnd]);
            currentStart = nextStart;
            currentEnd = nextEnd;
        }
    }

    // Push the last interval
    intervals.push([currentStart, currentEnd]);

    return intervals;
}

export function mergeIntervals(intervals: [number, number][]): [number, number][] {
    if (intervals.length === 0) {
        return [];
    }

    // Sort intervals based on the start number
    const sortedIntervals = intervals.slice().sort((a, b) => a[0] - b[0]);
    const merged: [number, number][] = [];

    let [currentStart, currentEnd] = sortedIntervals[0];

    for (let i = 1; i < sortedIntervals.length; i++) {
        const [nextStart, nextEnd] = sortedIntervals[i];

        if (nextStart <= currentEnd + 1) {
            // Overlap or contiguous intervals, merge them
            currentEnd = Math.max(currentEnd, nextEnd);
        } else {
            // No overlap, push the current interval and move to the next
            merged.push([currentStart, currentEnd]);
            currentStart = nextStart;
            currentEnd = nextEnd;
        }
    }

    // Push the last interval
    merged.push([currentStart, currentEnd]);

    return merged;
}
