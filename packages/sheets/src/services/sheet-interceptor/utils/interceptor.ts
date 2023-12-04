import type { Workbook, Worksheet } from '@univerjs/core';

export interface ISheetLocation {
    workbook: Workbook;
    worksheet: Worksheet;
    workbookId: string;
    worksheetId: string;
    row: number;
    col: number;
}
