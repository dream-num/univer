import { PLUGIN_NAMES, Tools, Worksheet } from '@univer/core';
import { SpreadsheetPlugin } from '../..';
import { ISelectionModelValue } from '../Action/SetSelectionValueAction';

/**
 * The rendering component has been initialized with default data in SelectionControl, and the data is stored separately here
 * @param worksheet
 * @param activeRangeList
 * @param activeRange
 * @param currentCell
 * @returns
 *
 * @internal
 */
export function SetSelectionValue(worksheet: Worksheet, selections: ISelectionModelValue[]): ISelectionModelValue[] {
    const currentControls = worksheet.getContext().getPluginManager().getPluginByName<SpreadsheetPlugin>(PLUGIN_NAMES.SPREADSHEET)?.getSelectionManager().getCurrentControls();

    const result: ISelectionModelValue[] = [];

    if (!currentControls) return [];

    currentControls.forEach((control, i) => {
        const { selection, cell } = selections[i];
        result.push({
            selection: Tools.deepClone(selection),
            cell: Tools.deepClone(cell),
        });
        control.updateModel(selection, cell);
    });

    return result;
}
