import { INamedRange } from '../../Interfaces';
import { CommandUnit } from '../../Command';
import { IAddNamedRangeActionData } from '../Action';

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
