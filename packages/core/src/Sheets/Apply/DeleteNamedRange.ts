import { INamedRange } from '../../Types/Interfaces';
import { CommandModel } from '../../Command';
import { IDeleteNamedRangeActionData } from '../../Types/Interfaces/IActionModel';

export function DeleteNamedRange(namedRanges: INamedRange[], namedRangeId: string): INamedRange {
    return namedRanges.find((currentNamedRange: INamedRange, i) => {
        if (currentNamedRange.namedRangeId === namedRangeId) {
            // remove
            namedRanges.splice(i, 1);
            return currentNamedRange;
        }
        return null;
    })!;
}

export function DeleteNamedRangeApply(unit: CommandModel, data: IDeleteNamedRangeActionData) {
    const workbook = unit.WorkBookUnit;
    const namedRanges = workbook?.getConfig().namedRanges;
    return namedRanges?.find((currentNamedRange: INamedRange, i) => {
        if (currentNamedRange.namedRangeId === data.namedRangeId) {
            // remove
            namedRanges.splice(i, 1);
            return currentNamedRange;
        }
        return null;
    })!;
}
