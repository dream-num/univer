import { Rectangle } from '../../Shared/Rectangle';
import { IRemoveMergeActionData } from '../../Types/Interfaces/ISheetActionInterfaces';
import { IRangeData } from '../../Types/Interfaces/IRangeData';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

export function RemoveMergeApply(model: SpreadsheetModel, data: IRemoveMergeActionData): IRangeData[] {
    let worksheet = model.worksheets[data.sheetId];
    if (worksheet) {
        let remove: IRangeData[] = [];
        let mergeConfigData = worksheet.merge;
        let mergeRemoveData = data.rectangles;
        for (let j = 0; j < mergeRemoveData.length; j++) {
            for (let i = mergeConfigData.length - 1; i >= 0; i--) {
                let configMerge = mergeConfigData[i];
                let removeMerge = mergeRemoveData[j];
                if (Rectangle.intersects(configMerge, removeMerge)) {
                    remove.push(mergeConfigData.splice(i, 1)[0]);
                }
            }
        }
        return remove;
    }
    return [];
}
