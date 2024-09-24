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
import { fixLineWidthByScale, getColor, inViewRanges } from '../../../basics/tools';
import { SpreadsheetExtensionRegistry } from '../../extension';
import { SheetExtension } from './sheet-extension';
import type { UniverRenderingContext } from '../../../context';
import type { IDrawInfo } from '../../extension';
import type { SpreadsheetSkeleton } from '../sheet-skeleton';
import type { Spreadsheet } from '../spreadsheet';

const UNIQUE_KEY = 'DefaultBackgroundExtension';

/**
 * in prev version background ext is higher than font ext. now turing back lower than font ext.
 * font ext z-index is 30.
 */
const DOC_EXTENSION_Z_INDEX = 21;
const PRINTING_Z_INDEX = 21;

export class Background extends SheetExtension {
    override uKey = UNIQUE_KEY;

    override Z_INDEX = DOC_EXTENSION_Z_INDEX;

    PRINTING_Z_INDEX = PRINTING_Z_INDEX;

    override get zIndex() {
        return (this.parent as Spreadsheet)?.isPrinting ? this.PRINTING_Z_INDEX : this.Z_INDEX;
    }

    /* eslint-disable-next-line max-lines-per-function */
    override draw(
        ctx: UniverRenderingContext,
        _parentScale: IScale,
        spreadsheetSkeleton: SpreadsheetSkeleton,
        diffRanges: IRange[],
        { viewRanges, checkOutOfViewBound }: IDrawInfo
    ) {
        const { stylesCache, worksheet, rowHeightAccumulation, columnTotalWidth, columnWidthAccumulation, rowTotalHeight } = spreadsheetSkeleton;
        const { background: bgMatrixCacheByColor, backgroundPositions } = stylesCache;
        if (!worksheet || !bgMatrixCacheByColor) return;
        if (
            !rowHeightAccumulation ||
            !columnWidthAccumulation ||
            columnTotalWidth === undefined ||
            rowTotalHeight === undefined
        ) {
            return;
        }
        ctx.save();
        const { scaleX, scaleY } = ctx.getScale();
        const renderBGCore = (rgb: string) => {
            const bgColorMatrix = bgMatrixCacheByColor[rgb];
            ctx.fillStyle = rgb || getColor([255, 255, 255])!;
            const backgroundPaths = new Path2D();
            const renderBGByCell = (row: number, col: number) => {
                if (!checkOutOfViewBound && !inViewRanges(viewRanges, row, col)) {
                    return true;
                }

                const cellInfo = backgroundPositions?.getValue(row, col);
                if (cellInfo == null) {
                    return true;
                }

                let { startY, endY, startX, endX } = cellInfo;
                const { isMerged, isMergedMainCell, mergeInfo } = cellInfo;
                const mergeTo = diffRanges && diffRanges.length > 0 ? diffRanges : viewRanges;
                const combineWithMergeRanges = mergeTo;
                //expandRangeIfIntersects([...mergeTo], [mergeInfo]);

                // If curr cell is not in the viewrange (viewport + merged cells), exit early.
                if (!inViewRanges(combineWithMergeRanges!, row, col)) {
                    return true;
                }
                // For merged cells, and the current cell is the top-left cell in the merged region.
                if (isMergedMainCell) {
                    startY = mergeInfo.startY;
                    endY = mergeInfo.endY;
                    startX = mergeInfo.startX;
                    endX = mergeInfo.endX;
                }

                // in merge range , but not top-left cell.
                if (isMerged) return true;

                // getRowVisible can take a lot of time, sometimes over 20+ms, this return condition should put in the last.
                const visibleRow = spreadsheetSkeleton.worksheet.getRowVisible(row);
                const visibleCol = spreadsheetSkeleton.worksheet.getColVisible(col);
                if (!visibleRow || !visibleCol) return true;

                // precise is a workaround for windows, macOS does not have this issue.
                const startXPrecise = fixLineWidthByScale(startX, scaleX);
                const startYPrecise = fixLineWidthByScale(startY, scaleY);
                const endXPrecise = fixLineWidthByScale(endX, scaleX);
                const endYPrecise = fixLineWidthByScale(endY, scaleY);
                backgroundPaths.rect(startXPrecise, startYPrecise, endXPrecise - startXPrecise, endYPrecise - startYPrecise);
            };

            ctx.beginPath();
            bgColorMatrix.forValue(renderBGByCell);
            // viewRanges.forEach((range) => {
            //     Range.foreach(range, (row, col) => {
            //         const bgConfig = bgColorMatrix.getValue(row, col);
            //         if (bgConfig) {
            //             renderBGByCell(row, col);
            //         }
            //     });
            // });
            ctx.fill(backgroundPaths);
            ctx.closePath();
        };

        Object.keys(bgMatrixCacheByColor).forEach(renderBGCore);
        ctx.restore();
    }
}

SpreadsheetExtensionRegistry.add(Background);
