import { Worksheet } from '@univerjs/core';
import { SelectionManager } from '../..';
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
export function SetSelectionValue(_worksheet: Worksheet, selections: ISelectionModelValue[], _selectionManager: SelectionManager): ISelectionModelValue[] {
    const result = _selectionManager.getCurrentModelsValue();
    _selectionManager.setModels(selections);
    return result;
}
