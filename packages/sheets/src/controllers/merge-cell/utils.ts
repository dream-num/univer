/**
 * Copyright 2023-present DreamNum Inc.
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
import { Dimension } from '@univerjs/core';

export function getAddMergeMutationRangeByType(selection: IRange[], type?: Dimension) {
    let ranges = selection;
    if (type !== undefined) {
        const rectangles: IRange[] = [];
        for (let i = 0; i < ranges.length; i++) {
            const { startRow, endRow, startColumn, endColumn } = ranges[i];
            if (type === Dimension.ROWS) {
                for (let r = startRow; r <= endRow; r++) {
                    const data = {
                        startRow: r,
                        endRow: r,
                        startColumn,
                        endColumn,
                    };
                    rectangles.push(data);
                }
            } else if (type === Dimension.COLUMNS) {
                for (let c = startColumn; c <= endColumn; c++) {
                    const data = {
                        startRow,
                        endRow,
                        startColumn: c,
                        endColumn: c,
                    };
                    rectangles.push(data);
                }
            }
        }
        ranges = rectangles;
    }
    return ranges;
}
