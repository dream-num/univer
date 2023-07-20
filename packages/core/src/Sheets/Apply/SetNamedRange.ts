import { INamedRange } from '../../Types/Interfaces/INamedRange';
import { CommandModel } from '../../Command';
import { ISetNamedRangeActionData } from '../../Types/Interfaces/IActionModel';

export function SetNamedRange(namedRanges: INamedRange[], namedRange: INamedRange): INamedRange {
    return namedRanges.find((currentNamedRange: INamedRange, i) => {
        if (currentNamedRange.namedRangeId === namedRange.namedRangeId) {
            // edit
            namedRanges[i] = namedRange;
            return currentNamedRange;
        }
        return null;
    })!;
}

export function SetNamedRangeApply(unit: CommandModel, data: ISetNamedRangeActionData) {
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
