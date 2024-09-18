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

import type { Worksheet } from '@univerjs/core';

/**
 * @deprecated Use worksheet.isRowContainsMergedCell
 * @param row after this row
 */
export function rowAcrossMergedCell(row: number, worksheet: Worksheet): boolean {
    return worksheet.getMergeData().some((mergedCell) => mergedCell.startRow < row && row <= mergedCell.endRow);
}

/**
 * @deprecated Use worksheet.isColumnContainsMergedCell
 */
export function columnAcrossMergedCell(col: number, worksheet: Worksheet): boolean {
    return worksheet.getMergeData().some((mergedCell) => mergedCell.startColumn < col && col <= mergedCell.endColumn);
}
