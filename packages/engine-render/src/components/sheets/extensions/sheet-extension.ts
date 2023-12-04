import type { IRange } from '@univerjs/core';

import { getCellByIndex } from '../../../basics/tools';
import { ComponentExtension } from '../../extension';
import type { SpreadsheetSkeleton } from '../sheet-skeleton';

export enum SHEET_EXTENSION_TYPE {
    GRID,
}

export class SheetExtension extends ComponentExtension<SpreadsheetSkeleton, SHEET_EXTENSION_TYPE> {
    override type = SHEET_EXTENSION_TYPE.GRID;

    getCellIndex(
        rowIndex: number,
        columnIndex: number,
        rowHeightAccumulation: number[],
        columnWidthAccumulation: number[],
        dataMergeCache: IRange[]
    ) {
        return getCellByIndex(rowIndex, columnIndex, rowHeightAccumulation, columnWidthAccumulation, dataMergeCache);
    }
}
