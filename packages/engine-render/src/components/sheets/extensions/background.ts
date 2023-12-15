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

import { fixLineWidthByScale, getColor } from '../../../basics/tools';
import { SpreadsheetExtensionRegistry } from '../../extension';
import type { SpreadsheetSkeleton } from '../sheet-skeleton';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultBackgroundExtension';

export class Background extends SheetExtension {
    override uKey = UNIQUE_KEY;

    override zIndex = 20;

    override draw(
        ctx: CanvasRenderingContext2D,
        parentScale: IScale,
        spreadsheetSkeleton: SpreadsheetSkeleton,
        diffRanges?: IRange[]
    ) {
        const { rowHeaderWidth, columnHeaderHeight, dataMergeCache, stylesCache } = spreadsheetSkeleton;
        const { background } = stylesCache;
        if (!spreadsheetSkeleton) {
            return;
        }

        const { rowHeightAccumulation, columnTotalWidth, columnWidthAccumulation, rowTotalHeight } =
            spreadsheetSkeleton;

        if (
            !rowHeightAccumulation ||
            !columnWidthAccumulation ||
            columnTotalWidth === undefined ||
            rowTotalHeight === undefined
        ) {
            return;
        }
        ctx.save();
        const { scaleX = 1, scaleY = 1 } = parentScale;
        const fixPointFive = 0; // fixLineWidthByScale(0.5, scale);
        background &&
            Object.keys(background).forEach((rgb: string) => {
                const backgroundCache = background[rgb];
                ctx.fillStyle = rgb || getColor([255, 255, 255])!;
                ctx.beginPath();
                backgroundCache.forEach((rowIndex, backgroundRow) => {
                    backgroundRow.forEach((columnIndex) => {
                        const cellInfo = this.getCellIndex(
                            rowIndex,
                            columnIndex,
                            rowHeightAccumulation,
                            columnWidthAccumulation,
                            dataMergeCache
                        );
                        let { startY, endY, startX, endX } = cellInfo;
                        const { isMerged, isMergedMainCell, mergeInfo } = cellInfo;
                        if (isMerged) {
                            return true;
                        }

                        if (
                            !this.isRenderDiffRangesByRow(mergeInfo.startRow, diffRanges) &&
                            !this.isRenderDiffRangesByRow(mergeInfo.endRow, diffRanges)
                        ) {
                            return true;
                        }

                        if (isMergedMainCell) {
                            startY = mergeInfo.startY;
                            endY = mergeInfo.endY;
                            startX = mergeInfo.startX;
                            endX = mergeInfo.endX;
                        }

                        startY = fixLineWidthByScale(startY, scaleY);
                        endY = fixLineWidthByScale(endY, scaleY);
                        startX = fixLineWidthByScale(startX, scaleX);
                        endX = fixLineWidthByScale(endX, scaleX);

                        ctx.moveTo(startX, startY);
                        ctx.lineTo(startX, endY);
                        ctx.lineTo(endX, endY);
                        ctx.lineTo(endX, startY);
                    });
                });
                ctx.closePath();
                ctx.fill();
            });
        ctx.restore();
    }
}

SpreadsheetExtensionRegistry.add(new Background());
