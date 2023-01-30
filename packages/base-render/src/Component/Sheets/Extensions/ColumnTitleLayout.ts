import { numberToABC, IScale } from '@univerjs/core';
import { fixLineWidthByScale, getColor } from '../../../Basics/Tools';
import { MIDDLE_CELL_POS_MAGIC_NUMBER } from '../../../Basics/Const';
import { SpreadsheetSkeleton } from '../SheetSkeleton';
import { SheetExtension } from './SheetExtension';
import { SheetColumnTitleExtensionRegistry } from '../../Extension';

const UNIQUE_KEY = 'DefaultColumnTitleLayoutExtension';

export class ColumnTitleLayout extends SheetExtension {
    uKey = UNIQUE_KEY;

    zIndex = 10;

    draw(ctx: CanvasRenderingContext2D, parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton) {
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
        ctx.fillRect(0, 0, columnTotalWidth, columnTitleHeight);
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
            ctx.lineTo(columnEndPosition, columnTitleHeight);

            const middleCellPos = preColumnPosition + (columnEndPosition - preColumnPosition) / 2;
            ctx.fillText(numberToABC(c), middleCellPos, columnTitleHeight / 2 + MIDDLE_CELL_POS_MAGIC_NUMBER); // 魔法数字1，因为垂直对齐看起来差1像素
            preColumnPosition = columnEndPosition;
        }

        const columnTitleHeightFix = fixLineWidthByScale(columnTitleHeight, scale);
        ctx.moveTo(0, columnTitleHeightFix);
        ctx.lineTo(columnTotalWidth, columnTitleHeightFix);
        ctx.stroke();
    }
}

SheetColumnTitleExtensionRegistry.add(new ColumnTitleLayout());
