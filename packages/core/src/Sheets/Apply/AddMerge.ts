import { Merges } from '../Domain/Merges';
import { IRangeData } from '../../Interfaces';
import { CommandUnit } from '../../Command';

/**
 *
 * @param merges
 * @param rectangles
 * @returns
 *
 * @internal
 */
export function addMerge(merges: Merges, rectangles: IRangeData[]): IRangeData[] {
    let remove: IRangeData[] = [];
    for (let i = 0; i < rectangles.length; i++) {
        merges.add(rectangles[i]);
        // remove = remove.concat(merges.add(rectangles[i]));
    }
    return remove;
}

export function addMergeApply(
    unit: CommandUnit,
    sheetId: string,
    rectangles: IRangeData[]
): IRangeData[] {
    let worksheet = unit?.WorkBookUnit?.getSheetBySheetId(sheetId);
    let removeMerges: IRangeData[] = [];
    if (worksheet) {
        let sheetMerges = worksheet.getMerges();
        for (let i = 0; i < rectangles.length; i++) {
            sheetMerges.add(rectangles[i]);
            removeMerges = removeMerges.concat(sheetMerges.add(rectangles[i]));
        }
    }
    return removeMerges;
}
