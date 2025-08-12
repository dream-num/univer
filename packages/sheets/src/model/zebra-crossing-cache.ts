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

import type { IRange } from '@univerjs/core';

type IVisibleFunc = (row: number) => boolean;
type IToggleRange = [number, number];

/**
 * This class is used for caching zebra crossing toggle ranges.
 * `toggleRanges` represents the ranges within the visible area where the original odd/even row state is reversed due to hidden rows.
 * Based on the following rules:
 * 1. If there is an odd number of hidden rows before a certain row, the odd/even state of that row will be reversed.
 * 2. If there is an even number of hidden rows before a certain row, the odd/even state of that row will not be reversed.
 * 3. If there are no hidden rows before a certain row, the odd/even state of that row will not be reversed.
 *
 * Example:
 * Given rows 1 to 10, where rows 3 and 7 are hidden:
 * - Rows 1 and 2 remain in their original odd/even state.
 * - Row 4's state is reversed because there is 1 hidden row (odd) before it.
 * - Row 8's state is reversed because there are 2 hidden rows (even) before it.
 * - Rows 9 and 10 remain in their original odd/even state.
 */
export class ZebraCrossingCache {
    private _toggleRanges: IToggleRange[] = [];

  /**
   * Refresh the cache based on the given range and visibility function.
   * This method calculates toggle ranges for rows that are visible within the specified range.
   * Hidden rows are excluded from the toggle calculation.
   * @param range The range of rows to refresh (startRow and endRow are required).
   * @param visibleFunc A function to determine if a row is visible.
   */
    refresh(range: IRange, visibleFunc: IVisibleFunc): void {
        const { startRow, endRow } = range;

        const toggleRanges: IToggleRange[] = [];
        let hiddenCount = 0;
        let inToggle = false;
        let toggleStart = -1;

        for (let row = startRow; row <= endRow; row++) {
            const isVisible = visibleFunc(row);

            if (!isVisible) {
                hiddenCount++;

                if (hiddenCount % 2 === 1) {
                    inToggle = true;
                } else {
                    inToggle = false;
                    if (toggleStart !== -1) {
                        toggleRanges.push([toggleStart, row - 1]);
                        toggleStart = -1;
                    }
                }
                continue;
            }

            if (hiddenCount % 2 === 1) {
                if (!inToggle) {
                    inToggle = true;
                    toggleStart = row;
                } else if (toggleStart === -1) {
                    toggleStart = row;
                }
            } else {
                if (inToggle) {
                    toggleRanges.push([toggleStart, row - 2]);
                    inToggle = false;
                    toggleStart = -1;
                }
            }

            // If it's the last row and still in the toggle range, finalize the range
            if (row === endRow && inToggle) {
                toggleRanges.push([toggleStart, row]);
            }
        }

        this._toggleRanges = toggleRanges;
    }

    /**
     * This function returns the toggle ranges. Only for testing purposes. In production, you should use `getIsToggled` to check if a row is toggled.
     * @returns [IToggleRange[]] The toggle ranges calculated by the last refresh.
     */
    getToggleRanges(): IToggleRange[] {
        return this._toggleRanges.concat();
    }

    /**
     * Check if the given row is toggled (odd/even state).
     * This method uses binary search to efficiently determine if the row is within a toggle range.
     * @param row The row to check.
     * @returns True if the row is toggled (odd), false otherwise (even or hidden).
     */
    getIsToggled(row: number): boolean {
        let left = 0;
        let right = this._toggleRanges.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const [start, end] = this._toggleRanges[mid];

            if (row < start) {
                right = mid - 1;
            } else if (row > end) {
                left = mid + 1;
            } else {
                return true;
            }
        }
        return false;
    }
}
