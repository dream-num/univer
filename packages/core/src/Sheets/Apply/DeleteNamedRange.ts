import { INamedRange } from '../../Interfaces';
import { CommandUnit } from '../../Command';
import { IDeleteNamedRangeActionData } from '../Action';

export function DeleteNamedRange(
    namedRanges: INamedRange[],
    namedRangeId: string
): INamedRange {
    return namedRanges.find((currentNamedRange: INamedRange, i) => {
        if (currentNamedRange.namedRangeId === namedRangeId) {
            // remove
            namedRanges.splice(i, 1);
            return currentNamedRange;
        }
        return null;
    })!;
}

export function DeleteNamedRangeApply(
    unit: CommandUnit,
    data: IDeleteNamedRangeActionData
) {
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
