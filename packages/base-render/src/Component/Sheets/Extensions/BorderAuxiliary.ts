import { BooleanNumber, IRangeData, IScale } from '@univerjs/core';

import { fixLineWidthByScale, getColor } from '../../../Basics/Tools';
import { SpreadsheetExtensionRegistry } from '../../Extension';
import { SpreadsheetSkeleton } from '../SheetSkeleton';
import { SheetExtension } from './SheetExtension';

const UNIQUE_KEY = 'DefaultBorderAuxiliaryExtension';

export class BorderAuxiliary extends SheetExtension {
    override uKey = UNIQUE_KEY;

    override zIndex = 10;

    override draw(ctx: CanvasRenderingContext2D, parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton) {
        const { rowColumnSegment, rowTitleWidth = 0, columnTitleHeight = 0, dataMergeCache, overflowCache, stylesCache, showGridlines } = spreadsheetSkeleton;

        const { startRow, endRow, startColumn, endColumn } = rowColumnSegment;
        if (!spreadsheetSkeleton || showGridlines === BooleanNumber.FALSE) {
            return;
        }

        const { rowHeightAccumulation, columnTotalWidth, columnWidthAccumulation, rowTotalHeight } = spreadsheetSkeleton;

        if (!rowHeightAccumulation || !columnWidthAccumulation || columnTotalWidth === undefined || rowTotalHeight === undefined) {
            return;
        }

        ctx.save();
        const scale = this._getScale(parentScale);
        ctx.beginPath();
        ctx.lineWidth = 1 / scale;
        ctx.strokeStyle = getColor([217, 217, 217])!;
        const width = fixLineWidthByScale(columnTotalWidth, scale);
        const height = fixLineWidthByScale(rowTotalHeight, scale);
        const columnWidthAccumulationLength = columnWidthAccumulation.length;
        const rowHeightAccumulationLength = rowHeightAccumulation.length;
        for (let r = startRow - 1; r <= endRow; r++) {
            if (r < 0 || r > rowHeightAccumulationLength - 1) {
                continue;
            }
            const rowEndPosition = fixLineWidthByScale(rowHeightAccumulation[r], scale);
            ctx.moveTo(0, rowEndPosition);
            ctx.lineTo(width, rowEndPosition);
        }

        for (let c = startColumn; c <= endColumn; c++) {
            if (c < 0 || c > columnWidthAccumulationLength - 1) {
                continue;
            }
            const columnEndPosition = fixLineWidthByScale(columnWidthAccumulation[c], scale);
            ctx.moveTo(columnEndPosition, 0);
            ctx.lineTo(columnEndPosition, height);
        }
        // console.log('xx2', scaleX, scaleY, columnTotalWidth, rowTotalHeight, rowHeightAccumulation, columnWidthAccumulation);
        ctx.stroke();
        ctx.closePath();

        this._clearRectangle(ctx, scale, rowHeightAccumulation, columnWidthAccumulation, dataMergeCache);

        this._clearRectangle(ctx, scale, rowHeightAccumulation, columnWidthAccumulation, overflowCache.toNativeArray());
        ctx.restore();
    }

    private _clearRectangle(ctx: CanvasRenderingContext2D, scale: number, rowHeightAccumulation: number[], columnWidthAccumulation: number[], dataMergeCache?: IRangeData[]) {
        if (dataMergeCache == null) {
            return;
        }
        for (const dataCache of dataMergeCache) {
            const { startRow, endRow, startColumn, endColumn } = dataCache;

            const startY = fixLineWidthByScale(rowHeightAccumulation[startRow - 1] || 0, scale);
            const endY = fixLineWidthByScale(rowHeightAccumulation[endRow], scale);

            const startX = fixLineWidthByScale(columnWidthAccumulation[startColumn - 1] || 0, scale);
            const endX = fixLineWidthByScale(columnWidthAccumulation[endColumn], scale);

            ctx.clearRect(startX, startY, endX - startX, endY - startY);

            // After ClearRect, the lines will become thinner, and the lines will be repaired below.
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, startY);
            ctx.lineTo(endX, endY);
            ctx.lineTo(startX, endY);
            ctx.lineTo(startX, startY);
            ctx.stroke();
            ctx.closePath();
        }

        // dataMergeCache?.forEach((r, dataMergeRow) => {
        //     dataMergeRow?.forEach((c, dataCache) => {

        //     });
        // });
    }
}

SpreadsheetExtensionRegistry.add(new BorderAuxiliary());
