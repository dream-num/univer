import { PLUGIN_NAMES, Worksheet } from '@univerjs/core';
import { SheetPlugin } from '../..';
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
    const selectionManager = worksheet.getContext().getPluginManager().getRequirePluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET).getSelectionManager();

    const result = selectionManager.getCurrentModelsValue();

    selectionManager.setModels(selections);

    return result;
}
