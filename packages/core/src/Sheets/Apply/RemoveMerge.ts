import { Merges } from '../Domain/Merges';
import { IRangeData } from '../../Interfaces';
import { CommandUnit } from '../../Command';
import { IRemoveMergeActionData } from '../Action';
import { Rectangle } from '../../Shared';

/**
 *
 * @param merges
 * @param rectangles
 * @returns
 *
 * @internal
 */
export function RemoveMerge(merges: Merges, rectangles: IRangeData[]): IRangeData[] {
    let remove: IRangeData[] = [];
    for (let i = 0; i < rectangles.length; i++) {
        remove = remove.concat(merges.remove(rectangles[i]));
    }
    return remove;
}

export function RemoveMergeApply(
    unit: CommandUnit,
    data: IRemoveMergeActionData
): IRangeData[] {
    let worksheet = unit.WorkBookUnit!.getSheetBySheetId(data.sheetId);
    if (worksheet) {
        let config = worksheet.getConfig();
        let remove: IRangeData[] = [];
        let mergeConfigData = config.mergeData;
        let mergeRemoveData = data.rectangles;
        for (let i = mergeConfigData.length - 1; i >= 0; i--) {
            let configMerge = mergeConfigData[i];
            let removeMerge = mergeRemoveData[i];
            if (Rectangle.equals(configMerge, removeMerge)) {
                remove.push(removeMerge);
                mergeConfigData.splice(i, 1);
            }
        }
        return remove;
    }
    return [];
}
