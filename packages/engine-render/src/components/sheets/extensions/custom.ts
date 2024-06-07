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

import type { IRange, IScale } from '@univerjs/core';
import { Range, sortRules } from '@univerjs/core';
import type { UniverRenderingContext } from '../../../context';
import type { SpreadsheetSkeleton } from '../sheet-skeleton';
import { SpreadsheetExtensionRegistry } from '../../extension';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultCustomExtension';

const Z_INDEX = 55;

const stringifyRange = (range: IRange) => {
    const { startRow, endRow, startColumn, endColumn } = range;
    return `${startRow}-${endRow}-${startColumn}-${endColumn}`;
};

export class Custom extends SheetExtension {
    protected override Z_INDEX = Z_INDEX;

    override uKey: string = UNIQUE_KEY;

    override draw(ctx: UniverRenderingContext, parentScale: IScale, skeleton: SpreadsheetSkeleton, diffRanges?: IRange[] | undefined): void {
        const { rowHeightAccumulation, columnWidthAccumulation, worksheet, dataMergeCache, rowColumnSegment } = skeleton;
        if (!worksheet) {
            return;
        }
        const mergeCellRendered = new Set<string>();
        const subUnitId = worksheet.getSheetId();

        Range.foreach(rowColumnSegment, (row, col) => {
            let cellData = worksheet.getCell(row, col);
            if (!cellData?.customRender) {
                return;
            }

            let primaryWithCoord = this.getCellIndex(row, col, rowHeightAccumulation, columnWidthAccumulation, dataMergeCache);

            const { mergeInfo } = primaryWithCoord;
            if (!this.isRenderDiffRangesByRow(mergeInfo.startRow, mergeInfo.endRow, diffRanges)) {
                return true;
            }

            if (primaryWithCoord.isMerged || primaryWithCoord.isMergedMainCell) {
                const rangeStr = stringifyRange(mergeInfo);
                if (mergeCellRendered.has(rangeStr)) {
                    return;
                }

                mergeCellRendered.add(rangeStr);
            }

            if (primaryWithCoord.isMerged) {
                const mainCell = {
                    row: mergeInfo.startRow,
                    col: mergeInfo.startColumn,
                };
                cellData = worksheet.getCell(mainCell.row, mainCell.col);
                if (!cellData?.customRender) {
                    return;
                }

                primaryWithCoord = this.getCellIndex(mainCell.row, mainCell.col, rowHeightAccumulation, columnWidthAccumulation, dataMergeCache);
            }

            const renderInfo = {
                data: cellData,
                style: skeleton.getsStyles().getStyleByCell(cellData),
                primaryWithCoord,
                subUnitId,
                row,
                col,
                worksheet,
            };

                // current cell is hidden
            if (!worksheet.getColVisible(col) || !worksheet.getRowVisible(row)) {
                return;
            }

            const customRender = cellData.customRender.sort(sortRules);

            ctx.save();

            customRender.forEach((item) => {
                item.drawWith(ctx, renderInfo, skeleton, this.parent);
            });
            ctx.restore();
        });
    }
}

SpreadsheetExtensionRegistry.add(Custom);
