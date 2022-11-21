import { INamedRange } from '../../Interfaces/INamedRange';

export function SetNamedRange(
    namedRanges: INamedRange[],
    namedRange: INamedRange
): INamedRange {
    return namedRanges.find((currentNamedRange: INamedRange, i) => {
        if (currentNamedRange.namedRangeId === namedRange.namedRangeId) {
            // edit
            namedRanges[i] = namedRange;
            return currentNamedRange;
        }
        return null;
    })!;
}
