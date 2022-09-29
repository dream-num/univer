import { INamedRange } from '../INamedRange';

export function SetNamedRangeService(
    namedRanges: INamedRange[],
    namedRange: INamedRange
): INamedRange {
    return namedRanges.find((currentNamedRange: INamedRange, i) => {
        if (currentNamedRange.namedRangeId === namedRange.namedRangeId) {
            // edit
            namedRanges[i] = namedRange;
            return currentNamedRange;
        }
    })!;
}
