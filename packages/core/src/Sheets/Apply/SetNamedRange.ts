import { INamedRange } from '../../Interfaces/INamedRange';
import { CommandUnit, ISetNamedRangeActionData } from '../../Command';

export function SetNamedRange(
    namedRanges: INamedRange[],
    namedRange: INamedRange
): INamedRange {
    return namedRanges.find((currentNamedRange: INamedRange, i) => {
        if (currentNamedRange.namedRangeId === namedRange.namedRangeId) {
            // edit
            namedRanges[i] = namedRange;
            return currentNamedRange;
        }
        return null;
    })!;
}

export function SetNamedRangeApply(
    unit: CommandUnit,
    data: ISetNamedRangeActionData
) {
    const workbook = unit.WorkBookUnit;
    const worksheet = workbook!.getSheetBySheetId(data.sheetId)!;
    const namedRange = data.namedRange;
    const namedRanges = workbook!.getConfig().namedRanges;
    return namedRanges.find((currentNamedRange: INamedRange, i) => {
        if (currentNamedRange.namedRangeId === namedRange.namedRangeId) {
            // edit
            namedRanges[i] = namedRange;
            return currentNamedRange;
        }
        return null;
    })!;
}
