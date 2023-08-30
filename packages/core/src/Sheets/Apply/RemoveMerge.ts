import { IRangeData } from '../../Types/Interfaces';
import { CommandUnit } from '../../Command';
import { IRemoveMergeActionData } from '../Action';
import { Rectangle } from '../../Shared';

export function RemoveMergeApply(unit: CommandUnit, data: IRemoveMergeActionData): IRangeData[] {
    const worksheet = unit.WorkBookUnit!.getSheetBySheetId(data.sheetId);
    if (worksheet) {
        const config = worksheet.getConfig();
        const remove: IRangeData[] = [];
        const mergeConfigData = config.mergeData;
        const mergeRemoveData = data.rectangles;
        for (let j = 0; j < mergeRemoveData.length; j++) {
            for (let i = mergeConfigData.length - 1; i >= 0; i--) {
                const configMerge = mergeConfigData[i];
                const removeMerge = mergeRemoveData[j];
                if (Rectangle.intersects(configMerge, removeMerge)) {
                    remove.push(mergeConfigData.splice(i, 1)[0]);
                }
            }
        }
        return remove;
    }
    return [];
}
