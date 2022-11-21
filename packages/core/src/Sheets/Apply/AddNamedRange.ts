import { INamedRange } from '../../Interfaces/INamedRange';

export function AddNamedRange(
    namedRanges: INamedRange[],
    namedRange: INamedRange
): void {
    namedRanges.push(namedRange);
}
