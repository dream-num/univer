import { ISetSelectionActivateServiceData } from '../Action';
import { Worksheet1 } from '../Domain/Worksheet1';
import { IRangeData } from '../../Interfaces/IRangeData';

/**
 *
 * @param worksheet
 * @param activeRangeList
 * @param activeRange
 * @param currentCell
 * @returns
 *
 * @internal
 */
export function SetSelectionActivate(
    worksheet: Worksheet1,
    activeRangeList: IRangeData | IRangeData[],
    activeRange: IRangeData,
    currentCell: IRangeData
): ISetSelectionActivateServiceData {
    const selectionIns = worksheet.getSelection();

    const oldActiveRangeList = selectionIns.getActiveRangeList()?.getRangeList();
    const oldActiveRange = selectionIns.getActiveRange()?.getRangeData();
    const oldCurrentCell = selectionIns.getCurrentCell()?.getRangeData();

    // set multiple ranges from domain
    selectionIns.setRanges(activeRangeList, activeRange, currentCell);

    return {
        activeRangeList: oldActiveRangeList,
        activeRange: oldActiveRange,
        currentCell: oldCurrentCell,
    };
}
