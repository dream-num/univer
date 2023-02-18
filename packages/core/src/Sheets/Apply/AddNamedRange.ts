import { INamedRange } from '../../Interfaces';
import { CommandUnit, IAddNamedRangeActionData } from '../../Command';

export function AddNamedRange(
    namedRanges: INamedRange[],
    namedRange: INamedRange
): void {
    namedRanges.push(namedRange);
}

export function AddNamedRangeApply(
    unit: CommandUnit,
    data: IAddNamedRangeActionData
) {
    const namedRanges = unit.WorkBookUnit?.getConfig().namedRanges;
    namedRanges?.push(data.namedRange);
}
