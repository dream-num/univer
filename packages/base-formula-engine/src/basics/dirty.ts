import { IUnitRange } from '@univerjs/core';

export function isInDirtyRange(
    dirtyRanges: IUnitRange[],
    unitId: string,
    sheetId: string,
    row: number,
    column: number
) {
    for (let i = 0, len = dirtyRanges.length; i < len; i++) {
        const dirtyRange = dirtyRanges[i];
        if (unitId !== dirtyRange.unitId) {
            continue;
        }

        if (sheetId !== dirtyRange.sheetId) {
            continue;
        }

        const { startRow, startColumn, endRow, endColumn } = dirtyRange.range;

        if (row >= startRow && row <= endRow && column >= startColumn && column <= endColumn) {
            return true;
        }
    }

    return false;
}
