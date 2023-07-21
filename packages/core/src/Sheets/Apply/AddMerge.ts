import { IAddMergeActionData } from '../../Types/Interfaces/IActionModel';
import { IRangeData } from '../../Types/Interfaces/IRangeData';
import { SpreadsheetModel } from '../Model/SpreadsheetModel';

export function addMergeApply(model: SpreadsheetModel, data: IAddMergeActionData): IRangeData[] {
    let worksheet = model.worksheets[data.sheetId];
    if (worksheet) {
        let merge = worksheet.merge;
        let rectangles = data.rectangles;
        for (let i = 0; i < rectangles.length; i++) {
            merge.push(rectangles[i]);
        }
        return rectangles;
    }
    return [];
}
