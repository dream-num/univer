import { INamedRange } from '../../Interfaces';
import { CommandUnit } from '../../Command';

export function AddNamedRange(
    namedRanges: INamedRange[],
    namedRange: INamedRange
): void {
    namedRanges.push(namedRange);
}

export function AddNamedRangeApply(unit: CommandUnit, namedRange: INamedRange) {
    const namedRanges = unit.WorkBookUnit?.getConfig().namedRanges;
    namedRanges?.push(namedRange);
}
