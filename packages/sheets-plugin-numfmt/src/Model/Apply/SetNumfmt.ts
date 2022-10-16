import { Nullable, ObjectMatrix, Workbook } from '@univer/core';
import { NumfmtPlugin } from '../../NumfmtPlugin';
import { NUMFMT_PLUGIN_NAME } from '../../Const/PLUGIN_NAME';

export function SetNumfmt(workbook: Workbook, sheetId: string, row: number, column: number, value: string) {
    const numfmtPlugin: Nullable<NumfmtPlugin> = workbook.getContext().getPluginManager().getPluginByName(NUMFMT_PLUGIN_NAME);
    if (numfmtPlugin) {
        const primitive = numfmtPlugin.getConfig(sheetId);
        const matrix = new ObjectMatrix(primitive);
        matrix.setValue(row, column, {
            numfmt: value,
            change: true,
            value: String(),
            color: String(),
        });
    }
}
