// import { fixLineWidthByScale, getColor, IScale } from '@Basics';
import { IScale } from '@univerjs/core';
import { SpreadsheetSkeleton } from '../SheetSkeleton';
import { SheetExtension } from './SheetExtension';

import { SpreadsheetExtensionRegistry } from '../../Extension';
import { fixLineWidthByScale, getColor } from '../../../Basics/Tools';

const UNIQUE_KEY = 'DefaultBackgroundExtension';

export class Background extends SheetExtension {
    uKey = UNIQUE_KEY;

    zIndex = 20;

    draw(ctx: CanvasRenderingContext2D, parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton) {
        const { rowTitleWidth, columnTitleHeight, dataMergeCache, stylesCache } = spreadsheetSkeleton;
        const { background } = stylesCache;
        if (!spreadsheetSkeleton) {
            return;
        }

        const { rowHeightAccumulation, columnTotalWidth, columnWidthAccumulation, rowTotalHeight } = spreadsheetSkeleton;

        if (!rowHeightAccumulation || !columnWidthAccumulation || columnTotalWidth === undefined || rowTotalHeight === undefined) {
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
                        let { isMerged, startY, endY, startX, endX } = this.getCellIndex(rowIndex, columnIndex, rowHeightAccumulation, columnWidthAccumulation, dataMergeCache);

                        if (isMerged) {
                            return true;
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
