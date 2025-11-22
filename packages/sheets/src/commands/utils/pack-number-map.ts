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

import type { IObjectArrayPrimitiveType, Nullable } from '@univerjs/core';
import { Tools } from '@univerjs/core';

export type IntervalValue = number | [number, number];

export type PackedNumberMap = Record<string, IntervalValue[] | number>;
/**
 * Compression function (Map -> PackedNumberMap)
 */
export function packNumberMap(originalData: IObjectArrayPrimitiveType<Nullable<number>>): PackedNumberMap {
    const result: PackedNumberMap = {};

    // 1. Grouping: Classify data by Value, collect all Indices
    // Temporary structure: { "24": [1, 2, 3, 8], "50": [10] }
    const groupedByValue: Record<string, number[]> = {};

    // Get all Keys and sort by number size (this is crucial for interval calculation)
    const sortedIndices = Object.keys(originalData)
        .map(Number)
        .sort((a, b) => a - b);

    if (sortedIndices.length === 0) return result;

    for (const idx of sortedIndices) {
        const val = originalData[idx];
        // Skip null/undefined values
        if (!Tools.isDefine(val)) continue;
        // Note: Convert value to string as key here
        const valStr = String(val);

        if (!groupedByValue[valStr]) {
            groupedByValue[valStr] = [];
        }
        groupedByValue[valStr].push(idx);
    }

    // 2. Interval calculation and compression
    for (const [val, indices] of Object.entries(groupedByValue)) {
        const items: IntervalValue[] = [];

        if (indices.length === 0) continue;

        let start = indices[0];
        let prev = start;

        // Traverse indices to find continuous intervals
        for (let i = 1; i < indices.length; i++) {
            const current = indices[i];

            // If not continuous (current != prev + 1)
            if (current !== prev + 1) {
                // Push previous result
                if (start === prev) {
                    items.push(start); // Single point
                } else {
                    items.push([start, prev]); // Interval
                }
                // Reset start point
                start = current;
            }
            prev = current;
        }

        // Handle the last segment after the loop ends
        if (start === prev) {
            items.push(start);
        } else {
            items.push([start, prev]);
        }

        // 3. Extreme compression optimization
        // If the result has only one element and it is a number (not an interval), store the number directly and remove the array wrapper
        if (items.length === 1 && typeof items[0] === 'number') {
            result[val] = items[0];
        } else {
            result[val] = items;
        }
    }

    return result;
}

/**
 * Unpack function (PackedNumberMap -> Map)
 */
export function unpackNumberMap(compactData: PackedNumberMap): IObjectArrayPrimitiveType<number> {
    const resultMap: IObjectArrayPrimitiveType<number> = {};

    for (const [valStr, data] of Object.entries(compactData)) {
        const value = Number(valStr);

        // Case 1: Extreme compression scenario, data is directly a number (e.g., "50": 31)
        if (typeof data === 'number') {
            resultMap[data] = value;
            continue;
        }

        // Case 2: data is an array, containing mixed numbers or intervals
        // data type inferred as CompactValue[]
        for (const item of data) {
            if (Array.isArray(item)) {
                // Handle interval [start, end]
                const [start, end] = item;
                for (let i = start; i <= end; i++) {
                    resultMap[i] = value;
                }
            } else {
                // Handle single index number
                resultMap[item] = value;
            }
        }
    }
    return resultMap;
}
