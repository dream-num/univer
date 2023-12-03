import { IScale } from '@univerjs/core';

import { DEFAULT_FONTFACE_PLANE, MIDDLE_CELL_POS_MAGIC_NUMBER } from '../../../basics/const';
import { fixLineWidthByScale, getColor } from '../../../basics/tools';
import { SheetRowHeaderExtensionRegistry } from '../../extension';
import { SpreadsheetSkeleton } from '../sheet-skeleton';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultRowHeaderLayoutExtension';

export class RowHeaderLayout extends SheetExtension {
    override uKey = UNIQUE_KEY;

    override zIndex = 10;

    override draw(ctx: CanvasRenderingContext2D, parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton) {
        const { rowColumnSegment, rowHeaderWidth = 0, columnHeaderHeight = 0 } = spreadsheetSkeleton;
        const { startRow, endRow, startColumn, endColumn } = rowColumnSegment;
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

        const scale = this._getScale(parentScale);
        ctx.fillStyle = getColor([248, 249, 250])!;
        ctx.fillRect(0, 0, rowHeaderWidth, rowTotalHeight);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = getColor([0, 0, 0])!;
        ctx.beginPath();
        ctx.lineWidth = 1 / scale;
        ctx.strokeStyle = getColor([217, 217, 217])!;
        ctx.font = `13px ${DEFAULT_FONTFACE_PLANE}`;
        let preRowPosition = 0;
        const rowHeightAccumulationLength = rowHeightAccumulation.length;
        for (let r = startRow - 1; r <= endRow; r++) {
            if (r < 0 || r > rowHeightAccumulationLength - 1) {
                continue;
            }
            const rowEndPosition = fixLineWidthByScale(rowHeightAccumulation[r], scale);
            if (preRowPosition === rowEndPosition) {
                // Skip hidden rows
                continue;
            }
            ctx.moveTo(0, rowEndPosition);
            ctx.lineTo(rowHeaderWidth, rowEndPosition);

            const middleCellPos = preRowPosition + (rowEndPosition - preRowPosition) / 2;
            ctx.fillText(`${r + 1}`, rowHeaderWidth / 2, middleCellPos + MIDDLE_CELL_POS_MAGIC_NUMBER); // Magic number 1, because the vertical alignment appears to be off by 1 pixel.
            preRowPosition = rowEndPosition;
        }
        // console.log('xx2', rowColumnIndexRange, bounds, this._rowTotalHeight, this._rowHeightAccumulation);

        ctx.moveTo(fixLineWidthByScale(rowHeaderWidth, scale), 0);
        ctx.lineTo(fixLineWidthByScale(rowHeaderWidth, scale), rowTotalHeight);
        ctx.stroke();
    }
}

SheetRowHeaderExtensionRegistry.add(new RowHeaderLayout());
