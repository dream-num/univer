// import { fixLineWidthByScale, getColor, IScale } from '@Basics';
import { IScale } from '@univerjs/core';

import { fixLineWidthByScale, getColor } from '../../../basics/tools';
import { SpreadsheetExtensionRegistry } from '../../extension';
import { SpreadsheetSkeleton } from '../sheet-skeleton';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultBackgroundExtension';

export class Background extends SheetExtension {
    override uKey = UNIQUE_KEY;

    override zIndex = 20;

    override draw(ctx: CanvasRenderingContext2D, parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton) {
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
