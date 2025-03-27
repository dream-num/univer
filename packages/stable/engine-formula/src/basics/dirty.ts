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

import type { IUnitRange } from '@univerjs/core';

export function isInDirtyRange(
    dirtyRanges: IUnitRange[],
    unitId: string,
    sheetId: string,
    row: number,
    column: number
) {
    for (let i = 0, len = dirtyRanges.length; i < len; i++) {
        const dirtyRange = dirtyRanges[i];
        if (unitId !== dirtyRange.unitId) {
            continue;
        }

        if (sheetId !== dirtyRange.sheetId) {
            continue;
        }

        const { startRow, startColumn, endRow, endColumn } = dirtyRange.range;

        if (row >= startRow && row <= endRow && column >= startColumn && column <= endColumn) {
            return true;
        }
    }

    return false;
}
