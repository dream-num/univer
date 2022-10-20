import { ObjectMatrix, ObjectMatrixPrimitiveType, Workbook } from '@univer/core/src';

export function SetNumfmtRange(workbook: Workbook, sheetId: string, numfmtMatrix: ObjectMatrixPrimitiveType<string>): ObjectMatrixPrimitiveType<string> {
    const orderNumfmtMatrix = new ObjectMatrix<string>();
    const currNumfmtMatrix = new ObjectMatrix(numfmtMatrix);
    const worksheet = workbook.getSheetBySheetId(sheetId);
    if (worksheet) {
        const worksheetCellMatrix = worksheet.getCellMatrix();
        currNumfmtMatrix.forValue((r, c, m) => {
            const cell = worksheetCellMatrix.getValue(r, c);
            if (cell) {
                orderNumfmtMatrix.setValue(r, c, cell.m);
                cell.m = m;
            } else {
                orderNumfmtMatrix.setValue(r, c, '');
                worksheetCellMatrix.setValue(r, c, { m });
            }
        });
    }
    return orderNumfmtMatrix.toJSON();
}
