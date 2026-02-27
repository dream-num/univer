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

/**
 * Convert Excel column label to number
 * @param label Column label (e.g., "A", "Z", "AA", "XFD")
 * @returns Column number (e.g., 1, 26, 27, 16384)
 */
export function columnLabelToNumber(label: string): number {
    let n = 0;
    for (let i = 0; i < label.length; i++) {
        const c = label.charCodeAt(i);
        if (c < 65 || c > 90) return -1;
        n = n * 26 + (c - 64);
    }
    return n;
}

/**
 * Maximum number of rows and columns in Excel
 * Rows: 1,048,576
 * Columns: 16,384 (equivalent to column XFD)
 */
export const MAX_ROW_COUNT = 1048576;
export const MAX_COLUMN_COUNT = 16384;
