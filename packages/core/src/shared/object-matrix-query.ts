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

import { Range } from '../sheets/range';
import { ObjectMatrix } from './object-matrix';
import { Rectangle } from './rectangle';
import type { IRange } from '../sheets/typedef';
import type { Nullable } from './types';

function maximalRectangle<T>(matrix: T[][], match: (val: T) => boolean) {
    if (matrix.length === 0 || matrix[0].length === 0) return null;

    const heights = new Array(matrix[0].length).fill(0);
    let maxArea = 0;
    let maxRect = null;

    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[0].length; col++) {
            heights[col] = match(matrix[row][col]) ? heights[col] + 1 : 0;
        }

        const areaWithRect = largestRectangleArea(heights);
        if (areaWithRect.area > maxArea) {
            maxArea = areaWithRect.area;
            // Adjust the rectangle's top row to the current row minus the height plus one
            maxRect = {
                startColumn: areaWithRect.start,
                startRow: row - areaWithRect.height + 1,
                endColumn: areaWithRect.end,
                endRow: row,
            };
        }
    }

    return maxRect;
}

function largestRectangleArea(heights: number[]) {
    const stack: number[] = [];
    let maxArea = 0;
    let maxRect = { area: 0, height: 0, start: 0, end: 0 };
    let index = 0;

    while (index < heights.length) {
        if (stack.length === 0 || heights[index] >= heights[stack[stack.length - 1]]) {
            stack.push(index++);
        } else {
            const height = heights[stack.pop()!];
            const width = stack.length === 0 ? index : index - stack[stack.length - 1] - 1;
            if (height * width > maxArea) {
                maxArea = height * width;
                maxRect = { area: maxArea, height, start: stack.length === 0 ? 0 : stack[stack.length - 1] + 1, end: index - 1 };
            }
        }
    }

    while (stack.length > 0) {
        const height = heights[stack.pop()!];
        const width = stack.length === 0 ? index : index - stack[stack.length - 1] - 1;
        if (height * width > maxArea) {
            maxArea = height * width;
            maxRect = { area: maxArea, height, start: stack.length === 0 ? 0 : stack[stack.length - 1] + 1, end: index - 1 };
        }
    }

    return maxRect;
}

function resetMatrix<T>(matrix: Nullable<T>[][], range: IRange) {
    Range.foreach(range, (row, col) => {
        matrix[row][col] = undefined;
    });
}

/**
 * @deprecated this function could cause memory out of use in large range.
 */
export function queryObjectMatrix<T>(matrix: ObjectMatrix<T>, match: (value: T) => boolean) {
    const arrayMatrix = matrix.toFullArray();
    const results: IRange[] = [];
    while (true) {
        const rectangle = maximalRectangle(arrayMatrix, match);
        if (!rectangle) {
            break;
        }

        results.push(rectangle);
        resetMatrix(arrayMatrix, rectangle);
    }

    return results;
}

export function multiSubtractMultiRanges(ranges1: IRange[], ranges2: IRange[]): IRange[] {
    const matrix = new ObjectMatrix<number>();

    ranges1.forEach((range) => {
        Range.foreach(range, (row, col) => {
            matrix.setValue(row, col, 1);
        });
    });

    ranges2.forEach((range) => {
        Range.foreach(range, (row, col) => {
            matrix.setValue(row, col, 0);
        });
    });

    return Rectangle.mergeRanges(queryObjectMatrix(matrix, (value) => value === 1));
}
