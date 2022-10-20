import { Workbook } from '@univer/core';

export function SetNumfmtCoords(workbook: Workbook, sheetId: string, row: number, column: number, numfmt: string): string {
    let worksheet = workbook.getSheetBySheetId(sheetId);
    let orderNumfmt: string = '';
    if (worksheet) {
        const worksheetCellMatrix = worksheet.getCellMatrix();
        const cell = worksheetCellMatrix.getValue(row, column);
        if (cell) {
            orderNumfmt = cell.m ?? '';
            cell.m = numfmt;
        } else {
            orderNumfmt = '';
            worksheetCellMatrix.setValue(row, column, { m: numfmt });
        }
    }
    return orderNumfmt;
}
