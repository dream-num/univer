import { IScale, numberToABC } from '@univerjs/core';

import { MIDDLE_CELL_POS_MAGIC_NUMBER } from '../../../Basics/Const';
import { fixLineWidthByScale, getColor } from '../../../Basics/Tools';
import { SheetColumnHeaderExtensionRegistry } from '../../Extension';
import { SpreadsheetSkeleton } from '../SheetSkeleton';
import { SheetExtension } from './SheetExtension';

const UNIQUE_KEY = 'DefaultColumnHeaderLayoutExtension';

export class ColumnHeaderLayout extends SheetExtension {
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
        ctx.fillRect(0, 0, columnTotalWidth, columnHeaderHeight);
        ctx.textAlign = 'center'; // 文字水平居中
        ctx.textBaseline = 'middle'; // 文字垂直居中
        ctx.fillStyle = getColor([0, 0, 0])!; // 文字颜色
        ctx.beginPath();
        ctx.lineWidth = 1 / scale;
        ctx.strokeStyle = getColor([217, 217, 217])!;
        let preColumnPosition = 0;
        const columnWidthAccumulationLength = columnWidthAccumulation.length;
        for (let c = startColumn - 1; c <= endColumn; c++) {
            if (c < 0 || c > columnWidthAccumulationLength - 1) {
                continue;
            }
            const columnEndPosition = fixLineWidthByScale(columnWidthAccumulation[c], scale);
            if (preColumnPosition === columnEndPosition) {
                // 跳过隐藏行
                continue;
            }
            ctx.moveTo(columnEndPosition, 0);
            ctx.lineTo(columnEndPosition, columnHeaderHeight);

            const middleCellPos = preColumnPosition + (columnEndPosition - preColumnPosition) / 2;
            ctx.fillText(numberToABC(c), middleCellPos, columnHeaderHeight / 2 + MIDDLE_CELL_POS_MAGIC_NUMBER); // 魔法数字1，因为垂直对齐看起来差1像素
            preColumnPosition = columnEndPosition;
        }

        const columnHeaderHeightFix = fixLineWidthByScale(columnHeaderHeight, scale);
        ctx.moveTo(0, columnHeaderHeightFix);
        ctx.lineTo(columnTotalWidth, columnHeaderHeightFix);
        ctx.stroke();
    }
}

SheetColumnHeaderExtensionRegistry.add(new ColumnHeaderLayout());
