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
import { SpreadsheetExtensionRegistry } from '../../extension';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultMarkerExtension';

const Z_INDEX = 60;

const stringifyRange = (range: IRange) => {
    const { startRow, endRow, startColumn, endColumn } = range;
    return `${startRow}-${endRow}-${startColumn}-${endColumn}`;
};

function drawTriangleMarker(ctx: UniverRenderingContext, color: string, x: number, y: number, x2: number, y2: number, x3: number, y3: number) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fill();
}

export class Marker extends SheetExtension {
    protected override Z_INDEX: number = Z_INDEX;

    override uKey: string = UNIQUE_KEY;

    // eslint-disable-next-line max-lines-per-function
    override draw(
        ctx: UniverRenderingContext,
        parentScale: IScale,
        skeleton: SpreadsheetSkeleton,
        diffRanges: IRange[]
    ) {
        if (ctx.__mode === 'printing') {
            return;
        }

        const { worksheet, rowColumnSegment } = skeleton;
        if (!worksheet) {
            return;
        }

        const mergeCellRendered = new Set<string>();
        const renderRanges = diffRanges?.length ? diffRanges : [rowColumnSegment];
        const hasMerge = worksheet.getMergeData().length > 0;

        renderRanges.forEach((range) => {
            const { startRow, endRow, startColumn, endColumn } = range;
            for (let row = startRow; row <= endRow; row++) {
                for (let col = startColumn; col <= endColumn; col++) {
                    if (!worksheet.getRowVisible(row) || !worksheet.getColVisible(col)) {
                        continue;
                    }

                    let cellData = worksheet.getCell(row, col);
                    if (!hasMerge && !cellData?.markers) {
                        continue;
                    }

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
                        continue;
                    }

                    if (cellInfo.isMerged || cellInfo.isMergedMainCell) {
                        const rangeStr = stringifyRange(mergeInfo);
                        if (mergeCellRendered.has(rangeStr)) {
                            continue;
                        }

                        mergeCellRendered.add(rangeStr);
                    }

                    if (!cellData) {
                        continue;
                    }

                    if (cellData.markers?.tr) {
                        const marker = cellData.markers.tr;
                        const x = endX;
                        const y = startY;
                        drawTriangleMarker(ctx, marker.color, x, y, x - marker.size, y, x, y + marker.size);
                    }

                    if (cellData.markers?.tl) {
                        const marker = cellData.markers.tl;
                        const x = startX;
                        const y = startY;
                        drawTriangleMarker(ctx, marker.color, x, y, x + marker.size, y, x, y + marker.size);
                    }

                    if (cellData.markers?.br) {
                        const marker = cellData.markers.br;
                        const x = endX;
                        const y = endY;
                        drawTriangleMarker(ctx, marker.color, x, y, x - marker.size, y, x, y - marker.size);
                    }

                    if (cellData.markers?.bl) {
                        const marker = cellData.markers.bl;
                        const x = startX;
                        const y = endY;
                        drawTriangleMarker(ctx, marker.color, x, y, x + marker.size, y, x, y - marker.size);
                    }
                }
            }
        });
    }
}

SpreadsheetExtensionRegistry.add(Marker);
