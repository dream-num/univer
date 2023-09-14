import { IScale } from '@univerjs/core';

import { MIDDLE_CELL_POS_MAGIC_NUMBER } from '../../../Basics/Const';
import { fixLineWidthByScale, getColor } from '../../../Basics/Tools';
import { SheetRowTitleExtensionRegistry } from '../../Extension';
import { SpreadsheetSkeleton } from '../SheetSkeleton';
import { SheetExtension } from './SheetExtension';

const UNIQUE_KEY = 'DefaultRowTitleLayoutExtension';

export class RowTitleLayout extends SheetExtension {
    override uKey = UNIQUE_KEY;

    override zIndex = 10;

    override draw(ctx: CanvasRenderingContext2D, parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton) {
        const { rowColumnSegment, rowTitleWidth = 0, columnTitleHeight = 0 } = spreadsheetSkeleton;
        const { startRow, endRow, startColumn, endColumn } = rowColumnSegment;
        if (!spreadsheetSkeleton) {
            return;
        }

        const { rowHeightAccumulation, columnTotalWidth, columnWidthAccumulation, rowTotalHeight } = spreadsheetSkeleton;

        if (!rowHeightAccumulation || !columnWidthAccumulation || columnTotalWidth === undefined || rowTotalHeight === undefined) {
            return;
        }

        const scale = this._getScale(parentScale);
        ctx.fillStyle = getColor([248, 249, 250])!;
        ctx.fillRect(0, 0, rowTitleWidth, rowTotalHeight);
        ctx.textAlign = 'center'; // 文字水平居中
        ctx.textBaseline = 'middle'; // 文字垂直居中
        ctx.fillStyle = getColor([0, 0, 0])!; // 文字颜色
        ctx.beginPath();
        ctx.lineWidth = 1 / scale;
        ctx.strokeStyle = getColor([217, 217, 217])!;
        let preRowPosition = 0;
        const rowHeightAccumulationLength = rowHeightAccumulation.length;
        for (let r = startRow - 1; r <= endRow; r++) {
            if (r < 0 || r > rowHeightAccumulationLength - 1) {
                continue;
            }
            const rowEndPosition = fixLineWidthByScale(rowHeightAccumulation[r], scale);
            if (preRowPosition === rowEndPosition) {
                // 跳过隐藏行
                continue;
            }
            ctx.moveTo(0, rowEndPosition);
            ctx.lineTo(rowTitleWidth, rowEndPosition);

            const middleCellPos = preRowPosition + (rowEndPosition - preRowPosition) / 2;
            ctx.fillText(`${r + 1}`, rowTitleWidth / 2, middleCellPos + MIDDLE_CELL_POS_MAGIC_NUMBER); // 魔法数字1，因为垂直对齐看起来差1像素
            preRowPosition = rowEndPosition;
        }
        // console.log('xx2', rowColumnIndexRange, bounds, this._rowTotalHeight, this._rowHeightAccumulation);

        ctx.moveTo(fixLineWidthByScale(rowTitleWidth, scale), 0);
        ctx.lineTo(fixLineWidthByScale(rowTitleWidth, scale), rowTotalHeight);
        ctx.stroke();
    }
}

SheetRowTitleExtensionRegistry.add(new RowTitleLayout());
