import { Merges } from '../Domain/Merges';
import { IRangeData } from '../../Interfaces';
import { CommandUnit, IRemoveMergeActionData } from '../../Command';

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
    let merges = worksheet!.getMerges();

    let remove: IRangeData[] = [];
    for (let i = 0; i < data.rectangles.length; i++) {
        remove = remove.concat(merges.remove(data.rectangles[i]));
    }
    return remove;
}
