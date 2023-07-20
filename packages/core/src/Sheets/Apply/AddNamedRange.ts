import { INamedRange } from '../../Types/Interfaces';
import { CommandModel } from '../../Command';
import { IAddNamedRangeActionData } from '../../Types/Interfaces/IActionModel';

export function AddNamedRange(namedRanges: INamedRange[], namedRange: INamedRange): void {
    namedRanges.push(namedRange);
}

export function AddNamedRangeApply(unit: CommandModel, data: IAddNamedRangeActionData) {
    const namedRanges = unit.WorkBookUnit?.getConfig().namedRanges;
    namedRanges?.push(data.namedRange);
}
