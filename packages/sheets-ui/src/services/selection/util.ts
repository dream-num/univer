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

import type { ISelectionCell, ISelectionCellWithMergeInfo } from '@univerjs/core';
import type { SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { attachRangeWithCoord } from '../sheet-skeleton-manager.service';

// const nilSelection = {
//   startRow: -1,
//   startColumn: -1,
//   endRow: -1,
//   endColumn: -1,
//   startY: 0,
//   endY: 0,
//   startX: 0,
//   endX: 0,
//   rangeType: RANGE_TYPE.NORMAL,
// }

export function attachSelectionWithCoord(selection: ISelectionWithStyle, skeleton: SpreadsheetSkeleton) {
    const { range, primary, style } = selection;
    const rangeWithCoord = attachRangeWithCoord(skeleton, range);

    return {
        rangeWithCoord,
        primaryWithCoord: primary ? attachPrimaryWithCoord(primary, skeleton) : null,
        style,
    };
}

export function attachPrimaryWithCoord(primary: ISelectionCell, skeleton: SpreadsheetSkeleton): ISelectionCellWithMergeInfo {
    const { actualRow, actualColumn, isMerged, isMergedMainCell, startRow, startColumn, endRow, endColumn } = primary;
    const cellPosition = skeleton.getNoMergeCellPositionByIndex(actualRow, actualColumn);
    const startCell = skeleton.getNoMergeCellPositionByIndex(startRow, startColumn);
    const endCell = skeleton.getNoMergeCellPositionByIndex(endRow, endColumn);

    return {
        actualRow,
        actualColumn,
        isMerged,
        isMergedMainCell,
        startX: cellPosition.startX,
        startY: cellPosition.startY,
        endX: cellPosition.endX,
        endY: cellPosition.endY,
        mergeInfo: {
            startRow,
            startColumn,
            endRow,
            endColumn,
            startY: startCell?.startY || 0,
            endY: endCell?.endY || 0,
            startX: startCell?.startX || 0,
            endX: endCell?.endX || 0,
        },
    };
}
