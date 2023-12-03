import type { Worksheet } from '@univerjs/core';

/**
 * @param row after this row
 */
export function rowAcrossMergedCell(row: number, worksheet: Worksheet): boolean {
    return worksheet.getMergeData().some((mergedCell) => mergedCell.startRow < row && row <= mergedCell.endRow);
}

export function columnAcrossMergedCell(col: number, worksheet: Worksheet): boolean {
    return worksheet.getMergeData().some((mergedCell) => mergedCell.startColumn < col && col <= mergedCell.endColumn);
}
