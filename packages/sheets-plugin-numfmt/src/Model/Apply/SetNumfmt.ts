import { Nullable, Workbook } from '@univer/core';
import { NumfmtPlugin } from '../../NumfmtPlugin';
import { NUMFMT_PLUGIN_NAME } from '../../Const/PLUGIN_NAME';

export function SetNumfmt(workbook: Workbook, sheetId: string, row: number, column: number) {
    const plugin: Nullable<NumfmtPlugin> = workbook.getContext().getPluginManager().getPluginByName(NUMFMT_PLUGIN_NAME);
    if (plugin) {
        plugin.getConfig(sheetId);
    }
}
