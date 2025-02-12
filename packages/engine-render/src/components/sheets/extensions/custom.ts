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

import type { IRange, IScale } from '@univerjs/core';
import type { UniverRenderingContext } from '../../../context';
import type { SpreadsheetSkeleton } from '../sheet.render-skeleton';
import { Range, sortRules } from '@univerjs/core';
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

    override draw(ctx: UniverRenderingContext, _parentScale: IScale, skeleton: SpreadsheetSkeleton, diffRanges: IRange[] | undefined): void {
        const { worksheet, rowColumnSegment } = skeleton;
        if (!worksheet) {
            return;
        }
        const mergeCellRendered = new Set<string>();
        const subUnitId = worksheet.getSheetId();

        Range.foreach(rowColumnSegment, (row, col) => {
            if (!worksheet.getRowVisible(row) || !worksheet.getColVisible(col)) {
                return;
            }
            let cellData = worksheet.getCell(row, col);
            if (!cellData?.customRender) {
                return;
            }

            let primaryWithCoord = skeleton.getCellWithCoordByIndex(row, col, false);

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

                primaryWithCoord = skeleton.getCellWithCoordByIndex(mainCell.row, mainCell.col);
            }

            const renderInfo = {
                data: cellData,
                style: skeleton.getStyles().getStyleByCell(cellData),
                primaryWithCoord,
                subUnitId,
                row,
                col,
                worksheet,
                unitId: worksheet.unitId,
            };

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
