import { INamedRange } from '../INamedRange';

export function AddNamedRangeService(
    namedRanges: INamedRange[],
    namedRange: INamedRange
): void {
    namedRanges.push(namedRange);
}
