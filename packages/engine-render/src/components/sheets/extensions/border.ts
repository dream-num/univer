import { BorderStyleTypes, IRange, IScale, ObjectMatrix } from '@univerjs/core';

import { BORDER_TYPE, COLOR_BLACK_RGB } from '../../../basics/const';
import { drawLineByBorderType, getLineWidth, setLineType } from '../../../basics/draw';
import { fixLineWidthByScale } from '../../../basics/tools';
import { SpreadsheetExtensionRegistry } from '../../extension';
import { BorderCacheItem } from '../interfaces';
import { SpreadsheetSkeleton } from '../sheet-skeleton';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultBorderExtension';

export class Border extends SheetExtension {
    override uKey = UNIQUE_KEY;

    override zIndex = 30;

    override draw(ctx: CanvasRenderingContext2D, parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton) {
        const { rowColumnSegment, rowHeaderWidth, columnHeaderHeight, dataMergeCache, stylesCache, overflowCache } =
            spreadsheetSkeleton;
        const { border } = stylesCache;
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
        const scale = this._getScale(parentScale);
        // const fixPointFive = fixLineWidthByScale(0.5, scale);

        let preStyle: BorderStyleTypes;
        let preColor: string;

        border?.forEach((rowIndex, borderColumns) => {
            borderColumns?.forEach((columnIndex: number, borderCaches) => {
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

                    if (this._getOverflowExclusion(overflowCache, type, rowIndex, columnIndex)) {
                        continue;
                    }

                    if (style !== preStyle) {
                        setLineType(ctx, style);
                        ctx.lineWidth = getLineWidth(style) / scale;
                        preStyle = style;
                    }

                    if (color !== preColor) {
                        ctx.strokeStyle = color || COLOR_BLACK_RGB;
                        preColor = color;
                    }

                    drawLineByBorderType(ctx, type, { startX, startY, endX, endY });
                }
            });
        });

        ctx.closePath();
        ctx.restore();
    }

    private _getOverflowExclusion(
        overflowCache: ObjectMatrix<IRange>,
        type: BORDER_TYPE,
        borderRow: number,
        borderColumn: number
    ) {
        let isDraw = false;
        if (type === BORDER_TYPE.TOP || type === BORDER_TYPE.BOTTOM) {
            return isDraw;
        }
        overflowCache &&
            overflowCache.forEach((row, rowArray) => {
                if (row !== borderRow) {
                    return true;
                }
                rowArray.forEach((column, rectangle) => {
                    const { startColumn, endColumn } = rectangle;
                    if (type === BORDER_TYPE.LEFT && column > startColumn && column <= endColumn) {
                        isDraw = true;
                        return false;
                    }

                    if (type === BORDER_TYPE.RIGHT && column >= startColumn && column < endColumn) {
                        isDraw = true;
                        return false;
                    }
                });
            });
        return isDraw;
    }
}

SpreadsheetExtensionRegistry.add(new Border());
