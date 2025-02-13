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
import { Range } from '@univerjs/core';
import { SpreadsheetExtensionRegistry } from '../../extension';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultMarkerExtension';

const Z_INDEX = 60;

const stringifyRange = (range: IRange) => {
    const { startRow, endRow, startColumn, endColumn } = range;
    return `${startRow}-${endRow}-${startColumn}-${endColumn}`;
};

export class Marker extends SheetExtension {
    protected override Z_INDEX: number = Z_INDEX;

    override uKey: string = UNIQUE_KEY;

    // eslint-disable-next-line max-lines-per-function
    override draw(ctx: UniverRenderingContext, parentScale: IScale, skeleton: SpreadsheetSkeleton, diffRanges: IRange[]): void {
        if (ctx.__mode === 'printing') {
            return;
        }

        const { worksheet, rowColumnSegment } = skeleton;
        if (!worksheet) {
            return;
        }

        const mergeCellRendered = new Set<string>();

        // eslint-disable-next-line max-lines-per-function
        Range.foreach(rowColumnSegment, (row, col) => {
            if (!worksheet.getRowVisible(row) || !worksheet.getColVisible(col)) {
                return;
            }

            let cellData = worksheet.getCell(row, col);
            const cellInfo = skeleton.getCellWithCoordByIndex(row, col, false);
            const { isMerged, isMergedMainCell, mergeInfo } = cellInfo;
            let { startY, endY, startX, endX } = cellInfo;

            if (isMergedMainCell || isMerged) {
                startY = mergeInfo.startY;
                endY = mergeInfo.endY;
                startX = mergeInfo.startX;
                endX = mergeInfo.endX;
            }

            if (isMerged) {
                const mainCell = {
                    row: mergeInfo.startRow,
                    col: mergeInfo.startColumn,
                };

                cellData = worksheet.getCell(mainCell.row, mainCell.col);
            }

            if (!this.isRenderDiffRangesByRow(mergeInfo.startRow, mergeInfo.endRow, diffRanges)) {
                return true;
            }

            if (cellInfo.isMerged || cellInfo.isMergedMainCell) {
                const rangeStr = stringifyRange(mergeInfo);
                if (mergeCellRendered.has(rangeStr)) {
                    return;
                }

                mergeCellRendered.add(rangeStr);
            }

            if (!cellData) {
                return;
            }

            if (cellData.markers?.tr) {
                ctx.save();
                const marker = cellData.markers.tr;
                const x = endX;
                const y = startY;
                ctx.fillStyle = marker.color;
                ctx.moveTo(x, y);
                ctx.beginPath();
                ctx.lineTo(x - marker.size, y);
                ctx.lineTo(x, y + marker.size);
                ctx.lineTo(x, y);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            if (cellData.markers?.tl) {
                ctx.save();
                const marker = cellData.markers.tl;
                const x = startX;
                const y = startY;
                ctx.fillStyle = marker.color;
                ctx.moveTo(x, y);
                ctx.beginPath();
                ctx.lineTo(x + marker.size, y);
                ctx.lineTo(x, y + marker.size);
                ctx.lineTo(x, y);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            if (cellData.markers?.br) {
                ctx.save();
                const marker = cellData.markers.br;
                const x = endX;
                const y = endY;
                ctx.fillStyle = marker.color;
                ctx.moveTo(x, y);
                ctx.beginPath();
                ctx.lineTo(x - marker.size, y);
                ctx.lineTo(x, y - marker.size);
                ctx.lineTo(x, y);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            if (cellData.markers?.bl) {
                ctx.save();
                const marker = cellData.markers.bl;
                const x = startX;
                const y = endY;
                ctx.fillStyle = marker.color;
                ctx.moveTo(x, y);
                ctx.beginPath();
                ctx.lineTo(x + marker.size, y);
                ctx.lineTo(x, y - marker.size);
                ctx.lineTo(x, y);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        });
    }
}

SpreadsheetExtensionRegistry.add(Marker);
