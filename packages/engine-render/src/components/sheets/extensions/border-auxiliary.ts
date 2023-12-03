import type { IRange, IScale } from '@univerjs/core';
import { BooleanNumber } from '@univerjs/core';

import { clearLineByBorderType, getLineWith } from '../../../basics/draw';
import { fixLineWidthByScale, getColor } from '../../../basics/tools';
import { SpreadsheetExtensionRegistry } from '../../extension';
import type { BorderCacheItem } from '../interfaces';
import type { SpreadsheetSkeleton } from '../sheet-skeleton';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultBorderAuxiliaryExtension';

export class BorderAuxiliary extends SheetExtension {
    override uKey = UNIQUE_KEY;

    override zIndex = 10;

    override draw(ctx: CanvasRenderingContext2D, parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton) {
        const {
            rowColumnSegment,
            rowHeaderWidth = 0,
            columnHeaderHeight = 0,
            dataMergeCache,
            overflowCache,
            stylesCache,
            showGridlines,
        } = spreadsheetSkeleton;
        const { border } = stylesCache;
        const { startRow, endRow, startColumn, endColumn } = rowColumnSegment;
        if (!spreadsheetSkeleton || showGridlines === BooleanNumber.FALSE) {
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
        const scale = this._getScale(parentScale);
        ctx.beginPath();
        ctx.lineWidth = getLineWith(1) / scale;
        ctx.strokeStyle = getColor([212, 212, 212]);
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

        const { scaleX = 1, scaleY = 1 } = parentScale;

        // Clearing the dashed line issue caused by overlaid auxiliary lines and strokes
        border?.forValue((rowIndex, columnIndex, borderCaches) => {
            if (!borderCaches) {
                return true;
            }

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

            for (const key in borderCaches) {
                const { type, style, color } = borderCaches[key] as BorderCacheItem;

                // if (color.indexOf('255,255,255') === -1 || color.toLocaleLowerCase() !== '#ffffff') {
                //     continue;
                // }

                clearLineByBorderType(ctx, type, { startX, startY, endX, endY }, scaleX, scaleY);
            }
        });
        ctx.closePath();
        // merge cell
        this._clearRectangle(ctx, scale, rowHeightAccumulation, columnWidthAccumulation, dataMergeCache);

        // overflow cell
        this._clearRectangle(ctx, scale, rowHeightAccumulation, columnWidthAccumulation, overflowCache.toNativeArray());
        ctx.restore();
    }

    /**
     * Clear the guide lines within a range in the table, to make room for merged cells and overflow.
     */
    private _clearRectangle(
        ctx: CanvasRenderingContext2D,
        scale: number,
        rowHeightAccumulation: number[],
        columnWidthAccumulation: number[],
        dataMergeCache?: IRange[]
    ) {
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
