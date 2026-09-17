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

import type { Nullable } from '@univerjs/core';
import type { ICellDataWithSpanInfo } from './type';
import { cloneCellData } from '@univerjs/core';

/**
 * Fast clone for ICellDataWithSpanInfo. Optimized for the known structure.
 * This extends cloneCellData with additional span and plain properties.
 * @param cell - The cell data with span info to clone
 * @returns A deep clone of the cell data
 */
export function cloneCellDataWithSpanInfo(cell: Nullable<ICellDataWithSpanInfo>): Nullable<ICellDataWithSpanInfo> {
    if (cell === null || cell === undefined) {
        return cell;
    }

    const result: ICellDataWithSpanInfo = cloneCellData(cell)!;

    // rowSpan - span properties (primitives)
    if (cell.rowSpan !== undefined) {
        result.rowSpan = cell.rowSpan;
    }

    // colSpan - span properties (primitives)
    if (cell.colSpan !== undefined) {
        result.colSpan = cell.colSpan;
    }

    // plain - plain text value (primitive string)
    if (cell.plain !== undefined) {
        result.plain = cell.plain;
    }

    return result;
}
