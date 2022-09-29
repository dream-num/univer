import { BorderStyleTypes, IRangeData, ObjectMatrix } from '@univer/core';
import { BorderCacheItem } from '../Interfaces';
import { fixLineWidthByScale } from '../../../Base/Tools';
import { SpreadsheetSkeleton } from '../SheetSkeleton';
import { SheetExtension } from './SheetExtension';
import { IScale } from '../../../Base/Interfaces';
import { BORDER_TYPE, COLOR_BLACK_RGB } from '../../../Base/Const';
import { SpreadsheetExtensionRegistry } from '../../Extension';
import { drawLineByBorderType, getLineWidth, setLineType } from '../../../Base/Draw';

const UNIQUE_KEY = 'DefaultBorderExtension';

export class Border extends SheetExtension {
    uKey = UNIQUE_KEY;

    zIndex = 30;

    draw(ctx: CanvasRenderingContext2D, parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton) {
        const { rowColumnSegment, rowTitleWidth, columnTitleHeight, dataMergeCache, stylesCache, overflowCache } = spreadsheetSkeleton;
        const { border } = stylesCache;
        if (!spreadsheetSkeleton) {
            return;
        }

        const { rowHeightAccumulation, columnTotalWidth, columnWidthAccumulation, rowTotalHeight } = spreadsheetSkeleton;

        if (!rowHeightAccumulation || !columnWidthAccumulation || columnTotalWidth === undefined || rowTotalHeight === undefined) {
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

                let { isMerged, startY, endY, startX, endX } = this.getCellIndex(rowIndex, columnIndex, rowHeightAccumulation, columnWidthAccumulation, dataMergeCache);

                if (isMerged) {
                    return true;
                }

                startY = fixLineWidthByScale(startY, scaleY);
                endY = fixLineWidthByScale(endY, scaleY);
                startX = fixLineWidthByScale(startX, scaleX);
                endX = fixLineWidthByScale(endX, scaleX);

                for (let key in borderCaches) {
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

    private _getOverflowExclusion(overflowCache: ObjectMatrix<IRangeData>, type: BORDER_TYPE, borderRow: number, borderColumn: number) {
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
