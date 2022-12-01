import { ObjectMatrix, ObjectMatrixPrimitiveType, Workbook } from '@univer/core';
import { NumfmtPlugin } from '../../NumfmtPlugin';
import { NUMFMT_PLUGIN_NAME } from '../../Basic/Const';

export function SetNumfmtRangeData(workbook: Workbook, sheetId: string, numfmtPrimitiveMatrix: ObjectMatrixPrimitiveType<string>): ObjectMatrixPrimitiveType<string> {
    const context = workbook.getContext();
    const manager = context.getPluginManager();
    const numfmtPlugin = manager.getPluginByName(NUMFMT_PLUGIN_NAME) as NumfmtPlugin;
    const numfmtConfig = numfmtPlugin.getNumfmtBySheetIdConfig(sheetId);
    const currSheetNumfmtMatrix = new ObjectMatrix(numfmtConfig);
    const olderSheetNumfmtMatrix = new ObjectMatrix<string>();
    new ObjectMatrix(numfmtPrimitiveMatrix).forValue((r, c, value) => {
        const olderValue = currSheetNumfmtMatrix.getValue(r, c);
        currSheetNumfmtMatrix.setValue(r, c, value);
        olderSheetNumfmtMatrix.setValue(r, c, olderValue);
    });
    return olderSheetNumfmtMatrix.toJSON();
}
