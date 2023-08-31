import { Merges } from '../Domain/Merges';
import { IRangeData } from '../../Types/Interfaces';
import { CommandUnit } from '../../Command';
import { IAddMergeActionData } from '../Action';

/**
 *
 * @param merges
 * @param rectangles
 * @returns
 *
 * @internal
 */
export function addMerge(merges: Merges, rectangles: IRangeData[]): IRangeData[] {
    const remove: IRangeData[] = [];
    for (let i = 0; i < rectangles.length; i++) {
        merges.add(rectangles[i]);
        // remove = remove.concat(merges.add(rectangles[i]));
    }
    return remove;
}

export function addMergeApply(unit: CommandUnit, data: IAddMergeActionData): IRangeData[] {
    const worksheet = unit?.WorkBookUnit?.getSheetBySheetId(data.sheetId);
    if (worksheet) {
        const config = worksheet.getConfig();
        const mergeConfigData = config.mergeData;
        const mergeAppendData = data.rectangles;
        for (let i = 0; i < mergeAppendData.length; i++) {
            mergeConfigData.push(mergeAppendData[i]);
        }
        return mergeAppendData;
    }
    return [];
}
