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

import type { ICellWithCoord, IRange, IScale, ObjectMatrix } from '@univerjs/core';
import type { UniverRenderingContext } from '../../../context';
import type { IDrawInfo } from '../../extension';
import type { SpreadsheetSkeleton } from '../sheet.render-skeleton';
import type { Spreadsheet } from '../spreadsheet';
import { Range } from '@univerjs/core';
import { fixLineWidthByScale, getColor, inViewRanges } from '../../../basics/tools';
import { SpreadsheetExtensionRegistry } from '../../extension';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultBackgroundExtension';

/**
 * in prev version background ext is higher than font ext. now turing back lower than font ext.
 * font ext z-index is 30.
 */
const DOC_EXTENSION_Z_INDEX = 21;
const PRINTING_Z_INDEX = 21;

interface IRenderBGContext {
    ctx: UniverRenderingContext;
    spreadsheetSkeleton: SpreadsheetSkeleton;
    backgroundPositions: ObjectMatrix<ICellWithCoord>;
    checkOutOfViewBound: boolean;
    backgroundPaths: Path2D;
    scaleX: number;
    scaleY: number;
    viewRanges: IRange[];
    diffRanges: IRange[];
    cellInfo: ICellWithCoord;
}

export class Background extends SheetExtension {
    override uKey = UNIQUE_KEY;

    override Z_INDEX = DOC_EXTENSION_Z_INDEX;

    PRINTING_Z_INDEX = PRINTING_Z_INDEX;

    override get zIndex() {
        return (this.parent as Spreadsheet)?.isPrinting ? this.PRINTING_Z_INDEX : this.Z_INDEX;
    }

    // eslint-disable-next-line max-lines-per-function
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
        const renderBGContext = {
            ctx,
            backgroundPositions,
            scaleX,
            scaleY,
            checkOutOfViewBound,
            viewRanges,
            diffRanges,
            spreadsheetSkeleton,
        } as IRenderBGContext;

        const mergeRanges: IRange[] = [];
        // Currently, viewRanges has only one range.
        viewRanges.forEach((range) => {
            // For merge cell.
            // The background extension is not as strict as the font extension; the font extension must never be redrawn. Therefore, it is not necessary to be that complex.
            const intersectMergeRangesInViewRanges = spreadsheetSkeleton.worksheet.getMergedCellRange(range.startRow, range.startColumn, range.endRow, range.endColumn);
            mergeRanges.push(...intersectMergeRangesInViewRanges);
        });

        const renderBGCore = (rgb: string) => {
            const bgColorMatrix = bgMatrixCacheByColor[rgb];
            const rangeForEachFn = (row: number, col: number, bgConfigParam?: string) => {
                const index = spreadsheetSkeleton.worksheet.getSpanModel().getMergeDataIndex(row, col);
                if (index !== -1) {
                    return;
                }
                const cellInfo = spreadsheetSkeleton.getCellByIndexWithNoHeader(row, col);
                if (!cellInfo) return;
                const bgConfig = bgConfigParam || bgColorMatrix.getValue(row, col);
                if (bgConfig) {
                    renderBGContext.cellInfo = cellInfo;
                    this.renderBGByCell(renderBGContext, row, col);
                }
            };

            ctx.fillStyle = rgb || getColor([255, 255, 255])!;
            const backgroundPaths = new Path2D();
            renderBGContext.backgroundPaths = backgroundPaths;
            ctx.beginPath();

            const matrixSize = bgColorMatrix.getSizeOf();
            const cellCountInRanges = viewRanges.reduce((sum, range) => {
                return sum + (range.endRow - range.startRow) * (range.endColumn - range.startColumn);
            }, 0);
            // if number of cells in range is over than bg config in matrix, renderBackground by matrix.
            // otherwise, renderBackground by cells in viewRange.
            if (cellCountInRanges < matrixSize) {
                // Currently, viewRanges has only one range.
                viewRanges.forEach((range) => {
                    Range.foreach(range, rangeForEachFn);
                });
            } else {
                bgColorMatrix.forValue(rangeForEachFn);
            }
            ctx.fill(backgroundPaths);
            ctx.closePath();
        };

        const renderBGForMergedCells = (rgb: string) => {
            const bgColorMatrix = bgMatrixCacheByColor[rgb];
            ctx.fillStyle = rgb || getColor([255, 255, 255])!;
            const backgroundPaths = new Path2D();
            renderBGContext.backgroundPaths = backgroundPaths;
            ctx.beginPath();
            mergeRanges.forEach((range) => {
                // bgConfig is required to be checked in each color loop.
                const bgConfig = bgColorMatrix.getValue(range.startRow, range.startColumn);
                if (bgConfig) {
                    const cellInfo = spreadsheetSkeleton.getCellWithCoordByIndex(range.startRow, range.startColumn, false);
                    if (!cellInfo) return;
                    renderBGContext.cellInfo = cellInfo;
                    this.renderBGByCell(renderBGContext, range.startRow, range.startColumn);
                }
            });
            ctx.fill(backgroundPaths);
            ctx.closePath();
        };

        const rgbList = Object.keys(bgMatrixCacheByColor);

        for (let index = 0; index < rgbList.length; index++) {
            const rgb = rgbList[index];
            renderBGCore(rgb);
            renderBGForMergedCells(rgb);
        }
        ctx.restore();
    }

    renderBGByCell(bgContext: IRenderBGContext, row: number, col: number) {
        const { spreadsheetSkeleton, backgroundPaths, scaleX, scaleY, viewRanges, diffRanges, cellInfo } = bgContext;

        let { startY, endY, startX, endX } = cellInfo;
        const { isMerged, isMergedMainCell, mergeInfo } = cellInfo;
        const renderRange = diffRanges && diffRanges.length > 0 ? diffRanges : viewRanges;

        // isMerged isMergedMainCell are mutually exclusive. isMerged true then isMergedMainCell false.
        // isMergedMainCell has draw all other merged cells, no need draw again.
        // For merged cells, and the current cell is the top-left cell in the merged region.
        startY = mergeInfo.startY;
        endY = mergeInfo.endY;
        startX = mergeInfo.startX;
        endX = mergeInfo.endX;

        // If curr cell is not in the viewrange (viewport + merged cells), exit early.
        if ((!isMerged && !isMergedMainCell) && !inViewRanges(renderRange!, row, col)) {
            return true;
        }

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
}

SpreadsheetExtensionRegistry.add(Background);
