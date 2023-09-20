import { ISelectionRange } from '@univerjs/core';

import { getCellByIndex } from '../../../Basics/Tools';
import { ComponentExtension } from '../../Extension';
import { SpreadsheetSkeleton } from '../SheetSkeleton';

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
        dataMergeCache: ISelectionRange[]
    ) {
        return getCellByIndex(rowIndex, columnIndex, rowHeightAccumulation, columnWidthAccumulation, dataMergeCache);
    }
}
