import { ObjectMatrix, ObjectMatrixPrimitiveType, Workbook } from '@univerjs/core';

import { NumfmtController } from '../../Controller';

export function SetNumfmtRangeData(
    workbook: Workbook,
    sheetId: string,
    numfmtPrimitiveMatrix: ObjectMatrixPrimitiveType<string>,
    _numfmtController: NumfmtController
): ObjectMatrixPrimitiveType<string> {
    const numfmtConfig = _numfmtController.getNumfmtBySheetIdConfig(sheetId);
    const currSheetNumfmtMatrix = new ObjectMatrix(numfmtConfig);
    const olderSheetNumfmtMatrix = new ObjectMatrix<string>();
    new ObjectMatrix(numfmtPrimitiveMatrix).forValue((r, c, value) => {
        const olderValue = currSheetNumfmtMatrix.getValue(r, c);
        currSheetNumfmtMatrix.setValue(r, c, value);
        olderSheetNumfmtMatrix.setValue(r, c, olderValue);
    });
    return olderSheetNumfmtMatrix.toJSON();
}
